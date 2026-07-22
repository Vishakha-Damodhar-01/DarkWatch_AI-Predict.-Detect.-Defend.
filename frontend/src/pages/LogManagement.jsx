import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addLogs } from '../store/threatSlice';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Download, 
  SlidersHorizontal, 
  ShieldAlert, 
  Eye 
} from 'lucide-react';
import CyberCard from '../components/CyberCard';
import axios from 'axios';

const LogManagement = () => {
  const dispatch = useDispatch();
  const { logs } = useSelector((state) => state.threat);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Filtering Logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.payload.toLowerCase().includes(search.toLowerCase()) ||
      log.sourceIp.includes(search) ||
      log.destinationIp.includes(search) ||
      log.service.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  // Handle Drag Events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process and Upload Log File
  const processLogFile = async (file) => {
    setIsUploading(true);
    setUploadStatus('Reading file content...');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      
      setUploadStatus(`Analyzing ${lines.length} logs with Threat ML Engine...`);
      
      try {
        const token = localStorage.getItem('darkwatch_token');
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('/api/logs/upload', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          }
        });

        dispatch(addLogs(response.data.logs));
        setUploadStatus('Logs successfully processed and mapped to MITRE matrix.');
      } catch (err) {
        // Mock fallback simulation if backend is offline
        const mockProcessed = lines.map((line, idx) => {
          let score = Math.floor(Math.random() * 20);
          let cat = 'General Traffic';
          let isAnomaly = false;

          const lowerLine = line.toLowerCase();
          if (lowerLine.includes('select ') || lowerLine.includes('union ')) {
            score = 92;
            cat = 'SQL Injection Attempt';
            isAnomaly = true;
          } else if (lowerLine.includes('failed password') || lowerLine.includes('failed publickey')) {
            score = 78;
            cat = 'Brute Force SSH Attempt';
            isAnomaly = true;
          } else if (lowerLine.includes('../') || lowerLine.includes('etc/passwd')) {
            score = 95;
            cat = 'Directory Traversal / LFI';
            isAnomaly = true;
          }

          const severities = ['Normal', 'Low', 'Medium', 'High', 'Critical'];
          let severity = 'Normal';
          if (score >= 90) severity = 'Critical';
          else if (score >= 70) severity = 'High';
          else if (score >= 40) severity = 'Medium';
          else if (score >= 20) severity = 'Low';

          return {
            id: 'log_mock_' + (Date.now() + idx),
            timestamp: new Date().toISOString(),
            sourceIp: '198.51.100.' + Math.floor(Math.random() * 254 + 1),
            destinationIp: '10.0.0.15',
            service: lowerLine.includes('ssh') ? 'SSH' : 'HTTP',
            payload: line,
            threatScore: score,
            severity,
            category: cat,
            isAnomaly,
            explanation: isAnomaly ? `Anomalous pattern matching signature for ${cat}.` : 'Standard log profile.'
          };
        });

        dispatch(addLogs(mockProcessed));
        setUploadStatus(`Processed ${mockProcessed.length} logs locally (Demo Mode).`);
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadStatus(''), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processLogFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processLogFile(e.target.files[0]);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('darkwatch_token');
      const response = await axios.get('/api/logs/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'darkwatch_logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      // Fallback CSV Export in React Client
      let csvContent = 'data:text/csv;charset=utf-8,Timestamp,Source IP,Destination IP,Service,Threat Score,Severity,Category,Anomaly,Payload\n';
      logs.forEach(l => {
        const payloadEscaped = `"${l.payload.replace(/"/g, '""')}"`;
        csvContent += `${l.timestamp},${l.sourceIp},${l.destinationIp},${l.service},${l.threatScore},${l.severity},${l.category},${l.isAnomaly},${payloadEscaped}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'darkwatch_logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search, Filter & Log List */}
      <div className="lg:col-span-2 space-y-4">
        <CyberCard title="Log Management Console" icon={FileText} headerAction={
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-cyber-secondary border border-white/5 hover:border-cyber-accent/50 text-slate-300 hover:text-white font-mono text-[10px] uppercase rounded-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        }>
          {/* Filters Row */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search raw payload, host IP, or protocol..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-cyber-secondary/50 border border-white/5 rounded-sm pl-9 pr-4 py-1.5 font-sans text-xs text-slate-200 focus:outline-none focus:border-cyber-accent focus:shadow-cyber transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <select 
                value={severityFilter} 
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-cyber-secondary/50 border border-white/5 rounded-sm px-2.5 py-1.5 font-mono text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">ALL SEVERITIES</option>
                <option value="Critical">CRITICAL</option>
                <option value="High">HIGH</option>
                <option value="Medium">MEDIUM</option>
                <option value="Low">LOW</option>
                <option value="Normal">NORMAL</option>
              </select>
            </div>
          </div>

          {/* Logs List Table */}
          <div className="overflow-x-auto border border-white/5 rounded-sm">
            <table className="w-full text-left font-sans text-xs select-none">
              <thead>
                <tr className="bg-cyber-secondary/40 border-b border-white/5 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Threat</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedLog?.id === log.id ? 'bg-white/5' : ''}`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="p-3 font-mono text-slate-400 text-[10px] whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="p-3 font-mono text-slate-300">{log.sourceIp}</td>
                    <td className="p-3 font-mono text-slate-300">{log.destinationIp}</td>
                    <td className="p-3 font-mono text-slate-400">{log.service}</td>
                    <td className="p-3">
                      <span className={`font-mono font-bold text-[10px] ${
                        log.severity === 'Critical' ? 'text-cyber-critical' :
                        log.severity === 'High' ? 'text-cyber-critical' :
                        log.severity === 'Medium' ? 'text-cyber-warning' : 'text-cyber-safe'
                      }`}>
                        {log.threatScore}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="p-1 rounded-sm hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CyberCard>
      </div>

      {/* Log Ingest & Details Panel */}
      <div className="space-y-4">
        {/* Log File Uploader */}
        <CyberCard title="Log Ingest Portal" icon={UploadCloud}>
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border border-dashed rounded-sm p-6 text-center transition-all ${
              dragActive ? 'border-cyber-accent bg-cyber-accent/5' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="font-sans text-xs text-slate-300">Drag & Drop syslogs, apache logs, or csv payloads</p>
            <p className="font-mono text-[9px] text-slate-500 uppercase mt-1">OR</p>
            <label className="mt-3 inline-block px-3 py-1 bg-cyber-secondary border border-white/5 hover:border-cyber-accent/50 text-slate-300 hover:text-white font-mono text-[10px] uppercase rounded-sm cursor-pointer transition-colors">
              Browse Files
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          {uploadStatus && (
            <div className="mt-3 font-mono text-[10px] text-cyber-info bg-cyber-info/5 border border-cyber-info/10 rounded-sm p-2">
              {uploadStatus}
            </div>
          )}
        </CyberCard>

        {/* Selected Log Inspector */}
        <CyberCard title="Log Inspector / Metadata" icon={ShieldAlert}>
          {selectedLog ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-cyber-secondary/40 border border-white/5 rounded-sm p-3">
                <span className="text-[9px] text-slate-500 uppercase">RAW PAYLOAD</span>
                <p className="text-white break-all mt-1 leading-normal font-mono text-[11px]">
                  {selectedLog.payload}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <span className="text-slate-500 block uppercase">Threat Index</span>
                  <span className={`font-bold ${
                    selectedLog.severity === 'Critical' ? 'text-cyber-critical' : 'text-cyber-warning'
                  }`}>
                    {selectedLog.threatScore} / 100
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Classification</span>
                  <span className="text-slate-300">{selectedLog.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Ingest Timestamp</span>
                  <span className="text-slate-400">{selectedLog.timestamp.replace('T', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Severity Level</span>
                  <span className={`font-bold ${
                    selectedLog.severity === 'Critical' ? 'text-cyber-critical' : 'text-slate-300'
                  }`}>{selectedLog.severity}</span>
                </div>
              </div>

              {selectedLog.isAnomaly && (
                <div className="bg-cyber-critical/5 border border-cyber-critical/10 rounded-sm p-3">
                  <span className="text-[9px] text-cyber-critical font-bold uppercase">AI COPILOT ANALYSIS</span>
                  <p className="text-slate-300 mt-1 font-sans text-xs leading-relaxed">
                    {selectedLog.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 font-mono text-xs text-slate-500 uppercase">
              SELECT A LOG RECORD FROM THE LEFT PANEL TO VIEW DEEP METADATA
            </div>
          )}
        </CyberCard>
      </div>
    </div>
  );
};

export default LogManagement;
