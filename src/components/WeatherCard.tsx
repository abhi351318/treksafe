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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Temperature */}
      <div className="bg-[#111714] border border-white/10 hover:border-emerald-500/30 rounded-xl p-3.5 transition-all group">
        <div className="flex items-center justify-between text-white/50 mb-2 font-mono text-[10px] uppercase tracking-wider">
          <span>Ambient Temp</span>
          <Thermometer className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
          {weather.temperature}°<span className="text-sm text-white/50 font-normal">C</span>
        </div>
        <div className="text-[11px] text-emerald-400/90 mt-1 font-mono">
          Feels like {weather.feelsLike}°C
        </div>
        <div className="text-[10px] text-white/40 mt-1 font-mono flex items-center justify-between border-t border-white/5 pt-1">
          <span>L: {weather.tempMin}°</span>
          <span>H: {weather.tempMax}°</span>
        </div>
      </div>

      {/* 2. Precipitation */}
      <div className="bg-[#111714] border border-white/10 hover:border-blue-500/30 rounded-xl p-3.5 transition-all group">
        <div className="flex items-center justify-between text-white/50 mb-2 font-mono text-[10px] uppercase tracking-wider">
          <span>Precipitation</span>
          <CloudRain className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
          {weather.rainProbability}%
        </div>
        <div className="text-[11px] text-blue-400/90 mt-1 font-mono truncate">
          {weather.rainAmount > 0 ? `${weather.rainAmount} mm volume` : 'Dry conditions'}
        </div>
        <div className="text-[10px] text-white/40 mt-1 font-mono truncate border-t border-white/5 pt-1">
          {weather.conditionLabel}
        </div>
      </div>

      {/* 3. Wind & Gusts */}
      <div className="bg-[#111714] border border-white/10 hover:border-teal-500/30 rounded-xl p-3.5 transition-all group">
        <div className="flex items-center justify-between text-white/50 mb-2 font-mono text-[10px] uppercase tracking-wider">
          <span>Wind & Gusts</span>
          <Wind className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
          {weather.windSpeed}<span className="text-xs text-white/50 font-normal ml-0.5">km/h</span>
        </div>
        <div className="text-[11px] text-teal-400/90 mt-1 font-mono">
          Gusts up to {weather.windGust} km/h
        </div>
        <div className="text-[10px] text-white/40 mt-1 font-mono border-t border-white/5 pt-1">
          Dir: {weather.windDirection}° Azimuth
        </div>
      </div>

      {/* 4. Thunderstorm Hazard */}
      <div className="bg-[#111714] border border-white/10 hover:border-amber-500/30 rounded-xl p-3.5 transition-all group">
        <div className="flex items-center justify-between text-white/50 mb-2 font-mono text-[10px] uppercase tracking-wider">
          <span>Storm Hazard</span>
          <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className={`text-2xl font-extrabold font-mono tracking-tight ${weather.thunderstormProbability > 25 ? 'text-red-400' : 'text-white'}`}>
          {weather.thunderstormProbability}%
        </div>
        <div className="text-[11px] text-white/60 mt-1 font-mono">
          {weather.thunderstormProbability > 25 ? 'High lightning alert' : 'Sub-critical index'}
        </div>
        <div className="text-[10px] text-white/40 mt-1 font-mono border-t border-white/5 pt-1">
          Cloud: {weather.cloudCover}%
        </div>
      </div>

      {/* 5. Humidity & Pressure */}
      <div className="bg-[#111714] border border-white/10 hover:border-emerald-500/30 rounded-xl p-3.5 transition-all group">
        <div className="flex items-center justify-between text-white/50 mb-2 font-mono text-[10px] uppercase tracking-wider">
          <span>Atmosphere</span>
          <Droplets className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
          {weather.humidity}%
        </div>
        <div className="text-[11px] text-white/60 mt-1 font-mono">
          Pressure {weather.pressure} hPa
        </div>
        <div className="text-[10px] text-white/40 mt-1 font-mono border-t border-white/5 pt-1">
          Altitude: {weather.elevation}m MSL
        </div>
      </div>

      {/* 6. Visibility & UV */}
      <div className="bg-[#111714] border border-white/10 hover:border-yellow-500/30 rounded-xl p-3.5 transition-all group">
        <div className="flex items-center justify-between text-white/50 mb-2 font-mono text-[10px] uppercase tracking-wider">
          <span>UV & Sight</span>
          <Sun className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
          {weather.uvIndex}<span className="text-xs text-white/50 font-normal ml-0.5">UV</span>
        </div>
        <div className="text-[11px] text-white/60 mt-1 font-mono">
          Sight {weather.visibility} km
        </div>
        <div className="text-[10px] text-white/40 mt-1 font-mono border-t border-white/5 pt-1">
          {weather.uvIndex >= 6 ? 'Intense solar exposure' : 'Nominal exposure'}
        </div>
      </div>

    </div>
  );
};
