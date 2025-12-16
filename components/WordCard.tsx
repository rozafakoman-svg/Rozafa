
import React, { useState, useEffect, useRef } from 'react';
import { DictionaryEntry, ContributionType, ExampleSentence } from '../types';
import { Volume2, BookOpen, Share2, ArrowRight, AlignLeft, Globe, GraduationCap, Info, HelpCircle, MapPin, Repeat, MessageCircle, Image, Sparkles, Loader2, GitCompare, X, ShieldAlert, Upload, Mic, PlayCircle, PauseCircle, Flag, Edit3, Headphones, Download, Trash2, PlusCircle, CheckCircle, Save, Zap } from './Icons';
import { fetchEtymologyImage, fetchWordDefinition } from '../services/geminiService';
import ContributionModal from './ContributionModal';

interface WordCardProps {
  entry: DictionaryEntry;
  initialTab?: 'definitions' | 'thesaurus' | 'examples' | 'phrases';
  isEditing?: boolean;
  onUpdateEntry?: (entry: DictionaryEntry) => void;
  onSearch?: (term: string) => void; 
  onDelete?: () => void; // Added for delete functionality
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
    std_alb: "Standard Albanian",
    etymology: "Etymology",
    grammar: "Grammar Notes",
    region: "Region",
    culture: "Cultural Context",
    synonyms: "Synonyms",
    antonyms: "Antonyms",
    related: "Related Words",
    vis_origin: "Visualize Origin",
    visualizing: "Visualizing...",
    palindrome: "Palindrome Check",
    is_palindrome: "is a palindrome! It reads the same backwards and forwards.",
    not_palindrome: "is not a palindrome.",
    sentences: "Sentence Examples",
    phrases_title: "Common Phrases & Idioms",
    no_syn: "No synonyms found.",
    no_ant: "No antonyms found.",
    no_rel: "No related words found.",
    no_ex: "No examples available for this entry.",
    no_phrases: "No related phrases found for this entry.",
    std_imposed: "Imposed in 1972",
    std_desc: "The Unified Standard was established in 1972 by the Congress of Orthography, largely based on Tosk, suppressing Geg literary tradition.",
    upload_audio: "Upload Audio",
    replace_audio: "Replace",
    custom_rec: "Custom Recording",
    report_issue: "Report Issue",
    suggest_edit: "Suggest Edit",
    pronunciation_guide: "Pronunciation Guide",
    listen: "Listen",
    phonetic_transcription: "Phonetic Transcription",
    delete: "Delete Entry"
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
    std_alb: "Shqipja Standarde",
    etymology: "Prejardhja",
    grammar: "Shënime Gramatikore",
    region: "Krahina",
    culture: "Kontekst Kulturor",
    synonyms: "Sinonime",
    antonyms: "Antonime",
    related: "Fjalë të Përafërta",
    vis_origin: "Vizualizo Origjinën",
    visualizing: "Tuj gjenerue...",
    palindrome: "Kontroll Palindromi",
    is_palindrome: "âsht palindrom! Lexohet njisoj mbrapsht dhe mbarë.",
    not_palindrome: "s'âsht palindrom.",
    sentences: "Shembuj Fjalish",
    phrases_title: "Shprehje të Zakonshme & Idioma",
    no_syn: "S'u gjetën sinonime.",
    no_ant: "S'u gjetën antonime.",
    no_rel: "S'u gjetën fjalë të përafërta.",
    no_ex: "S'ka shembuj për këtë fjalë.",
    no_phrases: "S'u gjetën shprehje për këtë fjalë.",
    std_imposed: "Imponue në 1972",
    std_desc: "Standardi i Unifikuem u vendos në vitin 1972 nga Kongresi i Drejtshkrimit, bazuem kryesisht në toskërisht, tuj shtypë traditën letrare gege.",
    upload_audio: "Ngarko Zânin",
    replace_audio: "Ndrysho",
    custom_rec: "Inçizim Vetjak",
    report_issue: "Raporto Gabim",
    suggest_edit: "Sugjero Ndryshim",
    pronunciation_guide: "Udhëzues Shqiptimi",
    listen: "Ndëgjo",
    phonetic_transcription: "Transkriptimi Fonetik",
    delete: "Fshi Fjalën"
  }
};

