import React from 'react';
import { StockItem, Transaction, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { Database, Package, ArrowLeftRight } from 'lucide-react';

interface DashboardProps {
  stocks: StockItem[];
  transactions: Transaction[];
  language: 'ta' | 'en';
  user: User | null;
  onSetupServer: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stocks, transactions, language, user, onSetupServer }) => {
  const t = TRANSLATIONS[language];
  const totalStockValue = stocks.reduce((acc, item) => acc + (item.price * (item.variants?.reduce((vAcc, v) => vAcc + (v.sizeStocks?.reduce((sAcc, s) => sAcc + s.quantity, 0) || 0), 0) || 0)), 0);
  const totalItems = stocks.length;
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2 tamil-font">{t.totalStockValue}</h2>
        <p className="text-4xl font-black text-gray-900">₹ {totalStockValue.toLocaleString()}</p>
        <div className="mt-4 flex gap-4 text-sm font-bold text-gray-500">
            <div className="flex items-center gap-1"><Package size={16} /> {totalItems} Items</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-5 rounded-3xl border border-green-100">
            <h3 className="text-green-600 text-xs font-black uppercase mb-1 tamil-font">{t.income}</h3>
            <p className="text-2xl font-black text-green-700">₹ {totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
            <h3 className="text-red-600 text-xs font-black uppercase mb-1 tamil-font">{t.expense}</h3>
            <p className="text-2xl font-black text-red-700">₹ {totalExpense.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex justify-between items-center">
         <div>
            <h3 className="text-indigo-600 text-xs font-black uppercase mb-1 tamil-font">{t.netBalance}</h3>
            <p className="text-3xl font-black text-indigo-900">₹ {netBalance.toLocaleString()}</p>
         </div>
         <div className="bg-white p-3 rounded-2xl shadow-sm">
            <ArrowLeftRight className="text-indigo-600" />
         </div>
      </div>

      <button onClick={onSetupServer} className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
        <Database size={20} />
        <span className="tamil-font">{t.setupServer}</span>
      </button>
    </div>
  );
};

export default Dashboard;
