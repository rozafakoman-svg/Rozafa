
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, X, Volume2, Headphones, Sparkles, Loader2, StopCircle, Play, ScrollText, Anchor, Upload, FileText, CheckCircle, RefreshCw, Book, Edit3, Send, ShieldCheck } from './Icons';
import { Language } from '../types';

interface VoiceTutorProps {
  lang: Language;
  onClose: () => void;
}

/**
 * LOCAL LINGUISTIC INSTRUCTIONS FOR BAC
 * These rules ensure absolute precision in Gheg language output.
 */
const GEG_LOCAL_RULES = `
UDHËZIMET E SHENJTA TË GEGËNISHTES (LOCAL RULES):
1. FONETIKA: Përdor VETËM zanoret hundore (â, ê, î, ô, û). Shqiptoji ato me nji randsí të veçantë. Mos përdor 'ë' në fund të fjalëve nëse nuk âsht e domosdoshme.
2. MORFOLOGJIA: Përdor VETËM paskajoren e tipit 'me + folje' (p.sh. me kênë, me shkue, me punue). Kurrë mos përdor 'për të + folje'.
3. LEKSIKU: Prefero fjalët veriore (çikë në vend të vajzë, shpi në vend të shtëpi, nji në vend të një).
4. PERSONA: Ju jeni Bacë, nji malësor i urtë. Jeni i rreptë me gjuhën por i butë me njerëzit. 
5. MOS-RRUETJA (ANTI-RHOTACISM): Ruaj tingullin 'n' aty ku standardi e ka kthye në 'r' (p.sh. vena, jo vera; gina, jo gjëra).
`;

