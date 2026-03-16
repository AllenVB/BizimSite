import React, { useEffect, useState } from 'react';
import { Wallet, Bell, User, CreditCard, AlertTriangle, Calendar, BellRing, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Sakin', block: 'A', no: '1' };

  const [announcements, setAnnouncements] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setAnnouncements(JSON.parse(localStorage.getItem('announcements')) || []);
    const allComplaints = JSON.parse(localStorage.getItem('complaints')) || [];
    setMyComplaints(allComplaints.filter(c => c.author === currentUser.name || c.realAuthor === currentUser.name));
    const allNotifs = JSON.parse(localStorage.getItem('notifications')) || [];
    const mine = allNotifs.filter(n => n.userId === currentUser.id || n.userEmail === currentUser.email);
    setNotifications(mine);
  }, [currentUser.id]);

  const dismissNotif = (id) => {
    const all = JSON.parse(localStorage.getItem('notifications')) || [];
    const updated = all.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const expenses = JSON.parse(localStorage.getItem('expenses')) || { elevator: 0, doorman: 0, electricity: 0, general: 0 };
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const generalItems = JSON.parse(localStorage.getItem('generalExpenseItems')) || [];
  const genTotal = generalItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const totalExpense = Object.values({ ...expenses, general: genTotal }).reduce((a, b) => a + b, 0);
  const monthlyAidat = Math.round(totalExpense / (users.length || 1));

  // kullanıcının güncel paid durumunu users listesinden al
  const liveUser = users.find(u => u.id === currentUser.id || u.email === currentUser.email);
  const isPaid = liveUser?.paid || currentUser.paid;

  const pendingComplaints = myComplaints.filter(c => c.status !== 'resolved').length;
  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen">
      {/* Bildirimler */}
      {unreadNotifs.length > 0 && (
        <div className="mb-6 space-y-3">
          {unreadNotifs.map(n => (
            <div key={n.id} className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
              <div className="p-2 bg-blue-100 rounded-xl flex-shrink-0">
                <BellRing size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">{n.type === 'aidat' ? '💳 Aidat Bildirimi' : '📢 Bildirim'}</p>
                <p className="text-sm text-blue-700 mt-0.5">{n.message}</p>
                <p className="text-xs text-blue-400 mt-1">{n.date}</p>
              </div>
              <button onClick={() => dismissNotif(n.id)} className="text-blue-400 hover:text-blue-600 transition flex-shrink-0">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Hoş Geldin, {currentUser.name}</h1>
        <p className="text-slate-500">{currentUser.block} Blok / No: {currentUser.no} sakin paneli</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Wallet size={24} /></div>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${isPaid ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
              {isPaid ? 'Ödendi' : 'Borçlu'}
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Aylık Aidat</h3>
          <p className="text-2xl font-bold text-slate-800">{monthlyAidat > 0 ? `₺${monthlyAidat.toLocaleString('tr-TR')}` : '₺0'}</p>
          {!isPaid && (
            <button onClick={() => navigate('/resident/payments')}
              className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition-all text-sm">
              Hemen Öde
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl w-fit mb-4"><CreditCard size={24} /></div>
          <h3 className="text-slate-500 text-sm font-medium">Son Ödeme Tarihi</h3>
          <p className="text-xl font-bold text-slate-800">{liveUser?.lastPayment || currentUser.lastPayment || '-'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4"><User size={24} /></div>
          <h3 className="text-slate-500 text-sm font-medium">Kayıtlı Telefon</h3>
          <p className="text-xl font-bold text-slate-800">{currentUser.phone || '-'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><AlertTriangle size={24} /></div>
            {pendingComplaints > 0 && (
              <span className="text-xs font-bold px-2 py-1 rounded-md bg-yellow-50 text-yellow-600">{pendingComplaints} aktif</span>
            )}
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Taleplerim</h3>
          <p className="text-2xl font-bold text-slate-800">{myComplaints.length}</p>
          <button onClick={() => navigate('/resident/complaints')}
            className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-all text-sm">
            Talep Oluştur
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bell size={20} className="text-blue-600" /> Site Duyuruları
          </h2>
          <button onClick={() => navigate('/resident/announcements')} className="text-sm text-blue-600 font-semibold hover:underline">
            Tümünü Gör
          </button>
        </div>
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <p className="text-slate-400 text-sm italic">Henüz duyuru yok</p>
          ) : (
            announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-700">{a.title}</h4>
                    {a.priority === 'urgent' && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Acil</span>}
                    {a.priority === 'important' && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Önemli</span>}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={12} /> {a.date}</span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{a.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
