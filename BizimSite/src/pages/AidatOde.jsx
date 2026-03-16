import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Shield, ChevronRight, AlertCircle, Calendar, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AidatOde = () => {
  const navigate = useNavigate();
  const [monthlyAidat, setMonthlyAidat] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [step, setStep] = useState(1);
  const [cardData, setCardData] = useState({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [expenseBreakdown, setExpenseBreakdown] = useState({});
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const expenses = JSON.parse(localStorage.getItem('expenses')) || { elevator: 0, doorman: 0, electricity: 0, general: 0 };
    const generalItems = JSON.parse(localStorage.getItem('generalExpenseItems')) || [];
    const generalTotal = generalItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const allExpenses = { ...expenses, general: generalTotal };
    setExpenseBreakdown(allExpenses);
    const totalExpense = Object.values(allExpenses).reduce((a, b) => a + b, 0);
    const aidat = Math.round(totalExpense / (users.length || 1));
    setMonthlyAidat(aidat);
    const user = users.find(u => u.id === currentUser.id || u.email === currentUser.email);
    if (user?.paid) setIsPaid(true);
  }, [currentUser.id]);

  const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const now = new Date();
      const paymentDate = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      const monthLabel = now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

      const updatedUsers = users.map(u =>
        (u.id === currentUser.id || u.email === currentUser.email)
          ? { ...u, paid: true, lastPayment: paymentDate }
          : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, paid: true, lastPayment: paymentDate }));

      // Ödeme geçmişine ekle — userName, email ile de eşleştirilebilsin
      const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
      paymentHistory.unshift({
        id: Date.now(),
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        block: currentUser.block,
        no: currentUser.no,
        amount: monthlyAidat,
        date: paymentDate,
        description: monthLabel + ' Aylık Aidat',
        status: 'paid'
      });
      localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));

      setLoading(false);
      setStep(3);
      const role = currentUser.role;
      setTimeout(() => navigate(role === 'admin' ? '/admin' : '/resident'), 2500);
    }, 1800);
  };

  const expenseLabels = { elevator: 'Asansör Bakımı', doorman: 'Kapıcı Ücreti', electricity: 'Ortak Alan Elektriği', general: 'Genel Giderler' };
  const now = new Date();
  const monthName = now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

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
            <p className="text-slate-500 max-w-sm mx-auto">{monthName} aidat ödemeniz tamamlanmıştır.</p>
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
                <span className="text-blue-200 text-sm">{currentUser.name || 'Sakin'}</span>
                <span className="text-blue-200 text-sm">{monthName}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-blue-500" /> Gider Dağılımı
              </h3>
              <div className="space-y-3">
                {Object.entries(expenseBreakdown).filter(([, v]) => v > 0).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600 text-sm">{expenseLabels[key]}</span>
                    <span className="font-semibold text-sm">₺{val.toLocaleString('tr-TR')}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 mt-2">
                  <span className="font-bold text-slate-800">Payınıza Düşen</span>
                  <span className="font-bold text-blue-600 text-lg">₺{monthlyAidat.toLocaleString('tr-TR')}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg">
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
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: formatCard(e.target.value) })}
                  maxLength={19} required
                  className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none transition text-lg font-mono" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kart Sahibi</label>
                <input type="text" placeholder="AHMET YILMAZ"
                  value={cardData.cardHolder}
                  onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none transition uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Son Kullanma</label>
                  <input type="text" placeholder="MM/YY" maxLength={5}
                    value={cardData.expiryDate}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '');
                      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                      setCardData({ ...cardData, expiryDate: v });
                    }}
                    required
                    className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CVV</label>
                  <input type="password" placeholder="•••" maxLength={3}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                    required
                    className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none transition" />
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Ödenecek Tutar</span>
                <span className="text-2xl font-bold text-blue-600">₺{monthlyAidat.toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">
                  Geri
                </button>
                <button type="submit" disabled={loading}
                  className="flex-grow bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition">
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> İşleniyor...</>
                    : <><Shield size={18} /> Güvenli Öde</>
                  }
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
