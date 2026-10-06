import React, { useState } from 'react';
import { WeatherData } from '../types';
import {
  CheckSquare,
  Square,
  ShieldAlert,
  Backpack,
  Compass,
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
  const isRainy = weather.rainProbability >= 40 || weather.rainAmount > 1.0;
  const isCold = weather.feelsLike < 12;
  const isHot = weather.feelsLike > 26;
  const isHighWind = weather.windSpeed > 30 || weather.windGust > 40;

  const getMajorItems = (): ChecklistItem[] => {
    const items: ChecklistItem[] = [
      {
        id: 'water',
        category: 'Trail Sustenance',
        title: isHot ? 'Hydration (3.0L Water + Electrolytes)' : 'Hydration Reservoir (2.0L - 2.5L Water)',
        description: isHot
          ? 'High temperatures require oral rehydration salts & minimum 3 liters of water.'
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
        id: 'nav',
        category: 'Safety & Navigation',
        title: 'Offline GPS Track / Downloaded Map & Powerbank',
        description: 'Dense canopy & mountain valleys lose cellular coverage. Keep backup offline GPX trailway.',
        isPriority: true
      },
      {
        id: 'firstaid',
        category: 'Safety & Navigation',
        title: 'Wilderness Trauma Kit (Bandages, Antiseptic, Whistle)',
        description: 'Emergency kit with sterile gauze, compression bandage, blister moleskin & high-decibel whistle.',
        isPriority: true
      }
    ];

    if (isRainy) {
      items.push({
        id: 'rainshell',
        category: 'Weather-Specific',
        title: '3-Layer Waterproof Hardshell Jacket & Backpack Rain Cover',
        description: `Precipitation modeled at ${weather.rainProbability}%. Hardshell jacket prevents clothing soaking & hypothermia.`,
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

    items.push({
      id: 'nutrition',
      category: 'Trail Sustenance',
      title: 'High-Calorie Trail Rations (Nuts, Energy Bars & Dates)',
      description: 'Minimum 1,200 - 1,800 kcal of quick-digest fuel for sustained elevation gain.',
      isPriority: false
    });

    items.push({
      id: 'poles',
      category: 'Essentials',
      title: 'Adjustable Trekking Poles',
      description: 'Relieves up to 25% of knee joint impact during steep switchbacks and slippery descents.',
      isPriority: false
    });

    return items;
  };

  const items = getMajorItems();
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const progressPercent = Math.round((checkedIds.length / items.length) * 100);

  return (
    <div className="bg-[#111714] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Backpack className="w-4 h-4" />
            </span>
            <h3 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-white">
              Tactical Expedition Gear Manifest
            </h3>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Adaptive safety checklist engineered for <strong>{trailName}</strong> weather conditions.
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-xl">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">Readiness</div>
            <div className="text-xs font-mono font-bold text-emerald-400">
              {checkedIds.length} / {items.length} Checked
            </div>
          </div>
          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            onClick={() => setCheckedIds([])}
            className="p-1 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Reset Checklist"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const isDone = checkedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                isDone
                  ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                  : item.isPriority
                  ? 'bg-white/[0.02] border-white/10 hover:border-amber-500/30'
                  : 'bg-white/[0.01] border-white/5 hover:border-white/15'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-white/40" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${
                      isDone ? 'line-through text-white/40' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.isPriority && !isDone && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold uppercase">
                      CRITICAL
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-sans">
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
