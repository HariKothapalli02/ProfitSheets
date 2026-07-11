import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, Sun, Moon, Menu, X, ChevronDown, ChevronUp, Bell, User, LogOut, Bookmark, Home, Newspaper, BarChart2, Calendar, Coins, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import './Navbar.css';

const CATEGORIES = [
  { name: 'Stock News', slug: 'stock-news', icon: '📈' },
  { name: 'Business News', slug: 'business-news', icon: '💼' },
  { name: 'Mutual Funds', slug: 'mutual-funds', icon: '💰' },
  { name: 'Market Analysis', slug: 'market-analysis', icon: '📊' },
  { name: 'Indian Economy', slug: 'indian-economy', icon: '🇮🇳' },
  { name: 'Government Policies', slug: 'government-policies', icon: '📜' },
];

export default function Navbar({ collapsed, setCollapsed }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [newsOpen, setNewsOpen] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });
  const categories = categoriesData?.categories || CATEGORIES;

  // Close drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/news?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ('');
      setMobileOpen(false);
    }
  };

  const renderSidebarContent = (isMobile = false) => {
    const showText = !collapsed || isMobile;

    return (
      <div className="sidebar-nav-inner">
        {/* Toggle Collapse Button for desktop */}
        {!isMobile && (
          <button className="sidebar-collapse-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle Sidebar">
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        )}

        {/* Brand logo */}
        <div className="sidebar-brand-section">
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="6" fill="#0B2D52"/>
                <text x="20" y="29" fontSize="22" textAnchor="middle" fill="white" fontWeight="bold" fontFamily="Arial">P</text>
                <polygon points="6,8 12,8 8,14" fill="#00A651"/>
              </svg>
            </div>
            {showText && (
              <span className="logo-text">
                <span className="logo-profit">Profit</span><span className="logo-sheets">Sheets</span>
              </span>
            )}
          </Link>
        </div>

        {/* Search Bar */}
        {showText ? (
          <div className="sidebar-search-section">
            <form onSubmit={handleSearch} className="sidebar-search-form">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search market news..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="sidebar-search-input"
              />
            </form>
          </div>
        ) : (
          <button className="sidebar-link sidebar-search-collapsed-btn" onClick={() => setCollapsed(false)} title="Search">
            <Search size={16} />
          </button>
        )}

        {/* Main Navigation links */}
        <div className="sidebar-links-section">
          {showText && <span className="sidebar-section-title">Navigation</span>}
          
          {/* Home */}
          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Home">
            <Home size={16} />
            {showText && <span>Home</span>}
          </NavLink>

          {/* News dropdown */}
          <div className="sidebar-dropdown-group">
            <button 
              className={`sidebar-link ${location.pathname.startsWith('/news') ? 'active' : ''}`} 
              onClick={() => {
                if (collapsed && !isMobile) {
                  setCollapsed(false);
                  setNewsOpen(true);
                } else {
                  setNewsOpen(!newsOpen);
                }
              }}
              title="News & Analysis"
            >
              <Newspaper size={16} />
              {showText && <span>News & Analysis</span>}
              {showText && (newsOpen ? <ChevronUp size={14} className="chevron" /> : <ChevronDown size={14} className="chevron" />)}
            </button>
            
            <AnimatePresence>
              {showText && (newsOpen || location.pathname.startsWith('/news')) && (
                <motion.div 
                  className="sidebar-sub-links"
                  style={{ maxHeight: '240px', overflowY: 'auto' }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <NavLink to="/news" end className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}>
                    All Articles
                  </NavLink>
                  {categories.map(cat => (
                    <NavLink key={cat.slug} to={`/news?category=${cat.slug}`} className={({ isActive }) => `sidebar-sub-link ${location.search.includes(`category=${cat.slug}`) ? 'active' : ''}`}>
                      <span className="cat-icon">{cat.icon}</span> {cat.name}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Markets */}
          <NavLink to="/markets" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Markets">
            <BarChart2 size={16} />
            {showText && <span>Markets</span>}
          </NavLink>

          {/* IPO */}
          <NavLink to="/news?category=ipo-calendar" className={({ isActive }) => `sidebar-link ${location.search.includes('category=ipo-calendar') ? 'active' : ''}`} title="IPO Calendar">
            <Calendar size={16} />
            {showText && <span>IPO Calendar</span>}
          </NavLink>

          {/* Crypto */}
          <NavLink to="/news?category=cryptocurrency" className={({ isActive }) => `sidebar-link ${location.search.includes('category=cryptocurrency') ? 'active' : ''}`} title="Cryptocurrency">
            <Coins size={16} />
            {showText && <span>Cryptocurrency</span>}
          </NavLink>
        </div>

        {/* User / Authentication section at bottom */}
        <div className="sidebar-bottom-section">
          {/* Theme toggle */}
          <button className="sidebar-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
            {theme === 'dark' ? (
              <>
                <Sun size={16} />
                {showText && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon size={16} />
                {showText && <span>Dark Mode</span>}
              </>
            )}
          </button>

          {/* User Card */}
          {user ? (
            <div className={`sidebar-user-card ${!showText ? 'collapsed' : ''}`}>
              <div className="user-card-info">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                ) : (
                  <div className="user-avatar-placeholder">{user.name?.[0]?.toUpperCase()}</div>
                )}
                {showText && (
                  <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                )}
              </div>
              
              {showText ? (
                <div className="user-card-actions">
                  <Link to="/profile" className="user-action-item" title="Profile">
                    <User size={14} /> Profile
                  </Link>
                  <Link to="/bookmarks" className="user-action-item" title="Bookmarks">
                    <Bookmark size={14} /> Bookmarks
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="user-action-item admin-link" title="Admin Panel">
                      <Bell size={14} /> Admin
                    </Link>
                  )}
                  <button className="user-action-item logout-btn" onClick={logout}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <div className="user-card-actions-collapsed">
                  <Link to="/profile" className="user-action-btn-collapsed" title="Profile">
                    <User size={14} />
                  </Link>
                  <button className="user-action-btn-collapsed logout" onClick={logout} title="Logout">
                    <LogOut size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="sidebar-auth-actions">
              {showText ? (
                <>
                  <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>Login</Link>
                  <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>Register</Link>
                </>
              ) : (
                <Link to="/login" className="sidebar-link sidebar-login-collapsed-btn" title="Sign In">
                  <User size={16} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className={`desktop-sidebar ${collapsed ? 'collapsed' : ''}`}>
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile top navigation header */}
      <header className="mobile-header">
        <div className="container mobile-header-inner">
          <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="6" fill="#0B2D52"/>
                <text x="20" y="29" fontSize="22" textAnchor="middle" fill="white" fontWeight="bold" fontFamily="Arial">P</text>
                <polygon points="6,8 12,8 8,14" fill="#00A651"/>
              </svg>
            </div>
            <span className="logo-text">
              <span className="logo-profit">Profit</span><span className="logo-sheets">Sheets</span>
            </span>
          </Link>

          <button className="btn btn-ghost btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              className="mobile-sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <button className="mobile-drawer-close" onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
              {renderSidebarContent(true)}
            </motion.div>
            <motion.div 
              className="mobile-sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
