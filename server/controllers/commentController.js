const Comment = require('../models/Comment');
const News = require('../models/News');

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ news: req.params.newsId, parentComment: null, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    const withReplies = await Promise.all(comments.map(async (c) => {
      const replies = await Comment.find({ parentComment: c._id, isApproved: true })
        .populate('user', 'name avatar')
        .sort({ createdAt: 1 });
      return { ...c.toObject(), replies };
    }));
    res.json({ success: true, comments: withReplies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const comment = await Comment.create({ news: req.params.newsId, user: req.user._id, content, parentComment: parentComment || null });
    await News.findByIdAndUpdate(req.params.newsId, { $inc: { commentsCount: 1 } });
    const populated = await comment.populate('user', 'name avatar');
    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Not found' });
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Comment.findByIdAndDelete(req.params.id);
    await News.findByIdAndUpdate(comment.news, { $inc: { commentsCount: -1 } });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate('user', 'name email').populate('news', 'title slug').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
