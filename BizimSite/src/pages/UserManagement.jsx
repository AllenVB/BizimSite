import React, { useState, useEffect } from 'react';
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
    if (filter === 'paid') list = list.filter(u => u.paid);
    if (filter === 'unpaid') list = list.filter(u => !u.paid);
    setFiltered(list);
  }, [users, search, filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, formData);
      } else {
        await register(formData);
      }
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

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><Users className="text-blue-500" /> Sakin Yönetimi</h1>
            <p className="text-slate-500 mt-1">{users.length} kayıtlı kullanıcı</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name:'', email:'', password:'', phone:'', block:'', no:'', role:'resident', type:'Kiracı' }); }}
            className="btn-primary">
            {showForm && !editingId ? <X size={18} /> : <UserPlus size={18} />}
            {showForm && !editingId ? 'İptal' : 'Yeni Kullanıcı'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="font-bold text-slate-800 mb-4">{editingId ? '✏️ Düzenle' : '+ Yeni Kullanıcı'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Ad Soyad</label>
                <input className={inp} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ahmet Yılmaz" /></div>
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">E-posta</label>
                <input className={inp} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="ahmet@mail.com" /></div>
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Şifre {editingId && <span className="text-slate-400 font-normal">(boş=değişmez)</span>}</label>
                <input className={inp} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingId} placeholder="••••••" /></div>
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Telefon</label>
                <input className={inp} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0532 000 00 00" /></div>
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Blok</label>
                <input className={inp} value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} required placeholder="A" /></div>
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Daire No</label>
                <input className={inp} value={formData.no} onChange={e => setFormData({...formData, no: e.target.value})} required placeholder="12" /></div>
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Rol</label>
                <select className={inp} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="resident">Sakin</option>
                  <option value="admin">Yönetici</option>
                  {isPremium && <option value="kapici">Kapıcı</option>}
                </select></div>
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Tip</label>
                <select className={inp} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Kiracı">Kiracı</option>
                  <option value="Ev Sahibi">Ev Sahibi</option>
                </select></div>
              <div className="col-span-2 md:col-span-3 flex gap-3 pt-1">
                <button type="submit" className="btn-primary">
                  <Check size={16} /> {editingId ? 'Güncelle' : 'Ekle'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim, e-posta, blok, daire..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-2">
              {[['all','Tümü'],['paid','Ödedi'],['unpaid','Ödemedi']].map(([v,l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter===v ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400">Yükleniyor...</div>
          ) : (
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
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.role==='admin' ? 'bg-purple-100 text-purple-700' : u.role==='kapici' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
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
          )}
        </div>
      </div>
    </div>
  );
};
export default UserManagement;
