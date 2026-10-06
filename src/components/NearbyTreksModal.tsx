import React from 'react';
import { COMPREHENSIVE_TREKS } from '../services/trekPresets';
import { TrekLocation } from '../types';
import { Navigation, X, Mountain, MapPin, Compass, ChevronRight } from 'lucide-react';

interface NearbyTreksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrek: (trek: TrekLocation) => void;
}

export const NearbyTreksModal: React.FC<NearbyTreksModalProps> = ({
  isOpen,
  onClose,
  onSelectTrek
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111714] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-[#151D18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Regional Mountain Directory
              </h2>
              <p className="text-[11px] text-white/50">
                Explore cataloged high-altitude summits, rock monoliths, and ridge circuits
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

        {/* Trail Catalog List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMPREHENSIVE_TREKS.map((trek) => (
            <div
              key={trek.id}
              onClick={() => {
                onSelectTrek(trek);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-white/5 hover:border-emerald-500/40 bg-white/[0.02] hover:bg-emerald-500/[0.04] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span className="uppercase text-emerald-400 font-bold">{trek.trailDifficulty || 'MODERATE'}</span>
                  <span>{trek.elevation}m MSL</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {trek.name}
                </h4>
                <p className="text-[11px] text-white/50 line-clamp-1">
                  {trek.region}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/5 text-[10px] font-mono">
                <span className="text-white/40">
                  {trek.trailLengthKm ? `${trek.trailLengthKm} km mapped path` : 'Peak Route'}
                </span>
                <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                  Load <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#151D18] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
