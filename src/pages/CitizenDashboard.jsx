import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, X, CheckCircle, Clock, Eye, MapPin, Phone, User, FileText, Sparkles, Search, ChevronRight } from 'lucide-react';
import { useApp } from '../App';
import { addComplaint, generateId } from '../utils/storage';
import { CategoryBadge, StatusBadge, PriorityBadge, PriorityBar, Timeline, Modal, EmptyState, AIBadge, CATEGORIES, CATEGORY_LABELS } from '../components/shared';

const INITIAL = { title: '', description: '', category: '', location: '', citizenName: '', citizenPhone: '', image: null };

function validate(f) {
  const e = {};
  if (!f.title.trim())                          e.title       = 'Title is required';
  else if (f.title.trim().length < 10)          e.title       = 'Title must be at least 10 characters';
  if (!f.description.trim())                    e.description = 'Description is required';
  else if (f.description.trim().length < 20)    e.description = 'Please provide more detail (min 20 characters)';
  if (!f.category)                              e.category    = 'Please select a category';
  if (!f.location.trim())                       e.location    = 'Location is required';
  if (!f.citizenName.trim())                    e.citizenName = 'Your name is required';
  if (!f.citizenPhone.trim())                   e.citizenPhone = 'Phone number is required';
  else if (!/^[6-9]\d{9}$/.test(f.citizenPhone.trim())) e.citizenPhone = 'Enter a valid 10-digit Indian mobile number';
  return e;
}

const CAT_ICONS = { road:'🛣️', water:'💧', garbage:'🗑️', electricity:'⚡', drainage:'🌊', streetlight:'💡', other:'📋' };

