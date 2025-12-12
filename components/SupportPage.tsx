import React, { useState } from 'react';
import { Language } from '../App';
import { UserProfile, Badge } from '../types';
import { Heart, Shield, Star, Award, Crown, Zap, CheckCircle, CreditCard, X, Loader2, TrendingUp } from './Icons';

interface SupportPageProps {
  lang: Language;
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onReqAuth: () => void;
}

const tiers = [
  {
    id: 'bronze',
    name: 'Bronze',
    nameGeg: 'Bronz',
    price: '$3',
    period: '/mo',
    icon: Shield,
    color: 'text-amber-700 dark:text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    buttonColor: 'bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700',
    features: ['Supporter Badge', 'Ad-free Experience', 'Discord Role'],
    featuresGeg: ['Emblemë Mbështetësi', 'Pa Reklama', 'Rol në Discord'],
    popular: false
  },
  {
    id: 'silver',
    name: 'Silver',
    nameGeg: 'Argjend',
    price: '$5',
    period: '/mo',
    icon: Star,
    color: 'text-slate-500 dark:text-slate-300',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    borderColor: 'border-slate-300 dark:border-slate-600',
    buttonColor: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600',
    features: ['All Bronze Features', 'Name in Credits', 'Monthly Newsletter'],
    featuresGeg: ['Të gjitha benefitet e Bronzit', 'Emri në Kredite', 'Buletin Mujor'],
    popular: false
  },
  {
    id: 'gold',
    name: 'Gold',
    nameGeg: 'Ar',
    price: '$10',
    period: '/mo',
    icon: Award,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600',
    features: ['All Silver Features', 'Vote on Features', 'Priority Support'],
    featuresGeg: ['Të gjitha benefitet e Argjendit', 'Voto për Funksione', 'Mbështetje Prioritare'],
    popular: true
  },
  {
    id: 'platinum',
    name: 'Platinum',
    nameGeg: 'Platin',
    price: '$25',
    period: '/mo',
    icon: Crown,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
    borderColor: 'border-indigo-200 dark:border-indigo-700',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
    features: ['All Gold Features', 'Early Access to Games', 'Digital Certificate'],
    featuresGeg: ['Të gjitha benefitet e Arit', 'Qasje e Hershme në Lojna', 'Certifikatë Digjitale'],
    popular: false
  },
  {
    id: 'diamond',
    name: 'Diamond',
    nameGeg: 'Diamant',
    price: '$50',
    period: '/mo',
    icon: Zap,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-200 dark:border-cyan-700',
    buttonColor: 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600',
    features: ['All Platinum Features', 'Sponsor a Word', 'Private Q&A Session'],
    featuresGeg: ['Të gjitha benefitet e Platinit', 'Sponsorizo nji Fjalë', 'Sesion Pyetje-Përgjigje'],
    popular: false
  },
  {
    id: 'mythic',
    name: 'Mythic',
    nameGeg: 'Legjendë',
    price: '$100',
    period: '/mo',
    icon: Heart,
    color: 'text-albanian-red dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    buttonColor: 'bg-albanian-red hover:bg-red-800',
    features: ['All Diamond Features', 'Lifetime Recognition', 'Executive Producer Credit'],
    featuresGeg: ['Të gjitha benefitet e Diamantit', 'Mirënjohje e Përjetshme', 'Kredit si Producent Ekzekutiv'],
    popular: false
  }
];

