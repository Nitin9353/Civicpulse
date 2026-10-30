import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Shield, Zap, BarChart2, Search, ArrowRight, CheckCircle, Clock, AlertTriangle, FileText, Users, TrendingUp } from 'lucide-react';
import { useApp } from '../App';
import { getStats } from '../utils/storage';

const features = [
  { icon: Zap,        color: '#d97706', bg: '#fef3c7', title: 'AI-Powered Processing',    desc: 'Rule-based engine auto-categorizes complaints, scores priorities, and generates action briefs with full explainability.' },
  { icon: MapPin,     color: '#dc2626', bg: '#fee2e2', title: 'Map & Hotspot Detection',   desc: 'Visualize complaint clusters on OpenStreetMap and identify infrastructure hotspots before they become crises.' },
  { icon: BarChart2,  color: '#1a56db', bg: '#dbeafe', title: 'Real-time Analytics',       desc: 'Track complaint trends with live dashboards. Monitor resolution rates, SLA compliance, and category breakdowns.' },
  { icon: Search,     color: '#059669', bg: '#d1fae5', title: 'Live Complaint Tracking',   desc: 'Citizens track their complaint status in real-time with a unique ID — from submission through resolution.' },
  { icon: Shield,     color: '#7c3aed', bg: '#ede9fe', title: 'Admin Control Center',      desc: 'Full lifecycle management: assign departments, update priorities, document resolutions, and track SLAs.' },
  { icon: CheckCircle,color: '#0369a1', bg: '#e0f2fe', title: 'Explainable Decisions',     desc: 'Every priority score includes a step-by-step breakdown — administrators always know why a complaint is critical.' },
];

const steps = [
  { icon: FileText,   num: '01', title: 'Submit',         desc: 'Citizen describes the issue with location, category, and optional photo.',                    color: '#1a56db' },
  { icon: Zap,        num: '02', title: 'AI Analysis',    desc: 'Engine auto-categorizes, scores priority, detects duplicates, and generates action brief.',   color: '#7c3aed' },
  { icon: Users,      num: '03', title: 'Dept. Assigned', desc: 'Admin reviews AI recommendations and assigns to the appropriate department with SLA.',        color: '#059669' },
  { icon: CheckCircle,num: '04', title: 'Resolved',       desc: 'Department acts. Citizen gets real-time updates via complaint ID.',                           color: '#d97706' },
];

