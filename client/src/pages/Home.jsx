import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, ArrowRight, Zap, BarChart2, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../services/api';
import NewsCard from '../components/NewsCard/NewsCard';
import UserLayout from '../layouts/UserLayout';
import './Home.css';

const MARKET_CARDS = [
  { label: 'NIFTY 50', value: '24,850.35', change: '+0.82%', up: true },
  { label: 'SENSEX', value: '81,550.20', change: '+1.12%', up: true },
  { label: 'GOLD', value: '₹74,250', change: '+0.45%', up: true },
  { label: 'BITCOIN', value: '$67,850', change: '+2.34%', up: true },
];

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="skeleton" style={{ height: 180, borderRadius: 12, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 14, width: '80%' }} />
    </div>
  );
}

function MarketCard({ item }) {
  const isUp = item.up;
  return (
    <motion.div className={`home-market-card ${isUp ? 'up' : 'down'}`} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <div className="market-card-header-row">
        <span className="market-card-label">{item.label}</span>
        <span className={`market-card-trend-icon ${isUp ? 'up' : 'down'}`}>
          {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        </span>
      </div>
      <div className="market-card-price-row">
        <span className="market-card-value">{item.value}</span>
        <span className={`market-card-change ${isUp ? 'up' : 'down'}`}>{item.change}</span>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['news', 'featured'],
    queryFn: () => api.get('/news?featured=true&limit=6').then(r => r.data),
  });

  const { data: latestData, isLoading: loadingLatest } = useQuery({
    queryKey: ['news', 'latest'],
    queryFn: () => api.get('/news?limit=8').then(r => r.data),
  });

  const { data: trendingData } = useQuery({
    queryKey: ['news', 'trending'],
    queryFn: () => api.get('/news?trending=true&limit=5').then(r => r.data),
  });
  const featured = featuredData?.news || [];
  const latest = latestData?.news || [];
  const trending = trendingData?.news || [];

  const displayFeatured = featured.length > 0 ? featured : latest;

  return (
    <UserLayout>
      {/* Editorial Header Row */}
      <section className="home-editorial-header container">
        <div className="home-editorial-header-inner">
          <div className="editorial-hero-banner">
            <div className="banner-content">
              <h1>LATEST FINANCIAL NEWS, ANALYTICS & MARKET INTELLIGENCE</h1>
              <p className="banner-subtitle">ALL IN ONE PLATFORM</p>
            </div>
          </div>

          <div className="editors-pick-panel">
            <div className="panel-header">
              <span className="panel-dot">●</span>
              <span>EDITOR'S PICK</span>
            </div>
            <div className="panel-body">
              {displayFeatured.length === 0 ? (
                <p className="empty-message">More articles will appear here once posted.</p>
              ) : (
                <div className="editors-pick-list">
                  {displayFeatured.slice(0, 2).map(n => (
                    <Link key={n._id} to={`/news/${n.slug}`} className="editors-pick-item">
                      <p className="pick-title">{n.title}</p>
                      <span className="pick-cat">{n.category?.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="hero container">
        <div className="hero-inner">
          {/* Main featured article */}
          <div className="hero-main">
            {loadingFeatured ? (
              <div className="skeleton" style={{ height: '100%', minHeight: 420, borderRadius: 8 }} />
            ) : displayFeatured[0] ? (
              <NewsCard news={displayFeatured[0]} variant="featured" />
            ) : (
              <div className="hero-empty">
                <Globe size={48} style={{ color: 'var(--gray-300)' }} />
                <p>No featured articles yet. Admin can publish news from the admin panel.</p>
                <Link to="/admin/news/create" className="btn btn-primary">Publish First Article</Link>
              </div>
            )}
          </div>

            {/* Side panel */}
            <div className="hero-side">
              {/* Trending */}
              <div className="hero-side-section">
                <div className="side-header">
                  <TrendingUp size={16} /> <span>Trending Now</span>
                </div>
                {trending.length === 0 ? (
                  loadingFeatured ? [1,2,3].map(i => (
                    <div key={i} className="skeleton" style={{ height: 70, borderRadius: 8, marginBottom: 8 }} />
                  )) : <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>No trending news</p>
                ) : trending.map((item, i) => (
                  <Link key={item._id} to={`/news/${item.slug}`} className="trending-item">
                    <span className="trending-num">{i + 1}</span>
                    <div>
                      <p className="trending-title">{item.title}</p>
                      <span className="trending-cat">{item.category?.name}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Market Summary */}
              <div className="hero-side-section">
                <div className="side-header">
                  <BarChart2 size={16} /> <span>Market Summary</span>
                </div>
                <div className="market-mini-grid">
                  {MARKET_CARDS.map(card => <MarketCard key={card.label} item={card} />)}
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* More featured */}
      {displayFeatured.length > 1 && (
        <section className="home-section container">
          <div className="section-header">
            <h2 className="section-title">Editor's Picks</h2>
            <Link to="/news?featured=true" className="btn btn-ghost btn-sm">See all <ArrowRight size={14} /></Link>
          </div>
          <div className="news-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {displayFeatured.slice(1, 4).map(n => <NewsCard key={n._id} news={n} />)}
          </div>
        </section>
      )}


      {/* Latest News */}
      <section className="home-section container">
        <div className="section-header">
          <h2 className="section-title">Latest News</h2>
          <Link to="/news" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>
        </div>
        {loadingLatest ? (
          <div className="news-grid">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : latest.length > 0 ? (
          <div className="news-grid">
            {latest.map((n, i) => (
              <motion.div key={n._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <NewsCard news={n} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Zap size={48} style={{ color: 'var(--gray-300)' }} />
            <h3>No articles yet</h3>
            <p>The admin has not published any news articles yet. Check back soon.</p>
          </div>
        )}
      </section>
    </UserLayout>
  );
}
