import { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, AlertCircle, CreditCard, Wallet, Bell, ArrowUpRight, ArrowDownRight, Loader2, X } from 'lucide-react';
import { getUsers, getExpenses, getAnnouncements, getComplaints, getPayments, getAidatConfig } from '../services/api';
import AnnouncementBell from '../components/AnnouncementBell';

const StatModal = ({ modal, onClose }) => {
  if (!modal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">{modal.title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
          {modal.items.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">Veri yok</div>
          ) : modal.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${item.color || 'bg-blue-500'}`}>
                  {item.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-slate-400">{item.subtitle}</p>}
                </div>
              </div>
              {item.badge && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.badgeClass}`}>{item.badge}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [aidatConfig, setAidatConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [u, e, a, c, p, cfg] = await Promise.all([
          getUsers(), getExpenses(), getAnnouncements(), getComplaints(), getPayments(), getAidatConfig()
        ]);
        setUsers(u.data);
        setExpenses(e.data);
        setAnnouncements(a.data);
        setComplaints(c.data);
        setPayments(p.data);
        setAidatConfig(cfg.data);
      } catch (err) {
        // sessiz hata — veri yüklenemedi
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  // Payment kayıtları sadece ödeme yapıldığında oluşur → hepsi "ödendi"
  const totalCollection = payments.reduce((s, p) => s + (p.amount || 0), 0);
  // Borç = ödeme yapmayan sakin sayısı × aidat tutarı
  const residents = users.filter(u => u.role === 'resident');
  const unpaidCount = residents.filter(u => !u.paid).length;
  const paidCount = residents.filter(u => u.paid).length;
  const totalDebt = unpaidCount * (aidatConfig?.amount || 0);
  const netBalance = totalCollection - totalExpense;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;

  // Gider kategorileri
  const expByCategory = {};
  expenses.forEach(e => {
    const cat = e.category || 'Diğer';
    expByCategory[cat] = (expByCategory[cat] || 0) + (e.amount || 0);
  });

  return (
    <div className="p-4 md:p-8 min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>

      {/* Animasyonlu arka plan */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full anim-float-1"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.20) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[-10%] left-[5%] w-[450px] h-[450px] rounded-full anim-float-2"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full anim-float-3"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative z-10">
      <div className="mb-4 md:mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Yönetim Paneli</h1>
          <AnnouncementBell basePath="/admin" dark={true} />
        </div>
        <p className="text-slate-400 mt-1">Genel bakış ve istatistikler</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={36} className="animate-spin text-white/60" />
        </div>
      ) : (
        <>
          {/* Üst Kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 md:mb-8">
            <div className="stat-card group cursor-pointer" onClick={() => setModal({
              title: 'Tahsilat Detayı',
              items: payments.map(p => ({
                avatar: (p.userName || p.userEmail || '?').charAt(0).toUpperCase(),
                color: 'bg-blue-500',
                title: p.userName || p.userEmail || 'Bilinmiyor',
                subtitle: new Date(p.paidAt || p.createdAt).toLocaleDateString('tr-TR'),
                badge: `₺${(p.amount || 0).toLocaleString('tr-TR')}`,
                badgeClass: 'bg-blue-100 text-blue-700'
              }))
            })}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform duration-200"><Wallet size={20} className="text-blue-600" /></div>
                <ArrowUpRight size={16} className="text-green-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Toplam Tahsilat</p>
              <h3 className="text-xl font-bold text-gray-800">₺{totalCollection.toLocaleString('tr-TR')}</h3>
            </div>

            <div className="stat-card group cursor-pointer" onClick={() => setModal({
              title: `Ödeme Yapanlar (${paidCount})`,
              items: residents.filter(u => u.paid).map(u => ({
                avatar: (u.name || u.email || '?').charAt(0).toUpperCase(),
                color: 'bg-green-500',
                title: u.name || u.email,
                subtitle: `${u.block ? u.block + ' Blok' : ''} ${u.no ? 'Daire ' + u.no : ''}`.trim() || 'Daire bilgisi yok',
                badge: 'Ödedi',
                badgeClass: 'bg-green-100 text-green-700'
              }))
            })}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-50 rounded-lg group-hover:scale-110 transition-transform duration-200"><TrendingUp size={20} className="text-green-600" /></div>
                <ArrowUpRight size={16} className="text-green-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Ödeme Yapan</p>
              <h3 className="text-xl font-bold text-gray-800">{paidCount} / {residents.length}</h3>
            </div>

            <div className="stat-card group cursor-pointer" onClick={() => setModal({
              title: `Borçlu Daireler (${unpaidCount})`,
              items: residents.filter(u => !u.paid).map(u => ({
                avatar: (u.name || u.email || '?').charAt(0).toUpperCase(),
                color: 'bg-red-500',
                title: u.name || u.email,
                subtitle: `${u.block ? u.block + ' Blok' : ''} ${u.no ? 'Daire ' + u.no : ''}`.trim() || 'Daire bilgisi yok',
                badge: `₺${(aidatConfig?.amount || 0).toLocaleString('tr-TR')}`,
                badgeClass: 'bg-red-100 text-red-700'
              }))
            })}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-red-50 rounded-lg group-hover:scale-110 transition-transform duration-200"><AlertCircle size={20} className="text-red-600" /></div>
                <ArrowDownRight size={16} className="text-red-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Toplam Borç</p>
              <h3 className="text-xl font-bold text-gray-800">₺{totalDebt.toLocaleString('tr-TR')}</h3>
            </div>

            <div className="stat-card group cursor-pointer" onClick={() => setModal({
              title: 'Gider Kalemleri',
              items: expenses.map(e => ({
                avatar: (e.category || 'D').charAt(0).toUpperCase(),
                color: 'bg-orange-500',
                title: e.description || e.category || 'Gider',
                subtitle: e.category,
                badge: `₺${(e.amount || 0).toLocaleString('tr-TR')}`,
                badgeClass: 'bg-orange-100 text-orange-700'
              }))
            })}>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4 md:mb-8">
            {/* Gider Dağılımı */}
            <div className="lg:col-span-2 card p-6">
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
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Sakin İstatistikleri</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => setModal({
                  title: `Tüm Sakinler (${residents.length})`,
                  items: residents.map(u => ({
                    avatar: (u.name || u.email || '?').charAt(0).toUpperCase(),
                    color: 'bg-blue-500',
                    title: u.name || u.email,
                    subtitle: `${u.block ? u.block + ' Blok' : ''} ${u.no ? 'Daire ' + u.no : ''}`.trim() || 'Daire bilgisi yok'
                  }))
                })}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg"><Users size={18} className="text-blue-600" /></div>
                    <span className="text-sm text-gray-600">Toplam Sakin</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">{residents.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-green-50 transition-colors" onClick={() => setModal({
                  title: `Ödeme Yapanlar (${paidCount})`,
                  items: residents.filter(u => u.paid).map(u => ({
                    avatar: (u.name || u.email || '?').charAt(0).toUpperCase(),
                    color: 'bg-green-500',
                    title: u.name || u.email,
                    subtitle: `${u.block ? u.block + ' Blok' : ''} ${u.no ? 'Daire ' + u.no : ''}`.trim() || 'Daire bilgisi yok',
                    badge: 'Ödedi',
                    badgeClass: 'bg-green-100 text-green-700'
                  }))
                })}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg"><CreditCard size={18} className="text-green-600" /></div>
                    <span className="text-sm text-gray-600">Ödeme Yapan</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{paidCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-red-50 transition-colors" onClick={() => setModal({
                  title: `Ödeme Yapmayanlar (${unpaidCount})`,
                  items: residents.filter(u => !u.paid).map(u => ({
                    avatar: (u.name || u.email || '?').charAt(0).toUpperCase(),
                    color: 'bg-red-500',
                    title: u.name || u.email,
                    subtitle: `${u.block ? u.block + ' Blok' : ''} ${u.no ? 'Daire ' + u.no : ''}`.trim() || 'Daire bilgisi yok',
                    badge: 'Borçlu',
                    badgeClass: 'bg-red-100 text-red-700'
                  }))
                })}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg"><AlertCircle size={18} className="text-red-600" /></div>
                    <span className="text-sm text-gray-600">Ödeme Yapmayan</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{unpaidCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors" onClick={() => setModal({
                  title: `Bekleyen Talepler (${pendingComplaints})`,
                  items: complaints.filter(c => c.status === 'pending').map(c => ({
                    avatar: (c.userName || c.title || '?').charAt(0).toUpperCase(),
                    color: 'bg-yellow-500',
                    title: c.title,
                    subtitle: c.isAnonymous ? 'Anonim' : c.userName,
                    badge: 'Bekliyor',
                    badgeClass: 'bg-yellow-100 text-yellow-700'
                  }))
                })}>
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
            <div className="card p-6">
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
            <div className="card p-6">
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
      <StatModal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
};

export default AdminHome;
