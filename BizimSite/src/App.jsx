import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const AdminLayout = () => (
  <div className="flex">
    <Sidebar isAdmin={true} />
    <div className="flex-1">
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/blocks" element={<BlockManagement />} />
        <Route path="/chat" element={<ChatPanel />} />
        <Route path="/finances" element={<FinancialManagement isAdmin={true} />} />
        <Route path="/announcements" element={<Announcements isAdmin={true} />} />
        <Route path="/complaints" element={<Complaints isAdmin={true} />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admins" element={<AdminManagement />} />
        <Route path="/cop" element={<CopTakibi />} />
        <Route path="/settings" element={<ProfileSettings />} />
      </Routes>
    </div>
  </div>
);

const ResidentLayout = () => (
  <div className="flex">
    <Sidebar isAdmin={false} />
    <div className="flex-1">
      <Routes>
        <Route path="/" element={<ResidentDashboard />} />
        <Route path="/payments" element={<AidatOde />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/chat" element={<ChatPanel />} />
        <Route path="/settings" element={<ProfileSettings />} />
        <Route path="/finances" element={<FinancialManagement isAdmin={false} />} />
        <Route path="/announcements" element={<Announcements isAdmin={false} />} />
        <Route path="/complaints" element={<Complaints isAdmin={false} />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/cop" element={<CopTakibi />} />
      </Routes>
    </div>
  </div>
);

const KapiciLayout = () => (
  <div className="flex">
    <Sidebar isAdmin={false} />
    <div className="flex-1">
      <Routes>
        <Route path="/" element={<KapiciHome />} />
        <Route path="/cop" element={<CopTakibi />} />
        <Route path="/announcements" element={<Announcements isAdmin={true} />} />
        <Route path="/complaints" element={<Complaints isAdmin={false} />} />
        <Route path="/settings" element={<ProfileSettings />} />
      </Routes>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/resident/*" element={<ResidentLayout />} />
        <Route path="/kapici/*" element={<KapiciLayout />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
export default App;
