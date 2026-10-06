import React, { useState } from 'react';
import { getStoredMapsKey, setStoredMapsKey } from '../services/googleMapsLoader';
import { Key, X, CheckCircle, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111714] border border-white/10 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#151D18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Google Maps API Configuration
              </h2>
              <p className="text-[11px] text-white/50">
                Configure custom key for production map rendering & places search
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

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {savedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Key saved! Map instance reloading...</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
              Maps API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 bg-black/40 border border-white/10 focus:border-emerald-500 rounded-xl text-xs font-mono text-white outline-hidden"
            />
            <p className="text-[10px] font-mono text-white/40">
              A built-in demo key is active by default. Enter your own key for higher quotas.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
