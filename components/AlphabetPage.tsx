
import React, { useState, useRef, useEffect } from 'react';
import { AlphabetLetter, Language } from '../types';
import { Volume2, Upload, Image as ImageIcon, X, Edit3, Save, Info, Type, PlusCircle, Trash2, Sparkles, Loader2, PlayCircle, CheckCircle, RefreshCw } from './Icons';
import { fetchKidIllustration } from '../services/geminiService';
import { db, Stores } from '../services/db';

interface AlphabetPageProps {
  lang: Language;
  isEditing: boolean;
}

// Helper to generate a placeholder image URL based on the word
const getPlaceholder = (text: string, color: string = 'e2e8f0') => 
  `https://placehold.co/400x400/${color}/475569?text=${text}`;

const INITIAL_ALPHABET: AlphabetLetter[] = [
  { id: 'a', char: 'A', isNasal: false, isDigraph: false, ipa: '/a/', exampleWord: 'Atë', exampleTranslation: 'Father', description: 'Open central unrounded vowel.', imageUrl: getPlaceholder('Atë') },
  { id: 'b', char: 'B', isNasal: false, isDigraph: false, ipa: '/b/', exampleWord: 'Bukë', exampleTranslation: 'Bread', description: 'Voiced bilabial plosive.', imageUrl: getPlaceholder('Bukë') },
  { id: 'c', char: 'C', isNasal: false, isDigraph: false, ipa: '/ts/', exampleWord: 'Cjap', exampleTranslation: 'Billy goat', description: 'Voiceless alveolar affricate.', imageUrl: getPlaceholder('Cjap') },
  { id: 'ç', char: 'Ç', isNasal: false, isDigraph: false, ipa: '/tʃ/', exampleWord: 'Çikë', exampleTranslation: 'Girl', description: 'Voiceless postalveolar affricate.', imageUrl: getPlaceholder('Çikë') },
  { id: 'd', char: 'D', isNasal: false, isDigraph: false, ipa: '/d/', exampleWord: 'Djalë', exampleTranslation: 'Boy', description: 'Voiced alveolar plosive.', imageUrl: getPlaceholder('Djalë') },
  { id: 'dh', char: 'Dh', isNasal: false, isDigraph: true, ipa: '/ð/', exampleWord: 'Dhomë', exampleTranslation: 'Room', description: 'Voiced dental fricative.', imageUrl: getPlaceholder('Dhomë') },
  { id: 'e', char: 'E', isNasal: false, isDigraph: false, ipa: '/ɛ/', exampleWord: 'Erë', exampleTranslation: 'Wind', description: 'Open-mid front unrounded vowel.', imageUrl: getPlaceholder('Erë') },
  { id: 'ë', char: 'Ë', isNasal: false, isDigraph: false, ipa: '/ə/', exampleWord: 'Ëndërr', exampleTranslation: 'Dream', description: 'Schwa. In Geg, often dropped at the end of words.', imageUrl: getPlaceholder('Ëndërr') },
  { id: 'f', char: 'F', isNasal: false, isDigraph: false, ipa: '/f/', exampleWord: 'Fjalë', exampleTranslation: 'Word', description: 'Voiceless labiodental fricative.', imageUrl: getPlaceholder('Fjalë') },
  { id: 'g', char: 'G', isNasal: false, isDigraph: false, ipa: '/ɡ/', exampleWord: 'Gur', exampleTranslation: 'Stone', description: 'Voiced velar plosive.', imageUrl: getPlaceholder('Gur') },
  { id: 'gj', char: 'Gj', isNasal: false, isDigraph: true, ipa: '/ɟ/', exampleWord: 'Gjuhë', exampleTranslation: 'Language', description: 'Voiced palatal plosive.', imageUrl: getPlaceholder('Gjuhë') },
  { id: 'h', char: 'H', isNasal: false, isDigraph: false, ipa: '/h/', exampleWord: 'Hije', exampleTranslation: 'Shadow', description: 'Voiceless glottal fricative.', imageUrl: getPlaceholder('Hije') },
  { id: 'i', char: 'I', isNasal: false, isDigraph: false, ipa: '/i/', exampleWord: 'Ik', exampleTranslation: 'Go/Leave', description: 'Close front unrounded vowel.', imageUrl: getPlaceholder('Ik') },
  { id: 'j', char: 'J', isNasal: false, isDigraph: false, ipa: '/j/', exampleWord: 'Jetë', exampleTranslation: 'Life', description: 'Palatal approximant.', imageUrl: getPlaceholder('Jetë') },
  { id: 'k', char: 'K', isNasal: false, isDigraph: false, ipa: '/k/', exampleWord: 'Kohë', exampleTranslation: 'Time', description: 'Voiceless velar plosive.', imageUrl: getPlaceholder('Kohë') },
  { id: 'l', char: 'L', isNasal: false, isDigraph: false, ipa: '/l/', exampleWord: 'Lule', exampleTranslation: 'Flower', description: 'Alveolar lateral approximant.', imageUrl: getPlaceholder('Lule') },
  { id: 'll', char: 'Ll', isNasal: false, isDigraph: true, ipa: '/ɫ/', exampleWord: 'Llambë', exampleTranslation: 'Lamp', description: 'Velarized alveolar lateral approximant (Dark L).', imageUrl: getPlaceholder('Llambë') },
  { id: 'm', char: 'M', isNasal: false, isDigraph: false, ipa: '/m/', exampleWord: 'Mal', exampleTranslation: 'Mountain', description: 'Bilabial nasal.', imageUrl: getPlaceholder('Mal') },
  { id: 'n', char: 'N', isNasal: false, isDigraph: false, ipa: '/n/', exampleWord: 'Natë', exampleTranslation: 'Night', description: 'Alveolar nasal.', imageUrl: getPlaceholder('Natë') },
  { id: 'nj', char: 'Nj', isNasal: false, isDigraph: true, ipa: '/ɲ/', exampleWord: 'Njeri', exampleTranslation: 'Human', description: 'Palatal nasal.', imageUrl: getPlaceholder('Njeri') },
  { id: 'o', char: 'O', isNasal: false, isDigraph: false, ipa: '/o/', exampleWord: 'Orë', exampleTranslation: 'Clock', description: 'Open-mid back rounded vowel.', imageUrl: getPlaceholder('Orë') },
  { id: 'p', char: 'P', isNasal: false, isDigraph: false, ipa: '/p/', exampleWord: 'Punë', exampleTranslation: 'Work', description: 'Voiceless bilabial plosive.', imageUrl: getPlaceholder('Punë') },
  { id: 'q', char: 'Q', isNasal: false, isDigraph: false, ipa: '/c/', exampleWord: 'Qen', exampleTranslation: 'Dog', description: 'Voiceless palatal plosive.', imageUrl: getPlaceholder('Qen') },
  { id: 'r', char: 'R', isNasal: false, isDigraph: false, ipa: '/ɾ/', exampleWord: 'Re', exampleTranslation: 'Cloud', description: 'Alveolar tap.', imageUrl: getPlaceholder('Re') },
  { id: 'rr', char: 'Rr', isNasal: false, isDigraph: true, ipa: '/r/', exampleWord: 'Rrugë', exampleTranslation: 'Road', description: 'Alveolar trill (Rolled R).', imageUrl: getPlaceholder('Rrugë') },
  { id: 's', char: 'S', isNasal: false, isDigraph: false, ipa: '/s/', exampleWord: 'Sot', exampleTranslation: 'Today', description: 'Voiceless alveolar fricative.', imageUrl: getPlaceholder('Sot') },
  { id: 'sh', char: 'Sh', isNasal: false, isDigraph: true, ipa: '/ʃ/', exampleWord: 'Shpi', exampleTranslation: 'House (Geg)', description: 'Voiceless postalveolar fricative.', imageUrl: getPlaceholder('Shpi') },
  { id: 't', char: 'T', isNasal: false, isDigraph: false, ipa: '/t/', exampleWord: 'Tokë', exampleTranslation: 'Earth', description: 'Voiceless alveolar plosive.', imageUrl: getPlaceholder('Tokë') },
  { id: 'th', char: 'Th', isNasal: false, isDigraph: true, ipa: '/θ/', exampleWord: 'Thikë', exampleTranslation: 'Knife', description: 'Voiceless dental fricative.', imageUrl: getPlaceholder('Thikë') },
  { id: 'u', char: 'U', isNasal: false, isDigraph: false, ipa: '/u/', exampleWord: 'Ujë', exampleTranslation: 'Water', description: 'Close back rounded vowel.', imageUrl: getPlaceholder('Ujë') },
  { id: 'v', char: 'V', isNasal: false, isDigraph: false, ipa: '/v/', exampleWord: 'Vlla', exampleTranslation: 'Brother (Geg)', description: 'Voiced labiodental fricative.', imageUrl: getPlaceholder('Vlla') },
  { id: 'x', char: 'X', isNasal: false, isDigraph: false, ipa: '/dz/', exampleWord: 'Xixë', exampleTranslation: 'Spark', description: 'Voiced alveolar affricate.', imageUrl: getPlaceholder('Xixë') },
  { id: 'xh', char: 'Xh', isNasal: false, isDigraph: true, ipa: '/dʒ/', exampleWord: 'Xham', exampleTranslation: 'Glass', description: 'Voiced postalveolar affricate.', imageUrl: getPlaceholder('Xham') },
  { id: 'y', char: 'Y', isNasal: false, isDigraph: false, ipa: '/y/', exampleWord: 'Yll', exampleTranslation: 'Star', description: 'Close front rounded vowel.', imageUrl: getPlaceholder('Yll') },
  { id: 'z', char: 'Z', isNasal: false, isDigraph: false, ipa: '/z/', exampleWord: 'Zemër', exampleTranslation: 'Heart', description: 'Voiced alveolar fricative.', imageUrl: getPlaceholder('Zemër') },
  { id: 'zh', char: 'Zh', isNasal: false, isDigraph: true, ipa: '/ʒ/', exampleWord: 'Zhurmë', exampleTranslation: 'Noise', description: 'Voiced postalveolar fricative.', imageUrl: getPlaceholder('Zhurmë') },
  
  // GEG DISTINCTIVE NASALS
  { id: 'â', char: 'Â', isNasal: true, isDigraph: false, ipa: '/ã/', exampleWord: 'Hâna', exampleTranslation: 'The Moon', description: 'Nasal A. Replaces standard "ë" in many Geg words (Hëna -> Hâna).', imageUrl: getPlaceholder('Hâna', 'fecaca') },
  { id: 'ê', char: 'Ê', isNasal: true, isDigraph: false, ipa: '/ẽ/', exampleWord: 'Kênë', exampleTranslation: 'Been', description: 'Nasal E. Common in Geg participles (qenë -> kênë).', imageUrl: getPlaceholder('Kênë', 'fecaca') },
  { id: 'î', char: 'Î', isNasal: true, isDigraph: false, ipa: '/ĩ/', exampleWord: 'Hî', exampleTranslation: 'Ash/Enter', description: 'Nasal I. A distinct phonetic marker of the Geg people.', imageUrl: getPlaceholder('Hî', 'fecaca') },
  { id: 'ô', char: 'Ô', isNasal: true, isDigraph: false, ipa: '/õ/', exampleWord: 'Zô', exampleTranslation: 'Voice', description: 'Nasal O. Distinctive Geg vocalization (Zë -> Zô).', imageUrl: getPlaceholder('Zô', 'fecaca') },
  { id: 'û', char: 'Û', isNasal: true, isDigraph: false, ipa: '/ũ/', exampleWord: 'Gjû', exampleTranslation: 'Knee', description: 'Nasal U. Authentic Geg pronunciation (Gju -> Gjû).', imageUrl: getPlaceholder('Gjû', 'fecaca') }
];

