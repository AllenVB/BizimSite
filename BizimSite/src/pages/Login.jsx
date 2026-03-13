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
    
    // Admin kullanıcıları
    if (email.includes("admin") && password === "123") {
      navigate('/admin');
      return;
    }
    
    // localStorage'dan sakin kullanıcılarını kontrol et
    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = savedUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/resident');
      return;
    }
    
    alert("E-posta veya şifre hatalı!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-900 to-slate-900 flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border-0 backdrop-blur-xl bg-opacity-95">
        {/* Üst Kısım / Logo */}
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
            <Building2 size={40} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">BizimSite</h2>
          <p className="text-blue-100 text-sm mt-1">Apartman Yönetim Sistemi</p>
        </div>

        {/* Form Kısmı */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta Adresi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 focus:bg-white"
                  placeholder="admin@bizimsite.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-[0.98]"
            >
              Giriş Yap
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400 italic">
            <p>BizimSite v1.0 - Güvenli Yönetim Paneli</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;