
import React, { useState, useEffect } from 'react';
import { Globe, CloudRain, Zap, Loader2 } from './Icons';
import { isRemoteActive } from '../services/supabaseClient';

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      setStatus(isRemoteActive() ? 'online' : 'offline');
    };

    window.addEventListener('online', checkStatus);
    window.addEventListener('offline', checkStatus);
    checkStatus();

    return () => {
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
    };
  }, []);

  if (status === 'offline') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800 text-[10px] font-black uppercase tracking-widest animate-fade-in">
        <CloudRain className="w-3 h-3" />
        <span>Offline Mode</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800 text-[10px] font-black uppercase tracking-widest animate-fade-in">
      <Zap className="w-3 h-3 fill-current" />
      <span>Cloud Synced</span>
    </div>
  );
};

export default ConnectionStatus;
