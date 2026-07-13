import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';
import './BreakingNewsTicker.css';

export default function BreakingNewsTicker() {
  const { data: latestData, isLoading } = useQuery({
    queryKey: ['news', 'latest-top-10'],
    queryFn: () => api.get('/news?limit=10').then(r => r.data),
  });

  const latest = latestData?.news || [];

  // Sort by views descending to get "top views news"
  const topViewsNews = [...latest]
    .sort((a, b) => (b.views || 0) - (a.views || 0));

  if (isLoading) {
    return (
      <div className="breaking-ticker-container loading">
        <div className="breaking-label-badge">
          <div className="breaking-label-badge-content">
            <span className="breaking-pulse-dot" />
            <span>BREAKING NEWS</span>
          </div>
        </div>
        <div className="breaking-marquee-container">
          <span className="breaking-loading-text">Loading top news...</span>
        </div>
        <div className="breaking-wire-badge">
          <div className="breaking-wire-badge-content">PROFIT SHEETS</div>
        </div>
      </div>
    );
  }

  // If no news, we render a default welcoming message
  const displayItems = topViewsNews.length > 0 
    ? topViewsNews 
    : [{ _id: 'default', title: 'Welcome to ProfitSheets - Your source for real-time financial intelligence.', category: { name: 'PROFIT' }, publishedAt: new Date() }];

  // To make the scrolling seamless, we duplicate the list of items
  const duplicatedItems = [...displayItems, ...displayItems];

  return (
    <div className="breaking-ticker-container">
      <div className="breaking-label-badge">
        <div className="breaking-label-badge-content">
          <span className="breaking-pulse-dot" />
          <span>BREAKING NEWS</span>
        </div>
      </div>
      
      <div className="breaking-marquee-container">
        <div className="breaking-marquee-track">
          {duplicatedItems.map((item, index) => {
            const timeStr = item.publishedAt 
              ? format(new Date(item.publishedAt), 'hh:mm a') 
              : format(new Date(), 'hh:mm a');
            
            const categoryName = item.category?.name || 'Markets';

            if (item._id === 'default') {
              return (
                <div key={`${item._id}-${index}`} className="breaking-item default-msg">
                  <span className="breaking-item-category">{categoryName}</span>
                  <span className="breaking-item-time">{timeStr}</span>
                  <span className="breaking-item-title">{item.title}</span>
                </div>
              );
            }

            return (
              <Link 
                key={`${item._id}-${index}`} 
                to={`/news/${item.slug}`} 
                className="breaking-item"
              >
                <span className="breaking-item-category">{categoryName}</span>
                <span className="breaking-item-time">{timeStr}</span>
                <span className="breaking-item-title">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="breaking-wire-badge">
        <div className="breaking-wire-badge-content">PROFIT SHEETS</div>
      </div>
    </div>
  );
}
