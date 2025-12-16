import React, { useState } from 'react';
import { UserProfile, Badge, Language } from '../types';
import { Trophy, Star, Medal, Flag, Edit3, PlusCircle, TrendingUp, Shield, Crown, Award, CheckCircle, ArrowRight, User, Flame, Lock } from './Icons';
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

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Star': return <Star className="w-5 h-5" />;
      case 'Edit3': return <Edit3 className="w-5 h-5" />;
      case 'Heart': return <Award className="w-5 h-5" />;
      default: return <Medal className="w-5 h-5" />;
    }
  };

  const handleAction = (action: () => void) => {
    if (!user) {
        onReqAuth();
    } else {
        action();
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up pb-20">
       
       <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-4">
             {isGeg ? 'Komuniteti ' : 'Community '}<span className="text-indigo-600 dark:text-indigo-400">Gegenisht</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
              {isGeg 
                ? 'Bâhi pjesë e ruajtjes së gjuhës. Raportoni gabime, shtoni fjalë dhe fitoni grada.' 
                : 'Be part of preserving the language. Report errors, add words, and earn ranks.'}
          </p>
       </div>

       <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Profile Card - "Passport Style" */}
          <div className="lg:col-span-2 relative">
             <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative z-10">
                
                {!user && (
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-6">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl text-center max-w-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isGeg ? 'Hini në Profil' : 'Login to Profile'}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">{isGeg ? 'Gjurmoni progresin dhe fitoni emblema.' : 'Track your progress and earn badges.'}</p>
                            <button onClick={onReqAuth} className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                                {isGeg ? 'Hini / Regjistrohu' : 'Login / Register'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                   {displayUser.role === 'admin' && (
                      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                         Administrator
                      </div>
                   )}
                </div>

                <div className="px-8 pb-8">
                   <div className="flex flex-col sm:flex-row items-end -mt-12 mb-6 gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 p-1 shadow-lg rotate-3 transform transition-transform hover:rotate-0">
                         <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center text-3xl font-black text-indigo-600 dark:text-indigo-300 uppercase">
                            {displayUser.name.charAt(0)}
                         </div>
                      </div>
                      <div className="flex-grow mb-2">
                         <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">{displayUser.name}</h2>
                         <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            <span>@{displayUser.id === 'guest' ? 'guest' : displayUser.name.toLowerCase().replace(/\s/g, '')}</span>
                            <span>•</span>
                            <span>{isGeg ? 'Anëtar prej' : 'Joined'} {displayUser.joinedDate}</span>
                         </div>
                      </div>
                      
                      {/* Streak Display */}
                      <div className="hidden sm:flex flex-col items-center bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl border border-orange-100 dark:border-orange-900/50 mb-2">
                         <div className="flex items-center gap-1 text-orange-500 font-bold">
                            <Flame className="w-5 h-5 fill-current animate-pulse" />
                            <span className="text-xl">12</span>
                         </div>
                         <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">{isGeg ? 'Ditë Rresht' : 'Day Streak'}</span>
                      </div>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                         <div className="flex items-center gap-2 mb-1">
                            <Crown className="w-5 h-5 text-amber-500" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isGeg ? 'Niveli Aktual' : 'Current Level'}</span>
                         </div>
                         <div className="text-2xl font-black text-gray-900 dark:text-white">
                            {isGeg ? displayUser.levelTitleGeg : displayUser.levelTitle} <span className="text-gray-400 text-lg font-medium">({displayUser.level})</span>
                         </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                         <div className="flex items-center gap-2 mb-1">
                            <Edit3 className="w-5 h-5 text-blue-500" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isGeg ? 'Kontribute' : 'Contributions'}</span>
                         </div>
                         <div className="text-2xl font-black text-gray-900 dark:text-white">
                            {displayUser.contributions}
                         </div>
                      </div>
                   </div>

                   {/* XP Progress */}
                   <div className="mb-8">
                      <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                         <span>XP Progress</span>
                         <span>{displayUser.points} / {displayUser.nextLevelPoints}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${progressPercent}%` }}
                         ></div>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="flex gap-4">
                      <button 
                        onClick={() => handleAction(() => setModalOpen(true))}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                      >
                         <PlusCircle className="w-5 h-5" />
                         {isGeg ? "Shto Fjalë" : 'Add Word'}
                      </button>
                      
                      <button 
                        onClick={onAdminClick}
                        disabled={displayUser.role !== 'admin'}
                        className={`px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-colors ${
                           displayUser.role === 'admin' 
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                            : 'bg-gray-50 dark:bg-gray-700/30 text-gray-300 dark:text-gray-600 border-transparent cursor-not-allowed'
                        }`}
                        title={displayUser.role === 'admin' ? '' : 'Admin only'}
                      >
                         <Shield className="w-5 h-5" />
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* Leaderboard - Podium Style */}
          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg h-full flex flex-col">
                <h3 className="text-lg font-bold font-serif text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
                   <Trophy className="w-5 h-5 text-yellow-500" /> 
                   {isGeg ? 'Tabela e Nderit' : 'Leaderboard'}
                </h3>

                <div className="space-y-4 flex-grow">
                   {[1, 2, 3, 4, 5].map((rank) => {
                      let rankStyle = "bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700";
                      let iconColor = "text-gray-400";
                      
                      if (rank === 1) { rankStyle = "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50"; iconColor = "text-yellow-500"; }
                      else if (rank === 2) { rankStyle = "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"; iconColor = "text-slate-400"; }
                      else if (rank === 3) { rankStyle = "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700/50"; iconColor = "text-orange-500"; }

                      return (
                        <div key={rank} className={`flex items-center gap-3 p-3 rounded-xl border ${rankStyle} transition-transform hover:scale-[1.02]`}>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${rank <= 3 ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-transparent'} ${iconColor}`}>
                              {rank}
                           </div>
                           <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0"></div>
                           <div className="flex-grow min-w-0">
                              <div className="font-bold text-sm text-gray-900 dark:text-white truncate">User_{100 + rank}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{1000 - rank * 50} pts</div>
                           </div>
                           {rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                        </div>
                      );
                   })}
                </div>
                
                <div className="mt-6 text-center">
                   <button className="text-xs font-bold text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                      {isGeg ? 'Shiko të Gjithë' : 'View All'}
                   </button>
                </div>
             </div>
          </div>
       </div>

       {/* Badges Collection Grid */}
       <div className="mt-12">
          <div className="flex items-center justify-between mb-6 px-2">
             <h3 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
                {isGeg ? 'Koleksioni i Emblemave' : 'Badge Collection'}
             </h3>
             <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {displayUser.badges.filter(b => b.earned).length} / {Math.max(displayUser.badges.length, 12)}
             </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
             {/* Render earned badges */}
             {displayUser.badges.map((badge) => (
                <div 
                   key={badge.id}
                   className="aspect-square rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
                >
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center ${badge.color} group-hover:scale-110 transition-transform`}>
                      {getIcon(badge.iconName)}
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-xs leading-tight mb-1">{isGeg ? badge.nameGeg : badge.name}</h4>
                   </div>
                </div>
             ))}
             
             {/* Render placeholders for unearned badges */}
             {Array.from({ length: 12 - displayUser.badges.length }).map((_, idx) => (
                <div 
                   key={`locked-${idx}`}
                   className="aspect-square rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-60"
                >
                   <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <Lock className="w-6 h-6" />
                   </div>
                   <div className="w-16 h-2 bg-gray-200 dark:bg-gray-800 rounded-full mt-2"></div>
                </div>
             ))}
          </div>
       </div>

       <ContributionModal 
         isOpen={modalOpen}
         onClose={() => setModalOpen(false)}
         type="add_word"
         lang={lang}
       />
    </div>
  );
};

export default CommunityPage;