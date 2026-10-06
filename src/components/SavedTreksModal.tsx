import React from 'react';
import { TrekAnalysisResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { Bookmark, X, ArrowRight, Trash2, Printer, Calendar, Cloud } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0F1420] border border-white/10 w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-[#141B2B] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-widest uppercase text-orange-400 font-bold">
                EXPEDITION ARCHIVE
              </span>
              {user && (
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 border border-emerald-500/20">
                  CLOUD SYNC
                </span>
              )}
            </div>
            <h2 className="font-display text-base font-bold text-white tracking-tight mt-0.5">
              Saved Trail Itineraries ({savedTreks.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Saved Treks */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {savedTreks.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Bookmark className="w-10 h-10 text-white/20 mx-auto" />
              <h3 className="font-display text-sm font-bold text-white">No Expeditions Archived</h3>
              <p className="text-xs text-white/40 max-w-xs mx-auto">
                After inspecting any mountain trail and weather analysis, click "Archive Route" to keep a persistent record.
              </p>
            </div>
          ) : (
            savedTreks.map((item, idx) => {
              const riskColor =
                item.risk.band === 'VERY_LOW'
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                  : item.risk.band === 'LOW'
                  ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                  : item.risk.band === 'MODERATE'
                  ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                  : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

              return (
                <div
                  key={idx}
                  className="p-3.5 border border-white/5 hover:border-white/20 bg-[#141B2B] flex items-center justify-between gap-3 group transition-all"
                >
                  <div
                    onClick={() => {
                      onSelectTrek(item);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                        {item.trek.name}
                      </h4>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 border font-bold ${riskColor}`}>
                        {item.risk.bandLabel} • {item.risk.score} PTS
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-white/50">
                      <span>DATE: {item.date}</span>
                      <span>•</span>
                      <span>{item.weather.temperature}°C</span>
                      <span>•</span>
                      <span>{item.weather.rainProbability}% RAIN</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onRemoveTrek(idx)}
                      className="p-2 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Route"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectTrek(item);
                        onClose();
                      }}
                      className="p-2 text-white/60 hover:text-orange-400 hover:bg-orange-500/10 transition-colors cursor-pointer"
                      title="Load this route"
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
        <div className="px-5 py-3 border-t border-white/10 bg-[#141B2B] flex items-center justify-between">
          <button
            onClick={onExportReport}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-white/60" />
            <span>PRINT DOSSIER</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-orange-500 hover:bg-orange-400 text-black text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            DONE
          </button>
        </div>

      </div>
    </div>
  );
};
