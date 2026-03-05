import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navigation({ isAuthenticated, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">BizimSite</Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-600">Ana Sayfa</Link>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">Giriş Yap</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Kontrol Paneli</Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">{user?.Ad} {user?.Soyad}</Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Çıkış Yap
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="block text-gray-700 hover:text-blue-600 py-2">Ana Sayfa</Link>
                <Link to="/login" className="block text-gray-700 hover:text-blue-600 py-2">Giriş Yap</Link>
                <Link to="/register" className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="block text-gray-700 hover:text-blue-600 py-2">Kontrol Paneli</Link>
                <Link to="/dashboard" className="block text-gray-700 hover:text-blue-600 py-2">{user?.Ad} {user?.Soyad}</Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-left"
                >
                  Çıkış Yap
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navigation;
