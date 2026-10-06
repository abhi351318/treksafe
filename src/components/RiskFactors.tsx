import React from 'react';
import { RiskFactorItem } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, ShieldAlert, Cpu } from 'lucide-react';

interface RiskFactorsProps {
  factors: RiskFactorItem[];
  baseRisk: number;
}

export const RiskFactors: React.FC<RiskFactorsProps> = ({ factors, baseRisk }) => {
  return (
    <div className="bg-[#111714] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Machine Learning Hazard Attribution (SHAP Vectors)
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Individual weather parameters mathematically increasing (+) or mitigating (-) trail risk.
          </p>
        </div>
        <div className="text-xs font-mono bg-white/5 px-2.5 py-1 rounded-md border border-white/10 text-emerald-400">
          Prior Geographic Baseline: {baseRisk} pts
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
              className="p-3.5 rounded-xl border border-white/5 hover:border-white/15 transition-all bg-white/[0.02] flex flex-col justify-between space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-mono font-bold ${
                      isIncrease
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : isDecrease
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
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
                      Telemetry: {factor.valueString}
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
                    {factor.shapValue > 0 ? `+${factor.shapValue}` : factor.shapValue} pts
                  </span>
                </div>
              </div>

              {/* Attribution Bar */}
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isIncrease ? 'bg-rose-400' : isDecrease ? 'bg-emerald-400' : 'bg-white/40'
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
