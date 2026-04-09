import React, { useState } from 'react';
import { Globe, ArrowLeft, User, Mail, Phone, Map, Ruler, Camera, Save, Edit2 } from 'lucide-react';
import { translations } from '../translations';
import { Language, User as UserType } from '../types';

interface SettingsProps {
  user: UserType;
  setUser: (user: UserType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onBack: () => void;
}

export default function Settings({ user, setUser, language, setLanguage, onBack }: SettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserType>({ ...user });

  const t = translations[language];

  const languages = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
  ];

  const handleSave = async () => {
    try {
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data);
        localStorage.setItem('agri_current_user', JSON.stringify(data));
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Ensure backend is running.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-emerald-100/50 border border-emerald-50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 hover:bg-emerald-50 rounded-2xl transition-colors text-emerald-600"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-black text-slate-800">{t.settings}</h2>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              isEditing 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
            {isEditing ? t.saveChanges : t.editProfile}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Profile Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="relative group mx-auto w-48 h-48">
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-emerald-100 shadow-inner bg-emerald-50">
                <img 
                  src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all">
                  <Camera size={20} />
                </button>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
              <p className="text-slate-500">{user.email}</p>
            </div>
          </div>

          {/* Details Form */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-6 text-emerald-600">
                <User size={20} />
                <h3 className="font-bold text-lg uppercase tracking-wider">{t.profileInfo}</h3>
              </div>
              
              <div className="grid gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">{t.fullName}</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-60"
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">{t.phone}</label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-60"
                    value={editData.phone}
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6 text-emerald-600">
                <Map size={20} />
                <h3 className="font-bold text-lg uppercase tracking-wider">{t.farmDetails}</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">{t.fieldType}</label>
                  <select
                    disabled={!isEditing}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-60 appearance-none"
                    value={editData.fieldType}
                    onChange={e => setEditData({ ...editData, fieldType: e.target.value as any })}
                  >
                    <option value="Dry Land">{t.dryLand}</option>
                    <option value="Wet Land">{t.wetLand}</option>
                    <option value="Mixed">{t.mixed}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">{t.landArea}</label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-60"
                    value={editData.landArea}
                    onChange={e => setEditData({ ...editData, landArea: e.target.value })}
                  />
                </div>
              </div>
            </section>

            <section className="pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-6 text-emerald-600">
                <Globe size={20} />
                <h3 className="font-bold text-lg uppercase tracking-wider">{t.selectLanguage}</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id as Language)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      language === lang.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                      : 'border-slate-100 hover:border-emerald-200 text-slate-600'
                    }`}
                  >
                    <div className="text-lg">{lang.native}</div>
                    <div className="text-[10px] opacity-60 uppercase tracking-tighter">{lang.name}</div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
