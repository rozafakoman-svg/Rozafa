
import React, { useState, useEffect, useRef } from 'react';
import { DictionaryEntry, ContributionType, ExampleSentence } from '../types';
import { Volume2, BookOpen, Share2, ArrowRight, AlignLeft, Globe, Info, Sparkles, Loader2, X, Upload, Mic, Flag, Edit3, Trash2, PlusCircle, CheckCircle, Save, Star, AlertTriangle } from './Icons';
import { fetchWordDefinition, saveToDictionaryCache } from '../services/geminiService';

interface WordCardProps {
  entry: DictionaryEntry;
  initialTab?: 'definitions' | 'thesaurus' | 'examples' | 'phrases';
  isEditing?: boolean;
  onUpdateEntry?: (entry: DictionaryEntry) => void;
  onSaveEntry?: (entry: DictionaryEntry) => void; 
  onSearch?: (term: string) => void; 
  onDelete?: () => void;
  lang: 'geg' | 'eng';
}

type TabType = 'definitions' | 'thesaurus' | 'examples' | 'phrases';

const translations = {
  eng: {
    tabs: { definitions: "Definitions", thesaurus: "Thesaurus", examples: "Examples", phrases: "Phrases" },
    pronunciation: "Pronunciation",
    share: "Share",
    copied: "Copied!",
    def_eng: "English Meaning",
    std_alb: "Standard Albanian Equivalent",
    etymology: "Roots & Origin",
    synonyms: "Synonyms",
    antonyms: "Antonyms",
    related: "Related Words",
    sentences: "Example Usage",
    phrases_title: "Idioms & Expressions",
    no_syn: "None recorded.",
    standard_label: "Standard '72",
    translation_label: "English"
  },
  geg: {
    tabs: { definitions: "Kuptime", thesaurus: "Thesar", examples: "Shembuj", phrases: "Shprehje" },
    pronunciation: "Shqiptimi",
    share: "Shpërnda",
    copied: "U kopjue!",
    def_eng: "Kuptimi Anglisht",
    std_alb: "Standardi i 1972-shit",
    etymology: "Prejardhja",
    synonyms: "Sinonime",
    antonyms: "Antonime",
    related: "Fjalë të Afërta",
    sentences: "Shembuj Fjalish",
    phrases_title: "Idioma & Shprehje",
    no_syn: "S'ka shënime.",
    standard_label: "Standardi",
    translation_label: "Përkthimi"
  }
};

