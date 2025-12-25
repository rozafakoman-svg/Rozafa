
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, Menu, X, Globe, User, ShieldCheck, Sparkles, Heart, Sun, Moon,
  Search, Book, AlignLeft, AncientColumns, HeritageMic, BlogB, Users, Type, Activity, Map as MapIcon, Mic, Edit3,
  MoreHorizontal, ChevronDown, ShoppingBag, QuestionMark, AlertTriangle, Anchor, MessageSquare, LogIn, Diamond, Quote, ArrowRight
} from './components/Icons';
import { DictionaryEntry, UserProfile, Language, VaultStatus, View, ModuleSettings } from './types';
import { fetchWordDefinition, fetchWordOfTheDay, fetchHeritageWisdom } from './services/geminiService';
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
import FAQPage from './components/FAQPage';
import Footer from './components/Footer';
import ConnectionStatus from './components/ConnectionStatus';
import VoiceTutor from './components/VoiceTutor';

type Theme = 'light' | 'dark';

const DEFAULT_MODULES: ModuleSettings = {
  forum: true,
  map: true,
  history: true,
  interjections: true,
  podcast: true,
  blog: true,
  shop: true,
  faq: true,
  glossary: true,
  alphabet: true,
  thesaurus: true,
  support: true,
  community: true
};

