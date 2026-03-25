import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Plus, X, CheckCircle, Clock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getComplaints, createComplaint, updateComplaint } from '../services/api';

const statusConfig = {
  pending:    { label: 'Bekliyor',     color: 'bg-amber-100 text-amber-700',  icon: <Clock size={14} /> },
  inprogress: { label: 'İşlemde',      color: 'bg-blue-100 text-blue-700',    icon: <AlertCircle size={14} /> },
  resolved:   { label: 'Çözüldü',      color: 'bg-green-100 text-green-700',  icon: <CheckCircle size={14} /> },
};

const Complaints = ({ isAdmin }) => {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', isAnonymous: false });
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const canManage = currentUser.role === 'admin' || currentUser.role === 'kapici';
  const formRef = useRef(null);

  useEffect(() => { if (showForm && formRef.current) { setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); } }, [showForm]);

  const load = () => {
    getComplaints().then(r => setComplaints(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createComplaint(form);
      setForm({ title: '', description: '', isAnonymous: false });
      setShowForm(false);
      load();
    } catch (err) { alert('Hata oluştu!'); }
  };

  const handleUpdate = async (id, status) => {
    try {
      await updateComplaint(id, { status, adminNote });
      setSelected(null);
      load();
    } catch (err) { alert('Güncellenemedi!'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" /> {canManage ? 'Talepler' : 'Taleplerim'}
            </h1>
            <p className="text-slate-500 mt-1">{canManage ? 'Tüm sakin talepleri' : 'Oluşturduğunuz talepler'}</p>
          </div>
          {!canManage && (
            <button onClick={() => setShowForm(!showForm)}
              className="btn-primary">
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? 'İptal' : 'Yeni Talep'}
            </button>
          )}
        </div>

        {showForm && !canManage && (
          <form ref={formRef} onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Başlık</label>
              <input className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Talep başlığı" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Açıklama</label>
              <textarea rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 resize-none"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="Sorununuzu açıklayın..." />
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div onClick={() => setForm({...form, isAnonymous: !form.isAnonymous})}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.isAnonymous ? 'bg-blue-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isAnonymous ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                {form.isAnonymous ? <EyeOff size={16} className="text-slate-500" /> : <Eye size={16} className="text-slate-500" />}
                {form.isAnonymous ? 'Anonim olarak gönder' : 'İsmim görünsün'}
              </span>
            </label>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Gönder</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">İptal</button>
            </div>
          </form>
        )}

        {selected && canManage && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
              <h3 className="font-bold text-lg mb-1">{selected.title}</h3>
              <p className="text-slate-500 text-sm mb-4">{selected.description}</p>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Yönetici Notu</label>
                <textarea rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 resize-none mb-4"
                  value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Not ekle..." />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => handleUpdate(selected.id, 'inprogress')} className="btn-primary text-sm py-2 px-4">İşleme Al</button>
                <button onClick={() => handleUpdate(selected.id, 'resolved')} className="btn-success text-sm py-2 px-4">Çözüldü</button>
                <button onClick={() => setSelected(null)} className="btn-secondary text-sm py-2 px-4">İptal</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-400">Yükleniyor...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle size={28} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">Talep bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map(c => {
              const st = statusConfig[c.status] || statusConfig.pending;
              return (
                <div key={c.id} onClick={() => canManage && setSelected(c)}
                  className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 transition-all duration-200 ${canManage ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {c.isAnonymous ? '🕵️ Anonim' : `${c.userName} · ${c.userBlock}-${c.userNo}`}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <h3 className="font-bold text-slate-800">{c.title}</h3>
                      <p className="text-slate-500 text-sm mt-1">{c.description}</p>
                      {c.adminNote && (
                        <div className="mt-3 bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
                          <span className="font-semibold">Yönetici Notu:</span> {c.adminNote}
                        </div>
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
export default Complaints;
