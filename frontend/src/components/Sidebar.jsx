import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  FileText, 
  Cpu, 
  UserCheck, 
  Activity, 
  AlertOctagon, 
  Globe, 
  MessageSquare, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Log Management', path: '/logs', icon: FileText },
    { name: 'AI Threat Analyzer', path: '/ai-detection', icon: Cpu },
    { name: 'User Behaviour', path: '/uba', icon: UserCheck },
    { name: 'Network Anomaly', path: '/network', icon: Activity },
    { name: 'Incidents', path: '/incidents', icon: AlertOctagon },
    { name: 'Threat Intel', path: '/threat-intel', icon: Globe },
    { name: 'AI Chatbot', path: '/chatbot', icon: MessageSquare },
    { name: 'Reports', path: '/reports', icon: BarChart3 }
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-cyber-primary border-r border-white/5 flex flex-col h-screen select-none">
      {/* Platform Branding */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-sky-500 via-blue-600 to-cyan-400 flex items-center justify-center shadow-cyber">
          <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-sm tracking-wide text-white uppercase leading-none">DarkWatch AI</h1>
          <span className="font-mono text-[9px] text-cyber-accent tracking-widest uppercase">PREDICT. DETECT. DEFEND.</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-sm font-sans text-xs tracking-wider transition-all duration-200 uppercase ${
                isActive 
                  ? 'bg-gradient-to-r from-sky-500/10 to-transparent border-l-2 border-cyber-accent text-white font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Information and Logout */}
      <div className="p-4 border-t border-white/5 bg-cyber-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-sans text-xs font-semibold text-white truncate max-w-[120px]">
              {user ? user.username : 'Analyst'}
            </span>
            <span className="font-mono text-[9px] text-cyber-accent font-bold uppercase">
              {user ? user.role : 'SOC Analyst'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded-sm hover:bg-white/5 text-slate-400 hover:text-cyber-critical transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
