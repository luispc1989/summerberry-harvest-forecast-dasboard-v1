// Shared prediction calculation logic to ensure consistency across components

interface PredictionParams {
  site: string;
  selectedDate: Date;
  sector: string;
  plantationDate?: string;
}

export const calculatePredictions = ({ site, selectedDate, sector, plantationDate }: PredictionParams) => {
  const basePredicted = 215;
  
  // Apply multipliers based on filters
  let predictedMultiplier = 1;
  
  if (site === 'alm') {
    predictedMultiplier *= 1.12;
  }
  
  // Sector variation
  const sectorHash = sector.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const sectorVariation = 1 + ((sectorHash % 20) - 10) / 100;
  predictedMultiplier *= sectorVariation * 0.98;
  
  // Plantation date variation - each date produces different values
  if (plantationDate) {
    const dateParts = plantationDate.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    
    // Create a unique hash from plantation date
    const plantationHash = (year * 10000 + month * 100 + day);
    const plantationVariation = 0.85 + ((plantationHash % 30) / 100); // Range 0.85 - 1.15
    predictedMultiplier *= plantationVariation;
    
    // Additional variation based on planting age (older plantations may have different yields)
    const plantingYear = year;
    const ageMultiplier = plantingYear <= 2020 ? 1.08 : plantingYear <= 2021 ? 1.0 : 0.95;
    predictedMultiplier *= ageMultiplier;
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
