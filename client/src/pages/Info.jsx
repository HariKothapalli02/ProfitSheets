import { useLocation, Link } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';

const CONTENT = {
  '/about': {
    title: 'About ProfitSheets',
    subtitle: 'Enterprise-grade financial news and analysis platform.',
    body: `
      <p>ProfitSheets is a premier stock market news and financial intelligence platform designed for modern investors, traders, and financial professionals.</p>
      <p>Our mission is to make investments simple, transparent, and accessible by providing high-quality, real-time market updates, IPO calendars, mutual fund insights, and technical market analysis.</p>
      <p>Built with speed, reliability, and security in mind, ProfitSheets offers a clean, trustworthy, and clutter-free interface to keep you ahead in the financial markets.</p>
    `
  },
  '/contact': {
    title: 'Contact Us',
    subtitle: 'Get in touch with our editorial and support team.',
    body: `
      <p>We value your feedback, news tips, and inquiries. Feel free to reach out to us through the following channels:</p>
      <div style="margin: 24px 0; display: flex; flex-direction: column; gap: 12px;">
        <p>📧 <strong>Email Support:</strong> support@profitsheets.com</p>
        <p>📞 <strong>Editorial Desk:</strong> +91 22 4567 8900</p>
        <p>📍 <strong>Headquarters:</strong> Financial District, Bandra Kurla Complex, Mumbai, India</p>
      </div>
      <p>Our support team is available Monday through Friday, from 9:00 AM to 6:00 PM IST.</p>
    `
  },
  '/privacy': {
    title: 'Privacy Policy',
    subtitle: 'How we protect your personal and financial data.',
    body: `
      <p>At ProfitSheets, we take your privacy seriously. This policy outlines how we collect, use, and protect your information:</p>
      <ul>
        <li><strong>Account Info:</strong> We only store your name, email, and password (securely hashed) to manage your account and bookmarks.</li>
        <li><strong>Activity Logs:</strong> We track article views to curate trending news and improve platform quality. We do not sell user data to third parties.</li>
        <li><strong>Security:</strong> All transactions and data transfers are protected using SSL/TLS encryption and standard industry practices.</li>
      </ul>
    `
  },
  '/terms': {
    title: 'Terms of Service',
    subtitle: 'Platform rules and terms of usage.',
    body: `
      <p>By accessing or using ProfitSheets, you agree to comply with the following terms:</p>
      <ul>
        <li><strong>Information Only:</strong> All content published on ProfitSheets is for informational purposes only. It does not constitute financial, legal, or investment advice.</li>
        <li><strong>No Liability:</strong> We are not liable for any trading losses or financial decisions made based on information from this platform. Always consult a certified financial advisor.</li>
        <li><strong>Intellectual Property:</strong> Users may not copy, scrape, or redistribute our proprietary articles and news feeds without explicit written consent.</li>
      </ul>
    `
  }
};

export default function Info() {
  const { pathname } = useLocation();
  const content = CONTENT[pathname] || {
    title: 'Information Page',
    subtitle: 'Details about our platform.',
    body: '<p>Content coming soon.</p>'
  };

  return (
    <UserLayout>
      <div className="page-header">
        <div className="container">
          <div className="newsList-breadcrumb" style={{ marginBottom: 12 }}>
            <Link to="/">Home</Link> <span>/</span> <span>{content.title}</span>
          </div>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
      </div>
      <div className="container" style={{ padding: '60px 24px', maxWidth: 800 }}>
        <div 
          className="newsDetail-content" 
          dangerouslySetInnerHTML={{ __html: content.body }} 
        />
        <div style={{ marginTop: 40 }}>
          <Link to="/" className="btn btn-primary">Go to Homepage</Link>
        </div>
      </div>
    </UserLayout>
  );
}
