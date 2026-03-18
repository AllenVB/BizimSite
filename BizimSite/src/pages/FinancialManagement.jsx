import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getExpenses, createExpense, deleteExpense, getPayments, getAidatConfig, updateAidatConfig, startNewMonth } from '../services/api';

const COLORS = ['#3B82F6','#8B5CF6','#F59E0B','#10B981','#EF4444','#06B6D4'];

const FinancialManagement = ({ isAdmin }) => {
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [config, setConfig] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showAidatForm, setShowAidatForm] = useState(false);
  const [expForm, setExpForm] = useState({ label: '', amount: '' });
  const [aidatForm, setAidatForm] = useState({ dueDay: 1, amount: 0, currentMonth: '' });
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const canEdit = currentUser.role === 'admin';

  const load = () => {
    Promise.all([getExpenses(), getPayments(), getAidatConfig()]).then(([e, p, c]) => {
      setExpenses(e.data);
      setPayments(p.data);
      setConfig(c.data);
      if (c.data) setAidatForm({ dueDay: c.data.dueDay, amount: c.data.amount, currentMonth: c.data.currentMonth });
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = payments.reduce((s, p) => s + p.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await createExpense({ category: 'general', label: expForm.label, amount: parseFloat(expForm.amount) });
      setExpForm({ label: '', amount: '' });
      setShowExpenseForm(false);
      load();
    } catch { alert('Eklenemedi!'); }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Bu gideri silmek istiyor musunuz?')) return;
    try { await deleteExpense(id); load(); } catch { alert('Silinemedi!'); }
  };

  const handleAidatUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateAidatConfig({ ...config, ...aidatForm, amount: parseFloat(aidatForm.amount), dueDay: parseInt(aidatForm.dueDay) });
      setShowAidatForm(false);
      load();
    } catch { alert('Güncellenemedi!'); }
  };

  const handleNewMonth = async () => {
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthName = `${months[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;
    if (!confirm(`${monthName} için yeni aidat dönemi başlatılsın mı? Tüm kullanıcıların ödeme durumu sıfırlanacak.`)) return;
    try {
      await startNewMonth(monthName);
      alert(`${monthName} aidatları başlatıldı ve duyuru oluşturuldu!`);
      load();
    } catch { alert('Hata!'); }
  };

  const pieData = expenses.map(e => ({ name: e.label || e.category, value: e.amount }));

  if (loading) return <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-400">Yükleniyor...</p></div>;

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mali Durum</h1>
            <p className="text-slate-500 mt-1">Apartman gelir-gider takibi</p>
          </div>
          {canEdit && (
            <div className="flex gap-3">
              <button onClick={() => setShowAidatForm(!showAidatForm)}
                className="border border-blue-200 text-blue-600 px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold hover:bg-blue-50 transition text-sm">
                <Edit2 size={16} /> Aidat Takvimi
              </button>
              <button onClick={handleNewMonth}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition text-sm">
                <Plus size={16} /> Yeni Ay Başlat
              </button>
            </div>
          )}
        </div>

        {showAidatForm && canEdit && (
          <form onSubmit={handleAidatUpdate} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-6">
            <h3 className="font-bold text-slate-800 mb-4">Aidat Takvimi Düzenle</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Dönem</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                  value={aidatForm.currentMonth} onChange={e => setAidatForm({...aidatForm, currentMonth: e.target.value})} placeholder="Mart 2026" /></div>
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Son Ödeme Günü</label>
                <input type="number" min="1" max="31" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                  value={aidatForm.dueDay} onChange={e => setAidatForm({...aidatForm, dueDay: e.target.value})} /></div>
              <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Aidat Tutarı (₺)</label>
                <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                  value={aidatForm.amount} onChange={e => setAidatForm({...aidatForm, amount: e.target.value})} /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><Check size={16} /> Kaydet</button>
              <button type="button" onClick={() => setShowAidatForm(false)} className="border border-slate-200 text-slate-600 px-5 py-2 rounded-xl text-sm hover:bg-slate-50"><X size={16} /></button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-green-50 rounded-xl"><TrendingUp size={20} className="text-green-500" /></div>
              <span className="text-sm text-slate-500">Toplam Gelir</span>
            </div>
            <p className="text-2xl font-bold text-green-600">₺{totalIncome.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-red-50 rounded-xl"><TrendingDown size={20} className="text-red-500" /></div>
              <span className="text-sm text-slate-500">Toplam Gider</span>
            </div>
            <p className="text-2xl font-bold text-red-500">₺{totalExpenses.toLocaleString('tr-TR')}</p>
          </div>
          <div className={`rounded-2xl p-5 shadow-sm border ${netBalance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${netBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <DollarSign size={20} className={netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'} />
              </div>
              <span className="text-sm text-slate-500">Net Bakiye</span>
            </div>
            <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netBalance >= 0 ? '+' : ''}₺{netBalance.toLocaleString('tr-TR')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Genel Giderler</h3>
              {canEdit && (
                <button onClick={() => setShowExpenseForm(!showExpenseForm)}
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-xl transition">
                  <Plus size={18} />
                </button>
              )}
            </div>

            {showExpenseForm && canEdit && (
              <form onSubmit={handleAddExpense} className="mb-4 p-4 bg-slate-50 rounded-xl space-y-3">
                <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                  value={expForm.label} onChange={e => setExpForm({...expForm, label: e.target.value})} required placeholder="Gider adı (örn: Çevre temizliği)" />
                <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                  value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} required placeholder="Tutar (₺)" />
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold">Ekle</button>
                  <button type="button" onClick={() => setShowExpenseForm(false)} className="border border-slate-200 text-slate-600 px-4 py-1.5 rounded-lg text-sm">İptal</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {expenses.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Henüz gider yok</p>
              ) : expenses.map(e => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-slate-600 text-sm">{e.label || e.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">₺{e.amount.toLocaleString('tr-TR')}</span>
                    {canEdit && (
                      <button onClick={() => handleDeleteExpense(e.id)} className="text-slate-300 hover:text-red-400 transition"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4">Gider Dağılımı</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₺${v.toLocaleString('tr-TR')}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Gider girilmemiş</div>
            )}
          </div>
        </div>

        {config && (
          <div className="mt-6 bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <h3 className="font-bold text-slate-800 mb-2">Aidat Bilgileri</h3>
            <div className="flex gap-6 text-sm">
              <div><span className="text-slate-500">Dönem:</span> <span className="font-semibold">{config.currentMonth}</span></div>
              <div><span className="text-slate-500">Son Ödeme:</span> <span className="font-semibold">{config.dueDay}. gün</span></div>
              <div><span className="text-slate-500">Aidat:</span> <span className="font-semibold">₺{config.amount?.toLocaleString('tr-TR') || 'Giderlerden hesaplanır'}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default FinancialManagement;
