import React, { useState, useEffect } from 'react';
import { Save, TrendingDown, TrendingUp, Wallet, Eye, EyeOff, PieChart, Plus, Trash2, ChevronDown, ChevronUp, Calendar, Bell, RotateCcw, PlusCircle, MinusCircle } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#10b981', '#ef4444', '#f97316'];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const FinancialManagement = ({ isAdmin = true }) => {
  const [tab, setTab] = useState('mali');
  const [expenses, setExpenses] = useState({ elevator: 0, doorman: 0, electricity: 0, general: 0 });
  const [generalItems, setGeneralItems] = useState([]);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [generalExpanded, setGeneralExpanded] = useState(false);
  const [showAddGeneral, setShowAddGeneral] = useState(false);
  const [newGeneral, setNewGeneral] = useState({ label: '', amount: '' });

  // Aidat takvimi state
  const now = new Date();
  const defaultConfig = {
    dueDay: 1,
    month: now.getMonth(),
    year: now.getFullYear(),
    active: true
  };
  const [aidatConfig, setAidatConfig] = useState(defaultConfig);
  const [configSaved, setConfigSaved] = useState('');

  useEffect(() => {
    setExpenses(JSON.parse(localStorage.getItem('expenses')) || { elevator: 0, doorman: 0, electricity: 0, general: 0 });
    setGeneralItems(JSON.parse(localStorage.getItem('generalExpenseItems')) || []);
    setUsers(JSON.parse(localStorage.getItem('users')) || []);
    const cfg = JSON.parse(localStorage.getItem('aidatConfig'));
    if (cfg) setAidatConfig(cfg);
  }, []);

  const handleSave = () => {
    const totalGeneral = generalItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const updatedExpenses = { ...expenses, general: totalGeneral };
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    localStorage.setItem('generalExpenseItems', JSON.stringify(generalItems));
    setExpenses(updatedExpenses);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const addGeneralItem = () => {
    if (!newGeneral.label || !newGeneral.amount) return;
    const item = { id: Date.now(), label: newGeneral.label, amount: parseFloat(newGeneral.amount) || 0 };
    setGeneralItems([...generalItems, item]);
    setNewGeneral({ label: '', amount: '' });
    setShowAddGeneral(false);
  };

  const saveAidatConfig = () => {
    localStorage.setItem('aidatConfig', JSON.stringify(aidatConfig));
    setConfigSaved('takvim');
    setTimeout(() => setConfigSaved(''), 2500);
  };

  // Yeni ay aidatı başlat: tüm kullanıcıların paid=false, bildirim gönder
  const startNewMonth = () => {
    const newMonth = aidatConfig.month;
    const newYear = aidatConfig.year;
    const monthLabel = MONTHS[newMonth] + ' ' + newYear;

    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const resetUsers = allUsers.map(u => ({ ...u, paid: false }));
    localStorage.setItem('users', JSON.stringify(resetUsers));
    setUsers(resetUsers);

    // Bildirim mesajı gönder
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const generalItems2 = JSON.parse(localStorage.getItem('generalExpenseItems')) || [];
    const expData = JSON.parse(localStorage.getItem('expenses')) || expenses;
    const genTotal = generalItems2.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const total2 = Object.values({ ...expData, general: genTotal }).reduce((a, b) => a + b, 0);
    const perPerson = Math.round(total2 / (allUsers.length || 1));

    allUsers.forEach(u => {
      notifications.push({
        id: Date.now() + Math.random(),
        userId: u.id,
        userEmail: u.email,
        message: monthLabel + ' dönemi aidat ödemesi başladı. Son ödeme günü: her ayın ' + aidatConfig.dueDay + '. günü. Aidat tutarı: ₺' + perPerson.toLocaleString('tr-TR'),
        date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        read: false,
        type: 'aidat'
      });
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Duyuru ekle
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    const announcementMsg = { id: Date.now() + 1, title: monthLabel + ' Aidat Bildirimi', content: 'Bu ay aidat odemeleri baslamistir. Tutar: ₺' + perPerson.toLocaleString('tr-TR') + ' | Son odeme gunu: Her ayin ' + aidatConfig.dueDay + '. gunu.', priority: 'important', date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), author: 'Yonetim' };
    localStorage.setItem('announcements', JSON.stringify([announcementMsg, ...announcements]));

    // Takvimi kaydet
    localStorage.setItem('aidatConfig', JSON.stringify(aidatConfig));

    setConfigSaved('yeni-ay');
    setTimeout(() => setConfigSaved(''), 3000);
  };

  // Geçmiş ayın ödeme kayıtlarını temizle
  const clearPastMonth = () => {
    const prevMonth = aidatConfig.month === 0 ? 11 : aidatConfig.month - 1;
    const prevYear = aidatConfig.month === 0 ? aidatConfig.year - 1 : aidatConfig.year;
    const prevLabel = MONTHS[prevMonth] + ' ' + prevYear;

    const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
    const filtered2 = history.filter(p => !p.description?.includes(prevLabel));
    localStorage.setItem('paymentHistory', JSON.stringify(filtered2));

    setConfigSaved('temizle');
    setTimeout(() => setConfigSaved(''), 2500);
  };

  const generalTotal = generalItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  const fixedExpenses = { elevator: expenses.elevator, doorman: expenses.doorman, electricity: expenses.electricity };
  const fixedTotal = Object.values(fixedExpenses).reduce((a, b) => a + b, 0);
  const total = fixedTotal + generalTotal;
  const paidCount = users.filter(u => u.paid).length;
  const monthlyAidat = Math.round(total / (users.length || 1));
  const totalCollection = paidCount * monthlyAidat;
  const netBalance = totalCollection - total;

  const fixedItems = [
    { key: 'elevator', label: 'Asansör Bakımı', icon: '🛗', color: 'blue' },
    { key: 'doorman', label: 'Kapıcı Ücreti', icon: '🏠', color: 'purple' },
    { key: 'electricity', label: 'Ortak Alan Elektriği', icon: '⚡', color: 'amber' },
  ];
  const allPieData = [
    ...fixedItems.filter(i => fixedExpenses[i.key] > 0).map(i => ({ name: i.label, value: fixedExpenses[i.key] })),
    ...(generalTotal > 0 ? [{ name: 'Genel Giderler', value: generalTotal }] : [])
  ];
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    amber: 'bg-amber-50 border-amber-100',
  };

  const currentMonthLabel = MONTHS[aidatConfig.month] + ' ' + aidatConfig.year;

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mali Durum</h1>
            <p className="text-slate-500 mt-1">Site gelir ve gider durumu</p>
          </div>
          {isAdmin && tab === 'mali' && (
            <button onClick={() => { setEditMode(!editMode); setShowAddGeneral(false); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium text-sm shadow-sm">
              {editMode ? <EyeOff size={16} /> : <Eye size={16} />}
              {editMode ? 'Görüntüle' : 'Düzenle'}
            </button>
          )}
        </div>

        {/* Sekmeler — sadece admin görür */}
        {isAdmin && (
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab('mali')}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${tab === 'mali' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              Mali Durum
            </button>
            <button onClick={() => setTab('takvim')}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${tab === 'takvim' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Calendar size={15} /> Aidat Takvimi
            </button>
          </div>
        )}

        {/* ===== MALİ DURUM SEKMESİ ===== */}
        {tab === 'mali' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown size={18} className="text-red-500" />
                  <span className="text-sm text-slate-500">Aylık Gider</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">₺{total.toLocaleString('tr-TR')}</p>
                <p className="text-xs text-slate-400 mt-1">{users.length} sakin üzerine paylaşılıyor</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={18} className="text-green-500" />
                  <span className="text-sm text-slate-500">Tahsilat</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">₺{totalCollection.toLocaleString('tr-TR')}</p>
                <p className="text-xs text-slate-400 mt-1">{paidCount}/{users.length} sakin ödedi</p>
              </div>
              <div className={`rounded-2xl p-5 shadow-sm border ${netBalance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Wallet size={18} className={netBalance >= 0 ? 'text-emerald-500' : 'text-red-500'} />
                  <span className="text-sm text-slate-500">Net Bakiye</span>
                </div>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {netBalance >= 0 ? '+' : ''}₺{netBalance.toLocaleString('tr-TR')}
                </p>
                <p className="text-xs text-slate-400 mt-1">{netBalance >= 0 ? 'Fazla' : 'Açık'}</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-bold text-slate-800 mb-5">Gider Kalemleri</h2>
                <div className="space-y-3">
                  {fixedItems.map(({ key, label, icon, color }) => (
                    <div key={key} className={`flex items-center justify-between p-4 rounded-xl border ${colorClasses[color]}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{icon}</span>
                        <span className="font-medium text-sm text-slate-700">{label}</span>
                      </div>
                      {editMode && isAdmin ? (
                        <input type="number" min="0" value={expenses[key]}
                          onChange={(e) => setExpenses({ ...expenses, [key]: parseFloat(e.target.value) || 0 })}
                          className="w-28 text-right px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-sm font-semibold bg-white" />
                      ) : (
                        <span className="font-bold text-slate-800">₺{expenses[key].toLocaleString('tr-TR')}</span>
                      )}
                    </div>
                  ))}

                  {/* Genel Giderler accordion */}
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50 overflow-hidden">
                    <button onClick={() => setGeneralExpanded(!generalExpanded)}
                      className="w-full flex items-center justify-between p-4 hover:bg-cyan-100/50 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📋</span>
                        <span className="font-medium text-sm text-slate-700">Genel Giderler</span>
                        {generalItems.length > 0 && (
                          <span className="text-xs bg-cyan-200 text-cyan-800 px-2 py-0.5 rounded-full font-semibold">{generalItems.length} kalem</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800">₺{generalTotal.toLocaleString('tr-TR')}</span>
                        {generalExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                      </div>
                    </button>
                    {generalExpanded && (
                      <div className="px-4 pb-4 border-t border-cyan-100">
                        {generalItems.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {generalItems.map((item) => (
                              <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100">
                                <span className="text-sm text-slate-700">{item.label}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold text-slate-800">₺{parseFloat(item.amount).toLocaleString('tr-TR')}</span>
                                  {isAdmin && editMode && (
                                    <button onClick={() => setGeneralItems(generalItems.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-600 transition">
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 mt-3 text-center">Henüz genel gider eklenmedi</p>
                        )}
                        {isAdmin && editMode && (
                          <div className="mt-3">
                            {showAddGeneral ? (
                              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                                <input type="text" placeholder="Gider açıklaması..." value={newGeneral.label}
                                  onChange={e => setNewGeneral({ ...newGeneral, label: e.target.value })}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400" />
                                <input type="number" placeholder="Tutar (₺)" value={newGeneral.amount}
                                  onChange={e => setNewGeneral({ ...newGeneral, amount: e.target.value })}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400" />
                                <div className="flex gap-2">
                                  <button onClick={addGeneralItem} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm font-semibold transition">Ekle</button>
                                  <button onClick={() => { setShowAddGeneral(false); setNewGeneral({ label: '', amount: '' }); }}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-sm font-semibold transition">İptal</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setShowAddGeneral(true)}
                                className="w-full flex items-center justify-center gap-2 mt-2 py-2 border-2 border-dashed border-cyan-300 rounded-lg text-cyan-600 hover:border-cyan-500 hover:bg-cyan-50 transition text-sm font-semibold">
                                <Plus size={16} /> Yeni Gider Ekle
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-slate-800 text-white px-4 py-3.5 rounded-xl mt-4">
                    <span className="font-bold">Toplam</span>
                    <span className="font-bold text-lg">₺{total.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                {editMode && isAdmin && (
                  <button onClick={handleSave} className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition">
                    <Save size={18} /> Kaydet
                  </button>
                )}
                {saved && <div className="mt-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium text-center">✓ Kaydedildi</div>}
              </div>

              <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <PieChart size={16} className="text-slate-400" /> Dağılım
                </h2>
                {allPieData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-400 text-sm">Gider verisi yok</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <RechartsPie>
                      <Pie data={allPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                        {allPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `₺${v.toLocaleString('tr-TR')}`} />
                      <Legend iconType="circle" iconSize={8} />
                    </RechartsPie>
                  </ResponsiveContainer>
                )}
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <p className="text-xs text-slate-500 text-center">Kişi başına düşen aidat</p>
                  <p className="text-2xl font-bold text-blue-600 text-center mt-1">₺{monthlyAidat.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== AİDAT TAKVİMİ SEKMESİ ===== */}
        {tab === 'takvim' && isAdmin && (
          <div className="space-y-6">
            {/* Mevcut durum kartı */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm mb-1">Aktif Aidat Dönemi</p>
                  <h2 className="text-2xl font-bold">{currentMonthLabel}</h2>
                  <p className="text-blue-200 text-sm mt-1">Son ödeme günü: Her ayın {aidatConfig.dueDay}. günü</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-200 text-sm">Ödeme Durumu</p>
                  <p className="text-3xl font-bold">{paidCount}/{users.length}</p>
                  <p className="text-blue-200 text-sm">sakin ödedi</p>
                </div>
              </div>
            </div>

            {/* Takvim ayarları */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" /> Takvim Ayarları
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Aidat Ayı</label>
                  <select value={aidatConfig.month}
                    onChange={e => setAidatConfig({ ...aidatConfig, month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-medium">
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Yıl</label>
                  <select value={aidatConfig.year}
                    onChange={e => setAidatConfig({ ...aidatConfig, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-medium">
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Son Ödeme Günü</label>
                  <input type="number" min="1" max="31" value={aidatConfig.dueDay}
                    onChange={e => setAidatConfig({ ...aidatConfig, dueDay: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-medium" />
                </div>
              </div>
              <button onClick={saveAidatConfig}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition">
                <Save size={16} /> Takvimi Kaydet
              </button>
              {configSaved === 'takvim' && <p className="mt-2 text-green-600 text-sm font-medium">✓ Takvim kaydedildi</p>}
            </div>

            {/* Hızlı Aksiyonlar */}
            <div className="grid grid-cols-2 gap-4">
              {/* Yeni ay başlat */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-green-50 rounded-xl"><PlusCircle size={22} className="text-green-600" /></div>
                  <div>
                    <h4 className="font-bold text-slate-800">Yeni Ay Aidatı Başlat</h4>
                    <p className="text-xs text-slate-500">Tüm ödeme durumları sıfırlanır, sakinlere bildirim gider</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-amber-700 font-medium">
                    ⚠ Bu işlem tüm sakinlerin ödeme durumunu <strong>ödenmedi</strong> olarak sıfırlar ve her birine bildirim gönderir.
                  </p>
                </div>
                <button onClick={startNewMonth}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-sm transition">
                  <Bell size={16} /> {currentMonthLabel} Aidatını Başlat
                </button>
                {configSaved === 'yeni-ay' && <p className="mt-2 text-green-600 text-sm font-medium text-center">✓ Aidatlar sıfırlandı, bildirimler gönderildi</p>}
              </div>

              {/* Geçmiş ayı temizle */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-red-50 rounded-xl"><MinusCircle size={22} className="text-red-500" /></div>
                  <div>
                    <h4 className="font-bold text-slate-800">Geçmiş Ayı Temizle</h4>
                    <p className="text-xs text-slate-500">Önceki ayın ödeme kayıtlarını siler</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-red-700 font-medium">
                    ⚠ Bu işlem önceki ayın ({MONTHS[aidatConfig.month === 0 ? 11 : aidatConfig.month - 1]} {aidatConfig.month === 0 ? aidatConfig.year - 1 : aidatConfig.year}) ödeme geçmişini siler. Geri alınamaz.
                  </p>
                </div>
                <button onClick={clearPastMonth}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-sm transition">
                  <RotateCcw size={16} /> Geçmiş Ayı Temizle
                </button>
                {configSaved === 'temizle' && <p className="mt-2 text-green-600 text-sm font-medium text-center">✓ Geçmiş ay kayıtları temizlendi</p>}
              </div>
            </div>

            {/* Bildirimler önizleme */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Bell size={16} className="text-blue-400" /> Gönderilecek Bildirim Önizlemesi
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 font-medium">
                  📢 {currentMonthLabel} dönemi aidat ödemesi başladı. Son ödeme günü: her ayın {aidatConfig.dueDay}. günü. Aidat tutarı: ₺{monthlyAidat.toLocaleString('tr-TR')}
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-2">Bu mesaj "Yeni Ay Aidatını Başlat" butonuna basıldığında {users.length} sakine gönderilecek.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialManagement;
