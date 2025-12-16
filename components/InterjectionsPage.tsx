
import React, { useState } from 'react';
import { InterjectionEntry, Language } from '../types';
import { MessageCircle, Globe, BookOpen, Star, Info, Filter, ArrowRight } from './Icons';

interface InterjectionsPageProps {
  lang: Language;
}

const INTERJECTIONS_DATA: InterjectionEntry[] = [
  // TURKISH ORIGIN
  {
    word: "Aman",
    origin: "Turkish",
    meaning: "Mercy, Please, Oh God",
    usage: "Used to express distress, pleading, or exhaustion.",
    example: "Aman o zot, sa jam lodhë!",
    tags: ["Expressive", "Common"]
  },
  {
    word: "Medet",
    origin: "Turkish",
    meaning: "Help, Woe, Alas",
    usage: "An archaic cry for help, now mostly used to express pity or regret.",
    example: "Medet për ata qi s'kanë strehë.",
    tags: ["Archaic", "Emotional"]
  },
  {
    word: "Hajde",
    origin: "Turkish",
    meaning: "Come on, Let's go",
    usage: "Extremely common encourager or command to move/start.",
    example: "Hajde, se po na ikën autobusi.",
    tags: ["Daily Use", "Action"]
  },
  {
    word: "Vallahi",
    origin: "Turkish",
    meaning: "By God / I swear",
    usage: "Used to emphasize truthfulness (Arabic origin via Turkish).",
    example: "Vallahi, nuk e kam pa gja.",
    tags: ["Religious", "Emphasis"]
  },
  {
    word: "Boll",
    origin: "Turkish",
    meaning: "Enough, Plenty",
    usage: "Used to stop an action or describe abundance.",
    example: "Boll ma me fjalë!",
    tags: ["Command", "Daily Use"]
  },
  {
    word: "Yrysh",
    origin: "Turkish",
    meaning: "Attack, Rush, Charge",
    usage: "Used historically for military charges, now for rushing into something.",
    example: "Bânu yrysh punës!",
    tags: ["Archaic", "Action"]
  },
  {
    word: "Gajret",
    origin: "Turkish",
    meaning: "Patience, Courage, Perseverance",
    usage: "Used to console someone in difficulty.",
    example: "Bani gajret, se do bëhet mirë.",
    tags: ["Consolation", "Emotional"]
  },
  {
    word: "Fakira",
    origin: "Turkish",
    meaning: "Poor fellow",
    usage: "Often used for pity (Arabic 'Fakir' via Turkish).",
    example: "Gjynah fakiri, s'ka pas fat.",
    tags: ["Pity", "Common"]
  },

  // SLAVIC ORIGIN
  {
    word: "Gjobë",
    origin: "Slavic",
    meaning: "Fine, Penalty",
    usage: "A fine imposed for breaking the law or Kanun rules (from Slavic 'globa').",
    example: "I vunë gjobë të randë.",
    tags: ["Legal", "Kanun"]
  },
  {
    word: "Megjë",
    origin: "Slavic",
    meaning: "Boundary, Border Stone",
    usage: "The marking line between land properties (from Slavic 'međa'). Highly significant in Kanun.",
    example: "Mos e luj megjën e kojshisë.",
    tags: ["Land", "Kanun"]
  },
  {
    word: "Stan",
    origin: "Slavic",
    meaning: "Dairy Hut, Shepherd's Camp",
    usage: "The summer dwelling for shepherds in the mountains (from Slavic 'stan').",
    example: "Verën e kalojmë n'stan.",
    tags: ["Pastoral", "Mountain"]
  },
  {
    word: "Rob",
    origin: "Slavic",
    meaning: "Person, Soul (orig. Slave)",
    usage: "Originally 'slave', now used affectionately for 'person' or 'family member' in Geg (from Slavic 'rob').",
    example: "O rob i zotit, ndiju!",
    tags: ["Daily Use", "Family"]
  },
  {
    word: "Kosh",
    origin: "Slavic",
    meaning: "Basket",
    usage: "Woven container used for carrying crops or objects (from Slavic 'koš').",
    example: "Mbushi koshin me rrush.",
    tags: ["Household", "Agriculture"]
  },

  // LATIN / ITALIAN ORIGIN (The 3rd Main Influence)
  {
    word: "Dreq",
    origin: "Latin/Italian",
    meaning: "Devil (Damn it)",
    usage: "Mild curse word, very common in Geg (from Latin 'Draco').",
    example: "Ik or dreq prej këtu!",
    tags: ["Curse", "Common"]
  },
  {
    word: "Forca",
    origin: "Latin/Italian",
    meaning: "Strength, Come on!",
    usage: "Encouragement (from Italian 'Forza').",
    example: "Forca, mos u dorëzo!",
    tags: ["Encouragement"]
  },
  {
    word: "Mik",
    origin: "Latin/Italian",
    meaning: "Friend, Guest",
    usage: "A fundamental concept in Albanian culture, derived from Latin 'Amicus'.",
    example: "Miku i shtëpisë.",
    tags: ["Culture", "Common"]
  },
  {
    word: "Qytet",
    origin: "Latin/Italian",
    meaning: "City, Town",
    usage: "From Latin 'Civitas'.",
    example: "Shkoj në qytet.",
    tags: ["Place", "Noun"]
  }
];

