import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

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

    const dayName =
      i === 0
        ? 'Today'
        : i === 1
        ? 'Tmrw'
        : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = String(d.getDate()).padStart(2, '0');
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
        <label className="text-xs font-semibold text-[#243B2A] flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#526B4F]" />
          Trek Date
        </label>
        <span className="text-[11px] text-[#6B7262]">10-day forecast</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {availableDays.map((item) => {
          const isSelected = selectedDate === item.dateStr;

          return (
            <button
              key={item.dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(item.dateStr)}
              className={`flex-1 min-w-[60px] py-2 px-1.5 rounded-xl text-center transition-all cursor-pointer select-none border ${
                isSelected
                  ? 'bg-[#243B2A] text-white border-[#243B2A] shadow-xs'
                  : 'bg-[#FAF8F3] border-[#E4E0D2] hover:border-[#526B4F] text-[#1F2520]'
              }`}
            >
              <div
                className={`text-[10px] font-medium ${
                  isSelected ? 'text-[#D7A84A]' : 'text-[#6B7262]'
                }`}
              >
                {item.dayName}
              </div>
              <div className="text-sm font-bold tabular-nums my-0.5">{item.dayNum}</div>
              <div
                className={`text-[10px] ${
                  isSelected ? 'text-white/80' : 'text-[#8C8675]'
                }`}
              >
                {item.monthName}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
