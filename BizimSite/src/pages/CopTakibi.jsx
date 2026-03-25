import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, Clock, Building2, Loader2, X } from 'lucide-react';
import { getGarbage, markGarbage, unmarkGarbage, collectGarbage } from '../services/api';

const CopTakibi = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const isKapici = currentUser.role === 'kapici';
  const isAdmin = currentUser.role === 'admin';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('tr-TR');

  useEffect(() => { loadGarbage(); }, []);

  const loadGarbage = async () => {
    setLoading(true);
    try {
      const res = await getGarbage();
      setRecords(res.data);
    } catch (e) {
      setError('Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const myRecord = records.find(r => r.userId === currentUser.id);

  const handleMark = async () => {
    try {
      await markGarbage();
      loadGarbage();
    } catch (e) {
      setError(e.response?.data?.message || 'İşlem başarısız!');
    }
  };

  const handleUnmark = async () => {
    try {
      await unmarkGarbage();
      loadGarbage();
    } catch (e) {
      setError(e.response?.data?.message || 'İşlem başarısız!');
    }
  };

  const handleCollect = async (id) => {
    try {
      await collectGarbage(id);
      loadGarbage();
    } catch (e) {
      setError(e.response?.data?.message || 'İşlem başarısız!');
    }
  };

  const todayRecords = records;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 md:mb-8 flex items-center gap-3">
          <div className="p-2 md:p-3 bg-green-100 rounded-xl md:rounded-2xl"><Trash2 size={28} className="text-green-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Çöp Takibi</h1>
            <p className="text-slate-500 text-sm">{today} — Günlük çöp durumu</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            {error} <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {!isKapici && !isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            {myRecord ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle size={24} />
                  <div>
                    <p className="font-bold">Çöpünüz çıkarıldı olarak işaretlendi</p>
                    <p className="text-sm text-slate-400">{myRecord.isCollected ? 'Kapıcı tarafından toplandı ✓' : 'Kapıcı henüz toplamadı'}</p>
                  </div>
                </div>
                <button onClick={handleUnmark}
                  className="text-xs px-4 py-2 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-xl font-semibold active:scale-95 transition-all duration-150">
                  Geri Al
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Çöpünüzü çıkardınız mı?</p>
                  <p className="text-sm text-slate-500">Bugün çöpünüzü çıkardıysanız işaretleyin</p>
                </div>
                <button onClick={handleMark}
                  className="btn-success">
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin text-green-500" />
            </div>
          ) : todayRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Trash2 size={36} className="mx-auto mb-3 opacity-30" />
              <p>Bugün henüz kimse çöp çıkarmadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {todayRecords.map(r => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${r.isCollected ? 'bg-slate-400' : 'bg-green-500'}`}>
                    {r.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{r.userName}</p>
                    <p className="text-sm text-slate-400">{r.block ? r.block + ' Blok, Daire ' + r.no : 'Daire bilgisi yok'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.isCollected ? (
                      <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle size={12} /> Toplandı
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                        <Clock size={12} /> Bekliyor
                      </span>
                    )}
                    {(isKapici || isAdmin) && !r.isCollected && (
                      <button onClick={() => handleCollect(r.id)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-3 py-1.5 rounded-xl font-medium transition-all duration-150">
                        Topladım
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
