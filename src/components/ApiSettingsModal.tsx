import React, { useState } from 'react';
import { getStoredMapsKey, setStoredMapsKey } from '../services/googleMapsLoader';
import { Key, X, CheckCircle } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated
}) => {
  const [apiKey, setApiKey] = useState(getStoredMapsKey());
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredMapsKey(apiKey.trim());
    setSavedNotice(true);
    onKeyUpdated();
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0F1420] border border-white/10 w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#141B2B] flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-orange-400 font-bold block">
              SATELLITE TELEMETRY CONFIG
            </span>
            <h2 className="font-display text-base font-bold text-white tracking-tight mt-0.5">
              Google Maps API Key
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {savedNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Key saved! Map viewport reloading...</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/60">
              API CREDENTIAL STRING
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 bg-[#090D15] border border-white/10 focus:border-orange-500 text-xs font-mono text-white outline-hidden"
            />
            <p className="text-[10px] font-mono text-white/40">
              A public demonstration key is loaded by default. Input your GCP key for production quotas.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 text-white/60 hover:text-white text-xs font-mono cursor-pointer"
            >
              DISCARD
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-mono font-bold text-xs uppercase cursor-pointer transition-colors"
            >
              COMMIT KEY
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
