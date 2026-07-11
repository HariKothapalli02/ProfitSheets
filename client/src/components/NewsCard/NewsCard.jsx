import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart, Clock, Share2, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './NewsCard.css';

export default function NewsCard({ news, variant = 'default' }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(news.likes || 0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  if (!news) return null;

  const categoryStyle = { background: news.category?.themeColor ? `${news.category.themeColor}18` : undefined, color: news.category?.themeColor };

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to like articles');
    try {
      const { data } = await api.post(`/news/${news._id}/like`);
      setLikes(data.likes);
      setLiked(data.liked);
    } catch { toast.error('Failed to update like'); }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to bookmark articles');
    try {
      const { data } = await api.post(`/news/${news._id}/bookmark`);
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? 'Bookmarked!' : 'Removed bookmark');
    } catch { toast.error('Failed to update bookmark'); }
  };

  const handleShare = (e) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({ title: news.title, url: window.location.origin + `/news/${news.slug}` });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/news/${news.slug}`);
      toast.success('Link copied!');
    }
  };

  if (variant === 'featured') {
    return (
      <motion.article className="news-card news-card--featured" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <Link to={`/news/${news.slug}`} className="news-card-link">
          <div className="news-card-img-wrap news-card-img--featured">
            {news.thumbnail ? (
              <img src={news.thumbnail} alt={news.title} loading="lazy" />
            ) : (
              <div className="news-card-placeholder">
                <span>{news.category?.icon || '📰'}</span>
              </div>
            )}
            <div className="news-card-overlay" />
            <div className="news-card-badges">
              {news.breaking && <span className="breaking-badge">Breaking</span>}
              {news.trending && <span className="trending-badge">Trending</span>}
              {news.category && <span className="badge" style={categoryStyle}>{news.category.icon} {news.category.name}</span>}
            </div>
            <div className="news-card-featured-content">
              <h2 className="news-card-title news-card-title--featured">{news.title}</h2>
              <p className="news-card-desc">{news.description?.slice(0, 120)}...</p>
              <div className="news-card-meta">
                <span><Clock size={12} /> {news.readingTime || 3} min</span>
                <span><Eye size={12} /> {news.views?.toLocaleString()}</span>
                <span>{formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article className="news-card" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Link to={`/news/${news.slug}`} className="news-card-link">
        <div className="news-card-img-wrap">
          {news.thumbnail ? (
            <img src={news.thumbnail} alt={news.title} loading="lazy" />
          ) : (
            <div className="news-card-placeholder">
              <span>{news.category?.icon || '📰'}</span>
            </div>
          )}
          <div className="news-card-badges news-card-badges--overlay">
            {news.breaking && <span className="breaking-badge">Breaking</span>}
            {news.trending && <span className="trending-badge">Trending</span>}
          </div>
        </div>

        <div className="news-card-body">
          {news.category && (
            <span className="news-card-cat" style={categoryStyle}>
              {news.category.icon} {news.category.name}
            </span>
          )}
          <h3 className="news-card-title">{news.title}</h3>
          <p className="news-card-excerpt">{news.description?.slice(0, 110)}...</p>

          <div className="news-card-footer">
            <div className="news-card-meta">
              <span className="news-card-author">{news.authorName || 'Admin'}</span>
              <span className="news-card-dot">·</span>
              <span><Clock size={11} /> {news.readingTime || 3}m</span>
              <span className="news-card-dot">·</span>
              <span>{formatDistanceToNow(new Date(news.publishedAt || Date.now()), { addSuffix: true })}</span>
            </div>
            <div className="news-card-actions">
              <button className={`card-action-btn ${liked ? 'active' : ''}`} onClick={handleLike} title="Like">
                <Heart size={13} fill={liked ? 'var(--error)' : 'none'} />
                <span>{likes}</span>
              </button>
              <button className={`card-action-btn ${bookmarked ? 'active' : ''}`} onClick={handleBookmark} title="Bookmark">
                <Bookmark size={13} fill={bookmarked ? 'var(--navy)' : 'none'} />
              </button>
              <button className="card-action-btn" onClick={handleShare} title="Share">
                <Share2 size={13} />
              </button>
              <span className="card-views"><Eye size={11} /> {news.views || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
