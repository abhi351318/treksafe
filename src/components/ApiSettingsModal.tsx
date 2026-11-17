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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E4E0D2] rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#243B2A] text-[#D7A84A] flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#243B2A]">Google Maps API Key</h2>
              <p className="text-xs text-[#526B4F]">Configure map & place lookup key</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE6D8] text-[#526B4F] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {savedNotice && (
            <div className="p-3 rounded-xl bg-[#EBF3EC] border border-[#C5DEC9] text-[#2E5A36] text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>API key saved! Reloading map view...</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#243B2A]">
              Maps JavaScript API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-sm font-mono text-[#1F2520] outline-hidden"
            />
            <p className="text-xs text-[#6B7262]">
              A default key is pre-configured for demonstration. Enter your own key if needed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#D5D0C0] bg-white hover:bg-[#EAE6D8] text-[#526B4F] rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
