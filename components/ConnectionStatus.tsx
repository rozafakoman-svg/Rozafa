
import React, { useState, useEffect } from 'react';
import { Globe, CloudRain, Zap, Loader2 } from './Icons';
import { isRemoteActive } from '../services/supabaseClient';

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');

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
      <div className="flex items-center gap-1.5 text-amber-500 animate-fade-in transition-all">
        <CloudRain className="w-3.5 h-3.5" />
        <span className="text-[10px] font-black uppercase tracking-widest">Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-emerald-500 animate-fade-in transition-all">
      <Zap className="w-3.5 h-3.5 fill-current" />
      <span className="text-[10px] font-black uppercase tracking-widest">Cloud Synced</span>
    </div>
  );
};

export default ConnectionStatus;
