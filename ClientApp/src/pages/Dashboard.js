import React, { useEffect, useState } from 'react';

function Dashboard({ user }) {
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    // In a real app, you could fetch additional dashboard data here
    setProfile(user);
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Hoşgeldiniz, {profile?.ad} {profile?.soyad}
          </h1>
          <p className="mt-2 text-lg text-gray-600">Kontrol panelinize hoşgeldiniz</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow px-6 py-8 sm:px-8 sm:py-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profil Bilgileri</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Ad</p>
              <p className="mt-1 text-lg text-gray-900">{profile?.ad}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Soyad</p>
              <p className="mt-1 text-lg text-gray-900">{profile?.soyad}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-lg text-gray-900">{profile?.email}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Rol</p>
              <p className="mt-1 text-lg text-gray-900">
                {profile?.rol === 'Yonetici' && 'Yönetici'}
                {profile?.rol === 'Sakin' && 'Sakin'}
                {profile?.rol === 'Yetkili' && 'Yetkili'}
              </p>
            </div>

            {profile?.daireId && (
              <div>
                <p className="text-sm font-medium text-gray-500">Daire ID</p>
                <p className="mt-1 text-lg text-gray-900">{profile?.daireId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hızlı Erişim</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-3xl mb-2">🏢</div>
              <h3 className="font-semibold text-gray-900">Daireler</h3>
              <p className="text-sm text-gray-600 mt-1">Daire yönetimi</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-gray-900">Aidatlar</h3>
              <p className="text-sm text-gray-600 mt-1">Aidat takibi</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">Giderler</h3>
              <p className="text-sm text-gray-600 mt-1">Gider yönetimi</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-3xl mb-2">📢</div>
              <h3 className="font-semibold text-gray-900">Duyurular</h3>
              <p className="text-sm text-gray-600 mt-1">Duyuru yönetimi</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900">Yakında Gelecek Özellikler</h3>
          <ul className="mt-4 space-y-2 text-blue-800">
            <li>✓ Finansal raporlar</li>
            <li>✓ Ödeme modülü</li>
            <li>✓ Bildirim sistemi</li>
            <li>✓ Daha fazlası...</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
