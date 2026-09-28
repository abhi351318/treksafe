import React, { useState, useEffect } from 'react';
import { WeatherData } from '../types';
import {
  CheckSquare,
  Square,
  ShieldAlert,
  Backpack,
  Compass,
  HeartPulse,
  Sun,
  CloudRain,
  Wind,
  Layers,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface TrekChecklistProps {
  weather: WeatherData;
  trailName: string;
}

interface ChecklistItem {
  id: string;
  category: 'Essentials' | 'Weather-Specific' | 'Safety & Navigation' | 'Trail Sustenance';
  title: string;
  description: string;
  isPriority?: boolean;
}

export const TrekChecklist: React.FC<TrekChecklistProps> = ({ weather, trailName }) => {
  // Weather-adaptive major requirements
  const isRainy = weather.rainProbability >= 40 || weather.rainAmount > 1.0;
  const isCold = weather.feelsLike < 12;
  const isHot = weather.feelsLike > 26;
  const isHighWind = weather.windSpeed > 30 || weather.windGust > 40;
  const isStormRisk = weather.thunderstormProbability > 25;

  const getMajorItems = (): ChecklistItem[] => {
    const items: ChecklistItem[] = [
      // 1. Core Essentials (Must have for all mountain treks)
      {
        id: 'water',
        category: 'Trail Sustenance',
        title: isHot ? 'Hydration (3.0L Water + Electrolytes)' : 'Hydration Reservoir (2.0L - 2.5L Water)',
        description: isHot
          ? 'High temperatures require oral rehydration salts & min 3 liters of water.'
          : 'Essential hydration bladder or insulated flasks for sustained summit push.',
        isPriority: true
      },
      {
        id: 'boots',
        category: 'Essentials',
        title: 'Trekking Footwear & Anti-Blister Socks',
        description: isRainy
          ? 'Waterproof high-traction lug boots with deep grip for slick muddy terrain.'
          : 'Broken-in ankle-support trail hiking shoes with merino wool socks.',
        isPriority: true
      },
      {
        id: 'navigation',
        category: 'Safety & Navigation',
        title: 'Offline Trail Map & Backup Power Bank',
        description: 'Downloaded offline topo maps + 10,000mAh battery pack for phone navigation.',
        isPriority: true
      },
      {
        id: 'firstaid',
        category: 'Safety & Navigation',
        title: 'Compact Trail First-Aid & Blister Kit',
        description: 'Bandages, antiseptic wipes, blister moleskin, elastic crepe wrap, and personal meds.',
        isPriority: true
      },
      {
        id: 'headlamp',
        category: 'Safety & Navigation',
        title: 'Headlamp with Spare Batteries',
        description: 'Hands-free 250+ lumen illumination in case trail descent stretches past sunset.'
      }
    ];

    // 2. Weather-Condition Adaptive Essentials
    if (isRainy || isStormRisk) {
      items.push({
        id: 'raingear',
        category: 'Weather-Specific',
        title: 'Waterproof Hardshell Jacket & Backpack Rain Cover',
        description: `${weather.rainProbability}% rain forecast (${weather.rainAmount}mm). Keep core and spare dry clothes sealed in dry bags.`,
        isPriority: true
      });
    }

    if (isCold) {
      items.push({
        id: 'insulation',
        category: 'Weather-Specific',
        title: 'Thermal Base Layer & Fleece/Down Jacket',
        description: `Apparent temperature drops to ${weather.feelsLike}°C. High hypothermia hazard if wet without windproof insulation.`,
        isPriority: true
      });
    }

    if (isHot || weather.uvIndex >= 6) {
      items.push({
        id: 'sunprotection',
        category: 'Weather-Specific',
        title: 'High-SPF Sunscreen (50+), UV Sunglasses & Wide Brim Hat',
        description: `UV index modeled at ${weather.uvIndex} with solar reflection at high elevation.`,
        isPriority: false
      });
    }

    if (isHighWind) {
      items.push({
        id: 'windprotection',
        category: 'Weather-Specific',
        title: 'Wind-Blocking Outer Shell & Neck Buff',
        description: `Peak ridge gusts of ${weather.windGust} km/h require windstopper fabric to prevent rapid convective heat loss.`,
        isPriority: true
      });
    }

    // 3. High Energy Trail Snacks
    items.push({
      id: 'nutrition',
      category: 'Trail Sustenance',
      title: 'High-Calorie Trail Rations (Nuts, Energy Bars & Dates)',
      description: 'Minimum 1,200 - 1,800 kcal of quick-digest fuel for sustained elevation gain.',
      isPriority: false
    });

    // 4. Trekking poles (strongly recommended for elevation)
    items.push({
      id: 'poles',
      category: 'Essentials',
      title: 'Adjustable Trekking Poles',
      description: 'Relieves up to 25% of knee joint impact during steep switchbacks and slippery descents.',
      isPriority: false
    });

    return items;
  };

  const [checklist, setChecklist] = useState<ChecklistItem[]>(getMajorItems());
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('treksafe_checklist_state');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Re-evaluate list whenever weather conditions change
  useEffect(() => {
    setChecklist(getMajorItems());
  }, [weather.rainProbability, weather.feelsLike, weather.windGust, weather.uvIndex]);

  const toggleCheck = (id: string) => {
    const updated = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(updated);
    try {
      localStorage.setItem('treksafe_checklist_state', JSON.stringify(updated));
    } catch (e) {
      console.warn('Checklist save error:', e);
    }
  };

  const handleResetChecklist = () => {
    setCheckedIds({});
    try {
      localStorage.removeItem('treksafe_checklist_state');
    } catch (e) {
      console.warn('Checklist reset error:', e);
    }
  };

  const totalItems = checklist.length;
  const packedItems = checklist.filter((item) => checkedIds[item.id]).length;
  const progressPercent = Math.round((packedItems / totalItems) * 100);

  return (
    <div className="bg-white border border-[#E4E0D2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E0D2] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#243B2A] flex items-center gap-2">
              <Backpack className="w-4 h-4 text-[#D7A84A]" />
              Major Trek Checklist & Gear Essentials
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FAF8F3] border border-[#D5D0C0] text-[#526B4F]">
              {packedItems} / {totalItems} Packed
            </span>
          </div>
          <p className="text-xs text-[#526B4F]">
            Strictly essential requirements curated for <strong>{trailName}</strong> based on live weather hazards.
          </p>
        </div>

        {/* Progress Bar & Reset */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-32 bg-[#E8E4D8] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent === 100 ? 'bg-emerald-600' : 'bg-[#243B2A]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-[#1F2520] min-w-[36px]">
            {progressPercent}%
          </span>
          <button
            onClick={handleResetChecklist}
            className="text-xs text-[#6B7262] hover:text-[#1F2520] flex items-center gap-1 font-medium cursor-pointer"
            title="Reset checks"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Grid of Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checklist.map((item) => {
          const isChecked = Boolean(checkedIds[item.id]);

          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                isChecked
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : item.isPriority
                  ? 'bg-[#FAF8F3]/80 border-[#D5D0C0] hover:border-[#243B2A]'
                  : 'bg-white border-[#EAE6D8] hover:border-[#D5D0C0]'
              }`}
            >
              <div className="pt-0.5 shrink-0 text-[#243B2A]">
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-700" />
                ) : (
                  <Square className="w-5 h-5 text-[#8C8675]" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-bold leading-tight ${
                      isChecked ? 'line-through text-[#6B7262]' : 'text-[#1F2520]'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.isPriority && !isChecked && (
                    <span className="text-[10px] uppercase font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded-sm shrink-0">
                      Essential
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#526B4F] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
