
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { StockItem, Transaction, User, TransactionType, SizeStock, StockVariant } from './types';
import { TRANSLATIONS, CATEGORIES, PREDEFINED_COLORS, SHIRT_SIZES } from './constants';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Accounting from './components/Accounting';
import Profile from './components/Profile';
import { supabase, isSupabaseConfigured, saveSupabaseConfig } from './supabaseClient';
import { 
  LayoutDashboard, Package, ArrowLeftRight, User as UserIcon, PlusCircle, X, Camera, Trash2, Mail, DownloadCloud, Eye, EyeOff, LogIn, UploadCloud, Check, Phone, ShieldCheck, AlertCircle, ChevronRight, UserX, Palette, ChevronDown, AlertTriangle, WifiOff, Loader2, RefreshCw, Database, CloudUpload, CheckCircle2
} from 'lucide-react';

const EXPENSE_CATEGORIES = ['Salary', 'Rent', 'Tea/Snacks', 'Transport', 'Purchase', 'Sales', 'Electricity', 'Maintenance', 'Others'];

// Global Toast Component
const Toast: React.FC<{ message: string; show: boolean; onClose: () => void }> = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);
    if (!show) return null;
    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500">
            <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-green-500/50 backdrop-blur-md">
                <CheckCircle2 size={20} className="text-green-100" />
                <span className="font-bold text-sm tamil-font whitespace-nowrap">{message}</span>
            </div>
        </div>
    );
};

// Database Config Modal
const DatabaseConfigModal: React.FC<{ onClose: () => void; language: 'ta' | 'en' }> = ({ onClose, language }) => {
    const [setupUrl, setSetupUrl] = useState(localStorage.getItem('viyabaari_supabase_url') || '');
    const [setupKey, setSetupKey] = useState(localStorage.getItem('viyabaari_supabase_key') || '');
    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        saveSupabaseConfig(setupUrl, setupKey);
    };
    return (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
                <div className="text-center mb-6">
                    <Database size={48} className="mx-auto text-indigo-600 mb-2"/>
                    <h2 className="text-xl font-black text-gray-800 tamil-font">{language === 'ta' ? 'கிளவுட் டேட்டாபேஸ் செட்டிங்ஸ்' : 'Setup Cloud Database'}</h2>
                    <p className="text-xs text-gray-500 tamil-font mt-2">{language === 'ta' ? 'ஆன்லைன் சிங்க் வசதியை பெற Supabase விவரங்களை உள்ளிடவும்.' : 'Enter Supabase Credentials to enable online sync.'}</p>
                </div>
                <form onSubmit={handleSaveConfig} className="space-y-4">
                    <input value={setupUrl} onChange={e => setSetupUrl(e.target.value)} className="w-full bg-gray-100 p-3 rounded-xl font-mono text-sm border outline-none" placeholder="Supabase URL" required />
                    <input value={setupKey} onChange={e => setSetupKey(e.target.value)} className="w-full bg-gray-100 p-3 rounded-xl font-mono text-sm border outline-none" placeholder="Anon Key" required />
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold shadow-lg">Save & Connect</button>
                </form>
             </div>
        </div>
    );
};