export default function Home() {
  const { complaints } = useApp();
  const stats = getStats(complaints);
  const navigate = useNavigate();

  const statItems = [
    { label: 'Total Complaints', value: stats.total,      icon: <FileText size={18} />,      color: '#1a56db' },
    { label: 'In Progress',      value: stats.in_progress,icon: <Clock size={18} />,          color: '#2563eb' },
    { label: 'Resolved',         value: stats.resolved,   icon: <CheckCircle size={18} />,    color: '#059669' },
    { label: 'Critical',         value: stats.critical,   icon: <AlertTriangle size={18} />,  color: '#dc2626' },
  ];

  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(140deg, #060e1f 0%, #0c1e45 40%, #132b6b 70%, #1a56db 100%)',
        color: '#fff',
        padding: 'clamp(72px, 10vw, 110px) 0 clamp(80px, 10vw, 120px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Orb animations */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', width: 600, height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,86,219,0.35) 0%, transparent 70%)',
            top: '-200px', right: '-100px',
            animation: 'heroOrb 8s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 400, height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
            bottom: '-100px', left: '-80px',
            animation: 'heroOrb 10s ease-in-out infinite reverse',
          }} />
          {/* Grid dots */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.06,
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 99, padding: '6px 18px',
            fontSize: 12, fontWeight: 600,
            marginBottom: 28, backdropFilter: 'blur(8px)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }} />
            Powered by Rule-Based AI · No API Keys Required
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(38px, 6.5vw, 70px)',
            fontWeight: 900, lineHeight: 1.05,
            letterSpacing: '-0.03em', marginBottom: 22,
          }}>
            From Complaints<br />
            <span className="gradient-text">to Action</span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'rgba(255,255,255,0.72)',
            maxWidth: 560, margin: '0 auto 40px',
            lineHeight: 1.75, fontWeight: 400,
          }}>
            CivicAction AI transforms citizen complaints into structured, prioritized work orders — bridging the gap between public problems and government action.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', color: '#1a56db',
                padding: '14px 30px', borderRadius: 12,
                fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)'; }}
            >
              <MapPin size={17} /> Report a Problem
            </button>
            <button
              onClick={() => navigate('/track')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '14px 30px', borderRadius: 12,
                fontWeight: 700, fontSize: 15,
                border: '1.5px solid rgba(255,255,255,0.3)',
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            >
              <Search size={17} /> Track My Complaint
            </button>
          </div>

          {/* Hero stats bar */}
          <div style={{
            display: 'inline-flex', gap: 0, marginTop: 64,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16, backdropFilter: 'blur(12px)',
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {statItems.map((s, i) => (
              <div key={i} style={{
                padding: '18px 32px',
                borderRight: i < statItems.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                textAlign: 'center', minWidth: 110,
              }}>
                <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live stats strip ──────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '28px 0' }}>
        <div className="container">
          <div className="grid grid-4">
            {[
              { icon: <AlertTriangle size={20} />, label: 'Pending Review',  value: stats.pending,     color: '#d97706', bg: '#fef3c7' },
              { icon: <Clock size={20} />,         label: 'Being Resolved',  value: stats.in_progress, color: '#2563eb', bg: '#dbeafe' },
              { icon: <CheckCircle size={20} />,   label: 'Resolved',        value: stats.resolved,    color: '#059669', bg: '#d1fae5' },
              { icon: <Zap size={20} />,           label: 'Critical Priority',value: stats.critical,   color: '#dc2626', bg: '#fee2e2' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px', background: 'var(--surface2)',
                borderRadius: 'var(--r-lg)', border: '1px solid var(--border)',
                transition: 'all 0.18s',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ──────────────────────────────────────────── */}
      <div className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="section-label">Platform Features</div>
            <h2 className="section-title" style={{ marginTop: 6 }}>Everything You Need</h2>
            <p className="section-subtitle" style={{ maxWidth: 500, margin: '10px auto 0' }}>
              A complete civic tech stack — from complaint submission to resolution tracking, powered by intelligent automation.
            </p>
          </div>
          <div className="grid grid-3">
            {features.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="card card-hover" style={{ padding: '26px 22px' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 16, color, flexShrink: 0,
                }}>
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ──────────────────────────────────────── */}
      <div className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="section-label">Workflow</div>
            <h2 className="section-title" style={{ marginTop: 6 }}>How CivicAction AI Works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 36, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(to right, #1a56db, #7c3aed, #059669, #d97706)', opacity: 0.25, zIndex: 0 }} />

            {steps.map(({ icon: Icon, num, title, desc, color }, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 12px' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                  border: `2px solid ${color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px',
                  color,
                }}>
                  <Icon size={28} strokeWidth={1.8} />
                </div>
                <div style={{
                  display: 'inline-block', fontSize: 10, fontWeight: 800,
                  color, background: `${color}15`, borderRadius: 99,
                  padding: '2px 10px', marginBottom: 8, letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>Step {num}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Notice ─────────────────────────────────────────── */}
      <div className="section" style={{ background: 'var(--bg)', paddingTop: 40, paddingBottom: 40 }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
            border: '1px solid #c7d2fe',
            borderRadius: 'var(--r-2xl)', padding: '28px 32px',
            display: 'flex', gap: 20, alignItems: 'flex-start',
          }}>
            <div style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--primary)', letterSpacing: '-0.02em' }}>About the AI Engine</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>
                CivicAction AI uses a <strong style={{ color: 'var(--primary)' }}>rule-based AI engine</strong> built entirely in JavaScript — no external AI model, no API keys, no cloud services needed. The engine performs <strong style={{ color: 'var(--text)' }}>automatic complaint categorization</strong> using keyword matching, <strong style={{ color: 'var(--text)' }}>priority scoring</strong> using weighted urgency and impact rules, <strong style={{ color: 'var(--text)' }}>duplicate detection</strong> using Jaccard text similarity, and <strong style={{ color: 'var(--text)' }}>action brief generation</strong> using category-specific response templates. Every decision is fully explainable and auditable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(140deg, #060e1f 0%, #0c1e45 40%, #1a56db 100%)',
        padding: 'clamp(56px, 8vw, 80px) 0',
        textAlign: 'center', color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 600, marginBottom: 20 }}>
            <TrendingUp size={13} /> {stats.total} complaints processed
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.03em' }}>Ready to report an issue?</h2>
          <p style={{ color: 'rgba(255,255,255,0.68)', marginBottom: 36, fontSize: 16, maxWidth: 480, margin: '0 auto 36px' }}>
            Submit your complaint in under 2 minutes. Our AI will analyze and prioritize it instantly.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', color: '#1a56db',
                padding: '14px 30px', borderRadius: 12,
                fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              Submit a Complaint <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/admin')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.1)', color: '#fff',
                padding: '14px 30px', borderRadius: 12,
                fontWeight: 700, fontSize: 15,
                border: '1.5px solid rgba(255,255,255,0.3)',
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            >
              View Admin Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Responsive: how-it-works on mobile */}
      <style>{`
        @media (max-width: 640px) {
          .hiw-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 400px) {
          .hiw-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
