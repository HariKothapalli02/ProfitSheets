import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Eye, Heart, Share2, Bookmark, ArrowLeft, MessageCircle, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import NewsCard from '../components/NewsCard/NewsCard';
import UserLayout from '../layouts/UserLayout';
import './NewsDetail.css';

function CommentForm({ newsId, onSuccess }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  if (!user) return (
    <div className="comment-login-prompt">
      <Link to="/login" className="btn btn-primary btn-sm">Login to comment</Link>
    </div>
  );
  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await api.post(`/comments/${newsId}`, { content: text.trim() });
      setText('');
      onSuccess();
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
    setLoading(false);
  };
  return (
    <form className="comment-form" onSubmit={submit}>
      <div className="comment-form-avatar">{user.name?.[0]?.toUpperCase()}</div>
      <div style={{ flex: 1 }}>
        <textarea className="form-input form-textarea" placeholder="Share your thoughts..." value={text} onChange={e => setText(e.target.value)} rows={3} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-primary btn-sm" type="submit" disabled={loading || !text.trim()}>
            <Send size={14} /> {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Comment({ comment, newsId, onDelete }) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const canDelete = user && (user._id === comment.user?._id || user.role === 'admin');
  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    try { await api.delete(`/comments/${comment._id}`); onDelete(); } catch { toast.error('Failed'); }
  };
  return (
    <div className="comment-item">
      <div className="comment-avatar">{comment.user?.name?.[0]?.toUpperCase()}</div>
      <div className="comment-content">
        <div className="comment-header">
          <strong>{comment.user?.name}</strong>
          <span className="comment-time">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
          {canDelete && <button className="btn btn-ghost btn-icon" onClick={handleDelete}><Trash2 size={12} /></button>}
        </div>
        <p className="comment-text">{comment.content}</p>
        <button className="comment-reply-btn" onClick={() => setShowReply(!showReply)}>Reply</button>
        {showReply && (
          <div style={{ marginTop: 12 }}>
            <CommentForm newsId={newsId} onSuccess={() => { setShowReply(false); onDelete(); }} />
          </div>
        )}
        {comment.replies?.map(r => (
          <div key={r._id} className="comment-reply">
            <div className="comment-avatar comment-avatar--sm">{r.user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <strong style={{ fontSize: '0.82rem' }}>{r.user?.name}</strong>
              <p className="comment-text">{r.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NewsDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Reset scroll to top when slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['news', slug],
    queryFn: () => api.get(`/news/${slug}`).then(r => r.data),
  });

  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ['comments', data?.news?._id],
    queryFn: () => api.get(`/comments/${data.news._id}`).then(r => r.data),
    enabled: !!data?.news?._id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['news', 'related', data?.news?.category?._id],
    queryFn: () => api.get(`/news?category=${data.news.category.slug}&limit=4`).then(r => r.data),
    enabled: !!data?.news?.category?.slug,
  });

  if (isLoading) return (
    <UserLayout>
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="skeleton" style={{ height: 48, width: '80%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 16, marginBottom: 24 }} />
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 18, marginBottom: 10, width: `${60 + i * 8}%` }} />)}
      </div>
    </UserLayout>
  );

  if (error || !data?.news) return (
    <UserLayout>
      <div className="empty-state container" style={{ padding: '80px 24px' }}>
        <h2>Article not found</h2>
        <Link to="/news" className="btn btn-primary">Back to News</Link>
      </div>
    </UserLayout>
  );

  const news = data.news;
  const comments = commentsData?.comments || [];
  const related = relatedData?.news?.filter(n => n._id !== news._id).slice(0, 3) || [];

  const handleLike = async () => {
    if (!user) return toast.error('Please login');
    try {
      const { data: d } = await api.post(`/news/${news._id}/like`);
      setLiked(d.liked);
      toast.success(d.liked ? '❤️ Liked!' : 'Unliked');
    } catch { }
  };

  const handleBookmark = async () => {
    if (!user) return toast.error('Please login');
    try {
      const { data: d } = await api.post(`/news/${news._id}/bookmark`);
      setBookmarked(d.bookmarked);
      toast.success(d.bookmarked ? '🔖 Saved to bookmarks' : 'Removed bookmark');
    } catch { }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: news.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <UserLayout>
      <div className="newsDetail">
        <div className="container newsDetail-layout">
          <main className="newsDetail-main">
            {/* Back */}
            <Link to="/news" className="newsDetail-back">
              <ArrowLeft size={14} /> Back to News
            </Link>

            {/* Category & badges */}
            <div className="newsDetail-badges">
              {news.category && (
                <Link to={`/news?category=${news.category.slug}`} className="badge badge-navy">
                  {news.category.icon} {news.category.name}
                </Link>
              )}
              {news.breaking && <span className="breaking-badge">Breaking</span>}
              {news.trending && <span className="trending-badge">🔥 Trending</span>}
            </div>

            {/* Title */}
            <motion.h1 className="newsDetail-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {news.title}
            </motion.h1>

            {/* Description */}
            <p className="newsDetail-desc">{news.description}</p>

            {/* Meta */}
            <div className="newsDetail-meta">
              <span className="newsDetail-author">By {news.authorName || 'Admin'}</span>
              <span>·</span>
              <span><Clock size={13} /> {news.readingTime} min read</span>
              <span>·</span>
              <span>{format(new Date(news.publishedAt), 'dd MMM yyyy, hh:mm a')}</span>
              <span>·</span>
              <span><Eye size={13} /> {news.views?.toLocaleString()} views</span>
            </div>

            {/* Action bar */}
            <div className="newsDetail-actions">
              <button className={`action-pill ${liked ? 'liked' : ''}`} onClick={handleLike}>
                <Heart size={14} fill={liked ? 'var(--error)' : 'none'} /> {news.likes + (liked ? 1 : 0)}
              </button>
              <button className={`action-pill ${bookmarked ? 'bookmarked' : ''}`} onClick={handleBookmark}>
                <Bookmark size={14} fill={bookmarked ? 'var(--navy)' : 'none'} /> Save
              </button>
              <button className="action-pill" onClick={handleShare}>
                <Share2 size={14} /> Share
              </button>
              <a href={`#comments`} className="action-pill">
                <MessageCircle size={14} /> {comments.length} Comments
              </a>
            </div>

            {/* Thumbnail */}
            {news.thumbnail && (
              <motion.div className="newsDetail-img" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <img src={news.thumbnail} alt={news.title} />
                {news.source && <p className="newsDetail-source">Source: <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer">{news.source}</a></p>}
              </motion.div>
            )}

            {/* Content */}
            <div className="newsDetail-content" dangerouslySetInnerHTML={{ __html: news.content.replace(/\n/g, '<br/>') }} />

            {/* Tags */}
            {news.tags?.length > 0 && (
              <div className="newsDetail-tags">
                <strong>Tags:</strong>
                {news.tags.map(tag => <Link key={tag} to={`/news?search=${tag}`} className="tag">#{tag}</Link>)}
              </div>
            )}

            {/* Comments */}
            <div className="newsDetail-comments" id="comments">
              <h3 className="section-title" style={{ marginBottom: 24 }}>Comments ({comments.length})</h3>
              <CommentForm newsId={news._id} onSuccess={refetchComments} />
              <div className="comments-list">
                {comments.map(c => <Comment key={c._id} comment={c} newsId={news._id} onDelete={refetchComments} />)}
                {comments.length === 0 && <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>No comments yet. Be the first to comment!</p>}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="newsDetail-sidebar">
            {related.length > 0 && (
              <div className="sidebar-widget">
                <h4 className="sidebar-title">Related Articles</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {related.map(n => (
                    <Link key={n._id} to={`/news/${n.slug}`} className="related-item">
                      {n.thumbnail && <img src={n.thumbnail} alt={n.title} className="related-img" />}
                      <div>
                        <p className="related-title">{n.title}</p>
                        <span className="related-meta"><Clock size={11} /> {n.readingTime}m · {formatDistanceToNow(new Date(n.publishedAt), { addSuffix: true })}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </UserLayout>
  );
}
