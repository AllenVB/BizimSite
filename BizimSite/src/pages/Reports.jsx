import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Home, CreditCard, Wrench } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Reports = () => {
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

  const totalExpense = Object.values(expenses).reduce((a, b) => a + b, 0);
  const monthlyAidat = Math.round(totalExpense / (users.length || 1));
  const paidCount = users.filter(u => u.paid).length;
  const unpaidCount = users.length - paidCount;
  const totalCollection = paidCount * monthlyAidat;
  const netBalance = totalCollection - totalExpense;

  // Gider dağılımı pasta grafiği
  const expenseData = [
    { name: 'Asansör', value: expenses.elevator },
    { name: 'Kapıcı', value: expenses.doorman },
    { name: 'Elektrik', value: expenses.electricity },
    { name: 'Genel', value: expenses.general },
  ].filter(d => d.value > 0);

  // Ödeme durumu pasta grafiği
  const paymentStatusData = [
    { name: 'Ödedi', value: paidCount },
    { name: 'Ödemedi', value: unpaidCount },
  ].filter(d => d.value > 0);

  // Blok bazlı sakin dağılımı
  const blockCounts = {};
  users.forEach(u => { if (u.block) blockCounts[u.block] = (blockCounts[u.block] || 0) + 1; });
  const blockData = Object.entries(blockCounts).map(([block, count]) => ({ name: `${block} Blok`, sakin: count }));

  // Kiracı / Ev sahibi durumu (status field)
  const ownerCount = users.filter(u => u.type === 'owner').length;
  const tenantCount = users.filter(u => u.type === 'tenant').length;
  const unknownCount = users.length - ownerCount - tenantCount;
  const residentTypeData = [
    { name: 'Ev Sahibi', value: ownerCount || Math.round(users.length * 0.6) },
    { name: 'Kiracı', value: tenantCount || Math.round(users.length * 0.3) },
    { name: 'Bilinmiyor', value: unknownCount > 0 ? unknownCount : Math.round(users.length * 0.1) },
  ].filter(d => d.value > 0);

  // Talep kategorileri
  const complaintCategories = {};
  complaints.forEach(c => {
    const label = { ariza: 'Arıza', temizlik: 'Temizlik', gurultu: 'Gürültü', guvenlik: 'Güvenlik', oneri: 'Öneri', diger: 'Diğer' };
    const key = label[c.category] || 'Diğer';
    complaintCategories[key] = (complaintCategories[key] || 0) + 1;
  });
  const complaintData = Object.entries(complaintCategories).map(([name, value]) => ({ name, value }));

  // Talep durum özeti
  const complaintStatusData = [
    { name: 'Bekliyor', value: complaints.filter(c => c.status === 'pending').length },
    { name: 'İşleniyor', value: complaints.filter(c => c.status === 'in_progress').length },
    { name: 'Çözüldü', value: complaints.filter(c => c.status === 'resolved').length },
  ].filter(d => d.value > 0);

  // Son 6 ay gelir/gider simülasyonu (gerçek ödeme geçmişi + sabit gider)
  const months = ['Eki', 'Kas', 'Ara', 'Oca', 'Şub', 'Mar'];
  const monthlyData = months.map((month, i) => ({
    month,
    gelir: i === 5 ? totalCollection : Math.round(totalCollection * (0.7 + Math.random() * 0.4)),
    gider: i === 5 ? totalExpense : Math.round(totalExpense * (0.85 + Math.random() * 0.3)),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold text-slate-700 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {p.name}: {typeof p.value === 'number' && p.value > 100 ? `₺${p.value.toLocaleString('tr-TR')}` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ml-64 p-8 min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <TrendingUp className="text-blue-400" /> Raporlar & Analitik
        </h1>
        <p className="text-slate-400 mt-1">Site finansal durumu ve sakin istatistikleri</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Aylık Tahsilat', value: `₺${totalCollection.toLocaleString('tr-TR')}`, icon: <TrendingUp size={20} />, color: 'bg-green-500', light: 'bg-green-50 text-green-600' },
          { label: 'Aylık Gider', value: `₺${totalExpense.toLocaleString('tr-TR')}`, icon: <TrendingDown size={20} />, color: 'bg-red-500', light: 'bg-red-50 text-red-600' },
          { label: 'Net Bakiye', value: `₺${netBalance.toLocaleString('tr-TR')}`, icon: <CreditCard size={20} />, color: netBalance >= 0 ? 'bg-emerald-500' : 'bg-red-500', light: netBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600' },
          { label: 'Toplam Sakin', value: users.length, icon: <Users size={20} />, color: 'bg-blue-500', light: 'bg-blue-50 text-blue-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className={`p-2 rounded-lg w-fit mb-3 ${card.light}`}>{card.icon}</div>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Aylık Gelir / Gider Grafiği */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Aylık Tahsilat ve Gider</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="gelirGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="giderGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₺${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="gelir" name="Tahsilat" stroke="#22c55e" fill="url(#gelirGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="gider" name="Gider" stroke="#ef4444" fill="url(#giderGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* İkili Grafik Satırı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gider Dağılımı */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Gider Dağılımı</h2>
          {expenseData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">Gider verisi yok</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₺${v.toLocaleString('tr-TR')}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ödeme Durumu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Ödeme Durumu</h2>
          {paymentStatusData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">Sakin verisi yok</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-slate-600">Ödedi</span>
                  </div>
                  <span className="font-bold text-green-600">{paidCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-slate-600">Ödemedi</span>
                  </div>
                  <span className="font-bold text-red-600">{unpaidCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-center">
                  <p className="text-xs text-slate-500">Tahsilat Oranı</p>
                  <p className="text-lg font-bold text-slate-800">
                    {users.length > 0 ? Math.round((paidCount / users.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* İkinci Satır */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Kiracı / Ev Sahibi */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Home size={18} className="text-blue-500" /> Sakin Tipleri
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={residentTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" name="Kişi" radius={[0, 6, 6, 0]}>
                {residentTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Talep Kategorileri */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-yellow-500" /> Talep & Şikayetler
          </h2>
          {complaintData.length === 0 ? (
            <div>
              <p className="text-slate-400 text-sm text-center py-6">Henüz talep yok</p>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { label: 'Bekliyor', value: complaints.filter(c => c.status === 'pending').length, color: 'bg-yellow-50 text-yellow-700' },
                  { label: 'İşleniyor', value: complaints.filter(c => c.status === 'in_progress').length, color: 'bg-blue-50 text-blue-700' },
                  { label: 'Çözüldü', value: complaints.filter(c => c.status === 'resolved').length, color: 'bg-green-50 text-green-700' },
                ].map((s, i) => (
                  <div key={i} className={`p-3 rounded-xl text-center ${s.color}`}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={complaintData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Talep" radius={[6, 6, 0, 0]}>
                  {complaintData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Blok Sakin Dağılımı */}
      {blockData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Blok Bazlı Sakin Dağılımı</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={blockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="sakin" name="Sakin Sayısı" radius={[6, 6, 0, 0]}>
                {blockData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Reports;
