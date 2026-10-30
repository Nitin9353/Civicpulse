import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { AlertTriangle, Clock, CheckCircle, XCircle, Zap, TrendingUp, BarChart2, Map, Settings, ArrowRight, Activity } from 'lucide-react';
import { useApp } from '../App';
import { getStats } from '../utils/storage';
import { CategoryBadge, StatusBadge, PriorityBadge, AIBadge, CATEGORY_LABELS } from '../components/shared';

const CHART_COLORS = ['#1a56db','#0ea5e9','#10b981','#f59e0b','#8b5cf6','#ec4899','#94a3b8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 13 }}>
      {label && <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--primary)', fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { complaints } = useApp();
  const navigate = useNavigate();
  const stats = getStats(complaints);

  const categoryData = useMemo(() => {
    const map = {};
    complaints.forEach(c => { map[c.category] = (map[c.category] || 0) + 1; });
    return Object.entries(map)
      .map(([cat, count]) => ({ name: CATEGORY_LABELS[cat]?.replace(/\S+\s/, '') || cat, full: CATEGORY_LABELS[cat] || cat, count, cat }))
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  const statusData = useMemo(() => [
    { name: 'Pending',     value: stats.pending,     color: '#d97706' },
    { name: 'In Progress', value: stats.in_progress,  color: '#2563eb' },
    { name: 'Resolved',    value: stats.resolved,     color: '#059669' },
    { name: 'Rejected',    value: stats.rejected,     color: '#dc2626' },
  ], [stats]);

  const priorityData = useMemo(() => {
    const map = { critical: 0, high: 0, medium: 0, low: 0 };
    complaints.forEach(c => { if (map[c.priority] !== undefined) map[c.priority]++; });
    return [
      { name: 'Critical', value: map.critical, color: '#dc2626' },
      { name: 'High',     value: map.high,     color: '#f59e0b' },
      { name: 'Medium',   value: map.medium,   color: '#2563eb' },
      { name: 'Low',      value: map.low,      color: '#059669' },
    ];
  }, [complaints]);

  const trendData = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const count = complaints.filter(c => {
        const cd = new Date(c.createdAt);
        return cd.getDate() === d.getDate() && cd.getMonth() === d.getMonth();
      }).length;
      days.push({ date: label, count });
    }
    return days;
  }, [complaints]);

  const recentComplaints = complaints.slice(0, 8);
  const criticalComplaints = complaints.filter(c => c.priority === 'critical').slice(0, 5);

  const statCards = [
    { icon: <BarChart2 size={22} />, label: 'Total Complaints',  value: stats.total,       color: '#1a56db', bg: '#dbeafe' },
    { icon: <AlertTriangle size={22} />, label: 'Pending',       value: stats.pending,     color: '#d97706', bg: '#fef3c7' },
    { icon: <Clock size={22} />,     label: 'In Progress',       value: stats.in_progress, color: '#2563eb', bg: '#dbeafe' },
    { icon: <CheckCircle size={22} />,label: 'Resolved',         value: stats.resolved,    color: '#059669', bg: '#d1fae5' },
    { icon: <XCircle size={22} />,   label: 'Rejected',          value: stats.rejected,    color: '#94a3b8', bg: 'var(--surface3)' },
    { icon: <Zap size={22} />,       label: 'Critical',          value: stats.critical,    color: '#dc2626', bg: '#fee2e2' },
  ];

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container page-wrap">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="page-title">Admin Dashboard</h1>
              <AIBadge />
            </div>
            <p className="page-subtitle">Overview of all civic complaints and system analytics</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/manage')}>
              <Settings size={14} /> Manage
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/map')}>
              <Map size={14} /> Map View
            </button>
          </div>
        </div>

        {/* Resolution rate banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1a56db 0%, #7c3aed 100%)',
          borderRadius: 'var(--r-xl)', padding: '20px 28px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          color: '#fff',
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Platform Resolution Rate</div>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{resolutionRate}%</div>
          </div>
          <div style={{ flex: 1, maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, opacity: 0.8 }}>
              <span>Resolved: {stats.resolved}</span><span>Total: {stats.total}</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${resolutionRate}%`, background: '#fff', borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
          </div>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }} onClick={() => navigate('/manage')}>
            View All <ArrowRight size={13} />
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-3" style={{ marginBottom: 24 }}>
          {statCards.map(({ icon, label, value, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg, color }}>
                {icon}
              </div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trend + Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Area trend */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Activity size={16} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>Complaint Trend — Last 14 Days</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1a56db" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#1a56db" strokeWidth={2} fill="url(#trendGrad)" name="Complaints" dot={{ r: 3, fill: '#1a56db' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut status */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, letterSpacing: '-0.02em' }}>Status Breakdown</div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center', marginTop: 4 }}>
              {statusData.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-muted)' }}>{s.name}: <strong style={{ color: 'var(--text)' }}>{s.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category + Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, letterSpacing: '-0.02em' }}>Complaints by Category</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text)' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 5, 5, 0]} name="Complaints">
                  {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, letterSpacing: '-0.02em' }}>Priority Distribution</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData} margin={{ top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]} name="Complaints">
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              {priorityData.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                  <span style={{ color: 'var(--text-muted)' }}>{p.name}: <strong style={{ color: 'var(--text)' }}>{p.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent + Critical */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Recent */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>Recent Complaints</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/manage')}>View All <ArrowRight size={13} /></button>
            </div>
            <div>
              {recentComplaints.map((c, i) => (
                <div key={c.id} style={{
                  display: 'flex', gap: 12, alignItems: 'center',
                  padding: '11px 0',
                  borderBottom: i < recentComplaints.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.location} · {new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <CategoryBadge category={c.category} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical */}
          <div className="card" style={{ border: '1px solid #fca5a5', background: 'linear-gradient(135deg, var(--surface), #fff5f5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontWeight: 700, fontSize: 15, color: '#991b1b', letterSpacing: '-0.02em' }}>Critical ({stats.critical})</span>
            </div>
            {criticalComplaints.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No critical complaints 🎉</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {criticalComplaints.map(c => (
                  <div key={c.id} style={{ padding: '10px 12px', background: '#fff5f5', borderRadius: 10, border: '1px solid #fca5a5' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, color: 'var(--text)' }}>
                      {c.title.length > 52 ? c.title.substring(0, 52) + '...' : c.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#991b1b', marginBottom: 5 }}>{c.location}</div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <StatusBadge status={c.status} />
                      <span style={{ fontSize: 11, color: '#991b1b', fontWeight: 700 }}>Score: {c.priorityScore}</span>
                    </div>
                  </div>
                ))}
                <button className="btn btn-danger btn-sm" style={{ marginTop: 4 }} onClick={() => navigate('/manage?priority=critical')}>
                  View All Critical
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
