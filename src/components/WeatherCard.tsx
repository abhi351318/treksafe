import React from 'react';
import { WeatherData } from '../types';
import {
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Zap,
  Sun,
  Eye,
  Compass
} from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {/* 1. Temperature */}
      <div className="bg-[#0F1420] border border-white/10 hover:border-orange-500/40 p-4 transition-all">
        <div className="flex items-center justify-between text-white/40 mb-2 font-mono text-[9px] uppercase tracking-widest">
          <span>TEMPERATURE</span>
          <Thermometer className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="text-3xl font-mono font-black text-white tracking-tight">
          {weather.temperature}°
        </div>
        <div className="text-[10px] text-orange-400/90 mt-1 font-mono">
          Feels like {weather.feelsLike}°C
        </div>
        <div className="text-[9px] text-white/40 mt-1.5 font-mono pt-1.5 border-t border-white/5 flex justify-between">
          <span>MIN {weather.tempMin}°</span>
          <span>MAX {weather.tempMax}°</span>
        </div>
      </div>

      {/* 2. Precipitation */}
      <div className="bg-[#0F1420] border border-white/10 hover:border-blue-500/40 p-4 transition-all">
        <div className="flex items-center justify-between text-white/40 mb-2 font-mono text-[9px] uppercase tracking-widest">
          <span>PRECIPITATION</span>
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="text-3xl font-mono font-black text-white tracking-tight">
          {weather.rainProbability}%
        </div>
        <div className="text-[10px] text-blue-400/90 mt-1 font-mono truncate">
          {weather.rainAmount > 0 ? `${weather.rainAmount} mm accumulation` : 'Zero rainfall'}
        </div>
        <div className="text-[9px] text-white/40 mt-1.5 font-mono pt-1.5 border-t border-white/5 truncate">
          {weather.conditionLabel}
        </div>
      </div>

      {/* 3. Wind & Gusts */}
      <div className="bg-[#0F1420] border border-white/10 hover:border-cyan-500/40 p-4 transition-all">
        <div className="flex items-center justify-between text-white/40 mb-2 font-mono text-[9px] uppercase tracking-widest">
          <span>RIDGE WIND</span>
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-3xl font-mono font-black text-white tracking-tight">
          {weather.windSpeed}
          <span className="text-xs text-white/50 font-normal ml-1">KM/H</span>
        </div>
        <div className="text-[10px] text-cyan-400/90 mt-1 font-mono">
          Gust peak: {weather.windGust} km/h
        </div>
        <div className="text-[9px] text-white/40 mt-1.5 font-mono pt-1.5 border-t border-white/5">
          Vector: {weather.windDirection}°
        </div>
      </div>

      {/* 4. Thunderstorm Hazard */}
      <div className="bg-[#0F1420] border border-white/10 hover:border-amber-500/40 p-4 transition-all">
        <div className="flex items-center justify-between text-white/40 mb-2 font-mono text-[9px] uppercase tracking-widest">
          <span>LIGHTNING RISK</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className={`text-3xl font-mono font-black tracking-tight ${weather.thunderstormProbability > 25 ? 'text-rose-400' : 'text-white'}`}>
          {weather.thunderstormProbability}%
        </div>
        <div className="text-[10px] text-white/50 mt-1 font-mono">
          {weather.thunderstormProbability > 25 ? 'Critical lightning warning' : 'Low convective risk'}
        </div>
        <div className="text-[9px] text-white/40 mt-1.5 font-mono pt-1.5 border-t border-white/5">
          Cloud: {weather.cloudCover}%
        </div>
      </div>

      {/* 5. Atmosphere */}
      <div className="bg-[#0F1420] border border-white/10 hover:border-emerald-500/40 p-4 transition-all">
        <div className="flex items-center justify-between text-white/40 mb-2 font-mono text-[9px] uppercase tracking-widest">
          <span>ATMOSPHERE</span>
          <Droplets className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-3xl font-mono font-black text-white tracking-tight">
          {weather.humidity}%
        </div>
        <div className="text-[10px] text-white/50 mt-1 font-mono">
          Baro: {weather.pressure} hPa
        </div>
        <div className="text-[9px] text-white/40 mt-1.5 font-mono pt-1.5 border-t border-white/5">
          Altitude: {weather.elevation}m MSL
        </div>
      </div>

      {/* 6. UV & Optical Sight */}
      <div className="bg-[#0F1420] border border-white/10 hover:border-yellow-500/40 p-4 transition-all">
        <div className="flex items-center justify-between text-white/40 mb-2 font-mono text-[9px] uppercase tracking-widest">
          <span>UV & RANGE</span>
          <Sun className="w-3.5 h-3.5 text-yellow-400" />
        </div>
        <div className="text-3xl font-mono font-black text-white tracking-tight">
          {weather.uvIndex}
          <span className="text-xs text-white/50 font-normal ml-1">UV</span>
        </div>
        <div className="text-[10px] text-white/50 mt-1 font-mono">
          Sight: {weather.visibility} km
        </div>
        <div className="text-[9px] text-white/40 mt-1.5 font-mono pt-1.5 border-t border-white/5">
          {weather.uvIndex >= 6 ? 'Extreme solar shield needed' : 'Nominal UV range'}
        </div>
      </div>

    </div>
  );
};
