
import React, { useState } from 'react';
import { UserProfile, Badge, Language } from '../types';
import { Trophy, Star, Medal, Edit3, PlusCircle, Shield, Crown, Award, CheckCircle, ArrowRight, User, Flame, Lock, Calendar, Zap, MessageSquare, Activity, Hash, Diamond } from './Icons';
import ContributionModal from './ContributionModal';

interface CommunityPageProps {
  lang: Language;
  isAdmin: boolean;
  onAdminClick: () => void;
  user: UserProfile | null;
  onReqAuth: () => void;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ lang, isAdmin, onAdminClick, user, onReqAuth }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const isGeg = lang === 'geg';
  
  const displayUser: UserProfile = user || {
    id: 'guest',
    name: 'Guest User',
    email: '',
    role: 'user',
    level: 0,
    levelTitle: 'Visitor',
    levelTitleGeg: 'Vizitor',
    points: 0,
    nextLevelPoints: 100,
    badges: [],
    contributions: 0,
    joinedDate: 'Today'
  };

  const progressPercent = Math.min((displayUser.points / displayUser.nextLevelPoints) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24 px-4">
       <div className="text-center mb-20 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-gray-900 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-8 border border-gray-100 dark:border-gray-800 shadow-xl">
             <Activity className="w-3.5 h-3.5" /> Community Archive Status
          </div>
          <h1 className="text-5xl sm:text-7xl font-serif font-black text-gray-900 dark:text-white mb-6 tracking-tight">
             {isGeg ? 'Forumi i ' : 'The '}<span className="text-indigo-600">Gegenishtes</span>
          </h1>
       </div>

       <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-10">
             <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden relative">
                <div className={`h-48 relative ${displayUser.tier === 'mythic' ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600' : 'bg-indigo-600'}`}>
                   {displayUser.tier && (
                      <div className="absolute top-6 right-8 bg-white/10 backdrop-blur-xl text-white text-[9px] font-black px-5 py-2 rounded-2xl uppercase tracking-[0.2em] border border-white/20 flex items-center gap-2">
                         <Zap className="w-3.5 h-3.5 text-yellow-400" /> Patron: {displayUser.tier.toUpperCase()}
                      </div>
                   )}
                </div>

                <div className="px-10 pb-12 sm:px-16 sm:pb-16">
                   <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 mb-12 gap-8">
                      <div className="relative group shrink-0">
                         <div className={`w-40 h-40 rounded-[2.5rem] bg-white dark:bg-gray-900 p-2 shadow-3xl ${displayUser.tier === 'mythic' ? 'ring-4 ring-fuchsia-500 animate-pulse' : ''}`}>
                            <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-[2.2rem] flex items-center justify-center text-6xl font-black text-indigo-600 dark:text-indigo-400 uppercase shadow-inner border border-gray-100 dark:border-gray-700">
                               {displayUser.name.charAt(0)}
                            </div>
                         </div>
                      </div>

                      <div className="flex-grow text-center md:text-left mb-2">
                         <h2 className="text-4xl sm:text-5xl font-serif font-black text-gray-900 dark:text-white leading-tight mb-2">
                            {displayUser.name}
                         </h2>
                         <div className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="text-xs font-black uppercase text-indigo-500 tracking-widest">{isGeg ? displayUser.levelTitleGeg : displayUser.levelTitle}</span>
                            {displayUser.tier === 'mythic' && <Diamond className="w-4 h-4 text-fuchsia-500" />}
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                      <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[2.2rem] border border-gray-100 dark:border-gray-700 shadow-sm group transition-all hover:border-indigo-200">
                         <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl text-indigo-600"><Crown className="w-8 h-8" /></div>
                            <span className="text-[9px] font-black bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl border">RANK {displayUser.level}</span>
                         </div>
                         <div className="text-3xl font-black text-gray-900 dark:text-white font-serif tracking-tight">Legacy Holder</div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[2.2rem] border border-gray-100 dark:border-gray-700 shadow-sm group transition-all hover:border-emerald-200">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl text-emerald-600"><Edit3 className="w-8 h-8" /></div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Growth Matrix</span>
                         </div>
                         <div className="text-4xl font-black text-gray-900 dark:text-white">
                            {displayUser.contributions} <span className="text-xs text-gray-400 uppercase tracking-widest font-black ml-2">Deeds</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-gray-50 dark:bg-gray-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 mb-12 shadow-inner">
                      <div className="flex justify-between items-center mb-8">
                         <div className="flex items-center gap-3"><Zap className="w-6 h-6 text-amber-500 fill-current" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Knowledge Matrix</span></div>
                         <div className="flex items-baseline gap-2"><span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{displayUser.points}</span><span className="text-sm font-black text-gray-400 tracking-widest uppercase">/ {displayUser.nextLevelPoints} XP</span></div>
                      </div>
                      <div className="w-full h-6 bg-white dark:bg-gray-950 rounded-full overflow-hidden p-1.5 shadow-inner">
                         <div className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-lg" style={{ width: `${progressPercent}%` }} />
                      </div>
                   </div>

                   <div className="flex gap-6">
                      <button onClick={() => setModalOpen(true)} className="flex-grow py-6 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl active:scale-95"><PlusCircle className="w-5 h-5" /> Record Entry</button>
                      <button onClick={onAdminClick} disabled={!isAdmin} className={`px-10 py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 border-2 transition-all ${isAdmin ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-100 dark:border-gray-800 hover:border-indigo-500 shadow-xl' : 'opacity-40 cursor-not-allowed'}`}><Shield className="w-5 h-5" /> SOC</button>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
             <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-12 border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col h-full sticky top-24">
                <div className="flex items-center justify-between mb-12 border-b border-gray-100 dark:border-gray-800 pb-8">
                   <h3 className="text-2xl font-serif font-black dark:text-white">{isGeg ? 'Nderi' : 'Honors'}</h3>
                   <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Real-time Node Status</div>
                </div>
                <div className="space-y-6">
                   {[1, 2, 3, 4, 5].map((rank) => (
                        <div key={rank} className="flex items-center gap-4 p-5 rounded-3xl border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 transition-all hover:translate-x-2">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg ${rank === 1 ? 'bg-yellow-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-400'}`}>{rank}</div>
                           <div className="flex-grow min-w-0">
                              <div className="font-black text-sm dark:text-white truncate">Guardian_Node_{rank}</div>
                              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{1000 - rank * 50} Points</div>
                           </div>
                           {rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                        </div>
                   ))}
                </div>
             </div>
          </div>
       </div>

       <ContributionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type="add_word" lang={lang} />
    </div>
  );
};

export default CommunityPage;
