import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit2, X, Save, Home, Users, Phone, Mail, CreditCard, ChevronRight } from 'lucide-react';
import { getBlocks, createBlock, updateBlock, deleteBlock, getUsers } from '../services/api';

const colors = ['#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981','#EF4444','#06B6D4','#6366F1'];
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length];

const BlockManagement = () => {
  const [blocks, setBlocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', floors: '', apartmentsPerFloor: '' });
  const [loading, setLoading] = useState(true);
  const [blockResidentsModal, setBlockResidentsModal] = useState(null); // block nesnesi
  const [selectedResident, setSelectedResident] = useState(null);       // sakin nesnesi

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
          className="btn-primary shadow-lg">
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'İptal' : 'Yeni Blok'}
        </button>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card group">
          <div className="p-2 bg-blue-50 rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform duration-200"><Building2 size={20} className="text-blue-600" /></div>
          <p className="text-xs text-gray-500">Toplam Blok</p>
          <p className="text-2xl font-bold text-gray-800">{blocks.length}</p>
        </div>
        <div className="stat-card group">
          <div className="p-2 bg-green-50 rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform duration-200"><Home size={20} className="text-green-600" /></div>
          <p className="text-xs text-gray-500">Toplam Daire</p>
          <p className="text-2xl font-bold text-gray-800">{totalApartments}</p>
        </div>
        <div className="stat-card group">
          <div className="p-2 bg-purple-50 rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform duration-200"><Users size={20} className="text-purple-600" /></div>
          <p className="text-xs text-gray-500">Kayıtlı Sakin</p>
          <p className="text-2xl font-bold text-gray-800">{occupiedCount}</p>
        </div>
        <div className="stat-card group">
          <div className="p-2 bg-orange-50 rounded-lg w-fit mb-2 group-hover:scale-110 transition-transform duration-200"><Home size={20} className="text-orange-600" /></div>
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
              <input type="text" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: A, B, C..." required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Kat Sayısı</label>
              <input type="number" min="1" value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                placeholder="Örn: 5" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Kat Başına Daire</label>
              <input type="number" min="1" value={formData.apartmentsPerFloor}
                onChange={(e) => setFormData({ ...formData, apartmentsPerFloor: e.target.value })}
                placeholder="Örn: 4" required className="input-field" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn-primary">
              <Save size={18} /> {editingId ? 'Güncelle' : 'Ekle'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', floors: '', apartmentsPerFloor: '' }); }}
                className="btn-secondary">İptal</button>
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
              <div key={block.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">{block.name}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{block.name} Blok</h3>
                      <p className="text-xs text-slate-400">{new Date(block.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(block)} className="btn-icon text-blue-500"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(block.id)} className="btn-icon text-red-500"><Trash2 size={16} /></button>
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
                  {/* Tıklanabilir "Kayıtlı Sakin" hücresi */}
                  <button
                    onClick={() => blockResidents.length > 0 && setBlockResidentsModal({ block, residents: blockResidents })}
                    className={`bg-green-50 p-3 rounded-lg text-center transition-all duration-150 ${blockResidents.length > 0 ? 'hover:bg-green-100 hover:scale-105 cursor-pointer' : 'cursor-default'}`}>
                    <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                      Kayıtlı Sakin {blockResidents.length > 0 && <ChevronRight size={11} />}
                    </p>
                    <p className="text-lg font-bold text-green-700">{blockResidents.length}</p>
                  </button>
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

      {/* ── Blok Sakin Listesi Modalı ── */}
      {blockResidentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => { setBlockResidentsModal(null); setSelectedResident(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {/* Modal başlık */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{blockResidentsModal.block.name} Blok Sakinleri</h2>
                <p className="text-xs text-slate-400">{blockResidentsModal.residents.length} kayıtlı sakin</p>
              </div>
              <button onClick={() => { setBlockResidentsModal(null); setSelectedResident(null); }}
                className="btn-icon"><X size={20} /></button>
            </div>
            {/* Sakin listesi */}
            <div className="overflow-y-auto flex-1 p-3">
              {blockResidentsModal.residents
                .sort((a, b) => (a.no || '').localeCompare(b.no || '', 'tr', { numeric: true }))
                .map(r => (
                  <button key={r.id} onClick={() => setSelectedResident(r)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all duration-150 text-left group">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: getColor(r.name) }}>
                      {r.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{r.name}</p>
                      <p className="text-xs text-slate-400">Daire No: {r.no}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${r.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {r.paid ? 'Ödedi' : 'Borçlu'}
                    </span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Sakin Detay Modalı ── */}
      {selectedResident && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedResident(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {/* Üst banner */}
            <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${getColor(selectedResident.name)}, ${getColor(selectedResident.name)}88)` }}>
              <button onClick={() => setSelectedResident(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all">
                <X size={16} />
              </button>
              <div className="absolute -bottom-8 left-5 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg border-4 border-white"
                style={{ backgroundColor: getColor(selectedResident.name) }}>
                {selectedResident.name?.substring(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Bilgiler */}
            <div className="pt-12 pb-6 px-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedResident.name}</h3>
                  <p className="text-sm text-slate-400">{selectedResident.block} Blok — Daire {selectedResident.no}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedResident.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {selectedResident.paid ? '✓ Ödedi' : '✗ Borçlu'}
                </span>
              </div>

              <div className="space-y-3">
                {selectedResident.email && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="p-1.5 bg-blue-100 rounded-lg"><Mail size={15} className="text-blue-600" /></div>
                    <span className="text-sm text-slate-700 truncate">{selectedResident.email}</span>
                  </div>
                )}
                {selectedResident.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="p-1.5 bg-green-100 rounded-lg"><Phone size={15} className="text-green-600" /></div>
                    <span className="text-sm text-slate-700">{selectedResident.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="p-1.5 bg-purple-100 rounded-lg"><CreditCard size={15} className="text-purple-600" /></div>
                  <span className="text-sm text-slate-700">
                    {selectedResident.paid ? 'Bu ay aidatını ödedi' : 'Bu ay aidatını ödemedi'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockManagement;
