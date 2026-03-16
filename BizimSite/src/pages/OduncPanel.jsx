import React, { useState, useEffect } from 'react';
import { Package, Plus, X, CheckCircle, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';

const TEMPLATE_RESPONSES = [
  { id: 'yes', label: '✅ Elimde var, verebilirim', color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' },
  { id: 'no', label: '❌ Üzgünüm, şu an müsait değil', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
  { id: 'later', label: '⏳ Biraz sonra müsait olur', color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
  { id: 'contact', label: '📞 Benimle iletişime geç', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
  { id: 'used', label: '🔧 Şu an ben kullanıyorum', color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' },
  { id: 'broken', label: '⚠️ Maalesef bozuk', color: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' },
];

const OduncPanel = () => {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ item: '', description: '', duration: '1 gün' });
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    setRequests(JSON.parse(localStorage.getItem('oduncRequests')) || []);
  }, []);

  const save = (data) => {
    localStorage.setItem('oduncRequests', JSON.stringify(data));
    setRequests(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const req = {
      id: Date.now(),
      item: form.item,
      description: form.description,
      duration: form.duration,
      author: currentUser.name || 'Sakin',
      block: currentUser.block || '-',
      no: currentUser.no || '-',
      userId: currentUser.id,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
      status: 'open',
      responses: []
    };
    save([req, ...requests]);
    setForm({ item: '', description: '', duration: '1 gün' });
    setShowForm(false);
  };

  const handleResponse = (reqId, template) => {
    const alreadyAnswered = requests.find(r => r.id === reqId)?.responses?.find(
      res => res.userId === currentUser.id
    );
    if (alreadyAnswered) return;

    const updated = requests.map(r => {
      if (r.id !== reqId) return r;
      return {
        ...r,
        responses: [...(r.responses || []), {
          id: Date.now(),
          userId: currentUser.id,
          author: currentUser.name || 'Sakin',
          block: currentUser.block || '-',
          no: currentUser.no || '-',
          templateId: template.id,
          label: template.label,
          date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
        }]
      };
    });
    save(updated);
  };

  const removeResponse = (reqId, resId) => {
    const updated = requests.map(r => {
      if (r.id !== reqId) return r;
      return { ...r, responses: r.responses.filter(res => res.id !== resId) };
    });
    save(updated);
  };

  const closeRequest = (reqId) => {
    const updated = requests.map(r => r.id === reqId ? { ...r, status: 'closed' } : r);
    save(updated);
  };

  const deleteRequest = (reqId) => {
    save(requests.filter(r => r.id !== reqId));
  };

  const isAdmin = currentUser.role === 'admin' || currentUser.isMainAdmin;
  const openCount = requests.filter(r => r.status === 'open').length;

  return (
    <div className="ml-64 min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Package className="text-amber-500" /> Ödünç Paneli
            </h1>
            <p className="text-slate-500 mt-1">Komşulardan ödünç alın veya verin · {openCount} açık istek</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-semibold transition shadow-lg">
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'İptal' : 'İstek Oluştur'}
          </button>
        </div>

        {/* Yeni istek formu */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 mb-6">
            <h2 className="font-bold text-slate-800 mb-4">Yeni Ödünç İsteği</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Malzeme / Alet Adı</label>
                <input type="text" required value={form.item} placeholder="örn. Matkap, Merdiven, Tencere..."
                  onChange={e => setForm({ ...form, item: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Açıklama (isteğe bağlı)</label>
                <textarea value={form.description} rows={2} placeholder="Nasıl kullanacağınızı kısaca belirtin..."
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ne Kadar Süre?</label>
                <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400">
                  <option>1 gün</option>
                  <option>2-3 gün</option>
                  <option>1 hafta</option>
                  <option>Birkaç saat</option>
                  <option>Belirsiz</option>
                </select>
              </div>
              <button type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition">
                İsteği Yayınla
              </button>
            </div>
          </form>
        )}

        {/* İstek listesi */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-100">
            <Package size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">Henüz ödünç isteği yok</p>
            <p className="text-slate-400 text-sm mt-1">İlk isteği sen oluştur!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const myResponse = req.responses?.find(r => r.userId === currentUser.id);
              const isOwner = req.userId === currentUser.id;
              const isExpanded = expandedId === req.id;
              const yesCount = req.responses?.filter(r => r.templateId === 'yes').length || 0;

              return (
                <div key={req.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${req.status === 'closed' ? 'opacity-60 border-slate-100' : 'border-amber-100'}`}>
                  {/* Kart başlığı */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-lg font-bold text-slate-800">🔧 {req.item}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${req.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {req.status === 'open' ? 'Açık' : 'Kapatıldı'}
                          </span>
                          {yesCount > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              {yesCount} kişi verebilir
                            </span>
                          )}
                        </div>
                        {req.description && <p className="text-slate-600 text-sm mb-2">{req.description}</p>}
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><User size={11} /> {req.author} — {req.block} Blok No:{req.no}</span>
                          <span>📅 {req.date}</span>
                          <span>⏱ {req.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isOwner && req.status === 'open' && (
                          <button onClick={() => closeRequest(req.id)}
                            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold transition flex items-center gap-1">
                            <CheckCircle size={12} /> Kapat
                          </button>
                        )}
                        {(isOwner || isAdmin) && (
                          <button onClick={() => deleteRequest(req.id)}
                            className="text-xs px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Yanıtlar aç/kapat */}
                    {req.responses?.length > 0 && (
                      <button onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-semibold transition">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {req.responses.length} yanıt
                      </button>
                    )}

                    {/* Yanıt listesi */}
                    {isExpanded && req.responses?.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                        {req.responses.map(res => (
                          <div key={res.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                                {res.author?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-sm font-medium text-slate-700">{res.label}</span>
                                <p className="text-xs text-slate-400">{res.author} · {res.block} Blok No:{res.no}</p>
                              </div>
                            </div>
                            {(res.userId === currentUser.id || isAdmin) && (
                              <button onClick={() => removeResponse(req.id, res.id)} className="text-slate-300 hover:text-red-400 transition">
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Şablon yanıt butonları */}
                    {req.status === 'open' && !isOwner && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        {myResponse ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500">Yanıtınız:</span>
                            <span className="font-semibold text-slate-700">{myResponse.label}</span>
                            <button onClick={() => removeResponse(req.id, myResponse.id)} className="text-slate-400 hover:text-red-400 transition ml-1">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Yanıtınızı seçin</p>
                            <div className="flex flex-wrap gap-2">
                              {TEMPLATE_RESPONSES.map(t => (
                                <button key={t.id} onClick={() => handleResponse(req.id, t)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${t.color}`}>
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OduncPanel;
