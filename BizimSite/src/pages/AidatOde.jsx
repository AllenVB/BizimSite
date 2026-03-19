import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Shield, ChevronRight, AlertCircle, Calendar, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAidatConfig, getExpenses, makePayment, getPayments } from '../services/api';

const AidatOde = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [monthlyAidat, setMonthlyAidat] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [step, setStep] = useState(1);
  const [cardData, setCardData] = useState({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    Promise.all([getAidatConfig(), getExpenses(), getPayments()]).then(([cfg, exp, pay]) => {
      const c = cfg.data;
      setConfig(c);
      const expList = exp.data;
      setExpenses(expList);
      const total = expList.reduce((s, e) => s + e.amount, 0);
      if (c?.amount > 0) setMonthlyAidat(c.amount);
      else setMonthlyAidat(Math.round(total));
      // Bu ay ödeme yapıldı mı?
      const thisMonth = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      const paid = pay.data.some(p => p.description?.includes(thisMonth));
      setIsPaid(paid);
    }).catch(console.error);
  }, []);

  const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const now = new Date();
      const monthName = now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      await makePayment({ amount: monthlyAidat, description: `${monthName} Aylık Aidat` });
      // currentUser güncelle
      const updated = { ...currentUser, paid: true };
      localStorage.setItem('currentUser', JSON.stringify(updated));
      setStep(3);
      setTimeout(() => navigate(currentUser.role === 'admin' ? '/admin' : '/resident'), 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Ödeme alınamadı!');
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = { elevator: 'Asansör Bakımı', doorman: 'Kapıcı Ücreti', electricity: 'Ortak Alan Elektriği', general: 'Genel Giderler' };
  const monthName = config?.currentMonth || new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  if (step === 3) return (
    <div className="ml-64 min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Ödeme Başarılı!</h1>
        <p className="text-slate-500 mb-4">{monthName} aidatınız alındı.</p>
        <div className="bg-green-50 rounded-2xl p-4 mb-4">
          <p className="text-3xl font-bold text-green-600">₺{monthlyAidat.toLocaleString('tr-TR')}</p>
        </div>
        <p className="text-xs text-slate-400">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );

  return (
    <div className="ml-64 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Aidat Öde</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2"><Calendar size={16} /> {monthName} dönemi</p>
        </div>

        {isPaid ? (
          <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-10 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Bu Ay Ödendi ✓</h2>
            <p className="text-slate-500">{monthName} aidat ödemeniz tamamlanmıştır.</p>
            <div className="mt-6 inline-flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-full text-sm font-semibold">
              <Shield size={16} /> ₺{monthlyAidat.toLocaleString('tr-TR')} ödendi
            </div>
          </div>
        ) : step === 1 ? (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-7 text-white shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-blue-200 text-sm">Ödenecek Tutar</p>
                  <p className="text-4xl font-bold mt-1">₺{monthlyAidat.toLocaleString('tr-TR')}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl"><Building2 size={28} /></div>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200 text-sm">{currentUser.name}</span>
                <span className="text-blue-200 text-sm">{monthName}</span>
              </div>
            </div>

            {expenses.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <AlertCircle size={16} className="text-blue-500" /> Gider Dağılımı
                </h3>
                <div className="space-y-3">
                  {expenses.map(e => (
                    <div key={e.id} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-600 text-sm">{e.label || expenseCategories[e.category] || e.category}</span>
                      <span className="font-semibold text-sm">₺{e.amount.toLocaleString('tr-TR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setStep(2)} className="w-full btn-primary justify-center py-4 rounded-2xl text-lg shadow-lg">
              <CreditCard size={22} /> Ödemeye Geç <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-3xl p-7 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
              <p className="text-slate-400 text-xs mb-6 tracking-widest">KART NUMARASI</p>
              <p className="text-xl font-mono tracking-widest mb-6">{cardData.cardNumber || '•••• •••• •••• ••••'}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-xs">KART SAHİBİ</p>
                  <p className="font-semibold">{cardData.cardHolder || 'AD SOYAD'}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">SON KULLANMA</p>
                  <p className="font-semibold">{cardData.expiryDate || 'MM/YY'}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePayment} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-7 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kart Numarası</label>
                <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
                  value={cardData.cardNumber} onChange={e => setCardData({...cardData, cardNumber: formatCard(e.target.value)})}
                  maxLength={19} required className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none text-lg font-mono" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kart Sahibi</label>
                <input type="text" placeholder="AHMET YILMAZ"
                  value={cardData.cardHolder} onChange={e => setCardData({...cardData, cardHolder: e.target.value.toUpperCase()})}
                  required className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Son Kullanma</label>
                  <input type="text" placeholder="MM/YY" maxLength={5}
                    value={cardData.expiryDate} onChange={e => {
                      let v = e.target.value.replace(/\D/g,'');
                      if (v.length >= 2) v = v.slice(0,2)+'/'+v.slice(2,4);
                      setCardData({...cardData, expiryDate: v});
                    }} required className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CVV</label>
                  <input type="password" placeholder="•••" maxLength={3}
                    value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value.replace(/\D/g,'')})}
                    required className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none" />
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Ödenecek Tutar</span>
                <span className="text-2xl font-bold text-blue-600">₺{monthlyAidat.toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary justify-center py-3.5 rounded-2xl">Geri</button>
                <button type="submit" disabled={loading} className="flex-grow btn-success justify-center py-3.5 rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                  {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> İşleniyor...</> : <><Shield size={18} /> Güvenli Öde</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
export default AidatOde;
