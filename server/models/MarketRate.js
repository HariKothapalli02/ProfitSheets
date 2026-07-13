const mongoose = require('mongoose');

const marketRateSchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true, trim: true },
  value: { type: Number, required: true },
  change: { type: Number, required: true }, // e.g. 0.82 for +0.82%, -0.34 for -0.34%
  unit: { type: String, default: '' },       // e.g. '₹/10g', '₹/kg', '$', '₹/bbl'
}, { timestamps: true });

module.exports = mongoose.model('MarketRate', marketRateSchema);
