import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit, Search, Filter } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', block: '', no: '' });

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(savedUsers);
  }, []);

  const addUser = (e) => {
    e.preventDefault();
    const newUser = { id: Date.now(), ...formData, status: 'Yeni Kayıt' };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setFormData({ name: '', email: '', password: '', phone: '', block: '', no: '' });
    setShowForm(false);
  };

  const deleteUser = (id) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  return (
    <div className="ml-64 p-8 min-h-screen bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Sakin Yönetimi</h1>
          <p className="text-slate-500">Apartman sakinlerini listeleyebilir ve yeni kayıt ekleyebilirsiniz.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95">
          <UserPlus size={20} />
          <span className="font-semibold">Yeni Sakin Ekle</span>
        </button>
      </div>

      {/* Yeni Sakin Ekleme Formu */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
          <form onSubmit={addUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Ad Soyad" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="email" placeholder="E-posta" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="password" placeholder="Şifre" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="tel" placeholder="Telefon" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" placeholder="Blok (A, B, C...)" value={formData.block} onChange={(e) => setFormData({...formData, block: e.target.value})} required className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" placeholder="Daire No" value={formData.no} onChange={(e) => setFormData({...formData, no: e.target.value})} required className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <button type="submit" className="md:col-span-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold">Kaydet</button>
          </form>
        </div>
      )}

      {/* Arama ve Filtreleme Barı */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="İsim veya daire no ile ara..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
          <Filter size={18} />
          Filtrele
        </button>
      </div>

      {/* Sakin Listesi Tablosu */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sakin Bilgisi</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Daire</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">İletişim</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-400 font-medium">ID: #{user.id}</div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {user.block} Blok / No: {user.no}
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {user.phone}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.status === 'Ödendi' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
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