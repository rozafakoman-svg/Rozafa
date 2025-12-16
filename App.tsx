
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Menu, X, Moon, Sun, Globe, Zap, User, 
  ArrowRight, Github, Twitter, Instagram,
  AlignLeft, Gamepad2, GraduationCap, Clock, FileText, 
  ShoppingBag, Shield, MessageCircle, Mic, Heart, Sparkles, AlertTriangle, LogOut, PlusCircle
} from './components/Icons';
import { DictionaryEntry, UserProfile, Language } from './types';
import { fetchWordDefinition, fetchWordOfTheDay } from './services/geminiService';
import SearchBar from './components/SearchBar';
import WordCard from './components/WordCard';
import ThesaurusDashboard from './components/ThesaurusDashboard';
import GamesDashboard from './components/GamesDashboard';
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
import AdUnit from './components/AdUnit';

type View = 'dictionary' | 'thesaurus' | 'games' | 'glossary' | 'history' | 'podcast' | 'blog' | 'support' | 'community' | 'shop' | 'interjections' | 'alphabet' | 'forum' | 'admin' | 'about';

const translations = {
  eng: {
    nav: {
        dict: "Dictionary", thes: "Thesaurus", games: "Games", gloss: "Glossary", 
        hist: "History", podcast: "Podcast", blog: "Blog", support: "Support", 
        community: "Community", shop: "Shop", interjections: "Interjections", 
        alphabet: "Alphabet", forum: "Forum", about: "About", admin: "Admin Panel",
        login: "Login", profile: "Profile", edit: "Edit Mode", editing: "Editing"
    },
    hero: {
        title_main: "The Geg Dictionary",
        subtitle_dict: "Preserving the richness of the Northern Albanian language.",
        subtitle_thes: "Explore the nuances and synonyms of the Geg language."
    },
    footer: {
        explore: "Explore", community: "Community", project: "Project",
        rights: "All rights reserved."
    },
    footer_quote: "Language is the archive of history.",
    wotd: "Word of the Day",
    view_entry: "View Entry",
    back_search: "Back to Search",
    about_title: "About Gegenisht",
    about_text_1: "Gegenisht is an open-source initiative...",
    about_mission: "Our Mission",
    about_mission_text: "To revitalize the Geg language...",
    about_contribute: "Contribute on GitHub"
  },
  geg: {
    nav: {
        dict: "Fjalori", thes: "Thesari", games: "Lojëra", gloss: "Fjalorthi", 
        hist: "Historia", podcast: "Podkaste", blog: "Blogu", support: "Mbështetje", 
        community: "Komuniteti", shop: "Dyqani", interjections: "Pasthirrma", 
        alphabet: "Alfabeti", forum: "Forumi", about: "Rreth Nesh", admin: "Paneli Admin",
        login: "Hini", profile: "Profili", edit: "Modi Editimit", editing: "Duke Editue"
    },
    hero: {
        title_main: "Fjalori i Gegenishtes",
        subtitle_dict: "Tuej Ruejt Pasunine e gjuhes Gege",
        subtitle_thes: "Eksploroni nuancat dhe sinonimet e Gegenishtes."
    },
    footer: {
        explore: "Eksploro", community: "Komuniteti", project: "Projekti",
        rights: "Të gjitha të drejtat e rezervueme."
    },
    footer_quote: "Gjuha âsht arkiva e historisë.",
    wotd: "Fjala e Ditës",
    view_entry: "Shiko Fjalën",
    back_search: "Kthehu te Kërkimi",
    about_title: "Rreth Gegenisht",
    about_text_1: "Gegenisht âsht nji nismë...",
    about_mission: "Misioni Jonë",
    about_mission_text: "Me e ringjallë gjuhën Gege...",
    about_contribute: "Kontribuo në GitHub"
  }
};

