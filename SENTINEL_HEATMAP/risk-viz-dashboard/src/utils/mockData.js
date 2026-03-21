import { calculateRiskScore } from './riskLogic';

// Indian cities used for analytics & bar charts
const indianCities = [
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Kochi", lat: 9.9312, lng: 76.2673 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 }
];

const objectTypes = ['person', 'vehicle', 'drone'];

export const generateMockIntrusions = (count = 300) => {
  return Array.from({ length: count }, (_, i) => {
    const city = indianCities[Math.floor(Math.random() * indianCities.length)];
    const objectType = objectTypes[Math.floor(Math.random() * objectTypes.length)];

    // Spread data across the last year
    const now = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 365);
    const timestamp = new Date(
      new Date().setDate(now.getDate() - randomDaysAgo)
    ).toISOString();

    // Slight coordinate jitter for heatmap realism
    const lat = city.lat + (Math.random() - 0.5) * 1.2;
    const lng = city.lng + (Math.random() - 0.5) * 1.2;

    const confidenceScore = 0.7 + Math.random() * 0.3;

    const riskScore = calculateRiskScore
      ? calculateRiskScore(objectType, confidenceScore)
      : confidenceScore * (objectType === 'drone' ? 2.5 : objectType === 'vehicle' ? 1.5 : 1.0);

    return {
      id: `id-${i}`,
      timestamp,
      location: { lat, lng },
      objectType,
      confidenceScore,
      riskScore,
      placeName: city.name,          // ✅ Used for Bar Charts
      cameraID: `CAM-${Math.floor(Math.random() * 100)}`
    };
  });
};