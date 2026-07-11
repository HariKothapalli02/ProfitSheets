import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ name, email, password }) => {
    setLoading(true);
    try {
      await registerUser(name, email, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="10" fill="rgba(255,255,255,0.15)"/><text x="24" y="33" fontSize="26" textAnchor="middle" fill="white" fontWeight="bold" fontFamily="Arial">P</text><polygon points="7,9 14,9 9,17" fill="#00A651"/></svg>
            <span>ProfitSheets</span>
          </div>
          <h1 className="auth-brand-title">Start your investment journey today</h1>
          <p className="auth-brand-sub">Join thousands of investors and traders who trust ProfitSheets for financial insights.</p>
          <div className="auth-brand-features">
            {['🔖 Save Articles', '💬 Join Discussions', '❤️ Like & Share', '📱 Any Device'].map(f => (
              <div key={f} className="auth-feature">{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <motion.div className="auth-card" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
          <div className="auth-card-header">
            <h2>Create Account</h2>
            <p>Join ProfitSheets — it's free</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="John Doe"
                {...register('name', { required: 'Name required', minLength: { value: 2, message: 'Min 2 characters' } })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min 6 characters"
                  {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p style={{ fontSize: '0.76rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: 12 }}>
            By registering you agree to our <Link to="/terms" style={{ color: 'var(--navy)' }}>Terms</Link> and <Link to="/privacy" style={{ color: 'var(--navy)' }}>Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
