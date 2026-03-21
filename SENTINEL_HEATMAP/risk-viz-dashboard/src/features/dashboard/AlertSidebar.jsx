import React from 'react';

const AlertSidebar = ({ intrusions }) => {
  return (
    <aside className="alert-sidebar">
      <h2 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '5px' }}>
        ⚠️ Live Threats
      </h2>

      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>
        Real-time intrusion stream
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {intrusions.length === 0 ? (
          <p style={{ color: '#475569' }}>Waiting for data...</p>
        ) : (
          intrusions.slice(0, 20).map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: '15px',
                borderRadius: '12px',
                background:
                  alert.riskScore > 2
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(30, 41, 59, 0.5)',
                borderLeft: `4px solid ${
                  alert.riskScore > 2 ? '#ef4444' : '#3b82f6'
                }`,
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '5px'
                }}
              >
                <b style={{ color: alert.riskScore > 2 ? '#fb7185' : '#38bdf8' }}>
                  {alert.objectType.toUpperCase()}
                </b>

                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem' }}>{alert.placeName}</div>

              <div
                style={{
                  fontSize: '0.75rem',
                  marginTop: '5px',
                  opacity: 0.6
                }}
              >
                Confidence: {(alert.confidenceScore * 100).toFixed(0)}%
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default AlertSidebar;
