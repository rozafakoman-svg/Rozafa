import React, { useState, useRef } from 'react';
import { AlphabetLetter } from '../types';
import { Language } from '../App';
import { Volume2, Upload, Image as ImageIcon, X, Edit3, Save, Info, Type, PlusCircle, Trash2, Sparkles, Loader2, PlayCircle } from './Icons';
import { fetchKidIllustration } from '../services/geminiService';

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
  { id: 'â', char: 'Â', isNasal: true, isDigraph: false, ipa: '/ã/', exampleWord: 'Hâna', exampleTranslation: 'The Moon', description: 'Nasal A. Replaces standard "ë" in many words (Hëna -> Hâna).', imageUrl: getPlaceholder('Hâna', 'fecaca') },
  { id: 'ê', char: 'Ê', isNasal: true, isDigraph: false, ipa: '/ẽ/', exampleWord: 'Kênë', exampleTranslation: 'Been', description: 'Nasal E. Often found in participles (qenë -> kênë).', imageUrl: getPlaceholder('Kênë', 'fecaca') },
  { id: 'î', char: 'Î', isNasal: true, isDigraph: false, ipa: '/ĩ/', exampleWord: 'Hî', exampleTranslation: 'Ash/Enter', description: 'Nasal I. Less common, but distinct in deep Geg.', imageUrl: getPlaceholder('Hî', 'fecaca') },
  { id: 'ô', char: 'Ô', isNasal: true, isDigraph: false, ipa: '/õ/', exampleWord: 'Zô', exampleTranslation: 'Voice', description: 'Nasal O. (Zë -> Zô).', imageUrl: getPlaceholder('Zô', 'fecaca') },
  { id: 'û', char: 'Û', isNasal: true, isDigraph: false, ipa: '/ũ/', exampleWord: 'Gjû', exampleTranslation: 'Knee', description: 'Nasal U. (Gju -> Gjû).', imageUrl: getPlaceholder('Gjû', 'fecaca') }
];

