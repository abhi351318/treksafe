import React from 'react';
import { RiskFactorItem } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, Sliders } from 'lucide-react';

interface RiskFactorsProps {
  factors: RiskFactorItem[];
  baseRisk: number;
}

export const RiskFactors: React.FC<RiskFactorsProps> = ({ factors, baseRisk }) => {
  return (
    <div className="bg-white border border-[#E4E0D2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6D8] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#526B4F]">
            <Sliders className="w-3.5 h-3.5 text-[#243B2A]" />
            <span>ML Feature Attribution</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#243B2A] mt-0.5">
            Key Risk Factors Breakdown
          </h3>
          <p className="text-xs text-[#6B7262]">
            Explainable weather & terrain contributions driving the final trail risk score.
          </p>
        </div>

        <div className="text-xs font-semibold bg-[#FAF8F3] px-3 py-1.5 rounded-xl border border-[#E4E0D2] text-[#243B2A] tabular-nums">
          Base Trail Risk: {baseRisk} pts
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {factors.map((factor) => {
          const isIncrease = factor.shapValue > 0;
          const isDecrease = factor.shapValue < 0;
          const barWidth = Math.min(100, Math.round((Math.abs(factor.shapValue) / 30) * 100));

          return (
            <div
              key={factor.id}
              className="p-4 rounded-xl border border-[#E4E0D2] bg-[#FAF8F3] hover:border-[#526B4F] transition-all flex flex-col justify-between space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                      isIncrease
                        ? 'bg-[#FCEEE8] text-[#C85A32] border border-[#F2C9B9]'
                        : isDecrease
                        ? 'bg-[#EBF3EC] text-[#2E5A36] border border-[#C5DEC9]'
                        : 'bg-[#EAE6D8] text-[#526B4F]'
                    }`}
                  >
                    {isIncrease ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : isDecrease ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-[#1F2520] block">
                      {factor.name}
                    </span>
                    <span className="text-xs text-[#6B7262]">
                      Observed: {factor.valueString}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold font-mono tabular-nums shrink-0 ${
                    isIncrease
                      ? 'text-[#C85A32]'
                      : isDecrease
                      ? 'text-[#2E5A36]'
                      : 'text-[#6B7262]'
                  }`}
                >
                  {factor.shapValue > 0 ? `+${factor.shapValue}` : factor.shapValue} pts
                </span>
              </div>

              <div className="h-1.5 w-full bg-[#EAE6D8] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isIncrease ? 'bg-[#C85A32]' : isDecrease ? 'bg-[#2E5A36]' : 'bg-[#8C8675]'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <p className="text-xs text-[#526B4F] leading-relaxed">
                {factor.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
