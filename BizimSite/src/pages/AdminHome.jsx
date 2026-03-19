import { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, AlertCircle, CreditCard, Wallet, Bell, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { getUsers, getExpenses, getAnnouncements, getComplaints, getPayments } from '../services/api';

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [u, e, a, c, p] = await Promise.all([
          getUsers(), getExpenses(), getAnnouncements(), getComplaints(), getPayments()
        ]);
        setUsers(u.data);
        setExpenses(e.data);
        setAnnouncements(a.data);
        setComplaints(c.data);
        setPayments(p.data);
      } catch (err) {
        // sessiz hata — veri yüklenemedi
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalCollection = payments.filter(p => p.isPaid).reduce((s, p) => s + (p.amount || 0), 0);
  const totalDebt = payments.filter(p => !p.isPaid).reduce((s, p) => s + (p.amount || 0), 0);
  const netBalance = totalCollection - totalExpense;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const paidCount = payments.filter(p => p.isPaid).length;

  // Gider kategorileri
  const expByCategory = {};
  expenses.forEach(e => {
    const cat = e.category || 'Diğer';
    expByCategory[cat] = (expByCategory[cat] || 0) + (e.amount || 0);
  });

  return (
    <div className="ml-64 p-8 min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Yönetim Paneli</h1>
        <p className="text-slate-400 mt-1">Genel bakış ve istatistikler</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={36} className="animate-spin text-white/60" />
        </div>
      ) : (
        <>
          {/* Üst Kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="stat-card group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform duration-200"><Wallet size={20} className="text-blue-600" /></div>
                <ArrowUpRight size={16} className="text-green-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Toplam Tahsilat</p>
              <h3 className="text-xl font-bold text-gray-800">₺{totalCollection.toLocaleString('tr-TR')}</h3>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-50 rounded-lg group-hover:scale-110 transition-transform duration-200"><TrendingUp size={20} className="text-green-600" /></div>
                <ArrowUpRight size={16} className="text-green-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Ödeme Yapan</p>
              <h3 className="text-xl font-bold text-gray-800">{paidCount} / {payments.length}</h3>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-red-50 rounded-lg group-hover:scale-110 transition-transform duration-200"><AlertCircle size={20} className="text-red-600" /></div>
                <ArrowDownRight size={16} className="text-red-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Toplam Borç</p>
              <h3 className="text-xl font-bold text-gray-800">₺{totalDebt.toLocaleString('tr-TR')}</h3>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-50 rounded-lg group-hover:scale-110 transition-transform duration-200"><TrendingDown size={20} className="text-orange-600" /></div>
                <ArrowDownRight size={16} className="text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Toplam Gider</p>
              <h3 className="text-xl font-bold text-gray-800">₺{totalExpense.toLocaleString('tr-TR')}</h3>
            </div>

            <div className={`p-5 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${netBalance >= 0 ? 'bg-emerald-600 border-emerald-700' : 'bg-red-600 border-red-700'}`}>
              <p className="text-xs text-white/80 font-medium mb-1">NET BAKİYE</p>
              <h3 className="text-2xl font-bold text-white">₺{netBalance.toLocaleString('tr-TR')}</h3>
              <p className="text-xs text-white/60 mt-1">Tahsilat — Gider</p>
            </div>
          </div>

          {/* Orta Bölüm */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Gider Dağılımı */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Gider Dağılımı</h2>
              {Object.keys(expByCategory).length === 0 ? (
                <p className="text-gray-400 text-sm italic">Henüz gider kaydı yok</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(expByCategory).map(([cat, val], i) => {
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-rose-500'];
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{cat}</span>
                          <span className="font-semibold text-gray-800">₺{val.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full ${colors[i % colors.length]} transition-all duration-500`}
                            style={{ width: totalExpense > 0 ? `${(val / totalExpense) * 100}%` : '0%' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                  <span className="text-lg font-bold text-green-600">{paidCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg"><AlertCircle size={18} className="text-red-600" /></div>
                    <span className="text-sm text-gray-600">Ödeme Yapmayan</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{payments.length - paidCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg"><AlertCircle size={18} className="text-yellow-600" /></div>
                    <span className="text-sm text-gray-600">Bekleyen Talep</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">{pendingComplaints}</span>
                </div>
              </div>
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
                        <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('tr-TR')}</span>
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
                      <p className="text-xs text-gray-500">{c.isAnonymous ? 'Anonim' : c.userName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHome;
