import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import toast from 'react-hot-toast';

export default function AdminComments() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'comments'],
    queryFn: () => api.get('/comments/all').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/comments/${id}`),
    onSuccess: () => { toast.success('Comment deleted'); queryClient.invalidateQueries(['admin', 'comments']); },
    onError: () => toast.error('Failed'),
  });

  const comments = data?.comments || [];

  return (
    <AdminLayout title="Comments">
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {isLoading ? (
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />)}
          </div>
        ) : comments.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 24px' }}><h3>No comments yet</h3></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                {['User', 'Comment', 'Article', 'Posted', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--gray-light)', color: 'var(--gray-600)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comments.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--navy)' }}>{c.user?.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text)', maxWidth: 280 }}>
                    <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.content}</p>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.news && <Link to={`/news/${c.news.slug}`} target="_blank" style={{ color: 'var(--navy)', fontSize: '0.8rem', fontWeight: 600 }}>{c.news.title?.slice(0, 40)}...</Link>}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--gray-400)', fontSize: '0.78rem' }}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button className="btn btn-ghost btn-icon" style={{ color: 'var(--error)' }} onClick={() => { if(confirm('Delete this comment?')) deleteMutation.mutate(c._id); }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
