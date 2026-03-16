import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Users, X, Phone, Home, ChevronRight } from 'lucide-react';

const ChatPanel = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDirectory, setShowDirectory] = useState(false);
  const [residents, setResidents] = useState([]);
  const bottomRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    setMessages(JSON.parse(localStorage.getItem('messages')) || []);
    setResidents(JSON.parse(localStorage.getItem('users')) || []);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: currentUser.name || 'Sakin',
      senderId: currentUser.id,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem('messages', JSON.stringify(updated));
    setNewMessage('');
  };

  const isMine = (msg) => msg.senderId === currentUser.id || msg.sender === currentUser.name;

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const getColor = (name) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
    let h = 0;
    for (let c of (name || '')) h = c.charCodeAt(0) + h * 31;
    return colors[Math.abs(h) % colors.length];
  };

  const participants = [...new Set(messages.map(m => m.sender))].length;
  const others = residents.filter(r => r.id !== currentUser.id);

  return (
    <div className="ml-64 h-screen bg-slate-100 flex">
      {/* Ana Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <button
          onClick={() => setShowDirectory(v => !v)}
          className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 hover:bg-slate-50 transition w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl"><MessageSquare size={20} className="text-blue-500" /></div>
            <div>
              <h1 className="font-bold text-slate-800">Sakinler Sohbeti</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Users size={12} /> {participants} katılımcı · {residents.length} sakin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium hidden sm:block">Sakinleri Görüntüle</span>
            <ChevronRight size={16} className={`text-slate-400 transition-transform ${showDirectory ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {/* Mesajlar */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <MessageSquare size={48} className="text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Henüz mesaj yok</p>
              <p className="text-slate-400 text-sm mt-1">İlk mesajı sen gönder!</p>
            </div>
          ) : messages.map((msg) => {
            const mine = isMine(msg);
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                {!mine && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getColor(msg.sender)}`}>
                    {getInitials(msg.sender)}
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  {!mine && <p className="text-xs text-slate-500 mb-1 ml-1 font-medium">{msg.sender}</p>}
                  <div className={`px-4 py-2.5 rounded-2xl ${mine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <p className={`text-xs text-slate-400 mt-1 ${mine ? 'mr-1' : 'ml-1'}`}>{msg.time}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex-shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getColor(currentUser.name)}`}>
              {getInitials(currentUser.name)}
            </div>
            <input
              type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-2xl outline-none focus:bg-slate-50 focus:ring-2 focus:ring-blue-200 transition text-sm"
            />
            <button type="submit" disabled={!newMessage.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition flex-shrink-0">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Sakinler Rehberi Paneli */}
      {showDirectory && (
        <div className="w-72 bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-800">Sakinler</h2>
              <p className="text-xs text-slate-400 mt-0.5">{residents.length} kişi</p>
            </div>
            <button onClick={() => setShowDirectory(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {residents.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Sakin bulunamadı</p>
            ) : residents.map(r => (
              <div key={r.id} className={`rounded-xl p-3 border ${r.id === currentUser.id ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-transparent hover:border-slate-200'} transition`}>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getColor(r.name)}`}>
                    {getInitials(r.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {r.name} {r.id === currentUser.id && <span className="text-blue-500 font-normal text-xs">(Sen)</span>}
                    </p>
                  </div>
                </div>
                <div className="pl-11 space-y-0.5">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Home size={11} className="text-slate-400 flex-shrink-0" />
                    {r.block ? `${r.block} Blok / ` : ''}Daire {r.no || '-'}
                  </p>
                  {r.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Phone size={11} className="text-slate-400 flex-shrink-0" />
                      {r.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
