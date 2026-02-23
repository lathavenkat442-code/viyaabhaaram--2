import React from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, Package, AlertTriangle, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, subtext }: { title: string; value: string; icon: any; color: string; subtext?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 font-tamil mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 font-mono">{value}</h3>
      {subtext && <p className="text-xs text-green-600 mt-1 font-medium">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const { stocks, transactions } = useApp();

  // Calculate Today's Sales
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).getTime();
  const todaySales = transactions
    .filter(t => t.type === 'INCOME' && t.date >= todayStart)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate Total Stock Value
  const totalStockValue = stocks.reduce((sum, item) => {
    const stockQty = item.variants.reduce((vSum, v) => vSum + v.sizeStocks.reduce((sSum, s) => sSum + s.quantity, 0), 0);
    return sum + (item.price * stockQty);
  }, 0);

  // Low Stock Items (less than 5)
  const lowStockItems = stocks.filter(item => {
    const totalQty = item.variants.reduce((vSum, v) => vSum + v.sizeStocks.reduce((sSum, s) => sSum + s.quantity, 0), 0);
    return totalQty < 5;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-tamil">வணக்கம், வியாபாரி!</h2>
        <p className="text-sm text-gray-500">{format(new Date(), 'dd MMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="இன்று விற்பனை (Today Sales)"
          value={`₹${todaySales.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-green-500"
          subtext="+12% from yesterday"
        />
        <StatCard
          title="சரக்கு மதிப்பு (Stock Value)"
          value={`₹${totalStockValue.toLocaleString()}`}
          icon={IndianRupee}
          color="bg-blue-500"
        />
        <StatCard
          title="குறைந்த இருப்பு (Low Stock)"
          value={lowStockItems.length.toString()}
          icon={AlertTriangle}
          color="bg-orange-500"
          subtext={lowStockItems.length > 0 ? "Action needed" : "All good"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 font-tamil">சமீபத்திய பரிவர்த்தனைகள் (Recent)</h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-500">{format(t.date, 'hh:mm a')}</p>
                  </div>
                </div>
                <span className={`font-bold font-mono ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}₹{t.amount}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No transactions yet.</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 font-tamil">இருப்பு எச்சரிக்கை (Stock Alert)</h3>
          <div className="space-y-3">
            {lowStockItems.map(item => {
               const totalQty = item.variants.reduce((vSum, v) => vSum + v.sizeStocks.reduce((sSum, s) => sSum + s.quantity, 0), 0);
               return (
                <div key={item.id} className="flex items-center justify-between p-3 border border-orange-100 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-orange-100">
                      <Package className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-orange-600 font-medium">Only {totalQty} left</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-white text-orange-600 text-xs font-bold rounded border border-orange-200 shadow-sm">
                    Order
                  </button>
                </div>
               );
            })}
            {lowStockItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Package className="w-12 h-12 mb-2 opacity-20" />
                <p>All items are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
