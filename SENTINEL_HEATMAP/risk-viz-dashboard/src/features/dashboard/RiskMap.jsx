import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
  CircleMarker,
  Tooltip,
  Circle
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';

/* ---------------- Heatmap Layer ---------------- */

function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    const heatData = points.map(p => [
      p.location.lat,
      p.location.lng,
      p.riskScore * 0.5
    ]);

    const heatLayer = L.heatLayer(heatData, {
      radius: 30,
      blur: 15,
      maxZoom: 10,
      gradient: {
        0.4: 'blue',
        0.6: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

/* ---------------- Main Map ---------------- */

const RiskMap = ({ intrusions = [] }) => {
  const indiaCenter = [20.5937, 78.9629];

  return (
    <div
      style={{
        height: '550px',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      <MapContainer
        center={indiaCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Layer 1: Heatmap */}
        <HeatmapLayer points={intrusions} />

        {/* Layer 2: Interaction + Risk Circles */}
        {intrusions.map(item => (
          <React.Fragment key={item.id}>
            {/* Invisible hover marker */}
            <CircleMarker
              center={[item.location.lat, item.location.lng]}
              radius={8}
              pathOptions={{
                fillColor: 'transparent',
                color: 'transparent',
                stroke: false
              }}
            >
              <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                <div style={{ padding: '6px', minWidth: '140px' }}>
                  <strong
                    style={{
                      color:
                        item.objectType === 'drone' ? 'red' : '#333'
                    }}
                  >
                    ⚠️ {item.objectType.toUpperCase()}
                  </strong>
                  <hr style={{ margin: '6px 0', opacity: 0.2 }} />
                  <div style={{ fontSize: '0.85rem' }}>
                    <b>Confidence:</b>{' '}
                    {(item.confidenceScore * 100).toFixed(1)}%
                    <br />
                    <b>Risk Score:</b> {item.riskScore.toFixed(2)}
                    <br />
                    <b>Zone:</b> {item.cameraID}
                    <br />
                    <b>Time:</b>{' '}
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>

            {/* Risk Radius Circle */}
            <Circle
              center={[item.location.lat, item.location.lng]}
              radius={20000} // 20 km
              pathOptions={{
                color: item.riskScore > 2 ? 'red' : 'orange',
                fillOpacity: 0.05,
                dashArray: '5, 10'
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default RiskMap;
