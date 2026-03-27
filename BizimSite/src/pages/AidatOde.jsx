import React, { useState, useEffect } from 'react';
import { CheckCircle, Upload, Building2, AlertCircle, Calendar, Copy, Clock } from 'lucide-react';
import { getAidatConfig, getPayments, makePayment } from '../services/api';

const AidatOde = () => {
  const [config, setConfig] = useState(null);
  const [monthlyAidat, setMonthlyAidat] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const [rejectedNote, setRejectedNote] = useState(null);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dekontPreview, setDekontPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    Promise.all([getAidatConfig(), getPayments()]).then(([cfg, pay]) => {
      const c = cfg.data;
      setConfig(c);
      if (c?.amount > 0) {
        setMonthlyAidat(c.amount);
        setAmount(c.amount.toString());
      }
      const periodStart = c?.periodStartDate ? new Date(c.periodStartDate) : null;
      const periodEnd = c?.periodEndDate ? new Date(new Date(c.periodEndDate).setHours(23, 59, 59, 999)) : null;
      const inPeriod = (d) => {
        if (!periodStart || !periodEnd) return true;
        return d >= periodStart && d <= periodEnd;
      };
      const periodPayments = pay.data.filter(p => inPeriod(new Date(p.paidAt)));
      setIsPaid(periodPayments.some(p => p.status === 'confirmed'));
      setHasPending(periodPayments.some(p => p.status === 'pending'));
      const rejected = periodPayments.find(p => p.status === 'rejected');
      if (rejected && !periodPayments.some(p => p.status === 'confirmed' || p.status === 'pending')) {
        setRejectedNote(rejected.adminNote || '');
      }
    }).catch(console.error);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDekontPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dekontPreview) { alert('Lütfen dekont görseli yükleyin.'); return; }
    setLoading(true);
    try {
      const monthName = config?.currentMonth || new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      await makePayment({ amount: parseFloat(amount), description: `${monthName} Aylık Aidat`, dekontUrl: dekontPreview, dekontNote: note });
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.message || 'Gönderim başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const copyIban = () => {
    navigator.clipboard.writeText(config?.ibanNo || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monthName = config?.currentMonth || new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  if (step === 3) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Clock size={36} className="text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Dekont Alındı!</h1>
        <p className="text-slate-500 mb-1">Ödemeniz yöneticiye iletildi.</p>
        <p className="text-sm text-slate-400">Onaylandıktan sonra ödeme geçmişinizde görünecektir.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Aidat Öde</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2"><Calendar size={16} /> {monthName} dönemi</p>
        </div>

        {isPaid ? (
          <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-10 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={36} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Bu Ay Ödendi ✓</h2>
            <p className="text-slate-500">{monthName} aidat ödemeniz onaylanmıştır.</p>
          </div>
        ) : hasPending ? (
          <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-10 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Clock size={36} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Onay Bekleniyor</h2>
            <p className="text-slate-500">Dekontunuz iletildi. Yönetici onayı bekleniyor.</p>
          </div>
        ) : rejectedNote !== null ? (
          <div className="space-y-5">
            <div className="bg-red-50 border border-red-200 rounded-3xl p-7">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={24} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-700 mb-1">Dekontunuz Reddedildi</h2>
                  {rejectedNote ? (
                    <p className="text-sm text-red-600 font-medium">Gerekçe: {rejectedNote}</p>
                  ) : (
                    <p className="text-sm text-red-500">Yönetici bir gerekçe belirtmedi.</p>
                  )}
                  <p className="text-sm text-red-500 mt-2">Lütfen dekontu tekrar yükleyin.</p>
                </div>
              </div>
            </div>
            <button onClick={() => { setRejectedNote(null); setStep(2); setDekontPreview(''); setNote(''); }}
              className="w-full btn-primary justify-center py-4 rounded-2xl text-lg shadow-lg">
              <Upload size={22} /> Yeniden Dekont Yükle
            </button>
          </div>
        ) : step === 1 ? (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-7 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-200 text-sm">Ödenecek Tutar</p>
                  <p className="text-4xl font-bold mt-1">₺{monthlyAidat.toLocaleString('tr-TR')}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-2xl"><Building2 size={28} /></div>
              </div>
              <p className="text-blue-200 text-sm">{currentUser.name} — {monthName}</p>
            </div>

            {config?.ibanNo ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <AlertCircle size={16} className="text-blue-500" /> Ödeme Yapılacak Hesap
                </h3>
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Hesap Sahibi</p>
                    <p className="font-bold text-slate-800">{config.accountHolder || '—'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 mb-1">IBAN</p>
                      <p className="font-mono font-bold text-slate-800 text-sm break-all">{config.ibanNo}</p>
                    </div>
                    <button onClick={copyIban}
                      className="flex-shrink-0 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl font-semibold hover:bg-blue-200 transition flex items-center gap-1.5">
                      <Copy size={13} /> {copied ? 'Kopyalandı!' : 'Kopyala'}
                    </button>
                  </div>
                </div>
                <div className="mt-4 bg-amber-50 rounded-2xl p-3 border border-amber-100">
                  <p className="text-xs text-amber-700">
                    Yukarıdaki IBAN'a <strong>₺{monthlyAidat.toLocaleString('tr-TR')}</strong> tutarında havale/EFT yapın,
                    ardından dekontu yükleyin.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                <p className="text-amber-700 text-sm font-medium">IBAN bilgisi henüz girilmemiş. Lütfen yöneticinizle iletişime geçin.</p>
              </div>
            )}

            <button onClick={() => setStep(2)}
              className="w-full btn-primary justify-center py-4 rounded-2xl text-lg shadow-lg">
              <Upload size={22} /> Dekont Yükle
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
              <h3 className="font-bold text-slate-700">Dekont Yükle</h3>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ödenen Tutar (₺)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  required min="1" step="0.01"
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none text-lg font-mono"
                  placeholder="0.00" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Dekont Fotoğrafı</label>
                {dekontPreview ? (
                  <div className="relative">
                    <img src={dekontPreview} alt="Dekont" className="w-full max-h-64 object-contain rounded-2xl border-2 border-blue-200" />
                    <button type="button" onClick={() => setDekontPreview('')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600">✕</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                    <Upload size={28} className="text-slate-300 mb-2" />
                    <span className="text-sm text-slate-400">Fotoğraf seçin veya sürükleyin</span>
                    <span className="text-xs text-slate-300 mt-1">JPG, PNG, WEBP</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Not (isteğe bağlı)</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Ek bilgi girin..."
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-400 outline-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary justify-center py-3.5 rounded-2xl">Geri</button>
              <button type="submit" disabled={loading || !dekontPreview}
                className="flex-grow btn-primary justify-center py-3.5 rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Gönderiliyor...</>
                  : <><CheckCircle size={18} /> Gönder</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default AidatOde;
