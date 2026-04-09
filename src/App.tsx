import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, LogOut, Sprout, Menu, X, User as UserIcon } from 'lucide-react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { motion, AnimatePresence } from 'motion/react';
import { Language, User as UserType } from './types';
import { translations } from './translations';

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check for persistent session
    const storedUser = localStorage.getItem('agri_current_user');
    const storedLang = localStorage.getItem('agri_lang');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedLang) {
      setLanguage(storedLang as Language);
    }
    setIsLoaded(true);
  }, []);

  const handleLogin = (userData: UserType) => {
    setUser(userData);
    localStorage.setItem('agri_current_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('agri_current_user');
    setView('dashboard');
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('agri_lang', lang);
  };

  const t = translations[language];

  if (!isLoaded) return null;

  if (!user) {
    return <Auth onLogin={handleLogin} language={language} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('dashboard')}>
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
              <Sprout size={28} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight">{t.appName}</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em]">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setView('settings')}
              className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-bold ${
                view === 'settings' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <SettingsIcon size={22} />
              <span className="text-sm">{t.settings}</span>
            </button>
            
            <div className="h-10 w-[1px] bg-slate-100"></div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-black text-slate-800">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.email}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border-2 border-emerald-100 overflow-hidden flex items-center justify-center text-emerald-600">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={24} />
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                title={t.logout}
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-3 text-slate-600 bg-slate-50 rounded-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-20 bg-white border-b border-emerald-100 shadow-2xl z-20 p-6 space-y-4"
          >
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-3xl mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-emerald-100 overflow-hidden flex items-center justify-center text-emerald-600">
                <UserIcon size={24} />
              </div>
              <div>
                <p className="font-black text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => { setView('dashboard'); setIsMenuOpen(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                view === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'hover:bg-emerald-50 text-slate-600'
              }`}
            >
              <Sprout size={22} />
              Dashboard
            </button>
            <button 
              onClick={() => { setView('settings'); setIsMenuOpen(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                view === 'settings' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'hover:bg-emerald-50 text-slate-600'
              }`}
            >
              <SettingsIcon size={22} />
              {t.settings}
            </button>
            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 text-red-600 font-bold transition-all"
              >
                <LogOut size={22} />
                {t.logout}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard language={language} />
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Settings 
                user={user}
                setUser={handleLogin}
                language={language} 
                setLanguage={handleLanguageChange} 
                onBack={() => setView('dashboard')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-100 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 text-emerald-600 font-black text-2xl mb-6">
            <Sprout size={32} />
            {t.appName}
          </div>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Empowering farmers with smart data analytics and real-time advisory for a sustainable and prosperous future.
          </p>
          <div className="mt-12 pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-sm">
            <p>&copy; 2026 {t.appName} – Agricultural Data Analytics and Advisory System.</p>
            <div className="flex gap-8 font-bold">
              <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
