
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { StockItem, Transaction, User, TransactionType, SizeStock, StockVariant, StockHistory } from './types';
import { TRANSLATIONS, CATEGORIES, PREDEFINED_COLORS, SHIRT_SIZES } from './constants';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Accounting from './components/Accounting';
import Profile from './components/Profile';
import { supabase, isSupabaseConfigured, saveSupabaseConfig } from './supabaseClient';
import { 
  LayoutDashboard, Package, ArrowLeftRight, User as UserIcon, PlusCircle, X, Camera, Trash2, Mail, User as UserSimple, DownloadCloud, Eye, EyeOff, UserPlus, LogIn, UploadCloud, Check, Phone, ShieldCheck, AlertCircle, ChevronRight, UserX, Palette, ChevronDown, AlertTriangle, Users, Wifi, WifiOff, Loader2, RefreshCw, KeyRound, Database, Settings, CloudUpload, CheckCircle2
} from 'lucide-react';

type SecurityActionType = 'DELETE_STOCK' | 'CLEAR_TXNS' | 'RESET_APP';
interface SecurityAction {
  type: SecurityActionType;
  payload?: any; 
}

const EXPENSE_CATEGORIES = ['Salary', 'Rent', 'Tea/Snacks', 'Transport', 'Purchase', 'Sales', 'Electricity', 'Maintenance', 'Others'];

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

// ... Transaction Modal ...
const AddTransactionModal: React.FC<{ onSave: (txn: Omit<Transaction, 'id' | 'date'>, id?: string, date?: number) => void; onClose: () => void; initialData?: Transaction; language: 'ta' | 'en'; t: any; }> = ({ onSave, onClose, initialData, language, t }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [partyName, setPartyName] = useState(initialData?.partyName || '');
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black tamil-font">{initialData ? t.editTransaction : t.addTransaction}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ type, amount: parseFloat(amount), category, description, partyName }, initialData?.id, initialData?.date); }} className="space-y-4">
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button type="button" onClick={() => setType('INCOME')} className={`flex-1 py-3 rounded-xl font-black text-sm transition ${type === 'INCOME' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500'}`}>{t.income}</button>
            <button type="button" onClick={() => setType('EXPENSE')} className={`flex-1 py-3 rounded-xl font-black text-sm transition ${type === 'EXPENSE' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500'}`}>{t.expense}</button>
          </div>
          <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-3xl font-black p-4 bg-gray-50 rounded-2xl outline-none" placeholder="₹ 0" autoFocus required />
          <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" placeholder={t.category} required />
          <input value={partyName} onChange={e => setPartyName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" placeholder={t.partyName} />
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">{initialData ? t.update : t.save}</button>
        </form>
      </div>
    </div>
  );
};

