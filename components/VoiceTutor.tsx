
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, X, Volume2, Headphones, Sparkles, Loader2, StopCircle, Play, ScrollText, Anchor, Upload, FileText, CheckCircle, RefreshCw, Book, Edit3, Send, ShieldCheck, AlertTriangle } from './Icons';
import { Language } from '../types';

interface VoiceTutorProps {
  lang: Language;
  onClose: () => void;
}

type TutorStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'feeding' | 'learning' | 'error';

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
  const [status, setStatus] = useState<TutorStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedProgress, setFeedProgress] = useState(0);
  
  const [newWord, setNewWord] = useState({ word: '', pos: 'Emën', meaning: '', example: '' });

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<TutorStatus>('idle');

  const isGeg = lang === 'geg';

  const updateStatus = (newStatus: TutorStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  };

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

    updateStatus('feeding');
    try {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
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
        setTimeout(() => { updateStatus('listening'); setFeedProgress(0); }, 800);
        tempCtx.close();
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      updateStatus('listening');
    }
  };

  const handleTeachWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word || !isActive || !sessionPromiseRef.current) return;

    updateStatus('learning');
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
        updateStatus('listening');
    }, 1000);
  };

  const startSession = async () => {
    if (statusRef.current !== 'idle' && statusRef.current !== 'error') return;
    updateStatus('connecting');
    setErrorMessage(null);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    audioContextRef.current = outCtx;
    inputAudioContextRef.current = inCtx;

    try {
      await outCtx.resume();
      await inCtx.resume();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            updateStatus('listening');
            if (inputAudioContextRef.current && mediaStreamRef.current) {
              const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
              const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;
              processor.onaudioprocess = (e: AudioProcessingEvent) => {
                  if (statusRef.current === 'feeding' || statusRef.current === 'learning' || statusRef.current === 'idle') return; 
                  
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
                updateStatus('speaking');
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
                        if (sourcesRef.current.size === 0 && statusRef.current === 'speaking') {
                            updateStatus('listening');
                        }
                    };
                    sourcesRef.current.add(source);
                } catch (err) {}
            }
            if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                updateStatus('listening');
            }
          },
          onerror: (e) => {
              console.error("Live AI Error:", e);
              const msg = e.toString();
              if (msg.includes('403') || msg.includes('API_KEY_INVALID')) {
                 setErrorMessage(isGeg ? "Celësi i Inteligjencës nuk asht valid." : "Invalid API Key detected.");
              } else {
                 setErrorMessage(isGeg ? "Lidhja me Inteligjencën dështoi." : "Failed to establish AI link.");
              }
              updateStatus('error');
          },
          onclose: () => stopSession()
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
    } catch (err: any) {
      console.error("Session start error:", err);
      setErrorMessage(err.message || (isGeg ? "S'munda me hapë lidhjen." : "Could not open connection."));
      updateStatus('error');
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
    setIsActive(false); 
    updateStatus('idle');
  };

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[400px] md:h-[650px] md:max-h-[85vh] z-[200] bg-slate-950 flex flex-col items-center justify-start md:justify-center p-4 md:p-6 animate-fade-in overflow-hidden md:rounded-[2.5rem] md:border md:border-white/10 md:shadow-2xl">
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-indigo-600 rounded-full blur-[80px] md:blur-[120px] transition-all duration-1000 ${status === 'speaking' ? 'scale-125 opacity-40' : 'scale-100 opacity-20'}`}></div>
      </div>

      <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[210] shadow-xl">
        <X className="w-5 h-5" />
      </button>

      {isActive && (
        <div className="mt-12 md:mt-0 md:absolute md:top-6 md:left-1/2 md:-translate-x-1/2 z-[210] flex gap-1 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl scale-90 md:scale-100">
            <button onClick={() => setActiveTab('conversation')} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'conversation' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                {isGeg ? 'Bisedë' : 'Talk'}
            </button>
            <button onClick={() => setActiveTab('teach')} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'teach' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                {isGeg ? 'Mësoe' : 'Teach'}
            </button>
            <button onClick={() => setActiveTab('feed')} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                {isGeg ? 'Arkiva' : 'Files'}
            </button>
        </div>
      )}

      <div className="relative z-10 w-full text-center flex flex-col items-center flex-grow justify-center mt-4">
        {activeTab === 'conversation' && (
            <>
                <div className="mb-6 md:mb-10 animate-fade-in px-4">
                    <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 text-[8px] font-black uppercase tracking-[0.2em]">
                        <ShieldCheck className="w-3 h-3" /> 
                        {isGeg ? 'Udhëzime Aktive' : 'Rules Active'}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-black text-white mb-2 leading-tight">
                        {isGeg ? 'Konaku i ' : 'The Room of '}<span className="text-indigo-400">Bacës</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base max-w-xs mx-auto italic font-serif leading-relaxed">
                        {status === 'listening' ? (isGeg ? 'Folni, Baca po t\'ndigjon...' : 'Speak, Bac is listening...') : status === 'speaking' ? (isGeg ? 'Dëgjo fjalën e plakut.' : 'Listen to the elder.') : (isGeg ? 'Mirë se ju pruni Zoti!' : 'Welcome to the heritage room!')}
                    </p>
                </div>

                <div className="relative w-40 h-40 md:w-56 md:h-56 mb-8 flex items-center justify-center">
                    <div className={`absolute inset-0 border-2 border-indigo-500/30 rounded-full ${status === 'listening' ? 'animate-ping' : ''}`}></div>
                    <div className={`absolute inset-4 border-2 border-indigo-500/10 rounded-full ${status === 'speaking' ? 'animate-pulse' : ''}`}></div>
                    <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full bg-indigo-600 shadow-[0_0_60px_-10px_rgba(79,70,229,0.6)] flex items-center justify-center transition-all duration-500 ${status === 'speaking' ? 'scale-110' : 'scale-100'}`}>
                        {status === 'connecting' ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : status === 'speaking' ? <Volume2 className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
                    </div>
                </div>
            </>
        )}

        {status === 'error' && errorMessage && (
            <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-in max-w-[280px]">
                <div className="flex items-center gap-3 text-red-500 mb-2 justify-center">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-black uppercase text-[10px] tracking-widest">{isGeg ? 'GABIM' : 'ERROR'}</span>
                </div>
                <p className="text-red-400 text-xs font-medium">{errorMessage}</p>
                <button onClick={() => updateStatus('idle')} className="mt-3 text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors underline tracking-widest">Retry Connection</button>
            </div>
        )}

        {activeTab === 'teach' && (
            <div className="w-full max-w-[320px] bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-2xl animate-fade-in-up">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
                        <Edit3 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-base font-bold text-white leading-tight">{isGeg ? 'Mësoe fjalën' : 'Teach a word'}</h3>
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Local Lexicon Add</p>
                    </div>
                </div>

                <form onSubmit={handleTeachWord} className="space-y-3 text-left">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                            <label className="text-[8px] font-black uppercase text-slate-500 mb-1 block tracking-widest">Fjala</label>
                            <input 
                                value={newWord.word} 
                                onChange={e => setNewWord({...newWord, word: e.target.value})}
                                className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-white font-serif text-sm outline-none focus:border-amber-500 transition-all"
                                placeholder="Me kênë"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[8px] font-black uppercase text-slate-500 mb-1 block tracking-widest">Lloji</label>
                            <select 
                                value={newWord.pos}
                                onChange={e => setNewWord({...newWord, pos: e.target.value})}
                                className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-white text-[10px] outline-none focus:border-amber-500"
                            >
                                <option>Emën</option>
                                <option>Folje</option>
                                <option>Mbiemën</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[8px] font-black uppercase text-slate-500 mb-1 block tracking-widest">Kuptimi</label>
                        <textarea 
                            value={newWord.meaning}
                            onChange={e => setNewWord({...newWord, meaning: e.target.value})}
                            className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-white text-[10px] outline-none focus:border-amber-500 min-h-[60px]"
                            placeholder="Shpjegoni fjalën..."
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={status === 'learning'}
                        className="w-full py-3 bg-amber-600 text-white rounded-xl font-black text-xs hover:bg-amber-500 transition-all flex items-center justify-center gap-2 shadow-xl"
                    >
                        {status === 'learning' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Përditëso</>}
                    </button>
                </form>
            </div>
        )}

        <div className="w-full mt-6 space-y-4 px-6">
            {!isActive ? (
                <button onClick={startSession} disabled={status === 'connecting'} className="w-full px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                    {status === 'connecting' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                    {status === 'connecting' ? (isGeg ? 'Tuj u lidhë...' : 'Connecting...') : (isGeg ? 'Hap Konakun' : 'Enter Room')}
                </button>
            ) : (
                activeTab === 'conversation' && (
                    <button onClick={stopSession} className="w-full px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95">
                        <StopCircle className="w-5 h-5" />
                        {isGeg ? 'Mbyll' : 'End'}
                    </button>
                )
            )}
            
            <div className="flex items-center justify-center gap-3 text-slate-500 font-bold uppercase text-[8px] tracking-[0.2em]">
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'listening' ? 'bg-emerald-500 animate-pulse' : status === 'speaking' ? 'bg-indigo-500' : status === 'error' ? 'bg-red-500' : 'bg-slate-700'}`}></div>
                {status === 'connecting' ? 'Connecting AI...' : status === 'listening' ? 'Bac is listening' : status === 'speaking' ? 'Bac is speaking' : status === 'learning' ? 'Applying Rules' : status === 'error' ? 'Failed' : 'System Ready'}
            </div>
        </div>
      </div>

      <div className="mt-auto pb-8 text-slate-600 text-[8px] font-black uppercase tracking-widest whitespace-nowrap opacity-60">
        Neural Geg Lexicon • {isGeg ? 'Udhëzimet: Aktive' : 'Rules: ACTIVE'}
      </div>
    </div>
  );
};

export default VoiceTutor;
