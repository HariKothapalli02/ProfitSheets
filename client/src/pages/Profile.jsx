import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import UserLayout from '../layouts/UserLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put('/auth/profile', data);
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <UserLayout>
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h3>Please Login</h3>
          <p>You must be logged in to view this page.</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="page-header">
        <div className="container">
          <h1>My Profile</h1>
          <p>Manage your account settings</p>
        </div>
      </div>
      <div className="container" style={{ padding: '40px 24px', maxWidth: 600 }}>
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user.email}
                disabled
                style={{ background: 'var(--gray-100)', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Avatar Image URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatar')}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
