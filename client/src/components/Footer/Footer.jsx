import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaTwitter, FaLinkedin, FaYoutube, FaInstagram } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="footer-logo-icon">
              <svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="#fff" fillOpacity="0.15"/><text x="20" y="29" fontSize="22" textAnchor="middle" fill="white" fontWeight="bold" fontFamily="Arial">P</text><polygon points="6,8 12,8 8,14" fill="#00A651"/></svg>
            </div>
            <span className="footer-logo-text"><span>Profit</span><span className="green">Sheets</span></span>
          </Link>
          <p className="footer-tagline">Financial news and intelligence made simple.</p>
          
          <div className="footer-socials">
            <a href="#" aria-label="Twitter"><FaTwitter size={14} /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin size={14} /></a>
            <a href="#" aria-label="YouTube"><FaYoutube size={14} /></a>
            <a href="#" aria-label="Instagram"><FaInstagram size={14} /></a>
          </div>
        </div>

        <div className="footer-links">
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
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <p className="footer-copy">© {new Date().getFullYear()} ProfitSheets. All rights reserved. <span className="footer-email">| support@profitsheets.com</span></p>
        <p className="footer-disclaimer">Disclaimer: Content is for informational purposes only and not investment advice.</p>
      </div>
    </footer>
  );
}
