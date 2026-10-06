import React from 'react';
import { TrekAnalysisResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { Bookmark, X, ArrowRight, Trash2, Printer, MapPin, Calendar, Cloud, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111714] border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-[#151D18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Archived Trail Itineraries ({savedTreks.length})
                </h2>
                {user && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <Cloud className="w-3 h-3" /> Cloud Synced
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50">
                {user ? `Securely encrypted to ${user.email}` : 'Cached in browser. Sign in for multi-device sync.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Saved Treks */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {savedTreks.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Bookmark className="w-10 h-10 text-white/20 mx-auto" />
              <h3 className="text-sm font-mono font-bold text-white">No Expeditions Saved Yet</h3>
              <p className="text-xs text-white/50 max-w-xs mx-auto">
                After inspecting any mountain trail and weather analysis, click "Bookmark Trail" to keep an offline record.
              </p>
            </div>
          ) : (
            savedTreks.map((item, idx) => {
              const riskColor =
                item.risk.band === 'VERY_LOW'
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                  : item.risk.band === 'LOW'
                  ? 'text-green-400 border-green-500/30 bg-green-500/10'
                  : item.risk.band === 'MODERATE'
                  ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                  : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] flex items-center justify-between gap-3 group transition-all"
                >
                  <div
                    onClick={() => {
                      onSelectTrek(item);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {item.trek.name}
                      </h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${riskColor}`}>
                        {item.risk.bandLabel} • {item.risk.score} pts
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-white/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-white/40" />
                        {item.date}
                      </span>
                      <span>•</span>
                      <span>{item.weather.temperature}°C</span>
                      <span>•</span>
                      <span>{item.weather.rainProbability}% Rain</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onRemoveTrek(idx)}
                      className="p-2 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectTrek(item);
                        onClose();
                      }}
                      className="p-2 text-white/60 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Load this trek"
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
        <div className="px-5 py-3 border-t border-white/10 bg-[#151D18] flex items-center justify-between">
          <button
            onClick={onExportReport}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-white/60" />
            <span>Print Dossier</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
