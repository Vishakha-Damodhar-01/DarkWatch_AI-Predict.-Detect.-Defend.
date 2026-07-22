const bcrypt = require('bcryptjs');

// In-Memory Database collections
const users = [
  {
    id: 'usr_admin',
    username: 'admin',
    email: 'admin@darkwatch.ai',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'Admin',
    isVerified: true,
    createdAt: new Date()
  },
  {
    id: 'usr_analyst',
    username: 'analyst',
    email: 'analyst@darkwatch.ai',
    passwordHash: bcrypt.hashSync('analyst123', 10),
    role: 'SOC Analyst',
    isVerified: true,
    createdAt: new Date()
  }
];

const logs = [
  {
    id: 'log_001',
    timestamp: new Date(Date.now() - 3600000 * 2),
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
    timestamp: new Date(Date.now() - 3600000 * 1.5),
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
    timestamp: new Date(Date.now() - 3600000 * 0.8),
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
    timestamp: new Date(),
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

const incidents = [
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
        timestamp: new Date(Date.now() - 3000000)
      }
    ],
    timeline: [
      { text: 'Alert triggered by anomaly engine', timestamp: new Date(Date.now() - 3600000 * 2) },
      { text: 'Incident created & assigned', timestamp: new Date(Date.now() - 3000000) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 2)
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
      { text: 'Critical anomaly detected by ML classifier', timestamp: new Date(Date.now() - 3600000 * 1.5) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 1.5)
  }
];

const auditLogs = [];

module.exports = {
  users,
  logs,
  incidents,
  auditLogs
};
