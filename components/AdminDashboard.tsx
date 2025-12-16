import React, { useState } from 'react';
import { Language, PendingContribution, ContributionType, FinancialRecord } from '../types';
import { CheckCircle, XCircle, Clock, User, AlertTriangle, Edit3, PlusCircle, Shield, ArrowLeft, Filter, DollarSign, TrendingUp, TrendingDown, BarChart3, ShoppingBag, Lock, Unlock, Users } from './Icons';

interface AdminDashboardProps {
  lang: Language;
  onBack: () => void;
}

// Mock Types for Admin View
interface MockUser {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'moderator' | 'admin';
    status: 'active' | 'banned';
    joined: string;
}

const MOCK_USERS: MockUser[] = [
    { id: 'u1', name: 'Arben D.', email: 'arben@example.com', role: 'user', status: 'active', joined: '12 Jan 2024' },
    { id: 'u2', name: 'Teuta K.', email: 'teuta@example.com', role: 'moderator', status: 'active', joined: '15 Feb 2024' },
    { id: 'u3', name: 'Spammer_123', email: 'bot@spam.com', role: 'user', status: 'banned', joined: 'Yesterday' },
    { id: 'u4', name: 'Gjergj K.', email: 'admin@gegenisht.com', role: 'admin', status: 'active', joined: 'Founder' },
    { id: 'u5', name: 'Luljeta M.', email: 'luljeta@example.com', role: 'user', status: 'active', joined: '05 Mar 2024' },
];