const navItems = [
  { id: 'dictionary', label: 'Dictionary', icon: BookOpen },
  { id: 'thesaurus', label: 'Thesaurus', icon: AlignLeft },
  { id: 'alphabet', label: 'Alphabet', icon: Sparkles },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'glossary', label: 'Glossary', icon: GraduationCap },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'podcast', label: 'Podcast', icon: Mic },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'shop', label: 'Shop', icon: ShoppingBag },
  { id: 'community', label: 'Community', icon: Shield },
  { id: 'forum', label: 'Forum', icon: MessageCircle },
  { id: 'support', label: 'Support', icon: Heart, isSpecial: true },
];

const EMPTY_ENTRY: DictionaryEntry = {
  word: 'New Word',
  phonetic: '',
  partOfSpeech: 'Noun',
  definitionEnglish: 'Enter definition here...',
  definitionStandard: '',
  etymology: '',
  synonyms: [],
  examples: [{ original: 'Original sentence...', standard: 'Standard sentence...', translation: 'English translation...' }],
  relatedPhrases: [],
  grammarNotes: [],
  culturalNote: '',
  dialectRegion: 'Northern Albania'
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<Language>('geg');
  const [currentView, setCurrentView] = useState<View>('dictionary');
  const [isEditMode, setIsEditMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [searchState, setSearchState] = useState<{
    isLoading: boolean;
    error: string | null;
    data: DictionaryEntry | null;
  }>({ isLoading: false, error: null, data: null });

  const [wordOfTheDay, setWordOfTheDay] = useState<{
    isLoading: boolean;
    data: DictionaryEntry | null;
  }>({ isLoading: true, data: null });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);

  const t = translations[lang];

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    
    // Load User from Persistence
    const storedUser = localStorage.getItem('gegenisht_user');
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Failed to parse stored user");
        }
    }
    
    // Load WOTD
    fetchWordOfTheDay().then(data => {
        setWordOfTheDay({ isLoading: false, data });
    }).catch(() => {
        setWordOfTheDay({ isLoading: false, data: null });
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setSearchState({ isLoading: false, error: null, data: null });
    window.scrollTo(0, 0);
  };

  const handleLogin = (newUser: UserProfile) => {
      setUser(newUser);
      localStorage.setItem('gegenisht_user', JSON.stringify(newUser));
      setAuthModalOpen(false);
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('gegenisht_user');
      setIsEditMode(false); // Disable God Mode on logout
      setCurrentView('dictionary'); // Reset view to home
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setSearchState({ isLoading: true, error: null, data: null });
    setCurrentView('dictionary'); // Force dictionary view on search
    
    try {
      // Add to history
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev].slice(0, 5));
      }

      const result = await fetchWordDefinition(query);
      setSearchState({ isLoading: false, error: null, data: result });
    } catch (err) {
      setSearchState({ isLoading: false, error: lang === 'geg' ? 'Ndodhi nji gabim. Provoni përsëri.' : 'An error occurred. Please try again.', data: null });
    }
  };

  const handleCreateEntry = () => {
    setCurrentView('dictionary');
    setSearchState({
      isLoading: false,
      error: null,
      data: { ...EMPTY_ENTRY }
    });
  };

  const handleEntryUpdate = (entry: DictionaryEntry) => {
      setSearchState(prev => ({ ...prev, data: entry }));
  };

  const handleEntryDelete = () => {
      // In a real app, this would call DELETE API
      alert("Entry deleted successfully (Mock)");
      setSearchState({ isLoading: false, error: null, data: null });
  };

  const handleAddToCart = (id: string) => {
      setCartItems(prev => [...prev, id]);
  };

  const handleRemoveFromCart = (id: string) => {
      setCartItems(prev => prev.filter(item => item !== id));
  };

  const handleClearCart = () => {
      setCartItems([]);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans text-slate-800 dark:text-gray-100 bg-[#fcfbf7] dark:bg-gray-950 transition-colors duration-300 ${isEditMode ? 'border-4 border-dashed border-red-500' : ''}`}>
      
      {/* Primary Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm h-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Open Menu"
                >
                   <Menu className="w-6 h-6" />
                </button>

                {/* Logo */}
                <div 
                  className="flex items-center gap-2 cursor-pointer" 
                  onClick={() => handleNavClick('dictionary')}
                >
                  <div className="bg-albanian-red text-white p-1.5 rounded-lg">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-albanian-black dark:text-white hidden sm:block">Gegenisht</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
               {/* Theme Toggle */}
               <button
                 onClick={toggleTheme}
                 className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                 title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
               >
                 {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
               </button>

               {/* Language Toggle */}
               <button 
                 onClick={() => setLang(lang === 'geg' ? 'eng' : 'geg')}
                 className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                 aria-label="Toggle Language"
               >
                 <Globe className="w-3 h-3" /> {lang === 'geg' ? 'GEG' : 'ENG'}
               </button>

               {/* God Mode Toggle - Only Visible to Admins */}
               {user?.role === 'admin' && (
                 <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${isEditMode ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  title="Toggle God Mode"
                 >
                   <Zap className="w-3 h-3 fill-current" /> 
                   <span className="hidden sm:inline">{isEditMode ? t.nav.editing : t.nav.edit}</span>
                 </button>
               )}

               {/* Auth/Profile/Logout Group */}
               {user ? (
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleNavClick('community')}
                      className="flex items-center gap-2 text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-1.5 rounded-full hover:bg-black dark:hover:bg-gray-100 transition-colors"
                    >
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
                      title="Logout"
                    >
                       <LogOut className="w-4 h-4" /> 
                    </button>
                 </div>
               ) : (
                 <button 
                   onClick={() => setAuthModalOpen(true)}
                   className="flex items-center gap-2 text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-1.5 rounded-full hover:bg-black dark:hover:bg-gray-100 transition-colors"
                 >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.nav.login}</span>
                 </button>
               )}
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Secondary Navigation Row */}
      <div className="hidden md:block bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-16 z-40 overflow-x-auto no-scrollbar transition-colors duration-300">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 sm:gap-2 py-2 w-max sm:w-auto">
               {navItems.map((item) => {
                 const Icon = item.icon;
                 const isActive = currentView === item.id;
                 return (
                   <button
                     key={item.id}
                     onClick={() => handleNavClick(item.id as View)}
                     className={`
                       flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                       ${isActive 
                         ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md transform scale-105' 
                         : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                       }
                       ${item.isSpecial && !isActive ? 'text-albanian-red bg-red-50 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40' : ''}
                     `}
                   >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-gray-900' : item.isSpecial ? 'text-albanian-red dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      {item.label}
                   </button>
                 );
               })}
               
               {/* Admin Only Navigation Item */}
               {user?.role === 'admin' && (
                   <button
                     onClick={() => handleNavClick('admin')}
                     className={`
                       flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                       ${currentView === 'admin'
                         ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
                         : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                       }
                     `}
                   >
                      <Shield className="w-4 h-4" />
                      {t.nav.admin}
                   </button>
               )}
            </div>
         </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
           {/* Backdrop */}
           <div 
             className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
             onClick={() => setMobileMenuOpen(false)}
           ></div>
           
           {/* Drawer */}
           <div className="relative w-4/5 max-w-xs bg-white dark:bg-gray-900 h-full shadow-2xl animate-slide-in-left flex flex-col">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="bg-albanian-red text-white p-1.5 rounded-lg">
                       <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-albanian-black dark:text-white">Gegenisht</span>
                 </div>
                 <button 
                   onClick={() => setMobileMenuOpen(false)}
                   className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                 >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                 </button>
              </div>
              
              <div className="flex-grow overflow-y-auto py-4">
                 <div className="flex flex-col px-3 space-y-1">
                    {navItems.map((item) => {
                       const Icon = item.icon;
                       const isActive = currentView === item.id;
                       return (
                          <button
                             key={item.id}
                             onClick={() => handleNavClick(item.id as View)}
                             className={`
                               flex items-center gap-4 px-4 py-3 rounded-xl text-base font-bold transition-all
                               ${isActive 
                                 ? 'bg-red-50 dark:bg-red-900/20 text-albanian-red dark:text-red-400' 
                                 : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                               }
                             `}
                          >
                             <Icon className={`w-5 h-5 ${isActive ? 'text-albanian-red dark:text-red-400' : item.isSpecial ? 'text-albanian-red dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`} />
                             {item.label}
                          </button>
                       );
                    })}
                    
                    {/* Admin Mobile Link */}
                    {user?.role === 'admin' && (
                       <button
                          onClick={() => handleNavClick('admin')}
                          className={`
                            flex items-center gap-4 px-4 py-3 rounded-xl text-base font-bold transition-all
                            ${currentView === 'admin'
                              ? 'bg-indigo-600 text-white' 
                              : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                            }
                          `}
                       >
                          <Shield className="w-5 h-5" />
                          {t.nav.admin}
                       </button>
                    )}
                 </div>
              </div>

              {/* Drawer Footer Info */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-center text-gray-400 dark:text-gray-600">
                 <p>© {new Date().getFullYear()} Gegenisht Project</p>
              </div>
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* SEARCH & DICTIONARY VIEW */}
          {(currentView === 'dictionary' || currentView === 'thesaurus') && (
            <>
              {/* Header */}
              <div className="mb-12 text-center relative">
                {!searchState.data && currentView === 'dictionary' && (
                    <div className="mb-10 animate-fade-in-down">
                        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-albanian-black dark:text-white mb-4">
                           {t.hero.title_main}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                           {t.hero.subtitle_dict}
                        </p>
                    </div>
                )}
                {!searchState.data && currentView === 'thesaurus' && (
                   <div className="mb-10 animate-fade-in-down">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transform rotate-3">
                        <AlignLeft className="w-8 h-8 text-white" />
                      </div>
                      <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-4">
                        {lang === 'geg' ? 'Eksploro ' : 'Explore '}<span className="text-indigo-600 dark:text-indigo-400">Thesarin</span>
                      </h1>
                      <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        {t.hero.subtitle_thes}
                      </p>
                   </div>
                )}

                <SearchBar 
                   onSearch={handleSearch} 
                   isLoading={searchState.isLoading} 
                   lang={lang} 
                   history={searchHistory}
                />

                {isEditMode && !searchState.data && (
                    <button 
                        onClick={handleCreateEntry}
                        className="mt-4 flex items-center gap-2 mx-auto bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg animate-fade-in"
                    >
                        <PlusCircle className="w-5 h-5" />
                        {lang === 'geg' ? 'Krijo Hyrje të Re' : 'Create New Entry'}
                    </button>
                )}
              </div>

              {/* Error Message */}
              {searchState.error && (
                <div className="max-w-xl mx-auto p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-center mb-10 flex items-center justify-center gap-3">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">{searchState.error}</span>
                </div>
              )}

              {/* Search Result */}
              {searchState.data && (
                <div className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
                       <button 
                         onClick={() => setSearchState(prev => ({...prev, data: null}))}
                         className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center gap-2 font-medium"
                       >
                         ← {t.back_search}
                       </button>
                    </div>
                    {/* Pass Edit Props */}
                    <WordCard 
                      entry={searchState.data} 
                      initialTab={currentView === 'thesaurus' ? 'thesaurus' : 'definitions'} 
                      isEditing={isEditMode}
                      onUpdateEntry={handleEntryUpdate}
                      onSearch={handleSearch}
                      lang={lang}
                      onDelete={handleEntryDelete}
                    />
                    
                    {/* AD PLACEMENT: Below Word Card */}
                    {!isEditMode && <AdUnit user={user} lang={lang} className="mt-8" />}
                </div>
              )}

              {/* Dashboard only for Dictionary Home */}
              {!searchState.data && !searchState.isLoading && currentView === 'dictionary' && (
                <>
                <div className="max-w-4xl mx-auto mt-12">
                   {/* Column 1: Word of the Day */}
                   <div className="flex flex-col h-full">
                       <div className="flex items-center justify-center gap-2 mb-4">
                          <Sparkles className="text-amber-500 w-5 h-5" />
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-widest">{t.wotd}</h2>
                       </div>
                       <div className="flex-grow">
                        {wordOfTheDay.isLoading ? (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 h-full min-h-[400px] flex items-center justify-center border border-gray-100 dark:border-gray-700">
                               <div className="animate-pulse space-y-4 w-full max-w-sm">
                                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                                  <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl w-full mt-8"></div>
                                </div>
                            </div>
                        ) : wordOfTheDay.data ? (
                           // Word of the Day Card
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                               <div className="bg-albanian-black dark:bg-black p-8 text-center relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-red-500"></div>
                                  <h3 className="text-4xl font-serif font-bold text-white mb-2">{wordOfTheDay.data.word}</h3>
                                  <p className="text-gray-400 italic font-mono">/{wordOfTheDay.data.phonetic}/</p>
                                  <p className="text-albanian-red text-xs uppercase font-bold tracking-widest mt-4 bg-white/10 inline-block px-3 py-1 rounded-full">{wordOfTheDay.data.partOfSpeech}</p>
                                </div>
                                <div className="p-8 flex-grow flex flex-col justify-between">
                                  <div>
                                    <p className="text-lg text-gray-800 dark:text-gray-200 font-serif leading-relaxed mb-6 text-center">
                                        {wordOfTheDay.data.definitionEnglish}
                                    </p>
                                    <div className="space-y-3">
                                        {wordOfTheDay.data.examples.slice(0,1).map((ex, i) => (
                                            <div key={i} className="pl-4 border-l-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 italic">
                                                "{ex.original}"
                                            </div>
                                        ))}
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => setSearchState({ isLoading: false, error: null, data: wordOfTheDay.data })}
                                    className="mt-8 text-albanian-red font-bold uppercase text-sm tracking-wider hover:underline self-center"
                                  >
                                    {t.view_entry} (Edit) →
                                  </button>
                                </div>
                            </div>
                        ) : null}
                       </div>
                   </div>
                </div>
                
                {/* AD PLACEMENT: Bottom of Dashboard */}
                {!isEditMode && <AdUnit user={user} lang={lang} className="mt-12" />}
                </>
              )}

              {/* Thesaurus Dashboard */}
              {!searchState.data && !searchState.isLoading && currentView === 'thesaurus' && (
                 <ThesaurusDashboard onSearch={handleSearch} lang={lang} />
              )}
            </>
          )}

          {/* GAMES VIEW */}
          {currentView === 'games' && (
             <div className="max-w-6xl mx-auto animate-fade-in-up">
                <div className="text-center mb-10">
                   <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
                     {lang === 'geg' ? 'Palestër Gjuhësore' : 'Language Gym'}
                   </h1>
                   <p className="text-lg text-gray-500 dark:text-gray-400">
                     {lang === 'geg' ? 'Mësoni dhe luani me sfida të fuqizueme nga IA për të gjitha moshat.' : 'Learn and play with AI-powered challenges for all ages.'}
                   </p>
                </div>
                <GamesDashboard isEditing={isEditMode} lang={lang} />
             </div>
          )}

          {/* GLOSSARY VIEW */}
          {currentView === 'glossary' && (
             <GlossaryPage lang={lang} isEditing={isEditMode} />
          )}

          {/* HISTORY VIEW */}
          {currentView === 'history' && (
             <HistoryPage lang={lang} />
          )}

          {/* PODCAST VIEW */}
          {currentView === 'podcast' && (
             <PodcastPage lang={lang} user={user} />
          )}

          {/* BLOG VIEW */}
          {currentView === 'blog' && (
             <BlogPage lang={lang} isEditing={isEditMode} />
          )}
          
          {/* SUPPORT VIEW */}
          {currentView === 'support' && (
             <SupportPage 
               lang={lang} 
               user={user}
               onUpdateUser={setUser}
               onReqAuth={() => setAuthModalOpen(true)}
             />
          )}

          {/* COMMUNITY VIEW */}
          {currentView === 'community' && (
             <CommunityPage 
                lang={lang} 
                isAdmin={isEditMode || user?.role === 'admin'} 
                onAdminClick={() => handleNavClick('admin')} 
                user={user}
                onReqAuth={() => setAuthModalOpen(true)}
             />
          )}

          {/* SHOP VIEW */}
          {currentView === 'shop' && (
             <ShopPage 
               lang={lang} 
               cartItems={cartItems}
               onAddToCart={handleAddToCart}
               onRemoveFromCart={handleRemoveFromCart}
               onClearCart={handleClearCart}
             />
          )}

          {/* INTERJECTIONS VIEW */}
          {currentView === 'interjections' && (
             <InterjectionsPage lang={lang} />
          )}
          
          {/* ALPHABET VIEW */}
          {currentView === 'alphabet' && (
             <AlphabetPage lang={lang} isEditing={isEditMode} />
          )}
          
          {/* FORUM VIEW */}
          {currentView === 'forum' && (
             <ForumPage lang={lang} user={user} onReqAuth={() => setAuthModalOpen(true)} />
          )}

          {/* ADMIN DASHBOARD VIEW */}
          {currentView === 'admin' && (
             <AdminDashboard lang={lang} onBack={() => handleNavClick('community')} />
          )}

          {/* ABOUT VIEW */}
          {currentView === 'about' && (
             <div className="max-w-3xl mx-auto animate-fade-in-up">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12">
                   <h1 className="text-4xl font-serif font-bold text-albanian-black dark:text-white mb-8">{t.about_title}</h1>
                   
                   <div className="prose prose-lg text-gray-600 dark:text-gray-300 leading-relaxed space-y-6">
                      <p>
                        <strong className="text-gray-900 dark:text-white">Gegenisht</strong> {t.about_text_1.slice(10)}
                      </p>
                      {lang === 'geg' ? (
                        <p>
                           Ndërsa Shqipja Standarde âsht thelbësore për komunikimin zyrtar, âsht e randsishme me pranue origjinën e saj politike. Në vitin <strong>1972</strong>, Kongresi i Drejtshkrimit, nën drejtimin e regjimit totalitar, vendosi nji standard të unifikuem të bazuem randë në dialektin toskë. Ky akt e zhvlerësoi efektivisht Gegenishten—të folun nga shumica e shqiptarëve në Shqipninë e Veriut, Kosovë, Maqedoni të Veriut dhe Mal të Zi—tuj shtypë nji traditë të pasun letrare qi daton prej shekujsh.
                        </p>
                      ) : (
                        <p>
                          While Standard Albanian is essential for official communication, it is important to acknowledge its political origins. In <strong>1972</strong>, the Congress of Orthography, under the direction of the totalitarian regime, established a unified standard based heavily on the Tosk dialect. This act effectively demoted the Geg language—spoken by the majority of Albanians in Northern Albania, Kosovo, North Macedonia, and Montenegro—suppressing a rich literary tradition that dates back centuries.
                        </p>
                      )}
                      
                      <div className="bg-gray-50 dark:bg-gray-700/30 border-l-4 border-albanian-red p-6 my-8 rounded-r-xl">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-serif">{t.about_mission}</h3>
                         <p className="italic text-gray-700 dark:text-gray-300">{t.about_mission_text}</p>
                      </div>
                      <p>
                        {lang === 'geg' 
                         ? "Fuqizue nga Gemini AI i Google, kjo platformë gjeneron në mënyrë dinamike përkufizime, etimologji dhe shembuj, tuj siguru qi edhe fjalët e rralla ose arkaike—dikur të ndalueme ose të harrueme—të jenë të qasshme për nji audiencë moderne."
                         : "Powered by Google's Gemini AI, this platform dynamically generates definitions, etymologies, and examples, ensuring that even rare or archaic words—once banned or forgotten—are accessible to a modern audience."}
                      </p>
                   </div>
                   
                   <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-sm text-gray-400">Version 1.0.0 (Beta)</p>
                      <a href="#" className="text-albanian-red font-medium hover:underline">{t.about_contribute}</a>
                   </div>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* Enhanced Footer - Optimized for Mobile */}
      {!isEditMode && (
      <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-12 md:pb-8 transition-colors duration-300 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 lg:mb-16">
            
            {/* 1. Brand Section - Spans 2 cols on mobile for better centering */}
            <div className="col-span-2 lg:col-span-1 space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left">
               <div 
                  className="flex items-center gap-2 cursor-pointer group" 
                  onClick={() => handleNavClick('dictionary')}
               >
                  <div className="bg-albanian-red text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-serif font-bold tracking-tight text-gray-900 dark:text-white">Gegenisht</span>
               </div>
               <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                  {lang === 'geg' 
                    ? 'Nji nismë për ruajtjen, digjitalizimin dhe promovimin e gjuhës, kulturës dhe historisë Gege.' 
                    : 'An initiative to preserve, digitize, and promote the Geg language, culture, and history.'}
               </p>
               <div className="flex gap-4 pt-2">
                  <a href="#" className="p-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700 hover:border-albanian-red hover:text-albanian-red dark:hover:text-white transition-all shadow-sm">
                     <Github className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-400 dark:hover:text-white transition-all shadow-sm">
                     <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700 hover:border-pink-600 hover:text-pink-600 dark:hover:text-white transition-all shadow-sm">
                     <Instagram className="w-5 h-5" />
                  </a>
               </div>
            </div>

            {/* 2. Explore Section */}
            <div className="col-span-1">
               <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 border-l-4 border-albanian-red pl-3 text-xs">
                  {t.footer.explore}
               </h3>
               <ul className="space-y-3 md:space-y-4 text-gray-600 dark:text-gray-400">
                  <li><button onClick={() => handleNavClick('dictionary')} className="hover:text-albanian-red dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.dict}</button></li>
                  <li><button onClick={() => handleNavClick('thesaurus')} className="hover:text-albanian-red dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.thes}</button></li>
                  <li><button onClick={() => handleNavClick('alphabet')} className="hover:text-albanian-red dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.alphabet}</button></li>
                  <li><button onClick={() => handleNavClick('glossary')} className="hover:text-albanian-red dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.gloss}</button></li>
                  <li><button onClick={() => handleNavClick('interjections')} className="hover:text-albanian-red dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.interjections}</button></li>
               </ul>
            </div>

            {/* 3. Community Section */}
            <div className="col-span-1">
               <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 border-l-4 border-indigo-500 pl-3 text-xs">
                  {t.footer.community}
               </h3>
               <ul className="space-y-3 md:space-y-4 text-gray-600 dark:text-gray-400">
                  <li><button onClick={() => handleNavClick('community')} className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.community}</button></li>
                  <li><button onClick={() => handleNavClick('forum')} className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.forum}</button></li>
                  <li><button onClick={() => handleNavClick('games')} className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.games}</button></li>
                  <li><button onClick={() => handleNavClick('podcast')} className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.podcast}</button></li>
                  <li><button onClick={() => handleNavClick('blog')} className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.blog}</button></li>
               </ul>
            </div>

            {/* 4. Project Section - Spans 2 on mobile to fill gap? No, keep standard flow. */}
            <div className="col-span-2 md:col-span-1 lg:col-span-1 mt-4 md:mt-0">
               <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 border-l-4 border-emerald-500 pl-3 text-xs">
                  {t.footer.project}
               </h3>
               <ul className="space-y-3 md:space-y-4 text-gray-600 dark:text-gray-400 grid grid-cols-2 md:grid-cols-1 gap-2">
                  <li><button onClick={() => handleNavClick('about')} className="hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.about}</button></li>
                  <li><button onClick={() => handleNavClick('support')} className="hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.support}</button></li>
                  <li><button onClick={() => handleNavClick('shop')} className="hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.shop}</button></li>
                  <li><button onClick={() => handleNavClick('history')} className="hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-gray-300"/> {t.nav.hist}</button></li>
               </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="text-center md:text-left order-2 md:order-1">
                <p className="font-serif italic text-lg text-gray-900 dark:text-white mb-2">{t.footer_quote}</p>
                <p className="text-xs text-gray-400">
                   &copy; {new Date().getFullYear()} Gegenisht Project. {t.footer.rights}
                </p>
             </div>
             
             <div className="flex gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest order-1 md:order-2">
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
             </div>
          </div>
        </div>
      </footer>
      )}
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        lang={lang}
      />
    </div>
  );
};

export default App;
