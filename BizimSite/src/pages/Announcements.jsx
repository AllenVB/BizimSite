import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, Plus, X, Lock, Trash2, CheckCircle } from 'lucide-react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../services/api';

const Announcements = ({ isAdmin }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [seenIds, setSeenIds] = useState(() =>
    JSON.parse(localStorage.getItem('seenAnnouncements') || '[]')
  );
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const canCreate = currentUser.role === 'admin' || currentUser.role === 'kapici';
  const formRef = useRef(null);

  useEffect(() => { if (showForm && formRef.current) { setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); } }, [showForm]);

  useEffect(() => {
    getAnnouncements().then(r => setAnnouncements(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createAnnouncement(form);
      setAnnouncements([res.data, ...announcements]);
      setForm({ title: '', content: '' });
      setShowForm(false);
    } catch (err) { alert(err.response?.data?.message || 'Hata!'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Duyuruyu silmek istiyor musunuz?')) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) { alert('Silinemedi!'); }
  };

  const markSeen = (id) => {
    if (seenIds.includes(id)) return;
    const updated = [...seenIds, id];
    setSeenIds(updated);
    localStorage.setItem('seenAnnouncements', JSON.stringify(updated));
  };

  const markAllSeen = () => {
    const allIds = announcements.map(a => a.id);
    const updated = [...new Set([...seenIds, ...allIds])];
    setSeenIds(updated);
    localStorage.setItem('seenAnnouncements', JSON.stringify(updated));
  };

  const unreadCount = announcements.filter(a => !seenIds.includes(a.id)).length;

  const roleLabel = (role) => role === 'admin' ? 'Yönetici' : role === 'kapici' ? 'Kapıcı' : 'Sakin';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Megaphone className="text-blue-500" /> Duyurular
            </h1>
            <p className="text-slate-500 mt-1">
              {unreadCount > 0
                ? <span className="text-blue-600 font-semibold">{unreadCount} okunmamış duyuru</span>
                : 'Tüm duyurular okundu'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={markAllSeen}
                className="btn-ghost text-sm">
                <CheckCircle size={16} /> Tümünü okundu işaretle
              </button>
            )}
            {canCreate ? (
              <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                {showForm ? <X size={18} /> : <Plus size={18} />}
                {showForm ? 'İptal' : 'Yeni Duyuru'}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-100 px-4 py-2 rounded-xl">
                <Lock size={16} /> Sadece yöneticiler oluşturabilir
              </div>
            )}
          </div>
        </div>

        {showForm && canCreate && (
          <form ref={formRef} onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Başlık</label>
              <input className="input-field"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Duyuru başlığı" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">İçerik</label>
              <textarea rows={4} className="textarea-field"
                value={form.content} onChange={e => setForm({...form, content: e.target.value})} required placeholder="Duyuru içeriği..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Yayınla</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">İptal</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-400">Yükleniyor...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Megaphone size={28} className="mx-auto mb-4 opacity-30" />
            <p>Henüz duyuru yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(a => {
              const isRead = seenIds.includes(a.id);
              return (
                <div key={a.id} className={`card p-6 ${!isRead ? 'border-blue-200 ring-1 ring-blue-100' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {!isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                          {roleLabel(a.authorRole)}
                        </span>
                        <span className="text-xs text-slate-400">{a.author} · {new Date(a.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mb-2">{a.title}</h3>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {!isRead && (
                        <button onClick={() => markSeen(a.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95">
                          <CheckCircle size={14} /> Okundu
                        </button>
                      )}
                      {isRead && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle size={13} /> Okundu
                        </span>
                      )}
                      {currentUser.role === 'admin' && (
                        <button onClick={() => handleDelete(a.id)} className="btn-icon text-slate-300 hover:text-red-400">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
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
export default Announcements;
