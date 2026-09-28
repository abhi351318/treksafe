export type RiskBand = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export interface TrailWaypoint {
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  type?: 'start' | 'waypoint' | 'summit' | 'camp';
}

export interface TrekLocation {
  id: string;
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  elevation?: number; // in meters
  trailDifficulty?: 'Easy' | 'Moderate' | 'Challenging' | 'Strenuous' | 'Expert';
  description?: string;
  trailLengthKm?: number;
  startPoint?: TrailWaypoint;
  endPoint?: TrailWaypoint;
  pathway?: Array<{ lat: number; lng: number }>;
}

export interface WeatherHourlyPoint {
  time: string; // HH:mm
  isoTime: string;
  temperature: number; // °C
  feelsLike: number; // °C
  rainProbability: number; // %
  precipitation: number; // mm
  windSpeed: number; // km/h
  windGust: number; // km/h
  humidity: number; // %
  visibility: number; // km
  uvIndex: number;
  weatherCode: number;
  conditionLabel: string;
  isDay: boolean;
}

export interface WeatherData {
  temperature: number; // °C
  feelsLike: number; // °C
  tempMin: number;
  tempMax: number;
  rainProbability: number; // %
  rainAmount: number; // mm
  windSpeed: number; // km/h
  windGust: number; // km/h
  windDirection: number; // degrees
  humidity: number; // %
  visibility: number; // km
  pressure: number; // hPa
  cloudCover: number; // %
  thunderstormProbability: number; // %
  uvIndex: number;
  weatherCode: number;
  conditionLabel: string;
  elevation: number; // meters
  hourly: WeatherHourlyPoint[];
  forecastDate: string; // YYYY-MM-DD
}

export interface MLFeatures {
  temperature: number;
  feelsLike: number;
  tempDeviation: number; // deviation from comfortable 18°C
  rainProbability: number;
  rainAmount: number;
  windSpeed: number;
  windGust: number;
  humidity: number;
  visibility: number;
  thunderstormProbability: number;
  uvIndex: number;
  elevation: number;
  
  // Engineered stress features
  rainIntensityStress: number; // 0-100
  windStress: number; // 0-100
  visibilityStress: number; // 0-100
  thermalStress: number; // 0-100 (hypothermia or heatstroke risk)
  thunderstormHazard: number; // 0-100
  altitudeExposureFactor: number; // 1.0 to 2.2 multiplier based on elevation
}

export interface RiskFactorItem {
  id: string;
  name: string;
  valueString: string;
  shapValue: number; // e.g., +18.4 pts or -6.2 pts
  direction: 'increases_risk' | 'decreases_risk' | 'neutral';
  impactLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  explanation: string;
}

export interface RiskPrediction {
  score: number; // 0-100
  band: RiskBand;
  bandLabel: string;
  summary: string;
  actionRecommendation: string;
  baseRisk: number; // base prior risk before weather conditions
  factors: RiskFactorItem[];
  modelVersion: string;
  featureVersion: string;
  inferenceTimeMs: number;
}

export interface TrekAnalysisResult {
  trek: TrekLocation;
  date: string;
  weather: WeatherData;
  features: MLFeatures;
  risk: RiskPrediction;
  timestamp: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  brierScore: number;
  sampleCount: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
}

export interface DatasetRow {
  id: string;
  date: string;
  trekName: string;
  latitude: number;
  longitude: number;
  elevation: number;
  temperature: number;
  rainProbability: number;
  rainAmount: number;
  windSpeed: number;
  windGust: number;
  humidity: number;
  visibility: number;
  thunderstormProbability: number;
  uvIndex: number;
  incidentOccurred: 0 | 1;
  incidentType?: 'Trail Closure' | 'Hypothermia/Rescue' | 'Flash Flood' | 'Severe Gale' | 'None';
  riskScore: number;
}
