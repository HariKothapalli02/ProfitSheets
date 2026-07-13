const News = require('../models/News');
const Category = require('../models/Category');
const slugify = require('slugify');

const generateSlug = async (title) => {
  let slug = slugify(title, { lower: true, strict: true });
  const exists = await News.findOne({ slug });
  if (exists) slug = `${slug}-${Date.now()}`;
  return slug;
};

// GET all published news with filters
exports.getNews = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, trending, featured, breaking, status } = req.query;
    const query = {};

    const isAdmin = req.user && req.user.role === 'admin';

    // Public users only see published. Admins can see all via status param
    if (isAdmin) {
      if (status) query.status = status;
    } else {
      query.status = 'published';
      // Filter out news older than 48 hours for public users
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      query.createdAt = { $gte: fortyEightHoursAgo };
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
    if (trending === 'true') query.trending = true;
    if (featured === 'true') query.featured = true;
    if (breaking === 'true') query.breaking = true;
    if (search) query.$text = { $search: search };

    // Enforce top 10 limit for general feeds (public, no category, no search)
    const isPublicGeneralFeed = !isAdmin && !category && !search;
    let queryLimit = Number(limit);
    let queryPage = Number(page);
    if (isPublicGeneralFeed) {
      queryLimit = 10;
      queryPage = 1;
    }

    let total = await News.countDocuments(query);
    if (isPublicGeneralFeed) {
      total = Math.min(total, 10);
    }

    const news = await News.find(query)
      .populate('category', 'name slug themeColor icon')
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .skip((queryPage - 1) * queryLimit)
      .limit(queryLimit)
      .lean();

    res.json({ success: true, news, total, page: queryPage, pages: Math.ceil(total / queryLimit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single news by slug + increment views
exports.getNewsBySlug = async (req, res) => {
  try {
    const query = { slug: req.params.slug, status: 'published' };
    
    // Filter out news older than 48 hours for public users
    // Note: We don't check for admin session here as this is a public endpoint,
    // but we can add a check if needed.
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    query.createdAt = { $gte: fortyEightHoursAgo };

    const news = await News.findOneAndUpdate(
      query,
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    )
      .populate('category', 'name slug themeColor icon')
      .populate('author', 'name avatar');
    if (!news) return res.status(404).json({ success: false, message: 'Article not found or expired' });
    res.json({ success: true, news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single news by ID (admin)
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('category', 'name slug themeColor icon')
      .populate('author', 'name avatar');
    if (!news) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create news (admin)
exports.createNews = async (req, res) => {
  try {
    const { title, description, content, category, subCategory, thumbnail, images, source, sourceUrl, tags, featured, breaking, trending, status, seoTitle, seoDescription, readingTime, publishedAt } = req.body;
    const slug = await generateSlug(title);
    const wordCount = content ? content.split(/\s+/).length : 0;
    const reading = readingTime || Math.ceil(wordCount / 200) || 3;
    const news = await News.create({
      title, slug, description, content, category, subCategory,
      thumbnail, images: images || [], author: req.user._id, authorName: req.user.name,
      source, sourceUrl, tags: tags || [], featured: featured || false,
      breaking: breaking || false, trending: trending || false,
      status: status || 'published', seoTitle, seoDescription,
      readingTime: reading, publishedAt: publishedAt || Date.now(),
    });
    const populated = await news.populate('category', 'name slug themeColor icon');
    res.status(201).json({ success: true, news: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update news (admin)
exports.updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    Object.assign(news, req.body);
    if (req.body.title && req.body.title !== news.title) {
      news.slug = await generateSlug(req.body.title);
    }
    await news.save();
    const populated = await news.populate('category', 'name slug themeColor icon');
    res.json({ success: true, news: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE news (admin)
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST like news
exports.toggleLike = async (req, res) => {
  try {
    const { User } = require('../models/User');
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    const user = await require('../models/User').findById(req.user._id);
    const liked = user.likedNews.includes(req.params.id);
    if (liked) {
      user.likedNews.pull(req.params.id);
      news.likes = Math.max(0, news.likes - 1);
    } else {
      user.likedNews.push(req.params.id);
      news.likes += 1;
    }
    await Promise.all([user.save(), news.save()]);
    res.json({ success: true, likes: news.likes, liked: !liked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST toggle bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    const bookmarked = user.bookmarks.includes(req.params.id);
    if (bookmarked) user.bookmarks.pull(req.params.id);
    else user.bookmarks.push(req.params.id);
    await user.save();
    res.json({ success: true, bookmarked: !bookmarked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET user bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id).populate({
      path: 'bookmarks',
      populate: { path: 'category', select: 'name slug themeColor' },
      options: { sort: { publishedAt: -1 } }
    });
    res.json({ success: true, bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST bulk upload (admin)
exports.bulkUpload = async (req, res) => {
  try {
    const articles = req.body;
    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of articles required' });
    }
    let inserted = 0, skipped = 0, failed = 0;
    const errors = [];
    for (const article of articles) {
      try {
        if (!article.title || !article.content || !article.category) {
          failed++;
          errors.push({ title: article.title, reason: 'Missing required fields' });
          continue;
        }
        // Find or create category
        let catSlug = slugify(article.category, { lower: true, strict: true });
        let cat = await Category.findOne({ slug: catSlug });
        if (!cat) {
          cat = await Category.create({ name: article.category, slug: catSlug });
        }
        // Check duplicate by title + source
        const exists = await News.findOne({ title: article.title, source: article.source || '' });
        if (exists) { skipped++; continue; }
        const slug = await generateSlug(article.title);
        await News.create({
          ...article,
          slug,
          category: cat._id,
          author: req.user._id,
          authorName: req.user.name,
          status: article.status || 'published',
        });
        inserted++;
      } catch (e) {
        failed++;
        errors.push({ title: article.title, reason: e.message });
      }
    }
    res.json({ success: true, summary: { total: articles.length, inserted, skipped, failed }, errors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create news via external webhook (for n8n integration)
exports.createNewsViaWebhook = async (req, res) => {
  try {
    // 1. Authenticate API Key
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    const requiredKey = process.env.WEBHOOK_API_KEY || 'profitsheets_n8n_webhook_secret_key_2026';
    if (!apiKey || apiKey !== requiredKey) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
    }

    const {
      title, description, content, category, subCategory, thumbnail, images,
      source, sourceUrl, tags, featured, breaking, trending, status,
      seoTitle, seoDescription, readingTime, publishedAt, authorName
    } = req.body;

    // Validate required fields
    if (!title || !description || !content || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields: title, description, content, category' });
    }

    // 2. Find Category
    let categoryDoc;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryDoc = await Category.findById(category);
    } else {
      // Find by slug first
      const catSlug = slugify(category, { lower: true, strict: true });
      categoryDoc = await Category.findOne({ slug: catSlug });
      // If not found, look by name (case-insensitive)
      if (!categoryDoc) {
        categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      }
      // If still not found, create a new category
      if (!categoryDoc) {
        categoryDoc = await Category.create({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          slug: catSlug,
          icon: '📰',
          themeColor: '#0B2D52'
        });
      }
    }

    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    // 3. Find default admin user for author association
    const User = require('../models/User');
    let adminUser = await User.findOne({ role: 'admin' });

    // 4. Generate Slug
    const slug = await generateSlug(title);

    // 5. Calculate reading time
    const wordCount = content ? content.split(/\s+/).length : 0;
    const reading = readingTime || Math.ceil(wordCount / 200) || 3;

    // 6. Create News Article
    const news = await News.create({
      title,
      slug,
      description,
      content,
      category: categoryDoc._id,
      subCategory: subCategory || '',
      thumbnail: thumbnail || '',
      images: images || [],
      author: adminUser ? adminUser._id : null,
      authorName: authorName || (adminUser ? adminUser.name : 'Automated Bot'),
      source: source || 'n8n Workflow',
      sourceUrl: sourceUrl || '',
      tags: tags || [],
      featured: featured || false,
      breaking: breaking || false,
      trending: trending || false,
      status: status || 'published',
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      readingTime: reading,
      publishedAt: publishedAt || Date.now()
    });

    const populated = await news.populate('category', 'name slug themeColor icon');
    res.status(201).json({ success: true, message: 'News posted successfully via webhook', news: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
