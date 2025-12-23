import React, { useState, useEffect, useRef } from 'react';
import { DictionaryEntry, ContributionType, ExampleSentence } from '../types';
import { Volume2, BookOpen, Share2, ArrowRight, AlignLeft, Globe, GraduationCap, Info, HelpCircle, MapPin, Repeat, MessageCircle, Image, Sparkles, Loader2, GitCompare, X, ShieldAlert, Upload, Mic, PlayCircle, PauseCircle, Flag, Edit3, Headphones, Download, Trash2, PlusCircle, CheckCircle, Save, Zap, RefreshCw, BarChart3, Activity } from './Icons';
import { fetchEtymologyImage, fetchWordDefinition, saveToDictionaryCache } from '../services/geminiService';
import ContributionModal from './ContributionModal';

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
    tabs: { definitions: "Definitions", thesaurus: "Thesaurus", examples: "Examples & Context", phrases: "Related Phrases" },
    pronunciation: "Pronunciation",
    compare: "Compare",
    exit_compare: "Exit Comparison",
    share: "Share",
    copied: "Copied!",
    comp_mode: "Comparison Mode",
    original: "Original",
    def_eng: "Definition (English)",
    std_alb: "The Standard of 1972",
    etymology: "Etymology",
    frequency: "Linguistic Vitality",
    freq_common: "Core Vocabulary",
    freq_uncommon: "Functional / Occasional",
    freq_rare: "Archaic / Heritage",
    usage_profile: "Usage Profile",
    grammar: "Grammar Notes",
    region: "Region",
    culture: "Cultural Context",
    synonyms: "Synonyms",
    antonyms: "Antonyms",
    related: "Related Words",
    vis_origin: "Visualize Origin",
    visualizing: "Visualizing...",
    sentences: "Sentence Examples",
    phrases_title: "Common Phrases & Idioms",
    no_syn: "No synonyms found.",
    no_ant: "No antonyms found.",
    no_rel: "No related words found.",
    no_ex: "No examples available for this entry.",
    no_phrases: "No related phrases found for this entry.",
    std_imposed: "Imposed in 1972",
    std_desc: "The Unified Standard was established in 1972 by the Congress of Orthography, largely based on Tosk, suppressing the Geg people's literary tradition.",
    upload_audio: "Upload Audio",
    replace_audio: "Replace",
    custom_rec: "Custom Recording",
    report_issue: "Report Issue",
    suggest_edit: "Suggest Edit",
    pronunciation_guide: "Pronunciation Guide",
    listen: "Listen",
    phonetic_transcription: "Phonetic Transcription",
    delete: "Delete Entry",
    pron_note: "Pronunciation Note",
    ipa_guide: "IPA Guide",
    standard_label: "Std. Albanian",
    translation_label: "English"
  },
  geg: {
    tabs: { definitions: "Kuptime", thesaurus: "Thesar", examples: "Shembuj & Kontekst", phrases: "Shprehje" },
    pronunciation: "Shqiptimi",
    compare: "Krahaso",
    exit_compare: "Dil prej Krahasimit",
    share: "Shpërnda",
    copied: "U kopjue!",
    comp_mode: "Mënyra e Krahasimit",
    original: "Origjinali",
    def_eng: "Kuptimi (Anglisht)",
    std_alb: "Standardi i 1972-shit",
    etymology: "Prejardhja",
    frequency: "Gjallnia Gjuhësore",
    freq_common: "Fjalor Thelbësor",
    freq_uncommon: "Funksionale / Rastësore",
    freq_rare: "Arkaike / Trashëgimi",
    usage_profile: "Profili i Përdorimit",
    grammar: "Shënime Gramatikore",
    region: "Krahina",
    culture: "Kontekst Kulturor",
    synonyms: "Sinonime",
    antonyms: "Antonime",
    related: "Fjalë të Përafërta",
    vis_origin: "Vizualizo Origjinën",
    visualizing: "Tuj gjenerue...",
    sentences: "Shembuj Fjalish",
    phrases_title: "Shprehje të Zakonshme & Idioma",
    no_syn: "S'u gjetën sinonime.",
    no_ant: "S'u gjetën antonime.",
    no_rel: "S'u gjetën fjalë të përafërta.",
    no_ex: "S'ka shembuj për këtë fjalë.",
    no_phrases: "S'u gjetën shprehje për këtë fjalë.",
    std_imposed: "Imponue në 1972",
    std_desc: "Standardi i Unifikuem u vendos në vitin 1972 nga Kongresi i Drejtshkrimit, bazuem kryesisht në toskërisht, tuj shtypë traditën letrare të popullit Geg.",
    upload_audio: "Ngarko Zânin",
    replace_audio: "Ndrysho",
    custom_rec: "Inçizim Vetjak",
    report_issue: "Raporto Gabim",
    suggest_edit: "Sugjero Ndryshim",
    pronunciation_guide: "Udhëzues Shqiptimi",
    listen: "Ndëgjo",
    phonetic_transcription: "Transkriptimi Fonetik",
    delete: "Fshi Fjalën",
    pron_note: "Shënime mbi Shqiptimin",
    ipa_guide: "Udhëzuesi IPA",
    standard_label: "Standardi",
    translation_label: "Përkthimi"
  }
};

