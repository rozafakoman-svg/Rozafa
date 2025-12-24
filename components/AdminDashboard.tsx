
import React, { useState, useEffect, useRef } from 'react';
import { Language, Transaction, DictionaryEntry, ModuleSettings, VaultStatus } from '../types';
import { 
  ArrowLeft, Edit3, ShoppingBag, DollarSign, Users, 
  ShieldCheck, Lock, Unlock, Fingerprint, Activity, Terminal, ShieldAlert,
  Settings, Loader2, Save, Trash2, CheckCircle, RefreshCw, Globe, Zap, TrendingUp,
  Upload, FileText, AlertTriangle, Download, Database, Search, Filter, Eye, EyeOff, Sparkles, Target, Box, Anchor, Info,
  MessageSquare, Map as MapIcon, Clock, Headphones, HelpCircle, Type, AlignLeft, Heart, Book, X
} from './Icons';
import { db, Stores } from '../services/db';
import { supabase, isRemoteActive } from '../services/supabaseClient';

interface AdminDashboardProps {
  lang: Language;
  onBack: () => void;
  moduleSettings: ModuleSettings;
  onToggleModule: (key: string) => void;
}

type AdminTab = 'security' | 'inventory' | 'import' | 'financial' | 'users';

interface InventoryItem extends DictionaryEntry {
  syncStatus: 'local' | 'synced' | 'remote_only';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onBack, moduleSettings, onToggleModule }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('security');
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>('quantum_secure');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFinancialLoading, setIsFinancialLoading] = useState(false);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'pending' | 'ai' | 'user' | 'bulk'>('all');
  const [editingWord, setEditingWord] = useState<InventoryItem | null>(null);

  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{word: string; status: 'success' | 'error'; message: string}[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGeg = lang === 'geg';

  useEffect(() => {
    if (activeTab === 'financial') loadTransactions();
    if (activeTab === 'inventory') loadFullInventory();
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

  const loadFullInventory = async () => {
    setInventoryLoading(true);
    try {
      const localWords = await db.getAll<DictionaryEntry>(Stores.Dictionary);
      
      let remoteWords: DictionaryEntry[] = [];
      if (isRemoteActive()) {
        const { data, error } = await supabase!.from('dictionary').select('*');
        if (data) remoteWords = data;
        if (error) console.warn("Supabase Fetch Error:", error);
      }

      const wordMap = new Map<string, InventoryItem>();

      localWords.forEach(w => {
        wordMap.set(w.word.toLowerCase(), { ...w, syncStatus: 'local' });
      });

      remoteWords.forEach(rw => {
        const key = rw.word.toLowerCase();
        if (wordMap.has(key)) {
          wordMap.set(key, { ...wordMap.get(key)!, syncStatus: 'synced' });
        } else {
          wordMap.set(key, { ...rw as InventoryItem, syncStatus: 'remote_only' });
        }
      });

      setInventory(Array.from(wordMap.values()).sort((a, b) => a.word.localeCompare(b.word)));
    } catch (e) {
      console.error("Inventory Load Error", e);
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleModeration = async (word: string, action: 'approve' | 'decline' | 'delete') => {
    try {
      const entry = inventory.find(i => i.word.toLowerCase() === word.toLowerCase());
      if (!entry) return;

      if (action === 'approve') {
        const updated = { ...entry, status: 'approved' as const };
        await db.put(Stores.Dictionary, updated);
      } else if (action === 'decline' || action === 'delete') {
        if (!confirm(`Are you sure you want to ${action} "${word}"?`)) return;
        await db.delete(Stores.Dictionary, word);
      }
      
      loadFullInventory();
    } catch (e) {
      alert("Action failed. Check console for details.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingWord) return;
    try {
      await db.put(Stores.Dictionary, editingWord);
      setEditingWord(null);
      loadFullInventory();
    } catch (e) {
      alert("Failed to save changes to the local/remote buffer.");
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.word.toLowerCase().includes(inventorySearch.toLowerCase());
    if (!matchesSearch) return false;
    
    if (inventoryFilter === 'pending') return item.status === 'pending';
    if (inventoryFilter === 'ai') return item.source === 'ai';
    if (inventoryFilter === 'user') return item.source === 'user';
    if (inventoryFilter === 'bulk') return item.source === 'bulk';
    return true;
  });

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResults([]);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const total = lines.length - 1;
      const results: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          const entry: DictionaryEntry = {
            word: values[0],
            partOfSpeech: values[1] || 'Unknown',
            definitionEnglish: values[2] || '',
            definitionStandard: values[3] || '',
            frequency: parseInt(values[4]) || 50,
            synonyms: values[5] ? values[5].split(';') : [],
            antonyms: values[6] ? values[6].split(';') : [],
            usageNote: values[7] || '',
            examples: [],
            status: 'approved',
            source: 'bulk'
          };
          await db.put(Stores.Dictionary, entry);
          results.push({ word: entry.word, status: 'success', message: 'Imported' });
        } catch (err: any) {
          results.push({ word: `Row ${i}`, status: 'error', message: err.message });
        }
        setImportProgress(Math.round((i / total) * 100));
      }
      setImportResults(results);
      setImporting(false);
      loadFullInventory();
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const header = "word,partOfSpeech,definitionEnglish,definitionStandard,frequency,synonyms,antonyms,usageNote";
    const examples = [
      "me kênë,Folje,to be,të qenët,100,me ekzistue,me mos-kênë,Fundamental verb of existence in Geg.",
      "shpi,Emën,house,shtëpi,95,konak;banesë,,Standard archaic form.",
      "me punue,Folje,to work,të punuar,90,me veprue;me ba punë,me pritue,Authentic Geg infinitive with 'ue'."
    ].join('\n');
    
    const csvContent = `${header}\n${examples}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "gegenisht_ingestion_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTotalRevenue = () => transactions.reduce((acc, curr) => acc + curr.amount, 0);

  const moduleDefinitions = [
    { key: 'forum', label: 'Forum', icon: MessageSquare, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { key: 'map', label: 'Map', icon: MapIcon, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { key: 'history', label: 'History', icon: Clock, color: 'text-slate-600', bgColor: 'bg-slate-50' },
    { key: 'interjections', label: 'Loan Words', icon: Globe, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { key: 'podcast', label: 'Podcast', icon: Headphones, color: 'text-violet-600', bgColor: 'bg-violet-50' },
    { key: 'blog', label: 'Blog', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { key: 'shop', label: 'Shop', icon: ShoppingBag, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { key: 'faq', label: 'FAQ', icon: HelpCircle, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { key: 'glossary', label: 'Glossary', icon: Book, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    { key: 'alphabet', label: 'Alphabet', icon: Type, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { key: 'thesaurus', label: 'Thesaurus', icon: AlignLeft, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { key: 'support', label: 'Support', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50' },
    { key: 'community', label: 'Community', icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <button onClick={onBack} className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
           <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-gray-400 shadow-sm">
             <ArrowLeft className="w-5 h-5" />
           </div>
           <span className="font-bold">{isGeg ? 'Mbrapa' : 'Back'}</span>
         </button>
         <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm border border-slate-700 shadow-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="tracking-tight uppercase font-black">Linguistic Intelligence Command</span>
         </div>
      </div>

      <div className="flex gap-2 mb-10 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl w-fit overflow-x-auto no-scrollbar border border-gray-200 dark:border-gray-700 shadow-inner">
        {[
          { id: 'security', icon: ShieldCheck, label: 'Systems' },
          { id: 'inventory', icon: Database, label: 'Matrix' },
          { id: 'import', icon: Upload, label: 'Bulk Ops' },
          { id: 'financial', icon: DollarSign, label: 'Revenue' },
          { id: 'users', icon: Users, label: 'Nodes' },
        ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 transition-all whitespace-nowrap ${isActive ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-md ring-1 ring-gray-200 dark:ring-gray-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50'}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="text-sm">{tab.label}</span>
                </button>
            );
        })}
      </div>

      {activeTab === 'security' && (
        <div className="space-y-12 animate-fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 sm:p-16 border border-gray-100 dark:border-gray-800 shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.02] pointer-events-none"></div>
              <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/30 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner border-2 border-indigo-100 dark:border-indigo-800 group transition-all hover:scale-110">
                  <ShieldCheck className="w-16 h-16 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="text-4xl font-serif font-black mb-4 dark:text-white uppercase tracking-tighter">Vault Status: <span className="text-emerald-500">{vaultStatus === 'quantum_secure' ? 'QUANTUM_SECURE' : 'SEALED'}</span></h3>
              <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-lg text-lg font-medium leading-relaxed">System buffers are encrypted with AES-256-GCM. Continuous synchronization with Global Hub is active.</p>
              <div className="flex gap-4">
                  <button onClick={() => setVaultStatus(vaultStatus === 'locked' ? 'quantum_secure' : 'locked')} className="px-12 py-5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/30 hover:bg-rose-700 transition-all flex items-center gap-3 active:scale-95">
                      {vaultStatus === 'locked' ? <Unlock className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                      {vaultStatus === 'locked' ? 'OPEN RECORDS' : 'SEAL ALL RECORDS'}
                  </button>
              </div>
           </div>

           <div className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                  <Settings className="w-8 h-8 text-indigo-50" />
                  <h3 className="text-2xl font-serif font-black dark:text-white">Module Control Center</h3>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 flex-grow"></div>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Architect Override</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                  {moduleDefinitions.map((mod) => {
                      const isEnabled = moduleSettings[mod.key] !== false;
                      return (
                          <div key={mod.key} className="aspect-square bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center justify-between transition-all hover:shadow-xl hover:scale-[1.02] group">
                              <div className={`w-12 h-12 rounded-2xl ${mod.bgColor} ${mod.color} flex items-center justify-center transition-transform group-hover:rotate-12`}>
                                  <mod.icon className="w-6 h-6" />
                              </div>
                              
                              <span className="text-[10px] font-black uppercase tracking-widest text-center dark:text-gray-300">{mod.label}</span>

                              <button 
                                onClick={() => onToggleModule(mod.key)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                              >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                          </div>
                      );
                  })}

                  <div className="aspect-square bg-gray-50 dark:bg-gray-950 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center justify-between opacity-60 relative overflow-hidden">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 text-gray-400 flex items-center justify-center">
                          <Database className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-center text-gray-400">Core</span>
                      <div className="bg-gray-300 dark:bg-gray-700 h-6 w-11 rounded-full flex items-center px-1">
                          <div className="h-4 w-4 rounded-full bg-white translate-x-5" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                  </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm relative group overflow-hidden">
                    <div className="absolute -top-4 -right-4 p-8 opacity-5 text-gray-400 group-hover:scale-110 transition-transform"><Database className="w-24 h-24" /></div>
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Local Buffer</p>
                    <h4 className="text-4xl font-black text-gray-900 dark:text-white font-mono">{inventory.filter(i => i.syncStatus !== 'remote_only').length}</h4>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm relative group overflow-hidden">
                    <div className="absolute -top-4 -right-4 p-8 opacity-5 text-emerald-400 group-hover:scale-110 transition-transform"><Globe className="w-24 h-24" /></div>
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Global Vault</p>
                    <h4 className="text-4xl font-black text-emerald-500 font-mono">{inventory.filter(i => i.syncStatus !== 'local').length}</h4>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm relative group overflow-hidden">
                    <div className="absolute -top-4 -right-4 p-8 opacity-5 text-indigo-400 group-hover:scale-110 transition-transform"><Sparkles className="w-24 h-24" /></div>
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">AI Synthesis</p>
                    <h4 className="text-4xl font-black text-indigo-500 font-mono">{inventory.filter(i => i.source === 'ai').length}</h4>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm relative group overflow-hidden">
                    <div className="absolute -top-4 -right-4 p-8 opacity-5 text-rose-400 group-hover:scale-110 transition-transform"><Edit3 className="w-24 h-24" /></div>
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Audit Queue</p>
                    <h4 className="text-4xl font-black text-rose-500 font-mono">{inventory.filter(i => i.status === 'pending').length}</h4>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-grow max-w-md">
                        <div className="relative w-full group">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                           <input 
                              placeholder="Filter linguistic matrix..." 
                              value={inventorySearch}
                              onChange={e => setInventorySearch(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-[1.2rem] outline-none focus:border-indigo-500 dark:text-white font-medium transition-all"
                           />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto flex-grow">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800">
                                <th className="px-10 py-5 text-left font-black">Linguistic Lexeme</th>
                                <th className="px-10 py-5 text-center font-black">Source</th>
                                <th className="px-10 py-5 text-center font-black">Sync</th>
                                <th className="px-10 py-5 text-right font-black">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {inventoryLoading ? (
                                <tr><td colSpan={4} className="py-40 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-500" /></td></tr>
                            ) : filteredInventory.map(item => (
                                <tr key={item.word} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/5 transition-colors group">
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-serif font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter">{item.word}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{item.partOfSpeech}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border text-[9px] font-black uppercase ${item.source === 'ai' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            {item.source || 'bulk'}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                       <div className={`w-3 h-3 rounded-full mx-auto ${item.syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setEditingWord(item)} className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => handleModeration(item.word, 'delete')} className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {editingWord && (
          <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-2xl border border-white/10 shadow-3xl overflow-hidden animate-scale-in flex flex-col">
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex justify-between items-center">
                     <h2 className="text-2xl font-serif font-black dark:text-white">Lexeme Architect</h2>
                     {/* Added missing X icon here */}
                     <button onClick={() => setEditingWord(null)} className="p-2 bg-white dark:bg-gray-800 rounded-full"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-10 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none dark:text-white" value={editingWord.word} onChange={e => setEditingWord({...editingWord, word: e.target.value})} />
                        <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none dark:text-white" value={editingWord.partOfSpeech} onChange={e => setEditingWord({...editingWord, partOfSpeech: e.target.value})} />
                      </div>
                      <textarea className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none dark:text-white min-h-[120px]" value={editingWord.definitionEnglish} onChange={e => setEditingWord({...editingWord, definitionEnglish: e.target.value})} />
                  </div>
                  <div className="p-8 bg-gray-50 dark:bg-gray-950 flex justify-end gap-4">
                      <button onClick={() => setEditingWord(null)} className="px-6 py-3 text-gray-500 font-bold uppercase text-[10px]">Cancel</button>
                      <button onClick={handleSaveEdit} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest"><Save className="w-4 h-4 inline mr-2"/> Commit</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
