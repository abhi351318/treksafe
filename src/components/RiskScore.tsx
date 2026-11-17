import React from 'react';
import { RiskPrediction } from '../types';
import { CheckCircle, AlertTriangle, ShieldAlert, Compass } from 'lucide-react';

interface RiskScoreProps {
  risk: RiskPrediction;
}

export const RiskScore: React.FC<RiskScoreProps> = ({ risk }) => {
  const { score, band, bandLabel, summary, actionRecommendation } = risk;

  const getTheme = () => {
    switch (band) {
      case 'VERY_LOW':
        return {
          stroke: '#2E5A36',
          badgeBg: 'bg-[#EBF3EC]',
          badgeText: 'text-[#2E5A36]',
          border: 'border-[#C5DEC9]',
          label: bandLabel || 'Very Low Risk',
          icon: <CheckCircle className="w-4 h-4 text-[#2E5A36]" />
        };
      case 'LOW':
        return {
          stroke: '#526B4F',
          badgeBg: 'bg-[#EEF3EE]',
          badgeText: 'text-[#243B2A]',
          border: 'border-[#D1DDD0]',
          label: bandLabel || 'Low Risk',
          icon: <CheckCircle className="w-4 h-4 text-[#526B4F]" />
        };
      case 'MODERATE':
        return {
          stroke: '#D7A84A',
          badgeBg: 'bg-[#FDF8E8]',
          badgeText: 'text-[#8C6414]',
          border: 'border-[#EEDCA8]',
          label: bandLabel || 'Moderate Risk',
          icon: <AlertTriangle className="w-4 h-4 text-[#C28F2D]" />
        };
      case 'HIGH':
        return {
          stroke: '#C85A32',
          badgeBg: 'bg-[#FCEEE8]',
          badgeText: 'text-[#A0411E]',
          border: 'border-[#F2C9B9]',
          label: bandLabel || 'High Risk',
          icon: <AlertTriangle className="w-4 h-4 text-[#C85A32]" />
        };
      case 'VERY_HIGH':
      default:
        return {
          stroke: '#991B1B',
          badgeBg: 'bg-[#FDECEC]',
          badgeText: 'text-[#991B1B]',
          border: 'border-[#F5C2C2]',
          label: bandLabel || 'Very High Risk',
          icon: <ShieldAlert className="w-4 h-4 text-[#991B1B]" />
        };
    }
  };

  const theme = getTheme();
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="bg-white border border-[#E4E0D2] rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Circular Earth-Tone Risk Gauge */}
        <div className="lg:col-span-4 flex items-center gap-5">
          <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#EAE6D8"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={theme.stroke}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-[#1F2520] tabular-nums">
                {score}
              </span>
              <span className="text-[11px] font-medium text-[#6B7262]">of 100</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7262]">
              Weather Risk Index
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeBg} ${theme.badgeText} ${theme.border}`}
            >
              {theme.icon}
              <span>{theme.label}</span>
            </div>
            <p className="text-xs text-[#6B7262]">
              Calibrated trail hazard score from precipitation, wind, storm & altitude exposure.
            </p>
          </div>
        </div>

        {/* Right: Assessment Summary & Recommendation */}
        <div className="lg:col-span-8 space-y-3 lg:border-l lg:border-[#EAE6D8] lg:pl-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#526B4F] mb-1">
              Trail Safety Briefing
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#243B2A] leading-snug">
              {summary}
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E4E0D2] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#243B2A] text-[#D7A84A] flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#243B2A]">Recommended Action</div>
              <p className="text-xs sm:text-sm text-[#526B4F] leading-relaxed">
                {actionRecommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
