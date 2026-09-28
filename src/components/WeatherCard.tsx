import React from 'react';
import { WeatherData } from '../types';
import {
  Thermometer,
  CloudRain,
  Wind,
  Eye,
  Droplets,
  Zap,
  Sun,
  CloudFog,
  Compass
} from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Temperature */}
      <div className="bg-white border border-[#E4E0D2] rounded-xl p-3.5 shadow-2xs hover:border-[#243B2A]/40 transition-colors">
        <div className="flex items-center justify-between text-[#526B4F] mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider">Temperature</span>
          <Thermometer className="w-4 h-4 text-[#D7A84A]" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-[#1F2520]">
          {weather.temperature}°C
        </div>
        <div className="text-[11px] text-[#526B4F] mt-0.5 font-medium">
          Feels like {weather.feelsLike}°C
        </div>
        <div className="text-[10px] text-[#8C8675] mt-1 font-mono">
          L: {weather.tempMin}° · H: {weather.tempMax}°
        </div>
      </div>

      {/* 2. Precipitation */}
      <div className="bg-white border border-[#E4E0D2] rounded-xl p-3.5 shadow-2xs hover:border-[#243B2A]/40 transition-colors">
        <div className="flex items-center justify-between text-[#526B4F] mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider">Precipitation</span>
          <CloudRain className="w-4 h-4 text-[#3B82F6]" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-[#1F2520]">
          {weather.rainProbability}%
        </div>
        <div className="text-[11px] text-[#526B4F] mt-0.5 font-medium">
          {weather.rainAmount > 0 ? `${weather.rainAmount} mm volume` : 'No rain expected'}
        </div>
        <div className="text-[10px] text-[#8C8675] mt-1 truncate">
          {weather.conditionLabel}
        </div>
      </div>

      {/* 3. Wind & Gusts */}
      <div className="bg-white border border-[#E4E0D2] rounded-xl p-3.5 shadow-2xs hover:border-[#243B2A]/40 transition-colors">
        <div className="flex items-center justify-between text-[#526B4F] mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider">Wind & Gusts</span>
          <Wind className="w-4 h-4 text-[#526B4F]" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-[#1F2520]">
          {weather.windSpeed} <span className="text-xs font-normal text-[#6B7262]">km/h</span>
        </div>
        <div className="text-[11px] text-[#526B4F] mt-0.5 font-medium">
          Peak gusts {weather.windGust} km/h
        </div>
        <div className="text-[10px] text-[#8C8675] mt-1">
          {weather.windSpeed > 35 ? 'Ridge hazard' : 'Moderate breeze'}
        </div>
      </div>

      {/* 4. Visibility */}
      <div className="bg-white border border-[#E4E0D2] rounded-xl p-3.5 shadow-2xs hover:border-[#243B2A]/40 transition-colors">
        <div className="flex items-center justify-between text-[#526B4F] mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider">Visibility</span>
          <Eye className="w-4 h-4 text-[#526B4F]" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-[#1F2520]">
          {weather.visibility} <span className="text-xs font-normal text-[#6B7262]">km</span>
        </div>
        <div className="text-[11px] text-[#526B4F] mt-0.5 font-medium">
          {weather.visibility >= 9 ? 'Clear trail sight' : weather.visibility >= 4 ? 'Moderate haze' : 'Dense fog risk'}
        </div>
        <div className="text-[10px] text-[#8C8675] mt-1">
          Cloud cover {weather.cloudCover}%
        </div>
      </div>

      {/* 5. Humidity */}
      <div className="bg-white border border-[#E4E0D2] rounded-xl p-3.5 shadow-2xs hover:border-[#243B2A]/40 transition-colors">
        <div className="flex items-center justify-between text-[#526B4F] mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider">Humidity</span>
          <Droplets className="w-4 h-4 text-[#0284C7]" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-[#1F2520]">
          {weather.humidity}%
        </div>
        <div className="text-[11px] text-[#526B4F] mt-0.5 font-medium">
          {weather.humidity > 80 ? 'Heavy moisture' : 'Comfortable'}
        </div>
        <div className="text-[10px] text-[#8C8675] mt-1 font-mono">
          {weather.pressure} hPa
        </div>
      </div>

      {/* 6. Storm & UV */}
      <div className="bg-white border border-[#E4E0D2] rounded-xl p-3.5 shadow-2xs hover:border-[#243B2A]/40 transition-colors">
        <div className="flex items-center justify-between text-[#526B4F] mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider">Storm / UV</span>
          {weather.thunderstormProbability > 20 ? (
            <Zap className="w-4 h-4 text-[#DC2626]" />
          ) : (
            <Sun className="w-4 h-4 text-[#D7A84A]" />
          )}
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-[#1F2520]">
          {weather.thunderstormProbability}%
        </div>
        <div className="text-[11px] text-[#526B4F] mt-0.5 font-medium">
          UV Index: {weather.uvIndex} ({weather.uvIndex > 6 ? 'High' : 'Moderate'})
        </div>
        <div className="text-[10px] text-[#8C8675] mt-1">
          {weather.thunderstormProbability > 30 ? 'Lightning watch' : 'Low convective risk'}
        </div>
      </div>
    </div>
  );
};
