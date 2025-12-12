import React, { useState } from 'react';
import { PodcastEpisode } from '../types';
import { PlayCircle, PauseCircle, Headphones, Mic, Volume2, Share2, Clock, Calendar } from './Icons';
import { Language } from '../App';

interface PodcastPageProps {
  lang: Language;
}

const MOCK_EPISODES: PodcastEpisode[] = [
  {
    id: '1',
    title: 'Gjergj Fishta: Homeri i Shqiptarëve',
    description: 'Nji bisedë rreth jetës dhe veprës së poetit kombëtar At Gjergj Fishta. Diskutojmë ndikimin e "Lahutës së Malcís" në identitetin Geg.',
    duration: '24:15',
    date: '24 Tetor 2023',
    topic: 'Literature'
  },
  {
    id: '2',
    title: 'Kanuni: Ligji i Maleve',
    description: 'A është Kanuni thjesht hakmarrje? Zbulojmë kodin e nderit, besës dhe mikpritjes që mbajti gjallë veriun për shekuj.',
    duration: '32:10',
    date: '10 Nandor 2023',
    topic: 'History'
  },
  {
    id: '3',
    title: 'Dialektet dhe Muzikaliteti',
    description: 'Pse Gegenishtja tingëllon ashtu si tingëllon? Nji analizë e zanoreve hundore dhe paskajores.',
    duration: '18:45',
    date: '05 Dhetor 2023',
    topic: 'Linguistics'
  }
];

const MOCK_EPISODES_ENG: PodcastEpisode[] = [
  {
    id: '1',
    title: 'Gjergj Fishta: The Albanian Homer',
    description: 'A conversation about the life and work of the national poet Father Gjergj Fishta. Discussing the impact of "The Highland Lute" on Geg identity.',
    duration: '24:15',
    date: 'Oct 24, 2023',
    topic: 'Literature'
  },
  {
    id: '2',
    title: 'The Kanun: Law of the Mountains',
    description: 'Is the Kanun just about vendettas? We explore the code of honor, besa (faith), and hospitality that sustained the North for centuries.',
    duration: '32:10',
    date: 'Nov 10, 2023',
    topic: 'History'
  },
  {
    id: '3',
    title: 'Dialects and Musicality',
    description: 'Why does Geg sound the way it does? An analysis of nasal vowels and the infinitive form.',
    duration: '18:45',
    date: 'Dec 05, 2023',
    topic: 'Linguistics'
  }
];

const PodcastPage: React.FC<PodcastPageProps> = ({ lang }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  const episodes = lang === 'geg' ? MOCK_EPISODES : MOCK_EPISODES_ENG;
  const featuredEpisode = episodes[0];
  
  const handlePlay = (id: string) => {
    if (playingId === id) {
        setPlayingId(null);
    } else {
        setPlayingId(id);
        if ('speechSynthesis' in window) {
           window.speechSynthesis.cancel();
           const ep = episodes.find(e => e.id === id);
           if(ep) {
              const utterance = new SpeechSynthesisUtterance(lang === 'geg' ? `Po luani episodin: ${ep.title}` : `Now playing: ${ep.title}`);
              utterance.lang = lang === 'geg' ? 'sq-AL' : 'en-US';
              window.speechSynthesis.speak(utterance);
           }
        }
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up pb-20">
       
       {/* Hero / Featured Episode */}
       <div className="bg-gray-900 dark:bg-black rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-gray-900 to-black pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
             <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 relative group">
                <Mic className="w-20 h-20 text-white/50 group-hover:text-albanian-red transition-colors duration-500" />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-white border border-white/10">
                   {lang === 'geg' ? 'Episodi i Fundit' : 'Latest Episode'}
                </div>
             </div>
             
             <div className="w-full md:w-2/3 text-center md:text-left">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4 text-sm font-medium text-gray-400 uppercase tracking-wide">
                   <span className="text-albanian-red font-bold">{featuredEpisode.topic}</span>
                   <span>•</span>
                   <span>{featuredEpisode.date}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 leading-tight">
                   {featuredEpisode.title}
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed max-w-xl mx-auto md:mx-0">
                   {featuredEpisode.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                   <button 
                     onClick={() => handlePlay(featuredEpisode.id)}
                     className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold flex items-center gap-3 hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                   >
                      {playingId === featuredEpisode.id ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                      {playingId === featuredEpisode.id ? (lang === 'geg' ? 'Duke Luajt' : 'Playing') : (lang === 'geg' ? 'Luaj Tash' : 'Play Now')}
                   </button>
                   <button className="px-4 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-md">
                      <Share2 className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
       </div>

       {/* Listen On Bar */}
       <div className="flex flex-wrap justify-center gap-6 mb-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-bold text-gray-500 dark:text-gray-400"><Headphones className="w-5 h-5"/> Spotify</div>
          <div className="flex items-center gap-2 font-bold text-gray-500 dark:text-gray-400"><Headphones className="w-5 h-5"/> Apple Podcasts</div>
          <div className="flex items-center gap-2 font-bold text-gray-500 dark:text-gray-400"><Headphones className="w-5 h-5"/> Google Podcasts</div>
       </div>

       {/* Episode List */}
       <div className="space-y-4">
          <div className="flex items-center justify-between mb-6 px-2">
             <h3 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
                {lang === 'geg' ? 'Të Gjitha Episodet' : 'All Episodes'}
             </h3>
             <span className="text-sm font-bold text-gray-400">{episodes.length} Episodes</span>
          </div>

          {episodes.map((ep) => (
             <div 
               key={ep.id} 
               className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border transition-all duration-300 flex flex-col sm:flex-row gap-5 items-center group hover:shadow-lg ${playingId === ep.id ? 'border-albanian-red ring-1 ring-red-100 dark:ring-red-900' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
             >
                <button 
                  onClick={() => handlePlay(ep.id)}
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${playingId === ep.id ? 'bg-albanian-red text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-albanian-red group-hover:text-white'}`}
                >
                   {playingId === ep.id ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                </button>

                <div className="flex-grow text-center sm:text-left min-w-0">
                   <h3 className={`text-lg font-bold font-serif transition-colors truncate ${playingId === ep.id ? 'text-albanian-red' : 'text-gray-900 dark:text-white'}`}>
                      {ep.title}
                   </h3>
                   <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ep.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ep.duration}</span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full uppercase tracking-wider text-[10px]">{ep.topic}</span>
                   </div>
                </div>
                
                {/* Visualizer Mock */}
                <div className="hidden sm:flex items-center gap-1 h-8 w-24 justify-end">
                   {[...Array(8)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 bg-gray-300 dark:bg-gray-600 rounded-full transition-all duration-300 ${playingId === ep.id ? 'bg-albanian-red animate-pulse' : ''}`}
                        style={{ height: playingId === ep.id ? `${Math.random() * 100}%` : '40%', animationDelay: `${i * 0.1}s` }}
                      ></div>
                   ))}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default PodcastPage;