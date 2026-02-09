const OBJECT_WEIGHTS = {
    person: 1.0, 
    vehicle: 1.5, 
    drone: 2.5 
};

export const calculateRiskScore = (confidence, type) => {
    const weight = OBJECT_WEIGHTS[type] || 1.0;
    return parseFloat((confidence * weight).toFixed(2));
};

/**
 * Logic for Quartile Coloring
 * @param {number} rank - The sorted position of the zone (0 = highest frequency)
 * @param {number} totalZones - Total number of active zones
 */
export const getQuartileColor = (rank, totalZones) => {
    const threshold = totalZones / 4;
    if (rank < threshold) return '#ef4444';        // Top 25%: Red (Critical)
    if (rank < threshold * 2) return '#f97316';   // 25-50%: Orange (High)
    if (rank < threshold * 3) return '#eab308';   // 50-75%: Yellow (Moderate)
    return '#22c55e';                             // Bottom 25%: Green (Low)
};

/**
 * Probability Calculation
 * Formula: $$P(intrusion) = \frac{count_{zone}}{count_{total\_10y}} \times 100$$
 */
export const calculateProbability = (zoneCount, totalCount) => {
    if (totalCount === 0) return "0.00";
    return ((zoneCount / totalCount) * 100).toFixed(2);
};