const AlphabetPage: React.FC<AlphabetPageProps> = ({ lang, isEditing }) => {
  const [letters, setLetters] = useState<AlphabetLetter[]>(INITIAL_ALPHABET);
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  
  const fileInputAudioRef = useRef<HTMLInputElement>(null);
  const fileInputImageRef = useRef<HTMLInputElement>(null);
  const gridInputRef = useRef<HTMLInputElement>(null);

  const isGeg = lang === 'geg';

  useEffect(() => {
    loadAlphabet();
  }, []);

  const loadAlphabet = async () => {
      try {
          const stored = await db.getAll<AlphabetLetter>(Stores.Alphabet);
          if (stored && stored.length > 0) {
              setLetters(stored);
          }
      } catch (e) {
          console.warn("Could not load alphabet from DB", e);
      }
  };

  const handleSaveAll = async () => {
      setIsSaving(true);
      try {
          // Clear current and rewrite
          await db.clearStore(Stores.Alphabet);
          for (const letter of letters) {
              await db.put(Stores.Alphabet, letter);
          }
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
      } catch (e) {
          console.error("Save failed", e);
          alert("Failed to save changes to database.");
      } finally {
          setIsSaving(false);
      }
  };

  const openLetter = (letter: AlphabetLetter) => {
    setSelectedLetter(letter);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLetter(null);
  };

  const handleUpdate = (field: keyof AlphabetLetter, value: any) => {
    if (!selectedLetter) return;
    const updated = { ...selectedLetter, [field]: value };
    setSelectedLetter(updated);
    setLetters(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const handleInlineUpdate = (id: string, field: keyof AlphabetLetter, value: any) => {
      setLetters(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'image') => {
    if (!selectedLetter || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    if (type === 'audio') {
      handleUpdate('audioUrl', url);
    } else {
      handleUpdate('imageUrl', url);
    }
  };

  const triggerGridUpload = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setUploadTargetId(id);
    gridInputRef.current?.click();
  };

  const handleGridFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && uploadTargetId) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        setLetters(prev => prev.map(l => l.id === uploadTargetId ? { ...l, imageUrl: url } : l));
        setUploadTargetId(null);
    }
  };

  const playAudio = (e?: React.MouseEvent, letter?: AlphabetLetter) => {
    if (e) e.stopPropagation();
    const target = letter || selectedLetter;
    if (!target) return;

    if (target.audioUrl) {
      const audio = new Audio(target.audioUrl);
      audio.play().catch(console.error);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`${target.char}. ${target.exampleWord}`);
        utterance.lang = 'sq-AL';
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const generateAIImage = async () => {
    if (!selectedLetter || isGenerating) return;
    setIsGenerating(true);
    try {
        const image = await fetchKidIllustration(`${selectedLetter.exampleWord} (Albanian context), simple cute illustration, no text`);
        if (image) {
            handleUpdate('imageUrl', image);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  const addNewCard = () => {
    const newId = `custom_${Date.now()}`;
    const newCard: AlphabetLetter = {
        id: newId,
        char: '?',
        isNasal: false,
        isDigraph: false,
        ipa: '/?/',
        exampleWord: 'New Word',
        exampleTranslation: 'Translation',
        description: 'Description',
        imageUrl: getPlaceholder('New')
    };
    setLetters([...letters, newCard]);
    openLetter(newCard);
  };

  const deleteCard = () => {
      if (!selectedLetter) return;
      if (window.confirm("Are you sure you want to delete this card?")) {
          setLetters(prev => prev.filter(l => l.id !== selectedLetter.id));
          closeModal();
      }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20 relative">
      
      {/* Hidden input for grid uploads */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={gridInputRef}
        onChange={handleGridFileChange}
      />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 dark:bg-white rounded-3xl mb-6 shadow-xl border-4 border-gray-100 dark:border-gray-800">
           <span className="font-serif font-black text-4xl text-white dark:text-gray-900">Aa</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-4">
           {isGeg ? 'Alfabeti i ' : 'The Alphabet of the '}<span className="text-albanian-red">Geg People</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto mb-8">
            {isGeg 
              ? '36 shkronjat standarde plus zanoret hundore karakteristike të bashkësisë Gege.' 
              : 'The 36 standard letters plus the distinctive nasal vowels of the Geg community.'}
        </p>

        {isEditing && (
            <div className="flex justify-center gap-4">
                <button 
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black shadow-lg transition-all ${saveSuccess ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} disabled:opacity-50`}
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : saveSuccess ? <CheckCircle className="w-5 h-5"/> : <Save className="w-5 h-5"/>}
                    {isSaving ? 'Saving...' : saveSuccess ? 'Changes Saved' : 'Save Alphabet Data'}
                </button>
                <button 
                    onClick={loadAlphabet}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4"/> Reset to Stored
                </button>
            </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4">
        {letters.map((letter) => (
          <div
            key={letter.id}
            onClick={() => !isEditing && openLetter(letter)}
            className={`aspect-[3/4] rounded-3xl flex flex-col items-center justify-between border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden ${
              letter.isNasal 
                ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50 hover:border-red-400' 
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
            } ${!isEditing ? 'cursor-pointer' : ''}`}
          >
            {/* Image Area */}
            <div className="w-full h-[60%] bg-gray-50 dark:bg-gray-700 relative overflow-hidden">
                {letter.imageUrl ? (
                    <img src={letter.imageUrl} alt={letter.exampleWord} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <ImageIcon className="w-8 h-8" />
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>

                {isEditing && (
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
                        <button 
                            onClick={(e) => triggerGridUpload(e, letter.id)}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-gray-700 dark:text-gray-300 hover:text-blue-600 shadow-md hover:scale-110 transition-all"
                            title="Upload Image"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); openLetter(letter); }}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-indigo-600 shadow-md hover:scale-110 transition-all"
                            title="Detail Edit"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </div>
                )}
                
                <button 
                    onClick={(e) => playAudio(e, letter)}
                    className="absolute bottom-3 right-3 p-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full text-albanian-red shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
                >
                    <Volume2 className="w-5 h-5" />
                </button>
                
                {isEditing ? (
                    <input 
                        value={letter.char}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleInlineUpdate(letter.id, 'char', e.target.value)}
                        className="absolute bottom-2 left-4 w-16 text-5xl font-black text-white drop-shadow-md font-serif leading-none bg-transparent border-b-2 border-white/30 focus:border-white focus:outline-none"
                    />
                ) : (
                    <span className="absolute bottom-2 left-4 text-5xl font-black text-white drop-shadow-md font-serif leading-none">
                        {letter.char}
                    </span>
                )}
            </div>

            {/* Content Bottom */}
            <div className="flex-grow flex flex-col items-start justify-center p-4 w-full bg-white dark:bg-gray-800 relative">
                {isEditing ? (
                    <div className="w-full space-y-1">
                        <input 
                            value={letter.exampleWord}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleInlineUpdate(letter.id, 'exampleWord', e.target.value)}
                            className="w-full text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded px-1"
                            placeholder="Word"
                        />
                        <input 
                            value={letter.exampleTranslation}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleInlineUpdate(letter.id, 'exampleTranslation', e.target.value)}
                            className="w-full text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded px-1"
                            placeholder="Translation"
                        />
                    </div>
                ) : (
                    <>
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate w-full leading-tight">{letter.exampleWord}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate w-full">{letter.exampleTranslation}</span>
                    </>
                )}
                
                <div className="absolute top-0 right-4 -mt-3 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-600 shadow-sm text-[10px] font-mono text-gray-500 dark:text-gray-300">
                    {isEditing ? (
                        <input 
                            value={letter.ipa}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleInlineUpdate(letter.id, 'ipa', e.target.value)}
                            className="w-12 text-center bg-transparent focus:outline-none"
                        />
                    ) : (
                        `[${letter.ipa}]`
                    )}
                </div>
            </div>

            {letter.isNasal && !isEditing && (
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-albanian-red text-white text-[10px] font-bold uppercase tracking-wider shadow-sm z-20">Nasal</span>
            )}
            
            {isEditing && (
                <div className="absolute top-3 left-3 z-20 flex gap-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleInlineUpdate(letter.id, 'isNasal', !letter.isNasal); }}
                        className={`p-1 rounded-md text-[8px] font-black uppercase transition-colors ${letter.isNasal ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}
                    >
                        Nasal
                    </button>
                </div>
            )}
          </div>
        ))}

        {/* Add Card Button */}
        {isEditing && (
            <button 
                onClick={addNewCard}
                className="aspect-[3/4] rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600 hover:border-albanian-red hover:text-albanian-red hover:bg-red-50 dark:hover:bg-red-900/10 transition-all gap-2"
            >
                <PlusCircle className="w-10 h-10" />
                <span className="font-bold text-base">Add New Letter</span>
            </button>
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedLetter && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-[40px] w-full max-w-4xl relative overflow-hidden shadow-2xl animate-scale-in flex flex-col md:flex-row min-h-[600px] border border-gray-100 dark:border-gray-800">
            
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Left Side: Letter Visualization */}
            <div className={`w-full md:w-5/12 flex flex-col items-center justify-center p-12 ${selectedLetter.isNasal ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
               
               {isEditing ? (
                   <input 
                      value={selectedLetter.char}
                      onChange={(e) => handleUpdate('char', e.target.value)}
                      className="text-9xl font-black font-serif mb-6 text-center bg-transparent border-b-4 border-dashed border-gray-300 dark:border-gray-600 focus:border-albanian-red focus:outline-none w-3/4 text-gray-900 dark:text-white"
                   />
               ) : (
                    <span className={`text-[12rem] font-black font-serif mb-6 ${selectedLetter.isNasal ? 'text-albanian-red' : 'text-gray-900 dark:text-white'} leading-none`}>
                        {selectedLetter.char}
                    </span>
               )}

               {isEditing ? (
                   <div className="w-full flex flex-col items-center gap-2">
                       <label className="text-[10px] font-black uppercase text-gray-400">IPA Transcription</label>
                       <input 
                          value={selectedLetter.ipa}
                          onChange={(e) => handleUpdate('ipa', e.target.value)}
                          className="text-2xl font-mono text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-2 rounded-2xl shadow-sm w-3/4 border border-gray-200 dark:border-gray-600"
                       />
                   </div>
               ) : (
                    <span className="text-3xl font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-6 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        [{selectedLetter.ipa}]
                    </span>
               )}

               <button 
                 onClick={() => playAudio()}
                 className="mt-12 w-20 h-20 rounded-full bg-white dark:bg-gray-700 shadow-xl flex items-center justify-center text-albanian-red hover:scale-110 active:scale-95 transition-transform border border-gray-100 dark:border-gray-600"
               >
                 <Volume2 className="w-10 h-10" />
               </button>
               <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{isGeg ? 'Ndëgjo Shqiptimin' : 'Listen to Sound'}</p>
            </div>

            {/* Right Side: Details */}
            <div className="w-full md:w-7/12 p-10 flex flex-col overflow-y-auto bg-white dark:bg-gray-900 custom-scrollbar">
               <div className="mb-8">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Info className="w-4 h-4" /> {isGeg ? 'Përshkrimi' : 'Linguistic Notes'}
                    </h3>
                    {isEditing && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleUpdate('isNasal', !selectedLetter.isNasal)}
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${selectedLetter.isNasal ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'}`}
                            >
                                Nasal
                            </button>
                            <button 
                                onClick={() => handleUpdate('isDigraph', !selectedLetter.isDigraph)}
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${selectedLetter.isDigraph ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'}`}
                            >
                                Digraph
                            </button>
                        </div>
                    )}
                 </div>
                 {isEditing ? (
                   <textarea
                     className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all font-medium"
                     value={selectedLetter.description}
                     onChange={(e) => handleUpdate('description', e.target.value)}
                     rows={4}
                     placeholder="Detailed description of the sound and its usage in the Geg language..."
                   />
                 ) : (
                   <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg font-medium">{selectedLetter.description}</p>
                 )}
               </div>

               <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[32px] p-8 mb-8 relative hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors shadow-sm">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
                     {isGeg ? 'Fjala Shembull' : 'Anchor Word'}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                      <div className="relative group shrink-0">
                        {selectedLetter.imageUrl ? (
                            <img src={selectedLetter.imageUrl} alt={selectedLetter.exampleWord} className="w-32 h-32 object-cover rounded-3xl shadow-md bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-600" />
                        ) : (
                            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center text-gray-300 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-600">
                                <ImageIcon className="w-12 h-12" />
                            </div>
                        )}
                        {isEditing && (
                            <button 
                                onClick={generateAIImage}
                                disabled={isGenerating}
                                className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                                title="Generate heritage illustration with AI"
                            >
                                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            </button>
                        )}
                      </div>
                      
                      <div className="flex-grow pt-2 text-center sm:text-left w-full">
                          {isEditing ? (
                             <div className="flex flex-col gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Word (Geg)</label>
                                    <input 
                                      className="w-full font-serif text-3xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-400"
                                      value={selectedLetter.exampleWord}
                                      onChange={(e) => handleUpdate('exampleWord', e.target.value)}
                                      placeholder="e.g. Hâna"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Translation</label>
                                    <input 
                                      className="w-full text-gray-600 dark:text-gray-300 italic text-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-400"
                                      value={selectedLetter.exampleTranslation}
                                      onChange={(e) => handleUpdate('exampleTranslation', e.target.value)}
                                      placeholder="e.g. The Moon"
                                    />
                                </div>
                             </div>
                          ) : (
                             <>
                                <p className="text-4xl font-serif font-black text-gray-900 dark:text-white mb-2 leading-none">{selectedLetter.exampleWord}</p>
                                <p className="text-gray-500 dark:text-gray-400 italic text-2xl">{selectedLetter.exampleTranslation}</p>
                             </>
                          )}
                      </div>
                  </div>

                  {isEditing && (
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 space-y-6">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
                                   <Volume2 className="w-3 h-3" /> Audio File
                               </label>
                               <input 
                                 type="file" 
                                 accept="audio/*" 
                                 className="hidden" 
                                 ref={fileInputAudioRef}
                                 onChange={(e) => handleFileUpload(e, 'audio')}
                               />
                               <div className="flex gap-2">
                                   <button 
                                     onClick={() => fileInputAudioRef.current?.click()}
                                     className="flex-grow flex items-center justify-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 px-4 py-3 rounded-xl transition-all border border-gray-200 dark:border-gray-600"
                                   >
                                     <Upload className="w-4 h-4" /> {selectedLetter.audioUrl ? 'Replace Audio' : 'Upload Audio'}
                                   </button>
                                   {selectedLetter.audioUrl && (
                                       <button onClick={() => handleUpdate('audioUrl', undefined)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900">
                                           <Trash2 className="w-4 h-4" />
                                       </button>
                                   )}
                               </div>
                           </div>

                           <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
                                   <ImageIcon className="w-3 h-3" /> Image File
                               </label>
                               <input 
                                 type="file" 
                                 accept="image/*" 
                                 className="hidden" 
                                 ref={fileInputImageRef}
                                 onChange={(e) => handleFileUpload(e, 'image')}
                               />
                               <div className="flex gap-2">
                                   <button 
                                     onClick={() => fileInputImageRef.current?.click()}
                                     className="flex-grow flex items-center justify-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 px-4 py-3 rounded-xl transition-all border border-gray-200 dark:border-gray-600"
                                   >
                                     <Upload className="w-4 h-4" /> {selectedLetter.imageUrl ? 'Replace Image' : 'Upload Image'}
                                   </button>
                                   {selectedLetter.imageUrl && (
                                       <button onClick={() => handleUpdate('imageUrl', undefined)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900">
                                           <Trash2 className="w-4 h-4" />
                                       </button>
                                   )}
                               </div>
                           </div>
                       </div>
                       
                       <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-400">Direct Media URLs (Advanced)</label>
                           <div className="grid grid-cols-1 gap-2">
                               <input 
                                 value={selectedLetter.imageUrl || ''} 
                                 onChange={(e) => handleUpdate('imageUrl', e.target.value)}
                                 className="w-full text-[10px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-2 font-mono dark:text-white"
                                 placeholder="Image URL (HTTPS)"
                               />
                               <input 
                                 value={selectedLetter.audioUrl || ''} 
                                 onChange={(e) => handleUpdate('audioUrl', e.target.value)}
                                 className="w-full text-[10px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-2 font-mono dark:text-white"
                                 placeholder="Audio URL (HTTPS)"
                               />
                           </div>
                       </div>
                    </div>
                  )}
               </div>
               
               {isEditing && (
                 <div className="mt-auto flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button 
                        onClick={deleteCard}
                        className="flex items-center gap-2 text-red-500 px-6 py-3 rounded-2xl font-black hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                    >
                        <Trash2 className="w-5 h-5" /> Delete Entry
                    </button>
                    <button onClick={closeModal} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-gray-900 px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                       <CheckCircle className="w-6 h-6" /> Save Entry
                    </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlphabetPage;