const MOCK_CONTRIBUTIONS: PendingContribution[] = [
// ... existing code ...
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
  const [activeTab, setActiveTab] = useState<'contributions' | 'financial' | 'users'>('contributions');
  const [contributions, setContributions] = useState<PendingContribution[]>(MOCK_CONTRIBUTIONS);
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const isGeg = lang === 'geg';

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setContributions(prev => prev.map(c => 
      c.id === id ? { ...c, status: action } : c
    ));
  };

  const handleUserRoleChange = (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleUserStatusChange = (userId: string) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u));
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
           className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
         >
           <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-gray-400 transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </div>
           <span className="font-medium">{isGeg ? 'Kthehu te Komuniteti' : 'Back to Community'}</span>
         </button>
         
         <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full font-bold text-sm border border-indigo-100 dark:border-indigo-800">
            <Shield className="w-4 h-4" />
            {isGeg ? 'Paneli i Administratorit' : 'Administrator Dashboard'}
         </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setActiveTab('contributions')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
             activeTab === 'contributions' 
             ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg' 
             : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          {isGeg ? 'Kontributet' : 'Contributions'}
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
             activeTab === 'users' 
             ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
             : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          {isGeg ? 'Përdoruesit' : 'Users & Roles'}
        </button>
        <button 
          onClick={() => setActiveTab('financial')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
             activeTab === 'financial' 
             ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
             : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          {isGeg ? 'Raporti Financiar' : 'Financial P&L'}
        </button>
      </div>

      {activeTab === 'contributions' && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{isGeg ? 'Në Pritje' : 'Pending Review'}</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{contributionStats.pending}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-500">
                    <Clock className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{isGeg ? 'Të Aprovueme' : 'Approved'}</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{contributionStats.approved}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-500">
                    <CheckCircle className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{isGeg ? 'Të Refuzueme' : 'Rejected'}</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{contributionStats.rejected}</h3>
                    </div>
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-500">
                    <XCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white">{isGeg ? 'Kontributet e Fundit' : 'Recent Contributions'}</h2>
                    
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            {isGeg && f === 'all' ? 'Të gjitha' : f}
                        </button>
                    ))}
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredItems.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>{isGeg ? 'Nuk u gjet asnji kontribut.' : 'No contributions found.'}</p>
                    </div>
                    ) : (
                    filteredItems.map((item) => (
                        <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                {/* Type Icon */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                item.type === 'add_word' ? 'bg-green-100 dark:bg-green-900/30' : item.type === 'report_error' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                                }`}>
                                {getTypeIcon(item.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                                        item.type === 'add_word' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800' : 
                                        item.type === 'report_error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-100 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800'
                                    }`}>
                                        {getTypeText(item.type)}
                                    </span>
                                    <span className="text-sm text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {item.timestamp}
                                    </span>
                                    {item.status !== 'pending' && (
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                                            item.status === 'approved' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                        }`}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {item.word ? (
                                        <span>Word: <span className="font-serif italic">{item.word}</span></span>
                                    ) : 'General Contribution'}
                                </h3>
                                
                                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-sm mb-3 font-mono">
                                    {item.details}
                                </p>
                                
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    <User className="w-4 h-4" /> {item.user}
                                </div>
                                </div>

                                {/* Actions */}
                                {item.status === 'pending' && (
                                <div className="flex gap-3 flex-shrink-0">
                                    <button 
                                        onClick={() => handleAction(item.id, 'rejected')}
                                        className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm transition-colors flex items-center gap-2"
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

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
          <div className="animate-fade-in bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-500" />
                      {isGeg ? 'Menaxhimi i Përdoruesve' : 'User Management'}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {isGeg ? 'Ndryshoni rolet dhe statuset e përdoruesve.' : 'Manage roles and ban status of community members.'}
                  </p>
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {users.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${user.role === 'admin' ? 'bg-indigo-600' : user.role === 'moderator' ? 'bg-purple-600' : 'bg-gray-400'}`}>
                                              {user.name.charAt(0)}
                                          </div>
                                          <div>
                                              <div className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</div>
                                              <div className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</div>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <select 
                                        value={user.role} 
                                        onChange={(e) => handleUserRoleChange(user.id, e.target.value as any)}
                                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border outline-none cursor-pointer transition-colors ${
                                            user.role === 'admin' 
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' 
                                            : user.role === 'moderator' 
                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                        }`}
                                      >
                                          <option value="user">User</option>
                                          <option value="moderator">Moderator</option>
                                          <option value="admin">Admin</option>
                                      </select>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          user.status === 'active' 
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                      }`}>
                                          {user.status === 'active' ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                                          {user.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {user.joined}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                      <button 
                                        onClick={() => handleUserStatusChange(user.id)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            user.status === 'active' 
                                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                            : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                        }`}
                                        title={user.status === 'active' ? 'Ban User' : 'Activate User'}
                                      >
                                          {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'financial' && (
          <div className="animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">YTD Revenue</p>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400"><TrendingUp className="w-5 h-5"/></div>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white">${totalRev.toLocaleString()}</h3>
                    <p className="text-xs text-gray-400 mt-2">Shop Sales + Donations</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">YTD Expenses</p>
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400"><TrendingDown className="w-5 h-5"/></div>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white">${totalExp.toLocaleString()}</h3>
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
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                     <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white">{isGeg ? 'Raporti Mujor (2024)' : 'Monthly Report (2024)'}</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Expenses</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net P/L</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transactions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {MOCK_FINANCIALS.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{row.month}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-600 dark:text-gray-300">+${row.revenue}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-red-500 dark:text-red-400">-${row.expenses}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold text-gray-900 dark:text-white">
                                        ${row.profit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">{row.transactions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>

               {/* Recent Shop Sales Mock */}
               <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                     <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white">{isGeg ? 'Shitjet e Fundit (Dyqani)' : 'Recent Shop Sales'}</h2>
                     <ShoppingBag className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="p-6">
                      <div className="space-y-4">
                          {[1,2,3].map((i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-500 text-sm font-bold text-gray-600 dark:text-gray-200">#{1000+i}</div>
                                      <div>
                                          <p className="font-bold text-gray-900 dark:text-white">Geg Dialect T-Shirt</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">User_{900+i}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-bold text-emerald-600 dark:text-emerald-400">+$25.00</p>
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