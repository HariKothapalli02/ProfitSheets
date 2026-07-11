const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  news: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  likes: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