const WordCard: React.FC<WordCardProps> = ({ entry, initialTab = 'definitions', isEditing = false, onUpdateEntry, onSaveEntry, onSearch, onDelete, lang }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [etymologyImage, setEtymologyImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const [isPlayingCustom, setIsPlayingCustom] = useState(false);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [contributionType, setContributionType] = useState<ContributionType>('report_error');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const t = translations[lang];
  const isGeg = lang === 'geg';

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setEtymologyImage(entry?.etymologyImage || null);
    setIsGeneratingImage(false);
    setIsPlayingCustom(false);
    setSaveSuccess(false);
  }, [entry?.word, entry?.etymologyImage]);

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

  const updateStringArray = (field: keyof DictionaryEntry, idx: number, value: string) => {
    const arr = (entry[field] as string[]) || [];
    const newArr = [...arr];
    newArr[idx] = value;
    handleUpdate(field, newArr);
  };

  const addToStringArray = (field: keyof DictionaryEntry) => {
    const arr = (entry[field] as string[]) || [];
    handleUpdate(field, [...arr, '']);
  };

  const removeFromStringArray = (field: keyof DictionaryEntry, idx: number) => {
    const arr = (entry[field] as string[]) || [];
    handleUpdate(field, arr.filter((_, i) => i !== idx));
  };

  const updateExample = (idx: number, field: keyof ExampleSentence, value: string) => {
    if (!entry.examples) return;
    const newExamples = [...entry.examples];
    newExamples[idx] = { ...newExamples[idx], [field]: value };
    handleUpdate('examples', newExamples);
  };

  const addExample = () => {
    const newExamples = [...(entry.examples || []), { original: '', standard: '', translation: '' }];
    handleUpdate('examples', newExamples);
  };

  const removeExample = (idx: number) => {
    if (!entry.examples) return;
    const newExamples = entry.examples.filter((_, i) => i !== idx);
    handleUpdate('examples', newExamples);
  };

  const handleTermClick = (term: string) => {
    if (onSearch) {
      onSearch(term);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => {
          if (onSaveEntry) onSaveEntry(entry);
          setIsSaving(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
      }, 800);
  };

  if (!entry) return null;

  return (
    <div className={`w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border ${isEditing ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 dark:border-gray-700'} animate-fade-in-up transition-all duration-300`}>
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 w-full">
            <div className="flex items-baseline gap-4 flex-wrap">
              {isEditing ? (
                  <input 
                    value={entry.word}
                    onChange={(e) => handleUpdate('word', e.target.value)}
                    className="text-5xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white tracking-tight border-b-2 border-red-200 focus:border-red-500 focus:outline-none bg-red-50/50 dark:bg-red-900/20 rounded px-2 w-full max-w-md"
                  />
              ) : (
                  <h1 className="text-5xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">{entry.word}</h1>
              )}
              
              {isEditing ? (
                 <input 
                   value={entry.partOfSpeech}
                   onChange={(e) => handleUpdate('partOfSpeech', e.target.value)}
                   className="text-xl text-gray-500 font-serif italic border-b-2 border-red-200 focus:border-red-500 focus:outline-none bg-red-50/50 dark:bg-red-900/20 rounded px-2 w-40"
                 />
              ) : (
                 <span className="text-xl text-gray-500 dark:text-gray-400 font-serif italic">
                    {entry.partOfSpeech}
                 </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 inline-flex px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 relative group">
                {hasSpeechSupport && (
                    <button 
                        onClick={() => handleSpeak(entry.word)}
                        className="p-2 rounded-full bg-albanian-red text-white hover:bg-red-800 transition-colors shadow-sm flex-shrink-0"
                    >
                        <Volume2 className="w-5 h-5" />
                    </button>
                )}
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide text-[10px] leading-tight text-gray-400">{t.pronunciation}</span>
                    <div className="flex items-center gap-2 group/pron relative">
                        <span className="text-lg font-mono text-gray-800 dark:text-gray-200">/{entry.phonetic}/</span>
                        
                        {/* Interactive Tooltip Enhancement */}
                        <div className="relative cursor-help">
                            <Info className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-2xl shadow-2xl opacity-0 group-hover/pron:opacity-100 transition-all duration-300 pointer-events-none z-50 font-sans font-semibold leading-relaxed border border-white/10 dark:border-slate-200 translate-y-2 group-hover/pron:translate-y-0">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 text-indigo-400 dark:text-indigo-600 uppercase tracking-widest text-[8px] font-black border-b border-white/10 dark:border-slate-100 pb-1">
                                        <Sparkles className="w-2.5 h-2.5" /> {t.ipa_guide}
                                    </div>
                                    <p className="font-medium">
                                        {entry.pronunciationNote || (isGeg 
                                            ? "Transkriptimi fonetik sipas rregullave të IPA-s (International Phonetic Alphabet) qi pasqyron tingujt autentikë të gegënishtes." 
                                            : "Phonetic transcription using International Phonetic Alphabet (IPA) standards to represent the authentic sounds of the Geg language.") }
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-albanian-red"></div>
                                        <span className="text-[9px] opacity-70 italic">{isGeg ? "Vini re zanoret hundore" : "Note the nasal vocalization"}</span>
                                    </div>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 border-[6px] border-transparent border-t-slate-900 dark:border-t-white"></div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-2 text-sm font-medium transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(`${entry.word} - ${entry.definitionEnglish}`);
                alert(t.copied);
              }}
            >
              <Share2 className="w-4 h-4" /> {t.share}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 px-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('definitions')}
          className={`py-4 px-6 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'definitions' ? 'border-albanian-red text-albanian-red' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <BookOpen className="w-4 h-4" /> {t.tabs.definitions}
        </button>
        <button 
          onClick={() => setActiveTab('thesaurus')}
          className={`py-4 px-6 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'thesaurus' ? 'border-amber-50 text-amber-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <AlignLeft className="w-4 h-4" /> {t.tabs.thesaurus}
        </button>
        <button 
          onClick={() => setActiveTab('examples')}
          className={`py-4 px-6 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'examples' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <Globe className="w-4 h-4" /> {t.tabs.examples}
        </button>
        <button 
          onClick={() => setActiveTab('phrases')}
          className={`py-4 px-6 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'phrases' ? 'border-purple-50 text-purple-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <MessageCircle className="w-4 h-4" /> {t.tabs.phrases}
        </button>
      </div>

      <div className="p-8 sm:p-10 min-h-[400px]">
        {activeTab === 'definitions' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t.def_eng}</h3>
                {isEditing ? (
                  <textarea 
                    value={entry.definitionEnglish}
                    onChange={(e) => handleUpdate('definitionEnglish', e.target.value)}
                    className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg font-serif min-h-[100px]"
                  />
                ) : (
                  <p className="text-xl text-gray-900 dark:text-gray-100 leading-relaxed font-serif">{entry.definitionEnglish}</p>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t.std_alb}</h3>
                {isEditing ? (
                  <textarea 
                    value={entry.definitionStandard}
                    onChange={(e) => handleUpdate('definitionStandard', e.target.value)}
                    className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg font-serif min-h-[100px]"
                  />
                ) : (
                  <p className="text-xl text-gray-900 dark:text-gray-100 leading-relaxed font-serif">{entry.definitionStandard}</p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t.etymology}</h3>
               {isEditing ? (
                  <textarea 
                    value={entry.etymology}
                    onChange={(e) => handleUpdate('etymology', e.target.value)}
                    className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base font-serif min-h-[120px]"
                  />
                ) : (
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">{entry.etymology}</p>
                )}
            </div>
          </div>
        )}
        
        {activeTab === 'thesaurus' && (
          <div className="space-y-12 animate-fade-in">
             {/* Synonyms Section */}
             <div className="space-y-4">
                <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider border-b border-orange-100 dark:border-orange-900/50 pb-2">{t.synonyms}</h3>
                {isEditing ? (
                    <div className="space-y-2">
                        {entry.synonyms?.map((syn, i) => (
                            <div key={i} className="flex gap-2">
                                <input 
                                    value={syn} 
                                    onChange={(e) => updateStringArray('synonyms', i, e.target.value)} 
                                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <button onClick={() => removeFromStringArray('synonyms', i)} className="text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        ))}
                        <button onClick={() => addToStringArray('synonyms')} className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-2 hover:underline">+ Add Synonym</button>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {entry.synonyms && entry.synonyms.length > 0 ? entry.synonyms.map((syn, i) => (
                        <button key={i} onClick={() => handleTermClick(syn)} className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-full font-medium hover:bg-orange-100 transition-colors">
                            {syn}
                        </button>
                        )) : <span className="text-gray-400 italic">{t.no_syn}</span>}
                    </div>
                )}
             </div>

             {/* Antonyms Section */}
             {(isEditing || (entry.antonyms && entry.antonyms.length > 0)) && (
             <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2">{t.antonyms}</h3>
                {isEditing ? (
                    <div className="space-y-2">
                        {entry.antonyms?.map((ant, i) => (
                            <div key={i} className="flex gap-2">
                                <input 
                                    value={ant} 
                                    onChange={(e) => updateStringArray('antonyms', i, e.target.value)} 
                                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <button onClick={() => removeFromStringArray('antonyms', i)} className="text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        ))}
                        <button onClick={() => addToStringArray('antonyms')} className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-2 hover:underline">+ Add Antonym</button>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {entry.antonyms?.map((ant, i) => (
                        <button key={i} onClick={() => handleTermClick(ant)} className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full font-medium hover:bg-gray-100 transition-colors">
                            {ant}
                        </button>
                        ))}
                    </div>
                )}
             </div>
             )}

             {/* Related Words */}
             {(isEditing || (entry.relatedWords && entry.relatedWords.length > 0)) && (
                  <div className="pt-4">
                      <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 dark:border-indigo-900/50 pb-2">{t.related}</h3>
                      {isEditing ? (
                          <div className="space-y-2">
                              {entry.relatedWords?.map((rel, i) => (
                                  <div key={i} className="flex gap-2">
                                      <input 
                                          value={rel} 
                                          onChange={(e) => updateStringArray('relatedWords', i, e.target.value)} 
                                          className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      />
                                      <button onClick={() => removeFromStringArray('relatedWords', i)} className="text-red-500 p-2"><Trash2 className="w-4 h-4"/></button>
                                  </div>
                              ))}
                              <button onClick={() => addToStringArray('relatedWords')} className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-2 hover:underline">+ Add Related Word</button>
                          </div>
                      ) : (
                          <div className="flex flex-wrap gap-3">
                              {entry.relatedWords?.map((word, i) => (
                                  <button key={i} onClick={() => handleTermClick(word)} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-all active:scale-95">
                                      {word}
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-10 animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">{t.sentences}</h3>
                {isEditing && (
                    <button onClick={addExample} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1">
                        <PlusCircle className="w-3 h-3" /> Add Example
                    </button>
                )}
             </div>
             
             {entry.examples && entry.examples.length > 0 ? (
                <div className="space-y-8">
                   {entry.examples.map((ex, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 relative group">
                         {isEditing && (
                             <button onClick={() => removeExample(i)} className="absolute top-4 right-4 text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                         )}
                         <div className="space-y-6">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{lang === 'geg' ? 'Gegenisht' : 'Geg Original'}</label>
                               {isEditing ? (
                                   <input className="w-full bg-white dark:bg-gray-800 p-2 border rounded font-serif italic text-lg" value={ex.original} onChange={e => updateExample(i, 'original', e.target.value)} />
                               ) : (
                                   <p className="text-xl font-serif italic text-gray-900 dark:text-white leading-relaxed">"{ex.original}"</p>
                               )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{t.standard_label}</label>
                                  {isEditing ? (
                                      <input className="w-full bg-white dark:bg-gray-800 p-2 border rounded text-sm" value={ex.standard} onChange={e => updateExample(i, 'standard', e.target.value)} />
                                  ) : (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{ex.standard}</p>
                                  )}
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{t.translation_label}</label>
                                  {isEditing ? (
                                      <input className="w-full bg-white dark:bg-gray-800 p-2 border rounded text-sm" value={ex.translation} onChange={e => updateExample(i, 'translation', e.target.value)} />
                                  ) : (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{ex.translation}</p>
                                  )}
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="text-center py-20 text-gray-400 italic">
                   <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   {t.no_ex}
                </div>
             )}
          </div>
        )}

        {activeTab === 'phrases' && (
          <div className="space-y-8 animate-fade-in">
             <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider">{t.phrases_title}</h3>
             
             {isEditing ? (
                 <div className="space-y-3">
                    {entry.relatedPhrases?.map((phrase, i) => (
                        <div key={i} className="flex gap-2">
                           <input value={phrase} onChange={e => updateStringArray('relatedPhrases', i, e.target.value)} className="flex-1 p-3 border rounded dark:bg-gray-700 dark:text-white" />
                           <button onClick={() => removeFromStringArray('relatedPhrases', i)} className="text-red-500"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    ))}
                    <button onClick={() => addToStringArray('relatedPhrases')} className="text-sm font-bold text-purple-600 flex items-center gap-1">+ Add Phrase</button>
                 </div>
             ) : (
                entry.relatedPhrases && entry.relatedPhrases.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                       {entry.relatedPhrases.map((phrase, i) => (
                          <div key={i} className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl flex items-center justify-between group hover:bg-purple-100 transition-colors">
                             <span className="font-medium text-purple-900 dark:text-purple-100">{phrase}</span>
                             <button onClick={() => handleTermClick(phrase)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600"><ArrowRight className="w-4 h-4" /></button>
                          </div>
                       ))}
                    </div>
                ) : (
                   <div className="text-center py-20 text-gray-400 italic">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      {t.no_phrases}
                   </div>
                )
             )}
          </div>
        )}
      </div>

      {isEditing && (
          <div className="sticky bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-red-200 dark:border-red-900 p-4 flex items-center justify-end z-20">
              <button onClick={handleSave} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saveSuccess ? 'Saved!' : 'Save Changes'}
              </button>
          </div>
      )}
    </div>
  );
};

export default WordCard;