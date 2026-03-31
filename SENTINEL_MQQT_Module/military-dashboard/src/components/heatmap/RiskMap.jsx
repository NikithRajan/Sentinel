import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { getQuartileColor, calculateProbability } from "../../libs/heatmap-utils";
import 'leaflet/dist/leaflet.css';

const RiskMap = ({ intrusions = [] }) => {
  const kochiPosition = [9.966, 76.244];
  const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // 1. Process Data Logic
  const processedData = useMemo(() => {
    // Treat everything as active for this dashboard unless explicitly old timestamp
    const activeData = intrusions.filter(i => {
      let ts = i.timestamp || i.received_at;
      let d = ts?.toDate ? ts.toDate() : new Date(ts);
      return (now - d.getTime()) <= TEN_YEARS_MS;
    });

    // Group active data by Location / pseudo-CameraID
    const zoneStats = {};
    activeData.forEach(i => {
      const camId = i.id ? `CAM-${i.id.substring(0, 4).toUpperCase()}` : "ZONE-UNKN";
      if (!zoneStats[camId]) {
        zoneStats[camId] = { 
            id: camId, 
            name: i.placeName || "Sensor Zone", 
            count: 0, 
            types: new Set(), 
            coords: i.location || { lat: 9.966 + (Math.random() - 0.5) * 0.05, lng: 76.244 + (Math.random() - 0.5) * 0.05 } 
        };
      }
      zoneStats[camId].count += 1;
      zoneStats[camId].types.add(i.intrusion_type || i.objectType || "unknown");
    });

    const sortedZones = Object.values(zoneStats).sort((a, b) => b.count - a.count);

    return { activeData, sortedZones, totalActive: activeData.length };
  }, [intrusions]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border bg-card">
      <MapContainer center={kochiPosition} zoom={13} style={{ height: '100%', width: '100%', background: '#090a0f' }}>
        {/* Dark Mode Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* --- LAYER 2: ACTIVE ZONES (QUARTILE COLORED) --- */}
        {processedData.sortedZones.map((zone, index) => {
          const color = getQuartileColor(index, processedData.sortedZones.length);
          const prob = calculateProbability(zone.count, processedData.totalActive);

          return (
            <CircleMarker 
              key={zone.id} 
              center={[zone.coords.lat, zone.coords.lng]} 
              radius={18} 
              pathOptions={{ fillColor: color, color: '#000', weight: 2, fillOpacity: 0.6 }}
            >
              <Tooltip sticky>
                <div style={{ padding: '8px', minWidth: '180px', color: '#111', background: '#fff', borderRadius: '4px' }}>
                  <strong style={{ fontSize: '1.1rem', color: color }}>{zone.name}</strong>
                  <div style={{ margin: '5px 0', fontSize: '0.85rem' }}>
                    <b>Sector ID:</b> {zone.id}<br/>
                    <b>Recent Scans:</b> {zone.count}<br/>
                    <b>Signatures:</b> {[...zone.types].join(', ')}<br/>
                    <hr style={{ opacity: 0.2, margin: '8px 0' }}/>
                    <div style={{ textAlign: 'center' }}>
                        <small>Threat Density / Probability</small><br/>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{prob}%</span>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default RiskMap;
