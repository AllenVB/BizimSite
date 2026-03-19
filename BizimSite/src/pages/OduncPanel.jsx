import React, { useState, useEffect } from 'react';
import { Package, Plus, X, CheckCircle, Clock, User, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getBorrowRequests, createBorrowRequest, respondBorrow } from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ item: '', description: '', duration: '1 gün' });
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getBorrowRequests();
      setRequests(res.data);
    } catch (e) {
      setError('Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBorrowRequest({ itemName: form.item, description: form.description, duration: form.duration });
      setForm({ item: '', description: '', duration: '1 gün' });
      setShowForm(false);
      loadRequests();
    } catch (e) {
      setError(e.response?.data?.message || 'İstek oluşturulamadı!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponse = async (reqId, template) => {
    try {
      await respondBorrow(reqId, { responseType: template.id });
      loadRequests();
    } catch (e) {
      setError(e.response?.data?.message || 'Yanıt gönderilemedi!');
    }
  };

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
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-150 shadow-lg inline-flex items-center gap-2">
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'İptal' : 'İstek Oluştur'}
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            {error} <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
          </div>
        )}

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
              <button type="submit" disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:bg-amber-300 text-white py-3 rounded-xl font-bold transition-all duration-150 flex items-center justify-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                İsteği Yayınla
              </button>
            </div>
          </form>
        )}

        {/* İstek listesi */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-amber-500" />
          </div>
        ) : requests.length === 0 ? (
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
              const yesCount = req.responses?.filter(r => r.responseType === 'yes').length || 0;

              const templateLabel = (type) => TEMPLATE_RESPONSES.find(t => t.id === type)?.label || type;

              return (
                <div key={req.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${req.status === 'closed' ? 'opacity-60 border-slate-100' : 'border-amber-100'}`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-lg font-bold text-slate-800">🔧 {req.itemName}</span>
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
                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1"><User size={11} /> {req.userName}{req.userBlock ? ` — ${req.userBlock} Blok No:${req.userNo}` : ''}</span>
                          <span>📅 {new Date(req.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
                          {req.duration && <span>⏱ {req.duration}</span>}
                        </div>
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
                          <div key={res.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                              {res.userName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-slate-700">{templateLabel(res.responseType)}</span>
                              <p className="text-xs text-slate-400">{res.userName}</p>
                            </div>
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
                            <span className="font-semibold text-slate-700">{templateLabel(myResponse.responseType)}</span>
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
