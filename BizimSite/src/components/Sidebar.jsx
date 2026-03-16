import { Home, Trash2, Megaphone, AlertTriangle, LogOut, MessageSquare, Users, CreditCard, Building2, History, BarChart2, Shield, Settings } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const isKapici = currentUser.role === 'kapici';

  const adminItems = [
    { icon: <Home size={20} />, text: 'Genel Bakis', path: '/admin' },
    { icon: <Users size={20} />, text: 'Sakin Yonetimi', path: '/admin/users' },
    { icon: <Building2 size={20} />, text: 'Blok Yonetimi', path: '/admin/blocks' },
    { icon: <CreditCard size={20} />, text: 'Mali Durum', path: '/admin/finances' },
    { icon: <Megaphone size={20} />, text: 'Duyurular', path: '/admin/announcements' },
    { icon: <AlertTriangle size={20} />, text: 'Talepler', path: '/admin/complaints' },
    { icon: <BarChart2 size={20} />, text: 'Raporlar', path: '/admin/reports' },
    { icon: <Shield size={20} />, text: 'Yoneticiler', path: '/admin/admins' },
    { icon: <MessageSquare size={20} />, text: 'Sohbet Paneli', path: '/admin/chat' },
    { icon: <Trash2 size={20} />, text: 'Cop Takibi', path: '/admin/cop' },
  ];

  const residentItems = [
    { icon: <Home size={20} />, text: 'Ana Sayfa', path: '/resident' },
    { icon: <CreditCard size={20} />, text: 'Aidat Ode', path: '/resident/payments' },
    { icon: <History size={20} />, text: 'Odeme Gecmisi', path: '/resident/payment-history' },
    { icon: <Megaphone size={20} />, text: 'Duyurular', path: '/resident/announcements' },
    { icon: <AlertTriangle size={20} />, text: 'Taleplerim', path: '/resident/complaints' },
    { icon: <MessageSquare size={20} />, text: 'Sakinler Sohbet', path: '/resident/chat' },
    { icon: <CreditCard size={20} />, text: 'Mali Durum', path: '/resident/finances' },
    { icon: <BarChart2 size={20} />, text: 'Raporlar', path: '/resident/reports' },
    { icon: <Trash2 size={20} />, text: 'Cop Takibi', path: '/resident/cop' },
  ];

  const kapiciItems = [
    { icon: <Home size={20} />, text: 'Ana Sayfa', path: '/kapici' },
    { icon: <Trash2 size={20} />, text: 'Cop Takibi', path: '/kapici/cop' },
    { icon: <Megaphone size={20} />, text: 'Duyurular', path: '/kapici/announcements' },
    { icon: <AlertTriangle size={20} />, text: 'Talepler', path: '/kapici/complaints' },
  ];

  const menuItems = isKapici ? kapiciItems : isAdmin ? adminItems : residentItems;
  const basePath = isKapici ? '/kapici' : isAdmin ? '/admin' : '/resident';

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-700 text-white flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
      <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
        BizimSite
      </div>
      <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path ||
            (item.path !== basePath && location.pathname.startsWith(item.path));
          return (
            <Link key={i} to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
              {item.icon}
              <span className="text-sm font-medium">{item.text}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer group mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700 text-sm">
            {currentUser.name?.substring(0,2).toUpperCase() || 'KP'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{currentUser.name || 'Kullanici'}</p>
            <p className="text-xs text-slate-400">
              {isKapici ? 'Kapici' : isAdmin ? (currentUser.isMainAdmin ? 'Ana Yonetici' : 'Yonetici') : `${currentUser.block} Blok - No: ${currentUser.no}`}
            </p>
          </div>
          {!isAdmin && (
            <button onClick={() => navigate(`${basePath}/settings`)} className="text-slate-500 group-hover:text-white transition-colors">
              <Settings size={18} />
            </button>
          )}
        </div>
        <button onClick={() => { localStorage.removeItem('currentUser'); navigate('/login'); }}
          className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 p-2 transition-colors">
          <LogOut size={16} /> Cikis Yap
        </button>
      </div>
    </div>
  );
};
export default Sidebar;
