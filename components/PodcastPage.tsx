
import React, { useState, useEffect, useRef } from 'react';
import { PodcastEpisode, UserProfile, PodcastComment, Language } from '../types';
import { 
  PlayCircle, PauseCircle, HeritageMic, Mic, Share2, Clock, Calendar, PlusCircle, 
  X, Send, MessageCircle, User, Activity, Users, Zap, Volume2, ArrowRight, Loader2, Upload
} from './Icons';
import { db, Stores } from '../services/db';

interface PodcastPageProps {
  lang: Language;
  user: UserProfile | null;
}

const INITIAL_EPISODES: PodcastEpisode[] = [
  {
    id: 'ep_1_live',
    title: 'Gjergj Fishta: Homeri i Shqiptarëve',
    description: 'Nji bisedë rreth jetës dhe veprës së poetit kombëtar At Gjergj Fishta. Diskutojmë ndikimin e "Lahutës së Malcís" në identitetin Geg.',
    duration: '24:15',
    date: '24 Tetor 2023',
    topic: 'Literature',
    isLive: true,
    comments: [
      { id: 'c1', user: 'Arben', content: 'Fantastike! Fishta âsht i pavdekshëm.', timestamp: '10:00' },
      { id: 'c2', user: 'Teuta', content: 'Zâni i historisë.', timestamp: '12:30' }
    ],
    host: 'Dr. Gjuhësori'
  },
  {
    id: 'ep_2',
    title: 'Kanuni: Ligji i Maleve',
    description: 'A është Kanuni thjesht hakmarrje? Zbulojmë kodin e nderit, besës dhe mikpritjes qi mbajti gjallë veriun për shekuj.',
    duration: '32:10',
    date: '10 Nandor 2023',
    topic: 'History',
    comments: [],
    host: 'Bacë Gjoni'
  },
  {
    id: 'ep_3',
    title: 'Gjuha dhe Muzikaliteti',
    description: 'Pse Gegenishtja tingëllon ashtu si tingëllon? Nji analizë e zanoreve hundore dhe paskajores.',
    duration: '18:45',
    date: '05 Dhetor 2023',
    topic: 'Linguistics',
    comments: [],
    host: 'Mësuesja e Veriut'
  }
];

const MOCK_LIVE_COMMENTS = [
    "Qoftë lëvdue gjuha jonë!",
    "Mirë se ju gjejmë në këtë bisedë të bukur.",
    "Përshëndetje nga diaspora, na keni mallue me këto fjalë.",
    "A mund të flisni pak për paskajoren?",
    "Gegënishtja asht shpirti i shqipes.",
    "Heu burrë, kjo kênka punë e madhe!",
    "Respekt për punën qi bëni.",
    "Zâni i maleve po ndihet deri këtu.",
    "S'ka ma mirë se me dëgjue të folmen tonë t'vjetër.",
    "Pasha besën, kjo asht edukim i vërtetë."
];

const MOCK_LIVE_USERS = ["Lekë_88", "Mirditorja", "Dardan_K", "Shkodra_Boy", "Geg_Master", "Zana_e_Maleve", "Iliri_Pr", "Arbëria_V"];

