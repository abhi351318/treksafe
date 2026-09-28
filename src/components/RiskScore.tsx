import React from 'react';
import { RiskPrediction } from '../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Info } from 'lucide-react';

interface RiskScoreProps {
  risk: RiskPrediction;
}

export const RiskScore: React.FC<RiskScoreProps> = ({ risk }) => {
  const { score, band, bandLabel, summary, actionRecommendation } = risk;

  // Color tokens aligned with earth-tone outdoor theme
  const getBandStyles = () => {
    switch (band) {
      case 'VERY_LOW':
        return {
          bg: 'bg-[#2E5A36]/10',
          border: 'border-[#2E5A36]/30',
          text: 'text-[#244E2C]',
          ringColor: '#2E5A36',
          badgeBg: 'bg-[#2E5A36] text-white',
          icon: CheckCircle2,
          meaning: 'Very Low modeled weather risk'
        };
      case 'LOW':
        return {
          bg: 'bg-[#526B4F]/10',
          border: 'border-[#526B4F]/30',
          text: 'text-[#3B5438]',
          ringColor: '#526B4F',
          badgeBg: 'bg-[#526B4F] text-white',
          icon: ShieldCheck,
          meaning: 'Low modeled weather risk'
        };
      case 'MODERATE':
        return {
          bg: 'bg-[#D7A84A]/15',
          border: 'border-[#D7A84A]/40',
          text: 'text-[#8A6318]',
          ringColor: '#D7A84A',
          badgeBg: 'bg-[#C28F2D] text-white',
          icon: AlertTriangle,
          meaning: 'Moderate modeled weather risk'
        };
      case 'HIGH':
        return {
          bg: 'bg-[#C85A32]/10',
          border: 'border-[#C85A32]/35',
          text: 'text-[#A8431D]',
          ringColor: '#C85A32',
          badgeBg: 'bg-[#C85A32] text-white',
          icon: AlertTriangle,
          meaning: 'Elevated modeled weather risk'
        };
      case 'VERY_HIGH':
        return {
          bg: 'bg-[#991B1B]/10',
          border: 'border-[#991B1B]/30',
          text: 'text-[#991B1B]',
          ringColor: '#991B1B',
          badgeBg: 'bg-[#991B1B] text-white',
          icon: AlertOctagon,
          meaning: 'Very elevated modeled weather risk'
        };
    }
  };

  const style = getBandStyles();
  const IconComponent = style.icon;

  // SVG circular gauge calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white border border-[#E4E0D2] rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        
        {/* Left: Gauge & Score */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Background ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="text-[#EAE6D8]"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={style.ringColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#1F2520] tracking-tight">
                {score}
              </span>
              <span className="text-[10px] uppercase font-bold text-[#6B7262] tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.badgeBg}`}>
              <IconComponent className="w-3.5 h-3.5" />
              {bandLabel}
            </span>
            <div className="text-xs text-[#526B4F] font-medium">
              {style.meaning}
            </div>
            <div className="text-[11px] text-[#6B7262] font-medium">
              Calibrated Safety Band
            </div>
          </div>
        </div>

        {/* Right: Summary & Actionable Advice */}
        <div className="flex-1 w-full md:border-l md:border-[#EAE6D8] md:pl-6 space-y-2.5">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#243B2A] mb-1">
              Weather Risk Assessment
            </h4>
            <p className="text-sm font-medium text-[#1F2520] leading-relaxed">
              {summary}
            </p>
          </div>

          <div className={`p-3 rounded-xl border ${style.bg} ${style.border} flex items-start gap-2.5`}>
            <Info className={`w-4 h-4 shrink-0 mt-0.5 ${style.text}`} />
            <div>
              <span className="block text-xs font-bold text-[#1F2520]">
                Trek Recommendation:
              </span>
              <span className="text-xs text-[#2A342B] leading-normal">
                {actionRecommendation}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