const AlphabetPage: React.FC<AlphabetPageProps> = ({ lang, isEditing }) => {
  const [letters, setLetters] = useState<AlphabetLetter[]>(INITIAL_ALPHABET);
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  
  const fileInputAudioRef = useRef<HTMLInputElement>(null);
  const fileInputImageRef = useRef<HTMLInputElement>(null);
  const gridInputRef = useRef<HTMLInputElement>(null);

  const isGeg = lang === 'geg';

  const openLetter = (letter: AlphabetLetter) => {
    setSelectedLetter(letter);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLetter(null);
  };

  const handleUpdate = (field: keyof AlphabetLetter, value: string) => {
    if (!selectedLetter) return;
    const updated = { ...selectedLetter, [field]: value };
    setSelectedLetter(updated);
    setLetters(prev => prev.map(l => l.id === updated.id ? updated : l));
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

  // Direct Grid Upload
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
      audio.play();
    } else {
      // Fallback text-to-speech for demo
      if ('speechSynthesis' in window) {
        // Speak the Letter then the Word
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
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20">
      
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
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-3xl mb-6 shadow-xl border-4 border-gray-100">
           <span className="font-serif font-black text-4xl text-white">Aa</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 mb-4">
           {isGeg ? 'Alfabeti i ' : 'The Alphabet of '}<span className="text-albanian-red">Gegenishtes</span>
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            {isGeg 
              ? '36 shkronjat standarde plus zanoret hundore karakteristike të Veriut.' 
              : 'The 36 standard letters plus the distinctive nasal vowels of the North.'}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4">
        {letters.map((letter) => (
          <div
            key={letter.id}
            onClick={() => openLetter(letter)}
            className={`aspect-[3/4] rounded-3xl flex flex-col items-center justify-between border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden cursor-pointer ${
              letter.isNasal 
                ? 'bg-red-50/50 border-red-200 hover:border-red-400' 
                : 'bg-white border-gray-100 hover:border-blue-300'
            }`}
          >
            {/* Image Area - Expanded Height */}
            <div className="w-full h-[65%] bg-gray-50 relative overflow-hidden">
                {letter.imageUrl ? (
                    <img src={letter.imageUrl} alt={letter.exampleWord} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon className="w-8 h-8" />
                    </div>
                )}
                
                {/* Image Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>

                {/* Direct Upload Button (Edit Mode) */}
                {isEditing && (
                    <button 
                        onClick={(e) => triggerGridUpload(e, letter.id)}
                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-blue-600 shadow-md hover:scale-110 transition-all z-20"
                        title="Upload Image"
                    >
                        <Upload className="w-4 h-4" />
                    </button>
                )}
                
                {/* Sound Player Overlay */}
                <button 
                    onClick={(e) => playAudio(e, letter)}
                    className="absolute bottom-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm rounded-full text-albanian-red shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
                >
                    <Volume2 className="w-5 h-5" />
                </button>
                
                {/* Big Char Overlay on Image */}
                <span className="absolute bottom-2 left-4 text-5xl font-black text-white drop-shadow-md font-serif leading-none">
                    {letter.char}
                </span>
            </div>

            {/* Content Bottom */}
            <div className="flex-grow flex flex-col items-start justify-center p-4 w-full bg-white relative">
                {/* Example Word */}
                <span className="text-lg font-bold text-gray-800 truncate w-full leading-tight">{letter.exampleWord}</span>
                <span className="text-xs text-gray-400 font-medium truncate w-full">{letter.exampleTranslation}</span>
                
                <div className="absolute top-0 right-4 -mt-3 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm text-[10px] font-mono text-gray-500">
                    [{letter.ipa}]
                </div>
            </div>

            {letter.isNasal && (
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-albanian-red text-white text-[10px] font-bold uppercase tracking-wider shadow-sm z-20">Nasal</span>
            )}
          </div>
        ))}

        {/* Add Card Button (Only in Edit Mode) */}
        {isEditing && (
            <button 
                onClick={addNewCard}
                className="aspect-[3/4] rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 hover:border-albanian-red hover:text-albanian-red hover:bg-red-50 transition-all gap-2"
            >
                <PlusCircle className="w-10 h-10" />
                <span className="font-bold text-base">Add New Letter</span>
            </button>
        )}
      </div>

      {/* Legend */}
      <div className="mt-12 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
           <span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></span>
           <span className="text-gray-600">Standard</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></span>
           <span className="text-albanian-red font-bold">Nasal (Geg)</span>
        </div>
      </div>

      {/* Modal Detail View */}
      {isModalOpen && selectedLetter && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl relative overflow-hidden shadow-2xl animate-scale-in flex flex-col md:flex-row min-h-[500px]">
            
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Left Side: Letter Visualization */}
            <div className={`w-full md:w-5/12 flex flex-col items-center justify-center p-8 ${selectedLetter.isNasal ? 'bg-red-50' : 'bg-gray-50'}`}>
               
               {/* Editable Char */}
               {isEditing ? (
                   <input 
                      value={selectedLetter.char}
                      onChange={(e) => handleUpdate('char', e.target.value)}
                      className="text-8xl font-black font-serif mb-4 text-center bg-transparent border-b-2 border-dashed border-gray-300 focus:border-albanian-red focus:outline-none w-1/2"
                   />
               ) : (
                    <span className={`text-9xl font-black font-serif mb-4 ${selectedLetter.isNasal ? 'text-albanian-red' : 'text-gray-900'}`}>
                        {selectedLetter.char}
                    </span>
               )}

               {isEditing ? (
                   <input 
                      value={selectedLetter.ipa}
                      onChange={(e) => handleUpdate('ipa', e.target.value)}
                      className="text-xl font-mono text-center bg-white px-4 py-1 rounded-full shadow-sm w-3/4"
                   />
               ) : (
                    <span className="text-2xl font-mono text-gray-500 bg-white px-4 py-1 rounded-full shadow-sm">
                        [{selectedLetter.ipa}]
                    </span>
               )}

               {/* Audio Play Button Large */}
               <button 
                 onClick={() => playAudio()}
                 className="mt-8 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-albanian-red hover:scale-110 transition-transform"
               >
                 <Volume2 className="w-8 h-8" />
               </button>
            </div>

            {/* Right Side: Details & Admin */}
            <div className="w-full md:w-7/12 p-8 flex flex-col overflow-y-auto bg-white">
               <div className="mb-6">
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {isGeg ? 'Përshkrimi' : 'Description'}
                 </h3>
                 {isEditing ? (
                   <textarea
                     className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                     value={selectedLetter.description}
                     onChange={(e) => handleUpdate('description', e.target.value)}
                     rows={3}
                   />
                 ) : (
                   <p className="text-gray-700 leading-relaxed font-medium">{selectedLetter.description}</p>
                 )}
               </div>

               <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 relative hover:border-blue-200 transition-colors shadow-sm">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                     <span>{isGeg ? 'Fjala Shembull' : 'Example Word'}</span>
                  </h3>
                  
                  <div className="flex items-start gap-6">
                      <div className="relative group">
                        {selectedLetter.imageUrl ? (
                            <img src={selectedLetter.imageUrl} alt={selectedLetter.exampleWord} className="w-24 h-24 object-cover rounded-xl shadow-sm bg-gray-100" />
                        ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                                <ImageIcon className="w-10 h-10" />
                            </div>
                        )}
                        {/* Generate Image Button */}
                        {isEditing && (
                            <button 
                                onClick={generateAIImage}
                                disabled={isGenerating}
                                className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-transform hover:scale-110"
                                title="Generate with AI"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            </button>
                        )}
                      </div>
                      
                      <div className="flex-grow pt-1">
                          {isEditing ? (
                             <div className="flex flex-col gap-2">
                                <input 
                                  className="font-serif text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
                                  value={selectedLetter.exampleWord}
                                  onChange={(e) => handleUpdate('exampleWord', e.target.value)}
                                  placeholder="Word"
                                />
                                <input 
                                  className="text-gray-500 italic bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400 text-sm"
                                  value={selectedLetter.exampleTranslation}
                                  onChange={(e) => handleUpdate('exampleTranslation', e.target.value)}
                                  placeholder="Translation"
                                />
                             </div>
                          ) : (
                             <>
                                <p className="text-3xl font-serif font-bold text-gray-900 mb-1">{selectedLetter.exampleWord}</p>
                                <p className="text-gray-500 italic text-lg">{selectedLetter.exampleTranslation}</p>
                             </>
                          )}
                      </div>
                  </div>

                  {/* Admin Upload Controls */}
                  {isEditing && (
                    <div className="mt-6 pt-4 border-t border-gray-100 flex gap-4">
                       <input 
                         type="file" 
                         accept="audio/*" 
                         className="hidden" 
                         ref={fileInputAudioRef}
                         onChange={(e) => handleFileUpload(e, 'audio')}
                       />
                       <button 
                         onClick={() => fileInputAudioRef.current?.click()}
                         className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors border border-gray-200"
                       >
                         <Upload className="w-3 h-3" /> Upload Audio
                       </button>

                       <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         ref={fileInputImageRef}
                         onChange={(e) => handleFileUpload(e, 'image')}
                       />
                       <button 
                         onClick={() => fileInputImageRef.current?.click()}
                         className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors border border-gray-200"
                       >
                         <Upload className="w-3 h-3" /> Upload Image
                       </button>
                    </div>
                  )}
               </div>
               
               {isEditing && (
                 <div className="mt-auto flex justify-between pt-4 border-t border-gray-100">
                    <button 
                        onClick={deleteCard}
                        className="flex items-center gap-2 text-red-500 px-4 py-2 rounded-xl font-bold hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" /> Delete
                    </button>
                    <button onClick={closeModal} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-colors">
                       <Save className="w-5 h-5" /> Done
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