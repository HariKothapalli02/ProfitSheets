const express = require('express');
const router = express.Router();
const { getMarkets, updateMarketsViaWebhook } = require('../controllers/marketController');

// Public route to fetch all rates
router.get('/', getMarkets);

// Webhook route to update rates
router.post('/webhook', updateMarketsViaWebhook);

module.exports = router;
