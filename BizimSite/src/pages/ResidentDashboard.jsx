import React from 'react';
import { Wallet, Bell, User, CreditCard } from 'lucide-react';

const ResidentDashboard = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
    name: "Sakin",
    block: "A",
    no: "1",
    totalDebt: 0,
    lastPayment: "-"
  };

  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Hoş Geldin, {currentUser.name} 👋</h1>
        <p className="text-slate-500">{currentUser.block} Blok / No: {currentUser.no} sakin paneli</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Borç Kartı */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Wallet size={24} /></div>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${currentUser.totalDebt > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>{currentUser.totalDebt > 0 ? "Borçlu" : "Borcu Yok"}</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Toplam Aidat Borcu</h3>
          <p className="text-2xl font-bold text-slate-800">₺{currentUser.totalDebt || 0}</p>
          <button className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition-all">
            Hemen Öde
          </button>
        </div>

        {/* Son Ödeme */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl w-fit mb-4"><CreditCard size={24} /></div>
          <h3 className="text-slate-500 text-sm font-medium">Son Ödeme Tarihi</h3>
          <p className="text-2xl font-bold text-slate-800">{currentUser.lastPayment}</p>
        </div>

        {/* Profil Özeti */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4"><User size={24} /></div>
          <h3 className="text-slate-500 text-sm font-medium">Kayıtlı Telefon</h3>
          <p className="text-xl font-bold text-slate-800">{currentUser.phone || "-"}</p>
        </div>
      </div>

      {/* Duyurular */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" /> Site Duyuruları
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
            <div className="flex justify-between mb-1">
              <h4 className="font-semibold text-slate-700">Asansör Bakımı</h4>
              <span className="text-xs text-slate-400">15 Mart</span>
            </div>
            <p className="text-sm text-slate-500">A blok asansörü 10:00-12:00 arası bakımdadır.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
            <div className="flex justify-between mb-1">
              <h4 className="font-semibold text-slate-700">Su Kesintisi</h4>
              <span className="text-xs text-slate-400">14 Mart</span>
            </div>
            <p className="text-sm text-slate-500">Belediye kaynaklı 4 saatlik kesinti bekleniyor.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;