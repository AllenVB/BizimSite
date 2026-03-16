import { Home, Users, CreditCard, MessageSquare, LogOut, Settings, Megaphone, AlertTriangle, Building2, History, BarChart2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = isAdmin ? null : JSON.parse(localStorage.getItem('currentUser')) || {};

  const menuItems = isAdmin ? [
    { icon: <Home size={20} />, text: 'Genel Bakış', path: '/admin' },
    { icon: <Users size={20} />, text: 'Sakin Yönetimi', path: '/admin/users' },
    { icon: <Building2 size={20} />, text: 'Blok Yönetimi', path: '/admin/blocks' },
    { icon: <CreditCard size={20} />, text: 'Mali Durum', path: '/admin/finances' },
    { icon: <Megaphone size={20} />, text: 'Duyurular', path: '/admin/announcements' },
    { icon: <AlertTriangle size={20} />, text: 'Talepler', path: '/admin/complaints' },
    { icon: <BarChart2 size={20} />, text: 'Raporlar', path: '/admin/reports' },
    { icon: <MessageSquare size={20} />, text: 'Sohbet Paneli', path: '/admin/chat' },
  ] : [
    { icon: <Home size={20} />, text: 'Ana Sayfa', path: '/resident' },
    { icon: <CreditCard size={20} />, text: 'Aidat Öde', path: '/resident/payments' },
    { icon: <History size={20} />, text: 'Ödeme Geçmişi', path: '/resident/payment-history' },
    { icon: <Megaphone size={20} />, text: 'Duyurular', path: '/resident/announcements' },
    { icon: <AlertTriangle size={20} />, text: 'Taleplerim', path: '/resident/complaints' },
    { icon: <MessageSquare size={20} />, text: 'Sakinler Sohbet', path: '/resident/chat' },
    { icon: <CreditCard size={20} />, text: 'Mali Durum', path: '/resident/finances' },
    { icon: <BarChart2 size={20} />, text: 'Raporlar', path: '/resident/reports' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-700 text-white flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
      <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
        BizimSite
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && item.path !== '/resident' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.text}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-800 p-4">
        {!isAdmin && (
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer group mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700">
              {currentUser.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.block} Blok - No: {currentUser.no}</p>
            </div>
            <button onClick={() => navigate('/resident/settings')} className="text-slate-500 group-hover:text-white transition-colors">
              <Settings size={18} />
            </button>
          </div>
        )}

        <button onClick={() => navigate('/login')} className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 p-2 transition-colors">
          <LogOut size={16} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
