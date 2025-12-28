// Types for Python ML API integration - Backend format

// Individual daily forecast with confidence intervals
export interface DailyForecast {
  date: string;
  value: number;
  error?: number;
  lower?: number;
  upper?: number;
}

// Legacy format for component display
export interface DailyPrediction {
  day: string;
  date: string;
  value: number;
  error?: number;
  lower?: number;
  upper?: number;
}

// Sector forecast data (from backend)
export interface SectorForecast {
  daily_forecast: DailyForecast[];
}

// API response metadata
export interface ForecastMeta {
  forecast_horizon_days: number;
  generated_at: string;
  units: string;
  error_metric: string;
  confidence_level: number;
}

// Backend hierarchical API response format
// Structure: predictions[site][sector] = { daily_forecast: [...] }
export interface HierarchicalForecastResponse {
  meta: ForecastMeta;
  predictions: Record<string, Record<string, SectorForecast>>;
}

// App-level prediction response (converted from API)
export interface PredictionResponse {
  predictions: DailyPrediction[];
  total: number;
  average: number;
  meta?: ForecastMeta;
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

// Calculate total and average from daily forecasts
function calculateTotals(forecasts: DailyForecast[]): { total: number; average: number } {
  const total = forecasts.reduce((sum, f) => sum + (f.value || 0), 0);
  const average = forecasts.length > 0 ? Math.round(total / forecasts.length) : 0;
  return { total: Math.round(total), average };
}

// Convert hierarchical response based on selected filters
// Backend format: predictions[site][sector] = { daily_forecast: [...] }
// Special keys: "all_sites" for global, "all_sectors" for site-level
export function convertHierarchicalResponse(
  response: HierarchicalForecastResponse,
  site: string,
  sector: string
): PredictionResponse {
  let forecasts: DailyForecast[] = [];
  
  const predictions = response.predictions;
  
  if (site === 'all' || site === 'All Sites') {
    // Use "all_sites" -> "all_sectors" for global forecast
    const allSites = predictions['all_sites'];
    if (allSites && allSites['all_sectors']) {
      forecasts = allSites['all_sectors'].daily_forecast || [];
    } else {
      // Fallback: aggregate all sites and sectors
      forecasts = aggregateAllForecasts(predictions);
    }
  } else if (sector === 'all' || sector === 'All Sectors') {
    // Use site -> "all_sectors" for site-level forecast
    const siteData = predictions[site];
    if (!siteData) {
      throw new Error(`Site ${site} not found in response`);
    }
    if (siteData['all_sectors']) {
      forecasts = siteData['all_sectors'].daily_forecast || [];
    } else {
      // Fallback: aggregate all sectors for this site
      forecasts = aggregateSiteForecasts(siteData);
    }
  } else {
    // Use specific site -> sector forecast
    const siteData = predictions[site];
    if (!siteData) {
      throw new Error(`Site ${site} not found in response`);
    }
    const sectorData = siteData[sector];
    if (!sectorData) {
      throw new Error(`Sector ${sector} not found for site ${site}`);
    }
    forecasts = sectorData.daily_forecast || [];
  }

  const { total, average } = calculateTotals(forecasts);

  return {
    predictions: convertDailyForecasts(forecasts),
    total,
    average,
    meta: response.meta
  };
}

// Aggregate forecasts from all sectors of a site
function aggregateSiteForecasts(siteData: Record<string, SectorForecast>): DailyForecast[] {
  const dateMap = new Map<string, DailyForecast>();
  
  Object.entries(siteData).forEach(([sectorKey, sectorData]) => {
    if (sectorKey === 'all_sectors') return; // Skip aggregate key
    
    (sectorData.daily_forecast || []).forEach(forecast => {
      const existing = dateMap.get(forecast.date);
      if (existing) {
        existing.value = (existing.value || 0) + (forecast.value || 0);
        existing.error = (existing.error || 0) + (forecast.error || 0);
        existing.lower = (existing.lower || 0) + (forecast.lower || 0);
        existing.upper = (existing.upper || 0) + (forecast.upper || 0);
      } else {
        dateMap.set(forecast.date, { ...forecast });
      }
    });
  });
  
  return Array.from(dateMap.values());
}

// Aggregate all forecasts across all sites and sectors
function aggregateAllForecasts(predictions: Record<string, Record<string, SectorForecast>>): DailyForecast[] {
  const dateMap = new Map<string, DailyForecast>();
  
  Object.entries(predictions).forEach(([siteKey, siteData]) => {
    if (siteKey === 'all_sites') return; // Skip aggregate key
    
    Object.entries(siteData).forEach(([sectorKey, sectorData]) => {
      if (sectorKey === 'all_sectors') return; // Skip aggregate key
      
      (sectorData.daily_forecast || []).forEach(forecast => {
        const existing = dateMap.get(forecast.date);
        if (existing) {
          existing.value = (existing.value || 0) + (forecast.value || 0);
          existing.error = (existing.error || 0) + (forecast.error || 0);
          existing.lower = (existing.lower || 0) + (forecast.lower || 0);
          existing.upper = (existing.upper || 0) + (forecast.upper || 0);
        } else {
          dateMap.set(forecast.date, { ...forecast });
        }
      });
    });
  });
  
  return Array.from(dateMap.values());
}

// Get available sites from response (excluding aggregate keys)
export function getAvailableSites(response: HierarchicalForecastResponse): string[] {
  return Object.keys(response.predictions).filter(site => site !== 'all_sites');
}

// Get available sectors for a site (excluding aggregate keys)
export function getAvailableSectors(response: HierarchicalForecastResponse, site: string): string[] {
  const siteData = response.predictions[site];
  if (!siteData) return [];
  return Object.keys(siteData).filter(sector => sector !== 'all_sectors');
}
