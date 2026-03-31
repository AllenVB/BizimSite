import React, { useState } from 'react';
import { Building2, Lock, User, Eye, EyeOff, Mail, Home, CheckCircle, ShieldCheck, Phone, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login, selfRegister, sendVerificationCode } from '../services/api';

const checkPasswordStrength = (pw) => {
  const hasLetter  = /[a-zA-Z]/.test(pw);
  const hasNumber  = /[0-9]/.test(pw);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(pw);
  const isLong     = pw.length >= 8;
  const score = [hasLetter, hasNumber, hasSpecial, isLong].filter(Boolean).length;
  if (!pw) return null;
  if (score <= 2) return { level: 'weak',   label: 'Zayıf',  color: 'bg-red-500',    text: 'text-red-600' };
  if (score === 3) return { level: 'medium', label: 'Orta',   color: 'bg-yellow-500', text: 'text-yellow-600' };
  return            { level: 'strong', label: 'Güçlü', color: 'bg-green-500',  text: 'text-green-600' };
};

const Login = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [showBuildingPw, setShowBuildingPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Register state
  const [regData, setRegData] = useState({
    buildingName: '', buildingPassword: '', name: '', email: '',
    phone: '', block: '', no: '',
    password: '', passwordConfirm: '', userType: 'Kiracı'
  });
  const [regStep, setRegStep] = useState('form'); // 'form' | 'verify'
  const [verifyCode, setVerifyCode] = useState('');

  const pwStrength = checkPasswordStrength(regData.password);

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await login(loginData);
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
    } finally { setLoading(false); }
  };

  // Step 1: validate form & send verification code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    if (regData.password !== regData.passwordConfirm) { setError('Şifreler eşleşmiyor!'); return; }
    if (!pwStrength || pwStrength.level === 'weak') { setError('Lütfen daha güçlü bir şifre belirleyin.'); return; }
    setLoading(true);
    try {
      await sendVerificationCode({ email: regData.email });
      setRegStep('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Doğrulama kodu gönderilemedi, tekrar deneyin.');
    } finally { setLoading(false); }
  };

  // Step 2: verify code & create account
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await selfRegister({
        buildingName: regData.buildingName,
        buildingPassword: regData.buildingPassword,
        name: regData.name,
        email: regData.email,
        password: regData.password,
        userType: regData.userType,
        verificationCode: verifyCode,
        phone: regData.phone,
        block: regData.block,
        no: regData.no
      });
      setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
      setTab('login');
      setRegStep('form');
      setVerifyCode('');
      setRegData({ buildingName:'', buildingPassword:'', name:'', email:'', phone:'', block:'', no:'', password:'', passwordConfirm:'', userType:'Kiracı' });
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız, tekrar deneyin.');
    } finally { setLoading(false); }
  };

  const handleResendCode = async () => {
    setError(''); setLoading(true);
    try {
      await sendVerificationCode({ email: regData.email });
      setSuccess('Kod tekrar gönderildi.');
    } catch (err) {
      setError(err.response?.data?.message || 'Kod gönderilemedi.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)' }}>

      {/* Arka plan */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-8%] w-[520px] h-[520px] rounded-full anim-float-1"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full anim-float-2"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.30) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute top-[60%] right-[20%] w-[350px] h-[350px] rounded-full anim-float-3"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      {/* Kart */}
      <div className="max-w-md w-full relative anim-fade-up">
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)'
          }}>

          {/* Üst başlık */}
          <div className="p-4 md:p-6 text-center text-white"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.85) 0%, rgba(99,102,241,0.85) 100%)', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
            <div className="inline-flex p-3 rounded-2xl mb-3"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)' }}>
              <Building2 size={32} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">BizimSite</h2>
            <p className="text-blue-100/80 text-xs mt-1">Apartman Yönetim Sistemi</p>
          </div>

          {/* Tab seçici */}
          <div className="flex border-b border-slate-200" style={{ background: 'rgba(255,255,255,0.97)' }}>
            {[['login', 'Giriş Yap'], ['register', 'Kayıt Ol']].map(([key, label]) => (
              <button key={key} type="button" onClick={() => { setTab(key); setError(''); setSuccess(''); setRegStep('form'); setVerifyCode(''); }}
                className={`flex-1 py-3 text-sm font-semibold transition-all duration-150 ${
                  tab === key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Form alanı */}
          <div className="p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.97)' }}>

            {success && (
              <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 p-3 rounded-xl mb-4">
                <CheckCircle size={16} /> {success}
              </div>
            )}

            {/* LOGIN FORMU */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">E-posta</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" placeholder="ornek@mail.com" required
                      className="input-field pl-10 pr-10"
                      value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Şifre</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                      className="input-field pl-10 pr-10"
                      value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
                    {eyeBtn(showPw, () => setShowPw(!showPw))}
                  </div>
                </div>
                {error && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl"><div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full btn-primary justify-center py-3 rounded-xl disabled:opacity-60">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Giriş yapılıyor...</> : 'Giriş Yap'}
                </button>
              </form>
            )}

            {/* KAYIT — ADIM 1: FORM */}
            {tab === 'register' && regStep === 'form' && (
              <form onSubmit={handleSendCode} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bina Adı</label>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" required placeholder="Güneş Apartmanı"
                        className="input-field pl-9 text-sm"
                        value={regData.buildingName} onChange={e => setRegData({...regData, buildingName: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bina Şifresi</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type={showBuildingPw ? 'text' : 'password'} required placeholder="••••••"
                        className="input-field pl-9 pr-9 text-sm"
                        value={regData.buildingPassword} onChange={e => setRegData({...regData, buildingPassword: e.target.value})} />
                      {eyeBtn(showBuildingPw, () => setShowBuildingPw(!showBuildingPw))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ad Soyad</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required placeholder="Adınız Soyadınız"
                      className="input-field pl-9 text-sm"
                      value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">E-posta</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" required placeholder="ornek@mail.com"
                      className="input-field pl-9 text-sm"
                      value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Telefon Numarası</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" required placeholder="05XX XXX XX XX"
                      className="input-field pl-9 text-sm"
                      value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Blok</label>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" required placeholder="A"
                        className="input-field pl-9 text-sm"
                        value={regData.block} onChange={e => setRegData({...regData, block: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Daire No</label>
                    <div className="relative">
                      <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" required placeholder="12"
                        className="input-field pl-9 text-sm"
                        value={regData.no} onChange={e => setRegData({...regData, no: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kullanıcı Tipi</label>
                  <div className="flex gap-2">
                    {['Kiracı', 'Mülk Sahibi'].map(type => (
                      <button key={type} type="button"
                        onClick={() => setRegData({...regData, userType: type})}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150 ${
                          regData.userType === type
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}>
                        <Home size={13} /> {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Şifre</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                      className="input-field pl-9 pr-9 text-sm"
                      value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
                    {eyeBtn(showPw, () => setShowPw(!showPw))}
                  </div>
                  {pwStrength && (
                    <div className="mt-1.5">
                      <div className="flex gap-1 mb-1">
                        {['weak','medium','strong'].map((l, i) => (
                          <div key={l} className={`h-1 flex-1 rounded-full transition-all ${
                            ['weak','medium','strong'].indexOf(pwStrength.level) >= i ? pwStrength.color : 'bg-slate-100'
                          }`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${pwStrength.text}`}>
                        {pwStrength.label} — şifre harf, rakam ve özel karakter içermelidir
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Şifre Tekrar</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={showPw2 ? 'text' : 'password'} required placeholder="••••••••"
                      className={`input-field pl-9 pr-9 text-sm ${
                        regData.passwordConfirm && regData.password !== regData.passwordConfirm ? 'border-red-300' : ''
                      }`}
                      value={regData.passwordConfirm} onChange={e => setRegData({...regData, passwordConfirm: e.target.value})} />
                    {eyeBtn(showPw2, () => setShowPw2(!showPw2))}
                  </div>
                  {regData.passwordConfirm && regData.password !== regData.passwordConfirm && (
                    <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
                  )}
                </div>

                {error && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl"><div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}</div>}

                <button type="submit" disabled={loading}
                  className="w-full btn-primary justify-center py-3 rounded-xl disabled:opacity-60">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Kod gönderiliyor...</> : 'Doğrulama Kodu Gönder'}
                </button>
              </form>
            )}

            {/* KAYIT — ADIM 2: KOD DOĞRULAMA */}
            {tab === 'register' && regStep === 'verify' && (
              <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                <div className="text-center py-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-3">
                    <ShieldCheck size={28} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">E-postanızı doğrulayın</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    <span className="font-semibold text-slate-700">{regData.email}</span> adresine 6 haneli bir doğrulama kodu gönderdik.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Doğrulama Kodu</label>
                  <input
                    type="text" inputMode="numeric" maxLength={6} required
                    placeholder="000000"
                    className="input-field text-center text-2xl font-bold tracking-widest"
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                  <p className="text-xs text-slate-400 mt-1 text-center">Kod 10 dakika geçerlidir</p>
                </div>

                {error && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl"><div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{error}</div>}
                {success && <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 p-3 rounded-xl"><CheckCircle size={14} /> {success}</div>}

                <button type="submit" disabled={loading || verifyCode.length < 6}
                  className="w-full btn-primary justify-center py-3 rounded-xl disabled:opacity-60">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Kaydediliyor...</> : 'Doğrula ve Kayıt Ol'}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button type="button" onClick={() => { setRegStep('form'); setError(''); setVerifyCode(''); }}
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
                    ← Geri dön
                  </button>
                  <button type="button" onClick={handleResendCode} disabled={loading}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors disabled:opacity-50">
                    Kodu tekrar gönder
                  </button>
                </div>
              </form>
            )}

            <p className="mt-4 text-center text-xs text-gray-400">BizimSite v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
