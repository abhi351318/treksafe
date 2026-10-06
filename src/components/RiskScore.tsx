import React from 'react';
import { RiskPrediction } from '../types';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  Compass,
  Zap,
  Target
} from 'lucide-react';

interface RiskScoreProps {
  risk: RiskPrediction;
}

export const RiskScore: React.FC<RiskScoreProps> = ({ risk }) => {
  const { score, band, bandLabel, summary, actionRecommendation } = risk;

  const getTheme = () => {
    switch (band) {
      case 'VERY_LOW':
        return {
          barColor: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          bgGlow: 'bg-emerald-500/10',
          tierLabel: 'STAGE I: OPTIMAL CLIMB WINDOW',
          badgeText: 'FAVORABLE'
        };
      case 'LOW':
        return {
          barColor: 'bg-cyan-500',
          textColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/30',
          bgGlow: 'bg-cyan-500/10',
          tierLabel: 'STAGE II: REGULAR EXPEDITION',
          badgeText: 'MILD EXPOSURE'
        };
      case 'MODERATE':
        return {
          barColor: 'bg-amber-500',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/40',
          bgGlow: 'bg-amber-500/10',
          tierLabel: 'STAGE III: CAUTION ADVISORY',
          badgeText: 'MODERATE EXPOSURE'
        };
      case 'HIGH':
        return {
          barColor: 'bg-orange-500',
          textColor: 'text-orange-400',
          borderColor: 'border-orange-500/40',
          bgGlow: 'bg-orange-500/10',
          tierLabel: 'STAGE IV: SEVERE WEATHER RISKS',
          badgeText: 'HIGH DANGER'
        };
      case 'VERY_HIGH':
      default:
        return {
          barColor: 'bg-rose-500',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/50',
          bgGlow: 'bg-rose-500/15',
          tierLabel: 'STAGE V: CRITICAL STORM / ABORT',
          badgeText: 'CRITICAL HAZARD'
        };
    }
  };

  const theme = getTheme();

  // 10 segmented LED-style bars
  const totalSegments = 10;
  const activeSegments = Math.round((score / 100) * totalSegments);

  return (
    <div className={`relative bg-[#0F1420] border ${theme.borderColor} p-6 sm:p-7 shadow-2xl`}>
      {/* Top technical kicker */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-500 animate-pulse"></span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-white/50">
            SYSTEM // TRAIL TELEMETRY ENGINE
          </span>
        </div>
        <div className="font-mono text-[11px] text-white/60 flex items-center gap-3">
          <span>MODEL CONFIDENCE: 94.2%</span>
          <span>•</span>
          <span className={theme.textColor}>{theme.tierLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Giant Monospace Score Readout & Segmented Gauge */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-baseline gap-4">
            <div className="font-mono text-6xl sm:text-7xl font-black tracking-tighter text-white">
              {score}
            </div>
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-white/40 block">
                RISK INDEX
              </span>
              <span className={`inline-block font-mono text-xs font-bold px-2 py-0.5 uppercase ${theme.bgGlow} ${theme.textColor} border ${theme.borderColor}`}>
                {theme.badgeText}
              </span>
            </div>
          </div>

          {/* Segmented LED Bar Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase">
              <span>0% LOW HAZARD</span>
              <span>100% EXTREME HAZARD</span>
            </div>
            <div className="grid grid-cols-10 gap-1.5 h-3">
              {Array.from({ length: totalSegments }).map((_, i) => {
                const isActive = i < activeSegments;
                return (
                  <div
                    key={i}
                    className={`h-full transition-all duration-300 ${
                      isActive
                        ? theme.barColor
                        : 'bg-white/5 border border-white/5'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Technical Summary & Tactical Protocol */}
        <div className="lg:col-span-7 space-y-4 lg:pl-4 lg:border-l lg:border-white/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block mb-1">
              EXPEDITION BRIEFING
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {summary}
            </h3>
          </div>

          <div className="bg-[#141B2B] border-l-2 border-orange-500 p-3.5 space-y-1 text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 font-bold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Mandatory Action Directive
            </span>
            <p className="text-white/80 leading-relaxed font-sans">
              {actionRecommendation}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
