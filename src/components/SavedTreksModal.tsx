import React from 'react';
import { TrekAnalysisResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { Bookmark, X, ArrowRight, Trash2, Printer, Cloud } from 'lucide-react';

interface SavedTreksModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTreks: TrekAnalysisResult[];
  onSelectTrek: (item: TrekAnalysisResult) => void;
  onRemoveTrek: (index: number) => void;
  onExportReport: () => void;
}

export const SavedTreksModal: React.FC<SavedTreksModalProps> = ({
  isOpen,
  onClose,
  savedTreks,
  onSelectTrek,
  onRemoveTrek,
  onExportReport
}) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E4E0D2] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#243B2A]">
                Saved Trail Plans ({savedTreks.length})
              </h2>
              {user && (
                <span className="text-[11px] font-medium text-[#2E5A36] bg-[#EBF3EC] px-2 py-0.5 rounded-full border border-[#C5DEC9] inline-flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Synced
                </span>
              )}
            </div>
            <p className="text-xs text-[#526B4F]">
              Reopen saved weather & risk analyses anytime
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE6D8] text-[#526B4F] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {savedTreks.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Bookmark className="w-10 h-10 text-[#C4BFB0] mx-auto" />
              <h3 className="text-sm font-bold text-[#243B2A]">No Saved Trails Yet</h3>
              <p className="text-xs text-[#6B7262] max-w-xs mx-auto">
                Click "Save Trail" on any analysis to keep a bookmark for quick reference.
              </p>
            </div>
          ) : (
            savedTreks.map((item, idx) => {
              const riskColor =
                item.risk.band === 'VERY_LOW'
                  ? 'text-[#2E5A36] border-[#C5DEC9] bg-[#EBF3EC]'
                  : item.risk.band === 'LOW'
                  ? 'text-[#243B2A] border-[#D1DDD0] bg-[#EEF3EE]'
                  : item.risk.band === 'MODERATE'
                  ? 'text-[#8C6414] border-[#EEDCA8] bg-[#FDF8E8]'
                  : 'text-[#991B1B] border-[#F5C2C2] bg-[#FDECEC]';

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#E4E0D2] hover:border-[#526B4F] bg-[#FAF8F3] flex items-center justify-between gap-3 group transition-all"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTrek(item);
                      onClose();
                    }}
                    className="flex-1 text-left cursor-pointer space-y-1 min-w-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-[#1F2520] group-hover:text-[#243B2A] transition-colors truncate">
                        {item.trek.name}
                      </h4>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold tabular-nums ${riskColor}`}
                      >
                        {item.risk.bandLabel} · {item.risk.score}/100
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#6B7262] tabular-nums">
                      <span>{item.date}</span>
                      <span>·</span>
                      <span>{item.weather.temperature}°C</span>
                      <span>·</span>
                      <span>{item.weather.rainProbability}% rain</span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRemoveTrek(idx)}
                      className="p-2 rounded-lg text-[#8C8675] hover:text-[#991B1B] hover:bg-[#FDECEC] transition-colors cursor-pointer"
                      title="Delete Saved Trail"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTrek(item);
                        onClose();
                      }}
                      className="p-2 rounded-lg text-[#526B4F] hover:text-[#243B2A] hover:bg-[#EAE6D8] transition-colors cursor-pointer"
                      title="Open Trail"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <button
            type="button"
            onClick={onExportReport}
            className="px-3.5 py-2 bg-white hover:bg-[#EAE6D8] border border-[#D5D0C0] text-[#243B2A] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#526B4F]" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