const GegAvatar: React.FC<{ user: UserProfile, size?: 'sm' | 'md' }> = ({ user, size = 'sm' }) => {
  const isMythic = user.tier === 'mythic';
  const charCode = user.name.charCodeAt(0);
  const avatarType = charCode % 3; 

  const containerClass = size === 'sm' ? 'w-10 h-10 rounded-xl' : 'w-24 h-24 rounded-3xl';
  
  return (
    <div className={`${containerClass} relative overflow-hidden flex items-center justify-center transition-all shadow-inner border border-white/20 ${isMythic ? 'bg-gradient-to-br from-fuchsia-600 to-indigo-600' : 'bg-slate-900'}`}>
      {avatarType === 0 && (
        <div className="relative flex flex-col items-center">
            <div className="w-1/2 h-1/3 bg-white rounded-t-full mb-[-2px] shadow-sm"></div>
            <div className="w-2/3 h-1 bg-white/20 rounded-full"></div>
        </div>
      )}
      {avatarType === 1 && (
        <div className="text-white opacity-90">
            <Anchor className={size === 'sm' ? 'w-6 h-6' : 'w-14 h-14'} />
        </div>
      )}
      {avatarType === 2 && (
        <div className="grid grid-cols-2 gap-0.5 opacity-60">
            <div className="w-2.5 h-2.5 rotate-45 border border-red-500 bg-red-500/20"></div>
            <div className="w-2.5 h-2.5 rotate-45 border border-red-500 bg-red-500/20"></div>
            <div className="w-2.5 h-2.5 rotate-45 border border-red-500 bg-red-500/20"></div>
            <div className="w-2.5 h-2.5 rotate-45 border border-red-500 bg-red-500/20"></div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
    </div>
  );
};

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
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [voiceTutorOpen, setVoiceTutorOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wotd, setWotd] = useState<DictionaryEntry | null>(null);
  const [wisdom, setWisdom] = useState<{text: string, translation: string, meaning: string} | null>(null);
  const [globalEditMode, setGlobalEditMode] = useState(false);
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings>(() => {
    const saved = localStorage.getItem('gegenisht_modules');
    return saved ? JSON.parse(saved) : DEFAULT_MODULES;
  });

  const [searchState, setSearchState] = useState<{
    isLoading: boolean;
    error: string | null;
    data: DictionaryEntry | null;
  }>({ isLoading: false, error: null, data: null });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const initApp = async () => {
        try {
            await db.init();
            const storedUser = localStorage.getItem('gegenisht_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            
            // Load daily assets sequentially to avoid 429 burst on startup
            try {
                const wotdData = await fetchWordOfTheDay();
                setWotd(wotdData);
            } catch (e) { console.warn("Sequential load part 1 failed"); }

            try {
                const wisdomData = await fetchHeritageWisdom();
                setWisdom(wisdomData);
            } catch (e) { console.warn("Sequential load part 2 failed"); }
            
        } catch (error) {
            console.error("App Initialization Failed:", error);
        }
    };

    initApp();
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleUpdateUser = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('gegenisht_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('gegenisht_user');
    }
  };

  const handleToggleModule = (key: string) => {
    setModuleSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('gegenisht_modules', JSON.stringify(next));
      return next;
    });
  };

  const handleReqAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

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
      if (!searchHistory.includes(query)) {
          setSearchHistory(prev => [query, ...prev].slice(0, 10));
      }
      const result = await fetchWordDefinition(query);
      setSearchState({ isLoading: false, error: null, data: result });
    } catch (err: any) {
      let friendlyError = lang === 'geg' ? 'Lidhja u ndërpre.' : 'Connection interrupted.';
      if (err.message === "MISSING_API_KEY") {
          friendlyError = lang === 'geg' ? 'Konfigurimi i sistemit mungon.' : 'System configuration error.';
      } else if (err.message?.includes('429')) {
          friendlyError = lang === 'geg' ? 'Shumë kërkesa. Provoni pas nji minute.' : 'Too many requests. Retry in a minute.';
      }
      setSearchState({ isLoading: false, error: friendlyError, data: null });
    }
  };

  const handleSaveEntry = async (entry: DictionaryEntry) => {
      try {
          await db.put(Stores.Dictionary, entry);
          if (searchState.data?.word.toLowerCase() === entry.word.toLowerCase()) {
              setSearchState(prev => ({ ...prev, data: entry }));
          }
      } catch (e: any) {
          console.error("Failed to save entry:", e);
      }
  };

  const navItems = useMemo(() => {
    const all = [
      { id: 'dictionary' as View, label: 'Dictionary', labelGeg: 'Fjalori', icon: Search, color: 'red' },
      { id: 'forum' as View, label: 'Forum', labelGeg: 'Forumi', icon: MessageSquare, color: 'indigo' },
      { id: 'map' as View, label: 'Map', labelGeg: 'Harta', icon: MapIcon, color: 'emerald' },
      { id: 'history' as View, label: 'History', labelGeg: 'Historia', icon: AncientColumns, color: 'slate' },
      { id: 'interjections' as View, label: 'Loan Words', labelGeg: 'Huazime', icon: Globe, color: 'amber' },
      { id: 'podcast' as View, label: 'Podcast', labelGeg: 'Podkast', icon: HeritageMic, color: 'violet' },
      { id: 'blog' as View, label: 'Blog', labelGeg: 'Blogu', icon: BlogB, color: 'blue' },
      { id: 'faq' as View, label: 'FAQ', labelGeg: 'Pyetje', icon: QuestionMark, color: 'cyan' },
    ];
    return all.filter(item => item.id === 'dictionary' || (moduleSettings[item.id] !== false));
  }, [moduleSettings]);

  const handleProfileClick = () => {
    if (user) {
      handleNavClick(user.role === 'admin' ? 'admin' : 'community');
    } else {
      handleReqAuth('login');
    }
  };

  const getActiveClasses = (color: string) => {
    switch (color) {
      case 'red': return { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-800', dot: 'bg-red-500' };
      case 'indigo': return { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800', dot: 'bg-indigo-500' };
      case 'emerald': return { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800', dot: 'bg-emerald-500' };
      case 'slate': return { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', dot: 'bg-slate-500' };
      case 'amber': return { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800', dot: 'bg-amber-500' };
      case 'violet': return { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-800', dot: 'bg-violet-500' };
      case 'blue': return { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800', dot: 'bg-blue-500' };
      case 'cyan': return { bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-100 dark:border-cyan-800', dot: 'bg-cyan-500' };
      default: return { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800', dot: 'bg-indigo-500' };
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans text-slate-800 dark:text-gray-100 bg-albanian-cream dark:bg-gray-950 transition-colors duration-300`}>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 animate-fade-in md:hidden flex flex-col p-6 overflow-y-auto">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-2">
                <div className="bg-albanian-red text-white p-1.5 rounded-lg"><BookOpen className="w-6 h-6" /></div>
                <span className="text-xl font-serif font-bold dark:text-white">Gegenisht</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-full"><X className="w-6 h-6"/></button>
           </div>
           <div className="flex flex-col gap-3">
              {navItems.map(item => {
                const styles = getActiveClasses(item.color);
                return (
                  <button key={item.id} onClick={() => handleNavClick(item.id)} className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all border ${currentView === item.id ? `${styles.bg} ${styles.border} ${styles.text} font-bold` : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    <item.icon className={`w-5 h-5 ${currentView === item.id ? '' : 'text-gray-400'}`} />
                    <span className="text-lg">{lang === 'geg' ? item.labelGeg : item.label}</span>
                  </button>
                );
              })}
              
              {moduleSettings.shop !== false && (
                <button 
                  onClick={() => handleNavClick('shop')} 
                  className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all border ${currentView === 'shop' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 text-emerald-600 font-bold' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <ShoppingBag className={`w-5 h-5 ${currentView === 'shop' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="text-lg">{lang === 'geg' ? 'Dyqani' : 'Shop'}</span>
                </button>
              )}

              {moduleSettings.support !== false && (
                <button 
                  onClick={() => handleNavClick('support')} 
                  className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all border ${currentView === 'support' ? 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800 text-red-600 font-bold' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <Heart className={`w-5 h-5 fill-red-500 text-red-500`} />
                  <span className="text-lg text-red-600 font-black">{lang === 'geg' ? 'Mbështetni' : 'Support Us'}</span>
                </button>
              )}

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-4"></div>
              <button onClick={handleProfileClick} className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all border ${(currentView === 'community' || currentView === 'admin') ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'}`}>
                 {user ? <GegAvatar user={user} /> : <LogIn className="w-5 h-5" />}
                 <span className="text-lg">{user ? (lang === 'geg' ? 'Profili' : 'Profile') : (lang === 'geg' ? 'Hini n\'Llogari' : 'Sign In')}</span>
              </button>
           </div>
        </div>
      )}

      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 shadow-sm h-20">
        <div className="max-w-[1600px] mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full gap-0">
            <div className="flex items-center gap-3 flex-shrink-0 pr-6">
                <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Menu className="w-6 h-6" /></button>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('dictionary')}>
                  <div className="bg-albanian-red text-white p-2 rounded-xl shadow-md transition-transform hover:rotate-3"><BookOpen className="w-6 h-6" /></div>
                  <span className="text-xl font-serif font-bold tracking-tight text-albanian-black dark:text-white hidden md:block">Gegenisht</span>
                </div>
            </div>
            
            <div className="hidden md:flex items-center h-full flex-grow justify-center overflow-x-auto no-scrollbar scroll-smooth">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    const styles = getActiveClasses(item.color);
                    return (
                        <button 
                          key={item.id} 
                          onClick={() => handleNavClick(item.id)} 
                          title={lang === 'geg' ? item.labelGeg : item.label}
                          aria-label={lang === 'geg' ? item.labelGeg : item.label}
                          className={`h-full min-w-[85px] xl:min-w-[100px] transition-all flex flex-col items-center justify-center flex-shrink-0 relative group ${isActive ? `${styles.bg} border-x border-transparent` : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <item.icon className={`w-7 h-7 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            
                            <div className={`absolute bottom-0 left-0 right-0 h-1 transition-colors ${isActive ? styles.dot : 'bg-transparent'} shadow-[0_-2px_8px_rgba(0,0,0,0.1)]`}></div>
                            
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all pointer-events-none ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                                <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap bg-white dark:bg-gray-900 px-3 py-1.5 rounded-b-xl border-x border-b border-gray-100 dark:border-gray-800 shadow-xl ${isActive ? styles.text : 'text-gray-500 dark:text-gray-400'}`}>
                                   {lang === 'geg' ? item.labelGeg : item.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 pl-6 h-full">
               {isAdmin && <button onClick={() => setGlobalEditMode(!globalEditMode)} className={`hidden 2xl:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${globalEditMode ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><Edit3 className="w-4 h-4" /> Edit</button>}
               
               {/* Moved Shop Icon next to Heart */}
               {moduleSettings.shop !== false && (
                <button 
                  onClick={() => handleNavClick('shop')}
                  title={lang === 'geg' ? 'Dyqani' : 'Shop'}
                  className={`p-2.5 rounded-2xl transition-all hover:scale-110 active:scale-95 group relative ${currentView === 'shop' ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                >
                  <ShoppingBag className={`w-6 h-6 transition-all ${currentView === 'shop' ? 'text-emerald-600' : 'text-emerald-500'}`} />
                  {currentView === 'shop' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></span>}
                </button>
               )}

               {/* High-Visibility Support Heart Button */}
               {moduleSettings.support !== false && (
                <button 
                  onClick={() => handleNavClick('support')}
                  title={lang === 'geg' ? 'Mbështetni Projektin' : 'Support the Project'}
                  className={`p-2.5 rounded-2xl transition-all hover:scale-110 active:scale-95 group relative ${currentView === 'support' ? 'bg-red-50 dark:bg-red-900/30' : 'hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                >
                  <Heart className={`w-6 h-6 transition-all ${currentView === 'support' ? 'fill-red-600 text-red-600 animate-pulse' : 'text-red-500 fill-red-500/20 group-hover:fill-red-500'}`} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                </button>
               )}

               <button onClick={toggleTheme} className="p-2.5 rounded-2xl text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">{theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}</button>
               <button onClick={() => setLang(lang === 'geg' ? 'eng' : 'geg')} className="text-[10px] font-black uppercase px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors">{lang === 'geg' ? 'GEG' : 'ENG'}</button>
               
               <div className="w-px h-8 bg-gray-100 dark:bg-gray-800 mx-1 hidden sm:block"></div>

               <button 
                  onClick={handleProfileClick} 
                  title={user ? (lang === 'geg' ? 'Shko te Profili' : 'Go to Profile') : (lang === 'geg' ? 'Hini n\'Llogari' : 'Sign In')}
                  className={`h-full min-w-[75px] transition-all flex items-center justify-center flex-shrink-0 relative group ${user ? 'bg-white dark:bg-gray-900 border-x border-gray-100 dark:border-gray-800' : 'bg-gray-950 text-white'}`}
               >
                  {user ? (
                    <GegAvatar user={user} />
                  ) : (
                    <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 text-white group-hover:scale-110 transition-transform">
                       <LogIn className="w-6 h-6" />
                    </div>
                  )}
                  
                  {(currentView === 'community' || currentView === 'admin') && <span className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_-2px_10px_rgba(99,102,241,0.6)]"></span>}
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {currentView === 'dictionary' && !searchState.data && !searchState.isLoading && (
            <div className="w-full h-[35vh] md:h-[45vh] relative overflow-hidden flex items-center justify-center mb-[-4rem]">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] brightness-[0.4] contrast-[1.2]">
                   <source src="https://assets.mixkit.co/videos/preview/mixkit-flag-of-albania-waving-in-the-wind-33758-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-albanian-cream dark:to-gray-950"></div>
                <div className="relative z-10 text-center px-4 animate-fade-in-up">
                   <div className="inline-flex items-center gap-3 px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white mb-6">
                      <Anchor className="w-5 h-5 text-albanian-red" />
                      <span className="text-xs font-black uppercase tracking-[0.3em]">{lang === 'geg' ? 'Gjuha e Maleve' : 'Language of the Mountains'}</span>
                   </div>
                   <h1 className="text-4xl md:text-7xl font-serif font-black text-white mb-4 tracking-tighter drop-shadow-2xl text-center">
                      {lang === 'geg' ? 'Trashëgimia e ' : 'Heritage of the '}<span className="text-albanian-red">Gegëve</span>
                   </h1>
                </div>
            </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16 relative z-20">
          {currentView === 'dictionary' && (
            <div className="animate-fade-in space-y-12">
              <SearchBar onSearch={handleSearch} isLoading={searchState.isLoading} lang={lang} history={searchHistory} />
              
              {searchState.error && (
                  <div className="max-w-3xl mx-auto p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-[2.5rem] flex items-center gap-4 animate-shake text-red-700 dark:text-red-400">
                      <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>
                      <div className="flex-grow">
                         <p className="font-black uppercase text-[10px] tracking-widest mb-1">System Notice</p>
                         <p className="font-bold text-sm">{searchState.error}</p>
                      </div>
                      <button onClick={() => setSearchState(s => ({ ...s, error: null }))} className="p-2 hover:bg-red-200 dark:hover:bg-red-800 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                  </div>
              )}

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
                   {/* Fjala e Urtë (Heritage Wisdom) Section */}
                   {wisdom && (
                        <section className="animate-fade-in-up">
                            <div className="bg-slate-900 dark:bg-black rounded-[3rem] p-10 sm:p-16 border border-slate-800 shadow-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-albanian-red/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-indigo-300 mb-10">
                                        <Quote className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">{lang === 'geg' ? 'Fjalë e Urtë' : 'Heritage Wisdom'}</span>
                                    </div>
                                    <h2 className="text-4xl sm:text-6xl font-serif font-black text-white mb-8 italic leading-tight max-w-4xl">
                                        "{wisdom.text}"
                                    </h2>
                                    <div className="w-24 h-1 bg-albanian-red/30 rounded-full mb-8"></div>
                                    <p className="text-indigo-100/60 text-xl font-medium mb-12 max-w-2xl">
                                        {wisdom.translation}
                                    </p>
                                    <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 max-w-2xl">
                                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                                            <Sparkles className="w-4 h-4" /> Cultural Insight
                                        </h3>
                                        <p className="text-sm text-slate-300 leading-relaxed italic">
                                            {wisdom.meaning}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                   )}

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-2 space-y-10">
                            <section>
                                <div className="flex items-center justify-center gap-2 mb-8">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">{lang === 'geg' ? 'Fjala e Ditës' : 'Word of the Day'}</h2>
                                </div>
                                {wotd ? (
                                    <WordCard entry={wotd} lang={lang} initialTab="definitions" onSearch={handleSearch} isEditing={globalEditMode} onSaveEntry={handleSaveEntry} />
                                ) : (
                                    <div className="h-64 bg-white dark:bg-gray-900 rounded-[2.5rem] animate-pulse border border-gray-100 dark:border-gray-800 shadow-sm"></div>
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
          {currentView === 'admin' && (
            <AdminDashboard 
              lang={lang} 
              onBack={() => setCurrentView('dictionary')} 
              moduleSettings={moduleSettings}
              onToggleModule={handleToggleModule}
            />
          )}
          {currentView === 'glossary' && <GlossaryPage lang={lang} isEditing={globalEditMode} />}
          {currentView === 'history' && <HistoryPage lang={lang} />}
          {currentView === 'podcast' && <PodcastPage lang={lang} user={user} />}
          {currentView === 'blog' && <BlogPage lang={lang} isEditing={globalEditMode} />}
          {currentView === 'support' && <SupportPage lang={lang} user={user} onUpdateUser={handleUpdateUser} onReqAuth={(mode) => handleReqAuth(mode === 'signup' ? 'signup' : 'login')} />}
          {currentView === 'community' && <CommunityPage lang={lang} isAdmin={user?.role === 'admin'} onAdminClick={() => setCurrentView('admin')} user={user} onReqAuth={() => handleReqAuth('login')} onNavigate={handleNavClick} />}
          {currentView === 'shop' && <ShopPage lang={lang} cartItems={[]} onAddToCart={() => {}} onRemoveFromCart={() => {}} onClearCart={() => {}} />}
          {currentView === 'forum' && <ForumPage lang={lang} user={user} onReqAuth={() => handleReqAuth('login')} />}
          {currentView === 'interjections' && <InterjectionsPage lang={lang} />}
          {currentView === 'alphabet' && <AlphabetPage lang={lang} isEditing={globalEditMode} />}
          {currentView === 'faq' && <FAQPage lang={lang} />}
        </div>
      </main>

      {!voiceTutorOpen && (
        <button 
          onClick={() => setVoiceTutorOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group overflow-visible"
        >
          <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-20 scale-150 group-hover:opacity-40"></div>
          <Mic className="w-8 h-8 relative z-10" />
          <div className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-x-4 group-hover:translate-x-0 hidden md:block border border-white/10 shadow-2xl">
             {lang === 'geg' ? 'Fol me Bacën' : 'Talk with Bac'}
          </div>
        </button>
      )}
      
      <Footer lang={lang} onNavigate={handleNavClick} />
      
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={(u) => { handleUpdateUser(u); setAuthModalOpen(false); }} lang={lang} initialMode={authInitialMode} />
      {voiceTutorOpen && <VoiceTutor lang={lang} onClose={() => setVoiceTutorOpen(false)} />}
    </div>
  );
};

export default App;
