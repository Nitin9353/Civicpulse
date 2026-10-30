import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintManagement from './pages/ComplaintManagement';
import MapView from './pages/MapView';
import TrackComplaint from './pages/TrackComplaint';
import { getComplaints, saveComplaints } from './utils/storage';
import { generateSampleComplaints } from './utils/sampleData';

export const AppContext = createContext(null);
export function useApp() { return useContext(AppContext); }

function App() {
  const [complaints, setComplaints] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('ca_theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    let stored = getComplaints();
    if (!stored || stored.length === 0) {
      const samples = generateSampleComplaints();
      saveComplaints(samples);
      stored = samples;
    }
    setComplaints(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    try { localStorage.setItem('ca_theme', darkMode ? 'dark' : 'light'); } catch {}
  }, [darkMode]);

  const refreshComplaints = () => setComplaints(getComplaints());
  const toggleDark = () => setDarkMode(v => !v);

  return (
    <AppContext.Provider value={{ complaints, setComplaints, refreshComplaints, darkMode, toggleDark }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="manage" element={<ComplaintManagement />} />
            <Route path="map" element={<MapView />} />
            <Route path="track" element={<TrackComplaint />} />
            <Route path="track/:id" element={<TrackComplaint />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
