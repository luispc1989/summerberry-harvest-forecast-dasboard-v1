// Types for Python ML API integration - Hierarchical format

// Individual daily forecast with confidence intervals
export interface DailyForecast {
  date: string;
  value: number;
  error: number;
  lower: number;
  upper: number;
}

// Legacy format for backwards compatibility
export interface DailyPrediction {
  day: string;
  date: string;
  value: number;
  error?: number;
  lower?: number;
  upper?: number;
}

// Sector forecast data
export interface SectorForecast {
  daily_forecast: DailyForecast[];
  total: number;
  average: number;
}

// Site forecast data with nested sectors
export interface SiteForecast {
  daily_forecast: DailyForecast[];
  total: number;
  average: number;
  sectors: Record<string, SectorForecast>;
}

// Global (all sites) forecast data
export interface GlobalForecast {
  daily_forecast: DailyForecast[];
  total: number;
  average: number;
}

// API response metadata
export interface ForecastMeta {
  forecast_horizon_days: number;
  generated_at: string;
  units: string;
  error_metric: string;
  confidence_level: number;
}

// Full hierarchical API response
export interface HierarchicalForecastResponse {
  meta: ForecastMeta;
  global: GlobalForecast;
  sites: Record<string, SiteForecast>;
}

// App-level prediction response (converted from API)
export interface PredictionResponse {
  predictions: DailyPrediction[];
  total: number;
  average: number;
  meta?: ForecastMeta;
}

// Backend response format matching FastAPI /api/filters endpoint
export interface BackendPredictionResponse {
  predictions: Record<string, number>;
  total: number;
  average?: number; // Optional - calculated on frontend if not provided
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Convert DailyForecast array to DailyPrediction array
function convertDailyForecasts(forecasts: DailyForecast[]): DailyPrediction[] {
  return forecasts
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(forecast => {
      const dateObj = new Date(forecast.date);
      return {
        day: dayNames[dateObj.getDay()],
        date: forecast.date,
        value: forecast.value,
        error: forecast.error,
        lower: forecast.lower,
        upper: forecast.upper
      };
    });
}

// Convert hierarchical response based on selected filters
export function convertHierarchicalResponse(
  response: HierarchicalForecastResponse,
  site: string,
  sector: string
): PredictionResponse {
  let forecasts: DailyForecast[];
  let total: number;
  let average: number;

  if (site === 'all' || site === 'All Sites') {
    // Use global forecast for all sites
    forecasts = response.global.daily_forecast;
    total = response.global.total;
    average = response.global.average;
  } else if (sector === 'all' || sector === 'All Sectors') {
    // Use site-level forecast
    const siteData = response.sites[site];
    if (!siteData) {
      throw new Error(`Site ${site} not found in response`);
    }
    forecasts = siteData.daily_forecast;
    total = siteData.total;
    average = siteData.average;
  } else {
    // Use sector-level forecast
    const siteData = response.sites[site];
    if (!siteData) {
      throw new Error(`Site ${site} not found in response`);
    }
    const sectorData = siteData.sectors[sector];
    if (!sectorData) {
      throw new Error(`Sector ${sector} not found for site ${site}`);
    }
    forecasts = sectorData.daily_forecast;
    total = sectorData.total;
    average = sectorData.average;
  }

  return {
    predictions: convertDailyForecasts(forecasts),
    total,
    average,
    meta: response.meta
  };
}

// Convert backend /api/filters response to app format
export function convertBackendResponse(backendData: BackendPredictionResponse): PredictionResponse {
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

  // Calculate average if not provided by backend
  const average = backendData.average ?? Math.round(backendData.total / predictions.length);

  return {
    predictions,
    total: backendData.total,
    average
  };
}
