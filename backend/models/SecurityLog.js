const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  sourceIp: { type: String, required: true },
  destinationIp: { type: String, required: true },
  service: { type: String, required: true }, // SSH, HTTP, DNS, SQL, etc.
  payload: { type: String, required: true },
  threatScore: { type: Number, default: 0 },
  severity: {
    type: String,
    enum: ['Normal', 'Low', 'Medium', 'High', 'Critical'],
    default: 'Normal'
  },
  category: { type: String, default: 'General Traffic' },
  isAnomaly: { type: Boolean, default: false },
  explanation: { type: String, default: '' }
});

module.exports = mongoose.model('SecurityLog', SecurityLogSchema);
