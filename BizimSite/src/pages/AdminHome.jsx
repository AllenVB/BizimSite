import { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const AdminHome = () => {
  const [stats, setStats] = useState([
    { title: 'Toplam Sakin', value: '0', icon: <Users className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Bu Ayki Tahsilat', value: '₺0', icon: <TrendingUp className="text-green-500" />, bg: 'bg-green-50' },
    { title: 'Geciken Aidatlar', value: '0', icon: <AlertCircle className="text-red-500" />, bg: 'bg-red-50' },
    { title: 'Aylık Gider', value: '₺8,200', icon: <TrendingDown className="text-orange-500" />, bg: 'bg-orange-50' },
  ]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const expenses = JSON.parse(localStorage.getItem('expenses')) || { elevator: 0, doorman: 0, electricity: 0, general: 0 };
    const totalExpense = Object.values(expenses).reduce((a, b) => a + b, 0);
    const debtCount = users.filter(u => u.totalDebt > 0).length;
    
    setStats([
      { title: 'Toplam Sakin', value: users.length, icon: <Users className="text-blue-500" />, bg: 'bg-blue-50' },
      { title: 'Bu Ayki Tahsilat', value: '₺0', icon: <TrendingUp className="text-green-500" />, bg: 'bg-green-50' },
      { title: 'Geciken Aidatlar', value: debtCount, icon: <AlertCircle className="text-red-500" />, bg: 'bg-red-50' },
      { title: 'Aylık Gider', value: `₺${totalExpense}`, icon: <TrendingDown className="text-orange-500" />, bg: 'bg-orange-50' },
    ]);
  }, []);

  return (
    <div className="ml-64 p-8 min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <h1 className="text-3xl font-extrabold text-white mb-8">Yönetim Paneli</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">Son İşlemler</h2>
        <div className="text-gray-400 text-sm italic">Henüz bir işlem bulunmuyor...</div>
      </div>
    </div>
  );
};

export default AdminHome;