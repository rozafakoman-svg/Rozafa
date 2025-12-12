import React, { useState } from 'react';
import { Language } from '../App';
import { PendingContribution, ContributionType, FinancialRecord } from '../types';
import { CheckCircle, XCircle, Clock, User, AlertTriangle, Edit3, PlusCircle, Shield, ArrowLeft, Filter, DollarSign, TrendingUp, TrendingDown, BarChart3, ShoppingBag } from './Icons';

interface AdminDashboardProps {
  lang: Language;
  onBack: () => void;
}

const MOCK_CONTRIBUTIONS: PendingContribution[] = [
  {
    id: '1',
    type: 'add_word',
    user: 'Arben D.',
    word: 'Votra',
    details: 'Definition: The hearth/fireplace. Cultural Note: Sacred place in the Albanian home where guests are seated.',
    timestamp: '2 hours ago',
    status: 'pending'
  },
  {
    id: '2',
    type: 'suggest_edit',
    user: 'Teuta K.',
    word: 'Besa',
    details: 'Correction: The English definition should emphasize "Word of Honor" rather than just "Faith".',
    timestamp: '5 hours ago',
    status: 'pending'
  },
  {
    id: '3',
    type: 'report_error',
    user: 'Gjon M.',
    word: 'Shpi',
    details: 'Reason: Spelling Error. The plural form listed in examples is incorrect for the Mirdita dialect.',
    timestamp: '1 day ago',
    status: 'pending'
  },
  {
    id: '4',
    type: 'add_word',
    user: 'Leke Z.',
    word: 'Cuca',
    details: 'Definition: Girl/Daughter. Region: Northern Albania.',
    timestamp: '2 days ago',
    status: 'approved'
  }
];

