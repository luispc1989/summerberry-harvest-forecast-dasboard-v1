// Types for Python ML API integration

export interface DailyPrediction {
  day: string;
  date: string;
  value: number;
}

export interface PredictionResponse {
  predictions: DailyPrediction[];
  total: number;
  average: number;
  stdDev: number;
}

// Backend returns predictions with statistics
// Format: { predictions: {"2025-01-01": 150, ...}, total: 1050, average: 150, stdDev: 25.5 }
export interface BackendPredictionResponse {
  predictions: Record<string, number>;
  total: number;
  average: number;
  stdDev: number;
}

export interface PredictionRequest {
  site: string;
  sector: string;
  selectedDate: string;
  file?: File;
}

// Helper function to convert backend response to app format
export function convertBackendResponse(backendData: BackendPredictionResponse): PredictionResponse {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const predictions = Object.entries(backendData.predictions)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, value]) => {
      const dateObj = new Date(date);
      return {
        day: dayNames[dateObj.getDay()],
        date: date,
        value: value
      };
    });

  return {
    predictions,
    total: backendData.total,
    average: backendData.average,
    stdDev: backendData.stdDev
  };
}
