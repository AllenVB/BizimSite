import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const ProfileSettings = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('currentUser')) || {});
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    // Daire numarası değiştirilemez
    if (field === 'block' || field === 'no') return;
    setUser({ ...user, [field]: value });
  };

  const handleSave = () => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Profil Ayarları</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ad Soyad</label>
              <input
                type="text"
                value={user.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-posta</label>
              <input
                type="email"
                value={user.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Şifre</label>
              <input
                type="password"
                value={user.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={user.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Blok (Değiştirilemez)</label>
                <input
                  type="text"
                  value={user.block || ''}
                  disabled
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Daire No (Değiştirilemez)</label>
                <input
                  type="text"
                  value={user.no || ''}
                  disabled
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {saved && (
              <div className="p-4 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                ✓ Değişiklikler kaydedildi!
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                <Save size={20} />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
