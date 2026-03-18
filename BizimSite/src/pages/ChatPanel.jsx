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
    <div className="ml-64 h-screen flex flex-col bg-slate-50">
      <div onClick={() => setShowResidents(!showResidents)}
        className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl"><MessageSquare size={20} className="text-blue-600" /></div>
          <div>
            <h2 className="font-bold text-slate-800">Sakinler Sohbeti</h2>
            <p className="text-xs text-slate-400">Tıklayarak sakinleri görüntüle</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-blue-500 text-sm font-medium">
          <Users size={18} /> Sakinler
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center text-slate-400 py-8">Yükleniyor...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 py-8">Henüz mesaj yok. İlk mesajı siz gönderin!</div>
          ) : messages.map(m => {
            const isMe = m.userId === currentUser.id;
            const color = getColor(m.userName);
            return (
              <div key={m.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: color }}>
                    {m.userName?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && <p className="text-xs text-slate-400 mb-1 ml-1">{m.userName}</p>}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'}`}>
                    {m.text}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 mx-1">{new Date(m.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {showResidents && (
          <div className="w-72 bg-white border-l border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={16} /> Sakinler</h3>
              <button onClick={() => setShowResidents(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              {residents.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-50">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: getColor(r.name) }}>
                    {r.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-400">Blok {r.block} - No: {r.no}</p>
                    {r.phone && <p className="text-xs text-slate-400">{r.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="bg-white border-t border-slate-200 p-4 flex gap-3">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Mesajınızı yazın..."
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-2xl outline-none focus:border-blue-400 transition text-sm" />
        <button type="submit" disabled={!text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white p-3 rounded-2xl transition">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
export default ChatPanel;
