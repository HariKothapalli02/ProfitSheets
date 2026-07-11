import AdminSidebar from '../components/AdminSidebar/AdminSidebar';
import '../components/AdminSidebar/AdminSidebar.css';
import './AdminLayout.css';

export default function AdminLayout({ children, title }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        {title && (
          <div className="admin-topbar">
            <h1 className="admin-page-title">{title}</h1>
          </div>
        )}
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
