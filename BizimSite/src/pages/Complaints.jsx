import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, X, CheckCircle, Clock, MessageCircle, Filter } from 'lucide-react';

const Complaints = ({ isAdmin = false }) => {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '', category: 'ariza' });
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('complaints')) || [];
    setComplaints(saved);
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    const complaint = {
      id: Date.now(),
      ...newComplaint,
      status: 'pending',
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      timestamp: Date.now(),
      author: currentUser.name || 'Sakin',
      block: currentUser.block || '-',
      no: currentUser.no || '-',
      response: null
    };
    const updated = [complaint, ...complaints];
    setComplaints(updated);
    localStorage.setItem('complaints', JSON.stringify(updated));
    setNewComplaint({ title: '', description: '', category: 'ariza' });
    setShowForm(false);
  };

  const updateStatus = (id, status, response = null) => {
    const updated = complaints.map(c =>
      c.id === id ? { ...c, status, response: response || c.response } : c
    );
    setComplaints(updated);
    localStorage.setItem('complaints', JSON.stringify(updated));
  };

  const [respondingId, setRespondingId] = useState(null);
  const [responseText, setResponseText] = useState('');

  const handleRespond = (id) => {
    updateStatus(id, 'resolved', responseText);
    setRespondingId(null);
    setResponseText('');
  };

  const categoryLabels = {
    ariza: { label: 'Arıza', color: 'bg-red-100 text-red-700' },
    temizlik: { label: 'Temizlik', color: 'bg-yellow-100 text-yellow-700' },
    gurultu: { label: 'Gürültü', color: 'bg-purple-100 text-purple-700' },
    guvenlik: { label: 'Güvenlik', color: 'bg-orange-100 text-orange-700' },
    oneri: { label: 'Öneri', color: 'bg-green-100 text-green-700' },
    diger: { label: 'Diğer', color: 'bg-slate-100 text-slate-700' }
  };

  const statusLabels = {
    pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} /> },
    in_progress: { label: 'İşleniyor', color: 'bg-blue-100 text-blue-700', icon: <MessageCircle size={14} /> },
    resolved: { label: 'Çözüldü', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> }
  };

  const filteredComplaints = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter);

  const displayComplaints = isAdmin
    ? filteredComplaints
    : filteredComplaints.filter(c => c.author === currentUser.name);

  return (
    <div className="ml-64 p-8 min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <AlertTriangle className="text-yellow-400" /> {isAdmin ? 'Talep & Şikayetler' : 'Taleplerim'}
          </h1>
          <p className="text-slate-400 mt-1">
            {isAdmin ? 'Sakinlerin taleplerini yönetin' : 'Arıza, şikayet veya önerilerinizi iletin'}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'İptal' : 'Yeni Talep'}
          </button>
        )}
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'pending', label: 'Bekliyor' },
          { key: 'in_progress', label: 'İşleniyor' },
          { key: 'resolved', label: 'Çözüldü' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f.key
              ? 'bg-blue-600 text-white'
              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Yeni Talep Formu */}
      {!isAdmin && showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Yeni Talep / Şikayet</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
              <select
                value={newComplaint.category}
                onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ariza">Arıza</option>
                <option value="temizlik">Temizlik</option>
                <option value="gurultu">Gürültü</option>
                <option value="guvenlik">Güvenlik</option>
                <option value="oneri">Öneri</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Başlık</label>
              <input
                type="text"
                value={newComplaint.title}
                onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                placeholder="Kısa bir açıklama..."
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Detaylı Açıklama</label>
              <textarea
                value={newComplaint.description}
                onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                placeholder="Sorunu detaylıca anlatın..."
                required
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Talebi Gönder
            </button>
          </div>
        </form>
      )}

      {/* Talep Listesi */}
      <div className="space-y-4">
        {displayComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <AlertTriangle size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Talep bulunamadı</p>
          </div>
        ) : (
          displayComplaints.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-800">{c.title}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${categoryLabels[c.category]?.color}`}>
                      {categoryLabels[c.category]?.label}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${statusLabels[c.status]?.color}`}>
                      {statusLabels[c.status]?.icon} {statusLabels[c.status]?.label}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3 whitespace-pre-wrap">{c.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{c.date}</span>
                    <span>{c.author} - {c.block} Blok No: {c.no}</span>
                  </div>
                </div>
              </div>

              {/* Yönetim Yanıtı */}
              {c.response && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-green-700 mb-1">Yönetim Yanıtı:</p>
                  <p className="text-green-600 text-sm">{c.response}</p>
                </div>
              )}

              {/* Admin Kontrolleri */}
              {isAdmin && c.status !== 'resolved' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {respondingId === c.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Yanıtınızı yazın..."
                        rows={2}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(c.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          Yanıtla & Çöz
                        </button>
                        <button
                          onClick={() => { setRespondingId(null); setResponseText(''); }}
                          className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-all"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {c.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(c.id, 'in_progress')}
                          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-all"
                        >
                          İşleme Al
                        </button>
                      )}
                      <button
                        onClick={() => setRespondingId(c.id)}
                        className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 transition-all"
                      >
                        Yanıtla
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Complaints;
