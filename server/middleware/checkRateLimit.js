const isAllowedFixedWindow = require('../rateLimiters/fixedWindow');
const isAllowedSlidingWindow = require('../rateLimiters/slidingWindowLog');
const isAllowedTokenBucket = require('../rateLimiters/tokenBucket');
const logRequest = require('./logRequest');

const algorithms = {
  fixed: isAllowedFixedWindow,
  sliding: isAllowedSlidingWindow,
  token: isAllowedTokenBucket
};

const ACTIVE_ALGORITHM = 'token';

const checkRateLimit = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const apiKey = req.gatewayUser.apiKey;

    const isAllowedFn = algorithms[ACTIVE_ALGORITHM];
    const allowed = await isAllowedFn(apiKey);

    if (!allowed) {
      // Log the blocked attempt before responding
      await logRequest({
        apiKey,
        endpoint: req.params.serviceName || 'unknown',
        algorithm: ACTIVE_ALGORITHM,
        status: 'blocked',
        startTime
      });

      return res.status(429).json({ message: 'Rate limit exceeded. Try again later.' });
    }

    next();
  } catch (err) {
    console.error('Rate limit check error:', err);
    res.status(500).json({ message: 'Server error checking rate limit' });
  }
};

module.exports = checkRateLimit;