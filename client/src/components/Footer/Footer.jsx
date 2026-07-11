import { Link } from 'react-router-dom';
import { Mail, Shield, Scale } from 'lucide-react';
import { FaTwitter, FaLinkedin, FaYoutube, FaInstagram } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="footer-logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="6" fill="#0B2D52"/>
                <text x="20" y="29" fontSize="22" textAnchor="middle" fill="white" fontWeight="bold" fontFamily="Arial">P</text>
                <polygon points="6,8 12,8 8,14" fill="#00A651"/>
              </svg>
            </div>
            <span className="footer-logo-text">
              <span className="logo-profit">Profit</span><span className="logo-sheets">Sheets</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Real-time financial intelligence, market analytics, and business news. Stay ahead with automated insights.
          </p>
          <div className="footer-contact-info">
            <a href="mailto:support@profitsheets.com" className="footer-contact-link">
              <Mail size={14} />
              <span>support@profitsheets.com</span>
            </a>
          </div>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter" className="social-btn"><FaTwitter size={14} /></a>
            <a href="#" aria-label="LinkedIn" className="social-btn"><FaLinkedin size={14} /></a>
            <a href="#" aria-label="YouTube" className="social-btn"><FaYoutube size={14} /></a>
            <a href="#" aria-label="Instagram" className="social-btn"><FaInstagram size={14} /></a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h5>Platform</h5>
            <Link to="/">Home</Link>
            <Link to="/news">News Feed</Link>
            <Link to="/markets">Markets</Link>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <Link to="/privacy">
              <Shield size={12} style={{ marginRight: '6px' }} />
              Privacy Policy
            </Link>
            <Link to="/terms">
              <Scale size={12} style={{ marginRight: '6px' }} />
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom-wrapper">
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p className="footer-copy">
              © {new Date().getFullYear()} ProfitSheets Inc. All rights reserved.
            </p>
          </div>
          <div className="footer-bottom-right">
            <p className="footer-disclaimer-text">
              <strong>Disclaimer:</strong> ProfitSheets is a financial information portal and does not provide investment, financial, or tax advice. All content is for informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
