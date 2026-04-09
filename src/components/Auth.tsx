import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Sprout, AlertCircle, Map, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';
import { Language, User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
  language: Language;
}

export default function Auth({ onLogin, language }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    fieldType: 'Mixed' as UserType['fieldType'],
    landArea: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          onLogin(data);
        } else {
          setError(data.error || 'Login failed');
          if (response.status === 404 || data.error?.toLowerCase().includes('invalid')) {
             setShowPopup(true);
          }
        }
      } else {
        // Registration validation
        if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.landArea) {
          setError("All fields are required");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError("Invalid email format");
          return;
        }
        if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
          setError("Invalid phone number (10 digits required)");
          return;
        }

        const { confirmPassword, ...newUser } = formData;
        
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setIsLogin(true);
          setFormData({ ...formData, password: '', confirmPassword: '' });
          alert("Account created successfully! Please login.");
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Ensure backend is running.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[2px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white/20 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-white/30"
      >
        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 mb-4">
              <Sprout size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">{t.appName}</h1>
            <p className="text-emerald-50 text-center mt-1 drop-shadow-sm font-medium">
              {t.appSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
                    <input
                      type="text"
                      placeholder={t.fullName}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder:text-white/60"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
                    <input
                      type="tel"
                      placeholder={t.phone}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder:text-white/60"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
                      <select
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white appearance-none"
                        value={formData.fieldType}
                        onChange={e => setFormData({ ...formData, fieldType: e.target.value as any })}
                      >
                        <option value="Dry Land" className="text-slate-800">{t.dryLand}</option>
                        <option value="Wet Land" className="text-slate-800">{t.wetLand}</option>
                        <option value="Mixed" className="text-slate-800">{t.mixed}</option>
                      </select>
                    </div>
                    <div className="relative">
                      <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
                      <input
                        type="number"
                        placeholder={t.landArea}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder:text-white/60"
                        value={formData.landArea}
                        onChange={e => setFormData({ ...formData, landArea: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
              <input
                type="email"
                placeholder={t.email}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder:text-white/60"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
              <input
                type="password"
                placeholder={t.password}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder:text-white/60"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
                <input
                  type="password"
                  placeholder={t.confirmPassword}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder:text-white/60"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-200 text-sm px-1 bg-red-900/30 py-2 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group mt-6"
            >
              {isLogin ? t.signIn : t.signUp}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/80">
              {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="mt-2 text-white font-bold hover:text-emerald-200 transition-colors underline underline-offset-4"
            >
              {isLogin ? t.createAccount : t.signIn}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Account Not Found Popup */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-emerald-100"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Account Not Found</h3>
              <p className="text-slate-600 mb-6">
                {t.noAccount}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setShowPopup(false);
                  }}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                >
                  {t.createAccount}
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
