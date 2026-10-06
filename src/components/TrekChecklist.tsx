import React, { useState } from 'react';
import { WeatherData } from '../types';
import {
  CheckSquare,
  Square,
  ShieldAlert,
  Backpack,
  RotateCcw,
  Sparkles,
  Sliders,
  AlertCircle
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
        title: isHot ? 'Hydration Reserve (3.0L Hydration Bladder + Electrolytes)' : 'Hydration Reserve (2.0L - 2.5L Flasks)',
        description: isHot
          ? 'Thermal heat load triggers accelerated water loss. Ensure mineral electrolyte replacement.'
          : 'High altitude pulmonary respiration demands consistent hydration intake.',
        isPriority: true
      },
      {
        id: 'boots',
        category: 'Essentials',
        title: 'Trekking Boots with Deep Vibram/Lug Grip & Merino Socks',
        description: isRainy
          ? 'Slick loam and wet granite monolith surfaces demand aggressive sole traction.'
          : 'Broken-in ankle-support boots preventing foot fatigue and blister formation.',
        isPriority: true
      },
      {
        id: 'nav',
        category: 'Safety & Navigation',
        title: 'Satellite GPX Offline Nav & 20,000mAh Power Reserve',
        description: 'Deep wilderness ravines lack cellular signals. Ensure offline offline trail cache.',
        isPriority: true
      },
      {
        id: 'firstaid',
        category: 'Safety & Navigation',
        title: 'Trauma & Wilderness Medical Kit',
        description: 'Pressure bandages, antiseptic dressings, sam-splint, and high-frequency emergency whistle.',
        isPriority: true
      }
    ];

    if (isRainy) {
      items.push({
        id: 'rainshell',
        category: 'Weather-Specific',
        title: '3-Layer Waterproof Hardshell Jacket + Pack Cover',
        description: `Precipitation modeled at ${weather.rainProbability}%. Hardshell jacket prevents clothing soaking & hypothermia.`,
        isPriority: true
      });
    }

    if (isCold) {
      items.push({
        id: 'insulation',
        category: 'Weather-Specific',
        title: 'Thermal Grid Fleece & 800-Fill Goose Down Jacket',
        description: `Apparent temperature drops to ${weather.feelsLike}°C. High hypothermia hazard if wind-exposed.`,
        isPriority: true
      });
    }

    if (isHot || weather.uvIndex >= 6) {
      items.push({
        id: 'sunprotection',
        category: 'Weather-Specific',
        title: 'UPF 50+ Sun Hoody, UV400 Eyewear & Mineral Sunblock',
        description: `UV index calculated at ${weather.uvIndex} with direct ridge reflection.`,
        isPriority: false
      });
    }

    if (isHighWind) {
      items.push({
        id: 'windprotection',
        category: 'Weather-Specific',
        title: 'Windstopper Softshell Barrier & Thermal Buff',
        description: `Peak ridge gusts of ${weather.windGust} km/h require windstopper fabric to block convective freeze.`,
        isPriority: true
      });
    }

    items.push({
      id: 'nutrition',
      category: 'Trail Sustenance',
      title: 'Dense Energy Rations (1,500 kcal Trail Mix & Carbohydrate Gels)',
      description: 'Sustained uphill elevation burn requires hourly glycogen replenishment.',
      isPriority: false
    });

    items.push({
      id: 'poles',
      category: 'Essentials',
      title: 'Carbon-Fiber Telescopic Trekking Poles',
      description: 'Absorbs up to 25% of descent knee shock on steep descents.',
      isPriority: false
    });

    return items;
  };

  const items = getMajorItems();
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Essentials' | 'Weather-Specific' | 'Safety & Navigation'>('All');

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredItems = selectedFilter === 'All' 
    ? items 
    : items.filter(item => item.category === selectedFilter);

  const progressPercent = Math.round((checkedIds.length / items.length) * 100);

  return (
    <div className="bg-[#0F1420] border border-white/10 p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500"></span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-orange-400 font-bold">
              PACKING INTELLIGENCE
            </span>
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
            Trail Manifest // {trailName}
          </h3>
          <p className="text-xs text-white/50">
            Dynamically customized gear configuration reflecting current weather vectors.
          </p>
        </div>

        {/* Progress & Reset */}
        <div className="flex items-center gap-3 bg-[#141B2B] p-2 sm:px-3 border border-white/10">
          <div className="text-right">
            <div className="text-[9px] font-mono uppercase text-white/40">READINESS</div>
            <div className="text-xs font-mono font-bold text-orange-400">
              {checkedIds.length} / {items.length} ITEMS
            </div>
          </div>
          <div className="w-16 h-2 bg-white/10 overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            onClick={() => setCheckedIds([])}
            className="p-1 hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
            title="Reset Pack Checklist"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
        {(['All', 'Essentials', 'Weather-Specific', 'Safety & Navigation'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-2.5 py-1 transition-all cursor-pointer ${
              selectedFilter === cat
                ? 'bg-orange-500 text-black font-bold'
                : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {filteredItems.map((item) => {
          const isDone = checkedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 border transition-all cursor-pointer flex items-start gap-3 select-none ${
                isDone
                  ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                  : item.isPriority
                  ? 'bg-[#141B2B] border-white/15 hover:border-orange-500/40'
                  : 'bg-[#101522] border-white/5 hover:border-white/15'
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
                    className={`text-xs font-bold leading-snug ${
                      isDone ? 'line-through text-white/40' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.isPriority && !isDone && (
                    <span className="text-[8px] font-mono px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase shrink-0">
                      VITAL
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
