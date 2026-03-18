import React, { useEffect, useState } from 'react';
import { Wallet, Bell, User, CreditCard, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAnnouncements, getComplaints, getAidatConfig, getPayments } from '../services/api';

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Sakin', block: 'A', no: '1' };

  const [announcements, setAnnouncements] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [aidatConfig, setAidatConfig] = useState(null);
  const [myPayment, setMyPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, c, cfg, p] = await Promise.all([
          getAnnouncements(), getComplaints(), getAidatConfig(), getPayments()
        ]);
        setAnnouncements(a.data);
        // Sadece kendi taleplerim
        setMyComplaints(c.data.filter(x => x.userId === currentUser.id));
        setAidatConfig(cfg.data);
        // Kendi ödeme durumum
        const mine = p.data.find(x => x.userId === currentUser.id);
        setMyPayment(mine || null);
      } catch (err) {
        // sessiz hata
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const monthlyAidat = aidatConfig?.amount || 0;
  const isPaid = myPayment?.isPaid || false;
  const pendingComplaints = myComplaints.filter(c => c.status !== 'resolved').length;

  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Hoş Geldin, {currentUser.name}</h1>
        <p className="text-slate-500">{currentUser.block ? currentUser.block + ' Blok / No: ' + currentUser.no : 'Sakin paneli'}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Aidat */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Wallet size={24} /></div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${isPaid ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                  {isPaid ? 'Ödendi' : 'Borçlu'}
                </span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Aylık Aidat</h3>
              <p className="text-2xl font-bold text-slate-800">{monthlyAidat > 0 ? `₺${monthlyAidat.toLocaleString('tr-TR')}` : '₺0'}</p>
              {!isPaid && monthlyAidat > 0 && (
                <button onClick={() => navigate('/resident/payments')}
                  className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition-all text-sm">
                  Hemen Öde
                </button>
              )}
            </div>

            {/* Son ödeme */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl w-fit mb-4"><CreditCard size={24} /></div>
              <h3 className="text-slate-500 text-sm font-medium">Son Ödeme Tarihi</h3>
              <p className="text-xl font-bold text-slate-800">
                {myPayment?.paidAt ? new Date(myPayment.paidAt).toLocaleDateString('tr-TR') : '-'}
              </p>
            </div>

            {/* Telefon */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4"><User size={24} /></div>
              <h3 className="text-slate-500 text-sm font-medium">Kayıtlı Telefon</h3>
              <p className="text-xl font-bold text-slate-800">{currentUser.phone || '-'}</p>
            </div>

            {/* Talepler */}
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

          {/* Duyurular */}
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
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(a.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{a.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResidentDashboard;
