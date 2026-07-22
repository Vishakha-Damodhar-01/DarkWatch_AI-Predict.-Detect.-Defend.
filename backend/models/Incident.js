const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const TimelineEventSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const IncidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['New', 'Investigating', 'Mitigated', 'Resolved'],
    default: 'New'
  },
  assignedTo: { type: String, default: null }, // User ID or username
  threatScore: { type: Number, required: true, min: 0, max: 100 },
  evidence: [{ type: String }], // Array of log IDs or details
  comments: [CommentSchema],
  timeline: [TimelineEventSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Incident', IncidentSchema);
