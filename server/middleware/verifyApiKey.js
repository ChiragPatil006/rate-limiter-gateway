const User = require('../models/User');

const verifyApiKey = async (req, res, next) => {
  // 1. Get API key from a custom header
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key missing' });
  }

  try {
    // 2. Look up the user by this API key
    const user = await User.findOne({ apiKey });

    if (!user) {
      return res.status(403).json({ message: 'Invalid API key' });
    }

    // 3. Attach the user to req, so later middleware (rate limiter) can use it
    req.gatewayUser = user;

    next();
  } catch (err) {
    console.error('API key verification error:', err);
    res.status(500).json({ message: 'Server error verifying API key' });
  }
};

module.exports = verifyApiKey;