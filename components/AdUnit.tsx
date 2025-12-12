import React, { useEffect } from 'react';
import { Megaphone, X } from './Icons';
import { UserProfile } from '../types';

interface AdUnitProps {
  user: UserProfile | null;
  slotId?: string; // Google AdSense Slot ID
  format?: 'auto' | 'rectangle' | 'horizontal';
  className?: string;
  lang: 'geg' | 'eng';
}

const AdUnit: React.FC<AdUnitProps> = ({ user, slotId = "1234567890", format = "auto", className = "", lang }) => {
  // Logic: If user has a paid tier, do not render ads.
  const isPremium = user?.tier && ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'mythic'].includes(user.tier);

  if (isPremium) return null;

  return (
    <div className={`w-full max-w-5xl mx-auto my-8 ${className} animate-fade-in`}>
       <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
             {lang === 'geg' ? 'Reklamë' : 'Advertisement'}
          </span>
          <span className="text-[10px] text-gray-300 hover:text-gray-500 cursor-pointer">
             {lang === 'geg' ? 'A doni me reklamue këtu?' : 'Want to advertise here?'}
          </span>
       </div>
       
       <div className="relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex flex-col items-center justify-center min-h-[120px] sm:min-h-[150px] group hover:border-gray-300 transition-colors">
          
          {/* AdSense Simulation Structure */}
          {/* In a real app, this is where <ins class="adsbygoogle" ... /> goes */}
          <div className="text-center p-6">
             {/* Mock Ad Content */}
             <div className="flex items-center justify-center gap-3 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <Megaphone className="w-5 h-5 text-gray-400" />
                <span className="font-serif font-bold text-gray-500">Google Ads / Sponsor Slot</span>
             </div>
             <p className="text-sm text-gray-400 max-w-md mx-auto">
                {lang === 'geg' 
                 ? 'Kjo hapësirë mbështet infrastrukturën tonë.' 
                 : 'This space supports our infrastructure.'}
             </p>
             
             {/* Call to Action for Sponsorship (Fallback if no ad loads) */}
             <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                <a href="#" className="text-xs font-bold text-albanian-red bg-white border border-red-100 px-3 py-1.5 rounded-full hover:bg-red-50">
                   {lang === 'geg' ? 'Bâhi Sponsor →' : 'Become a Sponsor →'}
                </a>
             </div>
          </div>

          {/* Close / Hide Button (Simulated) */}
          <button className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 p-1">
             <X className="w-3 h-3" />
          </button>
       </div>
    </div>
  );
};

export default AdUnit;