
import React, { useState, useEffect, useRef } from 'react';
import { LiveServerMessage } from '@google/genai';
import { Mic, X, Volume2, Sparkles, Loader2, StopCircle, Play, Edit3, ShieldCheck, AlertTriangle } from './Icons';
import { Language } from '../types';
import { connectLiveTutor } from '../services/geminiService';

interface VoiceTutorProps {
  lang: Language;
  onClose: () => void;
}

type TutorStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'feeding' | 'learning' | 'error';

const VoiceTutor: React.FC<VoiceTutorProps> = ({ lang, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversation' | 'teach' | 'feed'>('conversation');
  const [status, setStatus] = useState<TutorStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [newWord, setNewWord] = useState({ word: '', pos: 'Emën', meaning: '', example: '' });

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const statusRef = useRef<TutorStatus>('idle');

  const isGeg = lang === 'geg';

  const updateStatus = (newStatus: TutorStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  useEffect(() => { return () => { stopSession(); }; }, []);

  const handleTeachWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word || !isActive || !sessionPromiseRef.current) return;
    updateStatus('learning');
    const instruction = `UDHËZIM LINGUISTIK: Mbaj mend fjalën e re "${newWord.word}" (${newWord.pos}). Kuptimi: "${newWord.meaning}". Shembull: "${newWord.example}".`;
    sessionPromiseRef.current.then(session => { session.sendRealtimeInput({ text: instruction }); });
    setTimeout(() => {
        setNewWord({ word: '', pos: 'Emën', meaning: '', example: '' });
        setActiveTab('conversation');
        updateStatus('listening');
    }, 1000);
  };

  const startSession = async () => {
    if (statusRef.current !== 'idle' && statusRef.current !== 'error') return;
    updateStatus('connecting');
    setErrorMessage(null);
    
    const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    audioContextRef.current = outCtx;
    inputAudioContextRef.current = inCtx;

    try {
      await outCtx.resume(); await inCtx.resume();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const sessionPromise = connectLiveTutor({
        onopen: () => {
          setIsActive(true);
          updateStatus('listening');
          if (inputAudioContextRef.current && mediaStreamRef.current) {
            const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            processor.onaudioprocess = (e) => {
                if (statusRef.current === 'idle') return; 
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                const base64 = encode(new Uint8Array(int16.buffer));
                sessionPromiseRef.current?.then(session => {
                  session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
                });
            };
            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          }
        },
        onmessage: async (msg: LiveServerMessage) => {
          const audioData = msg.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
          if (audioData && audioContextRef.current) {
              updateStatus('speaking');
              const audioBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) updateStatus('listening');
              };
              sourcesRef.current.add(source);
          }
          if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              updateStatus('listening');
          }
        },
        onerror: (e) => {
            setErrorMessage(isGeg ? "Lidhja dështoi." : "Link failed.");
            updateStatus('error');
        },
        onclose: () => stopSession()
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err: any) {
      setErrorMessage(isGeg ? "S'munda me u lidhë." : "Connection error.");
      updateStatus('error');
    }
  };

  const stopSession = async () => {
    if (sessionPromiseRef.current) { sessionPromiseRef.current.then(s => { try { s.close(); } catch (e) {} }); sessionPromiseRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null; }
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (audioContextRef.current) { try { await audioContextRef.current.close(); } catch (e) {} }
    if (inputAudioContextRef.current) { try { await inputAudioContextRef.current.close(); } catch (e) {} }
    audioContextRef.current = null; inputAudioContextRef.current = null;
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear(); nextStartTimeRef.current = 0;
    setIsActive(false); updateStatus('idle');
  };

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[420px] md:h-[680px] z-[200] bg-slate-950 flex flex-col items-center p-8 animate-fade-in md:rounded-[3rem] md:border md:border-white/10 md:shadow-[0_0_80px_-10px_rgba(79,70,229,0.4)]">
      <style>{`
        @keyframes neural-wave {
          0% { height: 10px; opacity: 0.3; }
          50% { height: 60px; opacity: 0.8; }
          100% { height: 10px; opacity: 0.3; }
        }
        .wave-bar { animation: neural-wave 1.2s ease-in-out infinite; }
      `}</style>

      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px] transition-all duration-1000 ${status === 'speaking' ? 'scale-125 opacity-40' : 'scale-100 opacity-20'}`}></div>
      </div>

      <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full z-[210] shadow-xl border border-white/10 transition-colors">
        <X className="w-5 h-5" />
      </button>

      {isActive && (
        <div className="mt-12 md:mt-0 md:absolute md:top-8 md:left-1/2 md:-translate-x-1/2 z-[210] flex gap-1 p-1.5 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl">
            <button onClick={() => setActiveTab('conversation')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'conversation' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Bisedë</button>
            <button onClick={() => setActiveTab('teach')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'teach' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Mësoe</button>
        </div>
      )}

      <div className="relative z-10 w-full text-center flex flex-col items-center flex-grow justify-center mt-6">
        {activeTab === 'conversation' && (
            <>
                <div className="mb-12 animate-fade-in px-4">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 text-[9px] font-black uppercase tracking-[0.3em]">
                        <ShieldCheck className="w-3.5 h-3.5" /> Neural Link Active
                    </div>
                    <h1 className="text-5xl font-serif font-black text-white mb-3 tracking-tight">Konaku i <span className="text-indigo-400">Bacës</span></h1>
                    <p className="text-slate-400 italic font-serif leading-relaxed text-lg opacity-80">
                        {status === 'listening' ? 'Folni, Baca po t\'ndigjon...' : status === 'speaking' ? 'Dëgjo fjalën e plakut.' : 'Mirë se ju pruni Zoti!'}
                    </p>
                </div>

                <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
                    <div className={`absolute inset-0 border-4 border-indigo-500/20 rounded-full ${status === 'listening' ? 'animate-ping' : ''}`}></div>
                    
                    {/* Neural Waveform Visualization */}
                    {status === 'speaking' && (
                        <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                            {[1,2,3,4,5,6,7,8,7,6,5,4,3,2,1].map((n, i) => (
                                <div key={i} className="wave-bar w-1 bg-indigo-400 rounded-full" style={{ animationDelay: `${i * 0.08}s` }}></div>
                            ))}
                        </div>
                    )}

                    <div className={`w-40 h-40 rounded-full bg-indigo-600 shadow-[0_0_80px_-10px_rgba(79,70,229,0.8)] flex items-center justify-center transition-all duration-700 relative z-20 ${status === 'speaking' ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}`}>
                        {status === 'connecting' ? <Loader2 className="w-12 h-12 text-white animate-spin" /> : status === 'speaking' ? <Volume2 className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
                    </div>
                </div>
            </>
        )}

        {status === 'error' && errorMessage && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] animate-fade-in backdrop-blur-xl">
                <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-3" />
                <p className="text-red-400 text-sm font-black uppercase tracking-widest">{errorMessage}</p>
            </div>
        )}

        {activeTab === 'teach' && (
            <div className="w-full max-w-[340px] bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl animate-fade-in-up">
                <form onSubmit={handleTeachWord} className="space-y-4 text-left">
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Fjala e re</label>
                        <input value={newWord.word} onChange={e => setNewWord({...newWord, word: e.target.value})} className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-serif text-lg outline-none focus:border-indigo-500 transition-colors" placeholder="p.sh. Me kênë" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Kuptimi</label>
                        <textarea value={newWord.meaning} onChange={e => setNewWord({...newWord, meaning: e.target.value})} className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white text-xs outline-none min-h-[80px] focus:border-indigo-500 transition-colors" placeholder="Shpjego kuptimin..." required />
                    </div>
                    <button type="submit" disabled={status === 'learning'} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-amber-700 transition-all">
                        {status === 'learning' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Përditëso Arkivën</>}
                    </button>
                </form>
            </div>
        )}

        <div className="w-full mt-10 px-8">
            {!isActive ? (
                <button onClick={startSession} disabled={status === 'connecting'} className="w-full px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black text-xl hover:bg-indigo-50 transition-all shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-4 active:scale-95 group">
                    {status === 'connecting' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />}
                    {status === 'connecting' ? 'Tuj u lidhë...' : 'Hap Konakun'}
                </button>
            ) : (
                <button onClick={stopSession} className="w-full px-10 py-5 bg-red-600 text-white rounded-[2rem] font-black text-xl hover:bg-red-700 transition-all shadow-[0_10px_40px_-10px_rgba(220,38,38,0.3)] active:scale-95">Mbyll Lidhjen</button>
            )}
            <div className="flex items-center justify-center gap-3 text-slate-500 font-bold uppercase text-[9px] tracking-[0.3em] mt-6">
                <div className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-emerald-500 animate-pulse' : status === 'speaking' ? 'bg-indigo-500 ring-4 ring-indigo-500/20' : 'bg-slate-700'}`}></div>
                {status.toUpperCase()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTutor;
