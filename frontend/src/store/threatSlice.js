import { createSlice } from '@reduxjs/toolkit';

const initialLogs = [
  {
    id: 'log_001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    sourceIp: '198.51.100.42',
    destinationIp: '10.0.0.15',
    service: 'SSH',
    payload: 'Failed publickey for root from 198.51.100.42 port 54826 ssh2',
    threatScore: 82,
    severity: 'High',
    category: 'Brute Force Attempt',
    isAnomaly: true,
    explanation: 'The IP 198.51.100.42 attempted 45 SSH connections to the core Database Server within 2 minutes. This matches brute-force profiles.'
  },
  {
    id: 'log_002',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    sourceIp: '203.0.113.195',
    destinationIp: '10.0.0.8',
    service: 'HTTP',
    payload: 'GET /admin/config.php?file=../../../../etc/passwd HTTP/1.1',
    threatScore: 95,
    severity: 'Critical',
    category: 'Directory Traversal / LFI',
    isAnomaly: true,
    explanation: 'Local File Inclusion (LFI) payload detected. The attacker tried to retrieve /etc/passwd via relative path traversal.'
  },
  {
    id: 'log_003',
    timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    sourceIp: '185.220.101.5',
    destinationIp: '10.0.0.22',
    service: 'DNS',
    payload: 'Query: high-data-exfiltration-tunnel.badweb.com',
    threatScore: 68,
    severity: 'Medium',
    category: 'DNS Tunneling Anomaly',
    isAnomaly: true,
    explanation: 'High volume of DNS TXT records requested from a known Tor exit node IP. Indicative of covert channel exfiltration.'
  },
  {
    id: 'log_004',
    timestamp: new Date().toISOString(),
    sourceIp: '10.0.0.12',
    destinationIp: '8.8.8.8',
    service: 'HTTPS',
    payload: 'Outbound traffic spike: 4.8 GB transferred in 12 minutes',
    threatScore: 90,
    severity: 'Critical',
    category: 'Data Exfiltration',
    isAnomaly: true,
    explanation: 'Outbound traffic volume to external destinations from workstation-12 exceeded historical bounds by 4200%.'
  }
];

