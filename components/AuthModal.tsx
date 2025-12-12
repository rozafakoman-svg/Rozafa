import React, { useState } from 'react';
import { UserProfile, Badge } from '../types';
import { X, User, Lock, Mail, Loader2, Shield } from './Icons';
import { Language } from '../App';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  lang: Language;
}

const MOCK_BADGES: Badge[] = [
  { id: '3', name: 'Newcomer', nameGeg: 'Fillestar', iconName: 'Star', description: 'Joined the community', descriptionGeg: 'U bashkue me komunitetin', color: 'bg-gray-100 text-gray-600', earned: true },
];

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, lang }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isGeg = lang === 'geg';

  if (!isOpen) return null;

  const validate = () => {
    if (!formData.email.includes('@')) return isGeg ? 'Email i pavlefshëm' : 'Invalid email address';
    if (formData.password.length < 6) return isGeg ? 'Fjalëkalimi duhet të ketë të paktën 6 karaktere' : 'Password must be at least 6 characters';
    if (mode === 'register') {
        if (!formData.name.trim()) return isGeg ? 'Emni kërkohet' : 'Name is required';
        if (formData.password !== formData.confirmPassword) return isGeg ? 'Fjalëkalimet nuk përputhen' : 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
        setError(err);
        return;
    }
    setError(null);
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
        setIsLoading(false);
        // Create Mock User
        const newUser: UserProfile = {
            id: Date.now().toString(),
            name: mode === 'login' ? (isGeg ? 'Përdorues Geg' : 'Geg User') : formData.name, // In real app, fetch name on login
            email: formData.email,
            role: 'user', // Default role
            level: 1,
            levelTitle: 'Learner',
            levelTitleGeg: 'Nxënës',
            points: 100,
            nextLevelPoints: 500,
            badges: MOCK_BADGES,
            contributions: 0,
            joinedDate: new Date().toLocaleDateString()
        };
        onLogin(newUser);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md relative overflow-hidden shadow-2xl animate-scale-in flex flex-col border border-gray-100 dark:border-gray-800">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
            >
               <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-white dark:text-gray-900 shadow-lg transform -rotate-3">
                    <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
                    {mode === 'login' 
                        ? (isGeg ? 'Hini në Llogari' : 'Welcome Back') 
                        : (isGeg ? 'Krijoni Llogari' : 'Create Account')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {mode === 'login' 
                        ? (isGeg ? 'Vazhdoni rrugëtimin tuej gjuhësor' : 'Continue your language journey') 
                        : (isGeg ? 'Bâhi pjesë e komunitetit tonë' : 'Join our community')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm rounded-xl text-center font-medium">
                        {error}
                    </div>
                )}

                {mode === 'register' && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                            {isGeg ? 'Emni i plotë' : 'Full Name'}
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-900 dark:focus:border-white focus:ring-1 focus:ring-gray-900 dark:focus:ring-white outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                placeholder={isGeg ? "Filan Fisteku" : "John Doe"}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-900 dark:focus:border-white focus:ring-1 focus:ring-gray-900 dark:focus:ring-white outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                        {isGeg ? 'Fjalëkalimi' : 'Password'}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input 
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-900 dark:focus:border-white focus:ring-1 focus:ring-gray-900 dark:focus:ring-white outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {mode === 'register' && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                            {isGeg ? 'Konfirmoni Fjalëkalimin' : 'Confirm Password'}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input 
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-gray-900 dark:focus:border-white focus:ring-1 focus:ring-gray-900 dark:focus:ring-white outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-lg hover:bg-black dark:hover:bg-gray-200 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        mode === 'login' ? (isGeg ? 'Hini' : 'Login') : (isGeg ? 'Regjistrohu' : 'Register')
                    )}
                </button>
            </form>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {mode === 'login' 
                        ? (isGeg ? 'Nuk keni llogari?' : "Don't have an account?") 
                        : (isGeg ? 'Keni llogari?' : "Already have an account?")}
                    {' '}
                    <button 
                        onClick={() => {
                            setMode(mode === 'login' ? 'register' : 'login');
                            setError(null);
                            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                        }}
                        className="font-bold text-gray-900 dark:text-white hover:underline"
                    >
                        {mode === 'login' 
                            ? (isGeg ? 'Regjistrohu' : 'Sign up') 
                            : (isGeg ? 'Hini' : 'Log in')}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );
};

export default AuthModal;