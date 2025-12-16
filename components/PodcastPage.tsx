import React, { useState, useEffect, useRef } from 'react';
import { PodcastEpisode, UserProfile, PodcastComment, Language } from '../types';
import { PlayCircle, PauseCircle, Headphones, Mic, Share2, Clock, Calendar, PlusCircle, X, Send, MessageCircle, User } from './Icons';

interface PodcastPageProps {
  lang: Language;
  user: UserProfile | null;
}

const INITIAL_EPISODES: PodcastEpisode[] = [
  {
    id: '1',
    title: 'Gjergj Fishta: Homeri i Shqiptarëve',
    description: 'Nji bisedë rreth jetës dhe veprës së poetit kombëtar At Gjergj Fishta. Diskutojmë ndikimin e "Lahutës së Malcís" në identitetin Geg.',
    duration: '24:15',
    date: '24 Tetor 2023',
    topic: 'Literature',
    isLive: true,
    comments: [
      { id: '1', user: 'Arben', content: 'Fantastike! Fishta âsht i pavdekshëm.', timestamp: '10:00' },
      { id: '2', user: 'Teuta', content: 'Zâni i historisë.', timestamp: '12:30' }
    ]
  },
  {
    id: '2',
    title: 'Kanuni: Ligji i Maleve',
    description: 'A është Kanuni thjesht hakmarrje? Zbulojmë kodin e nderit, besës dhe mikpritjes qi mbajti gjallë veriun për shekuj.',
    duration: '32:10',
    date: '10 Nandor 2023',
    topic: 'History',
    comments: []
  },
  {
    id: '3',
    title: 'Dialektet dhe Muzikaliteti',
    description: 'Pse Gegenishtja tingëllon ashtu si tingëllon? Nji analizë e zanoreve hundore dhe paskajores.',
    duration: '18:45',
    date: '05 Dhetor 2023',
    topic: 'Linguistics',
    comments: []
  }
];

