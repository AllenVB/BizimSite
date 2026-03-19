import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Users, CreditCard, Wrench, Home,
         AlertCircle, FileText, CheckCircle, XCircle, Printer } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Reports = () => {
  const [tab, setTab] = useState('genel');
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState({ elevator: 0, doorman: 0, electricity: 0, general: 0 });
  const [complaints, setComplaints] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem('users')) || []);
    setExpenses(JSON.parse(localStorage.getItem('expenses')) || { elevator: 0, doorman: 0, electricity: 0, general: 0 });
    setComplaints(JSON.parse(localStorage.getItem('complaints')) || []);
    setPaymentHistory(JSON.parse(localStorage.getItem('paymentHistory')) || []);
  }, []);

  const total = Object.values(expenses).reduce((a, b) => a + b, 0);
  const monthlyAidat = Math.round(total / (users.length || 1));
  const paidUsers = users.filter(u => u.paid);
  const unpaidUsers = users.filter(u => !u.paid);
  const totalCollection = paidUsers.length * monthlyAidat;
  const netBalance = totalCollection - total;
  const collectionRate = users.length > 0 ? Math.round((paidUsers.length / users.length) * 100) : 0;

  // Aylık veri - sadece gerçek ödeme geçmişi
  const monthlyMap = {};
  paymentHistory.forEach(p => {
    const key = p.date?.split(' ').slice(-2).join(' ') || '';
    if (key) monthlyMap[key] = (monthlyMap[key] || 0) + (p.amount || 0);
  });
  const monthlyData = Object.entries(monthlyMap).slice(-6).map(([month, gelir]) => ({
    month: month.split(' ')[0], gelir, gider: total,
  }));
  if (monthlyData.length === 0 && (totalCollection > 0 || total > 0))
    monthlyData.push({ month: new Date().toLocaleDateString('tr-TR', { month: 'short' }), gelir: totalCollection, gider: total });

  const expenseData = [
    { name: 'Asansör', value: expenses.elevator },
    { name: 'Kapıcı', value: expenses.doorman },
    { name: 'Elektrik', value: expenses.electricity },
    { name: 'Genel', value: expenses.general },
  ].filter(d => d.value > 0);

  const paymentStatusData = [
    { name: 'Ödedi', value: paidUsers.length },
    { name: 'Ödemedi', value: unpaidUsers.length },
  ].filter(d => d.value > 0);

  const catMap = {};
  complaints.forEach(c => {
    const lbl = { ariza: 'Arıza', temizlik: 'Temizlik', gurultu: 'Gürültü', guvenlik: 'Güvenlik', oneri: 'Öneri', diger: 'Diğer' };
    const k = lbl[c.category] || 'Diğer';
    catMap[k] = (catMap[k] || 0) + 1;
  });
  const complaintData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value > 100 ? `₺${p.value.toLocaleString('tr-TR')}` : p.value}</p>
        ))}
      </div>
    );
  };

  // PDF RAPORU OLUŞTUR
  const generatePDF = () => {
    const now = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const monthName = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    const paidRows = paidUsers.map(u => `
      <tr style="background:#f0fdf4">
        <td>${u.name}</td>
        <td>${u.block || '-'} Blok / Daire ${u.no || '-'}</td>
        <td>${u.phone || '-'}</td>
        <td style="text-align:center"><span style="background:#dcfce7;color:#15803d;padding:2px 10px;border-radius:20px;font-weight:700;font-size:12px">✓ Ödendi</span></td>
        <td style="text-align:right;font-weight:700;color:#15803d">₺${monthlyAidat.toLocaleString('tr-TR')}</td>
      </tr>`).join('');

    const unpaidRows = unpaidUsers.map(u => `
      <tr style="background:#fef2f2">
        <td>${u.name}</td>
        <td>${u.block || '-'} Blok / Daire ${u.no || '-'}</td>
        <td>${u.phone || '-'}</td>
        <td style="text-align:center"><span style="background:#fee2e2;color:#dc2626;padding:2px 10px;border-radius:20px;font-weight:700;font-size:12px">✗ Ödenmedi</span></td>
        <td style="text-align:right;font-weight:700;color:#dc2626">₺${monthlyAidat.toLocaleString('tr-TR')}</td>
      </tr>`).join('');

    const expenseRows = [
      { label: 'Asansör Bakımı', val: expenses.elevator },
      { label: 'Kapıcı Ücreti', val: expenses.doorman },
      { label: 'Ortak Alan Elektriği', val: expenses.electricity },
      { label: 'Genel Giderler', val: expenses.general },
    ].filter(r => r.val > 0).map(r => `
      <tr>
        <td>${r.label}</td>
        <td style="text-align:right;font-weight:600">₺${r.val.toLocaleString('tr-TR')}</td>
      </tr>`).join('');

    // Basit bar chart SVG
    const maxVal = Math.max(total, totalCollection, 1);
    const w = 400, h = 120, pad = 40;
    const barW = 60;
    const gelirH = Math.round(((totalCollection / maxVal) * (h - pad)));
    const giderH = Math.round(((total / maxVal) * (h - pad)));
    const chartSVG = `
      <svg width="${w}" height="${h}" style="overflow:visible">
        <rect x="60" y="${h-pad-gelirH}" width="${barW}" height="${gelirH}" fill="#22c55e" rx="4"/>
        <text x="${60+barW/2}" y="${h-pad-gelirH-6}" text-anchor="middle" font-size="11" fill="#15803d" font-weight="700">₺${totalCollection.toLocaleString('tr-TR')}</text>
        <text x="${60+barW/2}" y="${h-8}" text-anchor="middle" font-size="11" fill="#555">Tahsilat</text>
        <rect x="200" y="${h-pad-giderH}" width="${barW}" height="${giderH}" fill="#ef4444" rx="4"/>
        <text x="${200+barW/2}" y="${h-pad-giderH-6}" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700">₺${total.toLocaleString('tr-TR')}</text>
        <text x="${200+barW/2}" y="${h-8}" text-anchor="middle" font-size="11" fill="#555">Gider</text>
        <line x1="40" y1="${h-pad}" x2="${w-20}" y2="${h-pad}" stroke="#e2e8f0" stroke-width="1"/>
      </svg>`;

    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<title>Aidat Raporu - ${monthName}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; color: #1e293b; padding: 32px; font-size: 13px; }
  .header { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #2563eb; padding-bottom:16px; margin-bottom:24px; }
  .logo { font-size:22px; font-weight:900; color:#2563eb; }
  .meta { text-align:right; color:#64748b; font-size:12px; }
  h2 { font-size:15px; font-weight:700; color:#1e293b; margin:20px 0 10px; }
  .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
  .stat { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; text-align:center; }
  .stat .val { font-size:20px; font-weight:800; }
  .stat .lbl { font-size:11px; color:#64748b; margin-top:3px; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  th { background:#1e293b; color:#fff; padding:8px 12px; text-align:left; font-size:12px; }
  td { padding:7px 12px; border-bottom:1px solid #f1f5f9; }
  .section { margin-bottom:28px; page-break-inside:avoid; }
  .net { font-size:16px; font-weight:800; color:${netBalance >= 0 ? '#15803d' : '#dc2626'}; }
  @media print { body { padding: 20px; } button { display:none; } }
  .print-btn { background:#2563eb; color:#fff; border:none; padding:10px 24px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; margin-bottom:20px; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">🏢 BizimSite</div>
    <div style="color:#64748b;font-size:12px;margin-top:4px">Apartman Yönetim Sistemi</div>
  </div>
  <div class="meta">
    <div style="font-size:16px;font-weight:700;color:#1e293b">AİDAT RAPORU</div>
    <div>${monthName}</div>
    <div>Oluşturma: ${now}</div>
  </div>
</div>

<button class="print-btn" onclick="window.print()">🖨️ PDF Olarak Yazdır / Kaydet</button>

<div class="stats">
  <div class="stat"><div class="val" style="color:#15803d">₺${totalCollection.toLocaleString('tr-TR')}</div><div class="lbl">Toplam Tahsilat</div></div>
  <div class="stat"><div class="val" style="color:#dc2626">₺${total.toLocaleString('tr-TR')}</div><div class="lbl">Toplam Gider</div></div>
  <div class="stat"><div class="val ${netBalance >= 0 ? 'style="color:#15803d"' : 'style="color:#dc2626"'}">${netBalance >= 0 ? '+' : ''}₺${netBalance.toLocaleString('tr-TR')}</div><div class="lbl">Net Bakiye</div></div>
  <div class="stat"><div class="val" style="color:#2563eb">${collectionRate}%</div><div class="lbl">Tahsilat Oranı</div></div>
</div>

<div class="section">
  <h2>Gelir - Gider Karşılaştırması</h2>
  <div style="padding:16px 0">${chartSVG}</div>
</div>

<div class="section">
  <h2>✅ Ödeme Yapan Daireler (${paidUsers.length})</h2>
  ${paidUsers.length > 0 ? `
  <table>
    <thead><tr><th>Ad Soyad</th><th>Daire</th><th>Telefon</th><th style="text-align:center">Durum</th><th style="text-align:right">Tutar</th></tr></thead>
    <tbody>${paidRows}</tbody>
  </table>` : '<p style="color:#64748b;padding:12px 0">Ödeme yapan daire bulunmuyor.</p>'}
</div>

<div class="section">
  <h2>❌ Ödeme Yapmayan Daireler (${unpaidUsers.length})</h2>
  ${unpaidUsers.length > 0 ? `
  <table>
    <thead><tr><th>Ad Soyad</th><th>Daire</th><th>Telefon</th><th style="text-align:center">Durum</th><th style="text-align:right">Tutar</th></tr></thead>
    <tbody>${unpaidRows}</tbody>
  </table>` : '<p style="color:#64748b;padding:12px 0">Tüm daireler ödeme yapmış.</p>'}
</div>

${expenseData.length > 0 ? `
<div class="section">
  <h2>📊 Gider Dağılımı</h2>
  <table>
    <thead><tr><th>Gider Kalemi</th><th style="text-align:right">Tutar</th></tr></thead>
    <tbody>
      ${expenseRows}
      <tr style="background:#1e293b;color:#fff">
        <td style="font-weight:700">TOPLAM</td>
        <td style="text-align:right;font-weight:700">₺${total.toLocaleString('tr-TR')}</td>
      </tr>
    </tbody>
  </table>
  <p style="font-size:12px;color:#64748b;margin-top:8px">Kişi başı aidat: ₺${monthlyAidat.toLocaleString('tr-TR')} (${users.length} sakin)</p>
</div>` : ''}

<div style="border-top:1px solid #e2e8f0;margin-top:32px;padding-top:16px;color:#94a3b8;font-size:11px;display:flex;justify-content:space-between">
  <span>BizimSite - Apartman Yönetim Sistemi</span>
  <span>Otomatik oluşturuldu • ${now}</span>
</div>
</body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <TrendingUp className="text-blue-500" /> Raporlar
            </h1>
            <p className="text-slate-500 mt-1">Gerçek zamanlı site verileri</p>
          </div>
        </div>

        {/* Sekmeler */}
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

        {/* GENEL ANALİZ */}
        {tab === 'genel' && (
          <>
            {users.length === 0 && total === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
                <AlertCircle size={18} className="text-amber-500" />
                <p className="text-amber-700 text-sm">Henüz veri girilmemiş. Sakin ve gider ekledikçe grafikler dolacak.</p>
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Aylık Tahsilat', value: `₺${totalCollection.toLocaleString('tr-TR')}`, icon: <TrendingUp size={18} />, c: 'text-green-500', bg: 'bg-green-50' },
                { label: 'Aylık Gider', value: `₺${total.toLocaleString('tr-TR')}`, icon: <TrendingDown size={18} />, c: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Net Bakiye', value: `${netBalance >= 0 ? '+' : ''}₺${netBalance.toLocaleString('tr-TR')}`, icon: <CreditCard size={18} />, c: netBalance >= 0 ? 'text-emerald-500' : 'text-red-500', bg: netBalance >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
                { label: 'Toplam Sakin', value: users.length, icon: <Users size={18} />, c: 'text-blue-500', bg: 'bg-blue-50' },
              ].map((c, i) => (
                <div key={i} className="stat-card group">
                  <div className={`p-2 rounded-lg w-fit mb-3 ${c.bg} ${c.c} group-hover:scale-110 transition-transform duration-200`}>{c.icon}</div>
                  <p className="text-xs text-slate-500">{c.label}</p>
                  <p className="text-xl font-bold text-slate-800 mt-0.5">{c.value}</p>
                </div>
              ))}
            </div>

            {monthlyData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                <h2 className="font-bold text-slate-800 mb-4">Aylık Tahsilat & Gider</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₺${(v/1000).toFixed(0)}K`} />
                    <Tooltip content={<Tip />} />
                    <Legend />
                    <Area type="monotone" dataKey="gelir" name="Tahsilat" stroke="#22c55e" fill="url(#g1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="gider" name="Gider" stroke="#ef4444" fill="url(#g2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-bold text-slate-800 mb-4">Gider Dağılımı</h2>
                {expenseData.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm">Gider girilmemiş</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={expenseData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                        {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => `₺${v.toLocaleString('tr-TR')}`} />
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
                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Wrench size={16} className="text-amber-500" /> Talepler</h2>
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

        {/* AİDAT RAPORU */}
        {tab === 'aidat' && (
          <div>
            {/* Özet + PDF Butonu */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="grid grid-cols-4 gap-4 flex-1">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
                  <p className="text-2xl font-bold text-slate-800">{users.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Toplam Daire</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center">
                  <p className="text-2xl font-bold text-green-700">{paidUsers.length}</p>
                  <p className="text-xs text-green-600 mt-1">Ödedi</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center">
                  <p className="text-2xl font-bold text-red-700">{unpaidUsers.length}</p>
                  <p className="text-xs text-red-600 mt-1">Ödemedi</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
                  <p className="text-2xl font-bold text-blue-700">{collectionRate}%</p>
                  <p className="text-xs text-blue-600 mt-1">Tahsilat Oranı</p>
                </div>
              </div>
              <button onClick={generatePDF} className="btn-primary flex-shrink-0">
                <Printer size={18} /> PDF Oluştur
              </button>
            </div>

            {/* Ödeme Yapanlar */}
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
                          <p className="text-xs text-slate-400">{u.block} Blok / Daire {u.no}</p>
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

            {/* Ödeme Yapmayanlar */}
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
                          <p className="text-xs text-slate-400">{u.block} Blok / Daire {u.no}</p>
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

            {/* Gider Özeti */}
            {expenseData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-bold text-slate-800 mb-4">Gider Dağılımı</h2>
                <div className="flex gap-6 items-center">
                  <ResponsiveContainer width="40%" height={180}>
                    <PieChart>
                      <Pie data={expenseData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                        {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => `₺${v.toLocaleString('tr-TR')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {expenseData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-sm text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-semibold text-sm">₺{item.value.toLocaleString('tr-TR')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2">
                      <span className="font-bold text-slate-700">Toplam</span>
                      <span className="font-bold text-slate-800">₺{total.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default Reports;
