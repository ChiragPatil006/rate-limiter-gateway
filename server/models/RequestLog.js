const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
  apiKey: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  algorithm: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['allowed', 'blocked'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  responseTimeMs: {
    type: Number
  }
});

module.exports = mongoose.model('RequestLog', requestLogSchema);