import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

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

    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = String(d.getDate());
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });

    availableDays.push({
      dateStr,
      dayName,
      dayNum,
      monthName,
      isToday: i === 0
    });
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
          Expedition Date Window
        </label>
        <span className="text-[10px] font-mono text-white/40">10-Day Synoptic Horizon</span>
      </div>

      {/* Horizontal Scroll Date Picker */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
        {availableDays.map((item) => {
          const isSelected = selectedDate === item.dateStr;

          return (
            <button
              key={item.dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(item.dateStr)}
              className={`flex-1 min-w-[72px] sm:min-w-[80px] py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-white/70 hover:text-white'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider">
                {item.dayName}
              </div>
              <div className="text-sm sm:text-base font-mono font-extrabold my-0.5">
                {item.dayNum}
              </div>
              <div className="text-[9px] font-mono opacity-60">
                {item.monthName}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
