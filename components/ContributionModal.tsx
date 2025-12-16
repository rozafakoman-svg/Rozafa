import React, { useState } from 'react';
import { ContributionType, Language } from '../types';
import { X, CheckCircle, Loader2, Trophy, Star, AlertTriangle, Edit3, PlusCircle } from './Icons';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ContributionType;
  initialWord?: string;
  lang: Language;
}

const ContributionModal: React.FC<ContributionModalProps> = ({ isOpen, onClose, type, initialWord, lang }) => {
// ... existing code ...
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [details, setDetails] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('');

  const isGeg = lang === 'geg';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 1500);
  };

  const getPointsEarned = () => {
    switch (type) {
      case 'add_word': return 50;
      case 'suggest_edit': return 20;
      case 'report_error': return 10;
      default: return 5;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'report_error': return isGeg ? 'Raporto Gabim' : 'Report Issue';
      case 'suggest_edit': return isGeg ? 'Sugjero Ndryshim' : 'Suggest Edit';
      case 'add_word': return isGeg ? 'Shto Fjalë të Re' : 'Add New Word';
    }
  };

  const getDescription = () => {
    if (initialWord) {
      return isGeg 
        ? `Kontributi juej për fjalën "${initialWord}"`
        : `Your contribution for "${initialWord}"`;
    }
    return isGeg ? 'Kontributi juej për komunitetin' : 'Your contribution to the community';
  };

  const reportOptions = isGeg 
    ? ['Gabim Drejtshkrimor', 'Përkufizim i Gabuem', 'Mungon Konteksti Kulturor', 'Tjetër']
    : ['Spelling Error', 'Incorrect Definition', 'Missing Cultural Context', 'Other'];

  const handleClose = () => {
    setStep('form');
    setDetails('');
    setSelectedReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg relative overflow-hidden shadow-2xl animate-scale-in border border-gray-100 dark:border-gray-800">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${type === 'report_error' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : type === 'add_word' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                {type === 'report_error' ? <AlertTriangle className="w-6 h-6" /> : type === 'add_word' ? <PlusCircle className="w-6 h-6" /> : <Edit3 className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">{getTitle()}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{getDescription()}</p>
              </div>
            </div>

            <div className="space-y-6">
              {type === 'report_error' && (
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                     {isGeg ? 'Arsyeja' : 'Reason'}
                   </label>
                   <div className="grid grid-cols-2 gap-2">
                      {reportOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedReason(opt)}
                          className={`p-3 text-sm rounded-lg border text-left transition-all ${
                              selectedReason === opt 
                              ? 'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-500 text-red-700 dark:text-red-300 font-medium ring-1 ring-red-500' 
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {type === 'add_word' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                    {isGeg ? 'Fjala e Re' : 'New Word'}
                  </label>
                  <input 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none transition-all font-serif text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder={isGeg ? 'Shkruani fjalën...' : 'Type the word...'}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                  {isGeg ? 'Detaje Shtesë' : 'Additional Details'}
                </label>
                <textarea 
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all min-h-[120px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder={isGeg ? 'Shpjegoni kontributin tuej...' : 'Explain your contribution...'}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">
                  {isGeg ? 'Kontributi juej do të rishikohet nga ekipi.' : 'Your contribution will be reviewed by the team.'}
                </p>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || (type === 'report_error' && !selectedReason)}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                   type === 'report_error' ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none' : 
                   type === 'add_word' ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none' : 
                   'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none'
                } ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] active:scale-95'}`}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isGeg ? 'Dërgo Kontributin' : 'Submit Contribution'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-10 text-center">
             <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Trophy className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                <div className="absolute -top-2 -right-2 bg-red-500 text-white font-black text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  +{getPointsEarned()}
                </div>
             </div>
             
             <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
               {isGeg ? 'Faleminderit!' : 'Thank You!'}
             </h2>
             <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
               {isGeg 
                 ? 'Kontributi juej ndihmon në ruajtjen e gjuhës sonë. Vazhdoni kështu!' 
                 : 'Your contribution helps preserve our language. Keep it up!'}
             </p>

             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-700 dark:text-gray-200">{isGeg ? 'Pikët Totale' : 'Total Points'}</span>
                </div>
                <span className="font-mono font-bold text-xl text-gray-900 dark:text-white">1,240 <span className="text-green-500 dark:text-green-400 text-sm ml-1">(+{getPointsEarned()})</span></span>
             </div>

             <button 
               onClick={handleClose}
               className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors"
             >
               {isGeg ? 'Mbyll' : 'Close'}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributionModal;