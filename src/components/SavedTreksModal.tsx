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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E4E0D2] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#243B2A] text-white flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-[#D7A84A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#243B2A] uppercase tracking-wider">
                  Saved Trail Itineraries ({savedTreks.length})
                </h2>
                {user && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <Cloud className="w-3 h-3" /> Cloud Synced
                  </span>
                )}
              </div>
              <p className="text-xs text-[#526B4F]">
                {user ? `Linked to ${user.email}` : 'Stored locally. Sign in to sync across devices.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE6D8] text-[#526B4F] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {savedTreks.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#6B7262]">
              <Bookmark className="w-8 h-8 mx-auto text-[#D5D0C0] mb-2" />
              <p className="font-semibold text-[#243B2A] mb-1">No Saved Treks Yet</p>
              <p>Click "Save Itinerary" on any analyzed trek to compare dates and weather risks.</p>
            </div>
          ) : (
            savedTreks.map((item, index) => {
              const bandColor =
                item.risk.score >= 60 ? 'text-[#C85A32] bg-[#C85A32]/10' :
                item.risk.score >= 40 ? 'text-[#8A6318] bg-[#D7A84A]/20' :
                'text-[#2E5A36] bg-[#2E5A36]/10';

              return (
                <div
                  key={`${item.trek.id}-${item.date}-${index}`}
                  className="p-3.5 rounded-xl border border-[#EAE6D8] hover:border-[#243B2A]/40 transition-colors bg-[#FAF8F3]/50 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1F2520] truncate">
                        {item.trek.name}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${bandColor}`}>
                        Score {item.risk.score}/100
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#526B4F] mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#6B7262]" />
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
                      onClick={() => {
                        onSelectTrek(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#243B2A] text-white hover:bg-[#1A2C1F] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRemoveTrek(index)}
                      className="p-1.5 hover:bg-red-50 text-[#8C8675] hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <button
            onClick={onExportReport}
            className="text-xs text-[#243B2A] hover:underline flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Safety Summary
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
