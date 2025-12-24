
import React, { useState } from 'react';
import { Language } from '../types';
import { 
  AlignLeft, Mountain, Home, Heart, CloudRain, Briefcase, Coffee, 
  ArrowRight, Zap, RefreshCw, Star, Anchor, Flame, Users, Book, 
  Search, Info, GitCompare
} from './Icons';

interface ThesaurusDashboardProps {
  onSearch: (term: string) => void;
  lang: Language;
}

const CONCEPTS = [
  {
    id: 'nature',
    title: 'Nature',
    titleGeg: 'Natyra',
    words: ['Mal', 'Fushë', 'Prue', 'Drin', 'Bjeshkë', 'Rranxë', 'Krue'],
    icon: Mountain,
    color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
  },
  {
    id: 'home',
    title: 'Hearth & Home',
    titleGeg: 'Votra & Shtëpia',
    words: ['Oda', 'Votër', 'Avlli', 'Konak', 'Çardak', 'Kullë', 'Prag'],
    icon: Home,
    color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800'
  },
  {
    id: 'emotions',
    title: 'Emotions',
    titleGeg: 'Ndjenja',
    words: ['Mllef', 'Gëzim', 'Huti', 'Mall', 'Dhimtë', 'Idhnim', 'Bujari'],
    icon: Heart,
    color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'
  },
  {
    id: 'weather',
    title: 'Weather',
    titleGeg: 'Moti',
    words: ['Shi', 'Borel', 'Murlan', 'Vapë', 'Breshën', 'Cung', 'Gjallni'],
    icon: CloudRain,
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
  },
  {
    id: 'work',
    title: 'Daily Life',
    titleGeg: 'Jeta e Përditshme',
    words: ['Puna', 'Zakon', 'Besa', 'Fjalë', 'Burrni', 'Nder', 'Garixh'],
    icon: Briefcase,
    color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800'
  },
  {
    id: 'food',
    title: 'Food & Drink',
    titleGeg: 'Ushqim & Pije',
    words: ['Fli', 'Mazë', 'Raki', 'Mish', 'Bukë', 'Tamël', 'Sallatë'],
    icon: Coffee,
    color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800'
  },
  {
      id: 'spirit',
      title: 'Spirit & Myth',
      titleGeg: 'Shpirti & Mitet',
      words: ['Zana', 'Dragua', 'Kulshedër', 'Hije', 'Shtrigë', 'Ora'],
      icon: Flame,
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800'
  },
  {
      id: 'community',
      title: 'Kinship',
      titleGeg: 'Fis e Farefis',
      words: ['Fis', 'Vlla', 'Motër', 'Gjak', 'Djalë', 'Çikë', 'Kushri'],
      icon: Users,
      color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800'
  },
  {
      id: 'scholar',
      title: 'Literature',
      titleGeg: 'Letërsia',
      words: ['Lahutë', 'Kangë', 'Përrallë', 'Rresht', 'Kujtim', 'Varg'],
      icon: Book,
      color: 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'
  }
];

const FLIP_CARDS = [
  { std: 'Vajzë', geg: 'Çikë / Cucë' },
  { std: 'Me bërë', geg: 'Me ba' },
  { std: 'Me qenë', geg: 'Me kênë' },
  { std: 'Vëlla', geg: 'Vlla' },
  { std: 'Shtëpi', geg: 'Shpi' },
  { std: 'Nënë', geg: 'Nanë' },
  { std: 'Këmbë', geg: 'Kambë' },
  { std: 'Zë', geg: 'Zô' }
];

