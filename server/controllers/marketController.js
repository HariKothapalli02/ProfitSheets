const MarketRate = require('../models/MarketRate');

// GET all market rates
exports.getMarkets = async (req, res) => {
  try {
    const rates = await MarketRate.find().lean();
    res.json({ success: true, rates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST update market rates via webhook
exports.updateMarketsViaWebhook = async (req, res) => {
  try {
    // 1. Authenticate API Key
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    const requiredKey = process.env.WEBHOOK_API_KEY || 'profitsheets_n8n_webhook_secret_key_2026';
    if (!apiKey || apiKey !== requiredKey) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
    }

    const { rates } = req.body;
    if (!rates) {
      return res.status(400).json({ success: false, message: 'Missing rates data' });
    }

    const updatePromises = [];
    
    // Support array of rates: [{ label: 'GOLD', value: 74200, change: 0.45, unit: '₹/10g' }]
    if (Array.isArray(rates)) {
      for (const rate of rates) {
        if (rate.label && rate.value !== undefined && rate.change !== undefined) {
          await MarketRate.findOneAndUpdate(
            { label: rate.label.toUpperCase().trim() },
            { 
              value: Number(rate.value), 
              change: Number(rate.change),
              unit: rate.unit || ''
            },
            { upsert: true, new: true }
          );
        }
      }
    } 
    // Support object of rates: { 'GOLD': { value: 74200, change: 0.45, unit: '₹/10g' } }
    else if (typeof rates === 'object') {
      for (const [label, data] of Object.entries(rates)) {
        if (data && data.value !== undefined && data.change !== undefined) {
          await MarketRate.findOneAndUpdate(
            { label: label.toUpperCase().trim() },
            { 
              value: Number(data.value), 
              change: Number(data.change),
              unit: data.unit || ''
            },
            { upsert: true, new: true }
          );
        }
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid rates format' });
    }

    const updatedRates = await MarketRate.find().lean();
    res.json({ success: true, message: 'Market rates updated successfully', rates: updatedRates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
