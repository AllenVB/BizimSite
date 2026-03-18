import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit2, X, Save, Home, Users } from 'lucide-react';
import { getBlocks, createBlock, updateBlock, deleteBlock, getUsers } from '../services/api';

const BlockManagement = () => {
  const [blocks, setBlocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', floors: '', apartmentsPerFloor: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [b, u] = await Promise.all([getBlocks(), getUsers()]);
      setBlocks(b.data);
      setUsers(u.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createBlock({
        name: formData.name,
        floors: parseInt(formData.floors) || 1,
        apartmentsPerFloor: parseInt(formData.apartmentsPerFloor) || 1
      });
      setFormData({ name: '', floors: '', apartmentsPerFloor: '' });
      setShowForm(false);
      load();
    } catch { alert('Blok eklenemedi!'); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateBlock(editingId, {
        name: formData.name,
        floors: parseInt(formData.floors) || 1,
        apartmentsPerFloor: parseInt(formData.apartmentsPerFloor) || 1
      });
      setEditingId(null);
      setFormData({ name: '', floors: '', apartmentsPerFloor: '' });
      load();
    } catch { alert('Güncellenemedi!'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu bloğu silmek istiyor musunuz?')) return;
    try { await deleteBlock(id); load(); } catch { alert('Silinemedi!'); }
  };

  const startEdit = (block) => {
    setEditingId(block.id);
    setFormData({ name: block.name, floors: block.floors.toString(), apartmentsPerFloor: block.apartmentsPerFloor.toString() });
    setShowForm(false);
  };

  const totalApartments = blocks.reduce((sum, b) => sum + b.totalApartments, 0);
  const occupiedCount = users.length;

  if (loading) return (
    <div className="ml-64 min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
      <p className="text-slate-400">Yükleniyor...</p>
    </div>
  );

  return (
    <div className="ml-64 p-8 min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Building2 className="text-blue-400" /> Blok & Daire Yönetimi
          </h1>
          <p className="text-slate-400 mt-1">Blokları ve daireleri yönetin</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', floors: '', apartmentsPerFloor: '' }); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'İptal' : 'Yeni Blok'}
        </button>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="p-2 bg-blue-50 rounded-lg w-fit mb-2"><Building2 size={20} className="text-blue-600" /></div>
          <p className="text-xs text-gray-500">Toplam Blok</p>
          <p className="text-2xl font-bold text-gray-800">{blocks.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="p-2 bg-green-50 rounded-lg w-fit mb-2"><Home size={20} className="text-green-600" /></div>
          <p className="text-xs text-gray-500">Toplam Daire</p>
          <p className="text-2xl font-bold text-gray-800">{totalApartments}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="p-2 bg-purple-50 rounded-lg w-fit mb-2"><Users size={20} className="text-purple-600" /></div>
          <p className="text-xs text-gray-500">Kayıtlı Sakin</p>
          <p className="text-2xl font-bold text-gray-800">{occupiedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="p-2 bg-orange-50 rounded-lg w-fit mb-2"><Home size={20} className="text-orange-600" /></div>
          <p className="text-xs text-gray-500">Boş Daire</p>
          <p className="text-2xl font-bold text-gray-800">{Math.max(0, totalApartments - occupiedCount)}</p>
        </div>
      </div>

      {/* Form */}
      {(showForm || editingId) && (
        <form onSubmit={editingId ? handleEdit : handleAdd} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Blok Düzenle' : 'Yeni Blok Ekle'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Blok Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: A, B, C..."
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Kat Sayısı</label>
              <input
                type="number"
                min="1"
                value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                placeholder="Örn: 5"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Kat Başına Daire</label>
              <input
                type="number"
                min="1"
                value={formData.apartmentsPerFloor}
                onChange={(e) => setFormData({ ...formData, apartmentsPerFloor: e.target.value })}
                placeholder="Örn: 4"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
              <Save size={18} /> {editingId ? 'Güncelle' : 'Ekle'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', floors: '', apartmentsPerFloor: '' }); }}
                className="bg-slate-200 text-slate-600 px-6 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-all">
                İptal
              </button>
            )}
          </div>
        </form>
      )}

      {/* Blok Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blocks.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-100">
            <Building2 size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Henüz blok eklenmedi</p>
            <p className="text-slate-300 text-sm mt-1">Yukarıdaki butonu kullanarak blok ekleyin</p>
          </div>
        ) : (
          blocks.map((block) => {
            const blockResidents = users.filter(u => u.block === block.name);
            return (
              <div key={block.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">{block.name}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{block.name} Blok</h3>
                      <p className="text-xs text-slate-400">
                        {new Date(block.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(block)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(block.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Kat</p>
                    <p className="text-lg font-bold text-slate-800">{block.floors}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Toplam Daire</p>
                    <p className="text-lg font-bold text-slate-800">{block.totalApartments}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-green-600">Kayıtlı Sakin</p>
                    <p className="text-lg font-bold text-green-700">{blockResidents.length}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-orange-600">Boş</p>
                    <p className="text-lg font-bold text-orange-700">{Math.max(0, block.totalApartments - blockResidents.length)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BlockManagement;