const initialIncidents = [
  {
    id: 'inc_001',
    title: 'Brute Force Attack on Database Server',
    description: 'Multiple failed SSH log attempts detected on host Database-01 (10.0.0.15) originating from external actor.',
    severity: 'High',
    status: 'Investigating',
    assignedTo: 'analyst',
    threatScore: 82,
    evidence: ['log_001'],
    comments: [
      {
        user: 'admin',
        text: 'Assigned to security analyst. Please check if keys have been rotated.',
        timestamp: new Date(Date.now() - 3000000).toISOString()
      }
    ],
    timeline: [
      { text: 'Alert triggered by anomaly engine', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
      { text: 'Incident created & assigned', timestamp: new Date(Date.now() - 3000000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'inc_002',
    title: 'Directory Traversal - Web Application Gateway',
    description: 'Path traversal attempt attempting to read system credentials from Web Server (10.0.0.8).',
    severity: 'Critical',
    status: 'New',
    assignedTo: null,
    threatScore: 95,
    evidence: ['log_002'],
    comments: [],
    timeline: [
      { text: 'Critical anomaly detected by ML classifier', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString() }
    ],
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  }
];

const initialState = {
  logs: initialLogs,
  incidents: initialIncidents,
  chatbotHistory: [
    { sender: 'bot', text: 'Welcome to the DarkWatch AI Copilot terminal. How can I assist you with your threat analysis today?' }
  ],
  networkTelemetry: {
    bytesSentKb: 120,
    packetsCount: 110,
    requestsPerMin: 45,
    responseTimeMs: 65,
    isAnomaly: false,
    threatScore: 12,
    explanation: 'Traffic parameters sit within operational standards.'
  },
  metrics: {
    healthScore: 88,
    avgThreatScore: 32,
    logsCount: 4,
    criticalCount: 2,
    totalIncidents: 2,
    unresolvedIncidents: 2,
    highRiskAssets: [
      { id: 'ast_001', name: 'Database-Core-01', ip: '10.0.0.15', risk: 85, category: 'Database', alerts: 14 },
      { id: 'ast_002', name: 'Gateway-Router', ip: '192.168.1.1', risk: 72, category: 'Networking', alerts: 9 },
      { id: 'ast_003', name: 'ActiveDirectory-Primary', ip: '10.0.0.5', risk: 65, category: 'Directory', alerts: 6 },
      { id: 'ast_004', name: 'Web-Server-Nginx', ip: '10.0.0.8', risk: 90, category: 'Web App', alerts: 18 }
    ],
    topCountries: [
      { name: 'Russia', count: 48, code: 'RU' },
      { name: 'China', count: 35, code: 'CN' },
      { name: 'Iran', count: 24, code: 'IR' },
      { name: 'North Korea', count: 18, code: 'KP' },
      { name: 'United States', count: 12, code: 'US' }
    ],
    topIps: [
      { ip: '185.220.101.5', count: 122, org: 'Tor Exit Node' },
      { ip: '203.0.113.195', count: 98, org: 'IDC Web Hosting' },
      { ip: '198.51.100.42', count: 87, org: 'Unknown ISP' },
      { ip: '109.244.12.87', count: 45, org: 'Dynamic IP' }
    ],
    mitreMapping: [
      { tactic: 'Initial Access', technique: 'T1190 - Exploit Public-Facing Application', count: 12 },
      { tactic: 'Execution', technique: 'T1059 - Command and Scripting Interpreter', count: 5 },
      { tactic: 'Credential Access', technique: 'T1110 - Brute Force', count: 14 },
      { tactic: 'Exfiltration', technique: 'T1048 - Exfiltration Over Alternative Protocol', count: 8 },
      { tactic: 'Defense Evasion', technique: 'T1078 - Valid Accounts', count: 4 }
    ],
    timelineData: [
      { time: '00:00', Anomalies: 12, Normal: 145 },
      { time: '04:00', Anomalies: 18, Normal: 132 },
      { time: '08:00', Anomalies: 24, Normal: 185 },
      { time: '12:00', Anomalies: 42, Normal: 220 },
      { time: '16:00', Anomalies: 35, Normal: 210 },
      { time: '20:00', Anomalies: 29, Normal: 175 }
    ]
  }
};

const threatSlice = createSlice({
  name: 'threat',
  initialState,
  reducers: {
    addLogs: (state, action) => {
      const newLogs = Array.isArray(action.payload) ? action.payload : [action.payload];
      newLogs.forEach(l => {
        state.logs.unshift(l);
      });
      state.metrics.logsCount = state.logs.length;
      state.metrics.criticalCount = state.logs.filter(l => l.severity === 'Critical').length;
    },
    addIncident: (state, action) => {
      state.incidents.unshift(action.payload);
      state.metrics.totalIncidents = state.incidents.length;
      state.metrics.unresolvedIncidents = state.incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Mitigated').length;
    },
    updateIncident: (state, action) => {
      const { id, status, assignedTo, comment, username } = action.payload;
      const incident = state.incidents.find(i => i.id === id);
      if (incident) {
        if (status) {
          incident.timeline.push({ text: `Status updated to ${status} by ${username}`, timestamp: new Date().toISOString() });
          incident.status = status;
        }
        if (assignedTo !== undefined) {
          incident.timeline.push({ text: `Assigned analyst changed to ${assignedTo || 'unassigned'} by ${username}`, timestamp: new Date().toISOString() });
          incident.assignedTo = assignedTo;
        }
        if (comment) {
          incident.comments.push({
            user: username,
            text: comment,
            timestamp: new Date().toISOString()
          });
        }
        state.metrics.unresolvedIncidents = state.incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Mitigated').length;
      }
    },
    updateNetworkTelemetry: (state, action) => {
      state.networkTelemetry = action.payload;
    },
    addChatbotMessage: (state, action) => {
      state.chatbotHistory.push(action.payload);
    },
    setMetrics: (state, action) => {
      state.metrics = { ...state.metrics, ...action.payload };
    }
  }
});

export const { addLogs, addIncident, updateIncident, updateNetworkTelemetry, addChatbotMessage, setMetrics } = threatSlice.actions;
export default threatSlice.reducer;
