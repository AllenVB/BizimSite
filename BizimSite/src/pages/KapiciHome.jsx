import React, { useEffect, useState } from 'react';
import { Trash2, Megaphone, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const KapiciHome = () => {
  const [stats, setStats] = useState({ cop: 0, duyuru: 0, talep: 0 });

  useEffect(() => {
    const cop = (JSON.parse(localStorage.getItem('copTakibi')) || [])
      .filter(r => r.date === new Date().toLocaleDateString('tr-TR') && !r.collected).length;
    const duyuru = (JSON.parse(localStorage.getItem('announcements')) || []).length;
    const talep = (JSON.parse(localStorage.getItem('complaints')) || []).filter(c => c.status !== 'resolved').length;
    setStats({ cop, duyuru, talep });
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
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Kapıcı Paneli</h1>
        <p className="text-slate-500 mb-8">Hoş geldiniz. Günlük duruma genel bakış.</p>
        <div className="grid grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <a key={i} href={c.path}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition cursor-pointer">
              <div className={`inline-flex p-3 rounded-xl mb-4 ${colors[c.color]}`}>{c.icon}</div>
              <p className="text-3xl font-bold text-slate-800">{c.value}</p>
              <p className="text-sm text-slate-500 mt-1">{c.label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
export default KapiciHome;
