import React, { useState, useEffect } from 'react';
import { CreditCard, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AidatOde = () => {
  const navigate = useNavigate();
  const [monthlyAidat, setMonthlyAidat] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardData, setCardData] = useState({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const expenses = JSON.parse(localStorage.getItem('expenses')) || { elevator: 0, doorman: 0, electricity: 0, general: 0 };
    const totalExpense = Object.values(expenses).reduce((a, b) => a + b, 0);
    const aidat = Math.round(totalExpense / (users.length || 1));
    setMonthlyAidat(aidat);

    const user = users.find(u => u.id === currentUser.id);
    if (user && user.paid) setIsPaid(true);
  }, [currentUser.id]);

  const handlePayment = (e) => {
    e.preventDefault();
    setPaymentSuccess(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, paid: true } : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      const updatedUser = { ...currentUser, paid: true };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setTimeout(() => navigate('/resident'), 1000);
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div className="ml-64 p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Ödeme Başarılı!</h1>
          <p className="text-slate-500">Aidatınız kaydedilmiştir. Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Aidat Öde</h1>
      
      <div className="max-w-2xl">
        {isPaid ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Aidatınız Ödenmiştir</h2>
            <p className="text-green-600">Aylık aidat ödemeniz tamamlanmıştır. Bir sonraki ay için yeniden ödeme yapabileceksiniz.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Aylık Aidat Detayı</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-600">Toplam Aidat</span>
                  <span className="font-bold text-slate-800">₺{monthlyAidat}</span>
                </div>
              </div>

              {!showPaymentForm ? (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <CreditCard size={20} />
                  Şimdi Öde
                </button>
              ) : (
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Kart Numarası</label>
                    <input
                      type="text"
                      maxLength="16"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.cardNumber}
                      onChange={(e) => setCardData({...cardData, cardNumber: e.target.value.replace(/\D/g, '')})}
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Kart Sahibi Adı</label>
                    <input
                      type="text"
                      placeholder="AD SOYAD"
                      value={cardData.cardHolder}
                      onChange={(e) => setCardData({...cardData, cardHolder: e.target.value.toUpperCase()})}
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Son Kullanma (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/25"
                        maxLength="5"
                        value={cardData.expiryDate}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                          setCardData({...cardData, expiryDate: val});
                        }}
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">CVV</label>
                      <input
                        type="text"
                        maxLength="3"
                        placeholder="123"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      Ödemeyi Onayla
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="flex-1 bg-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-400 transition-all"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AidatOde;
