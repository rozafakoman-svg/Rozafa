
import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Clock, ArrowRight, Sparkles, HelpCircle, X } from './Icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  lang: 'geg' | 'eng';
  history: string[];
}

interface DictionaryItem {
  word: string;
  type: 'geg' | 'std' | 'eng';
}

const MOCK_DICTIONARY: DictionaryItem[] = [
  { word: "shpi", type: "geg" },
  { word: "shtëpi", type: "std" },
  { word: "house", type: "eng" },
  { word: "bujrum", type: "geg" },
  { word: "mirë se vjen", type: "std" },
  { word: "welcome", type: "eng" },
  { word: "njeri", type: "geg" },
  { word: "njeriu", type: "std" },
  { word: "human", type: "eng" },
  { word: "zot", type: "geg" },
  { word: "god", type: "eng" },
  { word: "besa", type: "geg" },
  { word: "faith", type: "eng" },
  { word: "burrë", type: "geg" },
  { word: "husband", type: "eng" },
  { word: "gru", type: "geg" },
  { word: "grua", type: "std" },
  { word: "wife", type: "eng" },
  { word: "nanë", type: "geg" },
  { word: "nënë", type: "std" },
  { word: "mother", type: "eng" },
  { word: "babë", type: "geg" },
  { word: "baba", type: "std" },
  { word: "father", type: "eng" },
  { word: "vlla", type: "geg" },
  { word: "vëlla", type: "std" },
  { word: "brother", type: "eng" },
  { word: "motër", type: "geg" },
  { word: "sister", type: "eng" },
  { word: "djalë", type: "geg" },
  { word: "son", type: "eng" },
  { word: "çikë", type: "geg" },
  { word: "vajzë", type: "std" },
  { word: "girl", type: "eng" },
  { word: "katund", type: "geg" },
  { word: "fshat", type: "std" },
  { word: "village", type: "eng" },
  { word: "mal", type: "geg" },
  { word: "mountain", type: "eng" },
  { word: "fushë", type: "geg" },
  { word: "field", type: "eng" },
  { word: "det", type: "geg" },
  { word: "sea", type: "eng" },
  { word: "bukë", type: "geg" },
  { word: "bread", type: "eng" },
  { word: "ujë", type: "geg" },
  { word: "water", type: "eng" },
  { word: "venë", type: "geg" },
  { word: "verë", type: "std" },
  { word: "wine", type: "eng" },
  { word: "raki", type: "geg" },
  { word: "brandy", type: "eng" },
  { word: "mish", type: "geg" },
  { word: "meat", type: "eng" },
  { word: "kry", type: "geg" },
  { word: "kokë", type: "std" },
  { word: "head", type: "eng" },
  { word: "sy", type: "geg" },
  { word: "eye", type: "eng" },
  { word: "vesh", type: "geg" },
  { word: "ear", type: "eng" },
  { word: "gojë", type: "geg" },
  { word: "mouth", type: "eng" },
  { word: "dorë", type: "geg" },
  { word: "hand", type: "eng" },
  { word: "kambë", type: "geg" },
  { word: "këmbë", type: "std" },
  { word: "leg", type: "eng" },
  { word: "zemër", type: "geg" },
  { word: "heart", type: "eng" },
  { word: "shpirt", type: "geg" },
  { word: "soul", type: "eng" },
  { word: "mend", type: "geg" },
  { word: "mind", type: "eng" },
  { word: "fjalë", type: "geg" },
  { word: "word", type: "eng" },
  { word: "kangë", type: "geg" },
  { word: "këngë", type: "std" },
  { word: "song", type: "eng" },
  { word: "lojë", type: "geg" },
  { word: "game", type: "eng" },
  { word: "hâna", type: "geg" },
  { word: "hëna", type: "std" },
  { word: "moon", type: "eng" },
  { word: "me kênë", type: "geg" },
  { word: "me qenë", type: "std" },
  { word: "been", type: "eng" },
  { word: "me punue", type: "geg" },
  { word: "me punuar", type: "std" },
  { word: "to work", type: "eng" },
  { word: "me shkue", type: "geg" },
  { word: "me shkuar", type: "std" },
  { word: "to go", type: "eng" },
  { word: "me dashtë", type: "geg" },
  { word: "me dashur", type: "std" },
  { word: "to love", type: "eng" },
];

