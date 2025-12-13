import React, { useState, useEffect } from 'react';
import { Language } from '../App';
import { GlossaryTerm, DictionaryEntry } from '../types';
import { fetchGlossaryTerms, fetchWordDefinition } from '../services/geminiService';
import WordCard from './WordCard';
import { Loader2, Book, ArrowRight, ArrowLeft, Filter, Search, X } from './Icons';

interface GlossaryPageProps {
  lang: Language;
  isEditing: boolean;
}

const ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'Dh', 'E', 'Ë', 'F', 'G', 'Gj', 'H', 
  'I', 'J', 'K', 'L', 'Ll', 'M', 'N', 'Nj', 'O', 'P', 'Q', 'R', 
  'Rr', 'S', 'Sh', 'T', 'Th', 'U', 'V', 'X', 'Xh', 'Y', 'Z', 'Zh'
];

type OriginFilter = 'All' | 'Native' | 'Turkish' | 'Slavic' | 'Latin';

const GlossaryPage: React.FC<GlossaryPageProps> = ({ lang, isEditing }) => {
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [originFilter, setOriginFilter] = useState<OriginFilter>('All');
  const [localSearch, setLocalSearch] = useState('');

  const isGeg = lang === 'geg';

  useEffect(() => {
    const loadTerms = async () => {
      setLoading(true);
      setTerms([]);
      setSelectedEntry(null);
      // Reset filters when changing letters
      setLocalSearch(''); 
      try {
        const data = await fetchGlossaryTerms(selectedLetter);
        setTerms(data);
      } catch (e) {
        console.error("Glossary error", e);
      } finally {
        setLoading(false);
      }
    };
    loadTerms();
  }, [selectedLetter]);

  const handleTermClick = async (word: string) => {
    setLoadingEntry(true);
    try {
      const entry = await fetchWordDefinition(word);
      setSelectedEntry(entry);
    } catch (e) {
      console.error("Definition error", e);
    } finally {
      setLoadingEntry(false);
    }
  };

  const handleEntryUpdate = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  // Filter Logic: Origin AND Local Search string
  const filteredTerms = terms.filter(term => {
    const matchesOrigin = originFilter === 'All' || term.origin?.toLowerCase().includes(originFilter.toLowerCase());
    const matchesSearch = term.word.toLowerCase().includes(localSearch.toLowerCase()) || 
                          term.definition.toLowerCase().includes(localSearch.toLowerCase());
    return matchesOrigin && matchesSearch;
  });

  if (selectedEntry) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in-up pb-20">
         <button 
           onClick={() => setSelectedEntry(null)}
           className="mb-6 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium group px-4 sm:px-0"
         >
            <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-gray-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span>{isGeg ? 'Kthehu te Fjalorthi' : 'Back to Glossary'}</span>
         </button>
         <WordCard 
           entry={selectedEntry} 
           lang={lang} 
           isEditing={isEditing} 
           onUpdateEntry={handleEntryUpdate}
         />
      </div>
    );
  }

  if (loadingEntry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <div className="relative">
            <div className="w-16 h-16 border-4 border-teal-100 dark:border-teal-900/30 border-t-teal-600 dark:border-t-teal-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Book className="w-6 h-6 text-teal-600 dark:text-teal-500" />
            </div>
         </div>
         <p className="text-gray-500 dark:text-gray-400 font-medium mt-6 animate-pulse">{isGeg ? 'Duke hulumtue fjalën...' : 'Looking up definition...'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20">
       <div className="text-center mb-10 px-4">
         <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-teal-50 dark:bg-teal-900/20 rounded-3xl mb-6 shadow-sm border border-teal-100 dark:border-teal-800 transform rotate-2">
             <Book className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600 dark:text-teal-400" />
         </div>
         <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            {isGeg ? 'Fjalorthi i ' : 'Glossary of '}<span className="text-teal-600 dark:text-teal-400">Gegenishtes</span>
         </h1>
         <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
             {isGeg 
               ? 'Shfletoni fjalët sipas shkronjave. Nji koleksion i kuruem termash arkaikë dhe kulturorë.' 
               : 'Browse words by letter. A curated collection of archaic and cultural terms.'}
         </p>
       </div>

       {/* Sticky Alphabet Navigation */}
       <div className="sticky top-16 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-y border-gray-200 dark:border-gray-800 mb-8 shadow-sm">
          <div className="max-w-7xl mx-auto">
             <div className="flex items-center gap-1 sm:gap-2 p-2 sm:p-4 overflow-x-auto no-scrollbar scroll-smooth">
                {ALPHABET.map((letter) => {
                   const isActive = selectedLetter === letter;
                   return (
                      <button
                        key={letter}
                        onClick={() => setSelectedLetter(letter)}
                        className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-200 ${
                           isActive 
                           ? 'bg-teal-600 text-white shadow-lg scale-105 transform' 
                           : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                         {letter}
                      </button>
                   );
                })}
             </div>
          </div>
       </div>

       {/* Controls Bar: Search & Filter */}
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 px-4">
          
          {/* Local Search Input */}
          <div className="relative w-full md:w-auto md:min-w-[300px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
               type="text" 
               placeholder={isGeg ? `Kërko ndër fjalët me ${selectedLetter}...` : `Search words starting with ${selectedLetter}...`}
               value={localSearch}
               onChange={(e) => setLocalSearch(e.target.value)}
               className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-200 dark:focus:ring-teal-900 outline-none transition-all text-sm dark:text-white dark:placeholder-gray-500"
             />
             {localSearch && (
               <button 
                 onClick={() => setLocalSearch('')}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
               >
                 <X className="w-4 h-4" />
               </button>
             )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
             <div className="flex items-center gap-2 mr-2 text-gray-400 text-sm font-medium flex-shrink-0">
                <Filter className="w-4 h-4" />
             </div>
             {(['All', 'Native', 'Turkish', 'Slavic', 'Latin'] as OriginFilter[]).map((origin) => (
                <button
                   key={origin}
                   onClick={() => setOriginFilter(origin)}
                   className={`px-4 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${
                      originFilter === origin 
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md' 
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                   }`}
                >
                   {origin === 'All' ? (isGeg ? 'Të gjitha' : 'All') : origin}
                </button>
             ))}
          </div>
       </div>

       {/* Content Area */}
       {loading ? (
         <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-teal-600 dark:text-teal-500 animate-spin mb-4" />
            <p className="text-gray-400 dark:text-gray-500 font-medium">{isGeg ? 'Duke ngarkue fjalët...' : 'Loading words...'}</p>
         </div>
       ) : (
         <div className="min-h-[400px]">
            {filteredTerms.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
                  {filteredTerms.map((term, idx) => (
                     <div 
                       key={idx}
                       onClick={() => handleTermClick(term.word)}
                       className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-500 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
                     >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 dark:bg-teal-900/20 rounded-bl-[100px] -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex justify-between items-start mb-3">
                              <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                                 {term.word}
                              </h3>
                           </div>
                           
                           <div className="flex flex-wrap gap-2 mb-4">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-md border border-teal-100 dark:border-teal-800">
                                 {term.partOfSpeech}
                              </span>
                              {term.origin && (
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                                    {term.origin}
                                 </span>
                              )}
                           </div>

                           <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                              {term.definition}
                           </p>

                           <div className="flex items-center text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mt-auto group-hover:translate-x-2 transition-transform duration-300">
                              {isGeg ? 'Shiko Detajet' : 'View Details'} <ArrowRight className="w-3 h-3 ml-1" />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
                     <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{isGeg ? 'Nuk u gjetën fjalë' : 'No words found'}</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                     {isGeg 
                        ? 'Provoni të ndryshoni filtrat ose shkronjën e zgjedhun.' 
                        : 'Try changing your filters or selected letter.'}
                  </p>
               </div>
            )}
         </div>
       )}
    </div>
  );
};

export default GlossaryPage;