const WordCard: React.FC<WordCardProps> = ({ entry, initialTab = 'definitions', isEditing = false, onUpdateEntry, onSaveEntry, onSearch, onDelete, lang }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const t = translations[lang];
  const isGeg = lang === 'geg';

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setSaveSuccess(false);
    setSaveError(false);
  }, [entry?.word]);

  useEffect(() => {
    setHasSpeechSupport(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const handleSpeak = (text: string) => {
    if (hasSpeechSupport && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sq-AL'; 
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUpdate = (field: keyof DictionaryEntry, value: any) => {
    if (onUpdateEntry && entry) {
      onUpdateEntry({ ...entry, [field]: value });
    }
  };

  const handleTermClick = (term: string) => {
    if (onSearch) {
      onSearch(term);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async () => {
      setIsSaving(true);
      setSaveError(false);
      try {
          if (onSaveEntry) {
              await onSaveEntry(entry);
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 3000);
          }
      } catch (e) {
          console.error("Save failure in component:", e);
          setSaveError(true);
          setTimeout(() => setSaveError(false), 5000);
      } finally {
          setIsSaving(false);
      }
  };

  if (!entry) return null;

  return (
    <div className={`w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border transition-all duration-500 ${isEditing ? 'border-red-500 ring-4 ring-red-500/10' : 'border-gray-100 dark:border-gray-800'}`}>
      <div className="p-10 pb-2 sm:p-16 sm:pb-4 text-center">
        <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3 w-full">
              {isEditing ? (
                  <input 
                    value={entry.word}
                    onChange={(e) => handleUpdate('word', e.target.value)}
                    className="text-5xl sm:text-7xl font-serif font-black text-gray-900 dark:text-white tracking-tighter border-b-4 border-red-200 dark:border-red-900 focus:border-red-500 outline-none bg-red-50/20 dark:bg-red-900/10 rounded-2xl px-4 py-2 w-full max-w-xl text-center"
                  />
              ) : (
                  <h1 className="text-5xl sm:text-7xl font-serif font-black text-gray-900 dark:text-white tracking-tighter">{entry.word}</h1>
              )}
              
              {isEditing ? (
                 <input 
                   value={entry.partOfSpeech}
                   onChange={(e) => handleUpdate('partOfSpeech', e.target.value)}
                   className="text-xl text-gray-500 font-serif italic border-b-2 border-red-200 dark:border-red-900 focus:border-red-500 outline-none bg-red-50/20 rounded-xl px-4 text-center"
                 />
              ) : (
                 <span className="text-2xl text-gray-400 dark:text-gray-500 font-serif italic font-light">
                    {entry.partOfSpeech}
                 </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-inner group">
                    {hasSpeechSupport && (
                        <button 
                            onClick={() => handleSpeak(entry.word)}
                            className="p-3 rounded-2xl bg-albanian-red text-white hover:bg-red-800 transition-all shadow-lg active:scale-95"
                        >
                            <Volume2 className="w-6 h-6" />
                        </button>
                    )}
                    <div className="flex flex-col items-start pr-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">{t.pronunciation}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-mono text-gray-800 dark:text-gray-200 font-bold">/{entry.phonetic}/</span>
                            <Info className="w-4 h-4 text-gray-300 dark:text-gray-600 hover:text-indigo-500 cursor-help" />
                        </div>
                    </div>
                </div>

                <button 
                    className="p-4 rounded-3xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-all shadow-sm active:scale-95"
                    onClick={() => {
                        navigator.clipboard.writeText(`${entry.word} - ${entry.definitionEnglish}`);
                        alert(t.copied);
                    }}
                >
                    <Share2 className="w-6 h-6" />
                </button>
            </div>
        </div>
      </div>
      
      {/* Tabs Design Refinement */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-8 sm:px-16 overflow-x-auto no-scrollbar justify-center">
        {[
          { id: 'definitions', icon: BookOpen, label: t.tabs.definitions, color: 'text-albanian-red border-albanian-red' },
          { id: 'thesaurus', icon: AlignLeft, label: t.tabs.thesaurus, color: 'text-amber-600 border-amber-600' },
          { id: 'examples', icon: Globe, label: t.tabs.examples, color: 'text-blue-600 border-blue-600' },
          { id: 'phrases', icon: Sparkles, label: t.tabs.phrases, color: 'text-purple-600 border-purple-600' }
        ].map((tab) => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-5 px-6 font-black text-[10px] uppercase tracking-[0.25em] border-b-2 transition-all whitespace-nowrap flex items-center gap-2.5 ${activeTab === tab.id ? tab.color : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
                <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
        ))}
      </div>

      <div className="p-10 sm:p-20 min-h-[450px]">
        {activeTab === 'definitions' && (
          <div className="space-y-16 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-12 sm:gap-20">
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t.def_eng}</h3>
                {isEditing ? (
                  <textarea 
                    value={entry.definitionEnglish}
                    onChange={(e) => handleUpdate('definitionEnglish', e.target.value)}
                    className="w-full p-4 border rounded-2xl dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xl font-serif min-h-[150px]"
                  />
                ) : (
                  <p className="text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 leading-snug font-serif">{entry.definitionEnglish}</p>
                )}
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t.std_alb}</h3>
                {isEditing ? (
                  <textarea 
                    value={entry.definitionStandard}
                    onChange={(e) => handleUpdate('definitionStandard', e.target.value)}
                    className="w-full p-4 border rounded-2xl dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xl font-serif min-h-[150px]"
                  />
                ) : (
                  <p className="text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 leading-snug font-serif italic text-albanian-red dark:text-red-400">"{entry.definitionStandard}"</p>
                )}
              </div>
            </div>

            <div className="pt-12 border-t border-gray-50 dark:border-gray-800 flex flex-col items-center">
               <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> {t.etymology}
               </div>
               {isEditing ? (
                  <textarea 
                    value={entry.etymology}
                    onChange={(e) => handleUpdate('etymology', e.target.value)}
                    className="w-full p-6 border rounded-2xl dark:bg-gray-800 dark:border-gray-700 dark:text-white text-lg font-serif min-h-[180px] text-center"
                  />
                ) : (
                  <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed italic max-w-3xl text-center font-serif">
                      {entry.etymology}
                  </p>
                )}
            </div>
          </div>
        )}
        
        {activeTab === 'thesaurus' && (
          <div className="space-y-16 animate-fade-in">
             <div className="space-y-6">
                <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] text-center">{t.synonyms}</h3>
                <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
                    {entry.synonyms && entry.synonyms.length > 0 ? entry.synonyms.map((syn, i) => (
                    <button key={i} onClick={() => handleTermClick(syn)} className="px-6 py-3 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800 rounded-2xl font-bold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all hover:-translate-y-1">
                        {syn}
                    </button>
                    )) : <span className="text-gray-400 italic text-sm">{t.no_syn}</span>}
                </div>
             </div>

             {(isEditing || (entry.relatedWords && entry.relatedWords.length > 0)) && (
                  <div className="pt-10 border-t border-gray-50 dark:border-gray-800">
                      <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] text-center mb-8">{t.related}</h3>
                      <div className="flex flex-wrap gap-4 justify-center">
                          {entry.relatedWords?.map((word, i) => (
                              <button key={i} onClick={() => handleTermClick(word)} className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all active:scale-95">
                                  {word}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
             <div className="flex flex-col items-center mb-4">
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">{t.sentences}</h3>
             </div>
             
             {entry.examples && entry.examples.length > 0 ? (
                <div className="space-y-8">
                   {entry.examples.map((ex, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-800/40 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 relative group text-center shadow-inner">
                         <div className="space-y-8">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.3em] block">{lang === 'geg' ? 'Gegenisht' : 'Geg Original'}</label>
                               <p className="text-2xl sm:text-3xl font-serif italic text-gray-900 dark:text-white leading-tight">"{ex.original}"</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-10 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                               <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-blue-400 tracking-[0.2em] block">{t.standard_label}</label>
                                  <p className="text-base text-gray-600 dark:text-gray-400 font-medium">{ex.standard}</p>
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-emerald-500 tracking-[0.2em] block">{t.translation_label}</label>
                                  <p className="text-base text-gray-600 dark:text-gray-400 font-medium">{ex.translation}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                   <Globe className="w-16 h-16 mx-auto mb-6 opacity-10" />
                   <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'geg' ? 'S\'ka shembuj' : 'No Examples Found'}</p>
                </div>
             )}
          </div>
        )}

        {activeTab === 'phrases' && (
          <div className="space-y-12 animate-fade-in text-center max-w-4xl mx-auto">
             <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.4em]">{t.phrases_title}</h3>
             
             {entry.relatedPhrases && entry.relatedPhrases.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                    {entry.relatedPhrases.map((phrase, i) => (
                        <div key={i} className="p-6 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 rounded-3xl flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
                            <span className="font-serif italic text-lg text-purple-900 dark:text-purple-100 text-center flex-grow">{phrase}</span>
                            <button onClick={() => handleTermClick(phrase)} className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm text-purple-600 hover:scale-110 transition-transform"><ArrowRight className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                    <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-10" />
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'geg' ? 'S\'ka shprehje' : 'No Phrases Found'}</p>
                </div>
            )}
          </div>
        )}
      </div>

      {isEditing && (
          <div className="sticky bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-red-100 dark:border-red-900 p-6 flex flex-col items-center z-20">
              {saveError && (
                  <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-100 animate-fade-in">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Sync Failed: Check Supabase Permissions</span>
                  </div>
              )}
              <div className="w-full flex items-center justify-end">
                <button onClick={handleSave} disabled={isSaving} className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 ${saveSuccess ? 'bg-emerald-600' : saveError ? 'bg-red-600' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircle className="w-5 h-5" /> : saveError ? <AlertTriangle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Syncing...' : saveSuccess ? 'Cloud Vault Synced' : saveError ? 'Retry Sync' : 'Deploy Changes to Node'}
                </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default WordCard;
