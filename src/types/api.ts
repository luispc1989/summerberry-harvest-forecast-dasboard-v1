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

export interface PredictionRequest {
  site: string;
  variety: string;
  sector: string;
  plantType: string;
  plantationDate: string;
  selectedDate: string;
  file?: File;
}
