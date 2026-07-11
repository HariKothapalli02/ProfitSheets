import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import MarketTicker from '../components/MarketTicker/MarketTicker';
import { format } from 'date-fns';
import '../components/MarketTicker/MarketTicker.css';
import './UserLayout.css';

function HeaderClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="header-clock">
      ● {format(time, 'dd MMM yyyy - hh:mm:ss a')} IST
    </span>
  );
}

export default function UserLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`user-layout-wrapper ${collapsed ? 'collapsed' : ''}`}>
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className="user-layout-main">
        {/* Top Header Bar */}
        <header className="user-top-header">
          <div className="top-header-level-1">
            <div className="top-header-links">
              <Link to="/news" className="header-nav-link">News Feed</Link>
              <Link to="/markets" className="header-nav-link">Markets</Link>
              <Link to="/news?category=ipo-calendar" className="header-nav-link">IPO</Link>
              <Link to="/news?category=cryptocurrency" className="header-nav-link">Crypto</Link>
            </div>
            <div className="top-header-clock-section">
              <HeaderClock />
            </div>
          </div>
          <div className="top-header-level-2">
            <MarketTicker />
          </div>
        </header>
        
        <div className="navbar-spacer" />

        <main className="user-layout-content" style={{ minHeight: '75vh' }}>
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
