import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Newspaper, Users, Eye, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import { formatDistanceToNow } from 'date-fns';
import './AdminDashboard.css';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <motion.div className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="stat-icon" style={{ background: `${color}18`, color }}><Icon size={22} /></div>
      <div>
        <div className="stat-value">{value?.toLocaleString() ?? '—'}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data.stats),
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = data?.monthlyData?.map(d => ({ month: monthNames[d._id.month - 1], articles: d.count })) || [];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="stats-grid">
        {isLoading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)
        ) : (
          <>
            <StatCard label="Total News" value={data?.totalNews} icon={Newspaper} color="#0B2D52" sub={`${data?.todayNews} today`} />
            <StatCard label="Published" value={data?.publishedNews} icon={TrendingUp} color="#00A651" />
            <StatCard label="Drafts" value={data?.draftNews} icon={Clock} color="#F59E0B" />
            <StatCard label="Total Users" value={data?.totalUsers} icon={Users} color="#6366F1" />
            <StatCard label="Total Views" value={data?.totalViews} icon={Eye} color="#06B6D4" />
            <StatCard label="Comments" value={data?.totalComments} icon={MessageSquare} color="#EC4899" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Monthly Articles</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B2D52" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0B2D52" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--gray-500)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--gray-500)' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                <Area type="monotone" dataKey="articles" stroke="#0B2D52" strokeWidth={2} fill="url(#colorArticles)" name="Articles" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No data yet</div>
          )}
        </div>

        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Top Categories</h3>
          {data?.topCategories?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topCategories.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--gray-500)' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--gray-500)' }} width={100} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                <Bar dataKey="count" fill="#00A651" radius={[0, 4, 4, 0]} name="Articles" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No data yet</div>
          )}
        </div>
      </div>

      {/* Top articles & Recent users */}
      <div className="admin-bottom-grid">
        <div className="admin-table-card">
          <h3 className="admin-chart-title">Top Articles by Views</h3>
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Views</th><th>Likes</th></tr></thead>
            <tbody>
              {data?.topArticles?.map(a => (
                <tr key={a._id}>
                  <td className="table-title" title={a.title}>
                    <div className="table-title-text">{a.title}</div>
                  </td>
                  <td><span className="table-num"><Eye size={12} /> {a.views?.toLocaleString()}</span></td>
                  <td>{a.likes}</td>
                </tr>
              ))}
              {(!data?.topArticles?.length) && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 24 }}>No articles yet</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="admin-table-card">
          <h3 className="admin-chart-title">Recent Users</h3>
          <div className="recent-users-list">
            {data?.recentUsers?.map(u => (
              <div key={u._id} className="recent-user">
                <div className="recent-user-avatar">{u.name?.[0]?.toUpperCase()}</div>
                <div>
                  <p className="recent-user-name">{u.name}</p>
                  <p className="recent-user-email">{u.email}</p>
                </div>
                <span className="recent-user-time">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</span>
              </div>
            ))}
            {(!data?.recentUsers?.length) && <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 24 }}>No users yet</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
