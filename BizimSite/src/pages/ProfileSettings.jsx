import React, { useState } from 'react';
import { Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { updateMyProfile } from '../services/api';

const ProfileSettings = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const [form, setForm] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    password: '',
    passwordConfirm: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.password && form.password !== form.passwordConfirm) {
      setError('Şifreler eşleşmiyor!'); return;
    }

    setLoading(true);
    try {
      const res = await updateMyProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password || null
      });

      // localStorage'daki currentUser'ı güncelle (token yenilenmeden gösterim için)
      const updated = { ...currentUser, name: res.data.name, email: res.data.email, phone: res.data.phone };
      localStorage.setItem('currentUser', JSON.stringify(updated));

      setForm(f => ({ ...f, password: '', passwordConfirm: '' }));
      setSuccess('Profil başarıyla güncellendi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Güncelleme başarısız, tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Profil Ayarları</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ad Soyad</label>
              <input type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-posta</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Telefon</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="05XX XXX XX XX" className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Blok <span className="text-slate-400 font-normal">(değiştirilemez)</span></label>
                <input type="text" value={currentUser.block || '—'} disabled
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Daire No <span className="text-slate-400 font-normal">(değiştirilemez)</span></label>
                <input type="text" value={currentUser.no || '—'} disabled
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed text-sm" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Şifre Değiştir (isteğe bağlı)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Yeni Şifre</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••" className="input-field pr-10" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Yeni Şifre Tekrar</label>
                  <input type={showPw ? 'text' : 'password'} value={form.passwordConfirm}
                    onChange={e => setForm({ ...form, passwordConfirm: e.target.value })}
                    placeholder="••••••••"
                    className={`input-field ${form.passwordConfirm && form.password !== form.passwordConfirm ? 'border-red-300' : ''}`} />
                  {form.passwordConfirm && form.password !== form.passwordConfirm && (
                    <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
                <AlertCircle size={15} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 p-3 rounded-xl">
                <CheckCircle size={15} /> {success}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-3 rounded-xl disabled:opacity-60">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Kaydediliyor...</>
                : <><Save size={16} /> Değişiklikleri Kaydet</>}
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          Blok ve daire numarası yönetici tarafından değiştirilebilir.
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings;
