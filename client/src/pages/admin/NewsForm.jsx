import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Plus, Image, Eye, Save, Send } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import toast from 'react-hot-toast';
import './NewsForm.css';

const CATEGORIES_STATIC = [
  'Stock News', 'IPO Calendar', 'Business News', 'Technology', 'Startup News', 'Forex',
  'Cryptocurrency', 'Mutual Funds', 'Market Analysis', 'Global Markets', 'Banking', 'Commodities',
  'Sports', 'Indian Economy', 'Company Announcements', 'Quarterly Results', 'Investment Tips',
  'Personal Finance', 'Government Policies', 'Trading Strategies'
];

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: { status: 'published', featured: false, breaking: false, trending: false, readingTime: 3 }
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => api.get('/categories/all').then(r => r.data),
  });
  const categories = categoriesData?.categories || [];

  // Load existing article for edit
  const { data: existingData } = useQuery({
    queryKey: ['news', 'admin', id],
    queryFn: () => api.get(`/news/admin/${id}`).then(r => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingData?.news) {
      const n = existingData.news;
      reset({
        title: n.title, description: n.description, content: n.content,
        category: n.category?._id, subCategory: n.subCategory, thumbnail: n.thumbnail,
        source: n.source, sourceUrl: n.sourceUrl, featured: n.featured, breaking: n.breaking,
        trending: n.trending, status: n.status, seoTitle: n.seoTitle, seoDescription: n.seoDescription,
        readingTime: n.readingTime, authorName: n.authorName,
      });
      setTags(n.tags || []);
    }
  }, [existingData, reset]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };
  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const mutation = useMutation({
    mutationFn: (body) => isEdit ? api.put(`/news/${id}`, body) : api.post('/news', body),
    onSuccess: () => {
      toast.success(isEdit ? 'Article updated!' : 'Article published!');
      queryClient.invalidateQueries(['admin', 'news']);
      navigate('/admin/news');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const onSubmit = (data) => {
    mutation.mutate({ ...data, tags });
  };

  const title = watch('title');
  const content = watch('content');
  const thumbnail = watch('thumbnail');

  return (
    <AdminLayout title={isEdit ? 'Edit Article' : 'Create Article'}>
      <div className="news-form-wrap">
        {/* Header */}
        <div className="news-form-header">
          <Link to="/admin/news" className="btn btn-ghost btn-sm"><ArrowLeft size={15} /> Back</Link>
          <div className="news-form-header-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewMode(!previewMode)}>
              <Eye size={14} /> {previewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {previewMode ? (
          <div className="news-form-preview">
            {thumbnail && <img src={thumbnail} alt="Preview" style={{ width: '100%', borderRadius: 12, marginBottom: 24, maxHeight: 400, objectFit: 'cover' }} />}
            <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>{title || 'Untitled Article'}</h1>
            <div dangerouslySetInnerHTML={{ __html: content?.replace(/\n/g, '<br/>') || '<p style="color: var(--gray-400)">No content yet...</p>' }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="news-form">
            <div className="news-form-layout">
              {/* Main content */}
              <div className="news-form-main">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input type="text" className={`form-input ${errors.title ? 'input-error' : ''}`}
                    placeholder="Enter article title..." {...register('title', { required: 'Title is required' })} />
                  {errors.title && <span className="form-error">{errors.title.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description *</label>
                  <textarea className={`form-input form-textarea ${errors.description ? 'input-error' : ''}`}
                    placeholder="Brief description (2-3 sentences)..." rows={3}
                    {...register('description', { required: 'Description is required' })} />
                  {errors.description && <span className="form-error">{errors.description.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Content *</label>
                  <textarea
                    className={`form-input form-textarea ${errors.content ? 'input-error' : ''}`}
                    placeholder="Write your full article content here... Use HTML tags for formatting: <h2>, <p>, <strong>, <ul>, <li>"
                    rows={20}
                    style={{ minHeight: 400, fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: 1.7 }}
                    {...register('content', { required: 'Content is required' })}
                  />
                  {errors.content && <span className="form-error">{errors.content.message}</span>}
                  <p className="form-hint">Supports basic HTML: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;blockquote&gt;</p>
                </div>

                {/* Tags */}
                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <div className="tags-input-wrap">
                    <input type="text" className="form-input" placeholder="Add a tag..." value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                    <button type="button" className="btn btn-outline btn-sm" onClick={addTag}><Plus size={14} /> Add</button>
                  </div>
                  {tags.length > 0 && (
                    <div className="tags-list">
                      {tags.map(t => (
                        <span key={t} className="tag-chip">#{t} <button type="button" onClick={() => removeTag(t)} className="tag-remove"><X size={10} /></button></span>
                      ))}
                    </div>
                  )}
                </div>

                {/* SEO */}
                <div className="form-section">
                  <h4 className="form-section-title">SEO Settings</h4>
                  <div className="form-group">
                    <label className="form-label">SEO Title</label>
                    <input type="text" className="form-input" placeholder="SEO title (leave blank to use article title)" {...register('seoTitle')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SEO Description</label>
                    <textarea className="form-input form-textarea" placeholder="Meta description for search engines..." rows={2} {...register('seoDescription')} />
                  </div>
                </div>
              </div>

              {/* Sidebar panel */}
              <div className="news-form-sidebar">
                {/* Publish */}
                <div className="form-panel">
                  <h4 className="form-panel-title">Publish</h4>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" {...register('status')}>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div className="toggle-group">
                    <label className="toggle-label"><input type="checkbox" {...register('featured')} /> Featured Article</label>
                    <label className="toggle-label"><input type="checkbox" {...register('breaking')} /> Breaking News</label>
                    <label className="toggle-label"><input type="checkbox" {...register('trending')} /> Trending</label>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => { setValue('status', 'draft'); handleSubmit(onSubmit)(); }}>
                      <Save size={14} /> Save Draft
                    </button>
                    <button type="submit" className="btn btn-green btn-sm" disabled={mutation.isPending}>
                      <Send size={14} /> {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Publish'}
                    </button>
                  </div>
                </div>

                {/* Category */}
                <div className="form-panel">
                  <h4 className="form-panel-title">Category</h4>
                  <div className="form-group">
                    <select className="form-input" {...register('category', { required: 'Category required' })}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                    </select>
                    {errors.category && <span className="form-error">{errors.category.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sub-Category</label>
                    <input type="text" className="form-input" placeholder="e.g. Large Cap" {...register('subCategory')} />
                  </div>
                </div>

                {/* Media */}
                <div className="form-panel">
                  <h4 className="form-panel-title">Media</h4>
                  <div className="form-group">
                    <label className="form-label">Thumbnail URL</label>
                    <input type="url" className="form-input" placeholder="https://..." {...register('thumbnail')} />
                    {thumbnail && <img src={thumbnail} alt="Preview" style={{ width: '100%', borderRadius: 8, marginTop: 8, maxHeight: 120, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
                  </div>
                </div>

                {/* Source */}
                <div className="form-panel">
                  <h4 className="form-panel-title">Source</h4>
                  <div className="form-group">
                    <label className="form-label">Source Name</label>
                    <input type="text" className="form-input" placeholder="e.g. Economic Times" {...register('source')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source URL</label>
                    <input type="url" className="form-input" placeholder="https://..." {...register('sourceUrl')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reading Time (min)</label>
                    <input type="number" className="form-input" min={1} max={60} {...register('readingTime')} />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
