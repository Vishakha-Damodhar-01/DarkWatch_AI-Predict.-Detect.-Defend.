import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import { useSelector } from 'react-redux';

// Layout & Styling
import './index.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LogManagement from './pages/LogManagement';
import ThreatDetection from './pages/ThreatDetection';
import UBA from './pages/UBA';
import NetworkAnomaly from './pages/NetworkAnomaly';
import IncidentResponse from './pages/IncidentResponse';
import ThreatIntel from './pages/ThreatIntel';
import SecurityChatbot from './pages/SecurityChatbot';
import Reports from './pages/Reports';

// Protected Route Wrapper
const ProtectedLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cyber-primary text-cyber-text">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main dashboard content space */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header />
        
        <main className="flex-1 p-8 overflow-y-auto cyber-grid">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<LogManagement />} />
            <Route path="/ai-detection" element={<ThreatDetection />} />
            <Route path="/uba" element={<UBA />} />
            <Route path="/network" element={<NetworkAnomaly />} />
            <Route path="/incidents" element={<IncidentResponse />} />
            <Route path="/threat-intel" element={<ThreatIntel />} />
            <Route path="/chatbot" element={<SecurityChatbot />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>
);
