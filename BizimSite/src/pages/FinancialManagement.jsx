import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Edit2, Check, X, CalendarDays, RotateCcw, AlertTriangle, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getExpenses, createExpense, deleteExpense, getPayments, getAidatConfig, updateAidatConfig, startNewMonth, rollbackMonth } from '../services/api';

const COLORS = ['#3B82F6','#8B5CF6','#F59E0B','#10B981','#EF4444','#06B6D4'];

const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const EXPENSE_CATEGORIES = [
  { value: 'elektrik',  label: 'Elektrik',       color: 'bg-yellow-100 text-yellow-700' },
  { value: 'su',        label: 'Su',              color: 'bg-blue-100 text-blue-700' },
  { value: 'dogalgaz',  label: 'Doğalgaz',        color: 'bg-orange-100 text-orange-700' },
  { value: 'temizlik',  label: 'Temizlik',         color: 'bg-green-100 text-green-700' },
  { value: 'asansor',   label: 'Asansör Bakımı',  color: 'bg-indigo-100 text-indigo-700' },
  { value: 'guvenlik',  label: 'Güvenlik',         color: 'bg-red-100 text-red-700' },
  { value: 'bahce',     label: 'Bahçe Bakımı',    color: 'bg-lime-100 text-lime-700' },
  { value: 'tamirat',   label: 'Tamirat/Bakım',   color: 'bg-rose-100 text-rose-700' },
  { value: 'general',   label: 'Genel Giderler',  color: 'bg-slate-100 text-slate-600' },
  { value: 'diger',     label: 'Diğer',            color: 'bg-gray-100 text-gray-600' },
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
  const [showActions, setShowActions] = useState(false);
  const [expForm, setExpForm] = useState({ label: '', amount: '', category: 'general' });
  const [aidatForm, setAidatForm] = useState({ dueDay: 1, amount: 0, currentMonth: '' });
  const [newMonthForm, setNewMonthForm] = useState({ monthName: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const canEdit = currentUser.role === 'admin';
  const aidatFormRef   = useRef(null);
  const expenseFormRef = useRef(null);

  // Aidat formu açılınca kaydır
  useEffect(() => {
    if (showAidatForm && aidatFormRef.current) {
      setTimeout(() => aidatFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [showAidatForm]);

  // Gider formu açılınca kaydır
  useEffect(() => {
    if (showExpenseForm && expenseFormRef.current) {
      setTimeout(() => expenseFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  }, [showExpenseForm]);

  const load = () => {
    Promise.all([getExpenses(), getPayments(), getAidatConfig()]).then(([e, p, c]) => {
      setExpenses(e.data);
      setPayments(p.data);
      setConfig(c.data);
      if (c.data) setAidatForm({ dueDay: c.data.dueDay, amount: c.data.amount, currentMonth: c.data.currentMonth });
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNewMonthModal = () => {
    const now  = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthName   = `${MONTHS[next.getMonth()]} ${next.getFullYear()}`;
    const startDefault = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-01`;
    const lastDay      = new Date(next.getFullYear(), next.getMonth()+1, 0).getDate();
    const endDefault   = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${lastDay}`;
    setNewMonthForm({ monthName, startDate: startDefault, endDate: endDefault });
    setShowNewMonthModal(true);
    setShowActions(false);
  };

  const periodStart = config?.periodStartDate ? new Date(config.periodStartDate) : null;
  const periodEnd   = config?.periodEndDate   ? new Date(new Date(config.periodEndDate).setHours(23,59,59,999)) : null;

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
        monthName:  newMonthForm.monthName,
        startDate:  newMonthForm.startDate ? new Date(newMonthForm.startDate).toISOString() : null,
        endDate:    newMonthForm.endDate   ? new Date(newMonthForm.endDate).toISOString()   : null,
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
    try { await rollbackMonth(); load(); }
    catch (err) { alert(err.response?.data?.message || 'Geri alınamadı!'); }
  };

  const pieData = periodExpenses.map(e => ({ name: e.label || e.category, value: e.amount }));
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : '—';

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-400">Yükleniyor...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-4 md:mb-8 gap-3">
          <div className="min-w-0">
            <h1 className="text-lg md:text-3xl font-bold text-slate-800">Mali Durum</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              {config?.currentMonth
                ? <span>Dönem: <span className="font-semibold text-blue-600">{config.currentMonth}</span></span>
                : 'Apartman gelir-gider takibi'}
            </p>
          </div>

          {canEdit && (
            <>
              {/* Masaüstü butonlar */}
              <div className="hidden sm:flex gap-2 flex-shrink-0 flex-wrap justify-end">
                {config?.previousMonth && (
                  <button onClick={handleRollback}
                    className="border border-orange-300 text-orange-600 px-3 py-2 rounded-xl inline-flex items-center gap-1.5 font-semibold hover:bg-orange-50 active:scale-95 transition-all duration-150 text-xs md:text-sm">
                    <RotateCcw size={14} />
                    <span className="hidden md:inline">Geri Al ({config.previousMonth})</span>
                    <span className="md:hidden">Geri Al</span>
                  </button>
                )}
                <button onClick={() => setShowAidatForm(!showAidatForm)} className="btn-outline-blue text-xs md:text-sm py-2 px-3">
                  <Edit2 size={14} /> <span className="hidden md:inline">Aidat Takvimi</span><span className="md:hidden">Takvim</span>
                </button>
                <button onClick={openNewMonthModal} className="btn-success text-xs md:text-sm py-2 px-3">
                  <CalendarDays size={14} /> <span className="hidden md:inline">Yeni Ay Başlat</span><span className="md:hidden">Yeni Ay</span>
                </button>
              </div>

              {/* Mobil açılır menü */}
              <div className="sm:hidden relative flex-shrink-0">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-3 py-2 rounded-xl transition active:scale-95"
                >
                  İşlemler <ChevronDown size={15} className={`transition-transform ${showActions ? 'rotate-180' : ''}`} />
                </button>
                {showActions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                    <div className="absolute right-0 top-10 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 w-52 flex flex-col gap-1">
                      <button onClick={() => { setShowAidatForm(!showAidatForm); setShowActions(false); }}
                        className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl px-3 py-2.5 transition">
                        <Edit2 size={15} className="text-blue-500" /> Aidat Takvimi
                      </button>
                      <button onClick={openNewMonthModal}
                        className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl px-3 py-2.5 transition">
                        <CalendarDays size={15} className="text-green-500" /> Yeni Ay Başlat
                      </button>
                      {config?.previousMonth && (
                        <button onClick={() => { handleRollback(); setShowActions(false); }}
                          className="flex items-center gap-2 text-sm text-orange-600 hover:bg-orange-50 rounded-xl px-3 py-2.5 transition">
                          <RotateCcw size={15} /> Geri Al
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Aidat Güncelleme Formu ── */}
        {showAidatForm && canEdit && (
          <form ref={aidatFormRef} onSubmit={handleAidatUpdate} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 md:p-6 mb-4">
            <h3 className="font-bold text-slate-800 mb-4 text-sm md:text-base">Aidat Takvimi Düzenle</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Dönem</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                  value={aidatForm.currentMonth} onChange={e => setAidatForm({...aidatForm, currentMonth: e.target.value})} placeholder="Mart 2026" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Son Ödeme Günü</label>
                <input type="number" min="1" max="31" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                  value={aidatForm.dueDay} onChange={e => setAidatForm({...aidatForm, dueDay: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Aidat Tutarı (₺)</label>
                <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                  value={aidatForm.amount} onChange={e => setAidatForm({...aidatForm, amount: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn-primary text-sm py-2 px-4"><Check size={15} /> Kaydet</button>
              <button type="button" onClick={() => setShowAidatForm(false)} className="btn-secondary text-sm py-2 px-4"><X size={15} /></button>
            </div>
          </form>
        )}

        {/* ── Özet Kartlar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 md:mb-6">
          <div className="stat-card group">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-green-50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <TrendingUp size={18} className="text-green-500" />
              </div>
              <span className="text-sm text-slate-500">Toplam Gelir</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-green-600">₺{totalIncome.toLocaleString('tr-TR')}</p>
          </div>
          <div className="stat-card group">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-red-50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <TrendingDown size={18} className="text-red-500" />
              </div>
              <span className="text-sm text-slate-500">Toplam Gider</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-red-500">₺{totalExpenses.toLocaleString('tr-TR')}</p>
          </div>
          <div className={`rounded-2xl p-4 md:p-5 shadow-sm border ${netBalance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`p-2 rounded-xl ${netBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <DollarSign size={18} className={netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'} />
              </div>
              <span className="text-sm text-slate-500">Net Bakiye</span>
            </div>
            <p className={`text-xl md:text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netBalance >= 0 ? '+' : ''}₺{netBalance.toLocaleString('tr-TR')}
            </p>
          </div>
        </div>

        {/* ── Giderler & Grafik ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Genel Giderler */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Genel Giderler</h3>
              {canEdit && (
                <button onClick={() => setShowExpenseForm(!showExpenseForm)}
                  className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-xl transition">
                  <Plus size={17} />
                </button>
              )}
            </div>

            {showExpenseForm && canEdit && (
              <form ref={expenseFormRef} onSubmit={handleAddExpense} className="mb-4 p-3 bg-slate-50 rounded-xl space-y-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori</label>
                  <select className="input-field text-sm"
                    value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})}>
                    {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Açıklama</label>
                  <input className="input-field text-sm"
                    value={expForm.label} onChange={e => setExpForm({...expForm, label: e.target.value})}
                    required placeholder="Gider açıklaması" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tutar (₺)</label>
                  <input type="number" className="input-field text-sm"
                    value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})}
                    required placeholder="0" min="0" step="0.01" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="btn-primary text-xs py-1.5 px-3">Ekle</button>
                  <button type="button" onClick={() => setShowExpenseForm(false)} className="btn-secondary text-xs py-1.5 px-3">İptal</button>
                </div>
              </form>
            )}

            <div className="space-y-1">
              {periodExpenses.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">Bu dönemde gider yok</p>
              ) : periodExpenses.map(e => {
                const catInfo = getCatInfo(e.category);
                return (
                  <div key={e.id} className="flex items-start justify-between py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 px-1 rounded-lg transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${catInfo.color}`}>{catInfo.label}</span>
                      </div>
                      <p className="text-slate-700 text-sm font-medium leading-snug truncate">{e.label || catInfo.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(e.createdAt).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="font-bold text-sm text-slate-800">₺{e.amount.toLocaleString('tr-TR')}</span>
                      {canEdit && (
                        <button onClick={() => handleDeleteExpense(e.id)}
                          className="text-slate-300 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-50">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gider Dağılımı Pasta Grafik */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
            <h3 className="font-bold text-slate-800 mb-3 text-sm md:text-base">Gider Dağılımı</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      outerRadius={75}
                      dataKey="value"
                      label={({percent}) => `${(percent*100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `₺${v.toLocaleString('tr-TR')}`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Lejant */}
                <div className="mt-3 space-y-1.5">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-600 truncate">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800 ml-2 flex-shrink-0">₺{item.value.toLocaleString('tr-TR')}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Gider girilmemiş</div>
            )}
          </div>
        </div>

        {/* ── Aidat Dönemi Bilgisi ── */}
        {config && (
          <div className="mt-4 bg-blue-50 rounded-2xl p-4 md:p-5 border border-blue-100">
            <h3 className="font-bold text-slate-800 mb-2 text-sm md:text-base">Mevcut Aidat Dönemi</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-y-2 gap-x-5 text-sm">
              <div><span className="text-slate-500 text-xs">Dönem:</span><br/><span className="font-semibold text-slate-800">{config.currentMonth || '—'}</span></div>
              <div><span className="text-slate-500 text-xs">Başlangıç:</span><br/><span className="font-semibold text-slate-800">{formatDate(config.periodStartDate)}</span></div>
              <div><span className="text-slate-500 text-xs">Bitiş:</span><br/><span className="font-semibold text-slate-800">{formatDate(config.periodEndDate)}</span></div>
              <div><span className="text-slate-500 text-xs">Son Ödeme:</span><br/><span className="font-semibold text-slate-800">{config.dueDay}. gün</span></div>
              <div><span className="text-slate-500 text-xs">Aidat:</span><br/><span className="font-semibold text-slate-800">₺{config.amount?.toLocaleString('tr-TR') || '—'}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* ── Yeni Ay Modal ── */}
      {showNewMonthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl"><CalendarDays size={18} className="text-green-600" /></div>
                <h2 className="text-base md:text-lg font-bold text-slate-800">Yeni Aidat Dönemi</h2>
              </div>
              <button onClick={() => setShowNewMonthModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleNewMonth} className="p-4 md:p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <AlertTriangle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">Bu işlem tüm sakinlerin ödeme durumunu sıfırlar ve otomatik duyuru oluşturur.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Dönem Adı</label>
                <input type="text" required value={newMonthForm.monthName}
                  onChange={e => setNewMonthForm({...newMonthForm, monthName: e.target.value})}
                  placeholder="Örn: Nisan 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Başlangıç</label>
                  <input type="date" value={newMonthForm.startDate}
                    onChange={e => setNewMonthForm({...newMonthForm, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Bitiş</label>
                  <input type="date" value={newMonthForm.endDate}
                    onChange={e => setNewMonthForm({...newMonthForm, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 btn-success text-sm justify-center disabled:opacity-60">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Başlatılıyor...</>
                    : <><Check size={15} /> Dönemi Başlat</>}
                </button>
                <button type="button" onClick={() => setShowNewMonthModal(false)} className="btn-secondary text-sm px-5">İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FinancialManagement;
