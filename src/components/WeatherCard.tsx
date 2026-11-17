import React from 'react';
import { WeatherData } from '../types';
import {
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Zap,
  Sun
} from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Temperature */}
      <div className="bg-white border border-[#E4E0D2] rounded-2xl p-4 shadow-xs hover:border-[#526B4F] transition-all">
        <div className="flex items-center justify-between text-[#6B7262] mb-2 text-xs font-semibold">
          <span>Temperature</span>
          <Thermometer className="w-4 h-4 text-[#C85A32]" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#1F2520] tabular-nums">
          {weather.temperature}°C
        </div>
        <div className="text-xs text-[#526B4F] mt-1 font-medium">
          Feels like {weather.feelsLike}°C
        </div>
        <div className="text-[11px] text-[#6B7262] mt-2 pt-2 border-t border-[#F0EDE3] flex justify-between tabular-nums">
          <span>Min {weather.tempMin}°</span>
          <span>Max {weather.tempMax}°</span>
        </div>
      </div>

      {/* 2. Precipitation */}
      <div className="bg-white border border-[#E4E0D2] rounded-2xl p-4 shadow-xs hover:border-[#526B4F] transition-all">
        <div className="flex items-center justify-between text-[#6B7262] mb-2 text-xs font-semibold">
          <span>Rain Chance</span>
          <CloudRain className="w-4 h-4 text-[#3B7A9E]" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#1F2520] tabular-nums">
          {weather.rainProbability}%
        </div>
        <div className="text-xs text-[#3B7A9E] mt-1 font-medium truncate">
          {weather.rainAmount > 0 ? `${weather.rainAmount} mm expected` : 'Dry conditions'}
        </div>
        <div className="text-[11px] text-[#6B7262] mt-2 pt-2 border-t border-[#F0EDE3] truncate">
          {weather.conditionLabel}
        </div>
      </div>

      {/* 3. Wind & Gusts */}
      <div className="bg-white border border-[#E4E0D2] rounded-2xl p-4 shadow-xs hover:border-[#526B4F] transition-all">
        <div className="flex items-center justify-between text-[#6B7262] mb-2 text-xs font-semibold">
          <span>Ridge Wind</span>
          <Wind className="w-4 h-4 text-[#526B4F]" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#1F2520] tabular-nums">
          {weather.windSpeed}
          <span className="text-xs font-semibold text-[#6B7262] ml-1">km/h</span>
        </div>
        <div className="text-xs text-[#526B4F] mt-1 font-medium tabular-nums">
          Gusts up to {weather.windGust} km/h
        </div>
        <div className="text-[11px] text-[#6B7262] mt-2 pt-2 border-t border-[#F0EDE3] tabular-nums">
          Direction: {weather.windDirection}°
        </div>
      </div>

      {/* 4. Thunderstorm Hazard */}
      <div className="bg-white border border-[#E4E0D2] rounded-2xl p-4 shadow-xs hover:border-[#526B4F] transition-all">
        <div className="flex items-center justify-between text-[#6B7262] mb-2 text-xs font-semibold">
          <span>Storm Risk</span>
          <Zap className="w-4 h-4 text-[#D7A84A]" />
        </div>
        <div
          className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${
            weather.thunderstormProbability > 25 ? 'text-[#991B1B]' : 'text-[#1F2520]'
          }`}
        >
          {weather.thunderstormProbability}%
        </div>
        <div className="text-xs text-[#526B4F] mt-1 font-medium">
          {weather.thunderstormProbability > 25 ? 'Lightning caution' : 'Low storm risk'}
        </div>
        <div className="text-[11px] text-[#6B7262] mt-2 pt-2 border-t border-[#F0EDE3] tabular-nums">
          Cloud cover: {weather.cloudCover}%
        </div>
      </div>

      {/* 5. Humidity & Pressure */}
      <div className="bg-white border border-[#E4E0D2] rounded-2xl p-4 shadow-xs hover:border-[#526B4F] transition-all">
        <div className="flex items-center justify-between text-[#6B7262] mb-2 text-xs font-semibold">
          <span>Humidity</span>
          <Droplets className="w-4 h-4 text-[#2E5A36]" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#1F2520] tabular-nums">
          {weather.humidity}%
        </div>
        <div className="text-xs text-[#526B4F] mt-1 font-medium tabular-nums">
          Pressure: {weather.pressure} hPa
        </div>
        <div className="text-[11px] text-[#6B7262] mt-2 pt-2 border-t border-[#F0EDE3] tabular-nums">
          Elevation: {weather.elevation}m
        </div>
      </div>

      {/* 6. UV & Visibility */}
      <div className="bg-white border border-[#E4E0D2] rounded-2xl p-4 shadow-xs hover:border-[#526B4F] transition-all">
        <div className="flex items-center justify-between text-[#6B7262] mb-2 text-xs font-semibold">
          <span>UV & Sight</span>
          <Sun className="w-4 h-4 text-[#D7A84A]" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#1F2520] tabular-nums">
          {weather.uvIndex}
          <span className="text-xs font-semibold text-[#6B7262] ml-1">UV</span>
        </div>
        <div className="text-xs text-[#526B4F] mt-1 font-medium tabular-nums">
          Visibility: {weather.visibility} km
        </div>
        <div className="text-[11px] text-[#6B7262] mt-2 pt-2 border-t border-[#F0EDE3]">
          {weather.uvIndex >= 6 ? 'Sun protection advised' : 'Moderate UV exposure'}
        </div>
      </div>
    </div>
  );
};
