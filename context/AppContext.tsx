import React, { createContext, useContext, useState, useEffect } from 'react';
import { StockItem, Transaction, AppState, User } from '../types';

interface AppContextType extends AppState {
  addStock: (item: StockItem) => void;
  updateStock: (item: StockItem) => void;
  deleteStock: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  login: (user: User) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_STATE: AppState = {
  stocks: [
    {
      id: '1',
      name: 'Cotton Saree',
      category: 'Saree',
      price: 1200,
      lastUpdated: Date.now(),
      variants: [
        {
          id: 'v1',
          imageUrl: 'https://picsum.photos/200/300',
          sizeStocks: [{ size: 'Free', quantity: 10 }]
        }
      ]
    },
    {
      id: '2',
      name: 'Silk Dhoti',
      category: 'Dhoti',
      price: 800,
      lastUpdated: Date.now(),
      variants: [
        {
          id: 'v2',
          imageUrl: 'https://picsum.photos/200/301',
          sizeStocks: [{ size: 'Free', quantity: 25 }]
        }
      ]
    }
  ],
  transactions: [
    {
      id: 't1',
      type: 'INCOME',
      amount: 1200,
      category: 'Sales',
      description: 'Sold 1 Cotton Saree',
      date: Date.now() - 86400000
    }
  ],
  user: {
    email: 'demo@viyabaari.com',
    name: 'Demo User',
    isLoggedIn: true
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('viyabaari_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem('viyabaari_state', JSON.stringify(state));
  }, [state]);

  const addStock = (item: StockItem) => {
    setState(prev => ({ ...prev, stocks: [...prev.stocks, item] }));
  };

  const updateStock = (item: StockItem) => {
    setState(prev => ({
      ...prev,
      stocks: prev.stocks.map(s => s.id === item.id ? item : s)
    }));
  };

  const deleteStock = (id: string) => {
    setState(prev => ({
      ...prev,
      stocks: prev.stocks.filter(s => s.id !== id)
    }));
  };

  const addTransaction = (transaction: Transaction) => {
    setState(prev => ({ ...prev, transactions: [transaction, ...prev.transactions] }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const login = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      addStock,
      updateStock,
      deleteStock,
      addTransaction,
      deleteTransaction,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
