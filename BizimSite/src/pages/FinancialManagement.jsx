import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Edit2, Check, X, CalendarDays, RotateCcw, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getExpenses, createExpense, deleteExpense, getPayments, getAidatConfig, updateAidatConfig, startNewMonth, rollbackMonth } from '../services/api';

const COLORS = ['#3B82F6','#8B5CF6','#F59E0B','#10B981','#EF4444','#06B6D4'];

const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const EXPENSE_CATEGORIES = [
  { value: 'elektrik',  label: 'Elektrik',        color: 'bg-yellow-100 text-yellow-700' },
  { value: 'su',        label: 'Su',               color: 'bg-blue-100 text-blue-700' },
  { value: 'dogalgaz',  label: 'Doğalgaz',         color: 'bg-orange-100 text-orange-700' },
  { value: 'temizlik',  label: 'Temizlik',          color: 'bg-green-100 text-green-700' },
  { value: 'asansor',   label: 'Asansör Bakımı',   color: 'bg-indigo-100 text-indigo-700' },
  { value: 'guvenlik',  label: 'Güvenlik',          color: 'bg-red-100 text-red-700' },
  { value: 'bahce',     label: 'Bahçe Bakımı',     color: 'bg-lime-100 text-lime-700' },
  { value: 'tamirat',   label: 'Tamirat/Bakım',    color: 'bg-rose-100 text-rose-700' },
  { value: 'general',   label: 'Genel Giderler',   color: 'bg-slate-100 text-slate-600' },
  { value: 'diger',     label: 'Diğer',             color: 'bg-gray-100 text-gray-600' },
];

const getCatInfo = (val) =>
  EXPENSE_CATEGORIES.find(c => c.value === val) || { label: val, color: 'bg-slate-100 text-slate-600' };

