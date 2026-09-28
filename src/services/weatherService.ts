import { WeatherData, WeatherHourlyPoint } from '../types';

export function interpretWeatherCode(code: number): { label: string; isThunderstorm: boolean; isRain: boolean; isSnow: boolean } {
  // WMO Weather interpretation codes (WW)
  switch (code) {
    case 0:
      return { label: 'Clear Sky', isThunderstorm: false, isRain: false, isSnow: false };
    case 1:
      return { label: 'Mainly Clear', isThunderstorm: false, isRain: false, isSnow: false };
    case 2:
      return { label: 'Partly Cloudy', isThunderstorm: false, isRain: false, isSnow: false };
    case 3:
      return { label: 'Overcast', isThunderstorm: false, isRain: false, isSnow: false };
    case 45:
    case 48:
      return { label: 'Dense Fog / Rime', isThunderstorm: false, isRain: false, isSnow: false };
    case 51:
    case 53:
    case 55:
      return { label: 'Light to Moderate Drizzle', isThunderstorm: false, isRain: true, isSnow: false };
    case 61:
      return { label: 'Slight Rain', isThunderstorm: false, isRain: true, isSnow: false };
    case 63:
      return { label: 'Moderate Rain', isThunderstorm: false, isRain: true, isSnow: false };
    case 65:
      return { label: 'Heavy Torrential Rain', isThunderstorm: false, isRain: true, isSnow: false };
    case 71:
    case 73:
    case 75:
      return { label: 'Snowfall', isThunderstorm: false, isRain: false, isSnow: true };
    case 77:
      return { label: 'Snow Grains / Sleet', isThunderstorm: false, isRain: false, isSnow: true };
    case 80:
    case 81:
    case 82:
      return { label: 'Violent Rain Showers', isThunderstorm: false, isRain: true, isSnow: false };
    case 85:
    case 86:
      return { label: 'Heavy Snow Showers', isThunderstorm: false, isRain: false, isSnow: true };
    case 95:
      return { label: 'Thunderstorm', isThunderstorm: true, isRain: true, isSnow: false };
    case 96:
    case 99:
      return { label: 'Severe Thunderstorm with Hail', isThunderstorm: true, isRain: true, isSnow: true };
    default:
      return { label: 'Variable Mountain Conditions', isThunderstorm: false, isRain: false, isSnow: false };
  }
}

/**
 * Fetch high-precision weather forecast for coordinates & date
 */
