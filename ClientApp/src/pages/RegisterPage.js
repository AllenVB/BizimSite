import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

function RegisterPage({ onLogin }) {
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    sifre: '',
    sifreOnay: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.sifre !== formData.sifreOnay) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.sifre.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient.post('/users/register', {
        ad: formData.ad,
        soyad: formData.soyad,
        email: formData.email,
        sifre: formData.sifre,
        sifreOnay: formData.sifreOnay,
      });

      if (data.success) {
        onLogin(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Kayıt başarısız oldu');
      }
    } catch (err) {
      setError('Sunucu bağlantı hatası: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Yeni Hesap Oluşturun
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="ad" className="block text-sm font-medium text-gray-700">
                Ad
              </label>
              <input
                id="ad"
                name="ad"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Adınız"
                value={formData.ad}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="soyad" className="block text-sm font-medium text-gray-700">
                Soyad
              </label>
              <input
                id="soyad"
                name="soyad"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Soyadınız"
                value={formData.soyad}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="sifre" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <input
                id="sifre"
                name="sifre"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Şifre"
                value={formData.sifre}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="sifreOnay" className="block text-sm font-medium text-gray-700">
                Şifre Tekrar
              </label>
              <input
                id="sifreOnay"
                name="sifreOnay"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Şifre Tekrar"
                value={formData.sifreOnay}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Giriş Yap
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
