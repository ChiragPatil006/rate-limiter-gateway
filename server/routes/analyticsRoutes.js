const express = require('express');
const router = express.Router();
const verifyApiKey = require('../middleware/verifyApiKey');
const { getSummary } = require('../controllers/analyticsController');

router.get('/summary', verifyApiKey, getSummary);

module.exports = router;