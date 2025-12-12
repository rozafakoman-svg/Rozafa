import React from 'react';
import { Language } from '../App';
import { AlignLeft, Mountain, Home, Heart, CloudRain, Briefcase, Coffee, ArrowRight, Zap, RefreshCw } from './Icons';

interface ThesaurusDashboardProps {
  onSearch: (term: string) => void;
  lang: Language;
}

const CONCEPTS = [
  {
    id: 'nature',
    title: 'Nature',
    titleGeg: 'Natyra',
    words: ['Mal', 'Fushë', 'Prue', 'Drin'],
    icon: Mountain,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  },
  {
    id: 'home',
    title: 'Hearth & Home',
    titleGeg: 'Votra & Shtëpia',
    words: ['Oda', 'Votër', 'Avlli', 'Konak'],
    icon: Home,
    color: 'bg-amber-50 text-amber-600 border-amber-100'
  },
  {
    id: 'emotions',
    title: 'Emotions',
    titleGeg: 'Ndjenja',
    words: ['Mllef', 'Gëzim', 'Huti', 'Mall'],
    icon: Heart,
    color: 'bg-rose-50 text-rose-600 border-rose-100'
  },
  {
    id: 'weather',
    title: 'Weather',
    titleGeg: 'Moti',
    words: ['Shi', 'Borel', 'Murlan', 'Vapë'],
    icon: CloudRain,
    color: 'bg-blue-50 text-blue-600 border-blue-100'
  },
  {
    id: 'work',
    title: 'Daily Life',
    titleGeg: 'Jeta e Përditshme',
    words: ['Puna', 'Zakon', 'Besa', 'Fjalë'],
    icon: Briefcase,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  },
  {
    id: 'food',
    title: 'Food & Drink',
    titleGeg: 'Ushqim & Pije',
    words: ['Fli', 'Mazë', 'Raki', 'Mish'],
    icon: Coffee,
    color: 'bg-orange-50 text-orange-600 border-orange-100'
  }
];

const FLIP_CARDS = [
  { std: 'Vajzë', geg: 'Çikë / Cucë' },
  { std: 'Bëj', geg: 'Me ba' },
  { std: 'Qenë', geg: 'Me kênë' },
  { std: 'Vëlla', geg: 'Vlla' }
];

const ThesaurusDashboard: React.FC<ThesaurusDashboardProps> = ({ onSearch, lang }) => {
  const isGeg = lang === 'geg';

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-indigo-200 transform rotate-3">
          <AlignLeft className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
          {isGeg ? 'Eksploro ' : 'Explore '}<span className="text-indigo-600">Thesarin</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          {isGeg 
            ? 'Zbuloni pasuninë e fjalorit Geg përmes koncepteve dhe lidhjeve kuptimore.'
            : 'Discover the richness of Geg vocabulary through concepts and semantic connections.'}
        </p>
      </div>

      {/* Concept Clusters */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {CONCEPTS.map((concept) => {
          const Icon = concept.icon;
          return (
            <div 
              key={concept.id}
              className={`rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group bg-white ${concept.color.replace('bg-', 'hover:bg-opacity-50 ')} border-gray-100`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${concept.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <Zap className="w-4 h-4 text-gray-300 group-hover:text-yellow-400 transition-colors" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {isGeg ? concept.titleGeg : concept.title}
              </h3>

              <div className="flex flex-wrap gap-2">
                {concept.words.map((word) => (
                  <button
                    key={word}
                    onClick={() => onSearch(word)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Flip Section */}
      <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div>
              <h2 className="text-2xl font-bold font-serif mb-2">
                {isGeg ? 'Standard vs Geg' : 'Standard vs Geg'}
              </h2>
              <p className="text-gray-400">
                {isGeg ? 'Krahasoni format dhe gjeni nuancat.' : 'Compare forms and find the nuances.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-300">
              <RefreshCw className="w-4 h-4" /> {isGeg ? 'Kalo mbi kartë' : 'Hover to flip'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FLIP_CARDS.map((pair, idx) => (
              <div key={idx} className="group h-32 perspective-1000 cursor-pointer">
                <div className="relative w-full h-full transition-transform duration-500 transform-style-3d group-hover:rotate-y-180">
                  {/* Front */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col items-center justify-center backface-hidden p-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Standard</span>
                    <span className="text-xl font-bold text-white">{pair.std}</span>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center backface-hidden rotate-y-180 p-4 border border-indigo-400 shadow-lg shadow-indigo-900/50">
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Geg</span>
                    <span className="text-xl font-bold text-white">{pair.geg}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSearch(pair.geg.split('/')[0].trim()); }}
                      className="mt-2 text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white flex items-center gap-1 transition-colors"
                    >
                      {isGeg ? 'Shiko' : 'View'} <ArrowRight className="w-2 h-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThesaurusDashboard;