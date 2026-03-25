import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Users, X } from 'lucide-react';
import { getMessages, sendMessage, getUsers } from '../services/api';

const colors = ['#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981','#EF4444','#06B6D4','#6366F1'];
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length];

const ChatPanel = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [residents, setResidents] = useState([]);
  const [showResidents, setShowResidents] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  const load = () => {
    getMessages().then(r => setMessages(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getUsers().then(r => setResidents(r.data)).catch(() => {});
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Sakinler paneli açıkken body scroll kilitle
  useEffect(() => {
    if (showResidents) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showResidents]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await sendMessage(text.trim());
      setText('');
      load();
    } catch (err) { alert('Gönderilemedi!'); }
  };

  return (
    <div className="flex flex-col bg-slate-50 h-[calc(100vh-56px)] md:h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-3 py-3 md:px-6 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-blue-100 rounded-xl">
            <MessageSquare size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm md:text-base">Sakinler Sohbeti</h2>
            <p className="text-xs text-slate-400 hidden sm:block">Apartman sakinleriyle sohbet edin</p>
          </div>
        </div>
        <button
          onClick={() => setShowResidents(true)}
          className="flex items-center gap-1.5 text-blue-500 text-xs md:text-sm font-medium bg-blue-50 hover:bg-blue-100 transition px-2.5 py-1.5 rounded-xl"
        >
          <Users size={15} />
          <span>Sakinler</span>
          {residents.length > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {residents.length}
            </span>
          )}
        </button>
      </div>

      {/* Chat alanı */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
        {loading ? (
          <div className="text-center text-slate-400 py-8 text-sm">Yükleniyor...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-sm">Henüz mesaj yok. İlk mesajı siz gönderin!</div>
        ) : messages.map(m => {
          const isMe = m.userId === currentUser.id;
          const color = getColor(m.userName);
          return (
            <div key={m.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: color }}>
                  {m.userName?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className={`max-w-[72%] md:max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && <p className="text-xs text-slate-400 mb-1 ml-1">{m.userName}</p>}
                <div className={`px-3 py-2 md:px-4 md:py-2.5 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'}`}>
                  {m.text}
                </div>
                <p className="text-xs text-slate-300 mt-1 mx-1">
                  {new Date(m.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Mesaj input */}
      <form onSubmit={handleSend} className="bg-white border-t border-slate-200 p-3 md:p-4 flex gap-2 md:gap-3">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Mesajınızı yazın..."
          className="flex-1 px-3 py-2 md:px-4 md:py-2.5 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150 text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 text-white p-2.5 md:p-3 rounded-2xl transition-all duration-150 flex-shrink-0"
        >
          <Send size={17} />
        </button>
      </form>

      {/* Sakinler paneli — mobilde tam ekran overlay, desktop'ta yan panel */}
      {showResidents && (
        <>
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setShowResidents(false)}
          />

          {/* Panel — mobilde sağdan gelen sheet, desktop'ta fixed sağ panel */}
          <div className="fixed right-0 top-0 h-full z-50 w-[85vw] max-w-sm md:w-72 bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base">
                <Users size={16} className="text-blue-500" /> Sakinler
                <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{residents.length}</span>
              </h3>
              <button
                onClick={() => setShowResidents(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {residents.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">Sakin bulunamadı</div>
              ) : residents.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-50 transition">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: getColor(r.name) }}
                  >
                    {r.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{r.name}</p>
                    <p className="text-xs text-slate-400">Blok {r.block} - No: {r.no}</p>
                    {r.phone && <p className="text-xs text-slate-400">{r.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default ChatPanel;
