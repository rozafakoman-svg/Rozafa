import React, { useState } from 'react';
import { AlphabetData } from '../types';
import { fetchAlphabetWord, fetchKidIllustration } from '../services/geminiService';
import { Loader2, Volume2, ArrowLeft, Image as ImageIcon } from './Icons';

const ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'Dh', 'E', 'Ë', 'F', 'G', 'Gj', 'H', 
  'I', 'J', 'K', 'L', 'Ll', 'M', 'N', 'Nj', 'O', 'P', 'Q', 'R', 
  'Rr', 'S', 'Sh', 'T', 'Th', 'U', 'V', 'X', 'Xh', 'Y', 'Z', 'Zh'
];

const AlphabetGame: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [data, setData] = useState<AlphabetData | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLetterClick = async (letter: string) => {
    setSelectedLetter(letter);
    setLoading(true);
    setData(null);
    setImage(null);

    try {
      // Parallel fetch for speed
      const letterData = await fetchAlphabetWord(letter);
      setData(letterData);
      
      const img = await fetchKidIllustration(letterData.imagePrompt);
      setImage(img);
    } catch (e) {
      console.error("Alphabet error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sq-AL'; 
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (selectedLetter && (loading || data)) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden min-h-[500px] flex flex-col">
         {/* Detail View */}
         <div className="bg-pink-400 p-4 flex items-center text-white">
            <button 
              onClick={() => setSelectedLetter(null)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
               <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg ml-2">Back to Alphabet</span>
         </div>

         <div className="flex-grow p-8 flex flex-col items-center justify-center text-center">
            {loading ? (
               <div className="space-y-4">
                  <Loader2 className="w-12 h-12 text-pink-400 animate-spin mx-auto" />
                  <p className="text-pink-300 font-bold text-xl animate-pulse">Finding a magic word...</p>
               </div>
            ) : data ? (
               <div className="max-w-md w-full animate-fade-in-up">
                  <div className="mb-8 relative group cursor-pointer" onClick={() => handleSpeak(data.word)}>
                     <div className="aspect-square rounded-3xl bg-pink-50 border-4 border-pink-200 overflow-hidden shadow-sm flex items-center justify-center relative">
                        {image ? (
                           <img src={image} alt={data.word} className="w-full h-full object-cover" />
                        ) : (
                           <ImageIcon className="w-20 h-20 text-pink-200" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Volume2 className="w-16 h-16 text-white drop-shadow-lg" />
                        </div>
                     </div>
                  </div>

                  <h1 className="text-6xl font-black text-gray-800 mb-2">{data.word}</h1>
                  <p className="text-2xl text-pink-500 font-medium mb-6">{data.pronunciation}</p>
                  
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-6">
                     <p className="text-xl text-gray-700 italic">"{data.exampleSentence}"</p>
                  </div>

                  <p className="text-gray-400 uppercase tracking-widest font-bold text-sm">English: {data.translation}</p>
               </div>
            ) : (
               <div className="text-red-400">Oops! Something went wrong.</div>
            )}
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
       <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Abetare Adventure</h2>
          <p className="text-gray-500">Pick a letter to learn a new word!</p>
       </div>

       <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4">
          {ALPHABET.map((letter) => (
             <button
               key={letter}
               onClick={() => handleLetterClick(letter)}
               className="aspect-square rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-pink-400 hover:from-pink-50 hover:to-pink-100 hover:scale-105 transition-all duration-200 flex items-center justify-center group"
             >
                <span className="text-2xl sm:text-3xl font-black text-gray-700 group-hover:text-pink-500">{letter}</span>
             </button>
          ))}
       </div>
    </div>
  );
};

export default AlphabetGame;