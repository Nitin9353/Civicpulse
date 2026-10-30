import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, ChevronDown, ChevronUp, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../App';
import { updateComplaint } from '../utils/storage';
import { CategoryBadge, StatusBadge, PriorityBadge, PriorityBar, Timeline, Modal, AIBadge, EmptyState, CATEGORIES, STATUSES, CATEGORY_LABELS, STATUS_LABELS } from '../components/shared';

const DEPTS = [
  'PWD (Public Works Department)',
  'Water Supply & Sanitation Board',
  'Municipal Solid Waste Management',
  'State Electricity Distribution Company',
  'Stormwater Drainage Authority',
  'Urban Lighting Division',
  'General Administration Dept.',
];

export default function ComplaintManagement() {
  const { complaints, refreshComplaints } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState(searchParams.get('priority') || '');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedAI, setExpandedAI] = useState(false);

  const filtered = useMemo(() => {
    let list = [...complaints];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.citizenName?.toLowerCase().includes(q));
    }
    if (filterStatus) list = list.filter(c => c.status === filterStatus);
    if (filterCategory) list = list.filter(c => c.category === filterCategory);
    if (filterPriority) list = list.filter(c => c.priority === filterPriority);

    switch (sortBy) {
      case 'date_desc': return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'date_asc': return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'priority_desc': return list.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
      case 'priority_asc': return list.sort((a, b) => (a.priorityScore || 0) - (b.priorityScore || 0));
      default: return list;
    }
  }, [complaints, search, filterStatus, filterCategory, filterPriority, sortBy]);

  function openDetail(c) {
    setSelected(c);
    setEditForm({ status: c.status, priority: c.priority, assignedDepartment: c.assignedDepartment || '', statusNote: '' });
    setEditMode(false);
    setSaveSuccess(false);
    setExpandedAI(false);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      const updated = updateComplaint(selected.id, editForm, complaints);
      refreshComplaints();
      const freshC = updated.find(c => c.id === selected.id);
      setSelected(freshC);
      setSaving(false);
      setSaveSuccess(true);
      setEditMode(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
  }

  function clearFilters() {
    setSearch(''); setFilterStatus(''); setFilterCategory(''); setFilterPriority(''); setSortBy('date_desc');
  }

  const hasFilters = search || filterStatus || filterCategory || filterPriority || sortBy !== 'date_desc';

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">Complaint Management</h1>
            <AIBadge />
          </div>
          <p className="page-subtitle">Review, assign, and resolve all civic complaints</p>
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-muted)' }}>
          {filtered.length} of {complaints.length} complaints
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '2 1 200px' }}>
            <label className="form-label">Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-control" style={{ paddingLeft: 34 }} placeholder="Search by title, ID, location, or name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div style={{ flex: '1 1 130px' }}>
            <label className="form-label">Status</label>
            <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 130px' }}>
            <label className="form-label">Category</label>
            <select className="form-control" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 130px' }}>
            <label className="form-label">Priority</label>
            <select className="form-control" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              {['critical', 'high', 'medium', 'low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 130px' }}>
            <label className="form-label">Sort By</label>
            <select className="form-control" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="priority_desc">Highest Priority</option>
              <option value="priority_asc">Lowest Priority</option>
            </select>
          </div>
          {hasFilters && <button className="btn btn-secondary btn-sm" style={{ marginBottom: 2 }} onClick={clearFilters}><X size={13} /> Clear</button>}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No complaints match your filters" subtitle="Try adjusting or clearing the filters." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Score</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{c.id}</span></td>
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.citizenName}</div>
                  </td>
                  <td><CategoryBadge category={c.category} /></td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.location}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td>
                    <PriorityBar score={c.priorityScore || 0} />
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openDetail(c)}><Eye size={13} /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Complaint Details">
        {selected && (
          <div>
            {saveSuccess && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                <CheckCircle size={16} /> Complaint updated successfully!
              </div>
            )}

            {/* Header info */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <CategoryBadge category={selected.category} />
              <StatusBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
              <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4 }}>{selected.id}</span>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{selected.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>{selected.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                ['Location', selected.location],
                ['Citizen', selected.citizenName],
                ['Phone', selected.citizenPhone],
                ['Submitted', new Date(selected.createdAt).toLocaleDateString('en-IN')],
                ['Department', selected.assignedDepartment || 'Not assigned'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--surface2)', padding: '10px 12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>

            {selected.image && (
              <div style={{ marginBottom: 16 }}>
                <img src={selected.image} alt="Complaint" style={{ maxWidth: '100%', borderRadius: 8, maxHeight: 180, objectFit: 'cover' }} />
              </div>
            )}

            {/* AI Analysis panel */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }} onClick={() => setExpandedAI(v => !v)}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1e40af' }}>🤖 AI Analysis & Priority Reasoning</span>
                {expandedAI ? <ChevronUp size={16} color="#1e40af" /> : <ChevronDown size={16} color="#1e40af" />}
              </div>

              {expandedAI && (
                <div style={{ marginTop: 12 }}>
                  {selected.aiSummary && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>Summary</div>
                      <div style={{ fontSize: 13, color: '#1e40af' }}>{selected.aiSummary}</div>
                    </div>
                  )}

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>Priority Score: {selected.priorityScore}/100</div>
                    <PriorityBar score={selected.priorityScore} />
                  </div>

                  {selected.priorityReasons && selected.priorityReasons.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>Score Breakdown:</div>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {selected.priorityReasons.map((r, i) => (
                          <li key={i} style={{ fontSize: 12, color: '#1d4ed8', marginBottom: 3 }}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selected.duplicates && selected.duplicates.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>⚠️ Possible Duplicates ({selected.duplicates.length})</div>
                      {selected.duplicates.map(d => (
                        <div key={d.id} style={{ fontSize: 12, color: '#991b1b', marginBottom: 2 }}>
                          • {d.title} ({d.similarity}% similar)
                        </div>
                      ))}
                    </div>
                  )}

                  {selected.actionBrief && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>Recommended Actions:</div>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {selected.actionBrief.recommendedActions?.map((a, i) => (
                          <li key={i} style={{ fontSize: 12, color: '#1d4ed8', marginBottom: 3 }}>{a}</li>
                        ))}
                      </ul>
                      <div style={{ fontSize: 12, marginTop: 8, color: '#1e40af' }}>
                        <strong>SLA:</strong> {selected.actionBrief.estimatedSLA} &nbsp;·&nbsp;
                        <strong>Dept:</strong> {selected.actionBrief.assignedDepartment}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Edit controls */}
            {editMode ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Update Status</label>
                    <select className="form-control" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Update Priority</label>
                    <select className="form-control" value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}>
                      {['critical', 'high', 'medium', 'low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Department</label>
                  <select className="form-control" value={editForm.assignedDepartment} onChange={e => setEditForm(f => ({ ...f, assignedDepartment: e.target.value }))}>
                    <option value="">Select department...</option>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status Note</label>
                  <textarea className="form-control" rows={2} value={editForm.statusNote} onChange={e => setEditForm(f => ({ ...f, statusNote: e.target.value }))} placeholder="Optional note about this status update..." />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                  <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setEditMode(true)}>Update Complaint</button>
                <button className="btn btn-secondary" onClick={() => { setSelected(null); navigate(`/track/${selected.id}`); }}>Citizen View</button>
              </div>
            )}

            {/* Status history */}
            {selected.statusHistory && selected.statusHistory.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Status History</div>
                <Timeline history={selected.statusHistory} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
