import React from 'react';
import { RiskPrediction } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Activity,
  Compass,
  Radio,
  Flame,
  Wind
} from 'lucide-react';

interface RiskScoreProps {
  risk: RiskPrediction;
}

export const RiskScore: React.FC<RiskScoreProps> = ({ risk }) => {
  const { score, band, bandLabel, summary, actionRecommendation } = risk;

  const getBandConfig = () => {
    switch (band) {
      case 'VERY_LOW':
        return {
          glow: 'shadow-[0_0_35px_rgba(52,211,153,0.18)]',
          border: 'border-emerald-500/30',
          accent: 'text-emerald-400',
          bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          barColor: 'bg-emerald-400',
          icon: CheckCircle2,
          levelText: 'EXCELLENT CLEARANCE'
        };
      case 'LOW':
        return {
          glow: 'shadow-[0_0_35px_rgba(74,222,128,0.15)]',
          border: 'border-green-500/30',
          accent: 'text-green-400',
          bgBadge: 'bg-green-500/10 text-green-300 border-green-500/20',
          barColor: 'bg-green-400',
          icon: ShieldCheck,
          levelText: 'ROUTINE EXPEDITION'
        };
      case 'MODERATE':
        return {
          glow: 'shadow-[0_0_35px_rgba(251,191,36,0.18)]',
          border: 'border-amber-500/30',
          accent: 'text-amber-400',
          bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          barColor: 'bg-amber-400',
          icon: AlertTriangle,
          levelText: 'HEIGHTENED VIGILANCE'
        };
      case 'HIGH':
        return {
          glow: 'shadow-[0_0_35px_rgba(249,115,22,0.22)]',
          border: 'border-orange-500/40',
          accent: 'text-orange-400',
          bgBadge: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
          barColor: 'bg-orange-400',
          icon: AlertTriangle,
          levelText: 'SEVERE WEATHER THREAT'
        };
      case 'VERY_HIGH':
      default:
        return {
          glow: 'shadow-[0_0_40px_rgba(239,68,68,0.28)]',
          border: 'border-red-500/40',
          accent: 'text-red-400',
          bgBadge: 'bg-red-500/10 text-red-300 border-red-500/20',
          barColor: 'bg-red-400',
          icon: AlertOctagon,
          levelText: 'HIGH RISK • RETREAT ADVISED'
        };
    }
  };

  const config = getBandConfig();
  const Icon = config.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#111714] border ${config.border} p-5 sm:p-7 ${config.glow} transition-all`}>
      {/* Background technical grid watermark */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
        <Radio className="w-44 h-44 text-white" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Dial / Score Gauge */}
        <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-white/10 pb-5 lg:pb-0 lg:pr-6">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
            {/* SVG Radial Meter */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                strokeLinecap="round"
                className={`${config.accent} transition-all duration-700 ease-out`}
              />
            </svg>

            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {score}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                / 100 PTS
              </span>
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex w-2 h-2 rounded-full animate-pulse bg-emerald-400"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                AI TELEMETRY MODEL
              </span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${config.bgBadge}`}>
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{bandLabel}</span>
            </div>

            <p className="text-[11px] font-mono text-white/40">
              {config.levelText}
            </p>
          </div>
        </div>

        {/* Center / Right: Action Directive & Rationale */}
        <div className="lg:col-span-8 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-white/50 font-mono">
              <span className="flex items-center gap-1.5 text-white/80">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                TACTICAL TRAIL ASSESSMENT
              </span>
              <span className="text-[11px]">CALIBRATED v2.4</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {summary}
            </h3>
          </div>

          {/* Operational Action Box */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-mono uppercase text-[10px] tracking-wider text-emerald-400 font-bold block">
                Field Recommendation & Protocol
              </span>
              <p className="text-white/80 leading-relaxed font-sans text-xs">
                {actionRecommendation}
              </p>
            </div>
          </div>

          {/* Calibrated Probability Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
              <span>0 LOW EXPOSURE</span>
              <span className="text-white/60">HAZARD COEFFICIENT: {score}%</span>
              <span>100 EXTREME</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
                style={{ width: `${Math.max(4, score)}%` }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
