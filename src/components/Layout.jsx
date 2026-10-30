import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, LayoutDashboard, Settings, Map, Search, Home, Shield, Sun, Moon } from 'lucide-react';
import { useApp } from '../App';

const navLinks = [
  { to: '/',          label: 'Home',           icon: Home,          end: true },
  { to: '/dashboard', label: 'My Dashboard',   icon: LayoutDashboard },
  { to: '/admin',     label: 'Admin',          icon: Shield },
  { to: '/manage',    label: 'Complaints',     icon: Settings },
  { to: '/map',       label: 'Map',            icon: Map },
  { to: '/track',     label: 'Track',          icon: Search },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDark } = useApp();

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Detect scroll for navbar shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 200,
        transition: 'box-shadow 0.2s',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 8 }}>

          {/* Brand */}
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0, marginRight: 8 }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(135deg, #1a56db 0%, #06b6d4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(26,86,219,0.35)',
              flexShrink: 0,
            }}>
              <MapPin size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                CivicAction AI
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-light)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                From Complaints to Action
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {navLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  letterSpacing: '-0.01em',
                })}
                onMouseEnter={e => {
                  if (!e.currentTarget.style.background.includes('primary-light')) {
                    e.currentTarget.style.background = 'var(--surface3)';
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
                onMouseLeave={e => {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                  e.currentTarget.style.background = isActive ? 'var(--primary-light)' : 'transparent';
                  e.currentTarget.style.color = isActive ? 'var(--primary)' : 'var(--text-muted)';
                }}
              >
                <Icon size={14} strokeWidth={2.2} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            {/* Dark mode toggle */}
            <button
              className="btn-icon"
              onClick={toggleDark}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ borderRadius: 8 }}
            >
              {darkMode
                ? <Sun size={16} strokeWidth={2} color="#fbbf24" />
                : <Moon size={16} strokeWidth={2} />
              }
            </button>

            {/* CTA button – desktop only */}
            <button
              className="btn btn-primary btn-sm nav-cta"
              onClick={() => navigate('/dashboard')}
              style={{ borderRadius: 8 }}
            >
              <MapPin size={13} /> Report Issue
            </button>

            {/* Hamburger */}
            <button
              className="btn-icon nav-hamburger"
              onClick={() => setMenuOpen(v => !v)}
              style={{ borderRadius: 8 }}
            >
              {menuOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            background: 'var(--surface)', borderTop: '1px solid var(--border)',
            padding: '8px 16px 16px', animation: 'fadeSlideIn 0.15s ease',
          }}>
            {navLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, marginBottom: 2,
                  color: isActive ? 'var(--primary)' : 'var(--text)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <Icon size={17} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
            <button
              className="btn btn-primary w-full"
              onClick={() => navigate('/dashboard')}
              style={{ marginTop: 8, borderRadius: 10, justifyContent: 'center' }}
            >
              <MapPin size={15} /> Report a Problem
            </button>
          </div>
        )}
      </nav>

      {/* ── Page content ───────────────────────────────────────── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        background: darkMode ? '#0a1628' : '#0f172a',
        color: '#94a3b8', padding: '48px 0 32px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 36, marginBottom: 32 }}>
            {/* Brand block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1a56db, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={15} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{ fontWeight: 800, color: '#e2e8f0', fontSize: 15, letterSpacing: '-0.02em' }}>CivicAction AI</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>
                Empowering citizens through intelligent complaint management and transparent governance.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: '#4ade80' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                Rule-Based AI · No API Keys
              </div>
            </div>

            {/* Platform links */}
            <div>
              <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 14, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Platform</div>
              {[['/', 'Home'], ['/dashboard', 'Dashboard'], ['/track', 'Track Complaint'], ['/map', 'Map View']].map(([href, label]) => (
                <div key={href} style={{ marginBottom: 8 }}>
                  <NavLink to={href} style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                    onMouseLeave={e => e.target.style.color = '#94a3b8'}
                  >{label}</NavLink>
                </div>
              ))}
            </div>

            {/* Admin links */}
            <div>
              <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 14, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin</div>
              {[['/admin', 'Admin Dashboard'], ['/manage', 'Manage Complaints']].map(([href, label]) => (
                <div key={href} style={{ marginBottom: 8 }}>
                  <NavLink to={href} style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                    onMouseLeave={e => e.target.style.color = '#94a3b8'}
                  >{label}</NavLink>
                </div>
              ))}
            </div>

            {/* Tech notice */}
            <div>
              <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 14, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Engine</div>
              <p style={{ fontSize: 12, lineHeight: 1.7, color: '#64748b' }}>
                This platform uses a <strong style={{ color: '#94a3b8' }}>rule-based AI engine</strong> built in JavaScript. No external models, no API keys, no cloud dependencies.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12 }}>© {new Date().getFullYear()} CivicAction AI. All rights reserved.</span>
            <span style={{ fontSize: 12 }}>For demonstration purposes only. No real personal data used.</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
        }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-cta { display: none !important; }
        }
      `}</style>
    </div>
  );
}
