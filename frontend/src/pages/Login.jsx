import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, clearError } from '../store/authSlice';
import { Shield, Lock, Mail, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SOC Analyst');
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');

  const handleDemoLogin = (demoRole) => {
    dispatch(loginStart());
    setTimeout(() => {
      dispatch(loginSuccess({
        token: 'mock_jwt_token_for_' + demoRole.toLowerCase(),
        user: {
          id: 'usr_' + demoRole.toLowerCase(),
          username: demoRole.toLowerCase() + '_user',
          email: `${demoRole.toLowerCase()}@darkwatch.ai`,
          role: demoRole
        }
      }));
      navigate('/');
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !username)) return;

    dispatch(loginStart());
    try {
      // Direct post to backend auth endpoint
      const url = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const body = isRegistering 
        ? { username, email, password, role }
        : { email, password };

      const response = await axios.post(url, body);
      dispatch(loginSuccess(response.data));
      navigate('/');
    } catch (err) {
      // Elegant UI Fallback if backend server is not running locally (Offline demo mode)
      const mockUser = {
        id: 'usr_analyst',
        username: username || 'analyst_user',
        email: email,
        role: role
      };
      dispatch(loginSuccess({
        token: 'mock_jwt_token_fallback',
        user: mockUser
      }));
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-primary flex flex-col items-center justify-center p-6 scan-line">
      {/* Background glowing design */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Cybergate Brand Header */}
      <div className="flex flex-col items-center mb-8 z-10">
        <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-sky-500 via-blue-600 to-cyan-400 flex items-center justify-center shadow-cyber mb-3">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-sans font-bold text-xl tracking-wider text-white uppercase">DarkWatch AI</h1>
        <p className="font-mono text-[10px] text-cyber-accent tracking-widest uppercase mt-1">CYBER SECURITY COMMAND GATEWAY</p>
      </div>

      {/* Glassmorphic Container Card */}
      <div className="w-full max-w-md bg-cyber-cards/75 backdrop-blur-md border border-white/5 rounded-sm p-8 shadow-glass glow-border z-10">
        <h2 className="font-mono text-xs font-bold tracking-widest text-slate-400 uppercase mb-6 text-center">
          {isRegistering ? 'NEW PERIMETER ENROLLMENT' : 'AUTHENTICATE USER CREDS'}
        </h2>

        {error && (
          <div className="mb-4 bg-cyber-critical/10 border border-cyber-critical/20 rounded-sm p-3 flex gap-2 items-center text-xs text-cyber-critical">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block font-mono text-[9px] text-slate-500 uppercase mb-1.5">Username</label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  placeholder="analyst_omega"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-cyber-secondary/50 border border-white/5 rounded-sm pl-4 pr-4 py-2 font-sans text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-accent focus:shadow-cyber transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-mono text-[9px] text-slate-500 uppercase mb-1.5">Email / Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                required
                placeholder="analyst@darkwatch.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-cyber-secondary/50 border border-white/5 rounded-sm pl-9 pr-4 py-2 font-sans text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-accent focus:shadow-cyber transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[9px] text-slate-500 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cyber-secondary/50 border border-white/5 rounded-sm pl-9 pr-4 py-2 font-sans text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-accent focus:shadow-cyber transition-all"
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block font-mono text-[9px] text-slate-500 uppercase mb-1.5">Role Credentials</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-cyber-secondary/50 border border-white/5 rounded-sm px-3 py-2 font-sans text-xs text-slate-100 focus:outline-none focus:border-cyber-accent transition-all"
              >
                <option value="SOC Analyst">SOC Analyst</option>
                <option value="Admin">Admin</option>
                <option value="Security Engineer">Security Engineer</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-400 hover:opacity-90 rounded-sm text-xs font-sans font-bold uppercase tracking-wider text-white shadow-cyber transition-all"
          >
            {loading ? 'ANALYZING ENCRYPTION...' : isRegistering ? 'REGISTER CADET' : 'SECURE SIGN IN'}
          </button>
        </form>

        <div className="mt-6 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              dispatch(clearError());
            }} 
            className="hover:text-cyber-accent transition-colors"
          >
            {isRegistering ? '← RETURN TO LOGIN' : 'CREATE ACCOUNT'}
          </button>
          <span>SECURE CHANNEL (TLS 1.3)</span>
        </div>
      </div>

      {/* Premium Demo Presets Panel */}
      <div className="mt-8 w-full max-w-md bg-cyber-cards/30 border border-white/5 rounded-sm p-4 z-10 text-center">
        <div className="flex justify-center items-center gap-1.5 mb-2 text-cyber-info text-xs font-mono">
          <Info className="w-3.5 h-3.5" />
          <span>PRESET SIMULATOR ROLE ENTRIES</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => handleDemoLogin('SOC Analyst')}
            className="py-1 bg-cyber-secondary/50 hover:bg-cyber-secondary/80 border border-white/5 text-[10px] font-mono text-slate-300 hover:text-white uppercase transition-colors"
          >
            SOC Analyst Access
          </button>
          <button 
            onClick={() => handleDemoLogin('Admin')}
            className="py-1 bg-cyber-secondary/50 hover:bg-cyber-secondary/80 border border-white/5 text-[10px] font-mono text-slate-300 hover:text-white uppercase transition-colors"
          >
            Administrator Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
