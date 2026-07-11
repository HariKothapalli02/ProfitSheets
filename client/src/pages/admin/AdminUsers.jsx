import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, UserCheck, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.put(`/admin/users/${id}`, { isActive }),
    onSuccess: () => { toast.success('User updated'); queryClient.invalidateQueries(['admin', 'users']); },
    onError: () => toast.error('Failed'),
  });

  const users = data?.users || [];

  return (
    <AdminLayout title="User Management">
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {isLoading ? (
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />)}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--gray-light)', color: 'var(--gray-600)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'admin' ? 'var(--green)' : 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{u.name?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--gray-500)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge ${u.role === 'admin' ? 'badge-green' : 'badge-navy'}`}>{u.role}</span></td>
                  <td style={{ padding: '12px 16px', color: 'var(--gray-400)', fontSize: '0.8rem' }}>{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '0.78rem', fontWeight: 700, color: u.isActive ? 'var(--green-dark)' : 'var(--error)' }}>{u.isActive ? '● Active' : '● Inactive'}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    {u.role !== 'admin' && (
                      <button className={`btn btn-ghost btn-icon`} title={u.isActive ? 'Deactivate' : 'Activate'} style={{ color: u.isActive ? 'var(--error)' : 'var(--green)' }}
                        onClick={() => toggleMutation.mutate({ id: u._id, isActive: !u.isActive })}>
                        {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {users.length === 0 && !isLoading && <div className="empty-state" style={{ padding: '48px 24px' }}><h3>No users found</h3></div>}
      </div>
    </AdminLayout>
  );
}
