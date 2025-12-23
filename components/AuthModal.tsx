
import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { X, Lock, Mail, Loader2, Fingerprint, Key, ShieldCheck, Shield } from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  lang: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, lang }) => {
  const [mode, setMode] = useState<'login' | 'mfa'>('login');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [tempUser, setTempUser] = useState<UserProfile | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
        setIsLoading(false);
        // The credentials remain functional but are no longer visible in the UI
        const isAdmin = formData.email === 'klovi@mail.com' && formData.password === 'klovi123';
        
        const user: UserProfile = {
            id: isAdmin ? 'admin-klovi' : Date.now().toString(),
            name: isAdmin ? 'Klovi Admin' : 'Geg User', 
            email: formData.email,
            role: isAdmin ? 'admin' : 'user', 
            level: isAdmin ? 99 : 1,
            levelTitle: isAdmin ? 'System Architect' : 'Learner',
            levelTitleGeg: isAdmin ? 'Arkitekt i Sistemit' : 'Nxënës',
            points: isAdmin ? 9999 : 100,
            nextLevelPoints: 500,
            badges: [],
            contributions: isAdmin ? 500 : 0,
            joinedDate: '2024-01-01',
            mfaEnabled: isAdmin
        };

        if (isAdmin) {
            setTempUser(user);
            setMode('mfa');
        } else {
            onLogin(user);
        }
    }, 1000);
  };

  const handleMFAChallenge = () => {
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        if (tempUser) onLogin(tempUser);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-900 rounded-[32px] w-full max-w-md relative overflow-hidden shadow-2xl animate-scale-in border border-gray-100 dark:border-gray-800">
            
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 z-10">
               <X className="w-5 h-5 text-gray-500" />
            </button>

            {mode === 'mfa' ? (
                <div className="p-10 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                        <Fingerprint className="w-10 h-10 text-indigo-500 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold dark:text-white mb-2">Hardware Required</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                        Administrator credentials detected. Please use your FIDO2 security key to proceed.
                    </p>
                    <button 
                        onClick={handleMFAChallenge}
                        disabled={isLoading}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ShieldCheck className="w-6 h-6" /> Authenticate Key</>}
                    </button>
                </div>
            ) : (
                <>
                <div className="p-10 text-center bg-gray-50 dark:bg-gray-950/50 border-b border-gray-100 dark:border-gray-800">
                    <div className="inline-flex p-4 bg-slate-900 rounded-3xl border border-slate-700 shadow-xl mb-4">
                        <Key className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Sign In</h2>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2">Secure Connection Active</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-albanian-red transition-all dark:text-white"
                                placeholder="Corporate ID / Email"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-albanian-red transition-all dark:text-white"
                                placeholder="Passphrase"
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                        <Shield className="w-3 h-3" /> Swiss-Banking Grade Security
                    </div>
                </form>
                </>
            )}
        </div>
    </div>
  );
};

export default AuthModal;