// ... Stock Modal ...
const AddStockModal: React.FC<{ onSave: (item: any, id?: string) => void; onClose: () => void; initialData?: StockItem; language: 'ta' | 'en'; t: any; }> = ({ onSave, onClose, initialData, language, t }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [variants, setVariants] = useState<StockVariant[]>(initialData?.variants || [{ id: Date.now().toString(), imageUrl: '', sizeStocks: [{ size: 'General', quantity: 1 }] }]);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black tamil-font">{initialData ? t.update : t.addStock}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ name, price: parseFloat(price), category, variants }, initialData?.id); }} className="space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" placeholder={t.itemName} required />
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" placeholder="₹ Price" required />
          <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" placeholder={t.category} required />
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">{initialData ? t.update : t.save}</button>
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
  const [securityAction, setSecurityAction] = useState<SecurityAction | null>(null);
  const [securityOtp, setSecurityOtp] = useState<string>('');
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ uid: session.user.id, email: session.user.email || '', name: session.user.user_metadata.name || 'User', mobile: session.user.user_metadata.mobile || '', isLoggedIn: true });
      } else {
        const savedUser = localStorage.getItem('viyabaari_active_user');
        if (savedUser) setUser(JSON.parse(savedUser));
      }
    });
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  // --- FORCE FETCHING (Cloud to Local Overwrite) ---
  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (!user) return;
    const cacheKeyStocks = `viyabaari_stocks_${user.email}`;
    const cacheKeyTxns = `viyabaari_txns_${user.email}`;

    // Load Local first for speed
    const localS = localStorage.getItem(cacheKeyStocks);
    const localT = localStorage.getItem(cacheKeyTxns);
    if (localS) setStocks(JSON.parse(localS));
    if (localT) setTransactions(JSON.parse(localT));

    // Force Cloud Fetch
    if (user.uid && isOnline) {
      if (isManualRefresh) setIsSyncing(true);
      try {
        const { data: sData } = await supabase.from('stock_items').select('content').eq('user_id', user.uid);
        if (sData) {
          const freshS = sData.map((r: any) => typeof r.content === 'string' ? JSON.parse(r.content) : r.content);
          freshS.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
          setStocks(freshS);
          localStorage.setItem(cacheKeyStocks, JSON.stringify(freshS));
        }
        const { data: tData } = await supabase.from('transactions').select('content').eq('user_id', user.uid);
        if (tData) {
          const freshT = tData.map((r: any) => typeof r.content === 'string' ? JSON.parse(r.content) : r.content);
          freshT.sort((a, b) => (b.date || 0) - (a.date || 0));
          setTransactions(freshT);
          localStorage.setItem(cacheKeyTxns, JSON.stringify(freshT));
        }
      } catch (e) { console.error(e); }
      finally { if (isManualRefresh) setIsSyncing(false); }
    }
  }, [user, isOnline]);

  useEffect(() => {
    if (user) fetchData();
  }, [user?.uid, fetchData]);

  // --- IMMEDIATE UI UPDATE ON SAVE ---
  const saveStock = async (itemData: any, id?: string) => {
    setIsLoading(true);
    let newItem = { ...itemData, id: id || Date.now().toString(), lastUpdated: Date.now() };
    if (user?.uid && isOnline) {
      await supabase.from('stock_items').upsert({ id: newItem.id, user_id: user.uid, content: newItem, last_updated: newItem.lastUpdated });
    }
    // Update state immediately
    setStocks(prev => {
      const updated = id ? prev.map(s => s.id === id ? newItem : s) : [newItem, ...prev];
      if (user?.email) localStorage.setItem(`viyabaari_stocks_${user.email}`, JSON.stringify(updated));
      return updated;
    });
    setIsLoading(false); setIsAddingStock(false); setEditingStock(null);
    setToastMessage(language === 'ta' ? 'சரக்கு சேமிக்கப்பட்டது!' : 'Stock Saved!'); setShowToast(true);
  };

  const saveTransaction = async (txnData: any, id?: string, date?: number) => {
    setIsLoading(true);
    let newTxn = { ...txnData, id: id || Date.now().toString(), date: date || Date.now() };
    if (user?.uid && isOnline) {
      await supabase.from('transactions').upsert({ id: newTxn.id, user_id: user.uid, content: newTxn, date: newTxn.date });
    }
    // Update state immediately
    setTransactions(prev => {
      const updated = id ? prev.map(t => t.id === id ? newTxn : t) : [newTxn, ...prev];
      if (user?.email) localStorage.setItem(`viyabaari_txns_${user.email}`, JSON.stringify(updated));
      return updated;
    });
    setIsLoading(false); setIsAddingTransaction(false); setEditingTransaction(null);
    setToastMessage(language === 'ta' ? 'கணக்கு சேமிக்கப்பட்டது!' : 'Entry Saved!'); setShowToast(true);
  };

  const t = TRANSLATIONS[language];
  if (!user) return <AuthScreen onLogin={u => { setUser(u); localStorage.setItem('viyabaari_active_user', JSON.stringify(u)); }} language={language} t={t} isOnline={isOnline} />;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl">
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
      <header className="bg-indigo-600 text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2"><h1 className="text-xl font-bold tamil-font">{t.appName}</h1>{!isOnline && <WifiOff size={14} className="opacity-70" />}</div>
        <div className="flex gap-4">
            {isOnline && user.uid && <button onClick={() => fetchData(true)} className={`p-1 rounded-full ${isSyncing ? 'animate-spin' : ''}`}><RefreshCw size={22} /></button>}
            <button onClick={() => { setEditingStock(null); setIsAddingStock(true); }} className="hover:bg-indigo-500 p-1 rounded-full"><PlusCircle size={22}/></button>
            <button onClick={() => { setEditingTransaction(null); setIsAddingTransaction(true); }} className="hover:bg-indigo-500 p-1 rounded-full"><ArrowLeftRight size={22}/></button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'dashboard' && <Dashboard stocks={stocks} transactions={transactions} language={language} user={user} onSetupServer={() => setShowDatabaseConfig(true)} />}
        {activeTab === 'stock' && <Inventory stocks={stocks} onDelete={id => setSecurityOtp('1234')} onEdit={s => { setEditingStock(s); setIsAddingStock(true); }} language={language} />}
        {activeTab === 'accounts' && <Accounting transactions={transactions} language={language} onEdit={t => { setEditingTransaction(t); setIsAddingTransaction(true); }} onClear={() => {}} />}
        {activeTab === 'profile' && <Profile user={user} updateUser={setUser} stocks={stocks} transactions={transactions} onLogout={() => setUser(null)} onRestore={d => {}} language={language} onLanguageChange={setLanguage} onClearTransactions={() => {}} onResetApp={() => {}} onSetupServer={() => setShowDatabaseConfig(true)} />}
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

// --- AUTH SCREEN RESTORATION ---
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
         <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-gray-800 shadow-2xl animate-in slide-in-from-bottom duration-500">
                <div className="flex gap-4 mb-6 bg-gray-100 p-1 rounded-2xl">
                    <button onClick={() => setMode('LOGIN')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${mode === 'LOGIN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Login</button>
                    <button onClick={() => setMode('REGISTER')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${mode === 'REGISTER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Sign Up</button>
                </div>
                
                <form onSubmit={handleAuth} className="space-y-4">
                  {mode === 'REGISTER' && <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border focus:border-indigo-200" placeholder="Name" required />}
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border focus:border-indigo-200" placeholder="Email" required />
                  {mode !== 'FORGOT' && <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border focus:border-indigo-200" placeholder="Password" required />}
                  
                  <button disabled={isLoading} className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition">
                      {isLoading ? '...' : mode === 'LOGIN' ? 'Login' : mode === 'REGISTER' ? 'Sign Up' : 'Send Reset Link'}
                  </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                    {mode === 'LOGIN' && <button onClick={() => setMode('FORGOT')} className="text-xs font-bold text-gray-400 hover:text-indigo-600">{t.forgotPassword}</button>}
                    {mode === 'FORGOT' && <button onClick={() => setMode('LOGIN')} className="text-xs font-bold text-indigo-600">{t.backToLogin}</button>}
                    <div className="h-px bg-gray-100 w-full"></div>
                    <button onClick={() => onLogin({ email: 'guest@viyabaari.local', name: 'Guest', isLoggedIn: true })} className="text-indigo-600 font-bold text-sm hover:underline">Guest Mode (Offline)</button>
                </div>
         </div>
      </div>
    );
};

export default App;
