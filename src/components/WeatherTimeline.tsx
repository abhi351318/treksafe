import React from 'react';
import { WeatherHourlyPoint } from '../types';
import {
  Clock,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  CloudSun
} from 'lucide-react';

interface WeatherTimelineProps {
  hourly: WeatherHourlyPoint[];
  forecastDate: string;
}

export const WeatherTimeline: React.FC<WeatherTimelineProps> = ({ hourly, forecastDate }) => {
  if (!hourly || hourly.length === 0) {
    return null;
  }

  // Sample key operational intervals across 24 hours
  const targetHourMarkers = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  const filteredHourly = hourly.filter((h) =>
    targetHourMarkers.includes(h.time)
  );

  const displayHours = filteredHourly.length >= 4 
    ? filteredHourly 
    : hourly.filter((_, idx) => idx % 3 === 0);

  const getConditionIcon = (code: number, rainProb: number, isDay: boolean) => {
    if ([95, 96, 99].includes(code)) {
      return <CloudLightning className="w-5 h-5 text-amber-400" />;
    }
    if (rainProb >= 50 || [61, 63, 65, 80, 81, 82].includes(code)) {
      return <CloudRain className="w-5 h-5 text-blue-400" />;
    }
    if ([1, 2].includes(code)) {
      return isDay ? <CloudSun className="w-5 h-5 text-amber-300" /> : <Cloud className="w-5 h-5 text-slate-400" />;
    }
    if (code === 0) {
      return isDay ? <Sun className="w-5 h-5 text-amber-400" /> : <Cloud className="w-5 h-5 text-slate-400" />;
    }
    return <Cloud className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="bg-[#111714] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          Diurnal Chronological Forecast (24-Hour Windows)
        </h3>
        <span className="text-xs font-mono text-white/40">
          {forecastDate} • Open-Meteo Telemetry
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        {displayHours.map((hour, idx) => {
          const isHighWind = hour.windSpeed > 25 || hour.windGust > 35;
          const isRainRisk = hour.rainProbability >= 40;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all text-center space-y-2 ${
                isRainRisk
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : isHighWind
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="font-mono text-xs font-bold text-white/90">
                {hour.time}
              </div>

              <div className="flex justify-center py-1">
                {getConditionIcon(hour.weatherCode, hour.rainProbability, hour.isDay)}
              </div>

              <div className="text-lg font-mono font-extrabold text-white">
                {hour.temperature}°<span className="text-xs text-white/50">C</span>
              </div>

              <div className="space-y-1 text-[11px] font-mono border-t border-white/5 pt-2">
                <div className="flex items-center justify-between text-blue-400">
                  <span className="text-white/40">Rain:</span>
                  <span>{hour.rainProbability}%</span>
                </div>
                <div className="flex items-center justify-between text-teal-400">
                  <span className="text-white/40">Wind:</span>
                  <span>{hour.windSpeed} km/h</span>
                </div>
                <div className="flex items-center justify-between text-white/60">
                  <span className="text-white/40">Gust:</span>
                  <span>{hour.windGust} km/h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
