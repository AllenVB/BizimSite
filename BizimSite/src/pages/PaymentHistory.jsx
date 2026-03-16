import React, { useState, useEffect } from 'react';
import { History, CheckCircle, Calendar, CreditCard, Search, TrendingUp, ArrowDownLeft } from 'lucide-react';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('paymentHistory')) || [];
    if (isAdmin) {
      setPayments(all);
    } else {
      // userId veya email ile eşleştir
      const mine = all.filter(p =>
        p.userId === currentUser.id ||
        p.userEmail === currentUser.email ||
        p.userName === currentUser.name
      );
      setPayments(mine);
    }
  }, [currentUser.id]);

  const filtered = payments.filter(p =>
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.date?.includes(search) ||
    (isAdmin && p.userName?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const paidCount = payments.filter(p => p.status === 'paid').length;

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <History className="text-blue-500" /> {isAdmin ? 'Tüm Aidat Ödemeleri' : 'Ödeme Geçmişim'}
          </h1>
          <p className="text-slate-500 mt-1">Tüm aidat ödemelerinin kaydı</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-50 rounded-xl"><TrendingUp size={20} className="text-blue-500" /></div>
              <span className="text-sm text-slate-500">Toplam Tahsilat</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">₺{totalPaid.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-green-50 rounded-xl"><CheckCircle size={20} className="text-green-500" /></div>
              <span className="text-sm text-slate-500">Ödeme Sayısı</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{paidCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-purple-50 rounded-xl"><Calendar size={20} className="text-purple-500" /></div>
              <span className="text-sm text-slate-500">Son Ödeme</span>
            </div>
            <p className="text-lg font-bold text-slate-800 truncate">{payments[0]?.date || '-'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">İşlem Geçmişi</h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isAdmin ? 'İsim veya tarih ara...' : 'Ara...'}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition w-52"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <ArrowDownLeft size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">Ödeme kaydı bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition">
                  <div className="p-3 bg-green-50 rounded-xl flex-shrink-0">
                    <CreditCard size={18} className="text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{p.description}</p>
                    {isAdmin && p.userName && (
                      <p className="text-xs text-blue-600 font-medium">{p.userName} — {p.block || '-'} Blok No: {p.no || '-'}</p>
                    )}
                    <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={12} /> {p.date}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-800">₺{p.amount?.toLocaleString('tr-TR')}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Ödendi</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
