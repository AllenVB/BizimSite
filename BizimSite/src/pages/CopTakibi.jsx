import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, Clock, Building2 } from 'lucide-react';

const CopTakibi = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const isKapici = currentUser.role === 'kapici';
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(u);
    const r = JSON.parse(localStorage.getItem('copTakibi')) || [];
    setRecords(r);
  }, []);

  const today = new Date().toLocaleDateString('tr-TR');

  const myRecord = records.find(r => r.userId === currentUser.id && r.date === today);

  const markCop = () => {
    const r = JSON.parse(localStorage.getItem('copTakibi')) || [];
    const exists = r.find(x => x.userId === currentUser.id && x.date === today);
    if (exists) return;
    const newRec = {
      id: Date.now(),
      userId: currentUser.id,
      name: currentUser.name,
      block: currentUser.block,
      no: currentUser.no,
      date: today,
      collected: false,
    };
    r.push(newRec);
    localStorage.setItem('copTakibi', JSON.stringify(r));
    setRecords(r);
  };

  const markCollected = (id) => {
    const r = JSON.parse(localStorage.getItem('copTakibi')) || [];
    const updated = r.map(x => x.id === id ? { ...x, collected: true } : x);
    localStorage.setItem('copTakibi', JSON.stringify(updated));
    setRecords(updated);
  };

  const unmark = (id) => {
    const r = JSON.parse(localStorage.getItem('copTakibi')) || [];
    const updated = r.filter(x => x.id !== id);
    localStorage.setItem('copTakibi', JSON.stringify(updated));
    setRecords(updated);
  };

  const todayRecords = records.filter(r => r.date === today);

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-2xl"><Trash2 size={28} className="text-green-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Çöp Takibi</h1>
            <p className="text-slate-500 text-sm">{today} — Günlük çöp durumu</p>
          </div>
        </div>

        {!isKapici && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            {myRecord ? (
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle size={24} />
                <div>
                  <p className="font-bold">Çöpünüz çıkarıldı olarak işaretlendi</p>
                  <p className="text-sm text-slate-400">{myRecord.collected ? 'Kapıcı tarafından toplandı ✓' : 'Kapıcı henüz toplamadı'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Çöpünüzü çıkardınız mı?</p>
                  <p className="text-sm text-slate-500">Bugün çöpünüzü çıkardıysanız işaretleyin</p>
                </div>
                <button onClick={markCop}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition">
                  <Trash2 size={16} /> Çöp Çıkardım
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Building2 size={18} className="text-blue-500" /> Bugünkü Durum
            </h2>
            <span className="text-sm text-slate-400">{todayRecords.length} daire çıkardı</span>
          </div>

          {todayRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Trash2 size={36} className="mx-auto mb-3 opacity-30" />
              <p>Bugün henüz kimse çöp çıkarmadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {todayRecords.map(r => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${r.collected ? 'bg-slate-400' : 'bg-green-500'}`}>
                    {r.block}{r.no}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{r.name}</p>
                    <p className="text-sm text-slate-400">{r.block} Blok, Daire {r.no}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.collected ? (
                      <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle size={12} /> Toplandı
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                        <Clock size={12} /> Bekliyor
                      </span>
                    )}
                    {isKapici && !r.collected && (
                      <button onClick={() => markCollected(r.id)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-xl font-medium transition">
                        Topladım
                      </button>
                    )}
                    {isKapici && r.collected && (
                      <button onClick={() => unmark(r.id)}
                        className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1.5 rounded-xl font-medium transition">
                        Geri Al
                      </button>
                    )}
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
export default CopTakibi;
