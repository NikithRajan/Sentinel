import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { getQuartileColor, calculateProbability } from "../../utils/riskLogic";
import 'leaflet/dist/leaflet.css';

const RiskMap = ({ intrusions = [] }) => {
  const kochiPosition = [9.966, 76.244];
  const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;
  const now = new Date();

  // 1. Process Data Logic
  const processedData = useMemo(() => {
    const activeData = intrusions.filter(i => (now - new Date(i.timestamp)) <= TEN_YEARS_MS);
    const outdatedData = intrusions.filter(i => (now - new Date(i.timestamp)) > TEN_YEARS_MS);

    // Group active data by Zone ID for ranking
    const zoneStats = {};
    activeData.forEach(i => {
      if (!zoneStats[i.cameraID]) {
        zoneStats[i.cameraID] = { 
            id: i.cameraID, 
            name: i.placeName, 
            count: 0, 
            types: new Set(), 
            coords: i.location 
        };
      }
      zoneStats[i.cameraID].count += 1;
      zoneStats[i.cameraID].types.add(i.objectType);
    });

    // Sort zones by count (descending) to determine rank
    const sortedZones = Object.values(zoneStats).sort((a, b) => b.count - a.count);

    return { activeData, outdatedData, sortedZones, totalActive: activeData.length };
  }, [intrusions]);

  return (
    <div className="map-wrapper" style={{ height: '550px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <MapContainer center={kochiPosition} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* --- LAYER 1: OUTDATED DATA (BLUE) --- */}
        {processedData.outdatedData.map(item => (
          <CircleMarker 
            key={item.id} 
            center={[item.location.lat, item.location.lng]} 
            radius={4} 
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.4, stroke: false }}
          >
            <Tooltip><b>Outdated Entry</b><br/>Legacy data (>10 years old)</Tooltip>
          </CircleMarker>
        ))}

        {/* --- LAYER 2: ACTIVE ZONES (QUARTILE COLORED) --- */}
        {processedData.sortedZones.map((zone, index) => {
          const color = getQuartileColor(index, processedData.sortedZones.length);
          const prob = calculateProbability(zone.count, processedData.totalActive);

          return (
            <CircleMarker 
              key={zone.id} 
              center={[zone.coords.lat, zone.coords.lng]} 
              radius={18} 
              pathOptions={{ fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.8 }}
            >
              <Tooltip sticky>
                <div style={{ padding: '8px', minWidth: '180px', color: '#333' }}>
                  <strong style={{ fontSize: '1.1rem', color: color }}>{zone.name}</strong>
                  <div style={{ margin: '5px 0', fontSize: '0.85rem' }}>
                    <b>Zone ID:</b> {zone.id}<br/>
                    <b>10-Year Frequency:</b> {zone.count}<br/>
                    <b>Object Types:</b> {[...zone.types].join(', ')}<br/>
                    <hr style={{ opacity: 0.2 }}/>
                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                        <small>Intrusion Probability</small><br/>
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