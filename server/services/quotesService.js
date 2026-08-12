const express = require('express');
const router = express.Router();

const quotes = [
  "Simplicity is the ultimate sophistication.",
  "Code is read more often than it is written.",
  "First, solve the problem. Then, write the code.",
  "Premature optimization is the root of all evil.",
  "Make it work, make it right, make it fast."
];

router.get('/', (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  res.json({
    service: 'quotes',
    quote: randomQuote,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;