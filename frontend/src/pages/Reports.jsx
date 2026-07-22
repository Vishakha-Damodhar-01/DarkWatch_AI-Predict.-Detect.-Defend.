import React, { useState } from 'react';
import { BarChart3, Download, FileText, CheckCircle } from 'lucide-react';
import CyberCard from '../components/CyberCard';

const Reports = () => {
  const [downloadMsg, setDownloadMsg] = useState('');

  const triggerDownloadSim = (reportName, format) => {
    setDownloadMsg(`Compiling cryptographic telemetry for ${reportName}.${format}...`);
    setTimeout(() => {
      setDownloadMsg(`Report ${reportName}.${format} downloaded successfully.`);
      setTimeout(() => setDownloadMsg(''), 3000);
      
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob([`DarkWatch AI - Executive Report: ${reportName}\nGenerated on ${new Date().toISOString()}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${reportName.toLowerCase().replace(/\s+/g, '_')}.${format === 'Excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(element);
      element.click();
      element.remove();
    }, 1200);
  };

  const reportsList = [
    { name: 'Q2 Critical Infrastructure Threat Assessment', type: 'Executive Report', date: '2026-07-22' },
    { name: 'Weekly Incident SLA Audit Report', type: 'SOC Audit', date: '2026-07-15' },
    { name: 'MITRE ATT&CK Mapping Analysis Log', type: 'Compliance', date: '2026-07-01' }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CyberCard title="Compliance Health Status" icon={BarChart3}>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold text-cyber-safe">100%</span>
            <span className="text-xs font-mono text-slate-500">ISO 27001 AUDITED</span>
          </div>
        </CyberCard>
        <CyberCard title="Average Mitigation Time" icon={FileText}>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-mono font-bold text-white">4.2 mins</span>
            <span className="text-xs font-mono text-slate-500">SLA RESPONSE TARGET</span>
          </div>
        </CyberCard>
      </div>

      {/* Reports List */}
      <CyberCard title="SOC Compliance Reports Repository" icon={FileText}>
        {downloadMsg && (
          <div className="mb-4 font-mono text-[10px] text-cyber-info bg-cyber-info/5 border border-cyber-info/10 rounded-sm p-2 animate-pulse">
            {downloadMsg}
          </div>
        )}

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                <th className="pb-2">Report Document Name</th>
                <th className="pb-2">Category type</th>
                <th className="pb-2">Generation Date</th>
                <th className="pb-2 text-right">Download Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {reportsList.map((rep, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 text-white font-sans font-medium">{rep.name}</td>
                  <td className="py-3 text-cyber-accent uppercase text-[10px]">{rep.type}</td>
                  <td className="py-3 text-slate-400">{rep.date}</td>
                  <td className="py-3 text-right space-x-2">
                    <button 
                      onClick={() => triggerDownloadSim(rep.name, 'PDF')}
                      className="px-2 py-0.5 bg-cyber-secondary border border-white/5 hover:border-cyber-accent/50 text-[10px] uppercase text-slate-300 hover:text-white rounded-sm transition-colors"
                    >
                      PDF
                    </button>
                    <button 
                      onClick={() => triggerDownloadSim(rep.name, 'Excel')}
                      className="px-2 py-0.5 bg-cyber-secondary border border-white/5 hover:border-cyber-accent/50 text-[10px] uppercase text-slate-300 hover:text-white rounded-sm transition-colors"
                    >
                      EXCEL
                    </button>
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

export default Reports;
