import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  Terminal, 
  AlertTriangle, 
  Compass, 
  Server, 
  Cpu 
} from 'lucide-react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import CyberCard from '../components/CyberCard';
import axios from 'axios';
import { setMetrics } from '../store/threatSlice';

const COLORS = ['#ef4444', '#facc15', '#38bdf8', '#22c55e'];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { metrics, logs } = useSelector((state) => state.threat);

  useEffect(() => {
    // Fetch metrics from backend
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('darkwatch_token');
        const response = await axios.get('/api/metrics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(setMetrics(response.data));
      } catch (err) {
        // Fallback handled via initial state in Redux threatSlice
      }
    };
    fetchStats();
  }, [dispatch]);

  // Aggregate log categories for pie chart
  const logCategories = logs.reduce((acc, log) => {
    const category = log.category || 'General';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const catData = Object.keys(logCategories).map(key => ({
    name: key,
    value: logCategories[key]
  }));

  return (
    <div className="space-y-6">
      {/* Top Threat Indicator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Security Score */}
        <CyberCard title="Security Health Score" icon={ShieldAlert} glow={metrics.healthScore < 80} glowColor="red">
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold tracking-tight text-white">{metrics.healthScore}%</span>
            <span className={`text-xs font-mono font-semibold uppercase ${metrics.healthScore >= 80 ? 'text-cyber-safe' : 'text-cyber-warning'}`}>
              {metrics.healthScore >= 80 ? 'STABLE' : 'VULNERABLE'}
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-cyber-safe transition-all duration-500" 
              style={{ width: `${metrics.healthScore}%` }}
            />
          </div>
        </CyberCard>

        {/* Avg Threat Index */}
        <CyberCard title="Average Threat Index" icon={Activity}>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold tracking-tight text-cyber-warning">
              {metrics.avgThreatScore}
            </span>
            <span className="text-xs font-mono text-slate-500 uppercase">RISK VALUE</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyber-warning to-cyber-critical transition-all duration-500" 
              style={{ width: `${metrics.avgThreatScore}%` }}
            />
          </div>
        </CyberCard>

        {/* Logs Monitored */}
        <CyberCard title="Threat Telemetry Logs" icon={TrendingUp}>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold tracking-tight text-white">
              {metrics.logsCount}
            </span>
            <span className="text-xs font-mono text-cyber-accent uppercase">INGESTED</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-3 uppercase tracking-wider">
            Average Rate: 120 EPS (Events / sec)
          </div>
        </CyberCard>

        {/* Active Incidents */}
        <CyberCard title="Unresolved Incidents" icon={AlertTriangle} glow={metrics.unresolvedIncidents > 0} glowColor="red">
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold tracking-tight text-cyber-critical">
              {metrics.unresolvedIncidents}
            </span>
            <span className="text-xs font-mono text-slate-500 uppercase">ACTIVE LEAKS</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-3 uppercase tracking-wider">
            Critical response SLA: 4.2 minutes
          </div>
        </CyberCard>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Graph: Attack Timeline */}
        <div className="lg:col-span-2">
          <CyberCard title="Attack Timeline Overview" icon={Compass}>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontStyle="italic" />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px' }}
                    labelStyle={{ color: '#0ea5e9', fontSize: '11px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="Anomalies" stroke="#ef4444" fillOpacity={1} fill="url(#colorAnomalies)" />
                  <Area type="monotone" dataKey="Normal" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorNormal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CyberCard>
        </div>

        {/* Threat Distribution Pie */}
        <CyberCard title="Threat Classification Share" icon={Terminal}>
          <div className="h-64 mt-4 flex items-center justify-center relative">
            {catData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {catData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px' }}
                    itemStyle={{ fontSize: '10px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="font-mono text-xs text-slate-500">NO TELEMETRY RECORDED</span>
            )}
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-lg font-bold text-white">{logs.length}</span>
              <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">TOTAL LOGS</span>
            </div>
          </div>
        </CyberCard>
      </div>

      {/* Critical Assets and MITRE Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Asset Monitor */}
        <CyberCard title="High-Risk Assets Under Monitor" icon={Server}>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                  <th className="pb-2">Asset Name</th>
                  <th className="pb-2">IP Address</th>
                  <th className="pb-2">Vulnerability Risk</th>
                  <th className="pb-2">Pending Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics.highRiskAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 text-white font-medium">{asset.name}</td>
                    <td className="py-2 font-mono text-slate-400">{asset.ip}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${asset.risk >= 80 ? 'bg-cyber-critical' : 'bg-cyber-warning'}`}
                            style={{ width: `${asset.risk}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-300">{asset.risk}%</span>
                      </div>
                    </td>
                    <td className="py-2 font-mono text-cyber-critical font-bold">{asset.alerts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CyberCard>

        {/* MITRE ATT&CK Correlation Grid */}
        <CyberCard title="MITRE ATT&CK Core Alignment" icon={Cpu}>
          <div className="space-y-3 mt-3">
            {metrics.mitreMapping.map((item, idx) => (
              <div key={idx} className="bg-cyber-secondary/30 border border-white/5 rounded-sm p-2 flex justify-between items-center hover:border-cyber-accent/35 transition-all">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-cyber-accent font-bold uppercase tracking-wider">{item.tactic}</span>
                  <span className="font-sans text-xs text-slate-200 mt-0.5">{item.technique}</span>
                </div>
                <div className="px-2 py-0.5 bg-cyber-critical/10 border border-cyber-critical/20 rounded-sm text-cyber-critical font-mono text-[10px] font-bold">
                  {item.count} hits
                </div>
              </div>
            ))}
          </div>
        </CyberCard>
      </div>

      {/* Threat Intel Sources and Countries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Target Attacking IPs */}
        <CyberCard title="Top Target Attacking IP Nodes" icon={Terminal}>
          <div className="space-y-2.5 mt-2">
            {metrics.topIps.map((node, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-white">{node.ip}</span>
                  <span className="font-mono text-[9px] text-slate-500 uppercase">{node.org}</span>
                </div>
                <span className="font-mono text-xs font-bold text-cyber-warning">{node.count} BLOCKED HITS</span>
              </div>
            ))}
          </div>
        </CyberCard>

        {/* Threat Origin Countries */}
        <CyberCard title="Primary Threat Origin Clusters" icon={Compass}>
          <div className="space-y-2.5 mt-2">
            {metrics.topCountries.map((country, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <span className="text-xs text-slate-200">{country.name} ({country.code})</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyber-accent"
                      style={{ width: `${(country.count / 48) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-slate-400 font-bold">{country.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CyberCard>
      </div>
    </div>
  );
};

export default Dashboard;