const SupportPage: React.FC<SupportPageProps> = ({ lang, user, onUpdateUser, onReqAuth }) => {
  const isGeg = lang === 'geg';
  const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({ name: '', cardNumber: '', expiry: '', cvc: '' });

  // Mock Goal Data
  const monthlyGoal = 2000;
  const currentMonthly = 1250;
  const progressPercent = Math.min((currentMonthly / monthlyGoal) * 100, 100);

  const handleJoinClick = (tier: typeof tiers[0]) => {
     if (!user) {
         onReqAuth();
         return;
     }
     setSelectedTier(tier);
     setShowSuccess(false);
     setPaymentDetails({ name: user.name, cardNumber: '', expiry: '', cvc: '' });
  };

  const handleConfirm = () => {
    if (!paymentDetails.cardNumber || !paymentDetails.cvc) {
        alert(isGeg ? "Ju lutem plotësoni të dhanat" : "Please fill in payment details");
        return;
    }

    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        setShowSuccess(true);
        
        if (user && selectedTier) {
            const newBadge: Badge = {
                id: `badge_${Date.now()}`,
                name: `${selectedTier.name} Supporter`,
                nameGeg: `Mbështetës ${selectedTier.nameGeg}`,
                iconName: 'Heart',
                description: `Subscribed to ${selectedTier.name} tier`,
                descriptionGeg: `Abonue në nivelin ${selectedTier.nameGeg}`,
                color: selectedTier.color.replace('text-', 'bg-').replace('600', '100').replace('700', '100') + ` ${selectedTier.color}`,
                earned: true
            };
            
            const updatedUser: UserProfile = {
                ...user,
                tier: selectedTier.id,
                badges: [...user.badges, newBadge],
                points: user.points + 500
            };
            onUpdateUser(updatedUser);
        }

        setTimeout(() => {
            setShowSuccess(false);
            setSelectedTier(null);
        }, 3000);
    }, 2000);
  };

  const TierIcon = selectedTier?.icon;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20">
       
       <div className="text-center mb-16 px-4">
         <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full mb-6 animate-pulse">
             <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
         </div>
         <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6">
            {isGeg ? 'Mbështetni ' : 'Support '}<span className="text-albanian-red">Gegenisht</span>
         </h1>
         <p className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
             {isGeg 
               ? 'Ndihmoni në ruajtjen e gjuhës sonë. Çdo kontribut shkon drejtpërdrejt për kostot e serverave dhe zhvillimin e inteligjencës artificiale.' 
               : 'Help preserve our language. Every contribution goes directly towards server costs and AI development.'}
         </p>

         {/* Goal Progress */}
         <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-12">
            <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                <span>{isGeg ? 'Qëllimi Mujor (Serverat)' : 'Monthly Goal (Servers)'}</span>
                <span className="text-albanian-red">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-rose-400 to-red-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-400 mt-2">
                <span>${currentMonthly} raised</span>
                <span>${monthlyGoal} goal</span>
            </div>
         </div>

         {user?.tier && (
             <div className="mt-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 inline-block px-6 py-2 rounded-full font-bold shadow-sm">
                 {isGeg ? 'Ju jeni mbështetës aktiv!' : 'You are an active supporter!'} 
                 <span className="uppercase ml-2 bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded text-xs text-green-900 dark:text-white">{user.tier}</span>
             </div>
         )}
       </div>

       {/* Tiers Grid */}
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = user?.tier === tier.id;
            return (
              <div 
                key={tier.id}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col ${
                    isCurrent 
                    ? 'border-green-500 ring-4 ring-green-50 dark:ring-green-900/30' 
                    : tier.popular 
                        ? 'border-yellow-400 ring-4 ring-yellow-50 dark:ring-yellow-900/20' 
                        : tier.borderColor
                } ${tier.id === 'mythic' ? 'shadow-2xl' : 'shadow-sm'}`}
              >
                 {tier.popular && !isCurrent && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
                       <Star className="w-3 h-3 fill-current" /> {isGeg ? 'Ma Popullor' : 'Most Popular'}
                    </div>
                 )}
                 {tier.id === 'mythic' && !isCurrent && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-albanian-red text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                       {isGeg ? 'Vlera ma e lartë' : 'Highest Value'}
                    </div>
                 )}
                 {isCurrent && (
                    <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-green-500 text-white rounded-full p-2 shadow-md">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                 )}

                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${tier.bgColor} ${tier.color}`}>
                    <Icon className="w-8 h-8" />
                 </div>

                 <h3 className={`text-2xl font-bold font-serif mb-2 ${tier.color}`}>
                    {isGeg ? tier.nameGeg : tier.name}
                 </h3>
                 
                 <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">{tier.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1 font-medium">{tier.period}</span>
                 </div>

                 <div className="space-y-4 mb-8 flex-grow">
                    {(isGeg ? tier.featuresGeg : tier.features).map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                         <CheckCircle className={`w-5 h-5 flex-shrink-0 ${tier.color}`} />
                         <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                 </div>

                 <button 
                    onClick={() => handleJoinClick(tier)}
                    disabled={isCurrent}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 group ${isCurrent ? 'bg-green-600 cursor-default shadow-green-200' : tier.buttonColor} ${!isCurrent && 'hover:scale-[1.02] active:scale-95'}`}
                 >
                    <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {isCurrent ? (isGeg ? 'Aktiv' : 'Active') : (isGeg ? 'Bashkohu Tash' : 'Join Now')}
                 </button>
              </div>
            );
          })}
       </div>

       {/* Trust Badge Mock */}
       <div className="mt-16 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
          <p>{isGeg ? 'Pagesa të sigurta të procesueme nga Stripe.' : 'Secure payments processed by Stripe.'}</p>
          <div className="flex justify-center gap-4 mt-2 opacity-50">
             <span>VISA</span><span>MasterCard</span><span>Amex</span>
          </div>
       </div>

       {/* Secure Payment Modal */}
       {selectedTier && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl scale-100 animate-fade-in-up border border-gray-100 dark:border-gray-800">
                <button 
                  onClick={() => setSelectedTier(null)}
                  className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  disabled={isProcessing}
                >
                   <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>

                {!showSuccess ? (
                    <>
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${selectedTier.bgColor} ${selectedTier.color} mx-auto shadow-inner`}>
                            {TierIcon && <TierIcon className="w-8 h-8" />}
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-1 font-serif text-gray-900 dark:text-white">
                            {isGeg ? 'Arkëtim i Sigurtë' : 'Secure Checkout'}
                        </h3>
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                            {isGeg ? 'SSL i Enkriptuem' : 'SSL Encrypted Transaction'}
                        </p>

                        <div className="space-y-4 mb-8">
                           {/* Tier Summary */}
                           <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                               <div>
                                   <span className="block font-bold text-gray-900 dark:text-white">{isGeg ? selectedTier.nameGeg : selectedTier.name} Tier</span>
                                   <span className="text-xs text-gray-500 dark:text-gray-400">{isGeg ? 'Faturim Mujor' : 'Monthly billing'}</span>
                               </div>
                               <span className="font-bold text-xl text-gray-900 dark:text-white">{selectedTier.price}</span>
                           </div>
                           
                           {/* Payment Form */}
                           <div className="space-y-3">
                               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{isGeg ? 'Detajet e Kartës' : 'Card Details'}</label>
                               <input 
                                   type="text" 
                                   placeholder={isGeg ? "Emri në Kartë" : "Name on Card"} 
                                   className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-albanian-red focus:ring-1 focus:ring-red-200 dark:focus:ring-red-900 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                                   value={paymentDetails.name}
                                   onChange={e => setPaymentDetails({...paymentDetails, name: e.target.value})}
                               />
                               <input 
                                   type="text" 
                                   placeholder="0000 0000 0000 0000" 
                                   className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-albanian-red focus:ring-1 focus:ring-red-200 dark:focus:ring-red-900 outline-none font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                                   maxLength={19}
                                   value={paymentDetails.cardNumber}
                                   onChange={e => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                               />
                               <div className="flex gap-3">
                                   <input 
                                       type="text" 
                                       placeholder="MM/YY" 
                                       className="w-1/2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-albanian-red focus:ring-1 focus:ring-red-200 dark:focus:ring-red-900 outline-none font-mono text-center text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                                       maxLength={5}
                                       value={paymentDetails.expiry}
                                       onChange={e => setPaymentDetails({...paymentDetails, expiry: e.target.value})}
                                   />
                                   <input 
                                       type="text" 
                                       placeholder="CVC" 
                                       className="w-1/2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-albanian-red focus:ring-1 focus:ring-red-200 dark:focus:ring-red-900 outline-none font-mono text-center text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                                       maxLength={3}
                                       value={paymentDetails.cvc}
                                       onChange={e => setPaymentDetails({...paymentDetails, cvc: e.target.value})}
                                   />
                               </div>
                           </div>
                        </div>

                        <button 
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg ${selectedTier.buttonColor} ${isProcessing ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02] active:scale-95'}`}
                        >
                            {isProcessing ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> {isGeg ? 'Duke Procesue...' : 'Processing...'}</>
                            ) : (
                                <>{isGeg ? `Paguaj ${selectedTier.price}` : `Pay ${selectedTier.price}`}</>
                            )}
                        </button>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-3xl font-bold mb-3 font-serif text-gray-900 dark:text-white">
                            {isGeg ? 'Pagesa u Krye!' : 'Payment Successful!'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-[260px] mx-auto leading-relaxed">
                            {isGeg 
                                ? 'Profili juej u përditësue. Faleminderit për mbështetjen.' 
                                : 'Your profile has been updated. Thank you for your support.'}
                        </p>
                    </div>
                )}
            </div>
         </div>
       )}
    </div>
  );
};

export default SupportPage;