const express = require('express');
const router = express.Router();
const verifyApiKey = require('../middleware/verifyApiKey');
const checkRateLimit = require('../middleware/checkRateLimit');
const logRequest = require('../middleware/logRequest');

// Map service names to their actual internal routes
const serviceMap = {
  weather: 'http://localhost:5000/services/weather',
  quotes: 'http://localhost:5000/services/quotes'
};

router.all('/:serviceName', verifyApiKey, checkRateLimit, async (req, res) => {
  const startTime = Date.now();
  const { serviceName } = req.params;
  const targetUrl = serviceMap[serviceName];

  // If someone requests a service that doesn't exist
  if (!targetUrl) {
    return res.status(404).json({ message: 'Service not found' });
  }

  try {
    // Forward the request to the actual dummy service
    const response = await fetch(targetUrl);
    const data = await response.json();

    // Log this as an allowed, successfully routed request
    await logRequest({
      apiKey: req.gatewayUser.apiKey,
      endpoint: serviceName,
      algorithm: req.activeAlgorithm,
      status: 'allowed',
      startTime
    });

    res.status(200).json(data);
  } catch (err) {
    console.error('Gateway routing error:', err);
    res.status(502).json({ message: 'Failed to reach backend service' });
  }
});

module.exports = router;