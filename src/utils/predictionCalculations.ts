// Shared prediction calculation logic to ensure consistency across components

interface PredictionParams {
  site: string;
  variety: string;
  selectedDate: Date;
  sector: string;
  plantType: string;
}

export const calculatePredictions = ({ site, variety, selectedDate, sector, plantType }: PredictionParams) => {
  const basePredicted = 215;
  
  // Apply multipliers based on filters
  let predictedMultiplier = 1;
  
  if (site === 'alm') {
    predictedMultiplier *= 1.12;
  }
  
  const varietyMultipliers: { [key: string]: number } = {
    'a': 1.0, 'b': 1.08, 'c': 0.95, 'd': 1.12, 'e': 0.88
  };
  predictedMultiplier *= (varietyMultipliers[variety] || 1.0) * 0.98;
  
  const plantTypeMultipliers: { [key: string]: number } = {
    'rb': 1.0, 'gt': 1.05, 'lc': 1.1, 'gc': 0.95, 'sc': 0.92
  };
  predictedMultiplier *= (plantTypeMultipliers[plantType] || 1.0);
  
  // Sector variation
  const sectorHash = sector.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const sectorVariation = 1 + ((sectorHash % 20) - 10) / 100;
  predictedMultiplier *= sectorVariation * 0.98;
  
  // Generate 7 daily predictions
  const predictions = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + i);
    
    // Use a deterministic seed based on date for consistent results
    const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const pseudoRandom = (Math.sin(dateSeed + i) + 1) / 2; // Range [0, 1]
    
    // Add daily variation
    const dateVariation = 1 + ((date.getDate() % 10) - 5) / 100;
    const dayVariation = 0.9 + pseudoRandom * 0.2;
    
    const predicted = Math.round(basePredicted * predictedMultiplier * dateVariation * dayVariation);
    
    predictions.push({
      day: `Day ${i + 1}`,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: predicted
    });
  }
  
  // Calculate statistics
  const values = predictions.map(p => p.value);
  const total = values.reduce((a, b) => a + b, 0);
  const average = total / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    predictions,
    total: Math.round(total),
    average: Math.round(average),
    stdDev: stdDev.toFixed(1)
  };
};
