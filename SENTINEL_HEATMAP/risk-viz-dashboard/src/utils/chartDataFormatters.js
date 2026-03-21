export const formatPieData = (intrusions) => {
  const counts = {};
  intrusions.forEach(item => {
    counts[item.objectType] = (counts[item.objectType] || 0) + 1;
  });
  return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
};

export const formatBarData = (intrusions) => {
  const zoneCounts = {};
  intrusions.forEach(item => {
    zoneCounts[item.cameraID] = (zoneCounts[item.cameraID] || 0) + 1;
  });
  // Sort by frequency and take top 5
  return Object.keys(zoneCounts)
    .map(key => ({ zone: key, count: zoneCounts[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

export const formatLineData = (intrusions) => {
    // This groups intrusions by hour for the line chart
    const hourlyData = {};
    intrusions.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      const label = `${hour}:00`;
      hourlyData[label] = (hourlyData[label] || 0) + 1;
    });
    return Object.keys(hourlyData).map(key => ({ time: key, intrusions: hourlyData[key] }));
};