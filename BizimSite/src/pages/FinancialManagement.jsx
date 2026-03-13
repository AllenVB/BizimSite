import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

const FinancialManagement = ({ isAdmin = true }) => {
  const [expenses, setExpenses] = useState({
    elevator: 0,
    doorman: 0,
    electricity: 0,
    general: 0
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || { elevator: 0, doorman: 0, electricity: 0, general: 0 };
    setExpenses(savedExpenses);
  }, []);

  const handleChange = (field, value) => {
    setExpenses({ ...expenses, [field]: parseFloat(value) || 0 });
  };

  const handleSave = () => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const total = Object.values(expenses).reduce((a, b) => a + b, 0);

  return (
    <div className={`${isAdmin ? 'ml-64' : 'ml-64'} p-8 bg-slate-50 min-h-screen`}>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Mali Durum</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Asansör Gideri (₺)</label>
            <input
              type="number"
              value={expenses.elevator}
              onChange={(e) => handleChange('elevator', e.target.value)}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kapıcı Gideri (₺)</label>
            <input
              type="number"
              value={expenses.doorman}
              onChange={(e) => handleChange('doorman', e.target.value)}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bina Elektrik Faturası (₺)</label>
            <input
              type="number"
              value={expenses.electricity}
              onChange={(e) => handleChange('electricity', e.target.value)}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Genel Giderler (₺)</label>
            <input
              type="number"
              value={expenses.general}
              onChange={(e) => handleChange('general', e.target.value)}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <p className="text-lg font-bold text-blue-900">Toplam Aylık Gider: <span className="text-2xl">₺{total}</span></p>
        </div>

        {saved && <div className="p-4 bg-green-100 text-green-700 rounded-lg mb-6 font-semibold">✓ Değişiklikler kaydedildi!</div>}

        {isAdmin && (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <Save size={20} />
            Kaydet
          </button>
        )}
      </div>
    </div>
  );
};

export default FinancialManagement;
