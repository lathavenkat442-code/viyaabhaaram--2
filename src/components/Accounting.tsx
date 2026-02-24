import React from 'react';
import { Transaction } from '../types';
import { TRANSLATIONS } from '../constants';
import { ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';

interface AccountingProps {
  transactions: Transaction[];
  language: 'ta' | 'en';
  onEdit: (txn: Transaction) => void;
  onClear: () => void;
}

const Accounting: React.FC<AccountingProps> = ({ transactions, language, onEdit, onClear }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="p-4 space-y-4">
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ArrowUpRight size={48} className="mb-4 opacity-50" />
            <p className="font-bold tamil-font">{t.addTransaction}</p>
        </div>
      ) : (
        transactions.map(txn => (
          <div key={txn.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${txn.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {txn.type === 'INCOME' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
             </div>
             <div className="flex-1 min-w-0">
                <h3 className="font-black text-gray-900 truncate">{txn.description || txn.category}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase">{new Date(txn.date).toLocaleDateString()}</p>
                {txn.partyName && <p className="text-xs font-bold text-indigo-500 truncate">@{txn.partyName}</p>}
             </div>
             <div className="text-right">
                <p className={`text-lg font-black ${txn.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.type === 'INCOME' ? '+' : '-'} ₹ {txn.amount}
                </p>
                <button onClick={() => onEdit(txn)} className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition underline mt-1">{t.edit}</button>
             </div>
          </div>
        ))
      )}
      {transactions.length > 0 && (
        <button onClick={onClear} className="w-full p-4 text-red-500 font-bold text-sm bg-red-50 rounded-2xl hover:bg-red-100 transition flex items-center justify-center gap-2">
            <Trash2 size={16} /> {t.clearData}
        </button>
      )}
    </div>
  );
};

export default Accounting;
