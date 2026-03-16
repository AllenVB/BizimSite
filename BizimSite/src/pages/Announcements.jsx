import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Megaphone, Calendar, X } from 'lucide-react';

const Announcements = ({ isAdmin = false }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'normal' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('announcements')) || [];
    setAnnouncements(saved);
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    const announcement = {
      id: Date.now(),
      ...newAnnouncement,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      timestamp: Date.now(),
      author: 'Yönetim'
    };
    const updated = [announcement, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('announcements', JSON.stringify(updated));
    setNewAnnouncement({ title: '', content: '', priority: 'normal' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem('announcements', JSON.stringify(updated));
  };

  const priorityStyles = {
    urgent: 'border-red-300 bg-red-50',
    important: 'border-orange-300 bg-orange-50',
    normal: 'border-slate-200 bg-white'
  };

  const priorityBadge = {
    urgent: 'bg-red-100 text-red-700',
    important: 'bg-orange-100 text-orange-700',
    normal: 'bg-blue-100 text-blue-700'
  };

  const priorityLabel = {
    urgent: 'Acil',
    important: 'Önemli',
    normal: 'Normal'
  };

  return (
    <div className="ml-64 p-8 min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Megaphone className="text-blue-400" /> Duyurular
          </h1>
          <p className="text-slate-400 mt-1">
            {isAdmin ? 'Site duyurularını yönetin' : 'Site duyurularını takip edin'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'İptal' : 'Yeni Duyuru'}
          </button>
        )}
      </div>

      {/* Yeni Duyuru Formu */}
      {isAdmin && showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Yeni Duyuru Oluştur</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Başlık</label>
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                placeholder="Duyuru başlığı..."
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">İçerik</label>
              <textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                placeholder="Duyuru detayları..."
                required
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Öncelik</label>
              <select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="normal">Normal</option>
                <option value="important">Önemli</option>
                <option value="urgent">Acil</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Duyuruyu Yayınla
            </button>
          </div>
        </form>
      )}

      {/* Duyuru Listesi */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <Bell size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Henüz duyuru yok</p>
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl shadow-sm border p-6 transition-all hover:shadow-md ${priorityStyles[a.priority]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{a.title}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityBadge[a.priority]}`}>
                      {priorityLabel[a.priority]}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3 whitespace-pre-wrap">{a.content}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {a.date}</span>
                    <span>{a.author}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