const InterjectionsPage: React.FC<InterjectionsPageProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'Turkish' | 'Slavic' | 'Latin/Italian'>('Turkish');
  
  const isGeg = lang === 'geg';

  const filteredData = INTERJECTIONS_DATA.filter(item => item.origin === activeTab);

  const getOriginStyles = (origin: string) => {
    switch(origin) {
      case 'Turkish': return {
        pill: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        accent: 'text-red-600 dark:text-red-400',
        borderLeft: 'border-l-red-400 dark:border-l-red-500',
        icon: <Star className="w-4 h-4" />
      };
      case 'Slavic': return {
        pill: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        accent: 'text-blue-600 dark:text-blue-400',
        borderLeft: 'border-l-blue-400 dark:border-l-blue-500',
        icon: <Globe className="w-4 h-4" />
      };
      case 'Latin/Italian': return {
        pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
        accent: 'text-emerald-600 dark:text-emerald-400',
        borderLeft: 'border-l-emerald-400 dark:border-l-emerald-500',
        icon: <BookOpen className="w-4 h-4" />
      };
      default: return {
        pill: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        accent: 'text-gray-600 dark:text-gray-400',
        borderLeft: 'border-l-gray-400',
        icon: <Info className="w-4 h-4" />
      };
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up pb-20">
       {/* Hero Section */}
       <div className="text-center mb-16 px-4">
         <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-6 transform hover:scale-110 transition-transform duration-300 border-4 border-amber-100 dark:border-amber-800 shadow-lg">
             <MessageCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
         </div>
         <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6">
            {isGeg ? 'Huazime & Pasthirrma' : 'Interjections & Loanwords'}
         </h1>
         <p className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
             {isGeg 
               ? 'Nji udhëtim nëpër shtresat historike të gjuhës sonë. Zbuloni fjalët qi na lanë perandoritë dhe fqinjët.' 
               : 'A journey through the historical layers of our language. Discover words left behind by empires and neighbors.'}
         </p>
       </div>

       {/* Tabs Navigation */}
       <div className="sticky top-16 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md py-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
         <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {['Turkish', 'Slavic', 'Latin/Italian'].map((origin) => {
               const styles = getOriginStyles(origin);
               const isActive = activeTab === origin;
               return (
                  <button
                      key={origin}
                      onClick={() => setActiveTab(origin as any)}
                      className={`px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center gap-2 border-2 ${
                        isActive 
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-xl scale-105' 
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                      <span className={isActive ? 'text-white dark:text-gray-900' : styles.accent}>{styles.icon}</span>
                      {origin === 'Turkish' ? (isGeg ? 'Osmane / Turke' : 'Ottoman / Turkish') : 
                      origin === 'Slavic' ? (isGeg ? 'Sllave' : 'Slavic') : 
                      (isGeg ? 'Latine / Italiane' : 'Latin / Italian')}
                  </button>
               );
            })}
         </div>
       </div>

       {/* Content Grid */}
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {filteredData.map((item, idx) => {
             const styles = getOriginStyles(item.origin);
             return (
               <div 
                 key={idx} 
                 className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
               >
                  <div className="flex items-start justify-between mb-6">
                     <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles.pill}`}>
                        {item.origin}
                     </div>
                     <div className="text-gray-300 dark:text-gray-600 group-hover:text-amber-500 transition-colors">
                        <Star className="w-5 h-5" />
                     </div>
                  </div>

                  <h3 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                     {item.word}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium italic mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    "{item.meaning}"
                  </p>

                  <div className="space-y-5 flex-grow">
                     <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                           <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1 text-xs uppercase tracking-wide opacity-70">{isGeg ? 'Përdorimi' : 'Usage'}</span>
                           {item.usage}
                        </p>
                     </div>

                     <div className={`pl-4 border-l-4 ${styles.borderLeft} py-1`}>
                        <p className="text-lg font-serif text-gray-800 dark:text-gray-200 italic">
                           "{item.example}"
                        </p>
                     </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
                     {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                          #{tag}
                        </span>
                     ))}
                  </div>
               </div>
             );
          })}
       </div>

       {/* Context Note */}
       <div className="mt-16 mx-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl p-8 flex flex-col sm:flex-row items-start gap-6">
          <div className="bg-white dark:bg-indigo-800 p-4 rounded-full shadow-sm text-indigo-600 dark:text-indigo-300 flex-shrink-0">
             <Info className="w-8 h-8" />
          </div>
          <div>
             <h4 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-3">
                {isGeg ? 'Pse ka kaq shumë huazime?' : 'Why so many loanwords?'}
             </h4>
             <p className="text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed text-lg">
                {isGeg 
                  ? 'Pozicioni gjeografik i trojeve shqiptare dhe pushtimet e gjata (Romake, Sllave, Osmane) kanë lanë gjurmë të pashlyeshme në fjalor. Ndërsa struktura gramatikore mbeti shqipe, leksiku u pasunue me fjalë për tregti, fe, dhe administratë.'
                  : 'The geographical position of Albanian lands and long occupations (Roman, Slavic, Ottoman) left indelible marks on the vocabulary. While the grammatical structure remained Albanian, the lexicon was enriched with words for trade, religion, and administration.'}
             </p>
          </div>
       </div>
    </div>
  );
};

export default InterjectionsPage;
