import React, { useState } from 'react';
import { WeatherData } from '../types';
import { CheckSquare, Square, Backpack, RotateCcw } from 'lucide-react';

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
        title: isHot
          ? 'Hydration Reserve (3.0L Hydration Bladder + Electrolytes)'
          : 'Hydration Reserve (2.0L - 2.5L Flasks)',
        description: isHot
          ? 'Warm trail conditions accelerate fluid loss. Pack mineral electrolyte sachets.'
          : 'Steady ascent respiration requires consistent hydration intake.',
        isPriority: true
      },
      {
        id: 'boots',
        category: 'Essentials',
        title: 'Trekking Boots with Deep Grip & Merino Socks',
        description: isRainy
          ? 'Wet soil and slick granite rock demand aggressive sole traction.'
          : 'Broken-in ankle-support boots prevent fatigue and blister formation.',
        isPriority: true
      },
      {
        id: 'nav',
        category: 'Safety & Navigation',
        title: 'Offline Trail Map & 20,000mAh Power Bank',
        description: 'Remote ridges lack reliable cellular coverage. Keep offline GPS tracks ready.',
        isPriority: true
      },
      {
        id: 'firstaid',
        category: 'Safety & Navigation',
        title: 'Trail First-Aid Kit & Emergency Whistle',
        description: 'Compression bandages, antiseptic wipes, blister plasters, and whistle.',
        isPriority: true
      }
    ];

    if (isRainy) {
      items.push({
        id: 'rainshell',
        category: 'Weather-Specific',
        title: 'Waterproof Rain Shell Jacket + Backpack Rain Cover',
        description: `Precipitation probability is ${weather.rainProbability}%. Keep core layers and electronics dry.`,
        isPriority: true
      });
    }

    if (isCold) {
      items.push({
        id: 'insulation',
        category: 'Weather-Specific',
        title: 'Thermal Fleece Layer & Insulated Packable Jacket',
        description: `Feels-like temperature drops to ${weather.feelsLike}°C. Pack warm summit layers.`,
        isPriority: true
      });
    }

    if (isHot || weather.uvIndex >= 6) {
      items.push({
        id: 'sunprotection',
        category: 'Weather-Specific',
        title: 'Sun Hat, UV400 Sunglasses & SPF 50+ Sunscreen',
        description: `UV index reaches ${weather.uvIndex} with exposed ridge sunlight.`,
        isPriority: false
      });
    }

    if (isHighWind) {
      items.push({
        id: 'windprotection',
        category: 'Weather-Specific',
        title: 'Windproof Outer Layer & Neck Gaiter',
        description: `Peak ridge gusts of ${weather.windGust} km/h increase windchill on exposed crests.`,
        isPriority: true
      });
    }

    items.push({
      id: 'nutrition',
      category: 'Trail Sustenance',
      title: 'High-Energy Trail Snacks (Nuts, Dried Fruit, Energy Bars)',
      description: 'Sustained elevation gain requires steady carbohydrate replenishment.',
      isPriority: false
    });

    items.push({
      id: 'poles',
      category: 'Essentials',
      title: 'Collapsible Trekking Poles',
      description: 'Reduces knee impact on steep downhill sections and improves balance.',
      isPriority: false
    });

    return items;
  };

  const items = getMajorItems();
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    'All' | 'Essentials' | 'Weather-Specific' | 'Safety & Navigation'
  >('All');

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredItems =
    selectedFilter === 'All'
      ? items
      : items.filter((item) => item.category === selectedFilter);

  const progressPercent = Math.round((checkedIds.length / items.length) * 100);

  return (
    <div className="bg-white border border-[#E4E0D2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6D8] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#526B4F]">
            <Backpack className="w-4 h-4 text-[#243B2A]" />
            <span>Weather-Adaptive Packing Checklist</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#243B2A] mt-0.5">
            Recommended Gear for {trailName}
          </h3>
          <p className="text-xs text-[#6B7262]">
            Tailored automatically to temperature, wind, UV, and rain forecast on your selected date.
          </p>
        </div>

        {/* Progress & Reset */}
        <div className="flex items-center gap-3 bg-[#FAF8F3] px-3.5 py-2 rounded-xl border border-[#E4E0D2]">
          <div className="text-right">
            <div className="text-[11px] font-medium text-[#6B7262]">Packed</div>
            <div className="text-xs font-bold text-[#243B2A] tabular-nums">
              {checkedIds.length} / {items.length} items
            </div>
          </div>
          <div className="w-20 h-2 bg-[#EAE6D8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#243B2A] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setCheckedIds([])}
            className="p-1.5 rounded-lg hover:bg-[#EAE6D8] text-[#526B4F] hover:text-[#243B2A] transition-colors cursor-pointer"
            title="Reset Checklist"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(['All', 'Essentials', 'Weather-Specific', 'Safety & Navigation'] as const).map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                selectedFilter === cat
                  ? 'bg-[#243B2A] text-white border-[#243B2A]'
                  : 'bg-[#FAF8F3] text-[#526B4F] border-[#E4E0D2] hover:bg-[#EAE6D8] hover:text-[#243B2A]'
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => {
          const isDone = checkedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleCheck(item.id)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                isDone
                  ? 'bg-[#EBF3EC]/60 border-[#C5DEC9]'
                  : item.isPriority
                  ? 'bg-[#FAF8F3] border-[#D5D0C0] hover:border-[#243B2A]'
                  : 'bg-white border-[#E4E0D2] hover:border-[#526B4F]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-[#2E5A36]" />
                ) : (
                  <Square className="w-4 h-4 text-[#8C8675]" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-bold leading-snug ${
                      isDone ? 'line-through text-[#6B7262]' : 'text-[#1F2520]'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.isPriority && !isDone && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D7A84A]/20 text-[#8C6414] shrink-0">
                      Essential
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#526B4F] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
