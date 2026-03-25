import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, X, Check } from 'lucide-react';
import { getUsers, updateUser, deleteUser, register } from '../services/api';

const inp = "input-field";

const UserManagement = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const planType = currentUser.planType || 'basic';
  const isPremium = planType === 'premium' || planType === 'enterprise';

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name:'', email:'', password:'', phone:'', block:'', no:'', role:'resident', type:'Kiracı' });
  const formRef = useRef(null);

  // Form açılınca otomatik kaydır
  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [showForm]);

  const load = () => {
    getUsers().then(r => { setUsers(r.data); setLoading(false); }).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = users;
    if (search) list = list.filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.block?.toLowerCase().includes(search.toLowerCase()) ||
      u.no?.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === 'paid')   list = list.filter(u => u.paid);
    if (filter === 'unpaid') list = list.filter(u => !u.paid);
    setFiltered(list);
  }, [users, search, filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await updateUser(editingId, formData);
      else           await register(formData);
      setShowForm(false); setEditingId(null);
      setFormData({ name:'', email:'', password:'', phone:'', block:'', no:'', role:'resident', type:'Kiracı' });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Hata!'); }
  };

  const handleEdit = (u) => {
    setFormData({ name: u.name, email: u.email, password: '', phone: u.phone, block: u.block, no: u.no, role: u.role, type: u.type });
    setEditingId(u.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu kullanıcıyı silmek istiyor musunuz?')) return;
    try { await deleteUser(id); load(); } catch { alert('Silinemedi!'); }
  };

  const roleLabel = { resident: 'Sakin', admin: 'Yönetici', kapici: 'Kapıcı' };
  const roleColor  = { resident: 'bg-blue-100 text-blue-700', admin: 'bg-purple-100 text-purple-700', kapici: 'bg-amber-100 text-amber-700' };

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 md:mb-8 gap-3">
          <div className="min-w-0">
            <h1 className="text-lg md:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-blue-500 flex-shrink-0" />
              <span className="truncate">Sakin Yönetimi</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">{users.length} kayıtlı kullanıcı</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name:'', email:'', password:'', phone:'', block:'', no:'', role:'resident', type:'Kiracı' }); }}
            className="btn-primary text-sm flex-shrink-0 py-2 px-3 md:px-4"
          >
            {showForm && !editingId ? <X size={16} /> : <UserPlus size={16} />}
            <span className="hidden sm:inline">{showForm && !editingId ? 'İptal' : 'Yeni Kullanıcı'}</span>
          </button>
        </div>

        {/* ── Form ── */}
        {showForm && (
          <div ref={formRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 mb-4">
            <h2 className="font-bold text-slate-800 mb-4 text-sm md:text-base">
              {editingId ? '✏️ Düzenle' : '+ Yeni Kullanıcı'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Ad Soyad</label>
                <input className={inp} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ahmet Yılmaz" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">E-posta</label>
                <input className={inp} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="ahmet@mail.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Şifre {editingId && <span className="text-slate-400 font-normal">(boş=değişmez)</span>}
                </label>
                <input className={inp} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingId} placeholder="••••••" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Telefon</label>
                <input className={inp} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0532 000 00 00" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Blok</label>
                <input className={inp} value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} required placeholder="A" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Daire No</label>
                <input className={inp} value={formData.no} onChange={e => setFormData({...formData, no: e.target.value})} required placeholder="12" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Rol</label>
                <select className={inp} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="resident">Sakin</option>
                  <option value="admin">Yönetici</option>
                  {isPremium && <option value="kapici">Kapıcı</option>}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Tip</label>
                <select className={inp} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Kiracı">Kiracı</option>
                  <option value="Ev Sahibi">Ev Sahibi</option>
                </select>
              </div>
              <div className="sm:col-span-2 md:col-span-3 flex gap-2 pt-1">
                <button type="submit" className="btn-primary text-sm py-2 px-4">
                  <Check size={15} /> {editingId ? 'Güncelle' : 'Ekle'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary text-sm py-2 px-4">
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Arama & Filtreler ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-3 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="İsim, e-posta, blok..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex gap-1.5">
              {[['all','Tümü'],['paid','Ödedi'],['unpaid','Ödemedi']].map(([v,l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition ${filter===v ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">Kullanıcı bulunamadı</div>
          ) : (
            <>
              {/* ── Mobil kart görünümü ── */}
              <div className="md:hidden divide-y divide-slate-50">
                {filtered.map(u => (
                  <div key={u.id} className="p-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${u.role==='admin' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                      {u.name?.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-sm text-slate-800 truncate">{u.name}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleColor[u.role] || 'bg-blue-100 text-blue-700'}`}>
                          {roleLabel[u.role] || u.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {u.block || '-'}-{u.no || '-'}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${u.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {u.paid ? '✓ Ödedi' : '✗ Ödemedi'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => handleEdit(u)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Desktop tablo görünümü ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                    <tr>
                      {['Ad Soyad','Blok/No','Rol','Tip','Aidat','İşlem'].map(h => (
                        <th key={h} className="px-5 py-3 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(u => (
                      <tr key={u.id} className="table-row">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{u.block}-{u.no}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleColor[u.role] || 'bg-blue-100 text-blue-700'}`}>
                            {roleLabel[u.role] || u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{u.type}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {u.paid ? 'Ödedi' : 'Ödemedi'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(u)} className="btn-icon text-blue-500"><Edit2 size={15} /></button>
                            <button onClick={() => handleDelete(u.id)} className="btn-icon text-red-400"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default UserManagement;
