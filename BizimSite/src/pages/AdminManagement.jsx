import React, { useEffect, useState } from 'react';
import { Shield, Crown, Mail, Phone, Home, MessageSquare, Send, X, CheckCircle } from 'lucide-react';
import { getAdmins, sendMessage } from '../services/api';

const AdminManagement = ({ isResident = false }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgTarget, setMsgTarget] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const showMsgButton = isResident || currentUser.role === 'resident';

  useEffect(() => {
    getAdmins()
      .then(res => setAdmins(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSendMsg = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await sendMessage(`📢 [${currentUser.name} → ${msgTarget.name}]: ${msgText.trim()}`);
      setSent(true);
      setMsgText('');
      setTimeout(() => { setSent(false); setMsgTarget(null); }, 2000);
    } catch {
      alert('Mesaj gönderilemedi!');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  if (loading) return (
    <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-400">Yükleniyor...</p>
    </div>
  );

  return (
    <div className="ml-64 min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Shield className="text-blue-500" /> Yöneticiler
          </h1>
          <p className="text-slate-500 mt-1">
            {showMsgButton ? 'Site yöneticileri — mesaj göndermek için kartlara tıklayın' : 'Site yöneticileri ve iletişim bilgileri'}
          </p>
        </div>

        <div className="grid gap-4">
          {admins.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <Shield size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">Henüz yönetici bilgisi yok</p>
            </div>
          ) : admins.map((admin, i) => (
            <div key={admin.id || i} className="card p-6 flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${admin.isMainAdmin ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {getInitials(admin.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800">{admin.name}</span>
                  {admin.isMainAdmin ? (
                    <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold"><Crown size={10} /> Ana Yönetici</span>
                  ) : (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Yönetici</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                  {admin.email && <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" /> {admin.email}</span>}
                  {admin.phone && <span className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400" /> {admin.phone}</span>}
                  {admin.no && <span className="flex items-center gap-1.5"><Home size={13} className="text-slate-400" /> Daire {admin.no}{admin.block ? ` (${admin.block} Blok)` : ''}</span>}
                </div>
              </div>
              {showMsgButton && (
                <button onClick={() => { setMsgTarget(admin); setMsgText(''); setSent(false); }}
                  className="btn-outline-blue flex-shrink-0 text-sm">
                  <MessageSquare size={15} /> Mesaj Gönder
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {msgTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMsgTarget(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${msgTarget.isMainAdmin ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {getInitials(msgTarget.name)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{msgTarget.name}</p>
                  <p className="text-xs text-slate-400">{msgTarget.isMainAdmin ? 'Ana Yönetici' : 'Yönetici'}</p>
                </div>
              </div>
              <button onClick={() => setMsgTarget(null)} className="btn-icon"><X size={20} /></button>
            </div>
            <form onSubmit={handleSendMsg} className="p-5 space-y-4">
              {sent ? (
                <div className="flex flex-col items-center py-6 gap-3">
                  <CheckCircle size={48} className="text-green-500" />
                  <p className="font-semibold text-slate-700">Mesajınız gönderildi!</p>
                  <p className="text-sm text-slate-400">Sohbet panelinde görüntülenebilir</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{msgTarget.name} yöneticisine mesaj</label>
                    <textarea value={msgText} onChange={e => setMsgText(e.target.value)}
                      rows={4} required placeholder="Mesajınızı yazın..." className="textarea-field" autoFocus />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={sending || !msgText.trim()} className="flex-1 btn-primary justify-center disabled:opacity-50">
                      {sending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Gönderiliyor...</> : <><Send size={15} /> Gönder</>}
                    </button>
                    <button type="button" onClick={() => setMsgTarget(null)} className="btn-secondary">İptal</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
