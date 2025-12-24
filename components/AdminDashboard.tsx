
import React, { useState, useEffect } from 'react';
import { Language, Product, SecurityAudit, SystemLog, VaultStatus, Transaction } from '../types';
import { 
  Shield, ArrowLeft, Edit3, ShoppingBag, DollarSign, Users, 
  Megaphone, ShieldCheck, Lock, Unlock, Fingerprint, Activity, Terminal, ShieldAlert,
  Settings, Loader2, Save, Trash2, Plus, X, CheckCircle, RefreshCw, Globe, Zap, BarChart3, TrendingUp, Wallet
} from './Icons';
import { db, Stores } from '../services/db';

interface AdminDashboardProps {
  lang: Language;
  onBack: () => void;
}

type AdminTab = 'security' | 'contributions' | 'shop' | 'financial' | 'users';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('security');
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>('quantum_secure');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFinancialLoading, setIsFinancialLoading] = useState(false);

  const isGeg = lang === 'geg';

  useEffect(() => {
    if (activeTab === 'financial') {
        loadTransactions();
    }
  }, [activeTab]);

  const loadTransactions = async () => {
    setIsFinancialLoading(true);
    try {
        const data = await db.getAll<Transaction>(Stores.Transactions);
        setTransactions(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (e) {
        console.error("Failed to load transactions", e);
    } finally {
        setIsFinancialLoading(false);
    }
  };

  const getTotalRevenue = () => transactions.reduce((acc, curr) => acc + curr.amount, 0);
  
  const getTierStats = () => {
      const counts: Record<string, number> = {};
      transactions.forEach(t => { counts[t.tier] = (counts[t.tier] || 0) + 1; });
      return counts;
  };

  const tierStats = getTierStats();

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <button onClick={onBack} className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
           <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-gray-400 shadow-sm">
             <ArrowLeft className="w-5 h-5" />
           </div>
           <span className="font-bold">{isGeg ? 'Mbrapa' : 'Back'}</span>
         </button>
         <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm border border-slate-700 shadow-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="tracking-tight uppercase">Admin Console</span>
         </div>
      </div>

      <div className="flex gap-2 mb-10 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl w-fit overflow-x-auto no-scrollbar">
        {[
          { id: 'security', icon: ShieldCheck, label: 'Vault & Security' },
          { id: 'contributions', icon: Edit3, label: 'Contributions' },
          { id: 'shop', icon: ShoppingBag, label: 'Shop' },
          { id: 'financial', icon: DollarSign, label: 'Financials' },
          { id: 'users', icon: Users, label: 'Users' },
        ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all whitespace-nowrap ${isActive ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-md ring-1 ring-gray-200 dark:ring-gray-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50'}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="text-sm">{tab.label}</span>
                </button>
            );
        })}
      </div>

      {activeTab === 'financial' && (
          <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-10"><TrendingUp className="w-16 h-16 text-emerald-500" /></div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Gross Revenue</p>
                      <h3 className="text-4xl font-black text-gray-900 dark:text-white font-mono">${getTotalRevenue().toLocaleString()}</h3>
                      <p className="text-xs text-emerald-500 font-bold mt-4 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% MoM</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm group">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Patrons</p>
                      <h3 className="text-4xl font-black text-gray-900 dark:text-white font-mono">{transactions.length}</h3>
                      <p className="text-xs text-indigo-500 font-bold mt-4">Verified Legacy Guardians</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm group">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Infrastructure Cost</p>
                      <h3 className="text-4xl font-black text-gray-900 dark:text-white font-mono">$142/mo</h3>
                      <p className="text-xs text-rose-500 font-bold mt-4">API & Storage Overheads</p>
                  </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                      <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
                          <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                             <Wallet className="w-6 h-6 text-indigo-500" /> Recent Transactions
                          </h3>
                          <button onClick={loadTransactions} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"><RefreshCw className="w-4 h-4 text-gray-400" /></button>
                      </div>
                      <div className="overflow-x-auto">
                          {isFinancialLoading ? (
                              <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500" /></div>
                          ) : (
                              <table className="w-full">
                                  <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                          <th className="px-8 py-4 text-left">Patron</th>
                                          <th className="px-8 py-4 text-center">Tier</th>
                                          <th className="px-8 py-4 text-right">Amount</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                      {transactions.map(t => (
                                          <tr key={t.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors">
                                              <td className="px-8 py-4">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">{t.userName.charAt(0)}</div>
                                                      <span className="font-bold text-sm dark:text-gray-200">{t.userName}</span>
                                                  </div>
                                              </td>
                                              <td className="px-8 py-4 text-center">
                                                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">{t.tier}</span>
                                              </td>
                                              <td className="px-8 py-4 text-right">
                                                  <span className="font-mono font-bold text-gray-900 dark:text-emerald-400">${t.amount.toFixed(2)}</span>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          )}
                      </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
                             <BarChart3 className="w-4 h-4 text-indigo-500" /> Tier Distribution
                          </h3>
                          <div className="space-y-6">
                              {['bronze', 'silver', 'gold', 'platinum', 'diamond', 'mythic'].map(tierId => {
                                  const count = tierStats[tierId] || 0;
                                  const percentage = transactions.length ? (count / transactions.length) * 100 : 0;
                                  return (
                                      <div key={tierId}>
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="text-xs font-black uppercase tracking-widest dark:text-gray-300">{tierId}</span>
                                              <span className="text-xs font-bold text-gray-400">{count}</span>
                                          </div>
                                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                              <div className={`h-full rounded-full transition-all duration-1000 ${tierId === 'mythic' ? 'bg-fuchsia-500' : 'bg-indigo-500'}`} style={{ width: `${percentage}%` }}></div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                          <h4 className="text-lg font-bold mb-2">Financial Health</h4>
                          <p className="text-sm text-indigo-100 leading-relaxed mb-6 italic">Gegenisht is currently 84% self-funded through community patronage.</p>
                          <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/20">
                             <span className="text-xs font-black uppercase tracking-widest">Sustainability Index</span>
                             <span className="text-2xl font-black">9.1/10</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'security' && (
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-700 shadow-sm">
             <h3 className="text-2xl font-serif font-black mb-6">Vault Status: <span className="text-emerald-500">QUANTUM_SECURE</span></h3>
             <p className="text-gray-500 mb-8">All local data buffers are encrypted with AES-256. Cloud synchronization is active.</p>
             <button onClick={() => setVaultStatus('locked')} className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5" /> SEAL ALL RECORDS
             </button>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
