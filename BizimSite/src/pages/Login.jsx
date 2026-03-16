import React, { useState } from 'react';
import { Building2, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (email.includes('admin') && password === '123') {
      const mainAdmin = { id: 'main', name: 'Ana Yönetici', email, role: 'admin', isMainAdmin: true };
      localStorage.setItem('currentUser', JSON.stringify(mainAdmin));
      const admins = JSON.parse(localStorage.getItem('admins')) || [];
      if (!admins.find(a => a.isMainAdmin)) {
        admins.unshift({ ...mainAdmin, password: '123', createdAt: new Date().toLocaleDateString('tr-TR') });
        localStorage.setItem('admins', JSON.stringify(admins));
      }
      navigate('/admin');
      return;
    }

    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const admin = admins.find(a => a.email === email && a.password === password);
    if (admin) {
      localStorage.setItem('currentUser', JSON.stringify({ ...admin, role: 'admin' }));
      navigate('/admin');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'kapici') navigate('/kapici');
      else navigate('/resident');
      return;
    }

    alert('E-posta veya şifre hatali!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-4"><Building2 size={40} /></div>
          <h2 className="text-2xl font-bold">BizimSite</h2>
          <p className="text-blue-100 text-sm mt-1">Apartman Yonetim Sistemi</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required placeholder="ornek@mail.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                  onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sifre</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} required placeholder="..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                  onChange={e => setFormData({ ...formData, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition">
              Giris Yap
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-gray-400">BizimSite v1.0</p>
        </div>
      </div>
    </div>
  );
};
export default Login;
