import React from 'react';
import { COMPREHENSIVE_TREKS } from '../services/trekPresets';
import { TrekLocation } from '../types';
import { X, ChevronRight, Compass } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0F1420] border border-white/10 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-[#141B2B] flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-orange-400 font-bold block">
              GLOBAL TRAIL CATALOG
            </span>
            <h2 className="font-display text-base font-bold text-white tracking-tight mt-0.5">
              Summit & Mountain Index
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trail Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {COMPREHENSIVE_TREKS.map((trek) => (
            <div
              key={trek.id}
              onClick={() => {
                onSelectTrek(trek);
                onClose();
              }}
              className="p-3.5 border border-white/5 hover:border-orange-500/40 bg-[#141B2B] hover:bg-orange-500/[0.04] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase">
                  <span className="text-orange-400 font-bold">{trek.trailDifficulty || 'MODERATE'}</span>
                  <span>{trek.elevation}M MSL</span>
                </div>
                <h4 className="font-display text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                  {trek.name}
                </h4>
                <p className="text-[11px] text-white/50 line-clamp-1 font-mono">
                  {trek.region}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/5 text-[9px] font-mono">
                <span className="text-white/40">
                  {trek.trailLengthKm ? `${trek.trailLengthKm} KM ROUTE` : 'SUMMIT ASCENT'}
                </span>
                <span className="text-orange-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                  INSPECT <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#141B2B] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono cursor-pointer transition-colors"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
