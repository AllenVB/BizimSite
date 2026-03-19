import React, { useState } from 'react';
import { Building2, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(formData);
      const user = res.data;
      localStorage.setItem('token', user.token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Eski localStorage verilerini temizle (API öncesi dönemden kalan veriler)
      ['users','complaints','announcements','paymentHistory','expenses',
       'generalExpenseItems','copTakibi','oduncRequests','messages',
       'notifications','aidatConfig','blocks','oduncItems'].forEach(k => localStorage.removeItem(k));
      if (user.role === 'superadmin') navigate('/superadmin');
      else if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'kapici') navigate('/kapici');
      else navigate('/resident');
    } catch (err) {
      setError(err.response?.data?.message || 'E-posta veya şifre hatalı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Dekoratif arka plan ışıkları */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl shadow-blue-900/50 overflow-hidden">
          {/* Üst başlık */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
            <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-4 shadow-inner">
              <Building2 size={40} />
            </div>
            <h2 className="text-2xl font-bold">BizimSite</h2>
            <p className="text-blue-100 text-sm mt-1">Apartman Yönetim Sistemi</p>
          </div>

          {/* Form */}
          <div className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" required placeholder="ornek@mail.com"
                    className="input-field pl-10"
                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full btn-primary justify-center py-3.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Giriş yapılıyor...</>
                  : 'Giriş Yap'}
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-gray-400">BizimSite v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
