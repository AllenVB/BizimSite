import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit, Search, X, Check, ChevronDown } from 'lucide-react';

const EMPTY = { name: '', email: '', password: '', phone: '', block: '', no: '', type: 'tenant', role: 'resident' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterPaid, setFilterPaid] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY);

  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem('users')) || []);
  }, []);

  const save = (updated) => {
    setUsers(updated);
    localStorage.setItem('users', JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };
    // Şifre boş bırakıldıysa düzenlemede eskisini koru
    if (editingId !== null) {
      const prev = users.find(u => u.id === editingId);
      if (!data.password) data.password = prev?.password || '';
      save(users.map(u => u.id === editingId ? { ...u, ...data } : u));
      setEditingId(null);
    } else {
      save([...users, { id: Date.now(), ...data, paid: false }]);
    }
    setFormData(EMPTY);
    setShowForm(false);
  };

  const startEdit = (user) => {
    setFormData({ name: user.name, email: user.email, password: '', phone: user.phone || '', block: user.block || '', no: user.no || '', type: user.type || 'tenant', role: user.role || 'resident' });
    setEditingId(user.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(EMPTY); };

  const deleteUser = (id) => {
    if (!window.confirm('Bu sakini silmek istediğinize emin misiniz?')) return;
    save(users.filter(u => u.id !== id));
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.no?.includes(q) || u.block?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchPaid = filterPaid === 'all' || (filterPaid === 'paid' ? u.paid : !u.paid);
    return matchSearch && matchPaid;
  });

  const inp = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition text-sm';

  const roleBadge = (role) => role === 'admin'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-slate-100 text-slate-600';

  return (
    <div className="ml-64 p-8 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Sakin Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} kayıtlı kullanıcı</p>
        </div>
        <button onClick={() => { cancelForm(); setShowForm(v => !v); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-semibold shadow-sm">
          {showForm && !editingId ? <X size={18} /> : <UserPlus size={18} />}
          {showForm && !editingId ? 'İptal' : 'Yeni Kullanıcı'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="font-bold text-slate-800 mb-4">{editingId ? '✏️ Kullanıcı Düzenle' : '+ Yeni Kullanıcı Ekle'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Ad Soyad</label>
              <input className={inp} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ahmet Yılmaz" /></div>
            <div><label className="text-xs font-semibold text-slate-500 mb-1 block">E-posta</label>
              <input className={inp} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="ahmet@mail.com" /></div>
            <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Şifre {editingId && <span className="text-slate-400 font-normal">(boş=değişmez)</span>}</label>
              <input className={inp} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingId} placeholder="••••••" /></div>
            <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Telefon</label>
              <input className={inp} type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0532 000 00 00" /></div>
            <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Blok</label>
              <input className={inp} value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} required placeholder="A" /></div>
            <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Daire No</label>
              <input className={inp} value={formData.no} onChange={e => setFormData({...formData, no: e.target.value})} required placeholder="12" /></div>
            <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Sakin Tipi</label>
              <select className={inp} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="tenant">Kiracı</option>
                <option value="owner">Ev Sahibi</option>
              </select></div>
            <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Rol</label>
              <select className={inp} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="resident">Sakin</option>
                <option value="admin">Yönetici</option>
                <option value="kapici">Kapıcı</option>
              </select></div>
            <div className="col-span-2 md:col-span-3 flex gap-3 pt-1">
              <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition">
                <Check size={16} /> {editingId ? 'Güncelle' : 'Kaydet'}
              </button>
              <button type="button" onClick={cancelForm} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition">İptal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 mb-5 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="İsim, blok veya daire no ile ara..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition" />
        </div>
        <div className="relative">
          <select value={filterPaid} onChange={e => setFilterPaid(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-blue-400 bg-white cursor-pointer">
            <option value="all">Tümü</option>
            <option value="paid">Ödedi</option>
            <option value="unpaid">Ödemedi</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">{filtered.length} sonuç</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Kullanıcı</th>
              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Daire</th>
              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">İletişim</th>
              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Tip / Rol</th>
              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Aidat</th>
              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">Kullanıcı bulunamadı</td></tr>
            ) : filtered.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {user.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{user.block} Blok / {user.no}</td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{user.phone || '-'}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${user.type === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.type === 'owner' ? 'Ev Sahibi' : 'Kiracı'}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${roleBadge(user.role)}`}>
                      {user.role === 'admin' ? '⚙ Yönetici' : 'Sakin'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.paid ? '✓ Ödendi' : '✗ Bekliyor'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => startEdit(user)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteUser(user.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
