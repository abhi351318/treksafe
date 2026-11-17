import React from 'react';
import { WeatherHourlyPoint } from '../types';
import {
  Clock,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
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
  const filteredHourly = hourly.filter((h) => targetHourMarkers.includes(h.time));

  const displayHours =
    filteredHourly.length >= 4
      ? filteredHourly
      : hourly.filter((_, idx) => idx % 3 === 0);

  const getConditionIcon = (code: number, rainProb: number, isDay: boolean) => {
    if ([95, 96, 99].includes(code)) {
      return <CloudLightning className="w-5 h-5 text-[#C85A32]" />;
    }
    if (rainProb >= 50 || [61, 63, 65, 80, 81, 82].includes(code)) {
      return <CloudRain className="w-5 h-5 text-[#3B7A9E]" />;
    }
    if ([1, 2].includes(code)) {
      return isDay ? (
        <CloudSun className="w-5 h-5 text-[#D7A84A]" />
      ) : (
        <Cloud className="w-5 h-5 text-[#6B7262]" />
      );
    }
    if (code === 0) {
      return isDay ? (
        <Sun className="w-5 h-5 text-[#D7A84A]" />
      ) : (
        <Cloud className="w-5 h-5 text-[#6B7262]" />
      );
    }
    return <Cloud className="w-5 h-5 text-[#6B7262]" />;
  };

  return (
    <div className="bg-white border border-[#E4E0D2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6D8] pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#526B4F]">
            <Clock className="w-3.5 h-3.5 text-[#243B2A]" />
            <span>Hourly Window Breakdown</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#243B2A] mt-0.5">
            24-Hour Trail Weather Outlook
          </h3>
        </div>
        <span className="text-xs font-medium text-[#6B7262] tabular-nums">
          {forecastDate}
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
                  ? 'bg-[#EEF5F8] border-[#C6DCE6]'
                  : isHighWind
                  ? 'bg-[#FDF8E8] border-[#EEDCA8]'
                  : 'bg-[#FAF8F3] border-[#E4E0D2]'
              }`}
            >
              <div className="font-mono text-xs font-bold text-[#243B2A] tabular-nums">
                {hour.time}
              </div>

              <div className="flex justify-center py-1">
                {getConditionIcon(hour.weatherCode, hour.rainProbability, hour.isDay)}
              </div>

              <div className="text-xl font-extrabold text-[#1F2520] tabular-nums">
                {hour.temperature}°C
              </div>

              <div className="space-y-1 text-[11px] border-t border-[#EAE6D8] pt-2 tabular-nums">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7262]">Rain</span>
                  <span className="font-semibold text-[#3B7A9E]">{hour.rainProbability}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7262]">Wind</span>
                  <span className="font-semibold text-[#243B2A]">{hour.windSpeed} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7262]">Gust</span>
                  <span className="font-medium text-[#526B4F]">{hour.windGust} km/h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
