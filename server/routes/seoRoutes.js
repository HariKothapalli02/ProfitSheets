const express = require('express');
const router = express.Router();
const { getSitemap, getNewsSitemap } = require('../controllers/seoController');

router.get('/sitemap.xml', getSitemap);
router.get('/sitemap-news.xml', getNewsSitemap);

module.exports = router;