const PodcastPage: React.FC<PodcastPageProps> = ({ lang, user }) => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [liveViewers, setLiveViewers] = useState(124);
  const [isLoading, setIsLoading] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTopic, setNewTopic] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const isGeg = lang === 'geg';

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    setIsLoading(true);
    try {
        const stored = await db.getAll<PodcastEpisode>(Stores.DailyData);
        const filtered = stored.filter(i => i.id.startsWith('ep_'));
        if (filtered.length > 0) {
            setEpisodes(filtered);
            setCurrentEpisode(filtered[0]);
        } else {
            setEpisodes(INITIAL_EPISODES);
            setCurrentEpisode(INITIAL_EPISODES[0]);
            for (const ep of INITIAL_EPISODES) {
                await db.put(Stores.DailyData, ep);
            }
        }
    } catch (e) {
        setEpisodes(INITIAL_EPISODES);
        setCurrentEpisode(INITIAL_EPISODES[0]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentEpisode?.isLive) {
      const interval = setInterval(() => {
        const randomMsg = MOCK_LIVE_COMMENTS[Math.floor(Math.random() * MOCK_LIVE_COMMENTS.length)];
        const randomUser = MOCK_LIVE_USERS[Math.floor(Math.random() * MOCK_LIVE_USERS.length)];
        
        const incomingComment: PodcastComment = {
          id: `live_${Date.now()}`,
          user: randomUser,
          content: randomMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setCurrentEpisode(prev => {
            if (!prev) return null;
            return { ...prev, comments: [...prev.comments.slice(-15), incomingComment] };
        });
        
        setLiveViewers(v => v + (Math.random() > 0.5 ? 1 : -1));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentEpisode?.id, currentEpisode?.isLive]);

  // Fix: Contained chat scroll that doesn't trigger a global window scroll
  useEffect(() => {
    if (chatContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = chatContainerRef.current;
        const isNearBottom = scrollHeight - clientHeight - scrollTop < 100;
        
        if (isNearBottom) {
            chatContainerRef.current.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
            });
        }
    }
  }, [currentEpisode?.comments]);

  const togglePlay = (id: string) => {
    if (playingId === id && isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      const ep = episodes.find(e => e.id === id);
      if (ep) {
        setPlayingId(id);
        setCurrentEpisode(ep);
        setIsPlaying(true);
        
        const animate = () => {
          progressRef.current += 0.05;
          if (progressRef.current > 100) progressRef.current = 0;
          setProgress(progressRef.current);
          animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !currentEpisode) return;

    const newComment: PodcastComment = {
      id: Date.now().toString(),
      user: user.name,
      content: commentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedEpisode = { 
      ...currentEpisode, 
      comments: [...currentEpisode.comments, newComment] 
    };

    setEpisodes(prev => prev.map(ep => ep.id === currentEpisode.id ? updatedEpisode : ep));
    setCurrentEpisode(updatedEpisode);
    setCommentText('');
    
    await db.put(Stores.DailyData, updatedEpisode);
  };

  const handleSelectEpisode = (ep: PodcastEpisode) => {
    setCurrentEpisode(ep);
    setPlayingId(null);
    setIsPlaying(false);
    
    // Bug Fix: Only scroll to player if we're far down the page, otherwise don't jump
    if (playerRef.current) {
        const rect = playerRef.current.getBoundingClientRect();
        if (rect.top < 0) {
            playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEp: PodcastEpisode = {
      id: `ep_${Date.now()}`,
      title: newTitle,
      description: newDesc,
      topic: newTopic || 'General',
      date: new Date().toLocaleDateString(),
      duration: '10:00',
      comments: [],
      host: user?.name || 'Admin'
    };
    
    const newList = [newEp, ...episodes];
    setEpisodes(newList);
    await db.put(Stores.DailyData, newEp);
    setIsUploading(false);
    setNewTitle('');
    setNewDesc('');
    setNewTopic('');
  };

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse">
              <Loader2 className="w-12 h-12 text-indigo-50 animate-spin mb-4" />
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">{isGeg ? 'Tuj hulumtue arkivën e zâneve...' : 'Accessing audio archives...'}</p>
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24 px-4">
      <div className="text-center mb-16 px-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-gray-900 rounded-[2.5rem] mb-8 shadow-2xl border border-gray-100 dark:border-gray-800 transform -rotate-3">
             <HeritageMic className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-serif font-black text-gray-900 dark:text-white mb-6 tracking-tight">
             {isGeg ? 'Podkaste & ' : 'Podcasts & '}<span className="text-indigo-600">Tregime</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
              {isGeg 
                ? 'Ndëgjoni zânin e historisë dhe kulturës Gege përmes bisedave dhe tregimeve tona.' 
                : 'Listen to the voice of Geg history and culture through our conversations and stories.'}
          </p>
          
          {user?.role === 'admin' && (
              <button 
                onClick={() => setIsUploading(true)}
                className="mt-10 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl active:scale-95 flex items-center gap-3 mx-auto"
              >
                  <Mic className="w-5 h-5" /> {isGeg ? 'Ngarko nji Episod' : 'Upload New Episode'}
              </button>
          )}
      </div>

      {currentEpisode && (
        <div ref={playerRef} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden mb-16 scroll-mt-24">
          <div className="grid lg:grid-cols-12 min-h-[600px]">
            <div className="lg:col-span-7 p-10 sm:p-16 flex flex-col justify-between bg-gray-50/50 dark:bg-gray-950/20 relative">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Activity className="w-64 h-64 text-indigo-500" />
               </div>

               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                     {currentEpisode.isLive ? (
                        <div className="flex items-center gap-3 bg-red-600 px-5 py-2 rounded-2xl text-white shadow-xl animate-pulse">
                           <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                           <span className="text-[11px] font-black uppercase tracking-[0.2em]">LIVE BROADCAST</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                           <Zap className="w-4 h-4 fill-current" />
                           <span className="text-[11px] font-black uppercase tracking-[0.2em]">{currentEpisode.topic}</span>
                        </div>
                     )}
                     
                     {currentEpisode.isLive && (
                        <div className="flex items-center gap-2 text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                           <Users className="w-4 h-4" />
                           <span className="text-xs font-black">{liveViewers}</span>
                        </div>
                     )}
                  </div>

                  <h2 className="text-4xl sm:text-6xl font-serif font-black text-gray-900 dark:text-white mb-6 leading-tight">
                    {currentEpisode.title}
                  </h2>
                  <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-12 max-w-2xl">
                    {currentEpisode.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-10">
                     <span className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"><User className="w-3.5 h-3.5" /> {currentEpisode.host || 'Redaksia'}</span>
                     <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {currentEpisode.date}</span>
                  </div>
               </div>

               <div className="space-y-8 relative z-10">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
                     <div className="flex items-center gap-8 mb-8">
                        <button 
                           onClick={() => togglePlay(currentEpisode.id)}
                           className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center hover:scale-105 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95"
                        >
                           {isPlaying && playingId === currentEpisode.id ? <PauseCircle className="w-10 h-10" /> : <PlayCircle className="w-10 h-10 ml-1" />}
                        </button>
                        <div className="flex-grow">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{isPlaying ? 'Streaming Content' : 'Ready'}</span>
                              <span className="text-xs font-mono font-bold text-gray-400">{currentEpisode.duration}</span>
                           </div>
                           <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 shadow-inner border border-gray-50 dark:border-gray-700">
                              <div className="h-full bg-indigo-600 rounded-full transition-all duration-300 relative" style={{ width: `${progress}%` }}>
                                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-2xl border-2 border-indigo-600"></div>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center justify-between">
                         <div className="flex gap-2">
                            <button className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-indigo-600 transition-colors border border-gray-100 dark:border-gray-800"><Share2 className="w-5 h-5" /></button>
                            <button className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-indigo-600 transition-colors border border-gray-100 dark:border-gray-800"><Activity className="w-5 h-5" /></button>
                         </div>
                         <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Gegenisht Audio Engine 2.5</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-5 flex flex-col bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800">
               <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 flex items-center justify-between">
                  <h3 className="text-xl font-serif font-black dark:text-white flex items-center gap-3">
                     <MessageCircle className="w-6 h-6 text-indigo-600" />
                     {currentEpisode.isLive ? (isGeg ? 'Biseda Live' : 'Live Chat') : (isGeg ? 'Komente' : 'Comments')}
                  </h3>
                  <div className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">
                     {currentEpisode.comments.length} entries
                  </div>
               </div>

               <div ref={chatContainerRef} className="flex-grow p-8 overflow-y-auto max-h-[500px] lg:max-h-[600px] space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-[0.02]">
                  {currentEpisode.comments.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-center opacity-30 py-20">
                        <MessageCircle className="w-16 h-16 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">{isGeg ? 'Asnji fjalë ende' : 'Silence is golden'}</p>
                     </div>
                  ) : (
                    currentEpisode.comments.map((c, i) => (
                      <div key={c.id} className="animate-fade-in group">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-black shadow-sm">
                               {c.user.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white text-sm">{c.user}</span>
                            <span className="text-[10px] font-bold text-gray-400 ml-auto">{c.timestamp}</span>
                         </div>
                         <div className="pl-11">
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm group-hover:border-indigo-100 transition-colors">
                               {c.content}
                            </p>
                         </div>
                      </div>
                    ))
                  )}
               </div>

               <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
                  {user ? (
                    <form onSubmit={handleCommentSubmit} className="relative group">
                       <input 
                          type="text" 
                          className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-6 pr-16 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 shadow-xl transition-all"
                          placeholder={isGeg ? 'Shkruani nji mendim...' : 'Broadcast your thoughts...'}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                       />
                       <button 
                          type="submit"
                          disabled={!commentText.trim()}
                          className="absolute right-2.5 top-2.5 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 shadow-lg"
                       >
                          <Send className="w-5 h-5" />
                       </button>
                    </form>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 text-center shadow-lg">
                       <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">{isGeg ? 'Hini në llogari për me marrë pjesë në bisedë.' : 'Sign in to join the heritage conversation.'}</p>
                       <button className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:underline">Authentication Required</button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
         <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gray-100 dark:bg-gray-800 flex-grow"></div>
            <h3 className="text-xl font-serif font-black text-gray-900 dark:text-white px-4">
               {isGeg ? 'Arkiva e Episodave' : 'Archive of Episodes'}
            </h3>
            <div className="h-px bg-gray-100 dark:bg-gray-800 flex-grow"></div>
         </div>

         <div className="grid md:grid-cols-2 gap-8">
            {episodes.filter(e => e.id !== currentEpisode?.id).map((ep) => (
               <div 
                 key={ep.id} 
                 onClick={() => handleSelectEpisode(ep)}
                 className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-[80px] -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                  
                  <div className="flex items-center gap-6 mb-8 relative z-10">
                     <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-gray-100 dark:border-gray-700">
                        <PlayCircle className="w-8 h-8" />
                     </div>
                     <div className="flex-grow">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-1 block">{ep.topic}</span>
                        <h4 className="font-serif font-black text-gray-900 dark:text-white text-2xl leading-tight group-hover:text-indigo-600 transition-colors">{ep.title}</h4>
                     </div>
                  </div>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8 line-clamp-3 flex-grow relative z-10 font-medium">
                     {ep.description}
                  </p>

                  <div className="flex items-center justify-between pt-8 border-t border-gray-50 dark:border-gray-800 relative z-10">
                     <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                        <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5"/> {ep.date}</span>
                        <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5"/> {ep.duration}</span>
                     </div>
                     <div className="text-indigo-600 dark:text-indigo-400 font-black text-[9px] uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                        {isGeg ? 'Lexo ma shumë' : 'Details'} <ArrowRight className="w-3.5 h-3.5" />
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {isUploading && (
           <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[500] backdrop-blur-xl animate-fade-in">
               <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 max-w-xl w-full relative shadow-3xl border border-white/10">
                   <button 
                     onClick={() => setIsUploading(false)} 
                     className="absolute top-8 right-8 p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                   >
                       <X className="w-6 h-6 text-gray-500" />
                   </button>
                   
                   <div className="flex flex-col items-center text-center mb-10">
                      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border border-indigo-100 dark:border-indigo-800">
                         <Mic className="w-10 h-10 text-indigo-600" />
                      </div>
                      <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-white leading-tight">
                          {isGeg ? 'Ngarko Episod të Ri' : 'Publish New Episode'}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Broadcast the Geg voice to the world.</p>
                   </div>
                   
                   <form onSubmit={handleUpload} className="space-y-6">
                       <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Episode Title</label>
                           <input 
                             className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-indigo-500 dark:text-white font-serif font-bold text-lg"
                             value={newTitle}
                             onChange={e => setNewTitle(e.target.value)}
                             placeholder="e.g. The Roots of Besa"
                             required
                           />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Topic</label>
                              <input 
                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-indigo-500 dark:text-white"
                                value={newTopic}
                                onChange={e => setNewTopic(e.target.value)}
                                placeholder="History"
                                required
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Duration</label>
                              <input 
                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-indigo-500 dark:text-white"
                                placeholder="32:00"
                                required
                              />
                          </div>
                       </div>
                       <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description</label>
                           <textarea 
                             className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-indigo-500 min-h-[120px] dark:text-white text-sm"
                             value={newDesc}
                             onChange={e => setNewDesc(e.target.value)}
                             placeholder="Provide a deep context for this episode..."
                             required
                           />
                       </div>
                       
                       <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-3xl p-8 text-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                           <div className="text-indigo-400 group-hover:scale-110 transition-transform mb-3"><Upload className="w-10 h-10 mx-auto" /></div>
                           <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Select Audio Source (MP3/WAV)</span>
                       </div>

                       <button 
                         type="submit" 
                         className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3"
                       >
                           {isGeg ? 'Publiko nji herë' : 'Initiate Broadcast'} <Send className="w-5 h-5" />
                       </button>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default PodcastPage;
