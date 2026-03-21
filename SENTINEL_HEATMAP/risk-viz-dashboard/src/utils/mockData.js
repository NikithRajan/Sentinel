import { calculateRiskScore } from './riskLogic';

const fortKochiCameras = [
  { id: "ZONE-01", name: "Chinese Fishing Nets", lat: 9.9691, lng: 76.2429 },
  { id: "ZONE-02", name: "St. Francis Church", lat: 9.9658, lng: 76.2442 },
  { id: "ZONE-03", name: "Vasco da Gama Square", lat: 9.9688, lng: 76.2435 },
  { id: "ZONE-04", name: "Santa Cruz Basilica", lat: 9.9634, lng: 76.2448 },
  { id: "ZONE-05", name: "Fort Kochi Beach", lat: 9.9675, lng: 76.2415 },
  { id: "ZONE-06", name: "Jewish Synagogue Area", lat: 9.9582, lng: 76.2592 },
  { id: "ZONE-07", name: "Mattancherry Palace", lat: 9.9588, lng: 76.2598 },
  { id: "ZONE-08", name: "Princess Street", lat: 9.9665, lng: 76.2445 },
  { id: "ZONE-09", name: "Bazaar Road", lat: 9.9695, lng: 76.2498 },
  { id: "ZONE-10", name: "Delta Study School", lat: 9.9620, lng: 76.2430 }
];

const objectTypes = ['person', 'vehicle', 'drone'];

export const generateMockIntrusions = (count = 400) => {
  return Array.from({ length: count }, (_, i) => {
    const camera = fortKochiCameras[Math.floor(Math.random() * fortKochiCameras.length)];
    const objectType = objectTypes[Math.floor(Math.random() * objectTypes.length)];

    const now = new Date();
    // Generate dates spanning 15 years (approx 5475 days)
    const randomDaysAgo = Math.floor(Math.random() * 5475); 
    const timestamp = new Date(new Date().setDate(now.getDate() - randomDaysAgo)).toISOString();

    const lat = camera.lat + (Math.random() - 0.5) * 0.0005;
    const lng = camera.lng + (Math.random() - 0.5) * 0.0005;
    const confidenceScore = 0.7 + Math.random() * 0.3;

    return {
      id: `id-${i}`,
      timestamp,
      location: { lat, lng },
      objectType,
      confidenceScore,
      riskScore: calculateRiskScore(confidenceScore, objectType),
      placeName: camera.name,
      cameraID: camera.id
    };
  });
};