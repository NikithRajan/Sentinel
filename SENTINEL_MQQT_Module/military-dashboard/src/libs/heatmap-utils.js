const OBJECT_WEIGHTS = {
    person: 1.0, 
    vehicle: 1.5, 
    drone: 2.5 
};

export const calculateRiskScore = (confidence, type) => {
    const weight = OBJECT_WEIGHTS[type] || 1.0;
    return parseFloat((confidence * weight).toFixed(2));
};

export const getQuartileColor = (rank, totalZones) => {
    const threshold = totalZones / 4;
    if (rank <= threshold) return '#ef4444';        // Top 25%: Red
    if (rank <= threshold * 2) return '#f97316';   // 25-50%: Orange
    if (rank <= threshold * 3) return '#eab308';   // 50-75%: Yellow
    return '#22c55e';                             // Bottom 25%: Green
};

export const calculateProbability = (zoneCount, totalCount) => {
    if (totalCount === 0) return "0.00";
    return ((zoneCount / totalCount) * 100).toFixed(2);
};

export const formatPieData = (intrusions) => {
  const counts = {};
  intrusions.forEach(item => {
    const type = item.intrusion_type || item.objectType || "unknown";
    counts[type] = (counts[type] || 0) + 1;
  });
  return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
};

export const formatBarData = (intrusions) => {
  const zoneCounts = {};

  intrusions.forEach(item => {
    // Generate a pseudo camera ID if missing based on location logic or ID hash
    const camId = item.id ? `CAM-${item.id.substring(0, 4).toUpperCase()}` : "ZONE-UNKN";
    zoneCounts[camId] = (zoneCounts[camId] || 0) + 1;
  });

  return Object.entries(zoneCounts)
    .map(([zone, count]) => ({
      zone,            
      count,
      label: zone      
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const formatLineData = (intrusions) => {
    const hourlyData = {};
    intrusions.forEach(item => {
      let dateObj;
      if (item.received_at?.toDate) {
         dateObj = item.received_at.toDate();
      } else if (item.received_at) {
         dateObj = new Date(item.received_at);
      } else {
         dateObj = new Date(item.timestamp || Date.now());
      }
      
      const hour = dateObj.getHours();
      const label = `${hour}:00`;
      hourlyData[label] = (hourlyData[label] || 0) + 1;
    });
    return Object.keys(hourlyData).map(key => ({ time: key, intrusions: hourlyData[key] }));
};
