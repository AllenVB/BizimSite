import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import ResidentDashboard from './pages/ResidentDashboard';
import KapiciHome from './pages/KapiciHome';
import ChatPanel from './pages/ChatPanel';
import ProfileSettings from './pages/ProfileSettings';
import FinancialManagement from './pages/FinancialManagement';
import AidatOde from './pages/AidatOde';
import Sidebar from './components/Sidebar';
import UserManagement from './pages/UserManagement';
import Announcements from './pages/Announcements';
import Complaints from './pages/Complaints';
import PaymentHistory from './pages/PaymentHistory';
import BlockManagement from './pages/BlockManagement';
import Reports from './pages/Reports';
import AdminManagement from './pages/AdminManagement';
import CopTakibi from './pages/CopTakibi';
import OduncPanel from './pages/OduncPanel';
import SuperAdminPanel from './pages/SuperAdminPanel';
import FeedbackPage from './pages/FeedbackPage';

/* Sayfa geçiş animasyonu — pathname değişince yeniden mount eder */
const AnimatedContent = ({ children }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter flex-1">
      {children}
    </div>
  );
};

/* Mobil üst bar — hamburger + logo */
const MobileTopBar = ({ onOpen }) => (
  <header className="md:hidden sticky top-0 z-30 bg-slate-900 px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-lg">
    <button
      onClick={onOpen}
      className="text-white p-2 rounded-lg hover:bg-slate-700 active:scale-90 transition-all duration-150"
      aria-label="Menüyü aç"
    >
      <Menu size={22} />
    </button>
    <span className="font-bold text-blue-400 text-lg">BizimSite</span>
  </header>
);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        isAdmin={true}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <MobileTopBar onOpen={() => setSidebarOpen(true)} />
        <AnimatedContent>
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/blocks" element={<BlockManagement />} />
            <Route path="/finances" element={<FinancialManagement isAdmin={true} />} />
            <Route path="/announcements" element={<Announcements isAdmin={true} />} />
            <Route path="/complaints" element={<Complaints isAdmin={true} />} />
            <Route path="/reports" element={<Reports isAdmin={true} />} />
            <Route path="/admins" element={<AdminManagement />} />
            <Route path="/cop" element={<CopTakibi />} />
            <Route path="/odunc" element={<OduncPanel />} />
            <Route path="/chat" element={<ChatPanel />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Routes>
        </AnimatedContent>
      </div>
    </div>
  );
};

const ResidentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        isAdmin={false}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <MobileTopBar onOpen={() => setSidebarOpen(true)} />
        <AnimatedContent>
          <Routes>
            <Route index element={<ResidentDashboard />} />
            <Route path="/payments" element={<AidatOde />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/chat" element={<ChatPanel />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/finances" element={<FinancialManagement isAdmin={false} />} />
            <Route path="/announcements" element={<Announcements isAdmin={false} />} />
            <Route path="/complaints" element={<Complaints isAdmin={false} />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/cop" element={<CopTakibi />} />
            <Route path="/odunc" element={<OduncPanel />} />
            <Route path="/admins" element={<AdminManagement isResident={true} />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Routes>
        </AnimatedContent>
      </div>
    </div>
  );
};

const KapiciLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        isAdmin={false}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <MobileTopBar onOpen={() => setSidebarOpen(true)} />
        <AnimatedContent>
          <Routes>
            <Route index element={<KapiciHome />} />
            <Route path="/cop" element={<CopTakibi />} />
            <Route path="/announcements" element={<Announcements isAdmin={true} />} />
            <Route path="/complaints" element={<Complaints isAdmin={false} />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Routes>
        </AnimatedContent>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/superadmin/*" element={<SuperAdminPanel />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/resident/*" element={<ResidentLayout />} />
        <Route path="/kapici/*" element={<KapiciLayout />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
export default App;
