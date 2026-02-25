import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, History, Menu } from 'lucide-react';
import clsx from 'clsx';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        'flex flex-col items-center justify-center w-full h-full space-y-1',
        isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
      )
    }
  >
    <Icon className="w-6 h-6" />
    <span className="text-xs font-medium font-tamil">{label}</span>
  </NavLink>
);

const Layout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header (Mobile) */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-10">
        <h1 className="text-xl font-bold text-indigo-600 font-tamil">வியாபாரி</h1>
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
          V
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 md:pl-64">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around md:hidden z-20 pb-safe">
        <NavItem to="/" icon={LayoutDashboard} label="முகப்பு" />
        <NavItem to="/inventory" icon={Package} label="சரக்கு" />
        <NavItem to="/billing" icon={ShoppingCart} label="விற்பனை" />
        <NavItem to="/transactions" icon={History} label="வரலாறு" />
      </nav>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-20">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-indigo-600 font-tamil">வியாபாரி</h1>
          <p className="text-xs text-gray-500 mt-1">Business Manager</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              )
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium font-tamil">முகப்பு (Home)</span>
          </NavLink>
          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              )
            }
          >
            <Package className="w-5 h-5" />
            <span className="font-medium font-tamil">சரக்கு (Inventory)</span>
          </NavLink>
          <NavLink
            to="/billing"
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              )
            }
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium font-tamil">விற்பனை (Billing)</span>
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              )
            }
          >
            <History className="w-5 h-5" />
            <span className="font-medium font-tamil">வரலாறு (History)</span>
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              D
            </div>
            <div>
              <p className="text-sm font-medium">Demo User</p>
              <p className="text-xs text-gray-500">Owner</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Layout;
