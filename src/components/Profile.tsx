import React from 'react';
import { User, StockItem, Transaction } from '../types';
import { TRANSLATIONS } from '../constants';
import { LogOut, Settings, Database, RefreshCw, Trash2, User as UserIcon } from 'lucide-react';

interface ProfileProps {
  user: User | null;
  updateUser: (user: User) => void;
  stocks: StockItem[];
  transactions: Transaction[];
  onLogout: () => void;
  onRestore: (data: any) => void;
  language: 'ta' | 'en';
  onLanguageChange: (lang: 'ta' | 'en') => void;
  onClearTransactions: () => void;
  onResetApp: () => void;
  onSetupServer: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, updateUser, stocks, transactions, onLogout, onRestore, language, onLanguageChange, onClearTransactions, onResetApp, onSetupServer }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-2xl">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : user?.name?.charAt(0) || <UserIcon />}
        </div>
        <div>
            <h2 className="text-xl font-black text-gray-900">{user?.name || 'Guest'}</h2>
            <p className="text-sm font-bold text-gray-400">{user?.email || 'Offline Mode'}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 tamil-font">{t.language}</h3>
        <div className="flex gap-2">
            <button onClick={() => onLanguageChange('ta')} className={`flex-1 py-3 rounded-xl font-black text-sm transition ${language === 'ta' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>தமிழ்</button>
            <button onClick={() => onLanguageChange('en')} className={`flex-1 py-3 rounded-xl font-black text-sm transition ${language === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>English</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 tamil-font">{t.settings}</h3>
        
        <button onClick={onSetupServer} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 hover:bg-gray-100 transition flex items-center gap-3">
            <Database size={20} className="text-indigo-600" />
            <span className="tamil-font">{t.setupServer}</span>
        </button>

        <button onClick={onClearTransactions} className="w-full p-4 bg-red-50 rounded-2xl font-bold text-red-600 hover:bg-red-100 transition flex items-center gap-3">
            <Trash2 size={20} />
            <span className="tamil-font">{t.clearData}</span>
        </button>

        <button onClick={onLogout} className="w-full p-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition flex items-center justify-center gap-2 shadow-lg">
            <LogOut size={20} />
            <span className="tamil-font">{t.logout}</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
