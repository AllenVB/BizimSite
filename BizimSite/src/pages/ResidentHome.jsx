import { CreditCard, Bell, MessageSquare } from 'lucide-react';

const ResidentHome = () => {
  return (
    <div className="ml-64 p-8 min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Hoş Geldiniz, Sayın Sakin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aidat Özeti */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-700">Güncel Borç</h3>
            <CreditCard className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">₺450.00</p>
          <button className="mt-4 text-blue-600 font-semibold hover:underline">Şimdi Öde →</button>
        </div>

        {/* Duyurular */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-700">Son Duyuru</h3>
            <Bell className="text-blue-500" />
          </div>
          <p className="text-gray-600 italic">"Bu Cumartesi bahçe ilaçlaması yapılacaktır."</p>
        </div>
      </div>
    </div>
  );
};

export default ResidentHome;
