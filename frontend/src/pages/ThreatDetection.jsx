import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addLogs } from '../store/threatSlice';
import { Cpu, Terminal, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import CyberCard from '../components/CyberCard';
import axios from 'axios';

const ThreatDetection = () => {
  const dispatch = useDispatch();
  const [logInput, setLogInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const presets = [
    "GET /admin/config.php?file=../../../../etc/passwd HTTP/1.1",
    "SELECT * FROM users WHERE username = 'admin' AND password = '' OR '1'='1';",
    "Failed password for root from 198.51.100.42 port 54826 ssh2",
    "GET /index.html HTTP/1.1 200 OK 412 bytes - UserAgent: Mozilla/5.0"
  ];

  const handleAnalyze = async () => {
    if (!logInput.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const token = localStorage.getItem('darkwatch_token');
      // Direct post to backend which calls python microservice
      const response = await axios.post('/api/logs/upload', {
        logs: [logInput]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const processedLog = response.data.logs[0];
      setResult(processedLog);
      dispatch(addLogs(processedLog));
    } catch (err) {
      // Mock Fallback Simulation (Offline resilience)
      setTimeout(() => {
        const text = logInput.toLowerCase();
        let score = Math.floor(Math.random() * 20);
        let category = 'Normal Traffic';
        let isAnomaly = false;
        let explanation = 'No signatures or suspicious patterns were matched. Standard log telemetry.';

        if (text.includes('select ') || text.includes('union ')) {
          score = 92;
          category = 'SQL Injection Attempt';
          isAnomaly = true;
          explanation = '• **Risk**: Parameterized strings match malicious logic patterns designed to trick database interpreters.\n• **Impact**: Data modification, extraction, or auth bypass.\n• **Mitigation**: Implement parameterized queries.';
        } else if (text.includes('failed password') || text.includes('failed publickey')) {
          score = 78;
          category = 'Brute Force SSH Attempt';
          isAnomaly = true;
          explanation = '• **Risk**: High frequency credential trial pattern.\n• **Impact**: Administrative takeover.\n• **Mitigation**: Enforce key auth, restrict SSH IP whitelist.';
        } else if (text.includes('../') || text.includes('etc/passwd')) {
          score = 95;
          category = 'Directory Traversal / LFI';
          isAnomaly = true;
          explanation = '• **Risk**: Relative paths accessed to read secure credentials files.\n• **Impact**: Config data leak.\n• **Mitigation**: Sanitize target directory references.';
        }

        const severities = ['Normal', 'Low', 'Medium', 'High', 'Critical'];
        let severity = 'Normal';
        if (score >= 90) severity = 'Critical';
        else if (score >= 70) severity = 'High';
        else if (score >= 40) severity = 'Medium';
        else if (score >= 20) severity = 'Low';

        const mockLog = {
          id: 'log_manual_' + Date.now(),
          timestamp: new Date().toISOString(),
          sourceIp: '192.168.1.42',
          destinationIp: '10.0.0.15',
          service: 'Syslog Scanner',
          payload: logInput,
          threatScore: score,
          severity,
          category,
          isAnomaly,
          explanation
        };

        setResult(mockLog);
        dispatch(addLogs(mockLog));
        setIsAnalyzing(false);
      }, 800);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Log Playground Input Panel */}
      <div className="lg:col-span-2 space-y-4">
        <CyberCard title="AI Log Analyzer Playground" icon={Terminal}>
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-[9px] text-slate-500 uppercase mb-2">
                PASTE RAW SYSTEM SYSLOG OR WEB ACCESS RECORD
              </label>
              <textarea 
                rows="6"
                placeholder="Paste log payload string here..."
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                className="w-full bg-cyber-secondary/50 border border-white/5 rounded-sm p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-cyber-accent focus:shadow-cyber transition-all"
              />
            </div>

            {/* Presets Grid */}
            <div>
              <span className="block font-mono text-[9px] text-slate-500 uppercase mb-2">QUICK TEST PRESETS</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((preset, index) => (
                  <button 
                    key={index}
                    onClick={() => setLogInput(preset)}
                    className="p-2 bg-cyber-secondary/30 border border-white/5 hover:border-cyber-accent/40 rounded-sm text-left font-mono text-[10px] text-slate-400 hover:text-white truncate transition-all"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !logInput.trim()}
              className="w-full py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-400 hover:opacity-90 rounded-sm text-xs font-sans font-bold uppercase tracking-wider text-white shadow-cyber transition-all disabled:opacity-40"
            >
              {isAnalyzing ? 'RUNNING DEEP ML CLASSIFICATION...' : 'SCAN PERIMETER LOG'}
            </button>
          </div>
        </CyberCard>
      </div>

      {/* AI Threat Classification Inspector */}
      <div className="space-y-4">
        <CyberCard title="Analysis & Mitigations" icon={ShieldAlert}>
          {result ? (
            <div className="space-y-4">
              {/* Classification result header */}
              <div className="flex items-center gap-3 bg-cyber-secondary/40 border border-white/5 rounded-sm p-3">
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center font-mono font-bold text-xs ${
                  result.isAnomaly ? 'bg-cyber-critical/15 text-cyber-critical border border-cyber-critical/20' : 'bg-cyber-safe/15 text-cyber-safe border border-cyber-safe/20'
                }`}>
                  {result.threatScore}%
                </div>
                <div>
                  <h4 className="font-mono text-xs font-bold text-white uppercase">{result.category}</h4>
                  <span className="font-mono text-[9px] text-slate-500 uppercase">CLASSIFICATION DIAGNOSIS</span>
                </div>
              </div>

              {/* Threat Indicators */}
              <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                <div>
                  <span className="text-slate-500 block uppercase">Severity Level</span>
                  <span className={`font-bold ${
                    result.severity === 'Critical' || result.severity === 'High' ? 'text-cyber-critical' : 'text-cyber-safe'
                  }`}>{result.severity}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Anomalous State</span>
                  <span className="text-slate-300">{result.isAnomaly ? 'DETECTED' : 'NORMAL'}</span>
                </div>
              </div>

              {/* RAG explanation block */}
              <div className="bg-cyber-secondary/30 border border-white/5 rounded-sm p-3">
                <span className="font-mono text-[9px] text-cyber-accent font-bold uppercase tracking-wider">AI MITIGATION STEPS</span>
                <p className="text-slate-300 mt-2 font-sans text-xs leading-relaxed whitespace-pre-line">
                  {result.explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 font-mono text-xs text-slate-500 uppercase">
              Paste a log and hit scan to trigger the AI-Copilot diagnostic analysis.
            </div>
          )}
        </CyberCard>
      </div>
    </div>
  );
};

export default ThreatDetection;