const PodcastPage: React.FC<PodcastPageProps> = ({ lang, user }) => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>(INITIAL_EPISODES);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(INITIAL_EPISODES[0]);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Comment State
  const [commentText, setCommentText] = useState('');
  
  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTopic, setNewTopic] = useState('');

  const progressRef = useRef<number>(0);
  const animationRef = useRef<number>(0);

  const canUpload = user && (user.role === 'admin' || user.role === 'moderator');

  // Handle Play/Pause Logic
  const togglePlay = (id: string) => {
    if (playingId === id && isPlaying) {
        setIsPlaying(false);
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
        // Start new or resume
        const ep = episodes.find(e => e.id === id);
        if (ep) {
            setPlayingId(id);
            setCurrentEpisode(ep);
            setIsPlaying(true);
            
            // Start Progress Simulation
            const animate = () => {
                progressRef.current += 0.1; // Slow increment
                if (progressRef.current > 100) progressRef.current = 0;
                setProgress(progressRef.current);
                animationRef.current = requestAnimationFrame(animate);
            };
            animationRef.current = requestAnimationFrame(animate);

            // Audio Simulation
            if ('speechSynthesis' in window) {
               window.speechSynthesis.cancel();
               const utterance = new SpeechSynthesisUtterance(lang === 'geg' ? `Po luani episodin: ${ep.title}` : `Now playing: ${ep.title}`);
               utterance.lang = lang === 'geg' ? 'sq-AL' : 'en-US';
               window.speechSynthesis.speak(utterance);
            }
        }
    }
  };

  useEffect(() => {
    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !currentEpisode) return;

    const newComment: PodcastComment = {
        id: Date.now().toString(),
        user: user.name,
        content: commentText,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    const updatedEpisode = { 
        ...currentEpisode, 
        comments: [newComment, ...currentEpisode.comments] 
    };

    setEpisodes(prev => prev.map(ep => ep.id === currentEpisode.id ? updatedEpisode : ep));
    setCurrentEpisode(updatedEpisode);
    setCommentText('');
  };

  const handleUpload = (e: React.FormEvent) => {
      e.preventDefault();
      const newEp: PodcastEpisode = {
          id: Date.now().toString(),
          title: newTitle,
          description: newDesc,
          topic: newTopic || 'General',
          date: new Date().toLocaleDateString(),
          duration: '00:00', // Placeholder
          comments: []
      };
      setEpisodes([newEp, ...episodes]);
      setIsUploading(false);
      setNewTitle('');
      setNewDesc('');
      setNewTopic('');
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up pb-20 px-4">
       
       {/* Header with Admin Action */}
       <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">
             {lang === 'geg' ? 'Podkaste & Tregime' : 'Podcasts & Stories'}
          </h1>
          {canUpload && (
              <button 
                onClick={() => setIsUploading(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                  <PlusCircle className="w-5 h-5" />
                  {lang === 'geg' ? 'Ngarko Episod' : 'Upload Episode'}
              </button>
          )}
       </div>

       {/* Featured / Active Player Hero */}
       {currentEpisode && (
        <div className="bg-gray-900 dark:bg-black rounded-3xl overflow-hidden shadow-2xl mb-12 flex flex-col md:flex-row relative border border-gray-800">
            {/* Visualizer Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="flex items-end justify-center gap-1 h-full pb-0">
                    {[...Array(40)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-2 bg-indigo-500 rounded-t-full transition-all duration-100 ease-linear"
                            style={{ 
                                height: isPlaying && playingId === currentEpisode.id ? `${Math.random() * 60 + 10}%` : '20%',
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Left: Player Info */}
            <div className="p-8 md:p-12 w-full md:w-7/12 relative z-10 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        {currentEpisode.isLive && (
                            <span className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-full animate-pulse">
                                <div className="w-2 h-2 bg-white rounded-full"></div> LIVE
                            </span>
                        )}
                        <span className="text-indigo-400 font-bold uppercase tracking-wider text-sm">{currentEpisode.topic}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">{currentEpisode.title}</h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">{currentEpisode.description}</p>
                </div>

                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer group">
                        <div 
                            className="h-full bg-indigo-500 relative group-hover:bg-indigo-400 transition-colors"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                        <span>00:00</span>
                        <span>{currentEpisode.duration}</span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => togglePlay(currentEpisode.id)}
                            className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-indigo-900/50"
                        >
                            {isPlaying && playingId === currentEpisode.id ? <PauseCircle className="w-8 h-8" /> : <PlayCircle className="w-8 h-8 ml-1" />}
                        </button>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm">{isPlaying ? (lang === 'geg' ? 'Duke Luajt...' : 'Now Playing...') : (lang === 'geg' ? 'Gati për lojë' : 'Ready to play')}</span>
                            <span className="text-gray-500 text-xs">Host: {user?.name || 'Gegenisht Team'}</span>
                        </div>
                        <button className="ml-auto p-3 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Live Chat / Comments */}
            <div className="w-full md:w-5/12 bg-gray-800/50 border-l border-gray-700/50 flex flex-col relative z-10 backdrop-blur-sm">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-indigo-400" /> 
                        {currentEpisode.isLive ? (lang === 'geg' ? 'Biseda Live' : 'Live Chat') : (lang === 'geg' ? 'Komente' : 'Comments')}
                    </h3>
                    <span className="text-xs text-gray-500">{currentEpisode.comments.length}</span>
                </div>
                
                <div className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[300px] md:max-h-auto">
                    {currentEpisode.comments.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10 italic text-sm">
                            {lang === 'geg' ? 'Bëhuni i pari qi komentoni!' : 'Be the first to comment!'}
                        </div>
                    ) : (
                        currentEpisode.comments.map(c => (
                            <div key={c.id} className="animate-fade-in">
                                <div className="flex items-baseline justify-between mb-1">
                                    <span className="font-bold text-indigo-300 text-sm">{c.user}</span>
                                    <span className="text-[10px] text-gray-500">{c.timestamp}</span>
                                </div>
                                <p className="text-gray-300 text-sm bg-gray-700/50 p-2 rounded-lg rounded-tl-none inline-block">
                                    {c.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-800">
                    <form onSubmit={handleCommentSubmit} className="relative">
                        <input 
                            type="text" 
                            className="w-full bg-gray-900 border border-gray-600 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-indigo-500"
                            placeholder={user ? (lang === 'geg' ? 'Shkruaj nji koment...' : 'Type a comment...') : (lang === 'geg' ? 'Hini për të komentue' : 'Login to comment')}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={!user}
                        />
                        <button 
                            type="submit"
                            disabled={!user || !commentText}
                            className="absolute right-1 top-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:bg-gray-700 transition-colors"
                        >
                            <Send className="w-3 h-3" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
       )}

       {/* Episode List */}
       <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-2">
             {lang === 'geg' ? 'Episodet e Tjera' : 'More Episodes'}
          </h3>
          {episodes.filter(e => e.id !== currentEpisode?.id).map((ep) => (
             <div 
               key={ep.id} 
               onClick={() => { setCurrentEpisode(ep); setPlayingId(null); setIsPlaying(false); }}
               className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex items-center gap-5 group"
             >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 transition-colors">
                    <PlayCircle className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{ep.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{ep.description}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {ep.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {ep.duration}</span>
                </div>
             </div>
          ))}
       </div>

       {/* Upload Modal */}
       {isUploading && (
           <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
               <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
                   <button 
                     onClick={() => setIsUploading(false)} 
                     className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                   >
                       <X className="w-5 h-5 text-gray-500" />
                   </button>
                   
                   <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                       <Mic className="w-6 h-6 text-indigo-600" />
                       {lang === 'geg' ? 'Ngarko Episod të Ri' : 'Upload New Episode'}
                   </h2>
                   
                   <form onSubmit={handleUpload} className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title</label>
                           <input 
                             className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
                             value={newTitle}
                             onChange={e => setNewTitle(e.target.value)}
                             placeholder="Episode Title"
                             required
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Topic</label>
                           <input 
                             className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
                             value={newTopic}
                             onChange={e => setNewTopic(e.target.value)}
                             placeholder="History, Culture, etc."
                             required
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                           <textarea 
                             className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 min-h-[100px] dark:text-white"
                             value={newDesc}
                             onChange={e => setNewDesc(e.target.value)}
                             placeholder="Episode description..."
                             required
                           />
                       </div>
                       
                       <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                           <div className="text-gray-400 mb-2"><PlusCircle className="w-8 h-8 mx-auto" /></div>
                           <span className="text-sm font-bold text-gray-500">Click to upload Audio File (MP3)</span>
                       </div>

                       <button 
                         type="submit" 
                         className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                       >
                           {lang === 'geg' ? 'Publiko Episodin' : 'Publish Episode'}
                       </button>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default PodcastPage;