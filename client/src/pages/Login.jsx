import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
          <h1 className="auth-brand-title">Your trusted financial news partner</h1>
          <p className="auth-brand-sub">Get real-time market updates, IPO news, stock analysis and much more.</p>
          <div className="auth-brand-features">
            {['📈 Live Market Updates', '📊 In-depth Analysis', '🏦 IPO Calendar', '💹 Trading Insights'].map(f => (
              <div key={f} className="auth-feature">{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <motion.div className="auth-card" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your ProfitSheets account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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
                  placeholder="••••••••"
                  {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>Demo Credentials</span></div>
          <div className="auth-demo">
            <div className="demo-cred"><strong>Admin:</strong> admin@profitsheets.com / admin123456</div>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
