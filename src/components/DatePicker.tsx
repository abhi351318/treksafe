import React from 'react';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onSelectDate,
  disabled
}) => {
  const today = new Date();
  const availableDays: Array<{
    dateStr: string;
    dayName: string;
    dayNum: string;
    monthName: string;
    isToday: boolean;
  }> = [];

  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayName = i === 0 ? 'TODAY' : i === 1 ? 'TMRW' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

    availableDays.push({
      dateStr,
      dayName,
      dayNum,
      monthName,
      isToday: i === 0
    });
  }

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-1.5">
          <CalendarIcon className="w-3 h-3 text-orange-400" />
          EXPEDITION TIME-WINDOW
        </label>
        <span className="text-[9px] font-mono text-white/40">10-DAY SYNOPTIC OUTLOOK</span>
      </div>

      {/* Horizontal Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {availableDays.map((item) => {
          const isSelected = selectedDate === item.dateStr;

          return (
            <button
              key={item.dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(item.dateStr)}
              className={`flex-1 min-w-[65px] sm:min-w-[70px] py-2 px-1 text-center transition-all cursor-pointer select-none border ${
                isSelected
                  ? 'bg-orange-500 text-black border-orange-500 font-bold'
                  : 'bg-[#141B2B] border-white/5 hover:border-white/20 text-white/70 hover:text-white'
              }`}
            >
              <div className="text-[8px] font-mono tracking-widest">
                {item.dayName}
              </div>
              <div className="text-sm font-mono font-black my-0.5">
                {item.dayNum}
              </div>
              <div className="text-[8px] font-mono opacity-60">
                {item.monthName}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
