
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, Menu, X, Globe, User, ShieldCheck, Sparkles, Heart, Sun, Moon,
  Search, Book, AlignLeft, Clock, Headphones, FileText, Users, Type, Activity, Map as MapIcon, Mic, Edit3,
  MoreHorizontal, ChevronDown, ShoppingBag
} from './components/Icons';
import { DictionaryEntry, UserProfile, Language, VaultStatus, View } from './types';
import { fetchWordDefinition, fetchWordOfTheDay, saveToDictionaryCache } from './services/geminiService';
import { db, Stores } from './services/db';
import SearchBar from './components/SearchBar';
import WordCard from './components/WordCard';
import GlossaryPage from './components/GlossaryPage';
import HistoryPage from './components/HistoryPage';
import PodcastPage from './components/PodcastPage';
import BlogPage from './components/BlogPage';
import SupportPage from './components/SupportPage';
import CommunityPage from './components/CommunityPage';
import ShopPage from './components/ShopPage';
import InterjectionsPage from './components/InterjectionsPage';
import AlphabetPage from './components/AlphabetPage';
import ForumPage from './components/ForumPage';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import DailyQuiz from './components/DailyQuiz';
import ThesaurusDashboard from './components/ThesaurusDashboard';
import LanguageMap from './components/LanguageMap';
import Footer from './components/Footer';
import ConnectionStatus from './components/ConnectionStatus';
import VoiceTutor from './components/VoiceTutor';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('geg');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gegenisht_theme') as Theme;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const [currentView, setCurrentView] = useState<View>('dictionary');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [voiceTutorOpen, setVoiceTutorOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>('locked');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [wotd, setWotd] = useState<DictionaryEntry | null>(null);
  const [globalEditMode, setGlobalEditMode] = useState(false);

  const [searchState, setSearchState] = useState<{
    isLoading: boolean;
    error: string | null;
    data: DictionaryEntry | null;
  }>({ isLoading: false, error: null, data: null });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    db.init().catch(console.error);
    const storedUser = localStorage.getItem('gegenisht_user');
    if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setVaultStatus(parsed.role === 'admin' ? 'quantum_secure' : 'unlocked');
    }
    
    const loadWotd = async () => {
        try {
            const data = await fetchWordOfTheDay();
            setWotd(data);
        } catch (e) {
            console.error("Failed to load WOTD");
        }
    };
    loadWotd();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('gegenisht_theme', theme);
  }, [theme]);

  const updateActivity = useCallback(() => setLastActivity(Date.now()), []);

  useEffect(() => {
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keypress', updateActivity);
    return () => {
        window.removeEventListener('mousedown', updateActivity);
        window.removeEventListener('keypress', updateActivity);
    };
  }, [updateActivity]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleUpdateUser = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('gegenisht_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('gegenisht_user');
    }
  };

  const handleReqAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setSearchState({ isLoading: false, error: null, data: null });
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchState({ isLoading: true, error: null, data: null });
    setCurrentView('dictionary');
    try {
      if (!searchHistory.includes(query)) setSearchHistory(prev => [query, ...prev].slice(0, 5));
      const result = await fetchWordDefinition(query);
      setSearchState({ isLoading: false, error: null, data: result });
    } catch (err) {
      setSearchState({ isLoading: false, error: 'Database connection interrupted.', data: null });
    }
  };

  const handleSaveEntry = async (entry: DictionaryEntry) => {
      try {
          // This calls db.put which handles both IndexedDB and Supabase logic
          await db.put(Stores.Dictionary, entry);
          
          // Update the current UI states with the new data
          if (searchState.data?.word.toLowerCase() === entry.word.toLowerCase()) {
              setSearchState(prev => ({ ...prev, data: entry }));
          }
          if (wotd?.word.toLowerCase() === entry.word.toLowerCase()) {
              setWotd(entry);
          }
      } catch (e) {
          console.error("Failed to save entry:", e);
          throw e; // Pass to child for UI error handling
      }
  };

  const primaryNavItems: {id: View, label: string, labelGeg: string, icon: React.ElementType}[] = [
    { id: 'dictionary', label: 'Dictionary', labelGeg: 'Fjalori', icon: Search },
    { id: 'map', label: 'Linguistic Map', labelGeg: 'Harta', icon: MapIcon },
    { id: 'history', label: 'History', labelGeg: 'Historia', icon: Clock },
    { id: 'community', label: 'Community', labelGeg: 'Komuniteti', icon: Users },
  ];

  const moreNavItems: {id: View, label: string, labelGeg: string, icon: React.ElementType}[] = [
    { id: 'interjections', label: 'Loan Words', labelGeg: 'Huazime', icon: Globe },
    { id: 'podcast', label: 'Podcast', labelGeg: 'Podkast', icon: Headphones },
    { id: 'blog', label: 'Blog', labelGeg: 'Blog', icon: FileText },
    { id: 'shop', label: 'Shop', labelGeg: 'Dyqani', icon: ShoppingBag },
  ];

  const allNavItems: {id: View, label: string, labelGeg: string, icon: React.ElementType}[] = [
    ...primaryNavItems, 
    ...moreNavItems, 
    { id: 'support', label: 'Donate', labelGeg: 'Dhuroni', icon: Heart }
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans text-slate-800 dark:text-gray-100 bg-albanian-cream dark:bg-gray-950 transition-colors duration-300`}>
      {/* MOBILE NAV OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 animate-fade-in md:hidden flex flex-col p-6 overflow-y-auto">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-2">
                <div className="bg-albanian-red text-white p-1.5 rounded-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xl font-serif font-bold dark:text-white">Gegenisht</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-full"><X className="w-6 h-6"/></button>
           </div>
           <div className="flex flex-col gap-3">
              {allNavItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all border ${currentView === item.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <item.icon className={`w-5 h-5 ${item.id === 'support' ? 'text-albanian-red' : ''}`} />
                  <span className="text-lg">{lang === 'geg' ? item.labelGeg : item.label}</span>
                </button>
              ))}
           </div>
        </div>
      )}

      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                   <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('dictionary')}>
                  <div className="bg-albanian-red text-white p-1.5 rounded-lg shadow-md transition-transform hover:rotate-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-serif font-bold tracking-tight text-albanian-black dark:text-white hidden lg:block">Gegenisht</span>
                </div>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
                {primaryNavItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button 
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            {lang === 'geg' ? item.labelGeg : item.label}
                        </button>
                    );
                })}

                <div className="relative">
                    <button 
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      onMouseEnter={() => setMoreMenuOpen(true)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${moreNavItems.some(i => i.id === currentView) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                        {lang === 'geg' ? 'Më shumë' : 'More'}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {moreMenuOpen && (
                        <div 
                          className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 animate-scale-in"
                          onMouseLeave={() => setMoreMenuOpen(false)}
                        >
                           {moreNavItems.map(item => (
                             <button
                               key={item.id}
                               onClick={() => handleNavClick(item.id)}
                               className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-bold transition-all ${currentView === item.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                             >
                               <item.icon className={`w-4 h-4 ${currentView === item.id ? 'text-indigo-500' : 'text-gray-400'}`} />
                               {lang === 'geg' ? item.labelGeg : item.label}
                             </button>
                           ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
               {isAdmin && (
                 <button 
                   onClick={() => setGlobalEditMode(!globalEditMode)}
                   className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${globalEditMode ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                 >
                   <Edit3 className="w-3 h-3" />
                   {globalEditMode ? 'Live Edit: ON' : 'Live Edit: OFF'}
                 </button>
               )}

               <button 
                 onClick={toggleTheme}
                 className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                 aria-label="Toggle Theme"
               >
                 {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
               </button>

               <button onClick={() => setLang(lang === 'geg' ? 'eng' : 'geg')} className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-all hover:border-gray-400">
                 {lang === 'geg' ? 'GEG' : 'ENG'}
               </button>

               <button 
                  onClick={() => handleNavClick('support')}
                  className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${currentView === 'support' ? 'bg-albanian-red text-white' : 'bg-white dark:bg-gray-900 text-albanian-red border border-albanian-red/30 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
               >
                  <Heart className={`w-4 h-4 ${currentView === 'support' ? 'fill-current' : ''}`} />
                  <span>{lang === 'geg' ? 'Dhuroni' : 'Donate'}</span>
               </button>

               {user ? (
                 <button onClick={() => handleNavClick(user.role === 'admin' ? 'admin' : 'community')} className="flex items-center justify-center w-10 h-10 bg-gray-900 dark:bg-white text-white dark:text-slate-900 rounded-full transition-all hover:scale-110 shadow-md">
                    {user.role === 'admin' ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <User className="w-5 h-5" />}
                 </button>
               ) : (
                 <button onClick={() => handleReqAuth('login')} className="flex items-center justify-center w-10 h-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full transition-all hover:bg-black dark:hover:bg-gray-100 hover:scale-110 shadow-md">
                    <User className="w-5 h-5" />
                 </button>
               )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {currentView === 'dictionary' && (
            <div className="animate-fade-in space-y-12">
              <SearchBar onSearch={handleSearch} isLoading={searchState.isLoading} lang={lang} history={searchHistory} />
              {searchState.data ? (
                <WordCard 
                  entry={searchState.data} 
                  lang={lang} 
                  onSearch={handleSearch} 
                  isEditing={globalEditMode}
                  onSaveEntry={handleSaveEntry}
                />
              ) : (
                <div className="space-y-24">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-2 space-y-10">
                            <section>
                                <div className="flex items-center justify-center gap-2 mb-8">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">{lang === 'geg' ? 'Fjala e Ditës' : 'Word of the Day'}</h2>
                                </div>
                                {wotd ? (
                                    <WordCard 
                                      entry={wotd} 
                                      lang={lang} 
                                      initialTab="definitions" 
                                      onSearch={handleSearch} 
                                      isEditing={globalEditMode}
                                      onSaveEntry={handleSaveEntry}
                                    />
                                ) : (
                                    <div className="h-64 bg-white dark:bg-gray-900 rounded-[2.5rem] animate-pulse border border-gray-100 dark:border-gray-800"></div>
                                )}
                            </section>
                      </div>
                      <div className="space-y-10">
                            <section className="h-full">
                                <div className="flex items-center justify-center gap-2 mb-8">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">{lang === 'geg' ? 'Sfidë Ditore' : 'Daily Challenge'}</h2>
                                </div>
                                <DailyQuiz wotd={wotd} lang={lang} isEditing={globalEditMode} />
                            </section>
                      </div>
                   </div>

                   <section>
                        <div className="flex items-center gap-2 mb-10 justify-center">
                            <AlignLeft className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">{lang === 'geg' ? 'Thesari & Eksplorimi' : 'Thesaurus & Exploration'}</h2>
                        </div>
                        <ThesaurusDashboard onSearch={handleSearch} lang={lang} />
                   </section>

                   <section className="pt-16 border-t border-gray-100 dark:border-gray-800">
                        <GlossaryPage lang={lang} isEditing={globalEditMode} />
                   </section>
                </div>
              )}
            </div>
          )}

          {currentView === 'map' && <LanguageMap lang={lang} />}
          {currentView === 'admin' && <AdminDashboard lang={lang} onBack={() => setCurrentView('dictionary')} />}
          {currentView === 'glossary' && <GlossaryPage lang={lang} isEditing={globalEditMode} />}
          {currentView === 'history' && <HistoryPage lang={lang} />}
          {currentView === 'podcast' && <PodcastPage lang={lang} user={user} />}
          {currentView === 'blog' && <BlogPage lang={lang} isEditing={globalEditMode} />}
          {currentView === 'support' && <SupportPage lang={lang} user={user} onUpdateUser={handleUpdateUser} onReqAuth={(mode) => handleReqAuth(mode === 'signup' ? 'signup' : 'login')} />}
          {currentView === 'community' && <CommunityPage lang={lang} isAdmin={user?.role === 'admin'} onAdminClick={() => setCurrentView('admin')} user={user} onReqAuth={() => handleReqAuth('login')} />}
          {currentView === 'shop' && <ShopPage lang={lang} cartItems={[]} onAddToCart={() => {}} onRemoveFromCart={() => {}} onClearCart={() => {}} />}
          {currentView === 'forum' && <ForumPage lang={lang} user={user} onReqAuth={() => handleReqAuth('login')} />}
          {currentView === 'interjections' && <InterjectionsPage lang={lang} />}
          {currentView === 'alphabet' && <AlphabetPage lang={lang} isEditing={globalEditMode} />}
        </div>
      </main>

      {!voiceTutorOpen && (
        <button 
          onClick={() => setVoiceTutorOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group overflow-visible"
        >
          <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-20 scale-150 group-hover:opacity-40"></div>
          <Mic className="w-8 h-8 relative z-10" />
          <div className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-x-4 group-hover:translate-x-0 hidden md:block">
             {lang === 'geg' ? 'Fol me Bacën' : 'Talk with Bac'}
          </div>
        </button>
      )}
      
      <Footer lang={lang} onNavigate={handleNavClick} />
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onLogin={(u) => { handleUpdateUser(u); setAuthModalOpen(false); }} 
        lang={lang} 
        initialMode={authInitialMode}
      />
      {voiceTutorOpen && <VoiceTutor lang={lang} onClose={() => setVoiceTutorOpen(false)} />}
    </div>
  );
};

export default App;
