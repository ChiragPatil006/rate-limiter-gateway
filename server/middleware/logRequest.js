const RequestLog = require('../models/RequestLog');

const logRequest = async ({ apiKey, endpoint, algorithm, status, startTime }) => {
  const responseTimeMs = Date.now() - startTime;

  try {
    await RequestLog.create({
      apiKey,
      endpoint,
      algorithm,
      status,
      responseTimeMs
    });
  } catch (err) {
    console.error('Failed to write request log:', err);
  }
};

module.exports = logRequest;