const FinancialManagement = ({ isAdmin }) => {
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [config, setConfig] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showAidatForm, setShowAidatForm] = useState(false);
  const [showNewMonthModal, setShowNewMonthModal] = useState(false);
  const [expForm, setExpForm] = useState({ label: '', amount: '', category: 'general' });
  const [aidatForm, setAidatForm] = useState({ dueDay: 1, amount: 0, currentMonth: '' });
  const [newMonthForm, setNewMonthForm] = useState({ monthName: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Yeni ay modal'ını açınca varsayılan değerleri doldur
  const openNewMonthModal = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthName = `${MONTHS[next.getMonth()]} ${next.getFullYear()}`;
    const startDefault = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2,'0')}-01`;
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    const endDefault = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2,'0')}-${lastDay}`;
    setNewMonthForm({ monthName, startDate: startDefault, endDate: endDefault });
    setShowNewMonthModal(true);
  };

  // Mevcut aidat dönemine göre filtrele (dönem yoksa tüm kayıtlar)
  const periodStart = config?.periodStartDate ? new Date(config.periodStartDate) : null;
  const periodEnd   = config?.periodEndDate   ? new Date(new Date(config.periodEndDate).setHours(23, 59, 59, 999)) : null;

  const inPeriod = (dateStr) => {
    if (!periodStart || !periodEnd) return true;
    const d = new Date(dateStr);
    return d >= periodStart && d <= periodEnd;
  };

  const periodExpenses = expenses.filter(e => inPeriod(e.createdAt));
  const periodPayments = payments.filter(p => inPeriod(p.paidAt));

  const totalExpenses = periodExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome   = periodPayments.reduce((s, p) => s + p.amount, 0);
  const netBalance    = totalIncome - totalExpenses;

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await createExpense({ category: expForm.category, label: expForm.label, amount: parseFloat(expForm.amount) });
      setExpForm({ label: '', amount: '', category: 'general' });
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

  const handleNewMonth = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await startNewMonth({
        monthName: newMonthForm.monthName,
        startDate: newMonthForm.startDate ? new Date(newMonthForm.startDate).toISOString() : null,
        endDate: newMonthForm.endDate ? new Date(newMonthForm.endDate).toISOString() : null,
      });
      setShowNewMonthModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async () => {
    if (!config?.previousMonth) return;
    if (!confirm(`"${config.previousMonth}" dönemine geri dönmek istediğinizden emin misiniz? Mevcut dönem silinecek.`)) return;
    try {
      await rollbackMonth();
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Geri alınamadı!');
    }
  };

  const pieData = periodExpenses.map(e => ({ name: e.label || e.category, value: e.amount }));

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : '—';

  if (loading) return <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-400">Yükleniyor...</p></div>;

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mali Durum</h1>
            <p className="text-slate-500 mt-1">
              {config?.currentMonth ? (
                <>Dönem: <span className="font-semibold text-blue-600">{config.currentMonth}</span></>
              ) : 'Apartman gelir-gider takibi'}
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-3">
              {config?.previousMonth && (
                <button onClick={handleRollback}
                  className="border border-orange-300 text-orange-600 px-4 py-2.5 rounded-xl inline-flex items-center gap-2 font-semibold hover:bg-orange-50 active:scale-95 transition-all duration-150 text-sm">
                  <RotateCcw size={16} /> Geri Al ({config.previousMonth})
                </button>
              )}
              <button onClick={() => setShowAidatForm(!showAidatForm)}
                className="btn-outline-blue text-sm">
                <Edit2 size={16} /> Aidat Takvimi
              </button>
              <button onClick={openNewMonthModal}
                className="btn-success text-sm">
                <CalendarDays size={16} /> Yeni Ay Başlat
              </button>
            </div>
          )}
        </div>

        {/* Aidat Güncelleme Formu */}
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
              <button type="submit" className="btn-primary text-sm py-2 px-5"><Check size={16} /> Kaydet</button>
              <button type="button" onClick={() => setShowAidatForm(false)} className="btn-secondary text-sm py-2 px-5"><X size={16} /></button>
            </div>
          </form>
        )}

        {/* Özet Kartlar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="stat-card group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-green-50 rounded-xl group-hover:scale-110 transition-transform duration-200"><TrendingUp size={20} className="text-green-500" /></div>
              <span className="text-sm text-slate-500">Toplam Gelir</span>
            </div>
            <p className="text-2xl font-bold text-green-600">₺{totalIncome.toLocaleString('tr-TR')}</p>
          </div>
          <div className="stat-card group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-red-50 rounded-xl group-hover:scale-110 transition-transform duration-200"><TrendingDown size={20} className="text-red-500" /></div>
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
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori</label>
                  <select className="input-field text-sm"
                    value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})}>
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Açıklama</label>
                  <input className="input-field text-sm"
                    value={expForm.label} onChange={e => setExpForm({...expForm, label: e.target.value})} required placeholder="Gider açıklaması (örn: Çevre temizliği)" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tutar (₺)</label>
                  <input type="number" className="input-field text-sm"
                    value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} required placeholder="0" min="0" step="0.01" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="btn-primary text-sm py-1.5 px-4">Ekle</button>
                  <button type="button" onClick={() => setShowExpenseForm(false)} className="btn-secondary text-sm py-1.5 px-4">İptal</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {periodExpenses.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Bu dönemde gider yok</p>
              ) : periodExpenses.map(e => {
                const catInfo = getCatInfo(e.category);
                return (
                  <div key={e.id} className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 px-1 rounded-lg transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${catInfo.color}`}>{catInfo.label}</span>
                      </div>
                      <p className="text-slate-700 text-sm font-medium leading-snug">{e.label || catInfo.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(e.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      <span className="font-bold text-sm text-slate-800">₺{e.amount.toLocaleString('tr-TR')}</span>
                      {canEdit && (
                        <button onClick={() => handleDeleteExpense(e.id)} className="text-slate-300 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                );
              })}
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
            <h3 className="font-bold text-slate-800 mb-2">Mevcut Aidat Dönemi</h3>
            <div className="flex flex-wrap gap-6 text-sm">
              <div><span className="text-slate-500">Dönem:</span> <span className="font-semibold">{config.currentMonth || '—'}</span></div>
              <div><span className="text-slate-500">Başlangıç:</span> <span className="font-semibold">{formatDate(config.periodStartDate)}</span></div>
              <div><span className="text-slate-500">Bitiş:</span> <span className="font-semibold">{formatDate(config.periodEndDate)}</span></div>
              <div><span className="text-slate-500">Son Ödeme Günü:</span> <span className="font-semibold">{config.dueDay}. gün</span></div>
              <div><span className="text-slate-500">Aidat:</span> <span className="font-semibold">₺{config.amount?.toLocaleString('tr-TR') || '—'}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Yeni Ay Modal */}
      {showNewMonthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl"><CalendarDays size={20} className="text-green-600" /></div>
                <h2 className="text-lg font-bold text-slate-800">Yeni Aidat Dönemi Başlat</h2>
              </div>
              <button onClick={() => setShowNewMonthModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleNewMonth} className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">Bu işlem tüm sakinlerin ödeme durumunu sıfırlar ve otomatik duyuru oluşturur.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Dönem Adı</label>
                <input
                  type="text"
                  required
                  value={newMonthForm.monthName}
                  onChange={e => setNewMonthForm({...newMonthForm, monthName: e.target.value})}
                  placeholder="Örn: Nisan 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    value={newMonthForm.startDate}
                    onChange={e => setNewMonthForm({...newMonthForm, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={newMonthForm.endDate}
                    onChange={e => setNewMonthForm({...newMonthForm, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 btn-success text-sm justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Başlatılıyor...</> : <><Check size={16} /> Dönemi Başlat</>}
                </button>
                <button type="button" onClick={() => setShowNewMonthModal(false)}
                  className="btn-secondary text-sm px-5">
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FinancialManagement;
