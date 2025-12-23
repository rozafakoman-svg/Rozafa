
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, Menu, X, Globe, User, ShieldCheck, Sparkles, Heart, Sun, Moon,
  Search, Book, AlignLeft, Clock, Headphones, FileText, Users, Type, Activity, Map as MapIcon, Mic, Edit3
} from './components/Icons';
import { DictionaryEntry, UserProfile, Language, VaultStatus } from './types';
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

type View = 'dictionary' | 'glossary' | 'thesaurus' | 'history' | 'podcast' | 'blog' | 'support' | 'community' | 'shop' | 'interjections' | 'alphabet' | 'forum' | 'admin' | 'map';
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
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

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setSearchState({ isLoading: false, error: null, data: null });
    setMobileMenuOpen(false);
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
          await saveToDictionaryCache(entry.word, entry);
          if (searchState.data?.word.toLowerCase() === entry.word.toLowerCase()) {
              setSearchState(prev => ({ ...prev, data: entry }));
          }
          if (wotd?.word.toLowerCase() === entry.word.toLowerCase()) {
              setWotd(entry);
          }
      } catch (e) {
          console.error("Failed to save entry:", e);
      }
  };

  const navItems: {id: View, label: string, labelGeg: string, icon: React.ElementType}[] = [
    { id: 'dictionary', label: 'Dictionary', labelGeg: 'Fjalori', icon: Search },
    { id: 'map', label: 'Linguistic Map', labelGeg: 'Harta', icon: MapIcon },
    { id: 'thesaurus', label: 'Thesaurus', labelGeg: 'Thesar', icon: AlignLeft },
    { id: 'interjections', label: 'Loan Words', labelGeg: 'Huazime', icon: Globe },
    { id: 'history', label: 'History', labelGeg: 'Historia', icon: Clock },
    { id: 'podcast', label: 'Podcast', labelGeg: 'Podkast', icon: Headphones },
    { id: 'blog', label: 'Blog', labelGeg: 'Blog', icon: FileText },
    { id: 'community', label: 'Community', labelGeg: 'Komuniteti', icon: Users },
    { id: 'support', label: 'Donate', labelGeg: 'Dhuroni', icon: Heart },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans text-slate-800 dark:text-gray-100 bg-albanian-cream dark:bg-gray-950 transition-colors duration-300`}>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                   <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('dictionary')}>
                  <div className="bg-albanian-red text-white p-1.5 rounded-lg shadow-md">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-serif font-bold tracking-tight text-albanian-black dark:text-white hidden sm:block">Gegenisht</span>
                </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
                {navItems.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${currentView === item.id ? 'text-albanian-red' : 'text-gray-500 dark:text-gray-400 hover:text-albanian-red'}`}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {lang === 'geg' ? item.labelGeg : item.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
               {isAdmin && (
                 <button 
                   onClick={() => setGlobalEditMode(!globalEditMode)}
                   className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${globalEditMode ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                 >
                   <Edit3 className="w-3 h-3" />
                   {globalEditMode ? 'Live Edit: ON' : 'Live Edit: OFF'}
                 </button>
               )}

               <div className="hidden lg:block mr-2">
                  <ConnectionStatus />
               </div>

               <button 
                 onClick={toggleTheme}
                 className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                 aria-label="Toggle Theme"
               >
                 {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
               </button>

               <button onClick={() => setLang(lang === 'geg' ? 'eng' : 'geg')} className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                 <Globe className="w-3 h-3 inline mr-1" /> {lang === 'geg' ? 'GEG' : 'ENG'}
               </button>

               {user ? (
                 <button onClick={() => handleNavClick(user.role === 'admin' ? 'admin' : 'community')} className="flex items-center gap-2 text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-xl transition-all hover:scale-105">
                    {user.role === 'admin' ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4" />}
                    <span className="hidden sm:inline">{user.role === 'admin' ? 'Admin SOC' : user.name.split(' ')[0]}</span>
                 </button>
               ) : (
                 <button onClick={() => setAuthModalOpen(true)} className="flex items-center gap-2 text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-1.5 rounded-xl">
                    <User className="w-4 h-4" />
                    <span>Login</span>
                 </button>
               )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {currentView === 'dictionary' && (
            <>
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
                <div className="space-y-16 animate-fade-in">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">{lang === 'geg' ? 'Fjala e Ditës' : 'Word of the Day'}</h2>
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
                                    <div className="h-64 bg-white dark:bg-gray-800 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-800"></div>
                                )}
                            </section>
                      </div>
                      <div className="space-y-8">
                            <section className="h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">{lang === 'geg' ? 'Sfidë Ditore' : 'Daily Challenge'}</h2>
                                </div>
                                <DailyQuiz wotd={wotd} lang={lang} isEditing={globalEditMode} />
                            </section>
                      </div>
                   </div>

                   <section>
                        <div className="flex items-center gap-2 mb-8 justify-center">
                            <BookOpen className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">{lang === 'geg' ? 'Eksploro sipas Temave' : 'Explore by Theme'}</h2>
                        </div>
                        <ThesaurusDashboard onSearch={handleSearch} lang={lang} />
                   </section>

                   <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
                        <GlossaryPage lang={lang} isEditing={globalEditMode} />
                   </section>
                </div>
              )}
            </>
          )}

          {currentView === 'map' && <LanguageMap lang={lang} />}
          {currentView === 'thesaurus' && <ThesaurusDashboard onSearch={handleSearch} lang={lang} />}
          {currentView === 'admin' && <AdminDashboard lang={lang} onBack={() => setCurrentView('dictionary')} />}
          {currentView === 'glossary' && <GlossaryPage lang={lang} isEditing={globalEditMode} />}
          {currentView === 'history' && <HistoryPage lang={lang} />}
          {currentView === 'podcast' && <PodcastPage lang={lang} user={user} />}
          {currentView === 'blog' && <BlogPage lang={lang} isEditing={globalEditMode} />}
          {currentView === 'support' && <SupportPage lang={lang} user={user} onUpdateUser={setUser} onReqAuth={() => setAuthModalOpen(true)} />}
          {currentView === 'community' && <CommunityPage lang={lang} isAdmin={user?.role === 'admin'} onAdminClick={() => setCurrentView('admin')} user={user} onReqAuth={() => setAuthModalOpen(true)} />}
          {currentView === 'shop' && <ShopPage lang={lang} cartItems={[]} onAddToCart={() => {}} onRemoveFromCart={() => {}} onClearCart={() => {}} />}
          {currentView === 'forum' && <ForumPage lang={lang} user={user} onReqAuth={() => setAuthModalOpen(true)} />}
          {currentView === 'interjections' && <InterjectionsPage lang={lang} />}
          {currentView === 'alphabet' && <AlphabetPage lang={lang} isEditing={globalEditMode} />}
        </div>
      </main>

      {/* Floating Action Button for Voice Practice */}
      <button 
        onClick={() => setVoiceTutorOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <Mic className="w-8 h-8" />
        <div className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
           {lang === 'geg' ? 'Mëso me Folë' : 'Practice Speaking'}
        </div>
      </button>
      
      <Footer lang={lang} onNavigate={handleNavClick} />
      
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={(u) => { setUser(u); setAuthModalOpen(false); }} lang={lang} />
      {voiceTutorOpen && <VoiceTutor lang={lang} onClose={() => setVoiceTutorOpen(false)} />}
    </div>
  );
};

export default App;
