import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAnnouncements } from '../services/api';

const AnnouncementBell = ({ basePath, dark = false }) => {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAnnouncements();
        const seen = JSON.parse(localStorage.getItem('seenAnnouncements') || '[]');
        setUnread(res.data.filter(a => !seen.includes(a.id)).length);
      } catch {}
    };
    load();
  }, []);

  if (unread === 0) return null;

  return (
    <button
      onClick={() => navigate(`${basePath}/announcements`)}
      title={`${unread} okunmamış duyuru`}
      className={`relative p-2.5 rounded-xl transition-all duration-200 cursor-pointer
        ${dark
          ? 'bg-white/10 hover:bg-white/20 text-white'
          : 'bg-white hover:bg-blue-50 text-slate-600 shadow-sm border border-slate-100 hover:border-blue-200'
        }`}>
      <Bell size={20} />
      <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md shadow-red-500/30 animate-pulse">
        {unread > 9 ? '9+' : unread}
      </span>
    </button>
  );
};

export default AnnouncementBell;
