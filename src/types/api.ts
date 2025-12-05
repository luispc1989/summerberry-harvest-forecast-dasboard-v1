// Types for Python ML API integration

export interface DailyPrediction {
  day: string;
  date: string;
  value: number;
}

export interface InfluencingFactor {
  name: string;
  importance: number;
  correlation: "positive" | "negative";
}

export interface PredictionResponse {
  predictions: DailyPrediction[];
  total: number;
  average: number;
  stdDev: string;
  factors: InfluencingFactor[];
}

// Backend returns predictions in this format: {"2025-01-01": 150, "2025-01-02": 160, ...}
export type BackendPredictionResponse = Record<string, number>;

export interface PredictionRequest {
  site: string;
  sector: string;
  plantationDate: string;
  selectedDate: string;
  file?: File;
}

// Helper function to convert backend response to app format
export function convertBackendPredictions(backendData: BackendPredictionResponse): DailyPrediction[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return Object.entries(backendData)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, value]) => {
      const dateObj = new Date(date);
      return {
        day: dayNames[dateObj.getDay()],
        date: date,
        value: value
      };
    });
}

// Calculate total and average from predictions
export function calculateStats(predictions: DailyPrediction[]): { total: number; average: number } {
  const total = predictions.reduce((sum, pred) => sum + pred.value, 0);
  const average = predictions.length > 0 ? Math.round(total / predictions.length) : 0;
  return { total, average };
}
