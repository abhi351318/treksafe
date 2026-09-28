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
  // Generate 10 consecutive forecast days starting today
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
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#243B2A] flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#526B4F]" /> Trek Date
        </label>
        <span className="text-[11px] text-[#526B4F]">10-day forecast window</span>
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
              className={`flex-1 min-w-[70px] max-w-[85px] py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                isSelected
                  ? 'bg-[#243B2A] text-white border-[#243B2A] shadow-xs'
                  : 'bg-white text-[#1F2520] border-[#DCD7C6] hover:border-[#243B2A]/60 hover:bg-[#FAF8F3]'
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected ? 'text-[#D7A84A]' : 'text-[#6B7262]'
                }`}
              >
                {item.dayName}
              </span>
              <span
                className={`text-base font-extrabold leading-tight ${
                  isSelected ? 'text-white' : 'text-[#1F2520]'
                }`}
              >
                {item.dayNum}
              </span>
              <span
                className={`text-[10px] ${
                  isSelected ? 'text-white/80' : 'text-[#6B7262]'
                }`}
              >
                {item.monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
