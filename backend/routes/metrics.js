const express = require('express');
const router = express.Router();
const SecurityLog = require('../models/SecurityLog');
const Incident = require('../models/Incident');
const mockDb = require('../models/mockDb');
const { authenticateToken } = require('../middleware/auth');

// @route   GET api/metrics/summary
// @desc    Retrieve core aggregated SOC metrics
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    let logsCount = 0;
    let criticalCount = 0;
    let totalIncidents = 0;
    let unresolvedIncidents = 0;
    let avgThreatScore = 32; // Default security baseline

    if (req.isUsingMockDb) {
      logsCount = mockDb.logs.length;
      criticalCount = mockDb.logs.filter(l => l.severity === 'Critical').length;
      totalIncidents = mockDb.incidents.length;
      unresolvedIncidents = mockDb.incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Mitigated').length;

      const scores = mockDb.logs.map(l => l.threatScore);
      if (scores.length > 0) {
        avgThreatScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    } else {
      logsCount = await SecurityLog.countDocuments();
      criticalCount = await SecurityLog.countDocuments({ severity: 'Critical' });
      totalIncidents = await Incident.countDocuments();
      unresolvedIncidents = await Incident.countDocuments({ status: { $nin: ['Resolved', 'Mitigated'] } });

      const scoreAgg = await SecurityLog.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$threatScore' } } }
      ]);
      if (scoreAgg.length > 0) {
        avgThreatScore = Math.round(scoreAgg[0].avgScore);
      }
    }

    // Security health score is 100 minus avg threat score
    const healthScore = Math.max(10, 100 - avgThreatScore);

    // Mock high risk assets
    const highRiskAssets = [
      { id: 'ast_001', name: 'Database-Core-01', ip: '10.0.0.15', risk: 85, category: 'Database', alerts: 14 },
      { id: 'ast_002', name: 'Gateway-Router', ip: '192.168.1.1', risk: 72, category: 'Networking', alerts: 9 },
      { id: 'ast_003', name: 'ActiveDirectory-Primary', ip: '10.0.0.5', risk: 65, category: 'Directory', alerts: 6 },
      { id: 'ast_004', name: 'Web-Server-Nginx', ip: '10.0.0.8', risk: 90, category: 'Web App', alerts: 18 }
    ];

    // Mock country and IP targets
    const topCountries = [
      { name: 'Russia', count: 48, code: 'RU' },
      { name: 'China', count: 35, code: 'CN' },
      { name: 'Iran', count: 24, code: 'IR' },
      { name: 'North Korea', count: 18, code: 'KP' },
      { name: 'United States', count: 12, code: 'US' }
    ];

    const topIps = [
      { ip: '185.220.101.5', count: 122, org: 'Tor Exit Node' },
      { ip: '203.0.113.195', count: 98, org: 'IDC Web Hosting' },
      { ip: '198.51.100.42', count: 87, org: 'Unknown ISP' },
      { ip: '109.244.12.87', count: 45, org: 'Dynamic IP' }
    ];

    // MITRE ATT&CK Matrix statistics
    const mitreMapping = [
      { tactic: 'Initial Access', technique: 'T1190 - Exploit Public-Facing Application', count: 12 },
      { tactic: 'Execution', technique: 'T1059 - Command and Scripting Interpreter', count: 5 },
      { tactic: 'Credential Access', technique: 'T1110 - Brute Force', count: 14 },
      { tactic: 'Exfiltration', technique: 'T1048 - Exfiltration Over Alternative Protocol', count: 8 },
      { tactic: 'Defense Evasion', technique: 'T1078 - Valid Accounts', count: 4 }
    ];

    // Attack timeline dataset for Recharts
    const timelineData = [
      { time: '00:00', Anomalies: 12, Normal: 145 },
      { time: '04:00', Anomalies: 18, Normal: 132 },
      { time: '08:00', Anomalies: 24, Normal: 185 },
      { time: '12:00', Anomalies: 42, Normal: 220 },
      { time: '16:00', Anomalies: 35, Normal: 210 },
      { time: '20:00', Anomalies: 29, Normal: 175 }
    ];

    res.json({
      healthScore,
      avgThreatScore,
      logsCount,
      criticalCount,
      totalIncidents,
      unresolvedIncidents,
      highRiskAssets,
      topCountries,
      topIps,
      mitreMapping,
      timelineData
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to aggregate metrics', error: err.message });
  }
});

module.exports = router;
