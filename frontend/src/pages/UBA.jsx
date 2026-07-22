import React, { useState } from 'react';
import { ShieldAlert, User, Compass, HelpCircle } from 'lucide-react';
import CyberCard from '../components/CyberCard';

const UBA = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 'uba_001',
      user: 'j.doe@company.ai',
      riskScore: 92,
      category: 'Impossible Travel Anomaly',
      description: 'Account logged in from Moscow, RU, followed by an active session entry from New York, US within 12 minutes.',
      sourceIp: '185.220.101.5',
      status: 'Active'
    },
    {
      id: 'uba_002',
      user: 'sys_admin_backup',
      riskScore: 78,
      category: 'Privilege Escalation Attempt',
      description: 'Execution of sudo credentials from a non-whitelisted workstation subnet targeting user permissions.',
      sourceIp: '10.0.0.12',
      status: 'Active'
    },
    {
      id: 'uba_003',
      user: 'finance_ops',
      riskScore: 85,
      category: 'Dormant Account Reactivation',
      description: 'Account inactive for 180 days suddenly transferred 14.5 GB of financial balance records.',
      sourceIp: '109.244.12.87',
      status: 'Active'
    }
  ]);

  const handleMitigate = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Mitigated' } : a));
  };

  return (
    <div className="space-y-6">
      {/* Risk Metrics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CyberCard title="UBA Fleet Risk Level" icon={User}>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold text-cyber-warning">HIGH</span>
            <span className="text-xs font-mono text-slate-500">POLICY INFRINGEMENT</span>
          </div>
        </CyberCard>
        <CyberCard title="Dormant Audited Accounts" icon={Compass}>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold text-white">124</span>
            <span className="text-xs font-mono text-slate-500">MONITORED</span>
          </div>
        </CyberCard>
        <CyberCard title="Average Active Risk Score" icon={ShieldAlert}>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold text-cyber-critical">85 / 100</span>
            <span className="text-xs font-mono text-slate-500">ANOMALY INDEX</span>
          </div>
        </CyberCard>
      </div>

      {/* Main Alerts Feed Table */}
      <CyberCard title="User Behaviour Analytics Anomalies Feed" icon={ShieldAlert}>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                <th className="pb-2">Target Account</th>
                <th className="pb-2">Anomaly Category</th>
                <th className="pb-2">Risk</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-cyber-secondary flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span>{alert.user}</span>
                  </td>
                  <td className="py-3 font-mono text-cyber-accent uppercase">{alert.category}</td>
                  <td className="py-3">
                    <span className={`font-mono font-bold ${
                      alert.riskScore >= 80 ? 'text-cyber-critical' : 'text-cyber-warning'
                    }`}>
                      {alert.riskScore}%
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 max-w-sm leading-normal">{alert.description}</td>
                  <td className="py-3 text-right">
                    {alert.status === 'Mitigated' ? (
                      <span className="px-2 py-0.5 bg-cyber-safe/10 border border-cyber-safe/20 text-cyber-safe font-mono text-[10px] uppercase rounded-sm font-bold">
                        MITIGATED
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleMitigate(alert.id)}
                        className="px-2.5 py-1 bg-cyber-critical/10 border border-cyber-critical/20 hover:bg-cyber-critical/20 text-cyber-critical font-mono text-[10px] uppercase rounded-sm font-bold transition-all"
                      >
                        ISOLATE HOST
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CyberCard>
    </div>
  );
};

export default UBA;
