import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapPin, X } from 'lucide-react';
import { useApp } from '../App';
import { CategoryBadge, StatusBadge, PriorityBadge, CATEGORY_LABELS, CATEGORIES } from '../components/shared';

const CATEGORY_COLORS = {
  road: '#6366f1', water: '#0ea5e9', garbage: '#10b981',
  electricity: '#f59e0b', drainage: '#8b5cf6', streetlight: '#ec4899', other: '#94a3b8',
};

function LeafletMap({ complaints, onSelect }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const markersRef = useRef([]);
  const LRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let destroyed = false;
    async function init() {
      const L = (await import('leaflet')).default;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      if (destroyed || !mapRef.current || instanceRef.current) return;
      LRef.current = L;
      const map = L.map(mapRef.current, { center: [28.64, 77.18], zoom: 11 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      instanceRef.current = map;
      if (!destroyed) setReady(true);
    }
    init();
    return () => {
      destroyed = true;
      if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    const map = instanceRef.current;
    const L = LRef.current;
    if (!map || !L || !ready) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    complaints.forEach(c => {
      if (!c.lat || !c.lng) return;
      const color = CATEGORY_COLORS[c.category] || '#94a3b8';
      const sz = c.priority === 'critical' ? 18 : c.priority === 'high' ? 14 : 11;
      const icon = L.divIcon({
        html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,0.35)"></div>`,
        className: '',
        iconSize: [sz, sz],
        iconAnchor: [sz / 2, sz / 2],
      });
      const marker = L.marker([c.lat, c.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:200px;font-family:system-ui,sans-serif">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px">${c.title.length > 55 ? c.title.substring(0, 55) + '...' : c.title}</div>
            <div style="font-size:11px;color:#64748b;margin-bottom:3px">📍 ${c.location}</div>
            <div style="font-size:11px"><b>Category:</b> ${CATEGORY_LABELS[c.category] || c.category}</div>
            <div style="font-size:11px"><b>Status:</b> ${c.status.replace('_', ' ')}</div>
            <div style="font-size:11px"><b>Priority:</b> ${c.priority}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:5px">${c.id}</div>
          </div>
        `);
      marker.on('click', () => onSelect(c));
      markersRef.current.push(marker);
    });
  }, [complaints, onSelect, ready]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: 12 }} />;
}

export default function MapView() {
  const { complaints } = useApp();
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [selectedC,      setSelectedC]      = useState(null);

  const mappedComplaints = useMemo(() => {
    const BASE_LAT = 28.61;
    const BASE_LNG = 77.18;
    // Use seeded pseudo-random for stable coords
    return complaints.map((c, i) => ({
      ...c,
      lat: c.lat || BASE_LAT + ((i * 7 + 3) % 30 - 15) * 0.01,
      lng: c.lng || BASE_LNG + ((i * 11 + 5) % 30 - 15) * 0.015,
    }));
  }, [complaints]);

  const filtered = useMemo(() => {
    let list = mappedComplaints;
    if (filterCategory) list = list.filter(c => c.category === filterCategory);
    if (filterStatus) list = list.filter(c => c.status === filterStatus);
    return list;
  }, [mappedComplaints, filterCategory, filterStatus]);

  const hotspots = useMemo(() => {
    const grid = {};
    filtered.forEach(c => {
      const key = `${(c.lat * 40 | 0)},${(c.lng * 40 | 0)}`;
      if (!grid[key]) grid[key] = { complaints: [], lat: c.lat, lng: c.lng };
      grid[key].complaints.push(c);
    });
    return Object.values(grid).filter(g => g.complaints.length >= 2).sort((a, b) => b.complaints.length - a.complaints.length);
  }, [filtered]);

  const handleSelect = useCallback((c) => setSelectedC(c), []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container page-wrap">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Map & Hotspots</h1>
            <p className="page-subtitle">Visualize complaint locations and identify problem areas</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="form-control" style={{ width: 148 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
            <select className="form-control" style={{ width: 138 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {['pending', 'in_progress', 'resolved', 'rejected'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            {(filterCategory || filterStatus) && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setFilterCategory(''); setFilterStatus(''); }}>
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="card" style={{ marginBottom: 16, padding: '12px 18px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--text-muted)' }}>LEGEND:</span>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: `0 0 0 1px ${color}` }} />
                <span style={{ color: 'var(--text-muted)' }}>{CATEGORY_LABELS[cat]?.replace(/\S+\s/, '')}</span>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-light)' }}>
              Larger dots = higher priority · <strong style={{ color: 'var(--primary)' }}>{filtered.length}</strong> shown
            </div>
          </div>
        </div>

        {/* Map + Sidebar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 20, alignItems: 'start' }}>
          {/* Map */}
          <div style={{ height: 540, borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <LeafletMap complaints={filtered} onSelect={handleSelect} />
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {selectedC && (
              <div className="card fade-in" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.01em' }}>Selected Complaint</span>
                  <button className="btn-icon" style={{ border: 'none', padding: 4 }} onClick={() => setSelectedC(null)}><X size={13} /></button>
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                  <CategoryBadge category={selectedC.category} />
                  <StatusBadge status={selectedC.status} />
                  <PriorityBadge priority={selectedC.priority} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4, lineHeight: 1.4 }}>{selectedC.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>📍 {selectedC.location}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-light)' }}>
                  {new Date(selectedC.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </div>
              </div>
            )}

            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, letterSpacing: '-0.01em' }}>🔥 Hotspot Areas</div>
              {hotspots.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No hotspot clusters detected</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {hotspots.slice(0, 6).map((hs, i) => (
                    <div key={i} style={{
                      padding: '10px 12px', background: 'var(--surface2)',
                      borderRadius: 'var(--r-sm)',
                      border: `1px solid ${hs.complaints.length >= 4 ? '#fca5a5' : 'var(--border)'}`,
                      borderLeft: `3px solid ${hs.complaints.length >= 4 ? 'var(--danger)' : 'var(--warning)'}`,
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                        {hs.complaints.length} complaints nearby
                        {hs.complaints.length >= 4 && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-light)', padding: '1px 6px', borderRadius: 99 }}>HOT</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {[...new Set(hs.complaints.map(c => c.category))].map(cat => (
                          <CategoryBadge key={cat} category={cat} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, letterSpacing: '-0.01em' }}>Map Summary</div>
              {[
                ['Shown',         filtered.length],
                ['Hotspot Areas', hotspots.length],
                ['Pending',       filtered.filter(c => c.status === 'pending').length],
                ['Critical',      filtered.filter(c => c.priority === 'critical').length],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13.5 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile responsive */}
        <style>{`
          @media (max-width: 768px) {
            .map-outer-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

      </div>
    </div>
  );
}
