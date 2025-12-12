import React, { useState } from 'react';
import DailyQuiz from './DailyQuiz';
import CrosswordGame from './CrosswordGame';
import AlphabetGame from './AlphabetGame';
import BubblePopGame from './BubblePopGame';
import { GraduationCap, Grid3X3, Type, ArrowLeft, Circle, Gamepad2, PlayCircle, Star, Sparkles, Trophy } from './Icons';

type GameType = 'quiz' | 'crossword' | 'alphabet' | 'bubblepop' | null;

interface GamesDashboardProps {
  isEditing?: boolean;
  lang: 'geg' | 'eng';
}

const translations = {
  eng: {
    back: "Back to Games",
    featured: "Featured Today",
    quiz_title: "Daily Quiz",
    quiz_desc: "Challenge your knowledge of Geg vocabulary and grammar.",
    play: "Play Now",
    cw_title: "Fjalëkryq",
    cw_desc: "Solve crossword puzzles based on Albanian culture.",
    start_cw: "Start Puzzle",
    alpha_title: "Abetare Adventure",
    alpha_desc: "Interactive alphabet learning for kids and beginners.",
    learn: "Learn",
    pop_title: "Bubble Pop",
    pop_desc: "Pop bubbles to learn letters in a fast-paced arcade game.",
    start_pop: "Play"
  },
  geg: {
    back: "Kthehu te Lojnat",
    featured: "E Përzgjedhuna e Ditës",
    quiz_title: "Kuiz Ditor",
    quiz_desc: "Sfidoni veten në fjalor dhe gramatikë Gege.",
    play: "Luaj Tash",
    cw_title: "Fjalëkryq",
    cw_desc: "Zgjidhni fjalëkryqe me tema kulturore.",
    start_cw: "Fillo",
    alpha_title: "Aventura e Abetares",
    alpha_desc: "Mësim ndërveprues i shkronjave për fëmijë.",
    learn: "Mëso",
    pop_title: "Plas Flluska",
    pop_desc: "Plasni flluska për me mësue shkronjat shpejt.",
    start_pop: "Luaj"
  }
};

const GamesDashboard: React.FC<GamesDashboardProps> = ({ isEditing, lang }) => {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const t = translations[lang];

  if (activeGame === 'quiz') {
    return (
      <div className="h-[600px] animate-fade-in">
        <button 
          onClick={() => setActiveGame(null)}
          className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-bold group"
        >
          <div className="p-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-gray-400 transition-colors">
             <ArrowLeft className="w-4 h-4" />
          </div>
          {t.back}
        </button>
        <DailyQuiz isEditing={isEditing} />
      </div>
    );
  }

  if (activeGame === 'crossword') {
    return (
      <div className="h-[700px] animate-fade-in">
        <button 
          onClick={() => setActiveGame(null)}
          className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-bold group"
        >
          <div className="p-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-gray-400 transition-colors">
             <ArrowLeft className="w-4 h-4" />
          </div>
          {t.back}
        </button>
        <CrosswordGame />
      </div>
    );
  }

  if (activeGame === 'alphabet') {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => setActiveGame(null)}
          className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-bold group"
        >
          <div className="p-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-gray-400 transition-colors">
             <ArrowLeft className="w-4 h-4" />
          </div>
          {t.back}
        </button>
        <AlphabetGame />
      </div>
    );
  }

  if (activeGame === 'bubblepop') {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => setActiveGame(null)}
          className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-bold group"
        >
          <div className="p-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-gray-400 transition-colors">
             <ArrowLeft className="w-4 h-4" />
          </div>
          {t.back}
        </button>
        <BubblePopGame lang={lang} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
      
      {/* Featured / Daily Quiz - Large Card */}
      <div 
        onClick={() => setActiveGame('quiz')}
        className="col-span-1 md:col-span-2 lg:col-span-2 group relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer overflow-hidden border border-indigo-500/50"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
             <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                   <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" /> {t.featured}
                </span>
                <h3 className="text-3xl md:text-4xl font-black mb-2">{t.quiz_title}</h3>
                <p className="text-indigo-100 text-lg max-w-md leading-relaxed">{t.quiz_desc}</p>
             </div>
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                <GraduationCap className="w-8 h-8 text-white" />
             </div>
          </div>
          
          <div className="mt-8 flex items-center gap-3">
             <button className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2">
                <PlayCircle className="w-5 h-5" /> {t.play}
             </button>
             <span className="text-sm font-medium text-indigo-200 px-3 py-1">5 min</span>
          </div>
        </div>
      </div>

      {/* Crossword Card */}
      <div 
        onClick={() => setActiveGame('crossword')}
        className="group bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-[80px] -mr-0 -mt-0 transition-transform group-hover:scale-110"></div>
        
        <div className="relative z-10">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800">
            <Grid3X3 className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.cw_title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 min-h-[40px]">{t.cw_desc}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
           <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2 group-hover:underline">
             {t.start_cw} <ArrowLeft className="w-3 h-3 rotate-180" />
           </span>
        </div>
      </div>

      {/* Alphabet Card */}
      <div 
        onClick={() => setActiveGame('alphabet')}
        className="group bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 dark:bg-pink-900/20 rounded-bl-[80px] -mr-0 -mt-0 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 rounded-2xl flex items-center justify-center mb-4 border border-pink-200 dark:border-pink-800">
            <Type className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.alpha_title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 min-h-[40px]">{t.alpha_desc}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
           <span className="text-pink-600 dark:text-pink-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2 group-hover:underline">
             {t.learn} <ArrowLeft className="w-3 h-3 rotate-180" />
           </span>
        </div>
      </div>

      {/* Bubble Pop Card */}
      <div 
        onClick={() => setActiveGame('bubblepop')}
        className="group bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 dark:bg-cyan-900/20 rounded-bl-[80px] -mr-0 -mt-0 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-4 border border-cyan-200 dark:border-cyan-800">
            <Circle className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.pop_title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 min-h-[40px]">{t.pop_desc}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
           <span className="text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2 group-hover:underline">
             {t.start_pop} <ArrowLeft className="w-3 h-3 rotate-180" />
           </span>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="group bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 border-dashed relative flex flex-col justify-center items-center text-center h-full opacity-70 hover:opacity-100 transition-opacity">
         <div className="mb-3 text-gray-400 dark:text-gray-500">
            <Gamepad2 className="w-10 h-10 mx-auto" />
         </div>
         <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">{lang === 'geg' ? 'Lojëra t\'reja shpejt...' : 'More Games Coming Soon'}</h3>
      </div>

    </div>
  );
};

export default GamesDashboard;