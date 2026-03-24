import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Users, ChevronDown } from 'lucide-react';
import { getMessages, sendMessage, getUsers } from '../services/api';

const colors = ['#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981','#EF4444','#06B6D4','#6366F1'];
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length];

const ChatWidget = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [residents, setResidents] = useState([]);
  const [text, setText] = useState('');
  const [showResidents, setShowResidents] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  const load = () => {
    getMessages().then(r => setMessages(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getUsers().then(r => setResidents(r.data)).catch(() => {});
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await sendMessage(text.trim());
      setText('');
      load();
    } catch {}
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col"
      style={{ width: '380px', height: '560px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10)',
        border: '1px solid rgba(0,0,0,0.08)'
      }}>

      {/* Başlık */}
      <div className="flex items-center justify-between px-4 py-3.5 rounded-t-[20px]"
        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageSquare size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Sakinler Sohbeti</p>
            <p className="text-[11px] text-blue-100">{residents.length} sakin</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowResidents(s => !s)}
            title="Sakinleri Göster"
            className="w-7 h-7 bg-white/15 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all">
            <Users size={13} className="text-white" />
          </button>
          <button onClick={onClose}
            className="w-7 h-7 bg-white/15 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all">
            <X size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mesajlar */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {loading ? (
            <div className="text-center text-slate-400 text-sm py-8">Yükleniyor...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-8">Henüz mesaj yok</div>
          ) : messages.map(m => {
            const isMe = m.userId === currentUser.id;
            const color = getColor(m.userName);
            return (
              <div key={m.id} className={`flex items-end gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: color }}>
                    {m.userName?.substring(0, 1).toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[220px] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <p className="text-[10px] text-slate-400 mb-0.5 ml-1">{m.userName}</p>}
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-snug ${isMe
                    ? 'text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}
                    style={isMe ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)' } : {}}>
                    {m.text}
                  </div>
                  <p className="text-[10px] text-slate-300 mt-0.5 mx-1">
                    {new Date(m.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Sakin listesi (toggle) */}
        {showResidents && (
          <div className="w-28 border-l border-slate-100 overflow-y-auto flex-shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase px-2 pt-2 pb-1">Sakinler</p>
            {residents.map(r => (
              <div key={r.id} className="flex flex-col items-center py-1.5 px-1 hover:bg-slate-50 rounded-lg mx-1 transition-colors">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: getColor(r.name) }}>
                  {r.name?.substring(0, 1).toUpperCase()}
                </div>
                <p className="text-[10px] text-slate-600 text-center mt-0.5 leading-tight truncate w-full px-0.5">{r.name?.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mesaj gönder */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)}
          placeholder="Mesaj yaz..."
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
        <button type="submit" disabled={!text.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-90 flex-shrink-0 disabled:opacity-40"
          style={{ background: text.trim() ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#e2e8f0' }}>
          <Send size={15} className={text.trim() ? 'text-white' : 'text-slate-400'} />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
