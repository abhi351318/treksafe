import React, { useState } from 'react';
import { getStoredMapsKey, setStoredMapsKey, DEFAULT_GOOGLE_MAPS_KEY } from '../services/googleMapsLoader';
import { Key, Check, X, Shield, RefreshCw } from 'lucide-react';

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
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredMapsKey(apiKey.trim());
    setSavedSuccess(true);
    onKeyUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    setApiKey(DEFAULT_GOOGLE_MAPS_KEY);
    setStoredMapsKey(DEFAULT_GOOGLE_MAPS_KEY);
    onKeyUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E4E0D2] rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#243B2A] text-[#D7A84A] flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#243B2A] uppercase tracking-wider">
                Google Maps API Configuration
              </h2>
              <p className="text-xs text-[#526B4F]">
                Active key & places autocomplete
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
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#243B2A] mb-1.5">
              Google Maps JavaScript API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-mono text-[#1F2520] outline-hidden"
            />
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-[#526B4F]">
              <span>Active key provided</span>
              <button
                type="button"
                onClick={handleReset}
                className="hover:text-[#243B2A] underline cursor-pointer"
              >
                Reset to default
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#EAE6D8] text-xs text-[#526B4F] flex items-start gap-2">
            <Shield className="w-4 h-4 text-[#D7A84A] shrink-0 mt-0.5" />
            <p>
              Your key powers the interactive terrain map, trailhead marker, and Google Places autocomplete search across global mountain trails.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-[#526B4F] hover:text-[#1F2520] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Saved
                </>
              ) : (
                'Save Key'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
