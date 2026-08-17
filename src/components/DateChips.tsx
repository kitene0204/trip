import React, { useRef, useEffect } from 'react';
import { getDayOfWeekKorean, formatMonthDay } from '../utils/helpers';

interface DateChipsProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  cityList?: string[];
}

export const DateChips: React.FC<DateChipsProps> = ({
  dates,
  selectedDate,
  onSelectDate,
  cityList = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll active chip into view smoothly
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  if (!dates || dates.length === 0) return null;

  return (
    <div className="sticky top-[48px] z-20 bg-white/95 backdrop-blur-md border-b border-[#e5e9ee] shadow-sm">
      <div
        ref={containerRef}
        className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {dates.map((dateStr, idx) => {
          const isSelected = selectedDate === dateStr;
          const weekday = getDayOfWeekKorean(dateStr);
          const isWeekend = weekday === '토' || weekday === '일';
          const md = formatMonthDay(dateStr);

          // Approximate city distribution if multiple cities
          let city = '';
          if (cityList.length === 1) {
            city = cityList[0];
          } else if (cityList.length > 1) {
            const cityIndex = Math.min(Math.floor((idx / dates.length) * cityList.length), cityList.length - 1);
            city = cityList[cityIndex];
          }

          return (
            <button
              key={dateStr}
              data-active={isSelected ? 'true' : 'false'}
              onClick={() => onSelectDate(dateStr)}
              className={`flex-shrink-0 min-w-[62px] px-2.5 py-1.5 rounded-xl text-center transition-all duration-200 active:scale-95 flex flex-col items-center justify-center border ${
                isSelected
                  ? 'bg-[#1b4b7a] text-white border-[#1b4b7a] shadow-md'
                  : 'bg-[#f1f3f5] text-[#1c2733] border-transparent hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-bold ${
                    isSelected
                      ? 'text-white/80'
                      : isWeekend
                      ? weekday === '일'
                        ? 'text-rose-500'
                        : 'text-blue-500'
                      : 'text-[#6b7a89]'
                  }`}
                >
                  {weekday}
                </span>
                {city && (
                  <span
                    className={`text-[9px] truncate max-w-[40px] ${
                      isSelected ? 'text-white/70' : 'text-[#6b7a89]'
                    }`}
                  >
                    · {city}
                  </span>
                )}
              </div>
              <span className="text-xs font-black tracking-tight">{md}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
