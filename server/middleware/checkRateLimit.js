const isAllowedFixedWindow = require('../rateLimiters/fixedWindow');
const isAllowedSlidingWindow = require('../rateLimiters/slidingWindowLog');
const isAllowedTokenBucket = require('../rateLimiters/tokenBucket');
const logRequest = require('./logRequest');

const algorithms = {
  fixed: isAllowedFixedWindow,
  sliding: isAllowedSlidingWindow,
  token: isAllowedTokenBucket
};

const DEFAULT_ALGORITHM = 'token';

const checkRateLimit = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const apiKey = req.gatewayUser.apiKey;

    // Read algorithm choice from header, fall back to default if not provided
    const requestedAlgorithm = req.headers['x-algorithm'];
    const activeAlgorithm = algorithms[requestedAlgorithm] ? requestedAlgorithm : DEFAULT_ALGORITHM;

    const isAllowedFn = algorithms[activeAlgorithm];
    const allowed = await isAllowedFn(apiKey);

    if (!allowed) {
      await logRequest({
        apiKey,
        endpoint: req.params.serviceName || 'unknown',
        algorithm: activeAlgorithm,
        status: 'blocked',
        startTime
      });
      return res.status(429).json({ message: 'Rate limit exceeded. Try again later.' });
    }

    // Also useful for the gateway route's own logging of allowed requests
    req.activeAlgorithm = activeAlgorithm;

    next();
  } catch (err) {
    console.error('Rate limit check error:', err);
    res.status(500).json({ message: 'Server error checking rate limit' });
  }
};

module.exports = checkRateLimit;