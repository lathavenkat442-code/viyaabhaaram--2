import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingCart, Plus, Minus, Trash2, Printer } from 'lucide-react';
import { StockItem, Transaction } from '../types';

interface CartItem extends StockItem {
  cartQty: number;
}

const Billing = () => {
  const { stocks, addTransaction } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const filteredStocks = stocks.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item: StockItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, cartQty: i.cartQty + 1 } : i);
      }
      return [...prev, { ...item, cartQty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.cartQty + delta);
        return { ...item, cartQty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'INCOME',
      amount: totalAmount,
      category: 'Sales',
      description: `Sale of ${cart.length} items`,
      date: Date.now(),
      // In a real app, we'd store line items too
    };

    addTransaction(transaction);
    setLastTransaction(transaction);
    setShowReceipt(true);
    setCart([]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6">
      {/* Product Selection (Left) */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStocks.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="flex flex-col items-start p-4 bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-xl transition-all text-left group"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-400 group-hover:text-indigo-600 mb-3 shadow-sm">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-gray-900 line-clamp-2 font-tamil">{item.name}</h3>
                <p className="text-indigo-600 font-bold mt-1">₹{item.price}</p>
                <p className="text-xs text-gray-500 mt-1">{item.category}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart (Right) */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 flex items-center font-tamil">
            <ShoppingCart className="w-5 h-5 mr-2" />
            கூடை (Cart)
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 font-tamil">{item.name}</h4>
                <p className="text-xs text-gray-500">₹{item.price} x {item.cartQty}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded-md transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.cartQty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded-md transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 opacity-50">
              <ShoppingCart className="w-12 h-12" />
              <p>Cart is empty</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-tamil">மொத்தம் (Total)</span>
            <span className="text-2xl font-bold text-gray-900">₹{totalAmount}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all font-tamil"
          >
            பணம் செலுத்து (Checkout)
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <Printer className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-tamil">விற்பனை வெற்றி!</h3>
            <p className="text-gray-500 mb-6">Transaction ID: {lastTransaction.id}</p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <p className="text-3xl font-bold text-gray-900">₹{lastTransaction.amount}</p>
              <p className="text-sm text-gray-500 mt-1">{new Date(lastTransaction.date).toLocaleString()}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
