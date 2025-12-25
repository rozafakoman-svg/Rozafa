
import React, { useState } from 'react';
import { Language } from '../types';
// Added Sparkles to the imported icons to fix the "Cannot find name 'Sparkles'" error
import { QuestionMark, ChevronDown, BookOpen, Zap, Shield, Globe, MessageSquare, ArrowRight, Star, Anchor, Sparkles } from './Icons';

interface FAQItem {
  id: string;
  category: 'general' | 'linguistic' | 'technical' | 'research';
  qEng: string;
  qGeg: string;
  aEng: string;
  aGeg: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'diphthong_pronunciation',
    category: 'research',
    qEng: "How do I pronounce 'ue' and 'ie' in authentic Geg?",
    qGeg: "Si shqiptohen 'ue' dhe 'ie' në Gegënishten e vërtetë?",
    aEng: "A core rule of Geg phonology is that in diphthongs like 'ue' and 'ie', only the first letter is sounded, but it is elongated. For example, 'me punue' sounds like /pu'nu:/ (a long U), and 'dielli' sounds like /'di:lli/ (a long I). The second letter acts as a tonal 'ghost' that gives the sound its unique Geg character.",
    aGeg: "Nji rregull thelbësor i fonetikës Gege âsht qi te diftongjet si 'ue' dhe 'ie', ndigjohet veç shkronja e parë, por ajo shqiptohet ma e zgjatun. Për shembull, 'me punue' ndigjohet si /u:/ e gjatë, dhe 'dielli' si /i:/ e gjatë. Shkronja e dytë âsht si nji 'hije' qi i jep zânit ngjyrën tonë karakteristike."
  },
  {
    id: 'phonetic_notation',
    category: 'research',
    qEng: "What does the colon (:) in the phonetic spelling mean?",
    qGeg: "Çka domethanë pikat (:) te shqiptimi në fjalor?",
    aEng: "In our dictionary, the colon (:) follows a vowel to indicate that it is a 'Long Vowel'. Because Geg diphthongs rely on elongation rather than sounding both vowels, we use this standard linguistic notation to help you achieve an authentic northern accent.",
    aGeg: "Në fjalorin tonë, pikat (:) pas nji zanoreje tregojnë se ajo âsht 'Zanore e Gjatë'. Meqë diftongjet tona mbështeten te zgjatja e zânit, na përdorim këtë shënim gjuhësor për me ju ndihmue me kapë theksin e saktë të malësisë."
  },
  {
    id: 'what_is_geg',
    category: 'linguistic',
    qEng: "What is the Geg Language?",
    qGeg: "Çka asht Gjuha Gege?",
    aEng: "Geg (Gegërisht) is one of the two primary varieties of the Albanian language, historically spoken north of the Shkumbin river. It is characterized by its rich phonology, including nasal vowels, and its distinct infinitive form (me + verb).",
    aGeg: "Gegënishtja âsht nji prej dy varianteve kryesore t'gjuhës shqipe, qi historikisht flitet n'veri t'lumit Shkumbin. Ajo dallohet për fonetikën e pasun, tuj përfshî zanoret hundore dhe trajten karakteristike t'paskajores (me + folje)."
  },
  {
    id: 'dialect_vs_language',
    category: 'linguistic',
    qEng: "Is Geg a dialect or a language?",
    qGeg: "A asht Gegënishtja dialekt apo gjuhë?",
    aEng: "While often classified as a dialect in modern political contexts, linguistically Geg functions as a complete and autonomous language system with its own literary tradition spanning centuries. This app treats it with the prestige of a distinct variety.",
    aGeg: "Ndonëse shpesh klasifikohet si dialekt n'kontekste politike, gjuhësisht Gegënishtja funksionon si nji sistem i plotë dhe autonom me nji traditë letrare shekullore. Ky aplikacion e trajton atë me prestigjin e nji varianti t'veçantë."
  },
  {
    id: 'who_is_bace',
    category: 'general',
    qEng: "Who is 'Bacë' in the AI tutor?",
    qGeg: "Kush asht 'Baca' n'tutorin e Inteligjencës?",
    aEng: "'Bacë' is a traditional title of respect for an elder or wise male in the Geg community. Our AI tutor adopts this persona to provide a culturally authentic learning experience, blending ancient wisdom with modern technology.",
    aGeg: "'Bac' âsht nji titull tradicional i nderit për nji burrë t'urtë apo ma t'vjetër n'bashkësinë Gege. Inteligjenca jonë artificiale e merr këtë personazh për me ofrue nji përvojë mësimi autentike, tuj ndërthurë urtinë e vjetër me teknologjinë moderne."
  },
  {
    id: 'offline_mode',
    category: 'technical',
    qEng: "Does the app work offline?",
    qGeg: "A punon aplikacioni pa internet (offline)?",
    aEng: "Yes! The app uses local storage (IndexedDB) to cache dictionary entries and glossary terms. Once you look up a word or sync the library, it remains accessible even without a connection.",
    aGeg: "Po! Aplikacioni përdor memorien lokale (IndexedDB) për me i ruajtë fjalët e fjalorit. Pasi ta keni kërkue nji fjalë apo ta keni sinkronizue librarinë, ajo mbetet e qasshme edhe pa internet."
  }
];

const FAQPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const isGeg = lang === 'geg';

  const toggle = (id: string) => setOpenId(openId === id ? null : id);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-24 px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-28 h-28 bg-white dark:bg-gray-900 rounded-[3rem] mb-8 shadow-2xl border-4 border-gray-50 dark:border-gray-800">
           <QuestionMark className="w-16 h-16 text-albanian-red" />
        </div>
        <h1 className="text-4xl sm:text-7xl font-serif font-black text-gray-900 dark:text-white mb-4 tracking-tight text-center">
           {isGeg ? 'Pyetjet e ' : 'Common '}<span className="text-albanian-red">Shpeshta</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed text-center">
            {isGeg 
              ? 'Gjeni përgjigje rreth gjuhës, teknologjisë dhe kërkimeve tona fonetike.' 
              : 'Find answers about the language, technology, and our phonetic research.'}
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_DATA.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white dark:bg-gray-900 rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${openId === item.id ? 'border-indigo-200 ring-4 ring-indigo-50 shadow-xl dark:ring-indigo-900/10' : 'border-gray-100 dark:border-gray-800 shadow-sm'}`}
          >
            <button 
              onClick={() => toggle(item.id)}
              className="w-full p-6 sm:p-8 flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-colors ${openId === item.id ? 'bg-indigo-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-indigo-600'}`}>
                  {item.category === 'research' && <Sparkles className="w-5 h-5" />}
                  {item.category === 'linguistic' && <BookOpen className="w-5 h-5" />}
                  {item.category === 'technical' && <Zap className="w-5 h-5" />}
                  {item.category === 'general' && <Globe className="w-5 h-5" />}
                </div>
                <div>
                   {item.category === 'research' && (
                     <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] block mb-1">New Linguistic Insight</span>
                   )}
                   <span className={`text-lg sm:text-xl font-bold font-serif ${openId === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                     {isGeg ? item.qGeg : item.qEng}
                   </span>
                </div>
              </div>
              <ChevronDown className={`w-6 h-6 text-gray-300 transition-transform duration-300 ${openId === item.id ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>
            
            <div className={`transition-all duration-500 ease-in-out ${openId === item.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <div className="px-8 pb-8 sm:px-12 sm:pb-12 border-t border-gray-50 dark:border-gray-800 pt-6">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {isGeg ? item.aGeg : item.aEng}
                </p>
                <div className="mt-8 flex items-center gap-4">
                   <div className="h-px bg-gray-100 dark:bg-gray-800 flex-grow"></div>
                   <button className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:underline flex items-center gap-2">
                     Learn More <ArrowRight className="w-3 h-3" />
                   </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 bg-indigo-600 rounded-[3rem] p-10 sm:p-16 text-white text-center relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
         <div className="relative z-10">
            <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl sm:text-5xl font-serif font-black mb-4">{isGeg ? 'Keni pyetje tjetër?' : 'Have more questions?'}</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-lg mx-auto">
               {isGeg ? 'Bashkohuni n\'forum ose na shkruani direkt n\'arkivë.' : 'Join the forum or message us directly in the archive.'}
            </p>
            <button className="px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl hover:scale-[1.02] active:scale-95">
               {isGeg ? 'Hap Forumin' : 'Go to Forum'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default FAQPage;
