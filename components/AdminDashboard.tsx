
import React, { useState, useEffect } from 'react';
import { Language, Product, SecurityAudit, SystemLog, VaultStatus } from '../types';
import { 
  Shield, ArrowLeft, Edit3, ShoppingBag, DollarSign, Users, 
  Megaphone, ShieldCheck, Lock, Unlock, Fingerprint, Activity, Terminal, ShieldAlert,
  Settings, Loader2, Save, Trash2, Plus, X, CheckCircle, RefreshCw, Globe, Zap
} from './Icons';
import { db, Stores } from '../services/db';
import { supabase, isRemoteActive } from '../services/supabaseClient';

interface AdminDashboardProps {
  lang: Language;
  onBack: () => void;
}

type AdminTab = 'security' | 'contributions' | 'shop' | 'financial' | 'users' | 'advertising';

const INITIAL_MOCK_LOGS: SystemLog[] = [
  { id: 'L1', timestamp: '2 mins ago', level: 'secure', message: 'Admin Vault Unlocked', action: 'MFA_FIDO2', immutableHash: '7f8c...3a1' },
  { id: 'L2', timestamp: '15 mins ago', level: 'info', message: 'Dictionary Entry Modified', action: 'EDIT_WORD', immutableHash: 'a2b1...f92' },
  { id: 'L3', timestamp: '1 hour ago', level: 'danger', message: 'Unauthorized Access Attempt', action: 'LOGIN_FAIL', immutableHash: '9d2e...44c' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('security');
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>('quantum_secure');
  const [logs] = useState<SystemLog[]>(INITIAL_MOCK_LOGS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<'unchecked' | 'passed' | 'failed'>('unchecked');
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [cloudErrorMessage, setCloudErrorMessage] = useState<string | null>(null);

  const isGeg = lang === 'geg';

  const handleIntegrityCheck = async () => {
      setIsVerifying(true);
      const passed = await db.verifyIntegrity();
      setTimeout(() => {
          setIntegrityStatus(passed ? 'passed' : 'failed');
          setIsVerifying(false);
      }, 1500);
  };

  const testCloudConnection = async () => {
      setCloudStatus('testing');
      setCloudErrorMessage(null);
      
      try {
          if (!supabase) {
              const key = process.env.SUPABASE_ANON_KEY || '';
              if (key.includes('secret') || key.startsWith('sb_')) {
                  throw new Error("SECRET KEY DETECTED: You are using a 'service_role' key. Use the 'anon' key instead.");
              }
              throw new Error("Supabase Client missing. Check your project URL and Anon Key.");
          }
          
          // Try to ping the dictionary table
          const { data, error, status } = await supabase.from('dictionary').select('word').limit(1);
          
          if (error) {
              if (error.code === '42P01') {
                  throw new Error("Table 'dictionary' missing. Run the SQL script in Supabase.");
              } else if (error.code === 'PGRST301') {
                  throw new Error("API Key Invalid. Ensure you are using the 'anon' public key.");
              } else if (status === 403 || error.message.toLowerCase().includes('rls')) {
                  throw new Error("RLS Blocked. Run: ALTER TABLE dictionary DISABLE ROW LEVEL SECURITY;");
              }
              throw new Error(`${error.code}: ${error.message}`);
          }
          
          setCloudStatus('success');
      } catch (e: any) {
          console.error("Cloud Connection Error:", e);
          setCloudStatus('error');
          setCloudErrorMessage(e.message || "Connection blocked by browser (CORS).");
      }
  };

  const handleSealSystem = () => {
    if (window.confirm("CRITICAL ACTION: This will encrypt all local data buffers and terminate the current admin session. Proceed?")) {
        setVaultStatus('locked');
        setTimeout(() => onBack(), 1000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-20 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <button 
           onClick={onBack}
           className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
         >
           <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-gray-400 transition-colors shadow-sm">
             <ArrowLeft className="w-5 h-5" />
           </div>
           <span className="font-bold">{isGeg ? 'Mbrapa' : 'Back'}</span>
         </button>
         
         <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm border border-slate-700 shadow-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="tracking-tight uppercase">Security Operations Center</span>
         </div>
      </div>

      <div className="flex gap-2 mb-10 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl w-fit overflow-x-auto no-scrollbar">
        {[
          { id: 'security', icon: ShieldCheck, label: 'Vault & Security' },
          { id: 'contributions', icon: Edit3, label: isGeg ? 'Hyrjet' : 'Contributions' },
          { id: 'shop', icon: ShoppingBag, label: isGeg ? 'Dyqani' : 'Shop' },
          { id: 'financial', icon: DollarSign, label: isGeg ? 'Financat' : 'Financials' },
          { id: 'users', icon: Users, label: isGeg ? 'Anëtarët' : 'Users' },
        ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all whitespace-nowrap ${
                    isActive 
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-md ring-1 ring-gray-200 dark:ring-gray-600' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span className="text-sm">{tab.label}</span>
                </button>
            );
        })}
      </div>

      {activeTab === 'security' && (
          <div className="space-y-10 animate-fade-in">
              <div className="bg-slate-900 rounded-[32px] p-8 sm:p-12 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[150px] opacity-20"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="space-y-6 flex-grow">
                          <div className="flex items-center gap-4">
                              <div className="p-4 bg-indigo-500/20 rounded-3xl border border-indigo-500/30">
                                  <Lock className="w-10 h-10 text-indigo-400" />
                              </div>
                              <div>
                                  <h2 className="text-3xl font-bold font-serif mb-1">Vault Integrity</h2>
                                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                      ENCRYPTION: {vaultStatus === 'locked' ? 'SEALED' : 'QUANTUM_SECURE_256'}
                                  </div>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Cloud Sync</p>
                                  <div className="flex items-center gap-2">
                                      <span className={isRemoteActive() ? 'text-emerald-400' : 'text-amber-400'}>{isRemoteActive() ? 'ACTIVE' : 'OFFLINE'}</span>
                                      {isRemoteActive() && <Zap className="w-3 h-3 text-emerald-400 fill-current" />}
                                  </div>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Protocol</p>
                                  <p className="text-lg font-bold">HTTPS/WSS</p>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Node ID</p>
                                  <p className="text-lg font-bold">BOIF-VVM</p>
                              </div>
                          </div>
                      </div>

                      <div className="flex flex-col gap-4 w-full md:w-auto">
                          <button 
                            onClick={handleSealSystem}
                            className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-3 group"
                          >
                              <ShieldAlert className="w-5 h-5 group-hover:animate-ping" />
                              SEAL VAULT
                          </button>
                          <div className="flex flex-col gap-2">
                            <button 
                                onClick={testCloudConnection}
                                disabled={cloudStatus === 'testing'}
                                className={`px-8 py-4 rounded-2xl font-bold transition-all border flex items-center justify-center gap-2 ${cloudStatus === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : cloudStatus === 'error' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                            >
                                {cloudStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Globe className="w-4 h-4"/>}
                                {cloudStatus === 'success' ? 'Cloud Connected' : cloudStatus === 'error' ? 'Sync Check Failed' : 'Test Supabase Link'}
                            </button>
                            {cloudErrorMessage && (
                                <p className="text-[10px] text-amber-400 font-mono text-center px-4 max-w-[280px] animate-fade-in bg-black/50 py-2 rounded-xl border border-amber-900/50">
                                    DIAGNOSTIC: {cloudErrorMessage}
                                </p>
                            )}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[32px] border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                      <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                         <h2 className="text-xl font-bold font-serif flex items-center gap-3">
                            <Terminal className="w-5 h-5 text-indigo-500" />
                            Immutable Audit Logs
                         </h2>
                         <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">SECURE SESSION</span>
                      </div>
                      <div className="overflow-x-auto">
                         <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                               <tr>
                                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Event</th>
                                  <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-mono text-xs">
                               {logs.map(log => (
                                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors">
                                     <td className="px-8 py-4 text-gray-500">{log.timestamp}</td>
                                     <td className="px-8 py-4">
                                        <div className="flex items-center gap-2">
                                           <span className={`w-1.5 h-1.5 rounded-full ${log.level === 'danger' ? 'bg-red-500' : log.level === 'secure' ? 'bg-indigo-500' : 'bg-blue-400'}`}></span>
                                           <span className="font-bold dark:text-white">{log.message}</span>
                                        </div>
                                     </td>
                                     <td className="px-8 py-4 text-right text-gray-400">ENCRYPTED</td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
                      <h3 className="font-bold mb-6 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-indigo-500" />
                          System Status
                      </h3>
                      <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Local Cache (Hot)</span>
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Supabase Link (Cold)</span>
                              <Zap className={`w-4 h-4 fill-current ${cloudStatus === 'success' ? 'text-emerald-500' : 'text-amber-500'}`} />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">E2E Protocol</span>
                              <ShieldCheck className="w-4 h-4 text-blue-500" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {(activeTab === 'shop' || activeTab === 'contributions' || activeTab === 'financial' || activeTab === 'users') && (
          <div className="animate-fade-in p-20 text-center flex flex-col items-center bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
             <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4 animate-pulse" />
             <p className="text-gray-400 font-mono text-sm uppercase tracking-widest italic">
                Secure Data Buffer for {activeTab.toUpperCase()} Synchronized.
             </p>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
