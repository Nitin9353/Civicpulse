import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle, Clock, AlertTriangle, ArrowRight, ChevronRight, Building2 } from 'lucide-react';
import { useApp } from '../App';
import { CategoryBadge, StatusBadge, PriorityBadge, PriorityBar, Timeline, AIBadge } from '../components/shared';

const STATUS_STEPS = [
  { key: 'pending',     label: 'Received',    icon: AlertTriangle, color: '#d97706' },
  { key: 'in_progress', label: 'In Progress', icon: Clock,         color: '#2563eb' },
  { key: 'resolved',    label: 'Resolved',    icon: CheckCircle,   color: '#059669' },
];

export default function TrackComplaint() {
  const { id: urlId } = useParams();
  const { complaints }  = useApp();
  const navigate        = useNavigate();

  const [searchId, setSearchId] = useState(urlId || '');
  const [searched, setSearched] = useState(!!urlId);
  const [result, setResult]     = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (urlId) doSearch(urlId);
  }, [urlId, complaints]);

  function doSearch(idToSearch) {
    const q = (idToSearch || searchId).trim().toUpperCase();
    if (!q) return;
    const found = complaints.find(c => c.id.toUpperCase() === q);
    setResult(found || null);
    setNotFound(!found);
    setSearched(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate(`/track/${searchId.trim().toUpperCase()}`);
    doSearch(searchId);
  }

  const currentStep = result
    ? result.status === 'rejected' ? -1 : STATUS_STEPS.findIndex(s => s.key === result.status)
    : -1;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div className="section-label">Complaint Status</div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', marginTop: 6, marginBottom: 10 }}>
            Track Your Complaint
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            Enter your complaint ID to see the current status and AI analysis
          </p>
        </div>

        {/* Search bar */}
        <div style={{ maxWidth: 540, margin: '0 auto 44px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'flex', gap: 0,
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--r)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  style={{
                    width: '100%', padding: '14px 14px 14px 42px',
                    border: 'none', outline: 'none',
                    fontSize: 14, fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase', background: 'transparent',
                    color: 'var(--text)',
                  }}
                  placeholder="e.g. CA-M2KXYZ-ABC"
                  value={searchId}
                  onChange={e => setSearchId(e.target.value.toUpperCase())}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ borderRadius: 0, padding: '0 24px', fontSize: 14 }}>
                Track
              </button>
            </div>
          </form>
          <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', marginTop: 10 }}>
            Try: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>CA-SAMPLE001</span> through <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>CA-SAMPLE040</span>
          </div>
        </div>

        {/* Not found */}
        {searched && notFound && (
          <div className="card fade-in" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '44px 32px' }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>Complaint Not Found</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14, lineHeight: 1.7 }}>
              No complaint found with ID "<strong>{searchId}</strong>". Please check the ID and try again.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Submit a New Complaint
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>

            {/* Progress stepper */}
            {result.status !== 'rejected' && (
              <div className="card" style={{ marginBottom: 20, padding: '24px 28px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 22, letterSpacing: '-0.01em' }}>Complaint Progress</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {STATUS_STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <React.Fragment key={step.key}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            margin: '0 auto 10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: done ? step.color : 'var(--surface3)',
                            color: done ? '#fff' : 'var(--text-light)',
                            border: active ? `3px solid ${step.color}` : 'none',
                            boxShadow: active ? `0 0 0 4px ${step.color}25` : 'none',
                            transition: 'all 0.3s',
                          }}>
                            <StepIcon size={20} strokeWidth={2} />
                          </div>
                          <div style={{
                            fontSize: 12.5, fontWeight: done ? 700 : 500,
                            color: done ? step.color : 'var(--text-muted)',
                          }}>
                            {step.label}
                          </div>
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div style={{
                            flex: 2, height: 3, borderRadius: 99,
                            background: i < currentStep
                              ? `linear-gradient(to right, ${STATUS_STEPS[i].color}, ${STATUS_STEPS[i+1].color})`
                              : 'var(--border)',
                            transition: 'background 0.4s',
                            margin: '0 4px', marginBottom: 28,
                          }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {result.status === 'rejected' && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                This complaint has been rejected. Please review the status history below for the reason.
              </div>
            )}

            {/* Main card */}
            <div className="card" style={{ marginBottom: 16, padding: '24px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <CategoryBadge category={result.category} />
                  <StatusBadge status={result.status} />
                  <PriorityBadge priority={result.priority} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--surface3)', padding: '4px 10px', borderRadius: 'var(--r-sm)', fontWeight: 700, color: 'var(--primary)', border: '1px solid var(--border)', flexShrink: 0 }}>
                  {result.id}
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.03em', lineHeight: 1.3 }}>{result.title}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.75 }}>{result.description}</p>

              {result.image && (
                <img src={result.image} alt="Complaint" style={{ borderRadius: 'var(--r)', maxHeight: 200, objectFit: 'cover', marginBottom: 20, border: '1px solid var(--border)', width: '100%' }} />
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 10 }}>
                {[
                  ['📍 Location', result.location],
                  ['👤 Submitted By', result.citizenName],
                  ['📅 Date', new Date(result.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })],
                  ['🏢 Department', result.assignedDepartment || 'Pending assignment'],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--surface2)', padding: '11px 13px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis card */}
            {result.aiSummary && (
              <div style={{
                background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
                border: '1px solid #bfdbfe', borderRadius: 'var(--r-lg)',
                padding: '20px 22px', marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)', letterSpacing: '-0.01em' }}>AI Analysis</span>
                  <AIBadge />
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--primary)', margin: '0 0 14px', lineHeight: 1.7 }}>{result.aiSummary}</p>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 12, color: 'var(--primary)', marginBottom: 5, fontWeight: 600 }}>Priority Score</div>
                    <PriorityBar score={result.priorityScore || 0} />
                  </div>
                  {result.actionBrief?.estimatedSLA && (
                    <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                      ⏱ SLA: {result.actionBrief.estimatedSLA}
                    </div>
                  )}
                </div>

                {/* Priority reasons */}
                {result.priorityReasons?.length > 0 && (
                  <details style={{ marginTop: 12 }}>
                    <summary style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', userSelect: 'none' }}>
                      View score breakdown ▾
                    </summary>
                    <ul style={{ paddingLeft: 16, marginTop: 8 }}>
                      {result.priorityReasons.map((r, i) => (
                        <li key={i} style={{ fontSize: 12, color: 'var(--primary)', lineHeight: 1.8 }}>{r}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, letterSpacing: '-0.02em' }}>Status Timeline</div>
              {result.statusHistory?.length > 0 ? (
                <Timeline history={result.statusHistory} />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No status updates yet.</div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => { setResult(null); setSearchId(''); setSearched(false); setNotFound(false); navigate('/track'); }}>
                Search Another
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                Submit Another <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* How to track guide */}
        {!searched && (
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'center', padding: '36px 28px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
                <Search size={26} strokeWidth={1.8} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, letterSpacing: '-0.02em' }}>How to Track</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 24 }}>
                When you submit a complaint, you receive a unique complaint ID like <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>CA-M2KXYZ-ABC</strong>. Enter it above to check the current status, view AI analysis, and see the department assigned to resolve your issue.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                Submit a Complaint <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
