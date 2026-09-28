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

  // Pick representative hours: 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
  const targetHourMarkers = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  const filteredHourly = hourly.filter((h) =>
    targetHourMarkers.includes(h.time)
  );

  // If filtered is empty or sparse, take every 3rd or 4th hour
  const displayHours = filteredHourly.length >= 4 
    ? filteredHourly 
    : hourly.filter((_, idx) => idx % 3 === 0);

  const getConditionIcon = (code: number, rainProb: number, isDay: boolean) => {
    if ([95, 96, 99].includes(code)) {
      return <CloudLightning className="w-5 h-5 text-amber-600" />;
    }
    if (rainProb >= 50 || [61, 63, 65, 80, 81, 82].includes(code)) {
      return <CloudRain className="w-5 h-5 text-blue-500" />;
    }
    if ([1, 2].includes(code)) {
      return isDay ? <CloudSun className="w-5 h-5 text-amber-500" /> : <Cloud className="w-5 h-5 text-slate-400" />;
    }
    if (code === 0) {
      return isDay ? <Sun className="w-5 h-5 text-amber-500" /> : <Cloud className="w-5 h-5 text-slate-400" />;
    }
    return <Cloud className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="bg-white border border-[#E4E0D2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#E4E0D2] pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#243B2A] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#526B4F]" />
          Diurnal Trail Weather Timeline
        </h3>
        <span className="text-xs font-medium text-[#6B7262]">
          {forecastDate} Hourly Forecast
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {displayHours.map((hour) => {
          const isHighRiskHour = hour.rainProbability >= 60 || hour.windSpeed >= 35 || [95, 96, 99].includes(hour.weatherCode);

          return (
            <div
              key={hour.time}
              className={`p-3 rounded-xl border text-center transition-all ${
                isHighRiskHour
                  ? 'border-amber-300 bg-amber-50/40'
                  : 'border-[#EAE6D8] bg-[#FAF8F3]/60 hover:bg-[#FAF8F3]'
              }`}
            >
              <div className="text-xs font-bold text-[#243B2A] font-mono mb-2">
                {hour.time}
              </div>

              <div className="flex justify-center mb-2">
                {getConditionIcon(hour.weatherCode, hour.rainProbability, hour.isDay)}
              </div>

              <div className="text-base font-extrabold text-[#1F2520] mb-1">
                {hour.temperature}°C
              </div>

              <div className="space-y-1 text-[11px] text-[#526B4F]">
                <div className="flex items-center justify-center gap-1 font-medium">
                  <CloudRain className="w-3 h-3 text-blue-500" />
                  <span>{hour.rainProbability}%</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-[#6B7262]">
                  <Wind className="w-3 h-3" />
                  <span>{hour.windSpeed} km/h</span>
                </div>
              </div>

              {isHighRiskHour && (
                <div className="mt-2 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-sm">
                  Hazard Window
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
