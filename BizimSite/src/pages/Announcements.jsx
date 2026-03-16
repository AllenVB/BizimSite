import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Megaphone, Calendar, X, Edit3, Lock } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal' });
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    setAnnouncements(JSON.parse(localStorage.getItem('announcements')) || []);
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    const ann = {
      id: Date.now(), ...form,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      author: currentUser.name || 'Yönetim'
    };
    const updated = [ann, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('announcements', JSON.stringify(updated));
    setForm({ title: '', content: '', priority: 'normal' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem('announcements', JSON.stringify(updated));
  };

  const priorityConfig = {
    urgent:    { border: 'border-l-red-500',    bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700',    label: 'Acil',   dot: 'bg-red-500' },
    important: { border: 'border-l-amber-500',  bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700', label: 'Önemli', dot: 'bg-amber-500' },
    normal:    { border: 'border-l-blue-400',   bg: 'bg-white',     badge: 'bg-blue-100 text-blue-700',   label: 'Genel',  dot: 'bg-blue-400' },
  };

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Megaphone className="text-blue-500" /> Duyurular
            </h1>
            <p className="text-slate-500 mt-1">
              {isAdmin ? 'Duyuruları yönetin' : 'Site duyurularını takip edin'}
            </p>
          </div>
          {isAdmin ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-sm"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? 'İptal' : 'Yeni Duyuru'}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-sm">
              <Lock size={14} /> Yalnızca yönetici ekleyebilir
            </div>
          )}
        </div>

        {isAdmin && showForm && (
          <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Edit3 size={16} className="text-blue-500" /> Yeni Duyuru
            </h2>
            <div className="space-y-4">
              <input
                type="text" placeholder="Duyuru başlığı..." value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-400 outline-none transition"
              />
              <textarea
                placeholder="Duyuru detayları..." value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })} required rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-400 outline-none transition resize-none"
              />
              <div className="flex items-center gap-3">
                <select
                  value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-400 outline-none transition"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Önemli</option>
                  <option value="urgent">Acil</option>
                </select>
                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition">
                  Yayınla
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-100">
              <Bell size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Henüz duyuru yok</p>
            </div>
          ) : (
            announcements.map((a) => {
              const cfg = priorityConfig[a.priority] || priorityConfig.normal;
              return (
                <div key={a.id} className={`${cfg.bg} border border-slate-100 border-l-4 ${cfg.border} rounded-2xl p-5 transition hover:shadow-sm`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <h3 className="font-bold text-slate-800">{a.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed mb-3">{a.content}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {a.date}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-500">{a.author}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDelete(a.id)} className="text-slate-400 hover:text-red-500 transition p-1.5 flex-shrink-0">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
