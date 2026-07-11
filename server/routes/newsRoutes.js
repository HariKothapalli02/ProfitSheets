const express = require('express');
const router = express.Router();
const {
  getNews, getNewsBySlug, getNewsById, createNews, updateNews, deleteNews,
  toggleLike, toggleBookmark, getBookmarks, bulkUpload, createNewsViaWebhook
} = require('../controllers/newsController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// Public
router.get('/', optionalAuth, getNews);
router.post('/webhook', createNewsViaWebhook);
router.get('/bookmarks', protect, getBookmarks);
router.get('/:slug', getNewsBySlug);

// Admin
router.post('/bulk', protect, adminOnly, bulkUpload);
router.get('/admin/:id', protect, adminOnly, getNewsById);
router.post('/', protect, adminOnly, createNews);
router.put('/:id', protect, adminOnly, updateNews);
router.delete('/:id', protect, adminOnly, deleteNews);

// User actions
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
