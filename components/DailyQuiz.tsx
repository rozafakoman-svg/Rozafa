import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { fetchDailyQuiz } from '../services/geminiService';
import { CheckCircle, XCircle, GraduationCap, Loader2, Sparkles } from './Icons';

interface DailyQuizProps {
  isEditing?: boolean;
}

const DailyQuiz: React.FC<DailyQuizProps> = ({ isEditing = false }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await fetchDailyQuiz();
        setQuestion(data);
      } catch (e) {
        console.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, []);

  const handleSelect = (index: number) => {
    if (isEditing) return; // Disable playing while editing
    if (selectedOption !== null || !question) return;
    setSelectedOption(index);
    setIsCorrect(index === question.correctAnswer);
  };

  const handleUpdate = (field: keyof QuizQuestion, value: any) => {
    if (question) {
        setQuestion({ ...question, [field]: value });
    }
  };

  const handleOptionUpdate = (index: number, value: string) => {
    if (question) {
        const newOptions = [...question.options];
        newOptions[index] = value;
        setQuestion({ ...question, options: newOptions });
    }
  };

  if (loading) return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex items-center justify-center h-full min-h-[300px]">
       <Loader2 className="w-8 h-8 text-albanian-red animate-spin" />
    </div>
  );

  if (!question) return null;

  return (
    <div className={`bg-white rounded-3xl shadow-lg border overflow-hidden h-full flex flex-col ${isEditing ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100'}`}>
       <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/10 w-24 h-24 rounded-full blur-xl"></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <GraduationCap className="w-5 h-5 text-blue-200" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-200">Daily Challenge</h2>
          </div>
          {isEditing ? (
             <textarea 
                value={question.question}
                onChange={(e) => handleUpdate('question', e.target.value)}
                className="w-full bg-blue-900/50 border border-blue-400 rounded p-2 text-white font-medium"
                rows={2}
             />
          ) : (
             <h3 className="text-xl font-medium leading-tight relative z-10">{question.question}</h3>
          )}
       </div>

       <div className="p-6 flex-grow flex flex-col justify-center space-y-3">
          {question.options.map((option, idx) => {
            let itemClass = "w-full p-4 rounded-xl text-left border-2 transition-all duration-200 font-medium flex justify-between items-center";
            
            if (isEditing) {
                itemClass += " border-red-200 bg-red-50";
            } else if (selectedOption === null) {
               itemClass += " border-gray-100 hover:border-blue-200 hover:bg-blue-50 text-gray-700";
            } else {
               if (idx === question.correctAnswer) {
                  itemClass += " border-green-500 bg-green-50 text-green-700";
               } else if (idx === selectedOption) {
                  itemClass += " border-red-500 bg-red-50 text-red-700";
               } else {
                  itemClass += " border-gray-100 text-gray-400 opacity-50";
               }
            }

            return (
              <div key={idx} className="relative w-full">
                  {isEditing ? (
                      <div className="flex items-center gap-2">
                          <input 
                            value={option} 
                            onChange={(e) => handleOptionUpdate(idx, e.target.value)}
                            className="w-full p-3 border border-red-200 rounded bg-red-50" 
                          />
                          <input 
                            type="radio" 
                            name="correctAnswer" 
                            checked={idx === question.correctAnswer} 
                            onChange={() => handleUpdate('correctAnswer', idx)}
                            title="Mark as correct answer"
                          />
                      </div>
                  ) : (
                    <button 
                        onClick={() => handleSelect(idx)}
                        disabled={selectedOption !== null}
                        className={itemClass}
                    >
                        <span>{option}</span>
                        {selectedOption !== null && idx === question.correctAnswer && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {selectedOption !== null && idx === selectedOption && idx !== question.correctAnswer && <XCircle className="w-5 h-5 text-red-600" />}
                    </button>
                  )}
              </div>
            );
          })}
       </div>

       {(selectedOption !== null || isEditing) && (
          <div className="p-6 bg-gray-50 border-t border-gray-100 animate-fade-in-up">
             {isEditing ? (
                 <div>
                    <span className="font-bold text-red-500 text-xs uppercase">Explanation Editor</span>
                    <textarea 
                        value={question.explanation}
                        onChange={(e) => handleUpdate('explanation', e.target.value)}
                        className="w-full p-2 border border-red-200 rounded bg-white text-sm mt-1"
                        rows={3}
                    />
                 </div>
             ) : (
                <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">Explanation: </span> 
                {question.explanation}
                </p>
             )}
          </div>
       )}
    </div>
  );
};

export default DailyQuiz;