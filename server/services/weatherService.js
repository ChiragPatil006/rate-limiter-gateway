const express = require('express');
const router = express.Router();

// Fake weather data generator
router.get('/', (req, res) => {
  const conditions = ['Sunny', 'Rainy', 'Cloudy', 'Windy', 'Snowy'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const randomTemp = Math.floor(Math.random() * 35) + 5; // 5 to 40 degrees

  res.json({
    service: 'weather',
    condition: randomCondition,
    temperature: `${randomTemp}°C`,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;