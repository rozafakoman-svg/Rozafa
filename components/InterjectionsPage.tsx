
import React, { useState } from 'react';
import { InterjectionEntry, Language } from '../types';
import { MessageCircle, Globe, BookOpen, Star, Info, Filter, ArrowRight, Sparkles, Zap, Flame, Target, Anchor, Shield, Heart } from './Icons';

interface InterjectionsPageProps {
  lang: Language;
}

const INTERJECTIONS_DATA: InterjectionEntry[] = [
  // NATIVE GEG
  {
    word: "Heu",
    origin: "Native Geg",
    meaning: "Expression of surprise, wonder, or pride",
    usage: "Used to mark an impressive event or a strong feeling of masculine pride.",
    example: "Heu burrë, kjo kênka punë e madhe!",
    tags: ["Surprise", "Pride"]
  },
  {
    word: "Kuku",
    origin: "Native Geg",
    meaning: "Woe / Oh no / Distress",
    usage: "Extremely common in Geg to express shock, sympathy, or negative surprise.",
    example: "Kuku për mu, çka m'pau syri!",
    tags: ["Distress", "Shock"]
  },
  {
    word: "Qyqe",
    origin: "Native Geg",
    meaning: "Poor me / Woe (lament)",
    usage: "A term of lamentation, historically referring to the 'cuckoo' bird (symbol of sorrow).",
    example: "Qyqja unë, m'u thye vazot!",
    tags: ["Lament", "Empathy"]
  },
  {
    word: "Pasha besën",
    origin: "Native Geg",
    meaning: "By my honor / Word of honor",
    usage: "A traditional oath used to guarantee the truth of a statement.",
    example: "Pasha besën, s'kam gja n'dorë.",
    tags: ["Oath", "Honor"]
  },
  {
    word: "Bac",
    origin: "Native Geg",
    meaning: "Respectful title for an older male",
    usage: "Used as a vocative of respect for elders or brothers.",
    example: "Bac, a po vjen me ne?",
    tags: ["Respect", "Kinship"]
  },

  // TURKISH / OTTOMAN
  {
    word: "Bujrum",
    origin: "Turkish",
    meaning: "Welcome / Please / Enter",
    usage: "The standard word for hospitality and inviting someone in.",
    example: "Bujrum, uluni n'odë!",
    tags: ["Hospitality", "Social"]
  },
  {
    word: "Ugur",
    origin: "Turkish",
    meaning: "Good luck / Omen",
    usage: "Used to describe a lucky start or a positive sign for the future.",
    example: "Kjo punë ka me pasë ugur t'mirë.",
    tags: ["Luck", "Belief"]
  },
  {
    word: "Haram",
    origin: "Turkish",
    meaning: "Forbidden / Sinful",
    usage: "Used interjectionally to express that an action is morally wrong.",
    example: "Haram t'koftë ajo bukë qi ke hângër!",
    tags: ["Moral", "Warning"]
  },
  {
    word: "Gajret",
    origin: "Turkish",
    meaning: "Patience / Courage",
    usage: "Used to encourage someone during difficult times.",
    example: "Ban gajret, se kalon edhe kjo.",
    tags: ["Strength", "Comfort"]
  },
  {
    word: "Aman",
    origin: "Turkish",
    meaning: "Mercy / Please / Enough",
    usage: "Used to express exhaustion or a desperate plea.",
    example: "Aman o zot, sa jam lodhë!",
    tags: ["Exhaustion", "Plea"]
  },
  {
    word: "Vallahi",
    origin: "Turkish",
    meaning: "I swear by God",
    usage: "Commonly used to emphasize truthfulness.",
    example: "Vallahi, nuk e di!",
    tags: ["Emphasis", "Oath"]
  },

  // LATIN / ITALIAN / VENETIAN
  {
    word: "Mik",
    origin: "Latin/Italian",
    meaning: "Friend / Guest",
    usage: "Derived from Latin 'Amicus', deeply integrated into the Kanun code.",
    example: "Miku asht mbret n'shpi.",
    tags: ["Culture", "Core"]
  },
  {
    word: "Portë",
    origin: "Latin/Italian",
    meaning: "Gate / Door",
    usage: "Refers to the massive gates of a Kulla or a city (from Latin 'Porta').",
    example: "Mbylli portat e avllisë.",
    tags: ["Architecture", "Heritage"]
  },
  {
    word: "Kushri",
    origin: "Latin/Italian",
    meaning: "Cousin",
    usage: "A term for relative derived from Italian 'Cugino'.",
    example: "Vjen kushrini nga kurbeti.",
    tags: ["Family", "Social"]
  },
  {
    word: "Mestër",
    origin: "Latin/Italian",
    meaning: "Master / Skilled worker",
    usage: "From Latin 'Magister', used for craftsmen.",
    example: "Mestri i madh i gurtarisë.",
    tags: ["Skill", "Work"]
  },
  {
    word: "Kaminë",
    origin: "Latin/Italian",
    meaning: "Furnace / Chimney",
    usage: "Common technical term in Geg industrial/home history (from Latin 'Caminus').",
    example: "Ndeze kaminën e vjetër.",
    tags: ["Home", "Technical"]
  },

  // SLAVIC
  {
    word: "Zakon",
    origin: "Slavic",
    meaning: "Custom / Tradition / Habit",
    usage: "Refers to the unwritten rules of behavior.",
    example: "Kështu âsht zakoni n'malësi.",
    tags: ["Culture", "Tradition"]
  },
  {
    word: "Guvë",
    origin: "Slavic",
    meaning: "Cave / Hollow space",
    usage: "Common in Geg landscape descriptions.",
    example: "U fshehën n'nji guvë t'madhe.",
    tags: ["Nature", "Landscape"]
  },
  {
    word: "Kozak",
    origin: "Slavic",
    meaning: "Guard / Vigilant person",
    usage: "A historical borrowing used to describe a certain type of guard.",
    example: "Rrin si kozak te dera.",
    tags: ["History", "Guard"]
  },
  {
    word: "Megjë",
    origin: "Slavic",
    meaning: "Boundary / Border line",
    usage: "Used for land property borders, significant in the Kanun.",
    example: "Mos e luj megjën e tjetrit.",
    tags: ["Land", "Legal"]
  },

  // INTERNATIONAL / ALBANIZED
  {
    word: "me analizue",
    origin: "International/Albanized",
    meaning: "To analyze",
    usage: "Adapted with the Geg infinitive 'me' and '-ue' ending.",
    example: "Kemi me analizue këtë çështje.",
    tags: ["Academic", "Verb"]
  },
  {
    word: "Principal",
    origin: "International/Albanized",
    meaning: "Main / Primary",
    usage: "Used in formal Geg contexts to denote importance.",
    example: "Kjo asht nji pikë principale.",
    tags: ["Modern", "Formal"]
  }
];

