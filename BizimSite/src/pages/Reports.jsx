import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Users, CreditCard, Wrench,
         AlertCircle, FileText, CheckCircle, XCircle, Printer, Loader2, Receipt } from 'lucide-react';
import { getUsers, getExpenses, getPayments, getComplaints, getAidatConfig } from '../services/api';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value > 100 ? `₺${Number(p.value).toLocaleString('tr-TR')}` : p.value}
        </p>
      ))}
    </div>
  );
};

/* ─── YÖNETİCİ RAPORU ─────────────────────────────────────── */
const StatModal = ({ modal, onClose }) => {
  if (!modal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">{modal.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
          {modal.items.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">Veri yok</div>
          ) : modal.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${item.color || 'bg-blue-500'}`}>
                  {item.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-slate-400">{item.subtitle}</p>}
                </div>
              </div>
              {item.badge && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.badgeClass}`}>{item.badge}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminReports = ({ expenses, payments, complaints, config, users }) => {
  const [tab, setTab] = useState('genel');
  const [modal, setModal] = useState(null);

  const residents = users.filter(u => u.role === 'resident');
  const periodStart = config?.periodStartDate ? new Date(config.periodStartDate) : null;
  const periodEnd   = config?.periodEndDate
    ? new Date(new Date(config.periodEndDate).setHours(23, 59, 59, 999)) : null;
  const inPeriod = (d) => {
    if (!periodStart || !periodEnd) return true;
    const dt = new Date(d);
    return dt >= periodStart && dt <= periodEnd;
  };

  const periodExpenses = expenses.filter(e => inPeriod(e.createdAt));
  const periodPayments = payments.filter(p => inPeriod(p.paidAt));

  const paidUserIds = new Set(periodPayments.map(p => p.userId));
  const paidUsers   = residents.filter(u => paidUserIds.has(u.id));
  const unpaidUsers = residents.filter(u => !paidUserIds.has(u.id));

  const totalExpenses   = periodExpenses.reduce((s, e) => s + e.amount, 0);
  const totalCollection = periodPayments.reduce((s, p) => s + p.amount, 0);
  const monthlyAidat    = config?.amount || 0;
  const netBalance      = totalCollection - totalExpenses;
  const collectionRate  = residents.length > 0 ? Math.round((paidUsers.length / residents.length) * 100) : 0;

  const expCatMap = {};
  periodExpenses.forEach(e => { const k = e.label || e.category || 'Diğer'; expCatMap[k] = (expCatMap[k] || 0) + e.amount; });
  const expenseData = Object.entries(expCatMap).map(([name, value]) => ({ name, value }));

  const monthPayMap = {};
  payments.forEach(p => { const k = new Date(p.paidAt).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }); monthPayMap[k] = (monthPayMap[k] || 0) + p.amount; });
  const monthExpMap = {};
  expenses.forEach(e => { const k = new Date(e.createdAt).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }); monthExpMap[k] = (monthExpMap[k] || 0) + e.amount; });
  const allMonthKeys = [...new Set([...Object.keys(monthPayMap), ...Object.keys(monthExpMap)])].slice(-6);
  const monthlyData = allMonthKeys.map(m => ({ month: m, gelir: monthPayMap[m] || 0, gider: monthExpMap[m] || 0 }));
  if (monthlyData.length === 0 && (totalCollection > 0 || totalExpenses > 0))
    monthlyData.push({ month: new Date().toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }), gelir: totalCollection, gider: totalExpenses });

  const catLabelMap = { ariza: 'Arıza', temizlik: 'Temizlik', gurultu: 'Gürültü', guvenlik: 'Güvenlik', oneri: 'Öneri', diger: 'Diğer' };
  const cmpCatMap = {};
  complaints.forEach(c => { const k = catLabelMap[c.category] || c.category || 'Diğer'; cmpCatMap[k] = (cmpCatMap[k] || 0) + 1; });
  const complaintData = Object.entries(cmpCatMap).map(([name, value]) => ({ name, value }));
  const paymentStatusData = [{ name: 'Ödedi', value: paidUsers.length }, { name: 'Ödemedi', value: unpaidUsers.length }].filter(d => d.value > 0);
  const monthName = config?.currentMonth || new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const generatePDF = () => {
    const now = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const paidRows = paidUsers.map(u => `
      <tr style="background:#f0fdf4">
        <td>${u.name}</td><td>${u.block || '-'} Blok / Daire ${u.no || '-'}</td>
        <td>${u.phone || '-'}</td>
        <td style="text-align:center"><span style="background:#dcfce7;color:#15803d;padding:2px 10px;border-radius:20px;font-weight:700;font-size:12px">✓ Ödendi</span></td>
        <td style="text-align:right;font-weight:700;color:#15803d">₺${monthlyAidat.toLocaleString('tr-TR')}</td>
      </tr>`).join('');
    const unpaidRows = unpaidUsers.map(u => `
      <tr style="background:#fef2f2">
        <td>${u.name}</td><td>${u.block || '-'} Blok / Daire ${u.no || '-'}</td>
        <td>${u.phone || '-'}</td>
        <td style="text-align:center"><span style="background:#fee2e2;color:#dc2626;padding:2px 10px;border-radius:20px;font-weight:700;font-size:12px">✗ Ödenmedi</span></td>
        <td style="text-align:right;font-weight:700;color:#dc2626">₺${monthlyAidat.toLocaleString('tr-TR')}</td>
      </tr>`).join('');
    const expenseRows = periodExpenses.map(e => `
      <tr><td>${e.label || e.category}</td><td style="text-align:right;font-weight:600">₺${Number(e.amount).toLocaleString('tr-TR')}</td></tr>`).join('');
    const maxVal = Math.max(totalExpenses, totalCollection, 1);
    const w = 400, h = 120, pad = 40, barW = 60;
    const gelirH = Math.round((totalCollection / maxVal) * (h - pad));
    const giderH = Math.round((totalExpenses / maxVal) * (h - pad));
    const chartSVG = `<svg width="${w}" height="${h}" style="overflow:visible">
      <rect x="60" y="${h-pad-gelirH}" width="${barW}" height="${gelirH}" fill="#22c55e" rx="4"/>
      <text x="${60+barW/2}" y="${h-pad-gelirH-6}" text-anchor="middle" font-size="11" fill="#15803d" font-weight="700">₺${totalCollection.toLocaleString('tr-TR')}</text>
      <text x="${60+barW/2}" y="${h-8}" text-anchor="middle" font-size="11" fill="#555">Tahsilat</text>
      <rect x="200" y="${h-pad-giderH}" width="${barW}" height="${giderH}" fill="#ef4444" rx="4"/>
      <text x="${200+barW/2}" y="${h-pad-giderH-6}" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700">₺${totalExpenses.toLocaleString('tr-TR')}</text>
      <text x="${200+barW/2}" y="${h-8}" text-anchor="middle" font-size="11" fill="#555">Gider</text>
      <line x1="40" y1="${h-pad}" x2="${w-20}" y2="${h-pad}" stroke="#e2e8f0" stroke-width="1"/>
    </svg>`;
    const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/>
<title>Aidat Raporu - ${monthName}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1e293b;padding:32px;font-size:13px}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #2563eb;padding-bottom:16px;margin-bottom:24px}
.logo{font-size:22px;font-weight:900;color:#2563eb}h2{font-size:15px;font-weight:700;color:#1e293b;margin:20px 0 10px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center}
.stat .val{font-size:20px;font-weight:800}.stat .lbl{font-size:11px;color:#64748b;margin-top:3px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}th{background:#1e293b;color:#fff;padding:8px 12px;text-align:left;font-size:12px}
td{padding:7px 12px;border-bottom:1px solid #f1f5f9}.section{margin-bottom:28px;page-break-inside:avoid}
@media print{body{padding:20px}.print-btn{display:none}}
.print-btn{background:#2563eb;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;margin-bottom:20px}
</style></head><body>
<div class="header">
  <div><div class="logo">🏢 BizimSite</div><div style="color:#64748b;font-size:12px;margin-top:4px">Apartman Yönetim Sistemi</div></div>
  <div style="text-align:right;color:#64748b;font-size:12px">
    <div style="font-size:16px;font-weight:700;color:#1e293b">YÖNETİCİ AİDAT RAPORU</div>
    <div>${monthName}</div><div>Oluşturma: ${now}</div>
  </div>
</div>
<button class="print-btn" onclick="window.print()">🖨️ PDF Olarak Yazdır / Kaydet</button>
<div class="stats">
  <div class="stat"><div class="val" style="color:#15803d">₺${totalCollection.toLocaleString('tr-TR')}</div><div class="lbl">Toplam Tahsilat</div></div>
  <div class="stat"><div class="val" style="color:#dc2626">₺${totalExpenses.toLocaleString('tr-TR')}</div><div class="lbl">Toplam Gider</div></div>
  <div class="stat"><div class="val" style="color:${netBalance>=0?'#15803d':'#dc2626'}">${netBalance>=0?'+':''}₺${netBalance.toLocaleString('tr-TR')}</div><div class="lbl">Net Bakiye</div></div>
  <div class="stat"><div class="val" style="color:#2563eb">${collectionRate}%</div><div class="lbl">Tahsilat Oranı</div></div>
</div>
<div class="section"><h2>Gelir - Gider Karşılaştırması</h2><div style="padding:16px 0">${chartSVG}</div></div>
<div class="section">
  <h2>✅ Ödeme Yapan Daireler (${paidUsers.length})</h2>
  ${paidUsers.length > 0 ? `<div class="overflow-x-auto"><table><thead><tr><th>Ad Soyad</th><th>Daire</th><th>Telefon</th><th style="text-align:center">Durum</th><th style="text-align:right">Tutar</th></tr></thead><tbody>${paidRows}</tbody></table>` : '<p style="color:#64748b;padding:12px 0">Ödeme yapan daire bulunmuyor.</p>'}
</div>
<div class="section">
  <h2>❌ Ödeme Yapmayan Daireler (${unpaidUsers.length})</h2>
  ${unpaidUsers.length > 0 ? `<div class="overflow-x-auto"><table><thead><tr><th>Ad Soyad</th><th>Daire</th><th>Telefon</th><th style="text-align:center">Durum</th><th style="text-align:right">Tutar</th></tr></thead><tbody>${unpaidRows}</tbody></table>` : '<p style="color:#64748b;padding:12px 0">Tüm daireler ödeme yapmış.</p>'}
</div>
${periodExpenses.length > 0 ? `<div class="section"><h2>📊 Gider Dağılımı</h2>
<div class="overflow-x-auto"><table><thead><tr><th>Gider Kalemi</th><th style="text-align:right">Tutar</th></tr></thead>
<tbody>${expenseRows}<tr style="background:#1e293b;color:#fff"><td style="font-weight:700">TOPLAM</td><td style="text-align:right;font-weight:700">₺${totalExpenses.toLocaleString('tr-TR')}</td></tr></tbody></table></div>` : ''}
<div style="border-top:1px solid #e2e8f0;margin-top:32px;padding-top:16px;color:#94a3b8;font-size:11px;display:flex;justify-content:space-between">
  <span>BizimSite - Apartman Yönetim Sistemi</span><span>Otomatik oluşturuldu • ${now}</span>
</div></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  return (
    <>
    <StatModal modal={modal} onClose={() => setModal(null)} />
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <TrendingUp className="text-blue-500" /> Raporlar
          </h1>
          <p className="text-slate-500 mt-1">
            {config?.currentMonth
              ? <>Dönem: <span className="font-semibold text-blue-600">{config.currentMonth}</span></>
              : 'Gerçek zamanlı site verileri'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-slate-100 w-fit">
        <button onClick={() => setTab('genel')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === 'genel' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
          Genel Analiz
        </button>
        <button onClick={() => setTab('aidat')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${tab === 'aidat' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
          <FileText size={15} /> Aidat Raporu
        </button>
      </div>

      {tab === 'genel' && (
        <>
          {residents.length === 0 && totalExpenses === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-500" />
              <p className="text-amber-700 text-sm">Henüz veri yok. Sakin ve gider ekledikçe grafikler dolacak.</p>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'Dönem Tahsilat', value: `₺${totalCollection.toLocaleString('tr-TR')}`, icon: <TrendingUp size={18} />, c: 'text-green-500', bg: 'bg-green-50',
                onClick: () => setModal({ title: `Dönem Tahsilat (${periodPayments.length} kayıt)`, items: periodPayments.map(p => ({ avatar: p.userName?.charAt(0) || '?', color: 'bg-green-500', title: p.userName || 'Bilinmiyor', subtitle: new Date(p.paidAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), badge: `₺${p.amount.toLocaleString('tr-TR')}`, badgeClass: 'bg-green-100 text-green-700' })) })
              },
              {
                label: 'Dönem Gider', value: `₺${totalExpenses.toLocaleString('tr-TR')}`, icon: <TrendingDown size={18} />, c: 'text-red-500', bg: 'bg-red-50',
                onClick: () => setModal({ title: `Dönem Giderleri (${periodExpenses.length} kalem)`, items: periodExpenses.map(e => ({ avatar: (e.label || e.category || '?').charAt(0).toUpperCase(), color: 'bg-red-400', title: e.label || e.category || 'Gider', subtitle: new Date(e.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }), badge: `₺${Number(e.amount).toLocaleString('tr-TR')}`, badgeClass: 'bg-red-100 text-red-700' })) })
              },
              {
                label: 'Net Bakiye', value: `${netBalance >= 0 ? '+' : ''}₺${netBalance.toLocaleString('tr-TR')}`, icon: <CreditCard size={18} />, c: netBalance >= 0 ? 'text-emerald-500' : 'text-red-500', bg: netBalance >= 0 ? 'bg-emerald-50' : 'bg-red-50',
                onClick: () => setModal({ title: 'Gelir — Gider Özeti', items: [ { avatar: '↑', color: 'bg-green-500', title: 'Toplam Tahsilat', subtitle: `${periodPayments.length} ödeme kaydı`, badge: `₺${totalCollection.toLocaleString('tr-TR')}`, badgeClass: 'bg-green-100 text-green-700' }, { avatar: '↓', color: 'bg-red-400', title: 'Toplam Gider', subtitle: `${periodExpenses.length} gider kalemi`, badge: `₺${totalExpenses.toLocaleString('tr-TR')}`, badgeClass: 'bg-red-100 text-red-700' }, { avatar: '=', color: netBalance >= 0 ? 'bg-emerald-500' : 'bg-orange-500', title: 'Net Bakiye', subtitle: netBalance >= 0 ? 'Pozitif bakiye' : 'Negatif bakiye', badge: `${netBalance >= 0 ? '+' : ''}₺${netBalance.toLocaleString('tr-TR')}`, badgeClass: netBalance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700' } ] })
              },
              {
                label: 'Toplam Sakin', value: residents.length, icon: <Users size={18} />, c: 'text-blue-500', bg: 'bg-blue-50',
                onClick: () => setModal({ title: `Tüm Sakinler (${residents.length})`, items: residents.map(u => ({ avatar: u.name?.charAt(0) || '?', color: 'bg-blue-500', title: u.name, subtitle: `${u.block || '-'} Blok / No ${u.no || '-'}`, badge: u.paid ? '✓ Ödedi' : '✗ Ödemedi', badgeClass: u.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' })) })
              },
            ].map((c, i) => (
              <div key={i} className="stat-card group cursor-pointer" onClick={c.onClick}>
                <div className={`p-2 rounded-lg w-fit mb-3 ${c.bg} ${c.c} group-hover:scale-110 transition-transform duration-200`}>{c.icon}</div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{c.value}</p>
                <p className="text-xs text-slate-400 mt-1">detay için tıkla →</p>
              </div>
            ))}
          </div>

          {monthlyData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
              <h2 className="font-bold text-slate-800 mb-4">Aylık Tahsilat &amp; Gider</h2>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₺${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<Tip />} />
                  <Legend />
                  <Area type="monotone" dataKey="gelir" name="Tahsilat" stroke="#22c55e" fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="gider" name="Gider"    stroke="#ef4444" fill="url(#g2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-bold text-slate-800 mb-4">Gider Dağılımı</h2>
              {expenseData.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">Bu dönemde gider girilmemiş</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={expenseData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `₺${Number(v).toLocaleString('tr-TR')}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-bold text-slate-800 mb-4">Ödeme Durumu</h2>
              {paymentStatusData.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">Sakin kaydı yok</div>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        <Cell fill="#22c55e" /><Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-green-500 rounded-full"/><span className="text-sm">Ödedi</span></div>
                      <span className="font-bold text-green-600">{paidUsers.length}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-red-50 rounded-xl">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-red-500 rounded-full"/><span className="text-sm">Ödemedi</span></div>
                      <span className="font-bold text-red-600">{unpaidUsers.length}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-center">
                      <p className="text-xs text-slate-500">Tahsilat Oranı</p>
                      <p className="text-xl font-bold text-slate-800">{collectionRate}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {complaintData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Wrench size={16} className="text-amber-500" /> Talep Kategorileri</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={complaintData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Talep" radius={[6,6,0,0]}>
                    {complaintData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {tab === 'aidat' && (
        <div>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="grid grid-cols-4 gap-4 flex-1">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => setModal({ title: `Tüm Sakinler (${residents.length})`, items: residents.map(u => ({ avatar: u.name?.charAt(0) || '?', color: 'bg-blue-500', title: u.name, subtitle: `${u.block || '-'} Blok / No ${u.no || '-'}`, badge: u.paid ? '✓ Ödedi' : '✗ Ödemedi', badgeClass: u.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' })) })}>
                <p className="text-2xl font-bold text-slate-800">{residents.length}</p>
                <p className="text-xs text-slate-500 mt-1">Toplam Daire</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => setModal({ title: `Ödeme Yapanlar (${paidUsers.length})`, items: paidUsers.map(u => ({ avatar: u.name?.charAt(0) || '?', color: 'bg-green-500', title: u.name, subtitle: `${u.block || '-'} Blok / No ${u.no || '-'}`, badge: '✓ Ödendi', badgeClass: 'bg-green-100 text-green-700' })) })}>
                <p className="text-2xl font-bold text-green-700">{paidUsers.length}</p>
                <p className="text-xs text-green-600 mt-1">Ödedi</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => setModal({ title: `Ödeme Yapmayanlar (${unpaidUsers.length})`, items: unpaidUsers.map(u => ({ avatar: u.name?.charAt(0) || '?', color: 'bg-red-400', title: u.name, subtitle: `${u.block || '-'} Blok / No ${u.no || '-'}`, badge: '✗ Ödemedi', badgeClass: 'bg-red-100 text-red-700' })) })}>
                <p className="text-2xl font-bold text-red-700">{unpaidUsers.length}</p>
                <p className="text-xs text-red-600 mt-1">Ödemedi</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => setModal({ title: `Tahsilat Durumu — %${collectionRate}`, items: [ ...paidUsers.map(u => ({ avatar: u.name?.charAt(0) || '?', color: 'bg-green-500', title: u.name, subtitle: `${u.block || '-'} Blok / No ${u.no || '-'}`, badge: '✓ Ödendi', badgeClass: 'bg-green-100 text-green-700' })), ...unpaidUsers.map(u => ({ avatar: u.name?.charAt(0) || '?', color: 'bg-red-400', title: u.name, subtitle: `${u.block || '-'} Blok / No ${u.no || '-'}`, badge: '✗ Ödemedi', badgeClass: 'bg-red-100 text-red-700' })) ] })}>
                <p className="text-2xl font-bold text-blue-700">{collectionRate}%</p>
                <p className="text-xs text-blue-600 mt-1">Tahsilat Oranı</p>
              </div>
            </div>
            <button onClick={generatePDF} className="btn-primary flex-shrink-0">
              <Printer size={18} /> PDF Oluştur
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-5">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100">
              <CheckCircle size={18} className="text-green-500" />
              <h2 className="font-bold text-slate-800">Ödeme Yapan Daireler ({paidUsers.length})</h2>
            </div>
            {paidUsers.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">Henüz ödeme yapan yok</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {paidUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-green-50/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
                        {u.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-md">{u.block || '-'} Blok</span>
                          <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">No {u.no || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {u.lastPayment && <span className="text-xs text-slate-400">{u.lastPayment}</span>}
                      <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-700 rounded-full">✓ Ödendi</span>
                      <span className="font-bold text-green-600 text-sm">₺{monthlyAidat.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-5">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100">
              <XCircle size={18} className="text-red-500" />
              <h2 className="font-bold text-slate-800">Ödeme Yapmayan Daireler ({unpaidUsers.length})</h2>
            </div>
            {unpaidUsers.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">Tüm daireler ödeme yapmış 🎉</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {unpaidUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-red-50/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold text-xs">
                        {u.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-md">{u.block || '-'} Blok</span>
                          <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">No {u.no || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold px-2.5 py-1 bg-red-100 text-red-700 rounded-full">✗ Ödenmedi</span>
                      <span className="font-bold text-red-500 text-sm">₺{monthlyAidat.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {expenseData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-bold text-slate-800 mb-4">Dönem Gider Dağılımı</h2>
              <div className="flex gap-6 items-center">
                <ResponsiveContainer width="40%" height={180}>
                  <PieChart>
                    <Pie data={expenseData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                      {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `₺${Number(v).toLocaleString('tr-TR')}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {expenseData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-sm text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-sm">₺{Number(item.value).toLocaleString('tr-TR')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2">
                    <span className="font-bold text-slate-700">Toplam</span>
                    <span className="font-bold text-slate-800">₺{totalExpenses.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

/* ─── SAKİN RAPORU ────────────────────────────────────────── */
const ResidentReports = ({ expenses, payments, config }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const monthlyAidat = config?.amount || 0;
  const monthName = config?.currentMonth || new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const periodStart = config?.periodStartDate ? new Date(config.periodStartDate) : null;
  const periodEnd   = config?.periodEndDate
    ? new Date(new Date(config.periodEndDate).setHours(23, 59, 59, 999)) : null;
  const inPeriod = (d) => {
    if (!periodStart || !periodEnd) return true;
    const dt = new Date(d);
    return dt >= periodStart && dt <= periodEnd;
  };

  const myPayments = payments; // API zaten userId'ye göre filtreler
  const periodMyPayments = myPayments.filter(p => inPeriod(p.paidAt));
  const isPaid = periodMyPayments.length > 0;
  const totalPaid = myPayments.reduce((s, p) => s + p.amount, 0);

  const periodExpenses = expenses.filter(e => inPeriod(e.createdAt));
  const totalExpenses = periodExpenses.reduce((s, e) => s + e.amount, 0);

  const expCatMap = {};
  periodExpenses.forEach(e => { const k = e.label || e.category || 'Diğer'; expCatMap[k] = (expCatMap[k] || 0) + e.amount; });
  const expenseData = Object.entries(expCatMap).map(([name, value]) => ({ name, value }));

  const myMonthMap = {};
  myPayments.forEach(p => {
    const k = new Date(p.paidAt).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
    myMonthMap[k] = (myMonthMap[k] || 0) + p.amount;
  });
  const myMonthlyData = Object.entries(myMonthMap).slice(-6).map(([month, tutar]) => ({ month, tutar }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Receipt className="text-blue-500" /> Mali Durumum
        </h1>
        <p className="text-slate-500 mt-1">
          {config?.currentMonth
            ? <>Dönem: <span className="font-semibold text-blue-600">{config.currentMonth}</span></>
            : 'Kişisel gelir — gider özeti'}
        </p>
      </div>

      {/* Kişisel özet kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className={`rounded-2xl p-5 border ${isPaid ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <p className="text-xs font-semibold mb-1 ${isPaid ? 'text-green-600' : 'text-red-600'}">{isPaid ? 'Bu Dönem' : 'Bu Dönem'}</p>
          <p className={`text-2xl font-bold ${isPaid ? 'text-green-700' : 'text-red-700'}`}>
            {isPaid ? 'Ödendi ✓' : 'Ödenmedi'}
          </p>
          <p className={`text-sm mt-1 ${isPaid ? 'text-green-600' : 'text-red-500'}`}>₺{monthlyAidat.toLocaleString('tr-TR')}</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 mb-1">Toplam Ödedim</p>
          <p className="text-2xl font-bold text-blue-700">₺{totalPaid.toLocaleString('tr-TR')}</p>
          <p className="text-sm text-blue-500 mt-1">{myPayments.length} ödeme kaydı</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <p className="text-xs font-semibold text-amber-600 mb-1">Dönem Site Gideri</p>
          <p className="text-2xl font-bold text-amber-700">₺{totalExpenses.toLocaleString('tr-TR')}</p>
          <p className="text-sm text-amber-500 mt-1">{periodExpenses.length} kalem</p>
        </div>
      </div>

      {/* Kişisel ödeme geçmişi */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <CreditCard size={18} className="text-blue-500" />
          <h2 className="font-bold text-slate-800">Ödeme Geçmişim</h2>
        </div>
        {myPayments.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">Henüz ödeme kaydı yok</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {myPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{p.description || 'Aidat Ödemesi'}</p>
                  <p className="text-xs text-slate-400">{new Date(p.paidAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">✓ Ödendi</span>
                  <span className="font-bold text-green-600">₺{p.amount.toLocaleString('tr-TR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Site gider dağılımı */}
      {expenseData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="font-bold text-slate-800 mb-1">Dönem Site Giderleri</h2>
          <p className="text-xs text-slate-400 mb-4">Aidatınızın nereye harcandığı</p>
          <div className="space-y-2">
            {expenseData.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <div className="flex-1 bg-slate-50 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(item.value / totalExpenses * 100).toFixed(0)}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-sm text-slate-600 w-36 truncate">{item.name}</span>
                <span className="font-semibold text-sm text-slate-700 w-24 text-right">₺{Number(item.value).toLocaleString('tr-TR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aylık ödeme grafiği */}
      {myMonthlyData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Aylık Ödeme Geçmişi</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={myMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₺${v.toLocaleString('tr-TR')}`} />
              <Tooltip formatter={v => `₺${Number(v).toLocaleString('tr-TR')}`} />
              <Bar dataKey="tutar" name="Ödeme" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

/* ─── ANA BİLEŞEN ─────────────────────────────────────────── */
const Reports = ({ isAdmin = false }) => {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getUsers(), getExpenses(), getPayments(), getComplaints(), getAidatConfig()])
      .then(([u, e, p, c, cfg]) => {
        setUsers(u.status === 'fulfilled' ? (u.value.data || []) : []);
        setExpenses(e.status === 'fulfilled' ? (e.value.data || []) : []);
        setPayments(p.status === 'fulfilled' ? (p.value.data || []) : []);
        setComplaints(c.status === 'fulfilled' ? (c.value.data || []) : []);
        setConfig(cfg.status === 'fulfilled' ? (cfg.value.data || null) : null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {isAdmin
        ? <AdminReports expenses={expenses} payments={payments} complaints={complaints} config={config} users={users} />
        : <ResidentReports expenses={expenses} payments={payments} config={config} />
      }
    </div>
  );
};

export default Reports;