export default function CitizenDashboard() {
  const { complaints, refreshComplaints } = useApp();
  const [tab, setTab]           = useState('submit');
  const [form, setForm]         = useState(INITIAL);
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(null);
  const [selectedC, setSelectedC] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [filterPhone, setFilterPhone] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();

  const myComplaints = filterPhone
    ? complaints.filter(c => c.citizenPhone === filterPhone)
    : complaints;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  }

  function processFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(e => ({ ...e, image: 'Image must be less than 5MB' })); return; }
    const reader = new FileReader();
    reader.onload = ev => { setImagePreview(ev.target.result); setForm(f => ({ ...f, image: ev.target.result })); };
    reader.readAsDataURL(file);
  }

  function handleImage(e) { processFile(e.target.files[0]); }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => {
      const id = generateId();
      const complaint = { ...form, id, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), assignedDepartment: '', statusNote: '' };
      addComplaint(complaint, complaints);
      refreshComplaints();
      setSuccess({ id });
      setForm(INITIAL); setImagePreview(null); setErrors({});
      setSubmitting(false);
    }, 900);
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container page-wrap">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Citizen Dashboard</h1>
            <p className="page-subtitle">Submit a complaint or view your history</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn btn-sm ${tab === 'submit' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('submit')}>
              <Plus size={13} /> New Complaint
            </button>
            <button className={`btn btn-sm ${tab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('history')}>
              <Clock size={13} /> History
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="fade-in" style={{
            background: 'linear-gradient(135deg, #d1fae5, #ecfdf5)',
            border: '1.5px solid #6ee7b7', borderRadius: 'var(--r-lg)',
            padding: '18px 22px', marginBottom: 24,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={20} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--success)', marginBottom: 4 }}>Complaint submitted & AI-processed!</div>
              <div style={{ fontSize: 13, color: '#065f46' }}>
                Your ID: <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.02em' }}>{success.id}</strong>
                <span style={{ marginLeft: 8, color: '#047857' }}>Save this to track your complaint</span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-success" onClick={() => navigate(`/track/${success.id}`)}>
                  Track Complaint <ChevronRight size={12} />
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => setSuccess(null)}>Dismiss</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'submit' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,5fr) minmax(0,2fr)', gap: 24 }}>

            {/* Form card */}
            <div className="card" style={{ padding: '28px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>Submit a New Complaint</h2>
                <AIBadge />
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Complaint Title *</label>
                  <input
                    className={`form-control ${errors.title ? 'error' : ''}`}
                    name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g. Large pothole on Main Road causing accidents"
                    maxLength={120}
                  />
                  {errors.title ? <div className="form-error">⚠ {errors.title}</div> : <div className="form-hint">{form.title.length}/120</div>}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className={`form-control ${errors.description ? 'error' : ''}`}
                    name="description" value={form.description} onChange={handleChange}
                    placeholder="Describe the problem in detail — include landmarks, duration, and impact on residents. The AI uses this to determine priority."
                    rows={5}
                  />
                  {errors.description ? <div className="form-error">⚠ {errors.description}</div> : <div className="form-hint">Be specific — better descriptions get more accurate AI priority scores</div>}
                </div>

                {/* Category + Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className={`form-control ${errors.category ? 'error' : ''}`} name="category" value={form.category} onChange={handleChange}>
                      <option value="">Select category...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                    </select>
                    {errors.category && <div className="form-error">⚠ {errors.category}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label"><MapPin size={11} style={{ marginRight: 3 }} />Location *</label>
                    <input
                      className={`form-control ${errors.location ? 'error' : ''}`}
                      name="location" value={form.location} onChange={handleChange}
                      placeholder="e.g. Sector 12, MG Road near bus stop"
                    />
                    {errors.location && <div className="form-error">⚠ {errors.location}</div>}
                  </div>
                </div>

                {/* Name + Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label"><User size={11} style={{ marginRight: 3 }} />Your Name *</label>
                    <input className={`form-control ${errors.citizenName ? 'error' : ''}`} name="citizenName" value={form.citizenName} onChange={handleChange} placeholder="Full name" />
                    {errors.citizenName && <div className="form-error">⚠ {errors.citizenName}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label"><Phone size={11} style={{ marginRight: 3 }} />Phone Number *</label>
                    <input className={`form-control ${errors.citizenPhone ? 'error' : ''}`} name="citizenPhone" value={form.citizenPhone} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} />
                    {errors.citizenPhone && <div className="form-error">⚠ {errors.citizenPhone}</div>}
                  </div>
                </div>

                {/* Image upload — drag and drop */}
                <div className="form-group">
                  <label className="form-label"><Upload size={11} style={{ marginRight: 3 }} />Photo (optional)</label>
                  {imagePreview ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={imagePreview} alt="preview" style={{ height: 150, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--border)', display: 'block' }} />
                      <button type="button"
                        onClick={() => { setImagePreview(null); setForm(f => ({ ...f, image: null })); fileRef.current.value = ''; }}
                        style={{ position: 'absolute', top: -8, right: -8, background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                        color: 'var(--text-muted)', background: dragOver ? 'var(--primary-light)' : 'var(--surface2)',
                        transition: 'all 0.15s',
                      }}
                      onClick={() => fileRef.current.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                    >
                      <Upload size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5, color: dragOver ? 'var(--primary)' : 'inherit' }} />
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{dragOver ? 'Drop your photo here' : 'Click or drag & drop a photo'}</div>
                      <div style={{ fontSize: 11.5, marginTop: 4, color: 'var(--text-light)' }}>JPG, PNG, WEBP · Max 5MB</div>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                  {errors.image && <div className="form-error">⚠ {errors.image}</div>}
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={submitting}
                  style={{ marginTop: 6, padding: '13px 0', fontSize: 15, borderRadius: 'var(--r)', justifyContent: 'center' }}>
                  {submitting
                    ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} className="spinner" /> AI Processing...</>
                    : <><Sparkles size={16} /> Submit Complaint</>
                  }
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* AI box */}
              <div style={{
                background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
                border: '1px solid #c7d2fe', borderRadius: 'var(--r-lg)', padding: '18px 20px',
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={15} /> AI Will Automatically:
                </div>
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {['Confirm or refine category', 'Write a plain-English summary', 'Score priority 0–100', 'Check for similar complaints', 'Generate department action brief'].map((item, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--primary)', lineHeight: 2, fontWeight: 500 }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Stats */}
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, letterSpacing: '-0.01em' }}>📊 Platform Stats</div>
                {[
                  { label: 'Total Complaints', value: complaints.length },
                  { label: 'Resolved',         value: complaints.filter(c => c.status === 'resolved').length },
                  { label: 'Pending',          value: complaints.filter(c => c.status === 'pending').length },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13.5 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Track shortcut */}
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🔍 Track a Complaint</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>Already submitted? Enter your complaint ID to check status.</p>
                <button className="btn btn-secondary btn-sm w-full" onClick={() => navigate('/track')} style={{ justifyContent: 'center' }}>
                  <Search size={13} /> Go to Tracker
                </button>
              </div>
            </div>
          </div>

        ) : (
          /* ── History tab ─────────────────────────────────── */
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label className="form-label">Filter by your phone number</label>
                  <input className="form-control" placeholder="Enter your registered phone number" value={filterPhone} onChange={e => setFilterPhone(e.target.value)} maxLength={10} />
                </div>
                {filterPhone && <button className="btn btn-secondary btn-sm" onClick={() => setFilterPhone('')}><X size={13} /> Clear</button>}
              </div>
              <div className="form-hint" style={{ marginTop: 8 }}>Leave empty to browse all complaints</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Showing {myComplaints.length} complaint{myComplaints.length !== 1 ? 's' : ''}</span>
            </div>

            {myComplaints.length === 0 ? (
              <EmptyState icon="📋" title="No complaints found" subtitle={filterPhone ? 'No complaints found for this phone number.' : 'Submit your first complaint using the form above.'} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myComplaints.map(c => (
                  <div key={c.id} className="card" style={{
                    display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap',
                    borderLeft: `4px solid ${c.priority === 'critical' ? 'var(--danger)' : c.priority === 'high' ? 'var(--warning)' : c.priority === 'medium' ? 'var(--primary)' : 'var(--success)'}`,
                    padding: '16px 18px',
                  }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 7 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, background: 'var(--surface3)', padding: '2px 8px', borderRadius: 'var(--r-xs)', fontWeight: 700, color: 'var(--primary)', border: '1px solid var(--border)' }}>{c.id}</span>
                        <CategoryBadge category={c.category} />
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 5, letterSpacing: '-0.01em' }}>{c.title}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 3 }}>
                        <MapPin size={11} style={{ marginRight: 3, display: 'inline', verticalAlign: 'middle' }} />{c.location}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedC(c)}><Eye size={12} /> Details</button>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/track/${c.id}`)}>Track</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        <Modal open={!!selectedC} onClose={() => setSelectedC(null)} title="Complaint Details">
          {selectedC && (
            <div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                <CategoryBadge category={selectedC.category} />
                <StatusBadge status={selectedC.status} />
                <PriorityBadge priority={selectedC.priority} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>{selectedC.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.7 }}>{selectedC.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  ['Complaint ID', selectedC.id],
                  ['Location',    selectedC.location],
                  ['Submitted By',selectedC.citizenName],
                  ['Date',        new Date(selectedC.createdAt).toLocaleDateString('en-IN')],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--surface2)', padding: '10px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>

              {selectedC.aiSummary && (
                <div style={{ background: 'var(--primary-light)', border: '1px solid #bfdbfe', borderRadius: 'var(--r-sm)', padding: '12px 14px', marginBottom: 16 }}>
                  <div className="ai-badge" style={{ marginBottom: 6 }}>✦ AI Summary</div>
                  <div style={{ fontSize: 13, color: 'var(--primary)', lineHeight: 1.65 }}>{selectedC.aiSummary}</div>
                  {selectedC.priorityScore !== undefined && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 12, color: 'var(--primary)', marginBottom: 4, fontWeight: 600 }}>Priority Score</div>
                      <PriorityBar score={selectedC.priorityScore} />
                    </div>
                  )}
                </div>
              )}

              {selectedC.statusHistory?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Status Timeline</div>
                  <Timeline history={selectedC.statusHistory} />
                </div>
              )}

              <div style={{ marginTop: 18 }}>
                <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }}
                  onClick={() => { setSelectedC(null); navigate(`/track/${selectedC.id}`); }}>
                  Full Tracking View <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
}
