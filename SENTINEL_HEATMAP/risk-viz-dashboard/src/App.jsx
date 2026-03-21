import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { generateMockIntrusions } from './utils/mockData';
import RiskMap from './features/dashboard/RiskMap';
import AlertSidebar from './features/dashboard/AlertSidebar';
import './styles/App.css';

const PIE_COLORS = ['#fb7185', '#22d3ee', '#a8a29e']; // Rose, Cyan, Brown

const App = () => {
  const [allData, setAllData] = useState([]);
  const [mapFilter, setMapFilter] = useState('all');

  useEffect(() => {
    // Generate data for initial load
    setAllData(generateMockIntrusions(600));
  }, []);

  // Filter helper for charts
  const getDataForTime = (days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return allData.filter(i => new Date(i.timestamp) > cutoff);
  };

  // 1. Process Bar Data (Top 10 Places)
  const barData = useMemo(() => {
    const counts = {};
    allData.forEach(i => counts[i.placeName] = (counts[i.placeName] || 0) + 1);
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 10);
  }, [allData]);

  // 2. Process Pie Data
  const getPieData = (days) => {
    const data = getDataForTime(days);
    const counts = { person: 0, vehicle: 0, drone: 0 };
    data.forEach(i => { if(counts[i.objectType] !== undefined) counts[i.objectType]++ });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // 3. Process Line Data (Frequency over time)
  const getLineData = (days) => {
    const data = getDataForTime(days);
    const hourlyCounts = {};
    data.forEach(i => {
      const hour = new Date(i.timestamp).getHours() + ":00";
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });
    return Object.entries(hourlyCounts).map(([time, count]) => ({ time, count }));
  };

  return (
    <div className="dashboard-layout">
      {/* 1. ALERT SIDEBAR */}
      <AlertSidebar intrusions={allData} />

      {/* 2. MAIN DATA DISPLAY */}
      <main className="main-scroll-area">
        <header style={{ marginBottom: '40px' }}>
          <h1 className="title-3d">Risk Visualization Heatmap</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '800px' }}>
            A comprehensive analytical view driven by log entries of intrusions detected earlier by Edge AI nodes. 
            Visualizing spatial intensity, temporal patterns, and object classifications.
          </p>
        </header>

        {/* --- PIE CHARTS (Simultaneous) --- */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Intrusion Type Distribution</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>Object breakdown across different timeframes</p>
        </div>
        <div className="chart-grid-3">
          {[{l: 'Last 1 Week', d: 7}, {l: 'Last 1 Month', d: 30}, {l: 'Last 1 Year', d: 365}].map((p, i) => (
            <div key={i} className="chart-container">
              <h4 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>{p.l}</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={getPieData(p.d)} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {getPieData(p.d).map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>

        {/* --- BAR CHART (Top 10) --- */}
        <div className="chart-container">
          <h3>Top 10 High-Risk Zones</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Frequency of intrusions mapped to specific geographical locations</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip cursor={{ fill: '#ffffff0a' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
              <Bar dataKey="count" fill="url(#cyanGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* --- LINE CHARTS (Simultaneous) --- */}
        <div style={{ margin: '40px 0 20px 0' }}>
          <h3>Intrusion Frequency Patterns</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>Temporal trends showing peak intrusion hours</p>
        </div>
        <div className="chart-grid-3">
          {[{l: 'Weekly Trend', d: 7}, {l: 'Monthly Trend', d: 30}, {l: 'Yearly Trend', d: 365}].map((l, i) => (
            <div key={i} className="chart-container">
              <h4 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>{l.l}</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={getLineData(l.d)}>
                  <defs>
                    <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                  <Area type="monotone" dataKey="count" stroke="#fb7185" fillOpacity={1} fill="url(#colorLine)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>

        {/* --- HEATMAP (Bottom) --- */}
        <section className="map-container-elegant">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0 }}>Live Heatmap Analysis</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Spatial risk density across monitoring zones</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Duration:</span>
              <select className="elegant-select" onChange={(e) => setMapFilter(e.target.value)}>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 1 Week</option>
                <option value="30d">Last 1 Month</option>
                <option value="all">Last 1 Year</option>
              </select>
            </div>
          </div>
          <RiskMap intrusions={allData} />
        </section>
      </main>
    </div>
  );
};

export default App;