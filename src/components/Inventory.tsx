import React from 'react';
import { StockItem } from '../types';
import { TRANSLATIONS } from '../constants';
import { Trash2, Edit2, Package } from 'lucide-react';

interface InventoryProps {
  stocks: StockItem[];
  onDelete: (id: string) => void;
  onEdit: (item: StockItem) => void;
  language: 'ta' | 'en';
}

const Inventory: React.FC<InventoryProps> = ({ stocks, onDelete, onEdit, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="p-4 space-y-4">
      {stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Package size={48} className="mb-4 opacity-50" />
            <p className="font-bold tamil-font">{t.addStock}</p>
        </div>
      ) : (
        stocks.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="w-16 h-16 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                {item.variants?.[0]?.imageUrl ? <img src={item.variants[0].imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24} /></div>}
             </div>
             <div className="flex-1 min-w-0">
                <h3 className="font-black text-gray-900 truncate">{item.name}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase">{item.category}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-indigo-600 font-black text-sm">₹ {item.price}</span>
                    <span className="text-gray-400 text-xs font-bold">• {item.variants?.length || 0} Variants</span>
                </div>
             </div>
             <div className="flex flex-col gap-2">
                <button onClick={() => onEdit(item)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition"><Edit2 size={16} /></button>
                <button onClick={() => onDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"><Trash2 size={16} /></button>
             </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Inventory;
