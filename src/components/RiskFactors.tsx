import React from 'react';
import { RiskFactorItem } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, Cpu, Activity } from 'lucide-react';

interface RiskFactorsProps {
  factors: RiskFactorItem[];
  baseRisk: number;
}

export const RiskFactors: React.FC<RiskFactorsProps> = ({ factors, baseRisk }) => {
  return (
    <div className="bg-[#0F1420] border border-white/10 p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-orange-400 font-bold block">
            FEATURE EXPLAINABILITY // SHAP ATTRIBUTION
          </span>
          <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
            Atmospheric Stress Variables
          </h3>
          <p className="text-xs text-white/50">
            Decomposed impact weights calculated by the calibrated risk model.
          </p>
        </div>
        <div className="text-xs font-mono bg-[#141B2B] px-3 py-1 border border-white/10 text-orange-400">
          Base Terrain Baseline: {baseRisk} PTS
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
              className="p-4 border border-white/5 hover:border-white/20 transition-all bg-[#101522] flex flex-col justify-between space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-[10px] font-mono font-bold ${
                      isIncrease
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isDecrease
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 text-white/60'
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
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {factor.name}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      Reading: {factor.valueString}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isIncrease
                        ? 'text-rose-400'
                        : isDecrease
                        ? 'text-emerald-400'
                        : 'text-white/60'
                    }`}
                  >
                    {factor.shapValue > 0 ? `+${factor.shapValue}` : factor.shapValue} PTS
                  </span>
                </div>
              </div>

              {/* Attribution Bar */}
              <div className="h-1.5 w-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full ${
                    isIncrease ? 'bg-rose-500' : isDecrease ? 'bg-emerald-500' : 'bg-white/40'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                {factor.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
