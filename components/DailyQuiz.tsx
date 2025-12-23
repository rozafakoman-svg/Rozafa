
import React, { useState, useEffect } from 'react';
import { QuizQuestion, DictionaryEntry, Language } from '../types';
import { fetchDailyQuiz } from '../services/geminiService';
import { CheckCircle, XCircle, Loader2, Info, Trophy, RefreshCw, Share2, Zap, ArrowRight, Star, Activity } from './Icons';

interface DailyQuizProps {
  isEditing?: boolean;
  wotd?: DictionaryEntry | null;
  lang: Language;
}

const DailyQuiz: React.FC<DailyQuizProps> = ({ isEditing = false, wotd, lang }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quiz' | 'stats' | 'summary'>('quiz');
  const [points, setPoints] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [sessionResults, setSessionResults] = useState<{correct: number, total: number}>({correct: 0, total: 0});

  const isGeg = lang === 'geg';

  const loadQuizSet = async () => {
    setLoading(true);
    try {
      const data = await fetchDailyQuiz();
      setQuestions(data);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsCorrect(null);
      setClaimed(false);
      setSessionResults({correct: 0, total: data.length});
      setActiveTab('quiz');
    } catch (e) {
      console.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizSet();
  }, []);

  const handleSelect = (index: number) => {
    if (isEditing) return;
    if (selectedOption !== null || questions.length === 0) return;
    
    setSelectedOption(index);
    const correct = index === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
        setPoints(prev => prev + 20);
        setSessionResults(prev => ({...prev, correct: prev.correct + 1}));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
    } else {
        setActiveTab('summary');
    }
  };

  const handleClaim = () => {
    setClaimed(true);
  };

  const handleShare = () => {
    const text = isGeg 
        ? `Zgjidha sfidën ditore në Gegënisht! Gjeta ${sessionResults.correct}/${sessionResults.total} saktë. Provoe dhe ti!`
        : `Just completed the Geg Language daily challenge! I got ${sessionResults.correct}/${sessionResults.total} right. Try it yourself!`;
    navigator.clipboard.writeText(text);
    alert(isGeg ? "U kopjue për shpërndarje!" : "Copied to clipboard!");
  };

  const handleReset = () => {
      loadQuizSet();
  };

  if (loading) return (
    <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-lg border border-gray-100 dark:border-gray-700 p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
       <Loader2 className="w-10 h-10 text-albanian-red animate-spin mb-4" />
       <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">Initializing Challenge...</p>
    </div>
  );

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  const t = {
    eng: {
      usage_profile: "Usage Profile",
      frequency: "Linguistic Vitality",
      freq_common: "Core Vocabulary",
      freq_uncommon: "Functional",
      freq_rare: "Heritage",
      quiz: "Challenge",
      stats: "Language Stats",
      claim: "Claim Rewards",
      next: "Next Question",
      finish: "Show Results",
      points: "Points",
      share: "Share Result",
      quest: "Quest",
      restart: "Restart Daily Quest",
      summary_title: "Challenge Complete!"
    },
    geg: {
      usage_profile: "Profili i Përdorimit",
      frequency: "Gjallnia Gjuhësore",
      freq_common: "Fjalor Thelbësor",
      freq_uncommon: "Funksionale",
      freq_rare: "Trashëgimi",
      quiz: "Sfida",
      stats: "Statistikat",
      claim: "Merr Shpërblimin",
      next: "Pyetja Tjetër",
      finish: "Shiko Rezultatet",
      points: "Pikët",
      share: "Shpërnda",
      quest: "Misioni",
      restart: "Fillo Misionin",
      summary_title: "Sfida u Krye!"
    }
  }[lang];

  const freqScore = wotd?.frequency ?? 50;
  let freqCategory = t.freq_uncommon;
  let freqColor = 'bg-amber-400';
  if (freqScore < 33) {
      freqCategory = t.freq_rare;
      freqColor = 'bg-rose-500';
  } else if (freqScore > 66) {
      freqCategory = t.freq_common;
      freqColor = 'bg-emerald-500';
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl border overflow-hidden h-full flex flex-col transition-all duration-500 group/card ${isEditing ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 dark:border-gray-700'}`}>
       <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                <Star className="w-4 h-4 text-white fill-current" />
             </div>
             <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none block">{t.points}</span>
                <span className="text-sm font-black text-gray-900 dark:text-white leading-none">{points} XP</span>
             </div>
          </div>
          <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
             <button 
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'quiz' || activeTab === 'summary' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}`}
             >
                {t.quiz}
             </button>
             {wotd && (
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-600'}`}
                >
                    {t.stats}
                </button>
             )}
          </div>
       </div>

       <div className="flex-grow flex flex-col relative overflow-hidden">
           {activeTab === 'quiz' && (
             <div className="animate-fade-in flex flex-col h-full">
                <div className="px-8 pt-6 flex gap-1.5">
                   {questions.map((_, i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i < currentIndex ? 'bg-indigo-600' : i === currentIndex ? 'bg-indigo-400 animate-pulse' : 'bg-gray-100 dark:bg-gray-700'}`}></div>
                   ))}
                </div>

                <div className="p-8 pb-4">
                    <div className="inline-flex items-center gap-2 text-indigo-500 mb-4">
                        <Zap className="w-5 h-5 fill-current" />
                        <span className="text-xs font-black uppercase tracking-widest">{t.quest} #{currentIndex + 1}</span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white leading-tight">{currentQuestion.question}</h3>
                </div>

                <div className="p-8 pt-0 flex-grow flex flex-col justify-start space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                        let itemClass = "w-full p-5 rounded-[24px] text-left border-2 transition-all duration-300 font-bold flex justify-between items-center text-sm ";
                        if (selectedOption === null) {
                            itemClass += "border-gray-50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30 hover:border-indigo-400 text-gray-700 dark:text-gray-300 hover:scale-[1.02]";
                        } else {
                            if (idx === currentQuestion.correctAnswer) {
                                itemClass += "border-emerald-500 bg-emerald-50 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400";
                            } else if (idx === selectedOption) {
                                itemClass += "border-rose-500 bg-rose-50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400";
                            } else {
                                itemClass += "border-transparent text-gray-300 opacity-40";
                            }
                        }
                        return (
                            <button 
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                disabled={selectedOption !== null}
                                className={itemClass}
                            >
                                <span className="flex-grow">{option}</span>
                                {selectedOption !== null && idx === currentQuestion.correctAnswer && <CheckCircle className="w-5 h-5" />}
                                {selectedOption !== null && idx === selectedOption && idx !== currentQuestion.correctAnswer && <XCircle className="w-5 h-5" />}
                            </button>
                        );
                    })}
                </div>

                {selectedOption !== null && (
                    <div className="p-8 pt-0 mt-auto animate-fade-in-up">
                        <div className="bg-indigo-50/50 dark:bg-indigo-900/20 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-800/50 mb-6">
                            <h4 className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-[0.2em] mb-2 flex items-center gap-1.5">
                                <Info className="w-3 h-3 fill-current" /> Linguistic Fact
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                {currentQuestion.explanation}
                            </p>
                        </div>
                        
                        <button 
                            onClick={handleNext}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group/next"
                        >
                            {currentIndex < questions.length - 1 ? t.next : t.finish}
                            <ArrowRight className="w-4 h-4 group-hover/next:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
             </div>
           )}

           {activeTab === 'summary' && (
               <div className="p-10 animate-fade-in text-center flex flex-col items-center justify-center h-full">
                   <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-8">
                       <Trophy className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                   </div>
                   <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-white mb-2">{t.summary_title}</h2>
                   <p className="text-gray-500 dark:text-gray-400 mb-8">
                      {isGeg 
                       ? `Keni gjetë saktë ${sessionResults.correct} nga ${sessionResults.total} pyetje.` 
                       : `You correctly answered ${sessionResults.correct} out of ${sessionResults.total} questions.`}
                   </p>

                   <div className="grid grid-cols-2 gap-4 w-full mb-10">
                       <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                           <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Score</span>
                           <span className="text-2xl font-black dark:text-white">{points} XP</span>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                           <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Accuracy</span>
                           <span className="text-2xl font-black dark:text-white">{Math.round((sessionResults.correct / sessionResults.total) * 100)}%</span>
                       </div>
                   </div>

                   <div className="flex flex-col gap-3 w-full">
                       <button 
                         onClick={handleReset} 
                         className="py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                       >
                           <RefreshCw className="w-4 h-4" /> {t.restart}
                       </button>
                   </div>
               </div>
           )}

           {activeTab === 'stats' && (
             <div className="p-8 animate-fade-in space-y-10 h-full flex flex-col">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="text-4xl font-serif font-black text-gray-900 dark:text-white leading-none">"{wotd?.word}"</h3>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t.usage_profile}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] border-2 border-gray-100 dark:border-gray-700 relative shadow-sm">
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed italic font-medium font-serif">
                        "{wotd?.usageNote || (isGeg ? "Kjo asht nji fjalë qi përdoret sidomos në bisedat e lira në Gegënisht." : "Typically found in authentic Geg speech.")}"
                    </p>
                </div>
                
                <button 
                    onClick={() => setActiveTab('quiz')}
                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-xl mt-auto"
                >
                    <ArrowRight className="w-4 h-4" /> Back to Quest
                </button>
             </div>
           )}
       </div>
    </div>
  );
};

export default DailyQuiz;
