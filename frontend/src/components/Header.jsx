import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, Bell, Shield, ShieldAlert, Cpu } from 'lucide-react';

const Header = () => {
  const { metrics } = useSelector((state) => state.threat);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUTC = (date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  return (
    <header className="h-16 border-b border-white/5 bg-cyber-primary/95 flex items-center justify-between px-8 select-none z-10">
      {/* Global Search and Shortcuts */}
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Global search logs, assets, or CVEs..." 
            className="w-full bg-cyber-secondary/50 border border-white/5 rounded-sm pl-9 pr-4 py-1.5 font-sans text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyber-accent focus:shadow-cyber transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/5 border border-white/10 rounded-sm px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Real-time System Gauges & Meta */}
      <div className="flex items-center gap-6">
        {/* System Health Score */}
        <div className="flex items-center gap-2 border-r border-white/5 pr-6">
          <div className="relative flex items-center justify-center">
            <Shield className="w-8 h-8 text-cyber-safe opacity-20" />
            <Cpu className="w-4 h-4 text-cyber-safe absolute" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-cyber-safe leading-none">{metrics.healthScore}%</span>
            <span className="font-mono text-[9px] text-slate-500 tracking-wide uppercase">PERIMETER HEALTH</span>
          </div>
        </div>

        {/* Critical Alerts Gauge */}
        <div className="flex items-center gap-2 border-r border-white/5 pr-6">
          <div className="relative flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-cyber-critical animate-cyber-pulse rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-cyber-critical leading-none">
              {metrics.criticalCount} ACTIVE
            </span>
            <span className="font-mono text-[9px] text-slate-500 tracking-wide uppercase">CRITICAL ALERTS</span>
          </div>
        </div>

        {/* Real-Time Clock */}
        <div className="flex flex-col text-right border-r border-white/5 pr-6">
          <span className="font-mono text-xs font-semibold text-slate-300 tabular-nums leading-none">
            {formatUTC(time)}
          </span>
          <span className="font-mono text-[9px] text-slate-500 tracking-wide uppercase">COMMAND TIME</span>
        </div>

        {/* Alerts Notification bell */}
        <button className="relative p-1.5 rounded-sm hover:bg-white/5 text-slate-400 hover:text-white transition-all">
          <Bell className="w-4 h-4" />
          {metrics.criticalCount > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyber-critical rounded-full animate-ping" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
