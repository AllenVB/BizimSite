import React, { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle, Calendar, CreditCard, Search, TrendingUp, Clock, X, ImageIcon } from 'lucide-react';
import { getPayments } from '../services/api';

const StatusBadge = ({ status }) => {
  if (status === 'confirmed') return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
      <CheckCircle size={11} /> Onaylandı
    </span>
  );
  if (status === 'rejected') return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
      <XCircle size={11} /> Reddedildi
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
      <Clock size={11} /> Bekliyor
    </span>
  );
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dekontModal, setDekontModal] = useState(null);

  useEffect(() => {
    getPayments().then(r => setPayments(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p =>
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    new Date(p.paidAt).toLocaleDateString('tr-TR').includes(search)
  );

  const confirmed = payments.filter(p => p.status === 'confirmed');
  const pending = payments.filter(p => p.status === 'pending');
  const totalPaid = confirmed.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <History className="text-blue-500" /> Ödeme Geçmişi
          </h1>
          <p className="text-slate-500 mt-1">Tüm aidat ödemeleriniz</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-blue-50 rounded-xl"><TrendingUp size={18} className="text-blue-500" /></div>
              <span className="text-xs md:text-sm text-slate-500">Onaylı Toplam</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-slate-800">₺{totalPaid.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-green-50 rounded-xl"><CheckCircle size={18} className="text-green-500" /></div>
              <span className="text-xs md:text-sm text-slate-500">Onaylı</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-slate-800">{confirmed.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-amber-50 rounded-xl"><Clock size={18} className="text-amber-500" /></div>
              <span className="text-xs md:text-sm text-slate-500">Bekleyen</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-slate-800">{pending.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-800 text-sm md:text-base">İşlem Geçmişi</h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..."
                className="pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 w-36 md:w-52" />
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <History size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">Ödeme kaydı bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-blue-50/30 transition-colors">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${p.status === 'confirmed' ? 'bg-green-50' : p.status === 'rejected' ? 'bg-red-50' : 'bg-amber-50'}`}>
                    <CreditCard size={16} className={p.status === 'confirmed' ? 'text-green-500' : p.status === 'rejected' ? 'text-red-500' : 'text-amber-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{p.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={11} /> {new Date(p.paidAt).toLocaleDateString('tr-TR')}
                    </p>
                    {p.dekontNote && <p className="text-xs text-slate-500 mt-0.5 truncate">Not: {p.dekontNote}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <p className="font-bold text-slate-800 text-sm">₺{p.amount?.toLocaleString('tr-TR')}</p>
                    <StatusBadge status={p.status} />
                    {p.dekontUrl && (
                      <button onClick={() => setDekontModal(p.dekontUrl)}
                        className="text-xs text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5">
                        <ImageIcon size={11} /> Dekont
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dekont Modal */}
      {dekontModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setDekontModal(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDekontModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 flex items-center gap-1 text-sm">
              <X size={20} /> Kapat
            </button>
            <img src={dekontModal} alt="Dekont" className="w-full rounded-2xl shadow-2xl max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
export default PaymentHistory;
