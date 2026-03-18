import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, X, Lock, Trash2 } from 'lucide-react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../services/api';

const Announcements = ({ isAdmin }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const canCreate = currentUser.role === 'admin' || currentUser.role === 'kapici';

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

  const roleLabel = (role) => role === 'admin' ? 'Yönetici' : role === 'kapici' ? 'Kapıcı' : 'Sakin';

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Megaphone className="text-blue-500" /> Duyurular
            </h1>
            <p className="text-slate-500 mt-1">Apartman duyuruları</p>
          </div>
          {canCreate ? (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-semibold">
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? 'İptal' : 'Yeni Duyuru'}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-100 px-4 py-2 rounded-xl">
              <Lock size={16} /> Sadece yöneticiler oluşturabilir
            </div>
          )}
        </div>

        {showForm && canCreate && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Başlık</label>
              <input className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Duyuru başlığı" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">İçerik</label>
              <textarea rows={4} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 resize-none"
                value={form.content} onChange={e => setForm({...form, content: e.target.value})} required placeholder="Duyuru içeriği..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition">Yayınla</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl hover:bg-slate-50 transition">İptal</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-400">Yükleniyor...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Megaphone size={48} className="mx-auto mb-4 opacity-30" />
            <p>Henüz duyuru yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(a => (
              <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                        {roleLabel(a.authorRole)}
                      </span>
                      <span className="text-xs text-slate-400">{a.author} · {new Date(a.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{a.title}</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                  </div>
                  {currentUser.role === 'admin' && (
                    <button onClick={() => handleDelete(a.id)} className="text-slate-300 hover:text-red-400 transition flex-shrink-0">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Announcements;
