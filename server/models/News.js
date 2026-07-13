const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  images: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: 'Admin' },
  source: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  breaking: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'published' },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  readingTime: { type: Number, default: 3 },
}, { timestamps: true });

newsSchema.index({ slug: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ trending: 1 });
newsSchema.index({ featured: 1 });
newsSchema.index({ breaking: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ title: 'text', description: 'text', content: 'text', tags: 'text' });
newsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 172800 });

module.exports = mongoose.model('News', newsSchema);