// Full Transaction Modal
const AddTransactionModal: React.FC<{ onSave: (txn: Omit<Transaction, 'id' | 'date'>, id?: string, date?: number) => void; onClose: () => void; initialData?: Transaction; language: 'ta' | 'en'; t: any; }> = ({ onSave, onClose, initialData, language, t }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [partyName, setPartyName] = useState(initialData?.partyName || '');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-800 tamil-font">{initialData ? t.editTransaction : t.addTransaction}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ type, amount: parseFloat(amount), category, description, partyName }, initialData?.id, initialData?.date); }} className="space-y-4">
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button type="button" onClick={() => setType('INCOME')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${type === 'INCOME' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500'}`}>{t.income}</button>
            <button type="button" onClick={() => setType('EXPENSE')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${type === 'EXPENSE' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500'}`}>{t.expense}</button>
          </div>
          <div>
             <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-3xl font-black p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100 text-gray-900" placeholder="₹ 0" autoFocus required />
          </div>
          <div className="relative">
             <input value={category} onChange={e => setCategory(e.target.value)} onFocus={() => setShowCategoryDropdown(true)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border focus:ring-2 focus:ring-indigo-100" placeholder={t.category} required />
             {showCategoryDropdown && (
                <div className="absolute z-50 bottom-full mb-2 left-0 w-full bg-white border rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                    {EXPENSE_CATEGORIES.map(c => <div key={c} onClick={() => { setCategory(c); setShowCategoryDropdown(false); }} className="p-3 hover:bg-indigo-50 cursor-pointer font-bold text-gray-700 text-sm">{c}</div>)}
                </div>
             )}
          </div>
          <input value={partyName} onChange={e => setPartyName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border focus:ring-2 focus:ring-indigo-100" placeholder={t.partyName} />
          <input value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border focus:ring-2 focus:ring-indigo-100" placeholder="..." />
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition mt-2">{initialData ? t.update : t.save}</button>
        </form>
      </div>
    </div>
  );
};

// Full Stock Modal with Image, Color, Sleeve, Size & +/- Buttons
const AddStockModal: React.FC<{ onSave: (item: any, id?: string) => void; onClose: () => void; initialData?: StockItem; language: 'ta' | 'en'; t: any; }> = ({ onSave, onClose, initialData, language, t }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [variants, setVariants] = useState<StockVariant[]>(initialData?.variants || [{ id: Date.now().toString(), imageUrl: '', sizeStocks: [{ size: 'General', quantity: 0, color: '', sleeve: '' }] }]);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<{ vIdx: number, sIdx: number, field: 'color' | 'size' | 'sleeve' } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, variantIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newVariants = [...variants];
        newVariants[variantIndex].imageUrl = reader.result as string;
        setVariants(newVariants);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSizeStock = (vIdx: number, sIdx: number, field: keyof SizeStock, value: any) => {
    const newVariants = [...variants];
    newVariants[vIdx].sizeStocks[sIdx] = { ...newVariants[vIdx].sizeStocks[sIdx], [field]: value };
    setVariants(newVariants);
    setActiveDropdown(null);
  };

  const currentVariant = variants[activeVariantIndex];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-800 tamil-font">{initialData ? t.update : t.addStock}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ name, price: parseFloat(price), category, variants }, initialData?.id); }} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t.itemName}</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border focus:ring-2 focus:ring-indigo-100" placeholder={t.itemName} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t.price}</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border focus:ring-2 focus:ring-indigo-100" placeholder="₹ 0" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t.category}</label>
              <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border focus:ring-2 focus:ring-indigo-100" placeholder="Select" required />
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2"><Palette size={16} /> {language === 'ta' ? 'வகைகள் (Variants)' : 'Variants'}</h3>
                <button type="button" onClick={() => setVariants([...variants, { id: Date.now().toString(), imageUrl: '', sizeStocks: [{ size: 'General', quantity: 0, color: '', sleeve: '' }] }])} className="text-indigo-600 text-xs font-black bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">+ {language === 'ta' ? 'புதிய வகை' : 'Add New'}</button>
             </div>
             <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                 {variants.map((v, idx) => (
                     <button key={idx} type="button" onClick={() => setActiveVariantIndex(idx)} className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 transition ${activeVariantIndex === idx ? 'border-indigo-500 bg-white ring-2 ring-indigo-100' : 'border-gray-200 bg-gray-100'}`}>
                         {v.imageUrl ? <img src={v.imageUrl} className="w-full h-full object-cover rounded-lg" alt="" /> : <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>}
                     </button>
                 ))}
             </div>
             {currentVariant && (
                <div className="space-y-4 animate-in fade-in">
                   <div className="relative aspect-video bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden">
                      {currentVariant.imageUrl ? (
                        <><img src={currentVariant.imageUrl} className="w-full h-full object-contain" alt="" />
                        <button type="button" onClick={() => { const v = [...variants]; v[activeVariantIndex].imageUrl = ''; setVariants(v); }} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"><Trash2 size={16} /></button></>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer"><Camera size={24} className="text-gray-300 mb-1" /><span className="text-xs font-bold text-gray-400">{t.photo}</span><input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, activeVariantIndex)} className="hidden" /></label>
                      )}
                   </div>
                   {currentVariant.sizeStocks.map((stock, sIdx) => (
                      <div key={sIdx} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative space-y-2">
                         <div className="grid grid-cols-2 gap-2 pr-6">
                            <div className="relative">
                               <label className="text-[10px] font-bold text-gray-400 uppercase">{t.color}</label>
                               <div onClick={() => setActiveDropdown({ vIdx: activeVariantIndex, sIdx, field: 'color' })} className="p-2 border rounded-lg text-xs font-bold flex justify-between cursor-pointer text-gray-700">{stock.color || 'Select'}<ChevronDown size={12}/></div>
                               {activeDropdown?.vIdx === activeVariantIndex && activeDropdown?.sIdx === sIdx && activeDropdown?.field === 'color' && (
                                  <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-32 overflow-y-auto">
                                     {PREDEFINED_COLORS.map(c => <div key={c.name} onClick={() => updateSizeStock(activeVariantIndex, sIdx, 'color', c.name)} className="p-2 hover:bg-indigo-50 text-xs font-bold border-b">{c.name}</div>)}
                                  </div>
                               )}
                            </div>
                            <div className="relative">
                               <label className="text-[10px] font-bold text-gray-400 uppercase">{language === 'ta' ? 'கை வகை' : 'Sleeve'}</label>
                               <div onClick={() => setActiveDropdown({ vIdx: activeVariantIndex, sIdx, field: 'sleeve' })} className="p-2 border rounded-lg text-xs font-bold flex justify-between cursor-pointer text-gray-700">{stock.sleeve || 'None'}<ChevronDown size={12}/></div>
                               {activeDropdown?.vIdx === activeVariantIndex && activeDropdown?.sIdx === sIdx && activeDropdown?.field === 'sleeve' && (
                                  <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border rounded-xl shadow-xl">
                                     <div onClick={() => updateSizeStock(activeVariantIndex, sIdx, 'sleeve', 'Full Hand')} className="p-2 hover:bg-indigo-50 text-xs font-bold border-b">Full Hand</div>
                                     <div onClick={() => updateSizeStock(activeVariantIndex, sIdx, 'sleeve', 'Half Hand')} className="p-2 hover:bg-indigo-50 text-xs font-bold border-b">Half Hand</div>
                                  </div>
                               )}
                            </div>
                            <div className="relative">
                               <label className="text-[10px] font-bold text-gray-400 uppercase">{t.size}</label>
                               <div onClick={() => setActiveDropdown({ vIdx: activeVariantIndex, sIdx, field: 'size' })} className="p-2 border rounded-lg text-xs font-bold flex justify-between cursor-pointer text-gray-700">{stock.size || 'Select'}<ChevronDown size={12}/></div>
                               {activeDropdown?.vIdx === activeVariantIndex && activeDropdown?.sIdx === sIdx && activeDropdown?.field === 'size' && (
                                  <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-32 overflow-y-auto">
                                     {SHIRT_SIZES.map(s => <div key={s} onClick={() => updateSizeStock(activeVariantIndex, sIdx, 'size', s)} className="p-2 hover:bg-indigo-50 text-xs font-bold border-b">{s}</div>)}
                                  </div>
                               )}
                            </div>
                            <div>
                               <label className="text-[10px] font-bold text-gray-400 uppercase">{t.quantity}</label>
                               <div className="flex items-center">
                                  <button type="button" onClick={() => updateSizeStock(activeVariantIndex, sIdx, 'quantity', Math.max(0, stock.quantity - 1))} className="w-8 h-8 bg-gray-100 rounded-l-lg font-bold text-gray-500 hover:bg-gray-200">-</button>
                                  <input type="number" value={stock.quantity} onChange={e => updateSizeStock(activeVariantIndex, sIdx, 'quantity', parseInt(e.target.value) || 0)} className="w-full h-8 text-center text-xs font-black outline-none border-y border-gray-100" />
                                  <button type="button" onClick={() => updateSizeStock(activeVariantIndex, sIdx, 'quantity', stock.quantity + 1)} className="w-8 h-8 bg-gray-100 rounded-r-lg font-bold text-gray-500 hover:bg-gray-200">+</button>
                               </div>
                            </div>
                         </div>
                         <button type="button" onClick={() => { const v = [...variants]; v[activeVariantIndex].sizeStocks = v[activeVariantIndex].sizeStocks.filter((_, i) => i !== sIdx); setVariants(v); }} className="absolute top-1 right-1 p-1 text-gray-300 hover:text-red-500"><X size={16}/></button>
                      </div>
                   ))}
                   <button type="button" onClick={() => { const v = [...variants]; v[activeVariantIndex].sizeStocks.push({ size: 'General', quantity: 0, color: '', sleeve: '' }); setVariants(v); }} className="w-full py-2.5 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-500 font-bold text-xs hover:bg-indigo-50 transition">+ {language === 'ta' ? 'அளவு சேர்க்க' : 'Add Option'}</button>
                </div>
             )}
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg active:scale-[0.98] transition">{initialData ? t.update : t.save}</button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stock' | 'accounts' | 'profile'>('dashboard');
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'ta' | 'en'>('ta');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Use a cleaner email key for storage
  const getEmailKey = (email: string) => email.toLowerCase().replace(/[^a-z0-9]/g, '_');

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    const savedLang = localStorage.getItem('viyabaari_lang');
    if (savedLang === 'ta' || savedLang === 'en') setLanguage(savedLang);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ uid: session.user.id, email: session.user.email || '', name: session.user.user_metadata.name || 'User', mobile: session.user.user_metadata.mobile || '', isLoggedIn: true });
      } else {
        const savedUser = localStorage.getItem('viyabaari_active_user');
        if (savedUser) setUser(JSON.parse(savedUser));
      }
    });
  }, []);

  // Fetch Data: Local first, then Supabase
  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (!user) return;
    const emailKey = getEmailKey(user.email);
    const cacheKeyStocks = `viyabaari_stocks_${emailKey}`;
    const cacheKeyTxns = `viyabaari_txns_${emailKey}`;

    // 1. Load Local Storage
    const localS = localStorage.getItem(cacheKeyStocks);
    const localT = localStorage.getItem(cacheKeyTxns);
    if (localS) setStocks(JSON.parse(localS));
    if (localT) setTransactions(JSON.parse(localT));

    // 2. Fetch from Cloud
    if (user.uid && isOnline) {
      if (isManualRefresh) setIsSyncing(true);
      try {
        const { data: sData, error: sError } = await supabase.from('stock_items').select('content').eq('user_id', user.uid);
        if (sData) {
          const freshS = sData.map((r: any) => typeof r.content === 'string' ? JSON.parse(r.content) : r.content);
          freshS.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
          setStocks(freshS);
          localStorage.setItem(cacheKeyStocks, JSON.stringify(freshS));
        }
        
        const { data: tData, error: tError } = await supabase.from('transactions').select('content').eq('user_id', user.uid);
        if (tData) {
          const freshT = tData.map((r: any) => typeof r.content === 'string' ? JSON.parse(r.content) : r.content);
          freshT.sort((a, b) => (b.date || 0) - (a.date || 0));
          setTransactions(freshT);
          localStorage.setItem(cacheKeyTxns, JSON.stringify(freshT));
        }
      } catch (e) { console.error("Cloud fetch failed:", e); }
      finally { if (isManualRefresh) setIsSyncing(false); }
    }
  }, [user, isOnline]);

  useEffect(() => {
    if (user) fetchData();
  }, [user?.uid, fetchData]);

  // Robust Save Logic
  const saveStock = async (itemData: any, id?: string) => {
    if (!user) return;
    setIsLoading(true);
    const newItem = { ...itemData, id: id || Date.now().toString(), lastUpdated: Date.now() };
    const emailKey = getEmailKey(user.email);

    // Save Local
    setStocks(prev => {
      const updated = id ? prev.map(s => s.id === id ? newItem : s) : [newItem, ...prev];
      localStorage.setItem(`viyabaari_stocks_${emailKey}`, JSON.stringify(updated));
      return updated;
    });

    // Save Cloud
    if (user.uid && isOnline) {
      try {
        await supabase.from('stock_items').upsert({ id: newItem.id, user_id: user.uid, content: newItem, last_updated: newItem.lastUpdated });
      } catch (e) { console.error("Cloud save failed:", e); }
    }

    setIsLoading(false); setIsAddingStock(false); setEditingStock(null);
    setToastMessage(language === 'ta' ? 'சரக்கு சேமிக்கப்பட்டது!' : 'Stock Saved!'); setShowToast(true);
  };

  const saveTransaction = async (txnData: any, id?: string, date?: number) => {
    if (!user) return;
    setIsLoading(true);
    const newTxn = { ...txnData, id: id || Date.now().toString(), date: date || Date.now() };
    const emailKey = getEmailKey(user.email);

    // Save Local
    setTransactions(prev => {
      const updated = id ? prev.map(t => t.id === id ? newTxn : t) : [newTxn, ...prev];
      localStorage.setItem(`viyabaari_txns_${emailKey}`, JSON.stringify(updated));
      return updated;
    });

    // Save Cloud
    if (user.uid && isOnline) {
      try {
        await supabase.from('transactions').upsert({ id: newTxn.id, user_id: user.uid, content: newTxn, date: newTxn.date });
      } catch (e) { console.error("Cloud save failed:", e); }
    }

    setIsLoading(false); setIsAddingTransaction(false); setEditingTransaction(null);
    setToastMessage(language === 'ta' ? 'கணக்கு சேமிக்கப்பட்டது!' : 'Entry Saved!'); setShowToast(true);
  };

  const t = TRANSLATIONS[language];
  if (!user) return <AuthScreen onLogin={u => { setUser(u); localStorage.setItem('viyabaari_active_user', JSON.stringify(u)); window.location.reload(); }} language={language} t={t} isOnline={isOnline} />;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl">
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
      <header className="bg-indigo-600 text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2"><h1 className="text-xl font-bold tamil-font">{t.appName}</h1>{!isOnline && <WifiOff size={14} className="opacity-70" />}</div>
        <div className="flex gap-4">
            {isOnline && user.uid && <button onClick={() => fetchData(true)} className={`p-1 rounded-full ${isSyncing ? 'animate-spin' : ''}`}><RefreshCw size={22} /></button>}
            <button onClick={() => { setEditingStock(null); setIsAddingStock(true); }} className="hover:bg-indigo-500 p-1 rounded-full transition"><PlusCircle size={22}/></button>
            <button onClick={() => { setEditingTransaction(null); setIsAddingTransaction(true); }} className="hover:bg-indigo-500 p-1 rounded-full transition"><ArrowLeftRight size={22}/></button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'dashboard' && <Dashboard stocks={stocks} transactions={transactions} language={language} user={user} onSetupServer={() => setShowDatabaseConfig(true)} />}
        {activeTab === 'stock' && <Inventory stocks={stocks} onDelete={id => {}} onEdit={s => { setEditingStock(s); setIsAddingStock(true); }} language={language} />}
        {activeTab === 'accounts' && <Accounting transactions={transactions} language={language} onEdit={t => { setEditingTransaction(t); setIsAddingTransaction(true); }} onClear={() => {}} />}
        {activeTab === 'profile' && <Profile user={user} updateUser={setUser} stocks={stocks} transactions={transactions} onLogout={() => { supabase.auth.signOut(); setUser(null); localStorage.removeItem('viyabaari_active_user'); window.location.reload(); }} onRestore={d => {}} language={language} onLanguageChange={(l) => { setLanguage(l); localStorage.setItem('viyabaari_lang', l); }} onClearTransactions={() => {}} onResetApp={() => {}} onSetupServer={() => setShowDatabaseConfig(true)} />}
      </main>
      {showDatabaseConfig && <DatabaseConfigModal onClose={() => setShowDatabaseConfig(false)} language={language} />}
      {isAddingStock && <AddStockModal onSave={saveStock} onClose={() => setIsAddingStock(false)} initialData={editingStock || undefined} language={language} t={t} />}
      {isAddingTransaction && <AddTransactionModal onSave={saveTransaction} onClose={() => setIsAddingTransaction(false)} initialData={editingTransaction || undefined} language={language} t={t} />}
      <nav className="bg-white border-t fixed bottom-0 w-full max-w-md flex justify-around p-3 z-10 shadow-lg">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}><LayoutDashboard size={24} /><span className="text-[10px] tamil-font">{t.dashboard}</span></button>
        <button onClick={() => setActiveTab('stock')} className={`flex flex-col items-center ${activeTab === 'stock' ? 'text-indigo-600' : 'text-gray-400'}`}><Package size={24} /><span className="text-[10px] tamil-font">{t.stock}</span></button>
        <button onClick={() => setActiveTab('accounts')} className={`flex flex-col items-center ${activeTab === 'accounts' ? 'text-indigo-600' : 'text-gray-400'}`}><ArrowLeftRight size={24} /><span className="text-[10px] tamil-font">{t.accounts}</span></button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}><UserIcon size={24} /><span className="text-[10px] tamil-font">{t.profile}</span></button>
      </nav>
    </div>
  );
};

const AuthScreen: React.FC<{ onLogin: (u: User) => void; language: 'ta' | 'en'; t: any; isOnline: boolean }> = ({ onLogin, language, t, isOnline }) => {
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        if (mode === 'REGISTER') {
           const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
           if (error) throw error;
           alert(language === 'ta' ? 'பதிவு வெற்றி! இப்போது லாகின் செய்யவும்.' : 'Success! Please login.');
           setMode('LOGIN');
        } else if (mode === 'LOGIN') {
           const { data, error } = await supabase.auth.signInWithPassword({ email, password });
           if (error) throw error;
           if (data.user) onLogin({ uid: data.user.id, email: data.user.email || '', name: data.user.user_metadata.name || 'User', isLoggedIn: true });
        } else {
           const { error } = await supabase.auth.resetPasswordForEmail(email);
           if (error) throw error;
           alert(t.resetLinkSent);
           setMode('LOGIN');
        }
      } catch (err: any) { alert(err.message); }
      finally { setIsLoading(false); }
    };
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white">
         <h1 className="text-4xl font-black tamil-font mb-8">Viyabaari</h1>
         <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-gray-800 shadow-2xl">
                <div className="flex gap-4 mb-6 bg-gray-100 p-1 rounded-2xl">
                    <button onClick={() => setMode('LOGIN')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${mode === 'LOGIN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Login</button>
                    <button onClick={() => setMode('REGISTER')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${mode === 'REGISTER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Sign Up</button>
                </div>
                <form onSubmit={handleAuth} className="space-y-4">
                  {mode === 'REGISTER' && <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border focus:border-indigo-200" placeholder="Name" required />}
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border focus:border-indigo-200" placeholder="Email" required />
                  {mode !== 'FORGOT' && <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border focus:border-indigo-200" placeholder="Password" required />}
                  <button disabled={isLoading} className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition">{isLoading ? <Loader2 className="animate-spin mx-auto"/> : mode === 'LOGIN' ? 'Login' : mode === 'REGISTER' ? 'Sign Up' : 'Send Reset Link'}</button>
                </form>
                <div className="mt-6 text-center space-y-3">
                    {mode === 'LOGIN' && <button onClick={() => setMode('FORGOT')} className="text-xs font-bold text-gray-400 hover:text-indigo-600">{t.forgotPassword}</button>}
                    {mode === 'FORGOT' && <button onClick={() => setMode('LOGIN')} className="text-xs font-bold text-indigo-600">{t.backToLogin}</button>}
                    <button onClick={() => onLogin({ email: 'guest@viyabaari.local', name: 'Guest', isLoggedIn: true })} className="text-indigo-600 font-bold text-sm hover:underline w-full">Guest Mode (Offline)</button>
                </div>
         </div>
      </div>
    );
};

export default App;