const levenshtein = (s: string, t: string) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    const arr = [];
    for (let i = 0; i <= t.length; i++) {
        arr[i] = [i];
        for (let j = 1; j <= s.length; j++) {
            arr[i][j] =
                i === 0
                    ? j
                    : Math.min(
                          arr[i - 1][j] + 1,
                          arr[i][j - 1] + 1,
                          arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
                      );
        }
    }
    return arr[t.length][s.length];
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, lang, history }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<DictionaryItem[]>([]);
  const [didYouMean, setDidYouMean] = useState<DictionaryItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setDidYouMean(null);
      const pool = MOCK_DICTIONARY.filter(item => item.type === 'geg' && !history.includes(item.word));
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      setFilteredSuggestions(shuffled.slice(0, 5));
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const matches = MOCK_DICTIONARY.filter(
      item => item.word.toLowerCase().includes(lowerQuery) && !history.includes(item.word)
    );

    matches.sort((a, b) => {
        const getScore = (type: string) => type === 'geg' ? 3 : type === 'std' ? 2 : 1;
        const scoreA = getScore(a.type);
        const scoreB = getScore(b.type);
        if (scoreA !== scoreB) return scoreB - scoreA;
        const startsA = a.word.toLowerCase().startsWith(lowerQuery);
        const startsB = b.word.toLowerCase().startsWith(lowerQuery);
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;
        return a.word.localeCompare(b.word);
    });

    setFilteredSuggestions(matches.slice(0, 5));

    if (matches.length <= 1) {
       let closest: DictionaryItem | null = null;
       let minDist = Infinity;
       const candidates = MOCK_DICTIONARY.filter(
           item => Math.abs(item.word.length - lowerQuery.length) <= 2 && !history.includes(item.word)
       );
       for (const item of candidates) {
          if (matches.some(m => m.word === item.word)) continue;
          const dist = levenshtein(lowerQuery, item.word.toLowerCase());
          if (dist < minDist && dist > 0 && dist <= 2) {
             minDist = dist;
             closest = item;
          }
       }
       setDidYouMean(closest);
    } else {
       setDidYouMean(null);
    }

  }, [query, history]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (word: string) => {
    setQuery(word);
    onSearch(word);
    setIsFocused(false);
  };

  const placeholder = lang === 'geg' 
    ? "Lyp nji fjalë..." 
    : "Search for a word...";
    
  const buttonText = lang === 'geg' ? "Lyp" : "Search";
  const didYouMeanText = lang === 'geg' ? "Mos lypët:" : "Did you mean:";

  const showDropdown = isFocused && (history.length > 0 || filteredSuggestions.length > 0 || didYouMean);
  const displayHistory = query 
    ? history.filter(h => h.toLowerCase().includes(query.toLowerCase())) 
    : history;

  const suggestionLabel = query.trim() 
    ? (lang === 'geg' ? 'Sugjerime' : 'Suggestions')
    : (lang === 'geg' ? 'Fjalë Popullore (Geg)' : 'Popular Words (Geg)');

  const SuggestionIcon = query.trim() ? Search : Sparkles;

  const getTypeBadge = (type: string) => {
      if (type === 'geg') return <span className="bg-red-50 dark:bg-red-900/50 text-albanian-red dark:text-red-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">GEG</span>;
      if (type === 'std') return <span className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">STD '72</span>;
      if (type === 'eng') return <span className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">ENG</span>;
      return null;
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-[60]" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-albanian-red animate-spin" />
          ) : (
            <Search className="h-6 w-6 text-gray-400 dark:text-gray-500 group-focus-within:text-albanian-red dark:group-focus-within:text-red-400 transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          className={`block w-full pl-14 pr-4 py-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl text-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-albanian-red/5 dark:focus:ring-red-500/5 transition-all duration-300 ${showDropdown ? 'rounded-t-[2.5rem]' : 'rounded-[2.5rem]'}`}
          placeholder={placeholder}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="absolute inset-y-2.5 right-2.5 px-8 bg-albanian-red text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-800 transition-all disabled:opacity-50 active:scale-95 shadow-lg"
        >
          {buttonText}
        </button>
      </form>
      
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border border-t-0 border-gray-100 dark:border-gray-800 rounded-b-[2.5rem] shadow-2xl overflow-hidden animate-fade-in origin-top">
           <div className="py-4">
              {displayHistory.length > 0 && (
                 <div className="mb-4">
                    <div className="px-6 py-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5" /> {lang === 'geg' ? 'Lypjet e Fundit' : 'Recent Searches'}
                    </div>
                    {displayHistory.map((item, idx) => (
                       <button
                          key={`hist-${idx}`}
                          onClick={() => handleSuggestionClick(item)}
                          className="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between group transition-colors"
                       >
                          <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-albanian-red dark:group-hover:text-red-400">{item}</span>
                          <ArrowRight className="w-4 h-4 text-gray-200 dark:text-gray-700 group-hover:text-albanian-red dark:group-hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all" />
                       </button>
                    ))}
                 </div>
              )}
              {didYouMean && (
                  <div className="px-6 py-3 bg-amber-50/50 dark:bg-amber-900/10 border-y border-amber-100 dark:border-amber-900/30 mb-4">
                      <button 
                        onClick={() => handleSuggestionClick(didYouMean.word)}
                        className="w-full text-left py-2 flex items-center gap-3 group"
                      >
                         <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                         <span className="text-sm text-amber-800 dark:text-amber-200 font-bold">
                            {didYouMeanText} <span className="underline decoration-dotted text-amber-900 dark:text-amber-100 group-hover:text-albanian-red dark:group-hover:text-red-400">{didYouMean.word}</span>
                         </span>
                         {getTypeBadge(didYouMean.type)}
                      </button>
                  </div>
              )}
              {filteredSuggestions.length > 0 && (
                 <div>
                    <div className={`px-6 py-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] ${displayHistory.length > 0 ? 'border-t border-gray-50 dark:border-gray-800 mt-2 pt-6' : ''} flex items-center gap-2`}>
                       <SuggestionIcon className="w-3.5 h-3.5" /> {suggestionLabel}
                    </div>
                    {filteredSuggestions.map((item, idx) => (
                       <button
                          key={`sugg-${idx}`}
                          onClick={() => handleSuggestionClick(item.word)}
                          className="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between group transition-colors"
                       >
                          <div className="flex items-center gap-4">
                              <span className="font-serif italic text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white text-lg">{item.word}</span>
                              {query.trim() && getTypeBadge(item.type)}
                          </div>
                          {!query.trim() && <ArrowRight className="w-3.5 h-3.5 text-gray-200 dark:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />}
                       </button>
                    ))}
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
