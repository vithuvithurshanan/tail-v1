import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Finance from './pages/Finance';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import Suppliers from './pages/Suppliers';
import Attendance from './pages/Attendance';
import { LogOut, Sun, Moon } from 'lucide-react';

import {
  LayoutDashboard,
  Users,
  UserCircle,
  Package,
  CreditCard,
  Settings,
  Bell,
  Menu,
  X,
  ShoppingBag,
  Truck,
  ClipboardCheck
} from 'lucide-react';

import { Toaster } from 'react-hot-toast';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ to, icon: Icon, label, isDarkMode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
        isActive
          ? "bg-blue-600 text-white shadow-lg"
          : isDarkMode
            ? "text-slate-400 hover:bg-slate-800 hover:text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
      )}
    >
      <Icon size={20} />
      {label && <span className="font-medium">{label}</span>}
    </Link>
  );
};


const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user')));

  React.useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className={cn(
        "flex min-h-screen font-sans transition-colors duration-300",
        isDarkMode ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"
      )}>
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 transition-all duration-300 z-50 border-r",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm",
            isSidebarOpen ? "w-64" : "w-20"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center justify-between gap-3">
              {isSidebarOpen ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md ring-2 ring-blue-500/10">
                    <img
                      src="/logo.jpg"
                      alt="Rajani Tailors Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className={cn(
                    "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
                    isDarkMode ? "from-blue-400 to-indigo-500" : "from-blue-600 to-indigo-700"
                  )}>
                    Rajani
                  </span>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md ring-2 ring-blue-500/10 transition-all duration-300 transform hover:scale-110">
                  <img
                    src="/logo.jpg"
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={cn(
                  "p-1 rounded transition-colors",
                  isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
                )}
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
              <SidebarItem to="/" icon={LayoutDashboard} label={isSidebarOpen ? "Dashboard" : ""} isDarkMode={isDarkMode} />
              <SidebarItem to="/orders" icon={ShoppingBag} label={isSidebarOpen ? "Orders" : ""} isDarkMode={isDarkMode} />
              <SidebarItem to="/employees" icon={Users} label={isSidebarOpen ? "Employees" : ""} isDarkMode={isDarkMode} />
              <SidebarItem to="/attendance" icon={ClipboardCheck} label={isSidebarOpen ? "Attendance" : ""} isDarkMode={isDarkMode} />
              <SidebarItem to="/customers" icon={UserCircle} label={isSidebarOpen ? "Customers" : ""} isDarkMode={isDarkMode} />
              <SidebarItem to="/inventory" icon={Package} label={isSidebarOpen ? "Inventory" : ""} isDarkMode={isDarkMode} />
              <SidebarItem to="/suppliers" icon={Truck} label={isSidebarOpen ? "Suppliers" : ""} isDarkMode={isDarkMode} />
              {user.role === 'admin' && <SidebarItem to="/finance" icon={CreditCard} label={isSidebarOpen ? "Finance" : ""} isDarkMode={isDarkMode} />}
              <SidebarItem to="/notifications" icon={Bell} label={isSidebarOpen ? "Alerts" : ""} isDarkMode={isDarkMode} />
            </nav>

            <div className={cn(
              "p-4 border-t",
              isDarkMode ? "border-slate-800" : "border-slate-200"
            )}>
              <SidebarItem to="/settings" icon={Settings} label={isSidebarOpen ? "Settings" : ""} isDarkMode={isDarkMode} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            isSidebarOpen ? "ml-64" : "ml-20"
          )}
        >
          <header className={cn(
            "sticky top-0 h-16 backdrop-blur-md border-b flex items-center z-40 transition-colors duration-300",
            isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
          )}>
            <div className="w-full px-6 md:px-10 lg:px-12 flex items-center justify-between">
              <h2 className={cn(
                "text-sm md:text-lg font-semibold uppercase tracking-wider",
                isDarkMode ? "text-slate-200" : "text-slate-700"
              )}>Management System</h2>

              <div className="flex items-center gap-6">
                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={cn(
                    "p-2 rounded-lg transition-all transform active:scale-95",
                    isDarkMode
                      ? "bg-slate-800 text-amber-400 hover:bg-slate-700 shadow-lg shadow-amber-900/20"
                      : "bg-slate-100 text-blue-600 hover:bg-slate-200 shadow-lg shadow-blue-200/50"
                  )}
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white ring-2 ring-blue-500/20 shadow-lg">
                    {user.username[0]}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className={cn(
                      "text-sm font-semibold leading-none",
                      isDarkMode ? "text-slate-200" : "text-slate-900"
                    )}>{user.username}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{user.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isDarkMode ? "hover:bg-slate-800 text-slate-400 hover:text-red-400" : "hover:bg-slate-100 text-slate-500 hover:text-red-600"
                  )}
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            {user.role === 'admin' && <Route path="/finance" element={<Finance />} />}
            <Route path="/settings" element={<div className="p-8">Settings</div>} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          className: isDarkMode ? 'dark-toast' : 'light-toast',
          style: {
            background: isDarkMode ? '#1e293b' : '#fff',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          },
        }}
      />
    </Router>
  );
};

export default App;
