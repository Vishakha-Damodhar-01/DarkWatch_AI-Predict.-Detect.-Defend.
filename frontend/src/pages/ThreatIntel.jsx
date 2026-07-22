import React from 'react';
import { Globe, AlertTriangle, Shield, Compass } from 'lucide-react';
import CyberCard from '../components/CyberCard';

const ThreatIntel = () => {
  const cves = [
    { cve: 'CVE-2024-21626', score: 8.6, severity: 'High', product: 'runC Container Escape Vulnerability', description: 'Internal file descriptors leak allows attackers to escape container sandboxes to host namespaces.' },
    { cve: 'CVE-2024-3094', score: 10.0, severity: 'Critical', product: 'XZ Utils Backdoor backdoor', description: 'Malicious code injection in SSH daemon build files bypasses authentication controls.' },
    { cve: 'CVE-2024-21887', score: 9.1, severity: 'Critical', product: 'Ivanti Connect Secure RCE', description: 'Command injection vulnerability in web components allows authentication bypass.' },
    { cve: 'CVE-2023-49103', score: 9.8, severity: 'Critical', product: 'ownCloud Graph API Credential leak', description: 'Container environments disclose admin passwords, mail servers, and secret keys.' }
  ];

  const malwares = [
    { name: 'DarkGate Loader', type: 'Trojan / Loader', target: 'Windows OS', signature: 'sha256:d8a9e7f...c32' },
    { name: 'LockBit 3.0', type: 'Ransomware', target: 'Active Directory', signature: 'sha256:91bcf23...2d1' },
    { name: 'Mirai Variant (Okiru)', type: 'IoT Botnet', target: 'Linux / ARM', signature: 'sha256:ef88c6a...b44' }
  ];

  const badIps = [
    { ip: '185.220.101.5', actor: 'Tor Exit Node / CozyBear', location: 'RU', severity: 'Critical' },
    { ip: '203.0.113.195', actor: 'Command & Control Web Server', location: 'CN', severity: 'High' },
    { ip: '109.244.12.87', actor: 'Active Bruteforce Bot', location: 'IR', severity: 'Medium' }
  ];

  return (
    <div className="space-y-6">
      {/* Top row - CVE vulnerabilities */}
      <CyberCard title="Latest CVE Vulnerability intelligence" icon={Globe}>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                <th className="pb-2">Vulnerability ID</th>
                <th className="pb-2">CVSS Score</th>
                <th className="pb-2">Impact Target</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {cves.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 text-cyber-critical font-bold">{item.cve}</td>
                  <td className="py-3 text-white">{item.score}</td>
                  <td className="py-3 text-slate-300 font-sans">{item.product}</td>
                  <td className="py-3 text-slate-400 font-sans text-[11px] leading-relaxed max-w-sm">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CyberCard>

      {/* Row 2 - Malware Signatures and Bad IPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Malware Catalogue */}
        <CyberCard title="Active Malware Signatures Catalogue" icon={Shield}>
          <div className="space-y-3.5 mt-2">
            {malwares.map((mal, idx) => (
              <div key={idx} className="bg-cyber-secondary/30 border border-white/5 rounded-sm p-3 hover:border-cyber-accent/35 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-sans text-xs font-bold text-white">{mal.name}</h4>
                    <span className="font-mono text-[9px] text-slate-500 uppercase">{mal.type} • Target: {mal.target}</span>
                  </div>
                  <span className="font-mono text-[9px] text-cyber-accent bg-cyber-accent/5 px-2 py-0.5 border border-cyber-accent/20 rounded-sm">SHA256</span>
                </div>
                <div className="mt-2 font-mono text-[10px] text-slate-400 bg-black/30 p-1.5 rounded-sm">
                  {mal.signature}
                </div>
              </div>
            ))}
          </div>
        </CyberCard>

        {/* IP Intelligence */}
        <CyberCard title="Active Rogues / C2 IP Blacklist" icon={Compass}>
          <div className="space-y-3.5 mt-2">
            {badIps.map((bad, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0 font-mono text-xs">
                <div className="flex flex-col">
                  <span className="text-white font-bold">{bad.ip}</span>
                  <span className="text-[9px] text-slate-500 uppercase font-sans mt-0.5">Actor: {bad.actor} ({bad.location})</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                  bad.severity === 'Critical' ? 'bg-cyber-critical/10 border border-cyber-critical/20 text-cyber-critical' : 'bg-cyber-warning/10 border border-cyber-warning/20 text-cyber-warning'
                }`}>
                  {bad.severity}
                </span>
              </div>
            ))}
          </div>
        </CyberCard>
      </div>
    </div>
  );
};

export default ThreatIntel;
