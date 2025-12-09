// Shared prediction calculation logic to ensure consistency across components

interface PredictionParams {
  site: string;
  selectedDate: Date;
  sector: string;
}

export const calculatePredictions = ({ site, selectedDate, sector }: PredictionParams) => {
  const basePredicted = 215;
  
  // Apply multipliers based on filters
  let predictedMultiplier = 1;
  
  // Site variation - each site has distinct multipliers
  if (site === 'all') {
    predictedMultiplier *= 1.15; // Combined average
  } else if (site === 'adm') {
    predictedMultiplier *= 0.92; // ADM produces less
  } else if (site === 'alm') {
    predictedMultiplier *= 1.28; // ALM produces more
  }
  
  // Sector variation - each sector produces noticeably different values
  if (sector === 'all') {
    predictedMultiplier *= 1.08; // Higher yield when aggregating all sectors
  } else {
    // Create a more distinct hash for each sector
    const sectorHash = sector.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
    // Variation range: 0.75 - 1.25 (50% range for noticeable differences)
    const sectorVariation = 0.75 + ((sectorHash % 50) / 100);
    predictedMultiplier *= sectorVariation;
  }
  
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
    
    // Generate mock error (5-10% of predicted value)
    const errorPercent = 0.05 + pseudoRandom * 0.05;
    const error = Math.round(predicted * errorPercent);
    
    predictions.push({
      day: `Day ${i + 1}`,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: predicted,
      error: error,
      lower: predicted - error,
      upper: predicted + error
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
