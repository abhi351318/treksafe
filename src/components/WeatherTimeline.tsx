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
    <div className="bg-[#0F1420] border border-white/10 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-orange-400 font-bold block">
            CHRONOLOGICAL SCRUBBER
          </span>
          <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
            24-Hour Diurnal Weather Outlook
          </h3>
        </div>
        <span className="text-xs font-mono text-white/40">
          {forecastDate} • SATELLITE HORIZON
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 pt-1">
        {displayHours.map((hour, idx) => {
          const isHighWind = hour.windSpeed > 25 || hour.windGust > 35;
          const isRainRisk = hour.rainProbability >= 40;

          return (
            <div
              key={idx}
              className={`p-3.5 border transition-all text-center space-y-2 ${
                isRainRisk
                  ? 'bg-blue-500/10 border-blue-500/40'
                  : isHighWind
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-[#101522] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="font-mono text-xs font-bold text-white/90">
                {hour.time}
              </div>

              <div className="flex justify-center py-1">
                {getConditionIcon(hour.weatherCode, hour.rainProbability, hour.isDay)}
              </div>

              <div className="text-xl font-mono font-black text-white">
                {hour.temperature}°
              </div>

              <div className="space-y-1 text-[10px] font-mono border-t border-white/5 pt-2">
                <div className="flex items-center justify-between text-blue-400">
                  <span className="text-white/40">RAIN</span>
                  <span>{hour.rainProbability}%</span>
                </div>
                <div className="flex items-center justify-between text-cyan-400">
                  <span className="text-white/40">WIND</span>
                  <span>{hour.windSpeed} km/h</span>
                </div>
                <div className="flex items-center justify-between text-white/60">
                  <span className="text-white/40">GUST</span>
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
