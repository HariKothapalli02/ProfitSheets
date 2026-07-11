const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');

const categories = [
  { name: 'Stock News', slug: 'stock-news', icon: '📈', themeColor: '#0B2D52', order: 1, featured: true },
  { name: 'IPO Calendar', slug: 'ipo-calendar', icon: '📅', themeColor: '#00A651', order: 2, featured: true },
  { name: 'Business News', slug: 'business-news', icon: '💼', themeColor: '#0B2D52', order: 3 },
  { name: 'Technology', slug: 'technology', icon: '💻', themeColor: '#6366F1', order: 4, featured: true },
  { name: 'Startup News', slug: 'startup-news', icon: '🚀', themeColor: '#F59E0B', order: 5 },
  { name: 'Forex', slug: 'forex', icon: '💱', themeColor: '#EC4899', order: 6 },
  { name: 'Cryptocurrency', slug: 'cryptocurrency', icon: '🪙', themeColor: '#F97316', order: 7, featured: true },
  { name: 'Mutual Funds', slug: 'mutual-funds', icon: '💰', themeColor: '#10B981', order: 8 },
  { name: 'Market Analysis', slug: 'market-analysis', icon: '📊', themeColor: '#8B5CF6', order: 9 },
  { name: 'Global Markets', slug: 'global-markets', icon: '🌍', themeColor: '#06B6D4', order: 10 },
  { name: 'Banking', slug: 'banking', icon: '🏦', themeColor: '#0B2D52', order: 11 },
  { name: 'Commodities', slug: 'commodities', icon: '💎', themeColor: '#D97706', order: 12 },
  { name: 'Sports', slug: 'sports', icon: '⚽', themeColor: '#EF4444', order: 13 },
  { name: 'Indian Economy', slug: 'indian-economy', icon: '🇮🇳', themeColor: '#FF9933', order: 14 },
  { name: 'Company Announcements', slug: 'company-announcements', icon: '📢', themeColor: '#0B2D52', order: 15 },
  { name: 'Quarterly Results', slug: 'quarterly-results', icon: '📑', themeColor: '#00A651', order: 16 },
  { name: 'Investment Tips', slug: 'investment-tips', icon: '🎯', themeColor: '#7C3AED', order: 17 },
  { name: 'Personal Finance', slug: 'personal-finance', icon: '💵', themeColor: '#0B2D52', order: 18 },
  { name: 'Government Policies', slug: 'government-policies', icon: '📜', themeColor: '#1D4ED8', order: 19 },
  { name: 'Trading Strategies', slug: 'trading-strategies', icon: '💹', themeColor: '#059669', order: 20 },
];

