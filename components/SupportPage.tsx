
import React, { useState } from 'react';
import { UserProfile, Badge, Language } from '../types';
/* Added ArrowRight to imports to fix find name error */
import { Heart, Shield, Star, Award, Crown, Zap, CheckCircle, CreditCard, X, Loader2, TrendingUp, Lock, Wallet, ArrowRight } from './Icons';

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
  }
];

const SupportPage: React.FC<SupportPageProps> = ({ lang, user, onUpdateUser, onReqAuth }) => {
  const isGeg = lang === 'geg';
  const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'methods' | 'stripe' | 'paypal' | 'processing' | 'success'>('methods');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({ name: '', cardNumber: '', expiry: '', cvc: '' });

  const monthlyGoal = 2000;
  const currentMonthly = 1250;
  const progressPercent = Math.min((currentMonthly / monthlyGoal) * 100, 100);

  const handleJoinClick = (tier: typeof tiers[0]) => {
     if (!user) {
         onReqAuth();
         return;
     }
     setSelectedTier(tier);
     setCheckoutStep('methods');
     setPaymentDetails({ name: user.name, cardNumber: '', expiry: '', cvc: '' });
  };

  const handleFinalConfirm = () => {
    setIsProcessing(true);
    setCheckoutStep('processing');
    
    setTimeout(() => {
        setIsProcessing(false);
        setCheckoutStep('success');
        
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
            setSelectedTier(null);
            setCheckoutStep('methods');
        }, 3000);
    }, 2000);
  };

  const TierIcon = selectedTier?.icon;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20 px-4">
       
       <div className="text-center mb-16 px-4">
         <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full mb-6 animate-pulse">
             <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
         </div>
         <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6">
            {isGeg ? 'Mbështetni ' : 'Support '}<span className="text-albanian-red">Gegenisht</span>
         </h1>
         
         <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-12">
            <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                <span>{isGeg ? 'Qëllimi Mujor' : 'Monthly Goal'}</span>
                <span className="text-albanian-red">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-400 to-red-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
         </div>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {tiers.map((tier) => (
              <div key={tier.id} className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 transition-all duration-300 hover:-translate-y-2 flex flex-col ${user?.tier === tier.id ? 'border-green-500 ring-4 ring-green-50 dark:ring-green-900/30' : tier.borderColor}`}>
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${tier.bgColor} ${tier.color}`}><tier.icon className="w-8 h-8" /></div>
                 <h3 className={`text-2xl font-bold font-serif mb-2 ${tier.color}`}>{isGeg ? tier.nameGeg : tier.name}</h3>
                 <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">{tier.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1 font-medium">{tier.period}</span>
                 </div>
                 <button onClick={() => handleJoinClick(tier)} disabled={user?.tier === tier.id} className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${user?.tier === tier.id ? 'bg-green-600' : tier.buttonColor}`}>{user?.tier === tier.id ? 'Active' : (isGeg ? 'Mbështet' : 'Support Now')}</button>
              </div>
          ))}
       </div>

       {/* PAYMENTS MODAL */}
       {selectedTier && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-gray-100 dark:border-gray-800">
                <button onClick={() => setSelectedTier(null)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200"><X className="w-5 h-5"/></button>
                
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold font-serif dark:text-white">Complete Contribution</h3>
                    <p className="text-sm text-gray-500">{selectedTier.name} Tier • {selectedTier.price}{selectedTier.period}</p>
                </div>

                {checkoutStep === 'methods' && (
                    <div className="space-y-4">
                        <button onClick={() => setCheckoutStep('stripe')} className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between hover:border-indigo-500 transition-colors">
                            <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-indigo-500"/><span className="font-bold dark:text-white">Pay with Card</span></div>
                            <ArrowRight className="w-4 h-4"/>
                        </button>
                        <button onClick={() => setCheckoutStep('paypal')} className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between hover:border-blue-500 transition-colors">
                            <div className="flex items-center gap-3"><Wallet className="w-5 h-5 text-blue-500"/><span className="font-bold dark:text-white">PayPal</span></div>
                            <ArrowRight className="w-4 h-4"/>
                        </button>
                    </div>
                )}

                {checkoutStep === 'stripe' && (
                    <div className="space-y-4">
                        <input className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" placeholder="Card Number" />
                        <div className="flex gap-2">
                            <input className="w-1/2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" placeholder="MM/YY" />
                            <input className="w-1/2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white" placeholder="CVC" />
                        </div>
                        <button onClick={handleFinalConfirm} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold mt-4">Confirm Payment</button>
                    </div>
                )}

                {checkoutStep === 'paypal' && (
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-6">Confirm and pay with PayPal</p>
                        <button onClick={handleFinalConfirm} className="w-full py-4 bg-[#FFC439] text-[#2C2E2F] rounded-xl font-bold">PayPal Checkout</button>
                    </div>
                )}

                {checkoutStep === 'processing' && (
                    <div className="py-10 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500 mb-4"/><p className="dark:text-white">Finalizing your support...</p></div>
                )}

                {checkoutStep === 'success' && (
                    <div className="py-10 text-center"><CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce"/><h2 className="text-2xl font-bold dark:text-white">You're Awesome!</h2></div>
                )}
            </div>
         </div>
       )}
    </div>
  );
};

export default SupportPage;
