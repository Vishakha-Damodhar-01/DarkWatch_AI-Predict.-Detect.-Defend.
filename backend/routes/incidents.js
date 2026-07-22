const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const mockDb = require('../models/mockDb');
const { authenticateToken } = require('../middleware/auth');

// @route   GET api/incidents/list
// @desc    Get all security incidents
router.get('/list', authenticateToken, async (req, res) => {
  try {
    if (req.isUsingMockDb) {
      // Sort newest first
      const sortedIncidents = [...mockDb.incidents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(sortedIncidents);
    }

    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve incidents', error: err.message });
  }
});

// @route   POST api/incidents/create
// @desc    Manually raise a security incident
router.post('/create', authenticateToken, async (req, res) => {
  const { title, description, severity, threatScore, assignedTo } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  const initialTimeline = [
    { text: `Incident logged manually by ${req.user.username}`, timestamp: new Date() }
  ];

  try {
    if (req.isUsingMockDb) {
      const newInc = {
        id: 'inc_' + Date.now(),
        title,
        description,
        severity: severity || 'Medium',
        status: 'New',
        assignedTo: assignedTo || null,
        threatScore: threatScore || 50,
        evidence: [],
        comments: [],
        timeline: initialTimeline,
        createdAt: new Date()
      };
      mockDb.incidents.unshift(newInc);
      return res.status(201).json(newInc);
    }

    const newInc = new Incident({
      title,
      description,
      severity,
      threatScore,
      assignedTo,
      timeline: initialTimeline
    });
    await newInc.save();
    res.status(201).json(newInc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create incident', error: err.message });
  }
});

// @route   PUT api/incidents/:id/update
// @desc    Update incident details (status, assigned analyst, etc.)
router.put('/:id/update', authenticateToken, async (req, res) => {
  const { status, assignedTo, comment } = req.body;
  const incidentId = req.params.id;

  try {
    if (req.isUsingMockDb) {
      const inc = mockDb.incidents.find(i => i.id === incidentId);
      if (!inc) return res.status(404).json({ message: 'Incident not found' });

      if (status && status !== inc.status) {
        inc.timeline.push({ text: `Status updated to ${status} by ${req.user.username}`, timestamp: new Date() });
        inc.status = status;
      }
      if (assignedTo !== undefined && assignedTo !== inc.assignedTo) {
        const analystName = assignedTo ? assignedTo : 'unassigned';
        inc.timeline.push({ text: `Assigned analyst changed to ${analystName} by ${req.user.username}`, timestamp: new Date() });
        inc.assignedTo = assignedTo;
      }
      if (comment) {
        inc.comments.push({
          user: req.user.username,
          text: comment,
          timestamp: new Date()
        });
      }
      return res.json(inc);
    }

    // Mongoose execution
    const inc = await Incident.findById(incidentId);
    if (!inc) return res.status(404).json({ message: 'Incident not found' });

    if (status && status !== inc.status) {
      inc.timeline.push({ text: `Status updated to ${status} by ${req.user.username}`, timestamp: new Date() });
      inc.status = status;
    }
    if (assignedTo !== undefined && assignedTo !== inc.assignedTo) {
      const analystName = assignedTo ? assignedTo : 'unassigned';
      inc.timeline.push({ text: `Assigned analyst changed to ${analystName} by ${req.user.username}`, timestamp: new Date() });
      inc.assignedTo = assignedTo;
    }
    if (comment) {
      inc.comments.push({
        user: req.user.username,
        text: comment,
        timestamp: new Date()
      });
    }

    await inc.save();
    res.json(inc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update incident', error: err.message });
  }
});

module.exports = router;