const ThesaurusDashboard: React.FC<ThesaurusDashboardProps> = ({ onSearch, lang }) => {
  const [localQuery, setLocalQuery] = useState('');
  const isGeg = lang === 'geg';

  const handleLocalSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (localQuery.trim()) onSearch(localQuery.trim());
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      {/* Semantic Search Area */}
      <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleLocalSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <GitCompare className="w-5 h-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input 
                value={localQuery}
                onChange={e => setLocalQuery(e.target.value)}
                placeholder={isGeg ? "Kërko sinonime..." : "Find synonyms..."}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg focus:border-indigo-500 outline-none transition-all dark:text-white"
              />
              <button className="absolute inset-y-2 right-2 px-4 bg-indigo-600 text-white rounded-xl font-bold text-sm">
                  {isGeg ? 'Gjej' : 'Find'}
              </button>
          </form>
      </div>

      {/* Clusters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {CONCEPTS.map((concept) => {
          const Icon = concept.icon;
          return (
            <div 
              key={concept.id}
              className={`rounded-[32px] p-8 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group bg-white dark:bg-gray-800 ${concept.color.replace('bg-', 'hover:bg-opacity-70 ')} flex flex-col items-center text-center`}
            >
              <div className="flex items-center justify-between mb-6 w-full">
                <div className="flex-1"></div>
                <div className={`p-4 rounded-2xl ${concept.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1 flex justify-end">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-300 uppercase">{concept.words.length} items</span>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 font-serif">
                {isGeg ? concept.titleGeg : concept.title}
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {concept.words.map((word) => (
                  <button
                    key={word}
                    onClick={() => onSearch(word)}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all hover:shadow-md active:scale-95"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Flip Cards Section */}
      <div className="bg-slate-900 dark:bg-black rounded-[40px] p-8 sm:p-16 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[150px] opacity-10 -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[120px] opacity-10 -ml-32 -mb-32"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-16">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-indigo-500/30">
                 <Anchor className="w-3 h-3" /> Linguistic Bridge
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold font-serif mb-6 text-white leading-tight text-center lg:text-left">
                {isGeg ? "Standardi '72 kundrejt Gegënishtes" : "Standard '72 vs. Gegënisht"}
              </h2>
              <p className="text-indigo-100/60 text-lg leading-relaxed text-center lg:text-left">
                {isGeg 
                  ? "Gjurmoni ndryshimet fonetike dhe leksikore qi u imponuen në vitin 1972. Rrotulloni kartat për me zbulue format autentike të popullit Geg, tuj përfshi paskajoren karakteristike me 'me'." 
                  : "Track the phonetic and lexical shifts imposed in 1972. Flip the cards to rediscover the authentic forms of the Geg people, including the characteristic 'me' infinitive."}
              </p>
            </div>
            <div className="flex-shrink-0">
               <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col items-center">
                  <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin-slow mb-3" />
                  <span className="text-xs font-black uppercase tracking-tighter text-indigo-200">Interactive Map</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FLIP_CARDS.map((pair, idx) => (
              <div key={idx} className="group h-40 perspective-1000 cursor-pointer">
                <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180">
                  {/* Front Side: Standard */}
                  <div className="absolute inset-0 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col items-center justify-center backface-hidden p-6 shadow-inner">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-3 opacity-60">Standard '72</span>
                    <span className="text-2xl font-bold text-white tracking-tight">{pair.std}</span>
                  </div>
                  {/* Back Side: Geg */}
                  <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-700 rounded-3xl flex flex-col items-center justify-center backface-hidden rotate-y-180 p-6 border border-indigo-400 dark:border-indigo-600 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]">
                    <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-3">Authentic Geg</span>
                    <span className="text-2xl font-black text-white mb-4 tracking-tight">{pair.geg}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSearch(pair.geg.split('/')[0].trim()); }}
                      className="group/btn bg-white/20 hover:bg-white text-white hover:text-indigo-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                    >
                      {isGeg ? 'Analizo' : 'Explore'} <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
              <Info className="w-12 h-12 text-indigo-400 flex-shrink-0" />
              <p className="text-sm leading-relaxed max-w-4xl text-center md:text-left">
                  {isGeg 
                    ? "Për Gegët, paskajorja fillon me 'me' (me shkue, me ba). Standardizimi i vitit 1972 u mundue me e zhdukë këtë formë tuj imponue trajta të tjera. Na po e kthejmë në qendër të vëmendjes për me ruajtë shpirtin e gjuhës."
                    : "For the Geg people, the infinitive begins with 'me' (to go, to do). The 1972 standardization tried to eliminate this form by imposing other structures. We are bringing it back to the forefront to preserve the spirit of the language."}
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThesaurusDashboard;