const MOCK_FINANCIALS: FinancialRecord[] = [
  { month: 'Jan', revenue: 1250, expenses: 400, profit: 850, transactions: 45 },
  { month: 'Feb', revenue: 1400, expenses: 420, profit: 980, transactions: 52 },
  { month: 'Mar', revenue: 1100, expenses: 450, profit: 650, transactions: 38 },
  { month: 'Apr', revenue: 1850, expenses: 500, profit: 1350, transactions: 67 },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onBack }) => {
  const [activeTab, setActiveTab] = useState<'contributions' | 'financial'>('contributions');
  const [contributions, setContributions] = useState<PendingContribution[]>(MOCK_CONTRIBUTIONS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const isGeg = lang === 'geg';

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setContributions(prev => prev.map(c => 
      c.id === id ? { ...c, status: action } : c
    ));
  };

  const filteredItems = contributions.filter(c => filter === 'all' || c.status === filter);

  const getTypeIcon = (type: ContributionType) => {
    switch (type) {
      case 'add_word': return <PlusCircle className="w-5 h-5 text-green-600" />;
      case 'suggest_edit': return <Edit3 className="w-5 h-5 text-blue-600" />;
      case 'report_error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getTypeText = (type: ContributionType) => {
    switch (type) {
      case 'add_word': return isGeg ? 'Fjalë e Re' : 'New Word';
      case 'suggest_edit': return isGeg ? 'Ndryshim' : 'Edit';
      case 'report_error': return isGeg ? 'Raportim' : 'Report';
    }
  };

  const contributionStats = {
    pending: contributions.filter(c => c.status === 'pending').length,
    approved: contributions.filter(c => c.status === 'approved').length,
    rejected: contributions.filter(c => c.status === 'rejected').length
  };

  const calculateFinancialTotals = () => {
    const totalRev = MOCK_FINANCIALS.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalExp = MOCK_FINANCIALS.reduce((acc, curr) => acc + curr.expenses, 0);
    const totalProfit = totalRev - totalExp;
    return { totalRev, totalExp, totalProfit };
  };

  const { totalRev, totalExp, totalProfit } = calculateFinancialTotals();

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up pb-20">
      <div className="flex items-center justify-between mb-8">
        <button 
           onClick={onBack}
           className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
         >
           <div className="p-2 bg-white rounded-full border border-gray-200 group-hover:border-gray-400 transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </div>
           <span className="font-medium">{isGeg ? 'Kthehu te Komuniteti' : 'Back to Community'}</span>
         </button>
         
         <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-bold text-sm border border-indigo-100">
            <Shield className="w-4 h-4" />
            {isGeg ? 'Paneli i Administratorit' : 'Administrator Dashboard'}
         </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('contributions')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
             activeTab === 'contributions' 
             ? 'bg-gray-900 text-white shadow-lg' 
             : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          {isGeg ? 'Kontributet' : 'Contributions'}
        </button>
        <button 
          onClick={() => setActiveTab('financial')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
             activeTab === 'financial' 
             ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
             : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          {isGeg ? 'Raporti Financiar' : 'Financial P&L'}
        </button>
      </div>

      {activeTab === 'contributions' && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                    <p className="text-gray-500 text-sm font-medium">{isGeg ? 'Në Pritje' : 'Pending Review'}</p>
                    <h3 className="text-3xl font-black text-gray-900">{contributionStats.pending}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                    <Clock className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                    <p className="text-gray-500 text-sm font-medium">{isGeg ? 'Të Aprovueme' : 'Approved'}</p>
                    <h3 className="text-3xl font-black text-gray-900">{contributionStats.approved}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                    <CheckCircle className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                    <p className="text-gray-500 text-sm font-medium">{isGeg ? 'Të Refuzueme' : 'Rejected'}</p>
                    <h3 className="text-3xl font-black text-gray-900">{contributionStats.rejected}</h3>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                    <XCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold font-serif text-gray-900">{isGeg ? 'Kontributet e Fundit' : 'Recent Contributions'}</h2>
                    
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {isGeg && f === 'all' ? 'Të gjitha' : f}
                        </button>
                    ))}
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredItems.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>{isGeg ? 'Nuk u gjet asnji kontribut.' : 'No contributions found.'}</p>
                    </div>
                    ) : (
                    filteredItems.map((item) => (
                        <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                {/* Type Icon */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                item.type === 'add_word' ? 'bg-green-100' : item.type === 'report_error' ? 'bg-red-100' : 'bg-blue-100'
                                }`}>
                                {getTypeIcon(item.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                                        item.type === 'add_word' ? 'bg-green-50 text-green-700 border-green-100' : 
                                        item.type === 'report_error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        {getTypeText(item.type)}
                                    </span>
                                    <span className="text-sm text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {item.timestamp}
                                    </span>
                                    {item.status !== 'pending' && (
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                                            item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {item.word ? (
                                        <span>Word: <span className="font-serif italic">{item.word}</span></span>
                                    ) : 'General Contribution'}
                                </h3>
                                
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm mb-3 font-mono">
                                    {item.details}
                                </p>
                                
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                    <User className="w-4 h-4" /> {item.user}
                                </div>
                                </div>

                                {/* Actions */}
                                {item.status === 'pending' && (
                                <div className="flex gap-3 flex-shrink-0">
                                    <button 
                                        onClick={() => handleAction(item.id, 'rejected')}
                                        className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold text-sm transition-colors flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" /> {isGeg ? 'Refuzo' : 'Reject'}
                                    </button>
                                    <button 
                                        onClick={() => handleAction(item.id, 'approved')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> {isGeg ? 'Aprovo' : 'Approve'}
                                    </button>
                                </div>
                                )}
                            </div>
                        </div>
                    ))
                    )}
                </div>
            </div>
        </>
      )}

      {activeTab === 'financial' && (
          <div className="animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">YTD Revenue</p>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp className="w-5 h-5"/></div>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900">${totalRev.toLocaleString()}</h3>
                    <p className="text-xs text-gray-400 mt-2">Shop Sales + Donations</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">YTD Expenses</p>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600"><TrendingDown className="w-5 h-5"/></div>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900">${totalExp.toLocaleString()}</h3>
                    <p className="text-xs text-gray-400 mt-2">Server & AI API Costs</p>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Net Profit</p>
                        <div className="p-2 bg-white/10 rounded-lg text-white"><BarChart3 className="w-5 h-5"/></div>
                    </div>
                    <h3 className="text-4xl font-black">${totalProfit.toLocaleString()}</h3>
                    <p className="text-xs text-gray-400 mt-2">Re-invested into project</p>
                </div>
              </div>

              {/* P&L Table */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-100">
                     <h2 className="text-xl font-bold font-serif text-gray-900">{isGeg ? 'Raporti Mujor (2024)' : 'Monthly Report (2024)'}</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-emerald-600 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-red-600 uppercase tracking-wider">Expenses</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Net P/L</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Transactions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {MOCK_FINANCIALS.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{row.month}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-600">+${row.revenue}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-red-500">-${row.expenses}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold text-gray-900">
                                        ${row.profit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{row.transactions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>

               {/* Recent Shop Sales Mock */}
               <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                     <h2 className="text-xl font-bold font-serif text-gray-900">{isGeg ? 'Shitjet e Fundit (Dyqani)' : 'Recent Shop Sales'}</h2>
                     <ShoppingBag className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="p-6">
                      <div className="space-y-4">
                          {[1,2,3].map((i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 text-sm font-bold">#{1000+i}</div>
                                      <div>
                                          <p className="font-bold text-gray-900">Geg Dialect T-Shirt</p>
                                          <p className="text-xs text-gray-500">User_{900+i}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-bold text-emerald-600">+$25.00</p>
                                      <p className="text-xs text-gray-400">Just now</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
               </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;