const VoiceTutor: React.FC<VoiceTutorProps> = ({ lang, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversation' | 'teach' | 'feed'>('conversation');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'feeding' | 'learning'>('idle');
  const [heritageMode, setHeritageMode] = useState(true);
  const [feedProgress, setFeedProgress] = useState(0);
  
  // Teaching Form State
  const [newWord, setNewWord] = useState({ word: '', pos: 'Emën', meaning: '', example: '' });

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGeg = lang === 'geg';

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isActive || !sessionPromiseRef.current) return;

    setStatus('feeding');
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
        const rawData = audioBuffer.getChannelData(0);
        
        const chunkSize = 4096;
        for (let i = 0; i < rawData.length; i += chunkSize) {
          const chunk = rawData.slice(i, i + chunkSize);
          const int16 = new Int16Array(chunk.length);
          for (let j = 0; j < chunk.length; j++) {
            int16[j] = Math.max(-1, Math.min(1, chunk[j])) * 32768;
          }
          const base64 = encode(new Uint8Array(int16.buffer));
          sessionPromiseRef.current?.then(session => {
            session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
          });
          setFeedProgress(Math.round((i / rawData.length) * 100));
          await new Promise(r => setTimeout(r, 5));
        }
        setFeedProgress(100);
        setTimeout(() => { setStatus('listening'); setFeedProgress(0); }, 800);
        tempCtx.close();
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setStatus('listening');
    }
  };

  const handleTeachWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word || !isActive || !sessionPromiseRef.current) return;

    setStatus('learning');
    const instruction = `UDHËZIM LINGUISTIK DHE LOKAL: Mbaj mend fjalën e re "${newWord.word}". Kuptimi: "${newWord.meaning}". Shembull: "${newWord.example}". 
    Zbato me rreptësi rregullat e t'folunit qi i kemi vendosë në fillim. Vërtetoqi ma mësove fjalën tuj e shqiptue si nji burrë malcie.`;

    sessionPromiseRef.current.then(session => {
      session.sendRealtimeInput({
         text: instruction
      });
    });

    setTimeout(() => {
        setNewWord({ word: '', pos: 'Emën', meaning: '', example: '' });
        setActiveTab('conversation');
    }, 1000);
  };

  const startSession = async () => {
    if (status !== 'idle') return;
    setStatus('connecting');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    audioContextRef.current = outCtx;
    inputAudioContextRef.current = inCtx;

    await outCtx.resume();
    await inCtx.resume();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('listening');
            if (inputAudioContextRef.current && mediaStreamRef.current) {
              const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
              const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;
              processor.onaudioprocess = (e) => {
                  if (status === 'feeding' || status === 'learning') return; 
                  const inputData = e.inputBuffer.getChannelData(0);
                  const int16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                      int16[i] = inputData[i] * 32768;
                  }
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
            const parts = msg.serverContent?.modelTurn?.parts;
            const audioData = parts?.find(p => p.inlineData && p.inlineData.data)?.inlineData?.data;
            
            if (audioData && audioContextRef.current) {
                setStatus('speaking');
                try {
                    const audioBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000);
                    const source = audioContextRef.current.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContextRef.current.destination);
                    const currentTime = audioContextRef.current.currentTime;
                    if (nextStartTimeRef.current < currentTime) {
                        nextStartTimeRef.current = currentTime;
                    }
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    source.onended = () => {
                        sourcesRef.current.delete(source);
                        if (sourcesRef.current.size === 0) setStatus('listening');
                    };
                    sourcesRef.current.add(source);
                } catch (err) {}
            }
            if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setStatus('listening');
            }
          },
          onerror: (e) => stopSession(),
          onclose: (e) => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: `Ju jeni Bacë, nji plak i urtë dhe rojtar i gjuhës tonë t'vjetër. 
          ${GEG_LOCAL_RULES}
          Filloni çdo bisedë me nji urim malësor si 'Mirë se ju pruni Zoti n'konakun tonë!'. 
          Nëse njeriu flet standardisht, ju me edukatë kthejani në gegënisht.`
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      setStatus('idle');
    }
  };

  const stopSession = async () => {
    if (sessionPromiseRef.current) { sessionPromiseRef.current.then(s => { try { s.close(); } catch (e) {} }); sessionPromiseRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null; }
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') { try { await audioContextRef.current.close(); } catch (e) {} }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') { try { await inputAudioContextRef.current.close(); } catch (e) {} }
    audioContextRef.current = null; inputAudioContextRef.current = null;
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear(); nextStartTimeRef.current = 0;
    setIsActive(false); setStatus('idle');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-12 animate-fade-in overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px] transition-all duration-1000 ${status === 'speaking' ? 'scale-125 opacity-40' : 'scale-100 opacity-20'}`}></div>
      </div>

      <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50 shadow-xl">
        <X className="w-6 h-6" />
      </button>

      {isActive && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <button onClick={() => setActiveTab('conversation')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'conversation' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                {isGeg ? 'Bisedë' : 'Talk'}
            </button>
            <button onClick={() => setActiveTab('teach')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'teach' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                {isGeg ? 'Mësoe Bacën' : 'Teach Bac'}
            </button>
            <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                {isGeg ? 'Arkiva' : 'Archive'}
            </button>
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center">
        {activeTab === 'conversation' && (
            <>
                <div className="mb-10 animate-fade-in">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 text-[9px] font-black uppercase tracking-[0.2em]">
                        <ShieldCheck className="w-3 h-3" /> 
                        {isGeg ? 'Udhëzimet Lokale t\'Aktivizueme' : 'Local Precision Mode Active'}
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-serif font-black text-white mb-4 leading-tight">
                        {isGeg ? 'Konaku i ' : 'The Room of '}<span className="text-indigo-400">Bacës</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md mx-auto italic font-serif leading-relaxed">
                        {status === 'listening' ? (isGeg ? 'Folni lirshëm, Baca asht tui ju ndigjue...' : 'Speak freely, Bac is listening...') : (isGeg ? 'Ndëgjoni fjalën e plakut t\'urtë.' : 'Listen to the wise elder.')}
                    </p>
                </div>

                <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-12 flex items-center justify-center">
                    <div className={`absolute inset-0 border-2 border-indigo-500/30 rounded-full ${status === 'listening' ? 'animate-ping' : ''}`}></div>
                    <div className={`absolute inset-4 border-2 border-indigo-500/10 rounded-full ${status === 'speaking' ? 'animate-pulse' : ''}`}></div>
                    <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-indigo-600 shadow-[0_0_80px_-10px_rgba(79,70,229,0.6)] flex items-center justify-center transition-all duration-500 ${status === 'speaking' ? 'scale-110' : 'scale-100'}`}>
                        {status === 'connecting' ? <Loader2 className="w-12 h-12 text-white animate-spin" /> : status === 'speaking' ? <Volume2 className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
                    </div>
                </div>
            </>
        )}

        {activeTab === 'teach' && (
            <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl animate-fade-in-up">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500">
                        <Edit3 className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-white leading-tight">{isGeg ? 'Mësoe Bacën nji fjalë' : 'Teach Bac a Word'}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Shto në Leksikun Lokal</p>
                    </div>
                </div>

                <form onSubmit={handleTeachWord} className="space-y-4 text-left">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Fjala (Geg)</label>
                            <input 
                                value={newWord.word} 
                                onChange={e => setNewWord({...newWord, word: e.target.value})}
                                className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-serif text-lg outline-none focus:border-amber-500 transition-all"
                                placeholder="p.sh. Me kênë"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Lloji</label>
                            <select 
                                value={newWord.pos}
                                onChange={e => setNewWord({...newWord, pos: e.target.value})}
                                className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white text-sm outline-none focus:border-amber-500"
                            >
                                <option>Emën</option>
                                <option>Folje</option>
                                <option>Mbiemën</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Kuptimi n'Gegënisht</label>
                        <textarea 
                            value={newWord.meaning}
                            onChange={e => setNewWord({...newWord, meaning: e.target.value})}
                            className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white text-sm outline-none focus:border-amber-500 min-h-[80px]"
                            placeholder="Shpjegoni fjalën..."
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={status === 'learning'}
                        className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-lg hover:bg-amber-500 transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                        {status === 'learning' ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-6 h-6" /> Përditëso Bacën</>}
                    </button>
                </form>
            </div>
        )}

        {activeTab === 'feed' && (
            <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl animate-fade-in-up">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500">
                        <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-white leading-tight">{isGeg ? 'Analiza e Arkivës' : 'Archive Analysis'}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Krahasimi me Udhëzimet</p>
                    </div>
                </div>

                {status === 'feeding' && (
                    <div className="mb-8">
                        <div className="flex justify-between text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">
                            <span>Ingesting...</span>
                            <span>{feedProgress}%</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${feedProgress}%` }}></div>
                        </div>
                    </div>
                )}

                <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={status === 'feeding'}
                    className="w-full py-10 border-2 border-dashed border-white/10 rounded-[2rem] text-slate-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex flex-col items-center gap-4"
                >
                    <RefreshCw className={`w-10 h-10 ${status === 'feeding' ? 'animate-spin text-emerald-500' : ''}`} />
                    <span className="font-bold text-sm">{isGeg ? 'Zgjidh rregjistrimin lokal' : 'Select local recording'}</span>
                </button>
            </div>
        )}

        <div className="w-full mt-12 space-y-6">
            {!isActive ? (
                <button onClick={startSession} disabled={status === 'connecting'} className="w-full sm:w-auto px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                    <Play className="w-6 h-6 fill-current" />
                    {isGeg ? 'Hap Konakun' : 'Enter Room'}
                </button>
            ) : (
                activeTab === 'conversation' && (
                    <button onClick={stopSession} className="w-full sm:w-auto px-12 py-5 bg-red-600 text-white rounded-2xl font-black text-xl hover:bg-red-700 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95">
                        <StopCircle className="w-6 h-6" />
                        {isGeg ? 'Mbyll Bisedën' : 'End Session'}
                    </button>
                )
            )}
            
            <div className="flex items-center justify-center gap-4 text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                <div className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-emerald-500 animate-pulse' : status === 'speaking' ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                {status === 'connecting' ? 'Establishing Context...' : status === 'listening' ? 'Bac is listening' : status === 'speaking' ? 'Bac is interpreting' : status === 'learning' ? 'Applying Local Rules' : 'System Ready'}
            </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-600 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
        Neural Geg Lexicon • {isGeg ? 'Udhëzimet Lokale: Aktive' : 'Local Instruction: ACTIVE'}
      </div>
    </div>
  );
};

export default VoiceTutor;