const WordCard: React.FC<WordCardProps> = ({ entry, initialTab = 'definitions', isEditing = false, onUpdateEntry, onSearch, onDelete, lang }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [etymologyImage, setEtymologyImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Custom Audio State
  const [isPlayingCustom, setIsPlayingCustom] = useState(false);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comparison State
  const [showCompareInput, setShowCompareInput] = useState(false);
  const [compareQuery, setCompareQuery] = useState('');
  const [compareEntry, setCompareEntry] = useState<DictionaryEntry | null>(null);
  const [isCompareLoading, setIsCompareLoading] = useState(false);

  // Contribution State
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [contributionType, setContributionType] = useState<ContributionType>('report_error');
  
  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const t = translations[lang];

  // Palindrome check logic
  const wordToProcess = entry?.word || '';
  const cleanWord = wordToProcess.toLowerCase().replace(/[^a-zëç]/g, '');
  const isPalindrome = cleanWord.length > 0 && cleanWord === cleanWord.split('').reverse().join('');

  // Determine pronunciation note (fallback to nasal check if empty)
  const hasNasal = /[âêîôû]/i.test(entry.word);
  const pronunciationTooltip = entry.pronunciationNote || (hasNasal ? "Contains distinctive Geg nasal vowels (annotated with circumflex). These sounds are produced by allowing air to escape through the nose while articulating." : null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setEtymologyImage(null);
    setIsGeneratingImage(false);
    setShowCompareInput(false);
    setCompareEntry(null);
    setCompareQuery('');
    setIsPlayingCustom(false);
    setSaveSuccess(false);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpdateEntry && entry) {
      const url = URL.createObjectURL(file);
      onUpdateEntry({ ...entry, customAudio: url });
    }
  };

  const toggleCustomAudio = () => {
    if (!customAudioRef.current) return;
    if (isPlayingCustom) {
      customAudioRef.current.pause();
    } else {
      customAudioRef.current.play();
    }
    setIsPlayingCustom(!isPlayingCustom);
  };

  const handleGenerateImage = async () => {
    if (!entry || !entry.etymology || isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const image = await fetchEtymologyImage(entry.word, entry.etymology);
      setEtymologyImage(image);
    } catch (error) {
      console.error("Failed to generate image", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCompareSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareQuery.trim()) return;
    setIsCompareLoading(true);
    try {
      const result = await fetchWordDefinition(compareQuery);
      setCompareEntry(result);
      setShowCompareInput(false);
    } catch (error) {
      console.error("Comparison search failed", error);
      alert(lang === 'geg' ? "Nuk u gjet fjala. Provo nji tjetër." : "Could not find that word. Please try another.");
    } finally {
      setIsCompareLoading(false);
    }
  };

  const closeComparison = () => {
    setCompareEntry(null);
    setCompareQuery('');
    setShowCompareInput(false);
  };

  const handleUpdate = (field: keyof DictionaryEntry, value: any) => {
    if (onUpdateEntry && entry) {
      onUpdateEntry({ ...entry, [field]: value });
    }
  };

  // Helper functions for array editing
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

  // Helper functions for example editing
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

  const openContribution = (type: ContributionType) => {
    setContributionType(type);
    setContributionModalOpen(true);
  };

  const handleTermClick = (term: string) => {
    if (onSearch) {
      onSearch(term);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = () => {
      setIsSaving(true);
      // Simulate API Save
      setTimeout(() => {
          setIsSaving(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
      }, 1200);
  };

  const handleDelete = () => {
      if (confirm(lang === 'geg' ? 'A jeni i sigurtë që doni me e fshi këtë fjalë?' : 'Are you sure you want to delete this entry?')) {
          if (onDelete) onDelete();
      }
  };

  if (!entry) return null;

  return (
    <div className={`w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border ${isEditing ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 dark:border-gray-700'} animate-fade-in-up transition-all duration-300`}>
      {/* Header Section */}
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
            
            {/* Pronunciation & Audio Section - Header Summary */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 inline-flex px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 relative group">
                {hasSpeechSupport && (
                    <button 
                        onClick={() => handleSpeak(entry.word)}
                        className="p-2 rounded-full bg-albanian-red text-white hover:bg-red-800 transition-colors shadow-sm flex-shrink-0"
                        title="AI Pronunciation"
                    >
                        <Volume2 className="w-5 h-5" />
                    </button>
                )}
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide text-[10px] leading-tight text-gray-400">{t.pronunciation}</span>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <div className="flex items-center font-mono text-lg text-gray-800 dark:text-gray-200">
                                <span className="text-gray-400">/</span>
                                <input 
                                    value={entry.phonetic}
                                    onChange={(e) => handleUpdate('phonetic', e.target.value)}
                                    className="bg-transparent border-b border-red-300 focus:outline-none w-auto min-w-[60px] max-w-[120px]"
                                />
                                <span className="text-gray-400">/</span>
                            </div>
                        ) : (
                            <span className="text-lg font-mono text-gray-800 dark:text-gray-200">/{entry.phonetic}/</span>
                        )}

                        {/* Tooltip unified in header */}
                        {pronunciationTooltip && !isEditing && (
                            <div className="relative ml-1">
                                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-indigo-500 cursor-help transition-colors" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-sans leading-relaxed">
                                    {pronunciationTooltip}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </div>

                {/* Custom Audio Player/Upload */}
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 inline-flex px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                    {entry.customAudio ? (
                        <>
                            <button 
                                onClick={toggleCustomAudio}
                                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0"
                            >
                                {isPlayingCustom ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                            </button>
                            <audio 
                                ref={customAudioRef} 
                                src={entry.customAudio} 
                                onEnded={() => setIsPlayingCustom(false)} 
                                className="hidden"
                            />
                            
                            <div className="flex flex-col mr-2">
                                <span className="text-[10px] font-bold text-blue-400 dark:text-blue-300 uppercase tracking-wide leading-tight">{t.custom_rec}</span>
                                <span className="text-xs font-medium text-blue-800 dark:text-blue-200">Uploaded</span>
                            </div>

                            <a 
                                href={entry.customAudio} 
                                download={`${entry.word}_pronunciation`}
                                className="p-2 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition-colors"
                                title="Download"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-blue-400 dark:text-blue-300">
                            <Mic className="w-5 h-5" />
                            <span className="text-xs italic">No recording</span>
                        </div>
                    )}

                    {onUpdateEntry && (
                        <div className="border-l border-blue-200 dark:border-blue-700 pl-3 ml-1">
                            <input 
                                type="file" 
                                accept="audio/*" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                            >
                                <Upload className="w-3 h-3" /> {entry.customAudio ? t.replace_audio : t.upload_audio}
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Compare Button / Input */}
            {showCompareInput && !compareEntry ? (
               <form onSubmit={handleCompareSearch} className="flex items-center gap-2 animate-fade-in bg-gray-50 dark:bg-gray-700/50 p-1 rounded-xl border border-gray-200 dark:border-gray-600">
                  <input 
                    autoFocus
                    value={compareQuery}
                    onChange={e => setCompareQuery(e.target.value)}
                    placeholder={lang === 'geg' ? "Krahaso me..." : "Compare with..."}
                    className="w-32 sm:w-40 px-3 py-1.5 text-sm bg-transparent border-none focus:ring-0 placeholder-gray-400 text-gray-800 dark:text-gray-200"
                    autoComplete="off"
                  />
                  <button 
                    type="submit" 
                    disabled={isCompareLoading} 
                    className="p-1.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-black dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                     {isCompareLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <ArrowRight className="w-4 h-4"/>}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowCompareInput(false)} 
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                     <X className="w-4 h-4"/>
                  </button>
               </form>
            ) : !compareEntry ? (
              <button 
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-2 text-sm font-medium transition-colors"
                onClick={() => setShowCompareInput(true)}
              >
                <GitCompare className="w-4 h-4" /> {t.compare}
              </button>
            ) : (
               <button 
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={closeComparison}
              >
                <X className="w-4 h-4" /> {t.exit_compare}
              </button>
            )}

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
      
      {compareEntry ? (
        // COMPARISON VIEW
        <div className="p-8 sm:p-10 animate-fade-in bg-slate-50 dark:bg-gray-900 min-h-[500px]">
           <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-xl font-serif font-bold text-gray-400 uppercase tracking-widest">{t.comp_mode}</span>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8">
              {/* Original Entry */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full">
                 <div className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                    <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">{t.original}</span>
                    <h2 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-1">{entry.word}</h2>
                    <div className="flex items-center gap-3">
                       <span className="text-gray-500 dark:text-gray-400 italic">/{entry.phonetic}/</span>
                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                       <span className="text-albanian-red font-medium text-sm">{entry.partOfSpeech}</span>
                       <button onClick={() => handleSpeak(entry.word)} className="text-gray-400 hover:text-albanian-red"><Volume2 className="w-4 h-4"/></button>
                    </div>
                 </div>
                 
                 <div className="space-y-6 flex-grow">
                    <div>
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t.def_eng}</h4>
                       <p className="text-gray-900 dark:text-gray-100 leading-relaxed font-serif">{entry.definitionEnglish}</p>
                    </div>
                    <div>
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                          {t.std_alb} 
                          <span title={t.std_imposed} className="cursor-help">
                            <Info className="w-3 h-3 text-gray-400" />
                          </span>
                       </h4>
                       <p className="text-gray-800 dark:text-gray-200">{entry.definitionStandard}</p>
                    </div>
                 </div>
              </div>

              {/* Comparison Entry */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-indigo-100 dark:border-indigo-900 shadow-sm flex flex-col h-full relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                 
                 <div className="border-b border-indigo-50 dark:border-indigo-900 pb-4 mb-6 relative z-10">
                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">Comparison</span>
                    <h2 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-1">{compareEntry.word}</h2>
                    <div className="flex items-center gap-3">
                       <span className="text-gray-500 dark:text-gray-400 italic">/{compareEntry.phonetic}/</span>
                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                       <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">{compareEntry.partOfSpeech}</span>
                       <button onClick={() => handleSpeak(compareEntry.word)} className="text-gray-400 hover:text-indigo-600"><Volume2 className="w-4 h-4"/></button>
                    </div>
                 </div>
                 
                 <div className="space-y-6 flex-grow relative z-10">
                    <div>
                       <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">{t.def_eng}</h4>
                       <p className="text-gray-900 dark:text-gray-100 leading-relaxed font-serif">{compareEntry.definitionEnglish}</p>
                    </div>
                    <div>
                       <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                          {t.std_alb}
                          <span title={t.std_imposed} className="cursor-help">
                            <Info className="w-3 h-3 text-indigo-300" />
                          </span>
                       </h4>
                       <p className="text-gray-800 dark:text-gray-200">{compareEntry.definitionStandard}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <>
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 px-8 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('definitions')}
              className={`py-4 px-6 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'definitions' ? 'border-albanian-red text-albanian-red' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
            >
              <BookOpen className="w-4 h-4" /> {t.tabs.definitions}
            </button>
            <button 
              onClick={() => setActiveTab('thesaurus')}
              className={`py-4 px-6 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'thesaurus' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
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
              className={`py-4 px-6 font-medium text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'phrases' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
            >
              <MessageCircle className="w-4 h-4" /> {t.tabs.phrases}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8 sm:p-10 min-h-[400px]">
            {/* DEFINITIONS TAB */}
            {activeTab === 'definitions' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Simplified Definition Layout since Pronunciation is now in Header */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3 group relative">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      {t.def_eng}
                    </h3>
                    <div className="relative inline-block w-full">
                      {isEditing ? (
                         <textarea 
                            value={entry.definitionEnglish}
                            onChange={(e) => handleUpdate('definitionEnglish', e.target.value)}
                            className="w-full p-2 border border-red-200 rounded bg-red-50 text-xl font-serif dark:bg-red-900/20 dark:text-white"
                            rows={3}
                         />
                      ) : (
                        <p className="text-xl text-gray-900 dark:text-gray-100 leading-relaxed font-serif">
                            <span className="border-b border-dotted border-gray-300 hover:border-albanian-red cursor-help transition-colors">
                            {entry.definitionEnglish}
                            </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        {t.std_alb} <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded text-[10px] tracking-normal">1972</span>
                    </h3>
                    {isEditing ? (
                         <textarea 
                            value={entry.definitionStandard}
                            onChange={(e) => handleUpdate('definitionStandard', e.target.value)}
                            className="w-full p-2 border border-red-200 rounded bg-red-50 text-xl font-serif dark:bg-red-900/20 dark:text-white"
                            rows={3}
                         />
                    ) : (
                        <p className="text-xl text-gray-900 dark:text-gray-100 leading-relaxed font-serif">{entry.definitionStandard}</p>
                    )}
                  </div>
                </div>

                {(isEditing || (entry.grammarNotes && entry.grammarNotes.length > 0)) && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3">
                      <GraduationCap className="w-4 h-4" /> {t.grammar}
                    </h3>
                    {isEditing ? (
                        <div className="space-y-2">
                            {entry.grammarNotes?.map((note, i) => (
                                <div key={i} className="flex gap-2">
                                    <input 
                                        value={note} 
                                        onChange={(e) => updateStringArray('grammarNotes', i, e.target.value)} 
                                        className="flex-1 p-2 border border-blue-200 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm" 
                                    />
                                    <button onClick={() => removeFromStringArray('grammarNotes', i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button onClick={() => addToStringArray('grammarNotes')} className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-2 hover:underline"><PlusCircle className="w-3 h-3" /> Add Note</button>
                        </div>
                    ) : (
                        <ul className="list-disc list-inside space-y-2 text-blue-900 dark:text-blue-200">
                        {entry.grammarNotes?.map((note, i) => <li key={i}>{note}</li>)}
                        </ul>
                    )}
                  </div>
                )}
                
                {(isEditing || entry.dialectRegion) && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-6">
                     <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-3">
                       <MapPin className="w-4 h-4" /> {t.region}
                     </h3>
                     {isEditing ? (
                         <input 
                            value={entry.dialectRegion} 
                            onChange={(e) => handleUpdate('dialectRegion', e.target.value)} 
                            className="w-full p-2 border border-emerald-200 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
                            placeholder="e.g. Shkodra, Kosova"
                         />
                     ) : (
                        <p className="text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
                        {entry.dialectRegion}
                        </p>
                     )}
                  </div>
                )}

                {(isEditing || entry.culturalNote) && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-6">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-3">
                      <Globe className="w-4 h-4" /> {t.culture}
                    </h3>
                    {isEditing ? (
                        <textarea
                            value={entry.culturalNote}
                            onChange={(e) => handleUpdate('culturalNote', e.target.value)}
                            className="w-full p-2 border border-amber-200 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 min-h-[80px]"
                            placeholder="Add cultural context..."
                        />
                    ) : (
                        <p className="text-amber-900/80 dark:text-amber-200/80 italic leading-relaxed">
                        {entry.culturalNote}
                        </p>
                    )}
                  </div>
                )}
                
                {/* Etymology & Palindrome */}
                <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                          <Info className="w-4 h-4 text-albanian-red" />
                          {t.etymology}
                        </h3>
                      </div>
                      {!etymologyImage && entry.etymology && !isEditing && (
                        <button 
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage}
                          className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 disabled:opacity-50"
                        >
                          {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          {isGeneratingImage ? t.visualizing : t.vis_origin}
                        </button>
                      )}
                  </div>
                   {/* Etymology Content */}
                  <div className={`grid gap-6 ${etymologyImage ? 'md:grid-cols-3' : 'grid-cols-1'}`}>
                     <div className={`${etymologyImage ? 'md:col-span-2' : ''} bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-100 dark:border-gray-700 relative h-full`}>
                        <div className="absolute top-5 left-0 w-1 h-8 bg-albanian-red rounded-r"></div>
                        {isEditing ? (
                            <textarea
                                value={entry.etymology}
                                onChange={(e) => handleUpdate('etymology', e.target.value)}
                                className="w-full h-full p-2 border border-gray-200 rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 min-h-[100px]"
                                placeholder="Origin details..."
                            />
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic pl-2">
                                {entry.etymology || "Etymology details are currently unavailable for this entry."}
                            </p>
                        )}
                     </div>
                     {etymologyImage && (
                        <div className="animate-fade-in relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                          <img 
                            src={etymologyImage} 
                            alt={`Etymology illustration for ${entry.word}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                     )}
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
                   <div className={`rounded-xl p-5 border ${isPalindrome ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700'}`}>
                      <h3 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-2 ${isPalindrome ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        <Repeat className="w-4 h-4" /> {t.palindrome}
                      </h3>
                      <p className={`${isPalindrome ? 'text-indigo-900 dark:text-indigo-200 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                        {isPalindrome 
                          ? <span>Yes, <span className="font-serif font-bold">"{entry.word}"</span> {t.is_palindrome}</span>
                          : <span>No, <span className="font-serif font-bold">"{entry.word}"</span> {t.not_palindrome}</span>
                        }
                      </p>
                   </div>
                </div>

              </div>
            )}
            
            {/* THESAURUS TAB */}
            {activeTab === 'thesaurus' && (
              <div className="space-y-8 animate-fade-in">
                 <div className={`grid ${entry.antonyms && entry.antonyms.length > 0 ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
                    <div>
                        <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-4 border-b border-orange-100 dark:border-orange-900/50 pb-2">{t.synonyms}</h3>
                        {isEditing ? (
                            <div className="space-y-2">
                                {entry.synonyms?.map((syn, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input 
                                            value={syn} 
                                            onChange={(e) => updateStringArray('synonyms', i, e.target.value)} 
                                            className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <button onClick={() => removeFromStringArray('synonyms', i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={() => addToStringArray('synonyms')} className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-2 hover:underline"><PlusCircle className="w-3 h-3" /> Add Synonym</button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {entry.synonyms && entry.synonyms.length > 0 ? entry.synonyms.map((syn, i) => (
                                <button 
                                key={i} 
                                onClick={() => handleTermClick(syn)}
                                className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-full font-medium hover:bg-orange-100 dark:hover:bg-orange-900/40 cursor-pointer transition-colors"
                                >
                                    {syn}
                                </button>
                                )) : <span className="text-gray-400 italic">{t.no_syn}</span>}
                            </div>
                        )}
                    </div>
                    {(isEditing || (entry.antonyms && entry.antonyms.length > 0)) && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">{t.antonyms}</h3>
                        {isEditing ? (
                            <div className="space-y-2">
                                {entry.antonyms?.map((ant, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input 
                                            value={ant} 
                                            onChange={(e) => updateStringArray('antonyms', i, e.target.value)} 
                                            className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <button onClick={() => removeFromStringArray('antonyms', i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={() => addToStringArray('antonyms')} className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-2 hover:underline"><PlusCircle className="w-3 h-3" /> Add Antonym</button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {entry.antonyms?.map((ant, i) => (
                                <button 
                                key={i} 
                                onClick={() => handleTermClick(ant)}
                                className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                >
                                    {ant}
                                </button>
                                ))}
                            </div>
                        )}
                    </div>
                    )}
                  </div>

                  {(isEditing || (entry.relatedWords && entry.relatedWords.length > 0)) && (
                      <div className="mt-8">
                          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 dark:border-indigo-900/50 pb-2">{t.related}</h3>
                          {isEditing ? (
                            <div className="space-y-2">
                                {entry.relatedWords?.map((word, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input 
                                            value={word} 
                                            onChange={(e) => updateStringArray('relatedWords', i, e.target.value)} 
                                            className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <button onClick={() => removeFromStringArray('relatedWords', i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={() => addToStringArray('relatedWords')} className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-2 hover:underline"><PlusCircle className="w-3 h-3" /> Add Related Word</button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-3">
                                {entry.relatedWords?.map((word, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleTermClick(word)}
                                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
                                    >
                                        {word}
                                    </button>
                                ))}
                            </div>
                          )}
                      </div>
                  )}
              </div>
            )}

            {/* EXAMPLES TAB */}
            {activeTab === 'examples' && (
              <div className="space-y-6 animate-fade-in">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">{t.sentences}</h3>
                  
                  {isEditing && (
                      <button onClick={addExample} className="mb-4 flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors">
                          <PlusCircle className="w-4 h-4" /> Add Example
                      </button>
                  )}

                  {entry.examples && entry.examples.length > 0 ? entry.examples.map((ex, idx) => (
                     <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                        
                        {isEditing && (
                            <button 
                                onClick={() => removeExample(idx)}
                                className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}

                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1 block">Geg (Original)</span>
                            {isEditing ? (
                                <textarea 
                                    value={ex.original}
                                    onChange={(e) => updateExample(idx, 'original', e.target.value)}
                                    className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 font-serif"
                                />
                            ) : (
                                <p className="text-xl font-serif text-gray-900 dark:text-white">"{ex.original}"</p>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-gray-200/50 dark:border-gray-600/30 mt-3">
                            <div className="flex-1">
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 block">Standard</span>
                               {isEditing ? (
                                    <input 
                                        value={ex.standard}
                                        onChange={(e) => updateExample(idx, 'standard', e.target.value)}
                                        className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm"
                                    />
                               ) : (
                                    <p className="text-gray-600 dark:text-gray-300 text-sm italic">{ex.standard}</p>
                               )}
                            </div>
                            <div className="flex-1">
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 block">English</span>
                               {isEditing ? (
                                    <input 
                                        value={ex.translation}
                                        onChange={(e) => updateExample(idx, 'translation', e.target.value)}
                                        className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm"
                                    />
                               ) : (
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">{ex.translation}</p>
                               )}
                            </div>
                          </div>
                        </div>
                     </div>
                   )) : <p className="text-gray-400 italic text-center py-8">{t.no_ex}</p>}
              </div>
            )}

             {/* PHRASES TAB */}
             {activeTab === 'phrases' && (
              <div className="space-y-6 animate-fade-in">
                  <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4">{t.phrases_title}</h3>
                  {isEditing ? (
                    <div className="space-y-4">
                        {entry.relatedPhrases?.map((phrase, idx) => (
                            <div key={idx} className="flex gap-2">
                                <textarea 
                                    value={phrase} 
                                    onChange={(e) => updateStringArray('relatedPhrases', idx, e.target.value)} 
                                    className="flex-1 p-3 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 font-serif"
                                />
                                <button onClick={() => removeFromStringArray('relatedPhrases', idx)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded self-start"><Trash2 className="w-5 h-5"/></button>
                            </div>
                        ))}
                        <button onClick={() => addToStringArray('relatedPhrases')} className="flex items-center gap-2 text-purple-600 font-bold hover:underline"><PlusCircle className="w-4 h-4" /> Add Phrase</button>
                    </div>
                  ) : (
                    <>
                        {entry.relatedPhrases && entry.relatedPhrases.length > 0 ? entry.relatedPhrases.map((phrase, idx) => (
                            <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/50 hover:shadow-md transition-shadow">
                                <p className="text-xl font-serif text-purple-900 dark:text-purple-300 font-medium">{phrase}</p>
                            </div>
                        )) : <p className="text-gray-400 italic text-center py-8">{t.no_phrases}</p>}
                    </>
                  )}
              </div>
            )}

          </div>

          {/* Footer Actions for Reporting/Contributing */}
          <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-8 py-4 flex items-center justify-end gap-3">
             <button 
                onClick={() => openContribution('report_error')}
                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
             >
                <Flag className="w-4 h-4" /> {t.report_issue}
             </button>
             <button 
                onClick={() => openContribution('suggest_edit')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
             >
                <Edit3 className="w-4 h-4" /> {t.suggest_edit}
             </button>
          </div>
        </>
      )}

      {/* Sticky Save Bar for Admins in Edit Mode */}
      {isEditing && (
          <div className="sticky bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-red-200 dark:border-red-900 p-4 flex items-center justify-between z-20 animate-slide-in-up">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-current" /> GOD MODE ACTIVE
              </span>
              <div className="flex gap-4">
                  {onDelete && (
                      <button 
                        onClick={handleDelete}
                        className="bg-red-100 dark:bg-red-900/50 hover:bg-red-200 text-red-600 dark:text-red-300 px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-all border border-red-200 dark:border-red-800"
                      >
                          <Trash2 className="w-4 h-4" /> {t.delete}
                      </button>
                  )}
                  {saveSuccess ? (
                      <div className="flex items-center gap-2 text-green-600 font-bold px-6 py-2">
                          <CheckCircle className="w-5 h-5" /> Saved!
                      </div>
                  ) : (
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait"
                      >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                  )}
              </div>
          </div>
      )}

      <ContributionModal 
        isOpen={contributionModalOpen}
        onClose={() => setContributionModalOpen(false)}
        type={contributionType}
        initialWord={entry.word}
        lang={lang}
      />
    </div>
  );
};

export default WordCard;
