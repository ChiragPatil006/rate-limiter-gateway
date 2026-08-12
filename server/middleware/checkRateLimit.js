const isAllowedFixedWindow = require('../rateLimiters/fixedWindow');

const checkRateLimit = async (req, res, next) => {
  try {
    const apiKey = req.gatewayUser.apiKey; // set earlier by verifyApiKey middleware

    const allowed = await isAllowedFixedWindow(apiKey);

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