async function seed() {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Create admin
  const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: 'ProfitSheets Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`✅ Admin created: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Seed categories
  const categoryMap = {};
  for (const cat of categories) {
    let dbCat = await Category.findOne({ slug: cat.slug });
    if (!dbCat) {
      dbCat = await Category.create(cat);
      console.log(`✅ Category: ${cat.name}`);
    }
    categoryMap[cat.slug] = dbCat._id;
  }

  // Find admin user to attach as author
  const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

  // Seed News Articles
  const newsArticles = [
    {
      title: "Sensex, Nifty Hit Fresh Record Highs on Rate Cut Hopes, IT Earnings Boost",
      slug: "sensex-nifty-hit-fresh-record-highs-on-rate-cut-hopes-it-earnings-boost",
      description: "Indian benchmark indices hit fresh record highs led by massive buying in IT heavyweights and optimistic global cues regarding central bank interest rate cuts.",
      content: "<h2>Market Surge</h2><p>Indian benchmark indices Sensex and Nifty 50 surged to fresh record highs today, tracking bullish global markets and strong domestic inflows. The 30-share BSE Sensex crossed the milestone of 81,500 points, while the broader NSE Nifty 50 rallied past 24,800 points.</p><h2>IT Sector Earnings</h2><p>The rally was spearheaded by major technology stocks, including TCS, Infosys, and Wipro, which reported better-than-expected quarterly earnings. Investors are also pricing in a high likelihood of a rate cut by the Federal Reserve in September, which has spurred foreign portfolio investments (FPIs) into emerging markets.</p>",
      category: categoryMap['stock-news'],
      subCategory: "Indian Markets",
      thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
      author: adminUser._id,
      authorName: adminUser.name,
      source: "ProfitSheets Research",
      sourceUrl: "",
      tags: ["nifty", "sensex", "stock-market", "it-stocks"],
      views: 15420,
      likes: 342,
      featured: true,
      trending: true,
      breaking: true,
      status: "published",
      readingTime: 4,
      publishedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    },
    {
      title: "Ola Electric IPO Slated for Next Week: Price Band, Valuation, and Key Dates",
      slug: "ola-electric-ipo-slated-for-next-week-price-band-valuation-and-key-dates",
      description: "Ola Electric's highly anticipated initial public offering (IPO) is set to open next week. Here is everything you need to know about the pricing, valuation, and grey market premium.",
      content: "<h2>The EV Giant Goes Public</h2><p>India's leading electric two-wheeler manufacturer, Ola Electric, is gearing up for its Initial Public Offering (IPO) next week. The company aims to raise approximately $750 million through a combination of a fresh issue of shares and an offer-for-sale (OFS).</p><h2>Investor Interest</h2><p>Market analysts expect strong interest from retail and institutional investors alike, given Ola's dominant market share in the Indian EV scooter segment. The grey market premium (GMP) has already started trading at a 15% premium to the expected issue price band.</p>",
      category: categoryMap['ipo-calendar'],
      subCategory: "New Issues",
      thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
      author: adminUser._id,
      authorName: adminUser.name,
      source: "IPO Desk",
      sourceUrl: "",
      tags: ["ipo", "ola-electric", "ev-stocks", "investing"],
      views: 8900,
      likes: 215,
      featured: true,
      trending: true,
      breaking: false,
      status: "published",
      readingTime: 3,
      publishedAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    },
    {
      title: "RBI Keeps Repo Rate Unchanged at 6.5%, Maintains Focus on Inflation Control",
      slug: "rbi-keeps-repo-rate-unchanged-at-6-5-maintains-focus-on-inflation-control",
      description: "The Reserve Bank of India (RBI) Monetary Policy Committee (MPC) has decided to keep the benchmark repo rate unchanged at 6.5% for the eighth consecutive time.",
      content: "<h2>Monetary Policy Update</h2><p>The Reserve Bank of India (RBI) Governor Shaktikanta Das announced that the Monetary Policy Committee has voted by a 5-1 majority to keep the repo rate unchanged at 6.5%. The central bank remains committed to aligning inflation with the 4% target on a durable basis.</p><h2>Growth Outlook</h2><p>Economists suggest that while global interest rates are beginning to decline, RBI is choosing to exercise caution to prevent food inflation from spilling over into broader economic sectors. Gross domestic product (GDP) growth forecast for the fiscal year remains robust at 7.2%.</p>",
      category: categoryMap['indian-economy'],
      subCategory: "Macro Policy",
      thumbnail: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80",
      author: adminUser._id,
      authorName: adminUser.name,
      source: "RBI Bulletin",
      sourceUrl: "",
      tags: ["rbi", "repo-rate", "economy", "inflation"],
      views: 12450,
      likes: 189,
      featured: false,
      trending: true,
      breaking: false,
      status: "published",
      readingTime: 3,
      publishedAt: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
    },
    {
      title: "Bitcoin Regains $67,000 Level as Institutional Inflows Accelerate Post ETF Approvals",
      slug: "bitcoin-regains-67-000-level-as-institutional-inflows-accelerate-post-etf-approvals",
      description: "Bitcoin rallied over 3% to cross the $67,000 threshold, driven by massive net inflows into Spot Bitcoin ETFs and positive regulatory developments.",
      content: "<h2>Crypto Market Recovery</h2><p>The cryptocurrency market witnessed a strong recovery today, with Bitcoin leading the gains by breaching the $67,000 resistance level. Spot Bitcoin ETFs recorded their largest single-day net inflow in three weeks, indicating sustained institutional demand.</p><h2>ETF Catalysts</h2><p>Furthermore, rumors regarding potential pro-crypto policy shifts in major economies have injected fresh capital and optimism into digital asset markets. Ethereum and other major altcoins also registered substantial gains, lifting the total crypto market cap back above $2.5 trillion.</p>",
      category: categoryMap['cryptocurrency'],
      subCategory: "Digital Assets",
      thumbnail: "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=800&q=80",
      author: adminUser._id,
      authorName: adminUser.name,
      source: "Crypto Desk",
      sourceUrl: "",
      tags: ["bitcoin", "crypto", "etf", "digital-assets"],
      views: 21500,
      likes: 512,
      featured: true,
      trending: false,
      breaking: false,
      status: "published",
      readingTime: 3,
      publishedAt: new Date(Date.now() - 1000 * 60 * 600), // 10 hours ago
    },
    {
      title: "Why Large Cap Mutual Funds Are Outperforming Mid and Small Cap Counterparts",
      slug: "why-large-cap-mutual-funds-are-outperforming-mid-and-small-cap-counterparts",
      description: "With market valuations at elevated levels, large cap mutual funds are emerging as a safer bet for conservative investors. Here is an in-depth analysis.",
      content: "<h2>Equity Fund Rotation</h2><p>After a prolonged period of mid and small cap outperformance, market dynamics appear to be shifting. Over the last quarter, large cap mutual funds have delivered steady, lower-volatility returns, outperforming several highly valued mid cap peers.</p><h2>Portfolio Allocation</h2><p>Fund managers recommend allocating a larger portion of equity portfolios to large caps, citing stable earnings visibility and attractive relative valuations in sectors like banking and FMCG.</p>",
      category: categoryMap['mutual-funds'],
      subCategory: "Personal Investing",
      thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80",
      author: adminUser._id,
      authorName: adminUser.name,
      source: "Wealth Advisors",
      sourceUrl: "",
      tags: ["mutual-funds", "investing", "large-cap", "finance"],
      views: 6700,
      likes: 124,
      featured: false,
      trending: false,
      breaking: false,
      status: "published",
      readingTime: 4,
      publishedAt: new Date(Date.now() - 1000 * 60 * 1440), // 1 day ago
    }
  ];

  // Seed News
  const News = require('./models/News');
  for (const art of newsArticles) {
    const exists = await News.findOne({ slug: art.slug });
    if (!exists) {
      await News.create(art);
      console.log(`✅ Article seeded: ${art.title}`);
    }
  }

  console.log('🎉 Database seeded successfully!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
