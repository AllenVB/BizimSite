import { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, AlertCircle, Building2, Home, CreditCard, Wallet, Bell, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState({ elevator: 0, doorman: 0, electricity: 0, general: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem('users')) || []);
    setExpenses(JSON.parse(localStorage.getItem('expenses')) || { elevator: 0, doorman: 0, electricity: 0, general: 0 });
    setAnnouncements(JSON.parse(localStorage.getItem('announcements')) || []);
    setComplaints(JSON.parse(localStorage.getItem('complaints')) || []);
    setPayments(JSON.parse(localStorage.getItem('paymentHistory')) || []);
  }, []);

  const totalExpense = Object.values(expenses).reduce((a, b) => a + b, 0);
  const monthlyAidat = Math.round(totalExpense / (users.length || 1));
  const totalAidat = monthlyAidat * users.length;
  const paidUsers = users.filter(u => u.paid);
  const totalCollection = paidUsers.length * monthlyAidat;
  const debtUsers = users.filter(u => !u.paid);
  const totalDebt = debtUsers.length * monthlyAidat;
  const netBalance = totalCollection - totalExpense;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;

  // Block statistics
  const blocks = {};
  users.forEach(u => {
    if (u.block) {
      blocks[u.block] = (blocks[u.block] || 0) + 1;
    }
  });

  return (
    <div className="ml-64 p-8 min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Yönetim Paneli</h1>
        <p className="text-slate-400 mt-1">Genel bakış ve istatistikler</p>
      </div>

      {/* Üst Kartlar - Referans görseldeki gibi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Wallet size={20} className="text-blue-600" /></div>
            <ArrowUpRight size={16} className="text-green-500" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Aidat (Ay)</p>
          <h3 className="text-xl font-bold text-gray-800">₺{totalAidat.toLocaleString('tr-TR')}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-lg"><TrendingUp size={20} className="text-green-600" /></div>
            <ArrowUpRight size={16} className="text-green-500" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Tahsilat (Ay)</p>
          <h3 className="text-xl font-bold text-gray-800">₺{totalCollection.toLocaleString('tr-TR')}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-50 rounded-lg"><AlertCircle size={20} className="text-red-600" /></div>
            <ArrowDownRight size={16} className="text-red-500" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Borç (Toplam)</p>
          <h3 className="text-xl font-bold text-gray-800">₺{totalDebt.toLocaleString('tr-TR')}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 rounded-lg"><TrendingDown size={20} className="text-orange-600" /></div>
            <ArrowDownRight size={16} className="text-orange-500" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Gider (Ay)</p>
          <h3 className="text-xl font-bold text-gray-800">₺{totalExpense.toLocaleString('tr-TR')}</h3>
        </div>

        <div className={`p-5 rounded-xl shadow-sm border ${netBalance >= 0 ? 'bg-emerald-600 border-emerald-700' : 'bg-red-600 border-red-700'}`}>
          <p className="text-xs text-white/80 font-medium mb-1">NET DURUM (BAKİYE)</p>
          <h3 className="text-2xl font-bold text-white">₺{netBalance.toLocaleString('tr-TR')}</h3>
          <p className="text-xs text-white/60 mt-1">Tüm alacaklar ve borçlar dahil</p>
        </div>
      </div>

      {/* Orta Bölüm */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gider Dağılımı */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Gider Dağılımı</h2>
          <div className="space-y-4">
            {[
              { label: 'Asansör Gideri', value: expenses.elevator, color: 'bg-blue-500' },
              { label: 'Kapıcı Gideri', value: expenses.doorman, color: 'bg-green-500' },
              { label: 'Elektrik Faturası', value: expenses.electricity, color: 'bg-yellow-500' },
              { label: 'Genel Giderler', value: expenses.general, color: 'bg-purple-500' }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-800">₺{item.value.toLocaleString('tr-TR')}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: totalExpense > 0 ? `${(item.value / totalExpense) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sakin İstatistikleri */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Sakin İstatistikleri</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Users size={18} className="text-blue-600" /></div>
                <span className="text-sm text-gray-600">Toplam Sakin</span>
              </div>
              <span className="text-lg font-bold text-gray-800">{users.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><CreditCard size={18} className="text-green-600" /></div>
                <span className="text-sm text-gray-600">Ödeme Yapan</span>
              </div>
              <span className="text-lg font-bold text-green-600">{paidUsers.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg"><AlertCircle size={18} className="text-red-600" /></div>
                <span className="text-sm text-gray-600">Borçlu Sakin</span>
              </div>
              <span className="text-lg font-bold text-red-600">{debtUsers.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg"><AlertCircle size={18} className="text-yellow-600" /></div>
                <span className="text-sm text-gray-600">Bekleyen Talep</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{pendingComplaints}</span>
            </div>
          </div>

          {/* Blok Dağılımı */}
          {Object.keys(blocks).length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Blok Dağılımı</h3>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(blocks).map(([block, count]) => (
                  <div key={block} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold">
                    {block} Blok: {count} sakin
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alt Bölüm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son Duyurular */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Bell size={18} className="text-blue-600" /> Son Duyurular
            </h2>
            <span className="text-xs text-blue-600 font-semibold">{announcements.length} duyuru</span>
          </div>
          {announcements.length === 0 ? (
            <p className="text-gray-400 text-sm italic">Henüz duyuru yok</p>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-all">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-semibold text-gray-700 text-sm">{a.title}</h4>
                    <span className="text-xs text-gray-400">{a.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Son Talepler */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle size={18} className="text-yellow-600" /> Son Talepler
            </h2>
            <span className="text-xs text-yellow-600 font-semibold">{pendingComplaints} bekliyor</span>
          </div>
          {complaints.length === 0 ? (
            <p className="text-gray-400 text-sm italic">Henüz talep yok</p>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 3).map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-yellow-200 transition-all">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-semibold text-gray-700 text-sm">{c.title}</h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      c.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {c.status === 'pending' ? 'Bekliyor' : c.status === 'in_progress' ? 'İşleniyor' : 'Çözüldü'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{c.author} - {c.block} Blok</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
