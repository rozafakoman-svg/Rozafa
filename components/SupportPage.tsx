
import React, { useState, useEffect } from 'react';
import { UserProfile, Badge, Language, Transaction } from '../types';
import { 
  Heart, Shield, Award, Crown, CheckCircle, CreditCard, X, Loader2, Lock, 
  Wallet, ArrowRight, Smartphone, ArrowLeft, ShieldCheck, User, Star, Zap, Flame, Diamond, Trophy,
  Medal
} from './Icons';
import { db, Stores } from '../services/db';

interface SupportPageProps {
  lang: Language;
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onReqAuth: (mode?: 'login' | 'signup') => void;
}

type CheckoutStep = 'methods' | 'processing' | 'success' | 'require-auth';

const tiers = [
  {
    id: 'bronze',
    name: 'Bronze',
    nameGeg: 'Bronz',
    price: '€3',
    priceVal: 3,
    period: '/mo',
    icon: Shield,
    color: 'text-amber-700 dark:text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    borderColor: 'border-amber-100 dark:border-amber-800',
    buttonColor: 'bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700',
    features: ['Supporter Badge', 'Ad-free Experience', 'Discord Role'],
    featuresGeg: ['Emblemë Mbështetësi', 'Pa Reklama', 'Rol në Discord'],
  },
  {
    id: 'silver',
    name: 'Silver',
    nameGeg: 'Argjend',
    price: '€10',
    priceVal: 10,
    period: '/mo',
    icon: Medal,
    color: 'text-slate-400 dark:text-slate-300',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
    buttonColor: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600',
    features: ['All Bronze Features', 'Special Icon', 'Supporter Newsletter'],
    featuresGeg: ['Të gjitha benefitet e Bronzit', 'Ikonë Speciale', 'Gazetë e Mbështetësve'],
  },
  {
    id: 'gold',
    name: 'Gold',
    nameGeg: 'Ar',
    price: '€25',
    priceVal: 25,
    period: '/mo',
    icon: Award,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-100 dark:border-yellow-700',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600',
    features: ['All Silver Features', 'Vote on Features', 'Priority Support'],
    featuresGeg: ['Të gjitha benefitet e Argjendit', 'Voto për Funksione', 'Mbështetje Prioritare'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    nameGeg: 'Platin',
    price: '€50',
    priceVal: 50,
    period: '/mo',
    icon: Crown,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
    borderColor: 'border-indigo-100 dark:border-indigo-700',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
    features: ['All Gold Features', 'Early Access to Games', 'Digital Certificate'],
    featuresGeg: ['Të gjitha benefitet e Arit', 'Qasje e Hershme në Lojna', 'Certifikatë Digjitale'],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    nameGeg: 'Diamant',
    price: '€100',
    priceVal: 100,
    period: '/mo',
    icon: Diamond,
    color: 'text-cyan-500 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-100 dark:border-cyan-700',
    buttonColor: 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600',
    features: ['All Platinum Features', 'Name in Credits', '1-on-1 History Session'],
    featuresGeg: ['Të gjitha benefitet e Platinit', 'Emni në Kreditet e Aplikacionit', 'Sesion Histori 1-më-1'],
  },
  {
    id: 'mythic',
    name: 'Mythic',
    nameGeg: 'Miti',
    price: '€500',
    priceVal: 500,
    period: '/mo',
    icon: Zap,
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-900/30',
    borderColor: 'border-fuchsia-200 dark:border-fuchsia-800',
    buttonColor: 'bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-500 dark:hover:bg-fuchsia-600',
    features: ['The Ultimate Recognition', 'Founding Member Badge', 'Private Dinner Event'],
    featuresGeg: ['Mirënjohja ma e Lartë', 'Emblemë "Anëtar Themelues"', 'Darkë Private vjetore'],
  }
];

const SupportPage: React.FC<SupportPageProps> = ({ lang, user, onUpdateUser, onReqAuth }) => {
  const isGeg = lang === 'geg';
  const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('methods');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingReward, setPendingReward] = useState<typeof tiers[0] | null>(null);

  const monthlyGoal = 5000;
  const currentMonthly = 1840;
  const progressPercent = Math.min((currentMonthly / monthlyGoal) * 100, 100);

  useEffect(() => {
    if (user && pendingReward && checkoutStep === 'require-auth') {
      applyReward(user, pendingReward, 'stripe');
      setCheckoutStep('success');
      setPendingReward(null);
    }
  }, [user, pendingReward, checkoutStep]);

  const applyReward = async (targetUser: UserProfile, tier: typeof tiers[0], method: 'stripe' | 'paypal') => {
    const newBadge: Badge = {
        id: `badge_${Date.now()}`,
        name: `${tier.name} Supporter`,
        nameGeg: `Mbështetës ${tier.nameGeg}`,
        iconName: tier.id === 'mythic' ? 'Zap' : tier.id === 'diamond' ? 'Diamond' : 'Heart',
        description: `Subscribed to ${tier.name} tier`,
        descriptionGeg: `Abonue në nivelin ${tier.nameGeg}`,
        color: tier.color.replace('text-', 'bg-').replace('600', '100').replace('700', '100').replace('500', '100') + ` ${tier.color}`,
        earned: true
    };
    
    const updatedUser: UserProfile = {
        ...targetUser,
        tier: tier.id,
        badges: [...targetUser.badges, newBadge],
        points: targetUser.points + (tier.priceVal * 10)
    };
    onUpdateUser(updatedUser);

    const transaction: Transaction = {
        id: `TX_${Date.now()}`,
        userId: targetUser.id,
        userName: targetUser.name,
        amount: tier.priceVal,
        tier: tier.id,
        method: method,
        timestamp: new Date().toISOString()
    };
    await db.put(Stores.Transactions, transaction);
  };

  const handleFinalConfirm = (method: 'stripe' | 'paypal') => {
    setIsProcessing(true);
    setCheckoutStep('processing');
    setTimeout(() => {
        setIsProcessing(false);
        if (user && selectedTier) {
            applyReward(user, selectedTier, method);
            setCheckoutStep('success');
        } else if (selectedTier) {
            setPendingReward(selectedTier);
            setCheckoutStep('require-auth');
        }
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24 px-4">
       <div className="text-center mb-20">
         <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-gray-900 rounded-[2.5rem] mb-10 border border-gray-100 dark:border-gray-800 shadow-2xl relative">
             <Heart className="w-12 h-12 text-albanian-red fill-current animate-pulse" />
         </div>
         <h1 className="text-5xl sm:text-7xl font-serif font-black text-gray-900 dark:text-white mb-8 tracking-tighter text-center">
            {isGeg ? 'Mbroni ' : 'Protect '}<span className="text-albanian-red">Gegenishten</span>
         </h1>
         
         <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-xl mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-albanian-red/5 rounded-bl-[100px]"></div>
            <div className="flex justify-between text-[11px] font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.3em]">
                <span>{isGeg ? 'Infrastruktura Digjitale' : 'Digital Infrastructure'}</span>
                <span className="text-albanian-red font-black">{Math.round(progressPercent)}% Goal Reached</span>
            </div>
            <div className="w-full h-6 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden p-1.5 shadow-inner border border-gray-100 dark:border-gray-700">
                <div className="h-full bg-gradient-to-r from-rose-500 to-albanian-red rounded-full transition-all duration-[2000ms] shadow-lg relative" style={{ width: `${progressPercent}%` }}>
                   <div className="absolute top-0 bottom-0 left-0 right-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]"></div>
                </div>
            </div>
         </div>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tiers.map((tier) => (
              <div key={tier.id} className={`group relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border-2 transition-all duration-500 hover:-translate-y-3 flex flex-col shadow-sm hover:shadow-3xl ${user?.tier === tier.id ? 'border-indigo-500 ring-8 ring-indigo-500/5' : tier.borderColor}`}>
                 <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 ${tier.bgColor} ${tier.color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                    <tier.icon className="w-10 h-10" />
                 </div>
                 
                 <h3 className={`text-4xl font-black font-serif mb-4 ${tier.color}`}>{isGeg ? tier.nameGeg : tier.name}</h3>
                 
                 <div className="flex items-baseline mb-10">
                    <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">{tier.price}</span>
                    <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest ml-2">{tier.period}</span>
                 </div>
                 
                 <ul className="space-y-6 mb-12 flex-grow">
                    {(isGeg ? tier.featuresGeg : tier.features).map((feat, i) => (
                        <li key={i} className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-300 font-bold">
                           <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                           {feat}
                        </li>
                    ))}
                 </ul>

                 <button 
                    onClick={() => setSelectedTier(tier)} 
                    disabled={user?.tier === tier.id} 
                    className={`w-full py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.25em] text-white transition-all shadow-xl active:scale-95 ${user?.tier === tier.id ? 'bg-emerald-600' : tier.buttonColor}`}
                 >
                    {user?.tier === tier.id ? 'Active Protection' : (isGeg ? 'Dhuroni' : 'Contribute')}
                 </button>
              </div>
          ))}
       </div>

       {selectedTier && (
         <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[500] backdrop-blur-xl animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-lg relative overflow-hidden shadow-3xl border border-white/10">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
                    <h3 className="text-2xl font-serif font-black dark:text-white">{isGeg ? 'Pagesa e Sigurtë' : 'Secure Checkout'}</h3>
                    <button onClick={() => setSelectedTier(null)} className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg"><X className="w-5 h-5 text-gray-500"/></button>
                </div>
                <div className="p-12 text-center">
                    {checkoutStep === 'processing' ? (
                        <div className="py-20 flex flex-col items-center">
                            <Loader2 className="w-16 h-16 text-albanian-red animate-spin mb-8" />
                            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Encrypting Transaction...</p>
                        </div>
                    ) : checkoutStep === 'success' ? (
                        <div className="py-12 flex flex-col items-center animate-scale-in">
                            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8 border-4 border-emerald-100">
                                <CheckCircle className="w-12 h-12 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-serif font-black dark:text-white mb-4">Misioni u Krye!</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">A legacy badge has been issued to your profile.</p>
                            <button onClick={() => setSelectedTier(null)} className="mt-10 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest">Kthehu</button>
                        </div>
                    ) : checkoutStep === 'require-auth' ? (
                        <div className="py-12 flex flex-col items-center">
                            <User className="w-16 h-16 text-indigo-500 mb-6" />
                            <h2 className="text-2xl font-serif font-black dark:text-white mb-4">Identifikimi</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">Please sign in to link this contribution to your legacy profile.</p>
                            <button onClick={() => onReqAuth('login')} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Sign In</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-lg border border-indigo-100">
                                <Lock className="w-10 h-10 text-indigo-600" />
                            </div>
                            <p className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-12">
                                Tier: <strong>{selectedTier.name}</strong> • Sum: <strong>{selectedTier.price}</strong>.
                            </p>
                            <button onClick={() => handleFinalConfirm('stripe')} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                                <CreditCard className="w-5 h-5" /> Stripe (Card)
                            </button>
                            <button onClick={() => handleFinalConfirm('paypal')} className="w-full py-5 bg-[#003087] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3">
                                <Wallet className="w-5 h-5" /> PayPal
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

export default SupportPage;
