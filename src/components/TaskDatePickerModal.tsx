import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { ShahDate, ThemeMode } from '../types';
import {
  MONTH_NAMES_FA,
  WEEKDAYS_SHORT_FA,
  WEEKDAYS_FA,
  toFa,
  shahMonthLength,
  weekdayOfShahDate,
  toGregorian,
  GREGORIAN_MONTH_NAMES_FA,
  getTodayShahanshahi,
} from '../utils/calendar';
import { getOccasionsForDate } from '../data/occasions';

interface TaskDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: ShahDate) => void;
  initialDate?: ShahDate;
  theme?: ThemeMode;
}

export const TaskDatePickerModal: React.FC<TaskDatePickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialDate,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';

  const defaultDate = initialDate || getTodayShahanshahi();

  // Exact target date picker state (Year, Month, Day)
  const [viewYear, setViewYear] = useState<number>(defaultDate.jy);
  const [viewMonth, setViewMonth] = useState<number>(defaultDate.jm);
  const [chosenDay, setChosenDay] = useState<number>(defaultDate.jd);

  // Quick year dropdown
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const base = initialDate || getTodayShahanshahi();
      setViewYear(base.jy);
      setViewMonth(base.jm);
      setChosenDay(base.jd);
      setIsYearPickerOpen(false);
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  // Selected date info
  const targetDate: ShahDate = {
    jy: viewYear,
    jm: viewMonth,
    jd: chosenDay,
  };

  const monthDaysCount = shahMonthLength(viewYear, viewMonth);
  const firstDayWeekday = weekdayOfShahDate(viewYear, viewMonth, 1);
  const greg = toGregorian(viewYear, viewMonth, chosenDay);
  const weekdayIdx = weekdayOfShahDate(viewYear, viewMonth, chosenDay);
  const weekdayName = WEEKDAYS_FA[weekdayIdx];
  const dayOccasions = getOccasionsForDate(viewMonth, chosenDay);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setChosenDay(day);
  };

  const handleConfirm = () => {
    onConfirm(targetDate);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex min-h-full items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Dialog Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className={`relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border shadow-2xl flex flex-col gap-4 overscroll-contain my-auto ${
            isDark
              ? 'bg-[#141418] border-white/10 text-stone-100'
              : isTurquoise
              ? 'bg-white text-slate-800 border-sky-200 shadow-sky-950/10'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between pb-3 border-b sticky top-0 bg-inherit z-20 ${
              isDark ? 'border-white/10' : isTurquoise ? 'border-sky-100' : 'border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                  isTurquoise ? 'bg-sky-100 text-sky-700' : 'bg-[#f27d26]/20 text-[#f27d26]'
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">انتخاب دقیق تاریخ</h3>
                <p
                  className={`text-[11px] font-medium ${
                    isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-500' : 'text-stone-500'
                  }`}
                >
                  تعیین سال، ماه و روز موردنظر
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'border-white/10 hover:bg-white/10 text-stone-400 hover:text-white'
                  : isTurquoise
                  ? 'border-sky-200 hover:bg-sky-50 text-slate-500 hover:text-slate-900'
                  : 'border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Exact Date Selector Box */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col gap-3 ${
              isDark
                ? 'bg-black/40 border-white/10'
                : isTurquoise
                ? 'bg-sky-50/50 border-sky-100'
                : 'bg-orange-50/40 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isTurquoise ? 'text-sky-600' : 'text-[#f27d26]'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>تقویم انتخاب تاریخ</span>
              </span>

              {/* Selected Date Badge */}
              <span
                className={`text-[11px] font-black px-2.5 py-1 rounded-lg shadow-xs ${
                  isTurquoise ? 'bg-sky-500 text-white' : 'bg-[#f27d26] text-stone-950'
                }`}
              >
                {weekdayName} {toFa(chosenDay)} {MONTH_NAMES_FA[viewMonth - 1]} {toFa(viewYear)}
              </span>
            </div>

            {/* Month/Year Navigation Bar */}
            <div
              className={`flex items-center justify-between p-2 rounded-xl border ${
                isDark
                  ? 'bg-[#1a1a22] border-white/5'
                  : isTurquoise
                  ? 'bg-white border-sky-100 shadow-xs'
                  : 'bg-white border-stone-200 shadow-xs'
              }`}
            >
              <button
                type="button"
                onClick={handlePrevMonth}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isTurquoise
                    ? 'hover:bg-sky-500/20 text-sky-600'
                    : 'hover:bg-[#f27d26]/20 text-[#f27d26]'
                }`}
                title="ماه قبل"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={viewMonth}
                  onChange={(e) => {
                    const m = parseInt(e.target.value, 10);
                    setViewMonth(m);
                    const maxD = shahMonthLength(viewYear, m);
                    if (chosenDay > maxD) setChosenDay(maxD);
                  }}
                  className={`text-xs font-bold py-1 px-2 rounded-lg border outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#121216] border-white/10 text-stone-100'
                      : isTurquoise
                      ? 'bg-sky-50 border-sky-200 text-slate-800'
                      : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`}
                >
                  {MONTH_NAMES_FA.map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {mName}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                    className={`text-xs font-black py-1 px-2.5 rounded-lg border flex items-center gap-1 cursor-pointer ${
                      isDark
                        ? 'bg-[#121216] border-white/10 text-stone-100'
                        : isTurquoise
                        ? 'bg-sky-50 border-sky-200 text-slate-800'
                        : 'bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <span>سال {toFa(viewYear)}</span>
                  </button>

                  {isYearPickerOpen && (
                    <div
                      className={`absolute top-full mt-1 left-0 z-30 p-2 rounded-xl border shadow-xl flex flex-col gap-1 w-32 max-h-40 overflow-y-auto ${
                        isDark
                          ? 'bg-[#181820] border-white/15'
                          : isTurquoise
                          ? 'bg-white border-sky-200'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      {[2583, 2584, 2585, 2586, 2587, 2588, 2589, 2590].map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => {
                            setViewYear(y);
                            setIsYearPickerOpen(false);
                          }}
                          className={`text-xs py-1 px-2 rounded-lg text-right transition cursor-pointer ${
                            viewYear === y
                              ? isTurquoise
                                ? 'bg-sky-500 text-white font-bold'
                                : 'bg-[#f27d26] text-stone-950 font-bold'
                              : isDark
                              ? 'hover:bg-white/10 text-stone-300'
                              : isTurquoise
                              ? 'hover:bg-sky-50 text-slate-700'
                              : 'hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          سال {toFa(y)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isTurquoise
                    ? 'hover:bg-sky-500/20 text-sky-600'
                    : 'hover:bg-[#f27d26]/20 text-[#f27d26]'
                }`}
                title="ماه بعد"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Mini Calendar Grid for Day Selection */}
            <div className="space-y-1">
              <div
                className={`grid grid-cols-7 gap-1 text-center text-[10px] font-bold py-1 ${
                  isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-400' : 'text-stone-400'
                }`}
              >
                {WEEKDAYS_SHORT_FA.map((w, idx) => (
                  <span
                    key={idx}
                    className={idx === 6 ? (isDark ? 'text-rose-400' : 'text-rose-600') : ''}
                  >
                    {w}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayWeekday }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square" />
                ))}

                {Array.from({ length: monthDaysCount }).map((_, idx) => {
                  const dNum = idx + 1;
                  const isSelected = chosenDay === dNum;
                  const isFri = (firstDayWeekday + idx) % 7 === 6;

                  return (
                    <button
                      key={`day-${dNum}`}
                      type="button"
                      onClick={() => handleSelectDay(dNum)}
                      className={`aspect-square rounded-xl text-xs flex flex-col items-center justify-center transition cursor-pointer select-none font-bold ${
                        isSelected
                          ? isTurquoise
                            ? 'bg-sky-500 text-white font-black shadow-md shadow-sky-500/40 scale-105 z-10'
                            : 'bg-[#f27d26] text-stone-950 font-black shadow-md shadow-[#f27d26]/40 scale-105 z-10'
                          : isFri
                          ? isDark
                            ? 'text-rose-400 hover:bg-white/5'
                            : 'text-rose-600 hover:bg-orange-50'
                          : isDark
                          ? 'text-stone-200 hover:bg-white/5'
                          : isTurquoise
                          ? 'text-slate-700 hover:bg-sky-50'
                          : 'text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      <span>{toFa(dNum)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Gregorian info and Occasions for this date */}
            <div className="pt-2 border-t border-current/10 flex flex-col gap-1 text-[11px]">
              <div
                className={`flex items-center justify-between ${
                  isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-500' : 'text-stone-600'
                }`}
              >
                <span>معادل تقویم میلادی:</span>
                <span className="font-semibold">
                  {greg.gd} {GREGORIAN_MONTH_NAMES_FA[greg.gm - 1]} {greg.gy}
                </span>
              </div>
              {dayOccasions.length > 0 && (
                <div
                  className={`flex items-center gap-1.5 font-medium truncate mt-0.5 ${
                    isTurquoise ? 'text-sky-700' : 'text-amber-400'
                  }`}
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 shrink-0 ${isTurquoise ? 'text-sky-500' : 'text-[#f27d26]'}`}
                  />
                  <span className="truncate">مناسبت: {dayOccasions.map((o) => o.name).join('، ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            className={`flex items-center justify-end gap-2.5 pt-3 border-t ${
              isDark ? 'border-white/10' : isTurquoise ? 'border-sky-100' : 'border-stone-200'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isDark
                  ? 'border-white/10 hover:bg-white/5 text-stone-400 hover:text-white'
                  : isTurquoise
                  ? 'border-sky-200 hover:bg-sky-50 text-slate-500 hover:text-slate-900'
                  : 'border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              انصراف
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className={`flex items-center gap-1.5 px-6 py-2.5 text-xs font-black rounded-xl transition cursor-pointer shadow-lg active:scale-95 ${
                isTurquoise
                  ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-sky-500/20'
                  : 'bg-[#f27d26] text-stone-950 hover:bg-[#ff8a38] shadow-[#f27d26]/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>تایید تاریخ</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
