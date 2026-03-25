import React, { useEffect, useState } from 'react';
import { Trash2, Megaphone, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getGarbage, getAnnouncements, getComplaints } from '../services/api';

const KapiciHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ cop: 0, duyuru: 0, talep: 0 });

  useEffect(() => {
    const today = new Date().toLocaleDateString('tr-TR');
    Promise.all([getGarbage(), getAnnouncements(), getComplaints()])
      .then(([g, a, c]) => {
        const cop = (g.data || []).filter(r => r.markedAt &&
          new Date(r.markedAt).toLocaleDateString('tr-TR') === today && !r.isCollected).length;
        const duyuru = (a.data || []).length;
        const talep = (c.data || []).filter(x => x.status !== 'resolved').length;
        setStats({ cop, duyuru, talep });
      })
      .catch(() => {});
  }, []);

  const cards = [
    { icon: <Trash2 size={28} />, label: 'Bekleyen Çöp', value: stats.cop, color: 'green', path: '/kapici/cop' },
    { icon: <Megaphone size={28} />, label: 'Duyurular', value: stats.duyuru, color: 'blue', path: '/kapici/announcements' },
    { icon: <AlertTriangle size={28} />, label: 'Açık Talepler', value: stats.talep, color: 'orange', path: '/kapici/complaints' },
  ];

  const colors = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Kapıcı Paneli</h1>
        <p className="text-slate-500 mb-4 md:mb-8">Hoş geldiniz. Günlük duruma genel bakış.</p>
        <div className="grid grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <button key={i} onClick={() => navigate(c.path)}
              className="stat-card group p-6 text-left w-full">
              <div className={`inline-flex p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-200 ${colors[c.color]}`}>{c.icon}</div>
              <p className="text-2xl md:text-3xl font-bold text-slate-800">{c.value}</p>
              <p className="text-sm text-slate-500 mt-1">{c.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default KapiciHome;
