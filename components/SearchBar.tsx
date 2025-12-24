
import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Clock, ArrowRight, Sparkles, HelpCircle, X, ChevronDown } from './Icons';

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
  { word: "me punue", type: "geg" },
  { word: "me punuar", type: "std" },
  { word: "me kênë", type: "geg" },
  { word: "me qenë", type: "std" },
  { word: "me shkue", type: "geg" },
  { word: "me shkuar", type: "std" },
  { word: "me dashtë", type: "geg" },
  { word: "me dashur", type: "std" },
  { word: "nanë", type: "geg" },
  { word: "nënë", type: "std" },
  { word: "mother", type: "eng" },
  { word: "babë", type: "geg" },
  { word: "father", type: "eng" },
  { word: "vlla", type: "geg" },
  { word: "brother", type: "eng" },
  { word: "çikë", type: "geg" },
  { word: "vajzë", type: "std" },
  { word: "girl", type: "eng" },
  { word: "katund", type: "geg" },
  { word: "fshat", type: "std" },
  { word: "village", type: "eng" },
  { word: "mal", type: "geg" },
  { word: "mountain", type: "eng" },
  { word: "bukë", type: "geg" },
  { word: "bread", type: "eng" },
  { word: "ujë", type: "geg" },
  { word: "water", type: "eng" },
];

const levenshtein = (s: string, t: string) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    const arr = [];
    for (let i = 0; i <= t.length; i++) {
        arr[i] = [i];
        for (let j = 1; j <= s.length; j++) {
            arr[i][j] = i === 0 ? j : Math.min(
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
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<DictionaryItem[]>([]);
  const [didYouMean, setDidYouMean] = useState<DictionaryItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // UX Optimization: Input debouncing for snappy suggestion filtering
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setDidYouMean(null);
      const pool = MOCK_DICTIONARY.filter(item => item.type === 'geg' && !history.includes(item.word));
      setFilteredSuggestions([...pool].sort(() => 0.5 - Math.random()).slice(0, 5));
      setSelectedIndex(-1);
      return;
    }
    
    const lowerQuery = debouncedQuery.toLowerCase();
    const matches = MOCK_DICTIONARY.filter(
      item => item.word.toLowerCase().includes(lowerQuery)
    );

    // Strict Priority Sort: Geg (3) > Standard (2) > English (1)
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

    setFilteredSuggestions(matches.slice(0, 6));

    // Improved Fuzzy Matching
    if (matches.length === 0) {
       let closest: DictionaryItem | null = null;
       let minDist = Infinity;
       for (const item of MOCK_DICTIONARY) {
          const dist = levenshtein(lowerQuery, item.word.toLowerCase());
          if (dist < minDist && dist <= 2) {
             minDist = dist;
             closest = item;
          }
       }
       setDidYouMean(closest);
    } else {
       setDidYouMean(null);
    }
    setSelectedIndex(-1);
  }, [debouncedQuery, history]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
        if (selectedIndex >= 0) {
            e.preventDefault();
            handleSuggestionClick(filteredSuggestions[selectedIndex].word);
        }
    } else if (e.key === 'Escape') {
        setIsFocused(false);
    }
  };

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

  const getTypeBadge = (type: string) => {
      const base = "text-[9px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-tighter border transition-all shadow-sm";
      if (type === 'geg') return <span className={`${base} bg-red-600 text-white border-red-500`}>GEG</span>;
      if (type === 'std') return <span className={`${base} bg-indigo-600 text-white border-indigo-500`}>STD</span>;
      return <span className={`${base} bg-slate-500 text-white border-slate-400`}>ENG</span>;
  };

  const HighlightedText: React.FC<{ text: string, highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <span key={i} className="text-albanian-red dark:text-red-400 underline decoration-2 decoration-albanian-red/30 underline-offset-4">{part}</span> 
            : part
        )}
      </span>
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isFocused && (history.length > 0 || filteredSuggestions.length > 0 || didYouMean);

  return (
    <div className="w-full max-w-3xl mx-auto relative z-[60]" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          {isLoading ? <Loader2 className="h-6 w-6 text-albanian-red animate-spin" /> : <Search className="h-6 w-6 text-gray-400 group-focus-within:text-albanian-red transition-colors" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          onChange={(e) => setQuery(e.target.value)}
          className={`block w-full pl-16 pr-6 py-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl text-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-albanian-red/5 transition-all duration-300 ${showDropdown ? 'rounded-t-[2.5rem]' : 'rounded-[2.5rem]'}`}
          placeholder={lang === 'geg' ? "Lyp nji fjalë..." : "Search for a word..."}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="absolute inset-y-3 right-3 px-8 bg-albanian-red text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-800 transition-all disabled:opacity-50 active:scale-95 shadow-xl"
        >
          {lang === 'geg' ? "Lyp" : "Search"}
        </button>
      </form>
      
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border border-t-0 border-gray-100 dark:border-gray-800 rounded-b-[2.5rem] shadow-2xl overflow-hidden animate-scale-in origin-top pb-4">
           {didYouMean && (
              <button onClick={() => handleSuggestionClick(didYouMean.word)} className="w-full bg-amber-50 dark:bg-amber-900/10 p-5 text-center group flex items-center justify-center gap-3 border-y border-amber-100 dark:border-amber-900/30">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-800 dark:text-amber-300 font-bold">
                    {lang === 'geg' ? 'Mos lypët:' : 'Did you mean:'} <span className="underline decoration-wavy underline-offset-4 decoration-amber-500/50">{didYouMean.word}</span>
                  </span>
                  {getTypeBadge(didYouMean.type)}
              </button>
           )}

           <div className="py-2">
              {query.length === 0 && history.length > 0 && (
                <div className="px-8 py-4 border-b border-gray-50 dark:border-gray-800">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Recent History</h4>
                    <div className="flex flex-wrap gap-2">
                        {history.slice(0, 5).map((h, i) => (
                            <button key={i} onClick={() => handleSuggestionClick(h)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all active:scale-95 border border-gray-200 dark:border-gray-700">
                              {h}
                            </button>
                        ))}
                    </div>
                </div>
              )}

              <div className="px-8 pt-6 pb-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                    {query.length > 0 ? <Search className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    {query.length > 0 ? (lang === 'geg' ? 'Sugjerime' : 'Best Matches') : (lang === 'geg' ? 'Fjalë Popullore' : 'Popular in Geg')}
                </h4>
              </div>

              {filteredSuggestions.length === 0 && query.length > 0 && !didYouMean && (
                <div className="px-8 py-10 text-center text-gray-400 italic text-sm">
                   {lang === 'geg' ? 'Asnji sugjerim nuk u gjet.' : 'No matches found in archive.'}
                </div>
              )}

              {filteredSuggestions.map((item, idx) => (
                 <button
                    key={idx}
                    onClick={() => handleSuggestionClick(item.word)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-8 py-4 flex items-center justify-between group transition-all ${selectedIndex === idx ? 'bg-indigo-50/50 dark:bg-indigo-900/20 translate-x-1' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                 >
                    <div className="flex items-center gap-4">
                        <span className={`text-xl font-serif italic ${selectedIndex === idx ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'}`}>
                            <HighlightedText text={item.word} highlight={query} />
                        </span>
                        {getTypeBadge(item.type)}
                    </div>
                    <ArrowRight className={`w-4 h-4 text-indigo-500 transition-all ${selectedIndex === idx ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
                 </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
