import React from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Settings } from 'lucide-react';
import { ShahDate, ThemeMode } from '../types';
import { MONTH_NAMES_FA, toFa, WEEKDAYS_FA, weekdayOfShahDate } from '../utils/calendar';

interface HeaderProps {
  today: ShahDate;
  theme: ThemeMode;
  userName?: string;
  onOpenSettings: () => void;
  onJumpToday: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  today,
  theme,
  userName,
  onOpenSettings,
  onJumpToday,
}) => {
  const weekdayIndex = weekdayOfShahDate(today.jy, today.jm, today.jd);
  const weekdayName = WEEKDAYS_FA[weekdayIndex];
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';

  return (
    <header className="w-full max-w-4xl mx-auto pt-4 pb-2 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors duration-300">
      {/* Brand & Today Subtitle */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 5, scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-[#f27d26]/20 ring-1 ring-white/20 shrink-0 cursor-pointer bg-[#14141a] flex items-center justify-center p-0.5"
        >
          <img
            src="/icon-192.png"
            alt="تقویم شاهنشاهی"
            className="w-full h-full object-cover rounded-xl"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div>
          <h1
            className={`text-lg font-black tracking-normal flex items-center gap-2 ${
              isDark ? 'text-white' : isTurquoise ? 'text-slate-900' : 'text-stone-900'
            }`}
          >
            <span>تقویم شاهنشاهی</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-[#f27d26]/10 text-[#f27d26] border-[#f27d26]/25'
                  : isTurquoise
                  ? 'bg-sky-500/10 text-sky-700 border-sky-500/25'
                  : 'bg-amber-500/10 text-amber-700 border-amber-500/25'
              }`}
            >
              {toFa(today.jy)}
            </span>
          </h1>
          <p
            className={`text-xs font-medium mt-0.5 ${
              isDark ? 'text-stone-400' : isTurquoise ? 'text-sky-900/70' : 'text-stone-600'
            }`}
          >
            {userName ? `سلام ${userName}! ` : ''}امروز: {weekdayName}، {toFa(today.jd)} {MONTH_NAMES_FA[today.jm - 1]} {toFa(today.jy)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Today Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={onJumpToday}
          title="برو به امروز"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-xs cursor-pointer ${
            isDark
              ? 'bg-[#181822]/80 backdrop-blur-md hover:bg-[#f27d26]/25 text-orange-300 border-white/15 hover:border-[#f27d26]/50'
              : isTurquoise
              ? 'bg-white/90 backdrop-blur-md hover:bg-sky-50 text-sky-800 border-sky-200 hover:border-sky-400'
              : 'bg-white/90 backdrop-blur-md hover:bg-orange-50 text-orange-800 border-stone-200 hover:border-[#f27d26]/50'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[#f27d26]" />
          <span>امروز</span>
        </motion.button>

        {/* Settings Hub Button */}
        <motion.button
          whileHover={{ scale: 1.06, rotate: 25 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpenSettings}
          title="تنظیمات، تم‌ها، مبدل تاریخ و پشتیبان‌گیری"
          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            isDark
              ? 'bg-[#181822]/80 backdrop-blur-md hover:bg-[#252532] text-stone-200 hover:text-[#f27d26] border-white/15 hover:border-[#f27d26]/50 shadow-xs'
              : isTurquoise
              ? 'bg-white/90 backdrop-blur-md hover:bg-sky-50 text-slate-700 hover:text-sky-600 border-sky-200 hover:border-sky-400 shadow-xs'
              : 'bg-white/90 backdrop-blur-md hover:bg-stone-100 text-stone-700 hover:text-[#f27d26] border-stone-200 hover:border-[#f27d26]/40 shadow-xs'
          }`}
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
};
