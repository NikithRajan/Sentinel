// Define wieghts for different objects

const OBJECT_WEIGHTS = {
    person: 1.0, //medium
    vehicle: 1.5, //high (unauthorised)
    drone: 2.5 //very high
};

/** 
 *calculate risk score for a single detection
 * @param {number} confidence - 0.0 to 1.0 from the AI model
 * @param {string} type - 'person', 'vechicle',  or 'drone'
 * @param {number} - The calculated heat intensity
*/
export const calculateRiskScore = (confidence, type) => {
    const weight = OBJECT_WEIGHTS[type] || 1.0;
    return parseFloat((confidence * weight).toFixed(2));
};

//This will help us color code the zones
export const getRiskLevel = (score) => {
    if(score >2.0) return 'Critical'; //Red
    if(score >1.2) return 'High'; //Orange
    return 'Low' // Yellow/Green
};