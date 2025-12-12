import React, { useState, useEffect } from 'react';
import { SearchState } from './types';
import { fetchWordDefinition, fetchWordOfTheDay } from './services/geminiService';
import SearchBar from './components/SearchBar';
import WordCard from './components/WordCard';
import { Sparkles, BookOpen } from './components/Icons';

const App: React.FC = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const [wordOfTheDay, setWordOfTheDay] = useState<SearchState>({
    isLoading: true,
    error: null,
    data: null,
  });

  const handleSearch = async (query: string) => {
    setSearchState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetchWordDefinition(query);
      setSearchState({ isLoading: false, error: null, data });
    } catch (err) {
      setSearchState({ 
        isLoading: false, 
        error: "Could not find definition. Please try another word or check your connection.", 
        data: null 
      });
    }
  };

  useEffect(() => {
    // Fetch Word of the Day on mount
    const getWotD = async () => {
      try {
        const data = await fetchWordOfTheDay();
        setWordOfTheDay({ isLoading: false, error: null, data });
      } catch (err) {
        setWordOfTheDay({ 
            isLoading: false, 
            error: "Failed to load Word of the Day", 
            data: null 
        });
      }
    };
    getWotD();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSearchState(prev => ({...prev, data: null}))}>
              <div className="bg-albanian-red text-white p-1.5 rounded-lg">
                 <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-albanian-black">Gegërisht</span>
            </div>
            <div className="flex items-center gap-4">
               <a href="#" className="text-sm font-medium text-gray-500 hover:text-albanian-red transition-colors">About</a>
               <a href="#" className="text-sm font-medium text-gray-500 hover:text-albanian-red transition-colors">Contribute</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          
          {/* Hero Section (Show only if no search result is active) */}
          {!searchState.data && (
             <div className="text-center mb-16 animate-fade-in-down">
                <h1 className="text-5xl sm:text-7xl font-serif font-bold text-albanian-black mb-6">
                  Discover the <span className="text-albanian-red relative inline-block">
                    <span className="relative z-10">Soul</span>
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-red-200 -z-10 opacity-50 transform -rotate-1"></span>
                  </span> of Albanian
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
                  Explore the rich vocabulary, expressions, and heritage of the Geg dialect.
                </p>
             </div>
          )}

          {/* Search Area */}
          <div className={searchState.data ? "mb-8" : "mb-20"}>
            <SearchBar onSearch={handleSearch} isLoading={searchState.isLoading} />
          </div>

          {/* Error Message */}
          {searchState.error && (
            <div className="max-w-xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center mb-10">
              {searchState.error}
            </div>
          )}

          {/* Search Result */}
          {searchState.data && (
            <div className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
                   <button 
                     onClick={() => setSearchState(prev => ({...prev, data: null}))}
                     className="text-gray-400 hover:text-gray-800 transition-colors flex items-center gap-2"
                   >
                     ← Back to home
                   </button>
                </div>
                <WordCard entry={searchState.data} />
            </div>
          )}

          {/* Word of the Day Section (Only show on home) */}
          {!searchState.data && !searchState.isLoading && (
            <div className="mt-20 border-t border-gray-200 pt-16">
               <div className="flex items-center justify-center gap-2 mb-8">
                  <Sparkles className="text-amber-500 w-5 h-5" />
                  <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">Word of the Day</h2>
                  <Sparkles className="text-amber-500 w-5 h-5" />
               </div>

               {wordOfTheDay.isLoading ? (
                  <div className="flex justify-center p-12">
                     <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="h-64 w-full max-w-2xl bg-gray-100 rounded-3xl"></div>
                     </div>
                  </div>
               ) : wordOfTheDay.data ? (
                  <WordCard entry={wordOfTheDay.data} />
               ) : null}
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
           <p className="mb-4 text-albanian-black font-serif italic text-lg">"Gjuha ruhet aty ku shkruhet"</p>
           <p className="text-sm">© {new Date().getFullYear()} Gegërisht Project. Powered by Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;