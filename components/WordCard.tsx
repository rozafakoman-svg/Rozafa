import React from 'react';
import { DictionaryEntry } from '../types';
import { Volume2, BookOpen, Share2, ArrowRight } from './Icons';

interface WordCardProps {
  entry: DictionaryEntry;
}

const WordCard: React.FC<WordCardProps> = ({ entry }) => {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(entry.word);
      utterance.lang = 'sq-AL'; // Albanian locale
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-albanian-black to-zinc-800 text-white p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-albanian-red rounded-full opacity-20 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-baseline gap-4 flex-wrap">
              <h1 className="text-5xl sm:text-6xl font-serif font-bold tracking-tight">{entry.word}</h1>
              {entry.phonetic && (
                <span className="text-xl text-gray-400 font-mono">/{entry.phonetic}/</span>
              )}
            </div>
            <p className="text-albanian-red mt-2 font-medium tracking-wide uppercase text-sm bg-white/10 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
              {entry.partOfSpeech}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleSpeak}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md group"
              title="Pronounce"
            >
              <Volume2 className="w-6 h-6 text-white group-hover:text-albanian-red transition-colors" />
            </button>
            <button 
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
              title="Share"
              onClick={() => {
                navigator.clipboard.writeText(`${entry.word} - ${entry.definitionEnglish}`);
                alert("Copied to clipboard!");
              }}
            >
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
        
        {entry.dialectRegion && (
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
                <span className="w-2 h-2 rounded-full bg-albanian-red"></span>
                <span>Region: {entry.dialectRegion}</span>
            </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Left Column: Definitions */}
        <div className="md:col-span-8 space-y-10">
          
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Definitions
            </h3>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-albanian-red">
                <p className="text-sm text-gray-500 mb-1">Standard Albanian</p>
                <p className="text-xl text-gray-900 leading-relaxed font-serif">{entry.definitionStandard}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-zinc-400">
                <p className="text-sm text-gray-500 mb-1">English</p>
                <p className="text-xl text-gray-900 leading-relaxed font-serif">{entry.definitionEnglish}</p>
              </div>
            </div>
          </section>

          <section>
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Examples</h3>
             <div className="space-y-4">
                {entry.examples.map((ex, idx) => (
                  <div key={idx} className="group relative pl-6 pb-6 border-l border-gray-200 last:pb-0">
                     <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-gray-300 group-hover:bg-albanian-red transition-colors"></div>
                     <p className="text-lg font-medium text-gray-900 italic mb-1">"{ex.original}"</p>
                     <p className="text-gray-600 mb-1">{ex.standard}</p>
                     <p className="text-sm text-gray-500">{ex.translation}</p>
                  </div>
                ))}
             </div>
          </section>

          {entry.etymology && (
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Etymology</h3>
              <p className="text-gray-700 leading-relaxed">{entry.etymology}</p>
            </section>
          )}
          
          {entry.culturalNote && (
            <section className="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">Cultural Note</h3>
              <p className="text-gray-800 leading-relaxed italic">{entry.culturalNote}</p>
            </section>
          )}

        </div>

        {/* Right Column: Thesaurus */}
        <div className="md:col-span-4 space-y-8">
            <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Synonyms</h3>
                <div className="flex flex-wrap gap-2">
                    {entry.synonyms.length > 0 ? entry.synonyms.map((syn, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-albanian-red hover:text-albanian-red transition-colors cursor-default text-sm">
                            {syn}
                        </span>
                    )) : <span className="text-gray-400 italic text-sm">No synonyms available</span>}
                </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Antonyms</h3>
                <div className="flex flex-wrap gap-2">
                    {entry.antonyms.length > 0 ? entry.antonyms.map((ant, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-gray-400 transition-colors cursor-default text-sm">
                            {ant}
                        </span>
                    )) : <span className="text-gray-400 italic text-sm">No antonyms available</span>}
                </div>
            </div>
            
            <div className="bg-albanian-red/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-albanian-red uppercase tracking-wider mb-2">Gegërisht Fact</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                   Geg (Gegërisht) is one of the two major dialects of Albanian, spoken north of the Shkumbin River, in Kosovo, Montenegro, and Macedonia. It maintains the nasal vowels which are lost in Tosk.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default WordCard;