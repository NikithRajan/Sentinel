import React, { useState, useEffect } from 'react';
import { generateMockIntrusions } from './utils/mockData';

import RiskMap from './features/dashboard/RiskMap';
import AlertSidebar from './features/dashboard/AlertSidebar';
import AnalyticsDashboard from './features/dashboard/AnalyticsDashboard';

import './styles/App.css';

const App = () => {
  const [allData, setAllData] = useState([]);
  const [mapFilter, setMapFilter] = useState('all');

  useEffect(() => {
    // Generate mock data on load
    setAllData(generateMockIntrusions(600));
  }, []);

  return (
    <div className="dashboard-layout">
      
      {/* LEFT SIDEBAR */}
      <AlertSidebar intrusions={allData} />

      {/* MAIN CONTENT */}
      <main className="main-scroll-area">

        {/* HEADER */}
        <header style={{ marginBottom: '40px' }}>
          <h1 className="title-3d">Risk Visualization Heatmap</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '800px' }}>
            A comprehensive analytical view driven by log entries of intrusions detected earlier by Edge AI nodes.
            Visualizing spatial intensity, temporal patterns, and object classifications.
          </p>
        </header>

        {/* ✅ ANALYTICS DASHBOARD (All Charts Now Here) */}
        <AnalyticsDashboard intrusions={allData} />

        {/* ✅ HEATMAP SECTION */}
        <section className="map-container-elegant" style={{ marginTop: '40px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>Live Heatmap Analysis</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Spatial risk density across monitoring zones
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Duration:
              </span>

              <select
                className="elegant-select"
                onChange={(e) => setMapFilter(e.target.value)}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 1 Week</option>
                <option value="30d">Last 1 Month</option>
                <option value="all">Last 1 Year</option>
              </select>
            </div>
          </div>

          <RiskMap intrusions={allData} filter={mapFilter} />
        </section>

      </main>
    </div>
  );
};

export default App;
