import React, { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle, Calendar, CreditCard } from 'lucide-react';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    const allPayments = JSON.parse(localStorage.getItem('paymentHistory')) || [];
    const userPayments = allPayments.filter(p => p.userId === currentUser.id);
    setPayments(userPayments);
  }, [currentUser.id]);

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="ml-64 p-8 min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <History className="text-green-400" /> Ödeme Geçmişi
        </h1>
        <p className="text-slate-400 mt-1">Tüm ödeme hareketlerinizi görüntüleyin</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-50 rounded-xl"><CreditCard className="text-green-600" size={24} /></div>
          </div>
          <p className="text-sm text-slate-500">Toplam Ödenen</p>
          <p className="text-2xl font-bold text-slate-800">₺{totalPaid.toLocaleString('tr-TR')}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-50 rounded-xl"><CheckCircle className="text-blue-600" size={24} /></div>
          </div>
          <p className="text-sm text-slate-500">Ödeme Sayısı</p>
          <p className="text-2xl font-bold text-slate-800">{payments.filter(p => p.status === 'paid').length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-50 rounded-xl"><Calendar className="text-purple-600" size={24} /></div>
          </div>
          <p className="text-sm text-slate-500">Son Ödeme</p>
          <p className="text-2xl font-bold text-slate-800">
            {payments.length > 0 ? payments[0].date : '-'}
          </p>
        </div>
      </div>

      {/* Ödeme Tablosu */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Ödeme Hareketleri</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <History size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Henüz ödeme kaydı yok</p>
            <p className="text-slate-300 text-sm mt-1">Aidat ödemenizi yaptıktan sonra burada görünecektir</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Açıklama</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tutar</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">{payment.description}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">₺{payment.amount.toLocaleString('tr-TR')}</td>
                    <td className="px-6 py-4">
                      {payment.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                          <CheckCircle size={12} /> Ödendi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                          <XCircle size={12} /> Ödenmedi
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
