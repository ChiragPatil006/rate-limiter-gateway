const isAllowedFixedWindow = require('../rateLimiters/fixedWindow');
const isAllowedSlidingWindow = require('../rateLimiters/slidingWindowLog');
const isAllowedTokenBucket = require('../rateLimiters/tokenBucket');

// Map algorithm names to their functions
const algorithms = {
  fixed: isAllowedFixedWindow,
  sliding: isAllowedSlidingWindow,
  token: isAllowedTokenBucket
};

// Change this value to switch which algorithm is active gateway-wide
const ACTIVE_ALGORITHM = 'token';

const checkRateLimit = async (req, res, next) => {
  try {
    const apiKey = req.gatewayUser.apiKey;

    const isAllowedFn = algorithms[ACTIVE_ALGORITHM];
    const allowed = await isAllowedFn(apiKey);

    if (!allowed) {
      return res.status(429).json({ message: 'Rate limit exceeded. Try again later.' });
    }

    next();
  } catch (err) {
    console.error('Rate limit check error:', err);
    res.status(500).json({ message: 'Server error checking rate limit' });
  }
};

module.exports = checkRateLimit;