import { useEffect } from 'react';
import { Home, Trash2, Megaphone, AlertTriangle, LogOut, MessageSquare, Users, CreditCard, Building2, History, BarChart2, Shield, Settings, PackageOpen, MessageSquarePlus } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isAdmin, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const isKapici = currentUser.role === 'kapici';
  const planType = currentUser.planType || 'basic';
  const isPremium = planType === 'premium' || planType === 'enterprise';
  const hasKapici = isKapici || currentUser.hasKapici === true;

  // Rota değişince mobilde sidebar'ı kapat
  useEffect(() => { onClose?.(); }, [location.pathname]);

  // Sidebar açıkken body scroll'u kilitle (mobil kaydırma çubuğu görünmesin)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const adminItems = [
    { icon: <Home size={20} />, text: 'Genel Bakis', path: '/admin' },
    { icon: <Users size={20} />, text: 'Sakin Yonetimi', path: '/admin/users' },
    { icon: <Building2 size={20} />, text: 'Blok Yonetimi', path: '/admin/blocks' },
    { icon: <CreditCard size={20} />, text: 'Mali Durum', path: '/admin/finances' },
    { icon: <Megaphone size={20} />, text: 'Duyurular', path: '/admin/announcements' },
    { icon: <AlertTriangle size={20} />, text: 'Talepler', path: '/admin/complaints' },
    { icon: <BarChart2 size={20} />, text: 'Raporlar', path: '/admin/reports', premium: true },
    { icon: <Shield size={20} />, text: 'Yoneticiler', path: '/admin/admins' },
    { icon: <MessageSquare size={20} />, text: 'Sohbet Paneli', path: '/admin/chat' },
    { icon: <Trash2 size={20} />, text: 'Cop Takibi', path: '/admin/cop', kapici: true },
    { icon: <PackageOpen size={20} />, text: 'Odunc Paneli', path: '/admin/odunc', premium: true },
    { icon: <MessageSquarePlus size={20} />, text: 'Geri Bildirim', path: '/admin/feedback' },
  ];

  const residentItems = [
    { icon: <Home size={20} />, text: 'Ana Sayfa', path: '/resident' },
    { icon: <CreditCard size={20} />, text: 'Aidat Ode', path: '/resident/payments' },
    { icon: <History size={20} />, text: 'Odeme Gecmisi', path: '/resident/payment-history' },
    { icon: <Megaphone size={20} />, text: 'Duyurular', path: '/resident/announcements' },
    { icon: <AlertTriangle size={20} />, text: 'Taleplerim', path: '/resident/complaints' },
    { icon: <MessageSquare size={20} />, text: 'Sakinler Sohbet', path: '/resident/chat' },
    { icon: <Shield size={20} />, text: 'Yoneticiler', path: '/resident/admins' },
    { icon: <CreditCard size={20} />, text: 'Mali Durum', path: '/resident/finances' },
    { icon: <BarChart2 size={20} />, text: 'Raporlar', path: '/resident/reports', premium: true },
    { icon: <Trash2 size={20} />, text: 'Cop Takibi', path: '/resident/cop', kapici: true },
    { icon: <PackageOpen size={20} />, text: 'Odunc Paneli', path: '/resident/odunc', premium: true },
    { icon: <MessageSquarePlus size={20} />, text: 'Geri Bildirim', path: '/resident/feedback' },
  ];

  const kapiciItems = [
    { icon: <Home size={20} />, text: 'Ana Sayfa', path: '/kapici' },
    { icon: <Trash2 size={20} />, text: 'Cop Takibi', path: '/kapici/cop' },
    { icon: <Megaphone size={20} />, text: 'Duyurular', path: '/kapici/announcements' },
    { icon: <AlertTriangle size={20} />, text: 'Talepler', path: '/kapici/complaints' },
    { icon: <MessageSquarePlus size={20} />, text: 'Geri Bildirim', path: '/kapici/feedback' },
  ];

  const allItems = isKapici ? kapiciItems : isAdmin ? adminItems : residentItems;
  const menuItems = allItems.filter(item =>
    (!item.premium || isPremium) &&
    (!item.kapici || hasKapici)
  );
  const basePath = isKapici ? '/kapici' : isAdmin ? '/admin' : '/resident';

  return (
    <>
      {/* Mobil overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`w-64 h-screen bg-slate-900 border-r border-slate-700 text-white flex flex-col fixed left-0 top-0 z-50 shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
          BizimSite
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item, i) => {
            const isActive = location.pathname === item.path ||
              (item.path !== basePath && location.pathname.startsWith(item.path));
            return (
              <Link key={i} to={item.path}
                className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}>
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer group mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700 text-sm ring-2 ring-blue-400/20 hover:ring-blue-400/50 transition-all duration-200">
              {currentUser.name?.substring(0, 2).toUpperCase() || 'KP'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser.name || 'Kullanici'}</p>
              <p className="text-xs text-slate-400">
                {isKapici ? 'Kapici' : isAdmin ? (currentUser.isMainAdmin ? 'Ana Yonetici' : 'Yonetici') : `${currentUser.block} Blok - No: ${currentUser.no}`}
              </p>
              {isAdmin && (
                <span className={`inline-flex items-center mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  planType === 'enterprise' ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/30' :
                  planType === 'premium'    ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30' :
                                             'bg-slate-600/60 text-slate-400 ring-1 ring-slate-500/30'
                }`}>
                  {planType === 'enterprise' ? '⭐ Enterprise' : planType === 'premium' ? '✦ Premium' : '· Basic'}
                </span>
              )}
            </div>
            {!isAdmin && (
              <button onClick={() => navigate(`${basePath}/settings`)} className="text-slate-500 group-hover:text-white transition-colors">
                <Settings size={18} />
              </button>
            )}
          </div>
          <button onClick={() => { localStorage.removeItem('currentUser'); localStorage.removeItem('token'); navigate('/login'); }}
            className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 active:scale-95 p-2 rounded-lg transition-all duration-150">
            <LogOut size={16} /> Cikis Yap
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