type TabType = 'Native Geg' | 'Turkish' | 'Slavic' | 'Latin/Italian' | 'International/Albanized';

const InterjectionsPage: React.FC<InterjectionsPageProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Native Geg');
  const [searchQuery, setSearchQuery] = useState('');
  const isGeg = lang === 'geg';

  const filteredData = INTERJECTIONS_DATA.filter(item => 
    item.origin === activeTab && 
    (item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.meaning.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getOriginStyles = (origin: string) => {
    switch(origin) {
      case 'Native Geg': return {
        pill: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
        accent: 'text-orange-600 dark:text-orange-400',
        icon: <Flame className="w-4 h-4" />
      };
      case 'Turkish': return {
        pill: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        accent: 'text-red-600 dark:text-red-400',
        icon: <Star className="w-4 h-4" />
      };
      case 'Slavic': return {
        pill: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        accent: 'text-blue-600 dark:text-blue-400',
        icon: <Globe className="w-4 h-4" />
      };
      case 'Latin/Italian': return {
        pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
        accent: 'text-emerald-600 dark:text-emerald-400',
        icon: <BookOpen className="w-4 h-4" />
      };
      case 'International/Albanized': return {
        pill: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
        accent: 'text-violet-600 dark:text-violet-400',
        icon: <Sparkles className="w-4 h-4" />
      };
      default: return {
        pill: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        accent: 'text-gray-600 dark:text-gray-400',
        icon: <Info className="w-4 h-4" />
      };
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24 px-4">
       <div className="text-center mb-12">
         <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-gray-900 rounded-[2.5rem] mb-6 border border-gray-100 dark:border-gray-800 shadow-2xl relative group">
             <MessageCircle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
         </div>
         <h1 className="text-4xl sm:text-7xl font-serif font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            {isGeg ? 'Pasthirrma & ' : 'Interjections & '}<span className="text-albanian-red">Huazime</span>
         </h1>
       </div>

       <div className="max-w-4xl mx-auto mb-12 space-y-6">
          <input
            type="text"
            placeholder={isGeg ? "Kërko nji fjalë..." : "Search a word..."}
            className="block w-full pl-10 pr-10 py-5 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 shadow-xl rounded-[2rem] text-lg focus:border-albanian-red/30 transition-all dark:text-white outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex flex-wrap justify-center gap-3">
              {(['Native Geg', 'Turkish', 'Slavic', 'Latin/Italian', 'International/Albanized'] as TabType[]).map((origin) => {
                const styles = getOriginStyles(origin);
                const isActive = activeTab === origin;
                return (
                    <button
                        key={origin}
                        onClick={() => setActiveTab(origin)}
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 border-2 ${
                          isActive 
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-2xl' 
                          : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800'
                        }`}
                    >
                        <span className={isActive ? '' : styles.accent}>{styles.icon}</span>
                        {origin}
                    </button>
                );
              })}
          </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item, idx) => {
             const styles = getOriginStyles(item.origin);
             return (
               <div 
                 key={idx} 
                 className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative overflow-hidden"
               >
                  <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border w-fit mb-6 ${styles.pill}`}>
                    {item.origin}
                  </div>
                  <h3 className="text-4xl font-serif font-black text-gray-900 dark:text-white mb-2 tracking-tight group-hover:text-albanian-red transition-colors">
                     {item.word}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-bold italic mb-6">
                    "{item.meaning}"
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl mb-6 flex-grow">
                     <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.usage}
                     </p>
                  </div>
                  <p className="text-lg font-serif text-gray-800 dark:text-gray-200 italic mb-6">
                     "{item.example}"
                  </p>
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                     {item.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-gray-400">#{tag}</span>
                     ))}
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
};

export default InterjectionsPage;
