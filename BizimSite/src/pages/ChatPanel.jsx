import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

const ChatPanel = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    setMessages(savedMessages);
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: currentUser.name,
      text: newMessage,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Sakinler Sohbet Paneli</h1>
      
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 py-8">Henüz mesaj yok. İlk mesajı sen gönder!</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === currentUser.name ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === currentUser.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  <p className="text-xs font-semibold opacity-70 mb-1">{msg.sender}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-60 mt-1">{msg.time}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınız..."
            className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
