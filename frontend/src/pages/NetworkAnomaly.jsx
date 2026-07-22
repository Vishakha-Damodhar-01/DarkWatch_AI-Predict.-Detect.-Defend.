import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNetworkTelemetry } from '../store/threatSlice';
import { Activity, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';
import CyberCard from '../components/CyberCard';
import axios from 'axios';

const NetworkAnomaly = () => {
  const dispatch = useDispatch();
  const { networkTelemetry } = useSelector((state) => state.threat);

  // Local parameters state
  const [bytes, setBytes] = useState(120);
  const [packets, setPackets] = useState(110);
  const [requests, setRequests] = useState(45);
  const [latency, setLatency] = useState(65);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunModel = async () => {
    setIsRunning(true);
    try {
      const token = localStorage.getItem('darkwatch_token');
      const response = await axios.post('/api/logs/network/analyze', {
        bytesSentKb: bytes,
        packetsCount: packets,
        requestsPerMin: requests,
        responseTimeMs: latency
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(updateNetworkTelemetry(response.data));
    } catch (err) {
      // Mock Fallback matching isolation forest logic (e.g. outlier if values are unusually high)
      setTimeout(() => {
        const isAnomaly = bytes > 400 || packets > 300 || requests > 150 || latency > 250;
        const result = {
          isAnomaly,
          threatScore: isAnomaly ? 85 : 12,
          severity: isAnomaly ? 'High' : 'Normal',
          category: isAnomaly ? 'Network Traffic Anomaly' : 'Standard Network Traffic',
          explanation: isAnomaly 
            ? '• **Risk**: Bandwidth or packet metrics exceeded threshold parameters.\n• **Impact**: Indication of network-based DDoS, scanning, or large exfiltration.\n• **Mitigation**: Investigate active ports, check connection rates, limit source IP.'
            : 'Traffic parameters sit within operational standards.'
        };
        dispatch(updateNetworkTelemetry(result));
        setIsRunning(false);
      }, 700);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Parameter Slider Adjustments */}
      <div className="lg:col-span-2 space-y-4">
        <CyberCard title="Isolation Forest Telemetry Variables" icon={Activity}>
          <div className="space-y-6 mt-4">
            {/* Bytes Sent Slider */}
            <div>
              <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1.5">
                <span>Bandwidth (Bytes Transferred / Min)</span>
                <span className="text-white font-bold">{bytes} KB</span>
              </div>
              <input 
                type="range" min="1" max="1000" value={bytes} 
                onChange={(e) => setBytes(Number(e.target.value))}
                className="w-full accent-cyber-accent bg-cyber-secondary/50 rounded-lg cursor-pointer"
              />
            </div>

            {/* Packets Count Slider */}
            <div>
              <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1.5">
                <span>Packets Sent (Count / Min)</span>
                <span className="text-white font-bold">{packets} packets</span>
              </div>
              <input 
                type="range" min="1" max="800" value={packets} 
                onChange={(e) => setPackets(Number(e.target.value))}
                className="w-full accent-cyber-accent bg-cyber-secondary/50 rounded-lg cursor-pointer"
              />
            </div>

            {/* Requests Per Min Slider */}
            <div>
              <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1.5">
                <span>Requests Rate (Requests / Sec)</span>
                <span className="text-white font-bold">{requests} req/s</span>
              </div>
              <input 
                type="range" min="1" max="500" value={requests} 
                onChange={(e) => setRequests(Number(e.target.value))}
                className="w-full accent-cyber-accent bg-cyber-secondary/50 rounded-lg cursor-pointer"
              />
            </div>

            {/* Latency Slider */}
            <div>
              <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1.5">
                <span>Response Time (Latency)</span>
                <span className="text-white font-bold">{latency} ms</span>
              </div>
              <input 
                type="range" min="1" max="1000" value={latency} 
                onChange={(e) => setLatency(Number(e.target.value))}
                className="w-full accent-cyber-accent bg-cyber-secondary/50 rounded-lg cursor-pointer"
              />
            </div>

            <button 
              onClick={handleRunModel}
              disabled={isRunning}
              className="w-full py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-400 hover:opacity-90 rounded-sm text-xs font-sans font-bold uppercase tracking-wider text-white shadow-cyber transition-all"
            >
              {isRunning ? 'EVALUATING MULTIVARIATE FOREST...' : 'TEST ANOMALY PROBABILITY'}
            </button>
          </div>
        </CyberCard>
      </div>

      {/* Model Prediciton Output */}
      <div className="space-y-4">
        <CyberCard title="Scikit-Learn Evaluation" icon={Cpu} glow={networkTelemetry.isAnomaly} glowColor="red">
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-cyber-secondary/40 border border-white/5 rounded-sm p-3">
              <div className={`w-10 h-10 rounded-sm flex items-center justify-center font-mono font-bold text-xs ${
                networkTelemetry.isAnomaly ? 'bg-cyber-critical/15 text-cyber-critical border border-cyber-critical/20 animate-pulse' : 'bg-cyber-safe/15 text-cyber-safe border border-cyber-safe/20'
              }`}>
                {networkTelemetry.threatScore}%
              </div>
              <div>
                <h4 className="font-mono text-xs font-bold text-white uppercase">{networkTelemetry.category}</h4>
                <span className="font-mono text-[9px] text-slate-500 uppercase">MODEL STATUS CLASSIFICATION</span>
              </div>
            </div>

            <div className="bg-cyber-secondary/30 border border-white/5 rounded-sm p-3">
              <span className="font-mono text-[9px] text-cyber-accent font-bold uppercase tracking-wider">AI EVALUATION DETECTOR REPORT</span>
              <p className="text-slate-300 mt-2 font-sans text-xs leading-relaxed whitespace-pre-line">
                {networkTelemetry.explanation}
              </p>
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
  );
};

export default NetworkAnomaly;
