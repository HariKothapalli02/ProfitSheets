import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import NewsCard from '../components/NewsCard/NewsCard';
import UserLayout from '../layouts/UserLayout';
import { useAuth } from '../context/AuthContext';

export default function Bookmarks() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => api.get('/news/bookmarks').then(r => r.data),
    enabled: !!user,
  });
  const bookmarks = data?.bookmarks || [];
  if (!user) return (
    <UserLayout>
      <div className="empty-state container" style={{ padding: '80px 24px' }}>
        <h3>Login Required</h3>
        <p>Please login to see your bookmarks.</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    </UserLayout>
  );
  return (
    <UserLayout>
      <div className="page-header"><div className="container"><h1>My Bookmarks</h1><p>{bookmarks.length} saved articles</p></div></div>
      <div className="container" style={{ padding: '40px 24px' }}>
        {isLoading ? (
          <div className="news-grid">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 16 }} />)}</div>
        ) : bookmarks.length === 0 ? (
          <div className="empty-state"><h3>No bookmarks yet</h3><p>Save articles by clicking the bookmark icon on any article.</p><Link to="/news" className="btn btn-primary">Browse News</Link></div>
        ) : (
          <div className="news-grid">{bookmarks.map(n => <NewsCard key={n._id} news={n} />)}</div>
        )}
      </div>
    </UserLayout>
  );
}
