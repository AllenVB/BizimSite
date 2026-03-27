import { useState } from 'react';
import { MessageSquarePlus, CheckCircle, Send, ChevronDown } from 'lucide-react';
import { submitFeedback } from '../services/api';

const TYPES = [
  { value: 'general', label: 'Genel', color: 'bg-slate-100 text-slate-700' },
  { value: 'suggestion', label: 'Öneri', color: 'bg-blue-100 text-blue-700' },
  { value: 'bug', label: 'Hata Bildirimi', color: 'bg-red-100 text-red-700' },
  { value: 'compliment', label: 'Teşekkür', color: 'bg-green-100 text-green-700' },
];

export default function FeedbackPage() {
  const [form, setForm] = useState({ title: '', message: '', type: 'general' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setError('Lütfen başlık ve mesaj alanlarını doldurun.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitFeedback(form);
      setSuccess(true);
      setForm({ title: '', message: '', type: 'general' });
    } catch (err) {
      setError(err.response?.data?.message || 'Gönderim başarısız, tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Teşekkürler!</h2>
          <p className="text-slate-500 text-sm mb-6">Geri bildiriminiz alındı. Geliştirmelerimizde dikkate alacağız.</p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-150 text-sm"
          >
            Yeni Bildirim Gönder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 md:p-3 bg-blue-100 rounded-xl">
          <MessageSquarePlus size={22} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800">Geri Bildirim</h1>
          <p className="text-xs md:text-sm text-slate-500">Öneri, hata bildirimi veya görüşlerinizi paylaşın</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tür seçici */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tür</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border-2 ${
                    form.type === t.value
                      ? `${t.color} border-current`
                      : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Başlık */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Başlık</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Kısaca konuyu özetleyin"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150 bg-white placeholder:text-slate-400"
            />
          </div>

          {/* Mesaj */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mesajınız</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Detaylı açıklama, öneri veya şikayetinizi yazın..."
              rows={5}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150 bg-white placeholder:text-slate-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-150 text-sm"
          >
            <Send size={16} />
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </form>
      </div>

      {/* Bilgi notu */}
      <p className="text-center text-xs text-slate-400 mt-4">
        Geri bildirimleriniz SuperAdmin tarafından incelenmektedir.
      </p>
    </div>
  );
}
