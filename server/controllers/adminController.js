const News = require('../models/News');
const User = require('../models/User');
const Category = require('../models/Category');
const Comment = require('../models/Comment');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalNews, publishedNews, draftNews, totalUsers, totalComments, totalViews] = await Promise.all([
      News.countDocuments(),
      News.countDocuments({ status: 'published' }),
      News.countDocuments({ status: 'draft' }),
      User.countDocuments({ role: 'user' }),
      Comment.countDocuments(),
      News.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    ]);

    // Today's published news
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayNews = await News.countDocuments({ status: 'published', publishedAt: { $gte: todayStart } });

    // Top categories with article counts
    const topCategories = await News.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', slug: '$category.slug', icon: '$category.icon', themeColor: '$category.themeColor', count: 1 } }
    ]);

    // Top articles by views
    const topArticles = await News.find({ status: 'published' })
      .select('title slug views likes thumbnail publishedAt')
      .populate('category', 'name slug')
      .sort({ views: -1 })
      .limit(5);

    // Monthly news counts (last 6 months)
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyData = await News.aggregate([
      { $match: { publishedAt: { $gte: sixMonthsAgo }, status: 'published' } },
      { $group: { _id: { year: { $year: '$publishedAt' }, month: { $month: '$publishedAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent users
    const recentUsers = await User.find({ role: 'user' }).select('name email createdAt avatar').sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalNews, publishedNews, draftNews, totalUsers, totalComments,
        totalViews: totalViews[0]?.total || 0, todayNews,
        topCategories, topArticles, monthlyData, recentUsers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
