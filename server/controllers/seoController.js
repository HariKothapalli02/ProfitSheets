const News = require('../models/News');
const Category = require('../models/Category');

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// GET sitemap.xml
exports.getSitemap = async (req, res) => {
  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const BASE_URL = `${proto}://${host}`;

    const staticUrls = [
      { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${BASE_URL}/about`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${BASE_URL}/contact`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${BASE_URL}/privacy`, priority: '0.3', changefreq: 'yearly' },
      { loc: `${BASE_URL}/terms`, priority: '0.3', changefreq: 'yearly' },
      { loc: `${BASE_URL}/markets`, priority: '0.8', changefreq: 'daily' }
    ];

    // Categories
    const categories = await Category.find({ isActive: true }).lean();
    const categoryUrls = categories.map(cat => ({
      loc: `${BASE_URL}/news?category=${cat.slug}`,
      priority: '0.7',
      changefreq: 'daily'
    }));

    // Articles
    const articles = await News.find({ status: 'published' })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    const articleUrls = articles.map(art => ({
      loc: `${BASE_URL}/news/${art.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: art.updatedAt ? new Date(art.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    const allUrls = [...staticUrls, ...categoryUrls, ...articleUrls];

    const xmlItems = allUrls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : `<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlItems}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml.trim());
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Error generating sitemap');
  }
};

// GET sitemap-news.xml
exports.getNewsSitemap = async (req, res) => {
  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const BASE_URL = `${proto}://${host}`;

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const recentArticles = await News.find({
      status: 'published',
      publishedAt: { $gte: fortyEightHoursAgo }
    })
    .select('title slug publishedAt')
    .sort({ publishedAt: -1 })
    .lean();

    const xmlItems = recentArticles.map(art => `
  <url>
    <loc>${BASE_URL}/news/${art.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>IndiaSphere</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(art.publishedAt).toISOString()}</news:publication_date>
      <news:title>${escapeXml(art.title)}</news:title>
    </news:news>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${xmlItems}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml.trim());
  } catch (err) {
    console.error('Error generating news sitemap:', err);
    res.status(500).send('Error generating news sitemap');
  }
};
