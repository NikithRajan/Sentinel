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
    if (!item.cameraID) return;

    zoneCounts[item.cameraID] =
      (zoneCounts[item.cameraID] || 0) + 1;
  });

  // ✅ Convert → Sort → Take Top 10
  return Object.entries(zoneCounts)
    .map(([zone, count]) => ({
      zone,            // ZONE-01, ZONE-02 etc
      count,
      label: zone      // Future-proof if you want custom labels later
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
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