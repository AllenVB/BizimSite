import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import ResidentDashboard from './pages/ResidentDashboard';
import ChatPanel from './pages/ChatPanel';
import ProfileSettings from './pages/ProfileSettings';
import FinancialManagement from './pages/FinancialManagement';
import AidatOde from './pages/AidatOde';
import Sidebar from './components/Sidebar';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Paneli Rotası */}
       <Route path="/admin/*" element={
  <div className="flex">
    <Sidebar isAdmin={true} />
    <div className="flex-1">
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/chat" element={<ChatPanel />} />
        <Route path="/finances" element={<FinancialManagement isAdmin={true} />} />
      </Routes>
    </div>
  </div>
          } 
        />

        {/* Sakin Paneli Rotası */}
        <Route path="/resident/*" element={
  <div className="flex">
    <Sidebar isAdmin={false} />
    <div className="flex-1">
      <Routes>
        <Route path="/" element={<ResidentDashboard />} />
        <Route path="/payments" element={<AidatOde />} />
        <Route path="/chat" element={<ChatPanel />} />
        <Route path="/settings" element={<ProfileSettings />} />
        <Route path="/finances" element={<FinancialManagement isAdmin={false} />} />
      </Routes>
    </div>
  </div>
          } 
        />

        {/* Bilinmeyen tüm yolları login'e yönlendir */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;