const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  action: { type: String, required: true }, // e.g. "LOGIN", "UPLOAD_LOGS", "UPDATE_INCIDENT"
  ipAddress: { type: String, default: '' },
  details: { type: String, default: '' }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