export async function fetchTrekWeather(
  latitude: number,
  longitude: number,
  targetDate: string // YYYY-MM-DD
): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude.toFixed(4));
  url.searchParams.set('longitude', longitude.toFixed(4));
  url.searchParams.set(
    'hourly',
    'temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m,relative_humidity_2m,uv_index,is_day'
  );
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,weather_code'
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '14');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather forecast service returned status ${response.status}`);
  }

  const data = await response.json();
  const elevation = Math.round(data.elevation || 1200);

  // Daily index matching targetDate
  const dailyDates: string[] = data.daily?.time || [];
  let dayIdx = dailyDates.indexOf(targetDate);
  if (dayIdx === -1) {
    // If exact date not found, use closest or index 0 (today)
    dayIdx = 0;
  }

  const hourlyTimes: string[] = data.hourly?.time || [];
  const hourlyPoints: WeatherHourlyPoint[] = [];

  // Filter hours belonging to targetDate
  for (let i = 0; i < hourlyTimes.length; i++) {
    const timeStr = hourlyTimes[i];
    if (timeStr.startsWith(targetDate)) {
      const code = data.hourly.weather_code[i] ?? 0;
      const codeInfo = interpretWeatherCode(code);
      const hourPart = timeStr.split('T')[1]?.slice(0, 5) || `${i % 24}:00`;

      hourlyPoints.push({
        time: hourPart,
        isoTime: timeStr,
        temperature: Math.round(data.hourly.temperature_2m[i] * 10) / 10,
        feelsLike: Math.round(data.hourly.apparent_temperature[i] * 10) / 10,
        rainProbability: Math.round(data.hourly.precipitation_probability[i] || 0),
        precipitation: Math.round((data.hourly.precipitation[i] || 0) * 10) / 10,
        windSpeed: Math.round(data.hourly.wind_speed_10m[i] || 0),
        windGust: Math.round(data.hourly.wind_gusts_10m[i] || 0),
        humidity: Math.round(data.hourly.relative_humidity_2m[i] || 50),
        visibility: Math.round(((data.hourly.visibility[i] || 10000) / 1000) * 10) / 10, // km
        uvIndex: Math.round((data.hourly.uv_index[i] || 0) * 10) / 10,
        weatherCode: code,
        conditionLabel: codeInfo.label,
        isDay: Boolean(data.hourly.is_day?.[i] ?? 1)
      });
    }
  }

  // Calculate day aggregates
  const dayCode = data.daily?.weather_code?.[dayIdx] ?? 0;
  const dayInfo = interpretWeatherCode(dayCode);

  // Midday or average values for key metrics
  const daytimeHours = hourlyPoints.filter(h => h.isDay);
  const sampleSet = daytimeHours.length > 0 ? daytimeHours : hourlyPoints;

  const avgTemp = sampleSet.length > 0 
    ? Math.round((sampleSet.reduce((sum, h) => sum + h.temperature, 0) / sampleSet.length) * 10) / 10
    : 18;
  const avgFeelsLike = sampleSet.length > 0
    ? Math.round((sampleSet.reduce((sum, h) => sum + h.feelsLike, 0) / sampleSet.length) * 10) / 10
    : avgTemp;
  const maxRainProb = data.daily?.precipitation_probability_max?.[dayIdx] ?? 
    (sampleSet.length > 0 ? Math.max(...sampleSet.map(h => h.rainProbability)) : 10);
  const totalRain = Math.round((data.daily?.precipitation_sum?.[dayIdx] ?? 
    sampleSet.reduce((sum, h) => sum + h.precipitation, 0)) * 10) / 10;
  const maxWind = Math.round(data.daily?.wind_speed_10m_max?.[dayIdx] ?? 
    (sampleSet.length > 0 ? Math.max(...sampleSet.map(h => h.windSpeed)) : 15));
  const maxGust = Math.round(data.daily?.wind_gusts_10m_max?.[dayIdx] ?? 
    (sampleSet.length > 0 ? Math.max(...sampleSet.map(h => h.windGust)) : maxWind * 1.4));
  const avgHumidity = sampleSet.length > 0
    ? Math.round(sampleSet.reduce((sum, h) => sum + h.humidity, 0) / sampleSet.length)
    : 65;
  const minVisibility = sampleSet.length > 0
    ? Math.min(...sampleSet.map(h => h.visibility))
    : 10.0;
  const maxUv = data.daily?.uv_index_max?.[dayIdx] ?? 5;

  // Thunderstorm calculation based on codes and high convective precipitation + wind gusts
  const hasThunderCode = sampleSet.some(h => [95, 96, 99].includes(h.weatherCode)) || [95, 96, 99].includes(dayCode);
  let thunderstormProb = hasThunderCode ? 80 : 0;
  if (!hasThunderCode && maxRainProb > 60 && maxGust > 35) {
    thunderstormProb = Math.min(65, Math.round(maxRainProb * 0.6 + (maxGust - 30) * 1.2));
  } else if (!hasThunderCode && maxRainProb > 40) {
    thunderstormProb = Math.round(maxRainProb * 0.25);
  }

  return {
    temperature: avgTemp,
    feelsLike: avgFeelsLike,
    tempMin: Math.round(data.daily?.temperature_2m_min?.[dayIdx] ?? (avgTemp - 5)),
    tempMax: Math.round(data.daily?.temperature_2m_max?.[dayIdx] ?? (avgTemp + 5)),
    rainProbability: maxRainProb,
    rainAmount: totalRain,
    windSpeed: maxWind,
    windGust: maxGust,
    windDirection: Math.round(sampleSet[0]?.windSpeed || 180),
    humidity: avgHumidity,
    visibility: minVisibility,
    pressure: 1013,
    cloudCover: Math.round(sampleSet.length > 0 ? sampleSet.reduce((s, h) => s + (h.rainProbability > 20 ? 80 : 30), 0) / sampleSet.length : 40),
    thunderstormProbability: thunderstormProb,
    uvIndex: maxUv,
    weatherCode: dayCode,
    conditionLabel: dayInfo.label,
    elevation,
    hourly: hourlyPoints,
    forecastDate: targetDate
  };
}
