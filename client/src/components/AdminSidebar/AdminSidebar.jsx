import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Newspaper, FolderOpen, Users, MessageSquare, Settings, LogOut, ChevronRight, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminSidebar.css';

const NAV = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'News', path: '/admin/news', icon: Newspaper },
  { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Comments', path: '/admin/comments', icon: MessageSquare },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-sidebar">
      {/* Logo */}
      <Link to="/admin" className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="rgba(255,255,255,0.12)"/><text x="20" y="28" fontSize="20" textAnchor="middle" fill="white" fontWeight="bold" fontFamily="Arial">P</text><polygon points="6,7 11,7 8,13" fill="#00A651"/></svg>
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">ProfitSheets</span>
          <span className="sidebar-logo-role">Admin Panel</span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-group">
          <span className="sidebar-nav-label">Management</span>
          {NAV.map(({ label, path, icon: Icon, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-nav-group" style={{ marginTop: 'auto' }}>
          <Link to="/" className="sidebar-nav-item" target="_blank">
            <BarChart2 size={18} />
            <span>View Site</span>
            <ChevronRight size={14} className="sidebar-external" />
          </Link>
          <button className="sidebar-nav-item sidebar-logout" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* User info */}
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className="sidebar-user-role">Administrator</span>
          </div>
        </div>
      )}
    </div>
  );
}
