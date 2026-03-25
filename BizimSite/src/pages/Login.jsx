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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)' }}>

      {/* ── Animasyonlu arka plan orb'ları ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ana büyük orb'lar */}
        <div className="absolute top-[-10%] right-[-8%] w-[520px] h-[520px] rounded-full anim-float-1"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full anim-float-2"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.30) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute top-[60%] right-[20%] w-[350px] h-[350px] rounded-full anim-float-3"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {/* Küçük aksanlı orb'lar */}
        <div className="absolute top-[15%] left-[12%] w-[200px] h-[200px] rounded-full anim-float-2d"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.20) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        <div className="absolute bottom-[25%] right-[8%] w-[180px] h-[180px] rounded-full anim-float-3d"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)', filter: 'blur(28px)' }} />

        {/* Dönen halka süsü */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full anim-spin-slow"
          style={{ border: '1px solid rgba(255,255,255,0.04)', boxShadow: 'inset 0 0 60px rgba(99,102,241,0.08)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ animation: 'spin-slow 20s linear infinite reverse', border: '1px solid rgba(255,255,255,0.03)' }} />

        {/* Nokta grid desen */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      {/* ── Kart ── */}
      <div className="max-w-md w-full relative anim-fade-up">
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.10)'
          }}>

          {/* Üst başlık */}
          <div className="p-4 md:p-8 text-center text-white"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.85) 0%, rgba(99,102,241,0.85) 100%)', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
            <div className="inline-flex p-3.5 rounded-2xl mb-4"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 16px rgba(0,0,0,0.2)' }}>
              <Building2 size={38} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">BizimSite</h2>
            <p className="text-blue-100/80 text-sm mt-1">Apartman Yönetim Sistemi</p>
          </div>

          {/* Form */}
          <div className="p-4 md:p-8" style={{ background: 'rgba(255,255,255,0.97)' }}>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full btn-primary justify-center py-3.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:transform-none">
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
