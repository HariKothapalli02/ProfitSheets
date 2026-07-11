import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '📰', themeColor: '#0B2D52' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => api.get('/categories/all').then(r => r.data),
  });
  const categories = data?.categories || [];

  const createMutation = useMutation({
    mutationFn: (body) => editingId ? api.put(`/categories/${editingId}`, body) : api.post('/categories', body),
    onSuccess: () => {
      toast.success(editingId ? 'Category updated!' : 'Category created!');
      queryClient.invalidateQueries(['categories']);
      setCreating(false); setEditingId(null);
      setForm({ name: '', description: '', icon: '📰', themeColor: '#0B2D52' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries(['categories']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description, icon: cat.icon, themeColor: cat.themeColor });
    setCreating(true);
  };

  const handleSubmit = (e) => { e.preventDefault(); createMutation.mutate(form); };

  return (
    <AdminLayout title="Categories">
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Form */}
        {(creating || editingId) && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, minWidth: 300, flex: '0 0 300px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontWeight: 700, color: 'var(--navy)' }}>{editingId ? 'Edit Category' : 'New Category'}</h4>
              <button className="btn btn-ghost btn-icon" onClick={() => { setCreating(false); setEditingId(null); }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Category name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Icon (emoji)</label>
                <input className="form-input" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="📰" />
              </div>
              <div className="form-group">
                <label className="form-label">Theme Color</label>
                <input type="color" className="form-input" style={{ height: 40, padding: 4 }} value={form.themeColor} onChange={e => setForm({...form, themeColor: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                <Check size={14} /> {createMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem' }}>{categories.length} categories</p>
            {!creating && <button className="btn btn-green btn-sm" onClick={() => setCreating(true)}><Plus size={14} /> New Category</button>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {isLoading ? [1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />) :
              categories.map(cat => (
                <motion.div key={cat._id} className="card" style={{ padding: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: cat.themeColor }}>{cat.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{cat.slug}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => startEdit(cat)}><Edit size={13} /></button>
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--error)' }} onClick={() => { if(confirm(`Delete ${cat.name}?`)) deleteMutation.mutate(cat._id); }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
