import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Site ve Apartmanlarınızı
              <span className="text-blue-600"> Dijitalleştirin</span>
            </h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Aidat takibi, ödeme sistemi, duyurular ve daha fazlası. 
              Tüm yönetim işlemlerinizi tek platformdan yapın.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link to="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                  Hemen Başla
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link to="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Giriş Yap
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-3xl font-extrabold text-gray-900">Neden BizimSite?</h3>
            </div>
            <div className="mt-10">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">💳</div>
                  <h4 className="text-lg font-semibold text-gray-900">Online Ödeme</h4>
                  <p className="mt-2 text-gray-500">
                    Sakinler online ödeme yapabilir. Otomatik makbuz ve raporlama.
                  </p>
                </div>
                {/* Feature 2 */}
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">📊</div>
                  <h4 className="text-lg font-semibold text-gray-900">Finansal Takip</h4>
                  <p className="mt-2 text-gray-500">
                    Gelir-gider raporları, aidat borç listesi ve grafikler.
                  </p>
                </div>
                {/* Feature 3 */}
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">🔔</div>
                  <h4 className="text-lg font-semibold text-gray-900">Duyuru Sistemi</h4>
                  <p className="mt-2 text-gray-500">
                    Anında duyurular ve bildirimler. Tüm sakinlere ulaşın.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 BizimSite. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
