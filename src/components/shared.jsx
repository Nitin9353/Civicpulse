import React from 'react';

const CATEGORY_LABELS = {
  road:        '🛣️ Road',
  water:       '💧 Water',
  garbage:     '🗑️ Garbage',
  electricity: '⚡ Electricity',
  drainage:    '🌊 Drainage',
  streetlight: '💡 Streetlight',
  other:       '📋 Other',
};
const STATUS_LABELS = {
  pending:     'Pending',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  rejected:    'Rejected',
};

export function CategoryBadge({ category }) {
  return <span className={`badge cat-${category}`}>{CATEGORY_LABELS[category] || category}</span>;
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge badge-${priority}`}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
}

export function PriorityBar({ score }) {
  const color = score >= 80 ? 'var(--danger)' : score >= 60 ? 'var(--warning)' : score >= 40 ? 'var(--primary)' : 'var(--success)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="priority-bar-track">
        <div className="priority-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
    </div>
  );
}

export function AIBadge() {
  return <span className="ai-badge">✦ Rule-Based AI</span>;
}

export function Spinner({ size = 20, color }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid var(--border)`,
      borderTopColor: color || 'var(--primary)',
      borderRadius: '50%',
    }} className="spinner" />
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn-icon" onClick={onClose} style={{ padding: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Timeline({ history }) {
  return (
    <div className="timeline">
      {history.map((item, i) => {
        const dotClass = item.status === 'resolved' ? 'success' : item.status === 'rejected' ? 'danger' : item.status === 'pending' ? 'pending' : '';
        return (
          <div key={i} className="timeline-item">
            <div className={`timeline-dot ${dotClass}`} />
            <div className="timeline-content">
              <div className="timeline-label"><StatusBadge status={item.status} /></div>
              <div className="timeline-time">
                {new Date(item.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              {item.note && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{item.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'Nothing here yet', subtitle = '' }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{subtitle}</div>}
    </div>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r-sm)', padding: '10px 14px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

export const CATEGORIES   = ['road', 'water', 'garbage', 'electricity', 'drainage', 'streetlight', 'other'];
export const STATUSES     = ['pending', 'in_progress', 'resolved', 'rejected'];
export { CATEGORY_LABELS, STATUS_LABELS };
