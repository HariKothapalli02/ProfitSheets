import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import NewsCard from '../components/NewsCard/NewsCard';
import UserLayout from '../layouts/UserLayout';
import './NewsList.css';

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="skeleton" style={{ height: 180, borderRadius: 12, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 16, marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 14, width: '80%' }} />
    </div>
  );
}

const SORT_OPTIONS = [
  { label: 'Latest', value: '' },
  { label: 'Trending', value: 'trending' },
  { label: 'Featured', value: 'featured' },
];

export default function NewsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || '';

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  let queryUrl = `/news?page=${page}&limit=12`;
  if (category) queryUrl += `&category=${category}`;
  if (search) queryUrl += `&search=${encodeURIComponent(search)}`;
  if (sort) queryUrl += `&${sort}=true`;

  const { data, isLoading } = useQuery({
    queryKey: ['news', category, search, page, sort],
    queryFn: () => api.get(queryUrl).then(r => r.data),
    keepPreviousData: true,
  });

  const news = data?.news || [];
  const totalPages = data?.pages || 1;
  const categories = categoriesData?.categories || [];

  const setParam = (key, val) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set(key, val); else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('search', searchInput.trim());
  };

  const activeCategory = categories.find(c => c.slug === category);

  return (
    <UserLayout>
      <div className="newsList-header">
        <div className="container">
          <div className="newsList-header-inner">
            <div>
              <div className="newsList-breadcrumb">
                <Link to="/">Home</Link> <span>/</span>
                <span>{activeCategory ? activeCategory.name : search ? `Search: "${search}"` : 'All News'}</span>
              </div>
              <h1 className="newsList-title">
                {activeCategory ? <>{activeCategory.icon} {activeCategory.name}</> : search ? `Results for "${search}"` : 'Financial News'}
              </h1>
              {data && <p className="newsList-count">{data.total?.toLocaleString()} articles</p>}
            </div>
            <form className="newsList-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search news..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="form-input"
              />
              <button type="submit" className="btn btn-primary"><Search size={16} /></button>
            </form>
          </div>
        </div>
      </div>

      <div className="container newsList-body">
        <aside className="newsList-sidebar">
          {/* Sort */}
          <div className="filter-group">
            <h4 className="filter-label">Sort By</h4>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} className={`filter-btn ${sort === opt.value ? 'active' : ''}`} onClick={() => setParam('sort', opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Categories */}
          <div className="filter-group">
            <h4 className="filter-label">Categories</h4>
            <button className={`filter-btn ${!category ? 'active' : ''}`} onClick={() => setParam('category', '')}>All</button>
            {categories.map(cat => (
              <button key={cat._id} className={`filter-btn ${category === cat.slug ? 'active' : ''}`} onClick={() => setParam('category', cat.slug)}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </aside>

        <main className="newsList-main">
          {isLoading ? (
            <div className="news-grid">
              {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : news.length === 0 ? (
            <div className="empty-state">
              <Search size={48} style={{ color: 'var(--gray-300)' }} />
              <h3>No articles found</h3>
              <p>Try changing your filters or search query.</p>
            </div>
          ) : (
            <>
              <div className="news-grid">
                <AnimatePresence mode="wait">
                  {news.map((n, i) => (
                    <motion.div key={n._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <NewsCard news={n} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setParam('page', page - 1)}>
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <div className="pagination-numbers">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`pagination-num ${page === p ? 'active' : ''}`} onClick={() => setParam('page', p)}>{p}</button>
                    ))}
                  </div>
                  <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setParam('page', page + 1)}>
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </UserLayout>
  );
}
