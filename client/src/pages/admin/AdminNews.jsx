import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import toast from 'react-hot-toast';
import './AdminNews.css';

export default function AdminNews() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'news', search, status, page],
    queryFn: () => {
      let url = `/news?page=${page}&limit=15`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      else url += '&status=';
      return api.get(url).then(r => r.data);
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/news/${id}`),
    onSuccess: () => {
      toast.success('Article deleted');
      queryClient.invalidateQueries(['admin', 'news']);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const handleDelete = (id, title) => {
    if (confirm(`Delete "${title}"?`)) deleteMutation.mutate(id);
  };

  const news = data?.news || [];
  const totalPages = data?.pages || 1;

  return (
    <AdminLayout title="News Management">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <Search size={16} />
          <input type="text" placeholder="Search articles..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="toolbar-input" />
        </div>
        <div className="admin-toolbar-filters">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="toolbar-select">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <Link to="/admin/news/create" className="btn btn-green btn-sm"><Plus size={15} /> New Article</Link>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        {isLoading ? (
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />)}
          </div>
        ) : news.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <h3>No articles found</h3>
            <p>Create your first article to get started.</p>
            <Link to="/admin/news/create" className="btn btn-primary">Create Article</Link>
          </div>
        ) : (
          <table className="admin-news-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <div className="news-table-article">
                      {item.thumbnail && <img src={item.thumbnail} alt="" className="news-table-thumb" />}
                      <div>
                        <p className="news-table-title">{item.title}</p>
                        <p className="news-table-meta">By {item.authorName}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {item.category && (
                      <span className="badge" style={{ background: `${item.category.themeColor}18`, color: item.category.themeColor }}>
                        {item.category.icon} {item.category.name}
                      </span>
                    )}
                  </td>
                  <td><span className={`status-pill status-${item.status}`}>{item.status}</span></td>
                  <td><span style={{ fontSize: '0.84rem' }}>{item.views?.toLocaleString()}</span></td>
                  <td><span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{formatDistanceToNow(new Date(item.publishedAt || item.createdAt), { addSuffix: true })}</span></td>
                  <td>
                    <div className="news-table-actions">
                      <a href={`/news/${item.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon" title="Preview"><Eye size={15} /></a>
                      <Link to={`/admin/news/edit/${item._id}`} className="btn btn-ghost btn-icon" title="Edit"><Edit size={15} /></Link>
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--error)' }} onClick={() => handleDelete(item._id, item.title)} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 20 }}>
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
        </div>
      )}
    </AdminLayout>
  );
}
