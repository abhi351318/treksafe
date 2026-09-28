import React from 'react';
import { RiskFactorItem } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface RiskFactorsProps {
  factors: RiskFactorItem[];
  baseRisk: number;
}

export const RiskFactors: React.FC<RiskFactorsProps> = ({ factors, baseRisk }) => {
  return (
    <div className="bg-white border border-[#E4E0D2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E0D2] pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#243B2A] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#D7A84A]" />
            Key Trail Hazard & Weather Factors
          </h3>
          <p className="text-xs text-[#526B4F] mt-0.5">
            Breakdown of exact weather conditions raising or lowering the modeled trek risk score.
          </p>
        </div>
        <div className="text-xs font-mono bg-[#FAF8F3] px-2.5 py-1 rounded-lg border border-[#E4E0D2] text-[#526B4F]">
          Base Outdoor Baseline: {baseRisk} pts
        </div>
      </div>

      <div className="space-y-3.5">
        {factors.map((factor) => {
          const isIncrease = factor.shapValue > 0;
          const isDecrease = factor.shapValue < 0;

          // Bar width percentage relative to max impact ~30
          const barWidth = Math.min(100, Math.round((Math.abs(factor.shapValue) / 30) * 100));

          return (
            <div
              key={factor.id}
              className="p-3.5 rounded-xl border border-[#EDE9DD] hover:border-[#D5D0C0] transition-colors bg-[#FAF8F4]/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-bold ${
                      isIncrease
                        ? 'bg-[#C85A32]/15 text-[#C85A32]'
                        : isDecrease
                        ? 'bg-[#2E5A36]/15 text-[#2E5A36]'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isIncrease ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : isDecrease ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <span className="text-sm font-bold text-[#1F2520]">
                    {factor.name}
                  </span>
                  <span className="text-xs font-medium text-[#6B7262] font-mono">
                    ({factor.valueString})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      factor.impactLevel === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : factor.impactLevel === 'HIGH'
                        ? 'bg-amber-100 text-amber-900'
                        : factor.impactLevel === 'MODERATE'
                        ? 'bg-yellow-100 text-yellow-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {factor.impactLevel}
                  </span>
                  <span
                    className={`text-xs font-extrabold font-mono ${
                      isIncrease
                        ? 'text-[#C85A32]'
                        : isDecrease
                        ? 'text-[#2E5A36]'
                        : 'text-gray-500'
                    }`}
                  >
                    {factor.shapValue > 0 ? `+${factor.shapValue}` : factor.shapValue} pts
                  </span>
                </div>
              </div>

              {/* SHAP Bar Indicator */}
              <div className="w-full bg-[#E8E4D8] h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isIncrease ? 'bg-[#C85A32]' : 'bg-[#2E5A36]'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Plain English explanation */}
              <p className="text-xs text-[#526B4F] leading-normal">
                {factor.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
