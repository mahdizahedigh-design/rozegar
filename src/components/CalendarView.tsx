import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  CalendarRange,
  Sparkles,
  ListTodo,
  Star,
  Clock,
  CheckCircle2,
  Circle,
  Folder as FolderIcon,
  RotateCw,
  X,
} from 'lucide-react';
import { ShahDate, Reminder, ThemeMode, CalendarViewMode, Occasion } from '../types';
import {
  MONTH_NAMES_FA,
  GREGORIAN_MONTH_NAMES_FA,
  WEEKDAYS_SHORT_FA,
  WEEKDAYS_FA,
  toFa,
  shahMonthLength,
  toGregorian,
  weekdayOfShahDate,
  addDaysToShahDate,
  getWeekDaysForShahDate,
  isSameShahDate,
} from '../utils/calendar';
import { getOccasionsForDate } from '../data/occasions';
import { OccasionCard } from './OccasionCard';

interface CalendarViewProps {
  currentDate: ShahDate; // Month currently being viewed
  selectedDate: ShahDate; // Specific day selected
  today: ShahDate;
  theme: ThemeMode;
  reminders: Reminder[];
  onSelectDate: (date: ShahDate) => void;
  onChangeMonth: (year: number, month: number) => void;
  onToggleReminder?: (id: string) => void;
}

const STORAGE_SHOW_OCCASIONS_KEY = 'shah_calendar_show_occasions';
const STORAGE_VIEW_MODE_KEY = 'shah_calendar_view_mode';

// Memoized Month Day Cell for high performance in Android WebViews
interface DayCellProps {
  dayNum: number;
  currentJy: number;
  currentJm: number;
  isSelected: boolean;
  isToday: boolean;
  isFriday: boolean;
  showOccasions: boolean;
  hasOccasion: boolean;
  hasReminder: boolean;
  hasImportant: boolean;
  isDark: boolean;
  isTurquoise: boolean;
  onSelect: (date: ShahDate) => void;
}

const DayCell = memo(function DayCell({
  dayNum,
  currentJy,
  currentJm,
  isSelected,
  isToday,
  isFriday,
  hasOccasion,
  hasReminder,
  hasImportant,
  isDark,
  isTurquoise,
  onSelect,
}: DayCellProps) {
  const greg = useMemo(
    () => toGregorian(currentJy, currentJm, dayNum),
    [currentJy, currentJm, dayNum]
  );

  return (
    <button
      type="button"
      onClick={() => onSelect({ jy: currentJy, jm: currentJm, jd: dayNum })}
      style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}
      className={`relative group aspect-square flex flex-col items-center justify-center p-1 cursor-pointer select-none rounded-2xl transition-all duration-150 transform active:scale-95 ${
        isSelected
          ? isTurquoise
            ? 'bg-gradient-to-br from-sky-400 to-sky-600 text-white font-black shadow-lg shadow-sky-500/40 z-10'
            : 'bg-gradient-to-br from-[#f27d26] to-[#e66c12] text-stone-950 font-black shadow-lg shadow-[#f27d26]/40 z-10'
          : isDark
          ? 'bg-[#181822]/75 backdrop-blur-md text-stone-100 hover:bg-[#282836]/90 hover:border-[#f27d26]/50 border border-white/10 shadow-xs'
          : isTurquoise
          ? 'bg-white/90 backdrop-blur-md text-slate-800 hover:bg-sky-50/95 hover:border-sky-300 border border-sky-100 shadow-xs'
          : 'bg-white/85 backdrop-blur-md text-stone-800 hover:bg-orange-50/95 hover:border-[#f27d26]/50 border border-stone-200 shadow-xs'
      }`}
    >
      {/* Today Indicator */}
      {isToday && !isSelected && (
        <span className={`absolute inset-0 rounded-2xl border-2 pointer-events-none animate-pulse ${
          isTurquoise ? 'border-sky-500' : 'border-[#f27d26]'
        }`} />
      )}

      {/* Day number */}
      <span
        className={`text-sm sm:text-base font-bold leading-tight ${
          isSelected
            ? isTurquoise ? 'text-white font-black' : 'text-stone-950 font-black'
            : isFriday
            ? isDark
              ? 'text-rose-400 font-extrabold'
              : 'text-rose-600 font-extrabold'
            : isDark
            ? 'text-stone-100'
            : isTurquoise
            ? 'text-slate-800'
            : 'text-stone-800'
        }`}
      >
        {toFa(dayNum)}
      </span>

      {/* Gregorian sub-day */}
      <span
        className={`text-[8px] sm:text-[9px] leading-tight font-medium ${
          isSelected
            ? isTurquoise ? 'text-sky-100' : 'text-stone-900/90'
            : isDark
            ? 'text-stone-400/80'
            : isTurquoise
            ? 'text-slate-400'
            : 'text-stone-500'
        }`}
      >
        {greg.gd} {GREGORIAN_MONTH_NAMES_FA[greg.gm - 1].slice(0, 3)}
      </span>

      {/* Dots indicator row */}
      <div className="flex items-center gap-1 mt-0.5 h-1.5">
        {hasOccasion && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSelected ? (isTurquoise ? 'bg-white' : 'bg-stone-950') : isTurquoise ? 'bg-sky-500' : 'bg-[#f27d26]'
            }`}
          />
        )}

        {hasImportant && (
          <Star
            className={`w-2.5 h-2.5 fill-amber-400 stroke-amber-500 ${
              isSelected ? (isTurquoise ? 'fill-white stroke-white' : 'fill-stone-950 stroke-stone-950') : ''
            }`}
          />
        )}

        {hasReminder && !hasImportant && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSelected ? (isTurquoise ? 'bg-sky-200' : 'bg-stone-950') : 'bg-sky-500'
            }`}
          />
        )}
      </div>
    </button>
  );
});

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  selectedDate,
  today,
  theme,
  reminders,
  onSelectDate,
  onChangeMonth,
  onToggleReminder,
}) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';

  // Direction of month/week slide animation (1 for next, -1 for prev)
  const [slideDirection, setSlideDirection] = useState<number>(0);

  // Popup showing the selected day's reminders (opened via the day badge/button)
  const [isDayRemindersPopupOpen, setIsDayRemindersPopupOpen] = useState(false);

  // View Mode: 'month' | 'week'
  const [viewMode, setViewMode] = useState<CalendarViewMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_VIEW_MODE_KEY);
      if (stored === 'month' || stored === 'week') return stored;
    } catch (e) {
      console.error(e);
    }
    return 'month';
  });

  // Toggle for National Occasions: default OFF (false)
  const [showOccasions, setShowOccasions] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SHOW_OCCASIONS_KEY);
      if (stored !== null) return JSON.parse(stored) === true;
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  // Jump Drawer State
  const [showJumpSelector, setShowJumpSelector] = useState(false);
  const [jumpYearInput, setJumpYearInput] = useState(currentDate.jy.toString());
  const [jumpMonthInput, setJumpMonthInput] = useState(currentDate.jm.toString());

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SHOW_OCCASIONS_KEY, JSON.stringify(showOccasions));
    } catch (e) {
      console.error(e);
    }
  }, [showOccasions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VIEW_MODE_KEY, viewMode);
    } catch (e) {
      console.error(e);
    }
  }, [viewMode]);

  // Sync jump inputs when currentDate changes
  useEffect(() => {
    setJumpYearInput(currentDate.jy.toString());
    setJumpMonthInput(currentDate.jm.toString());
  }, [currentDate.jy, currentDate.jm]);

  // High-Performance $O(1)$ Reminders Indexing
  const remindersIndex = useMemo(() => {
    const byDateKey = new Map<string, Reminder[]>();
    const dailyRecur: Reminder[] = [];
    const monthlyRecurByDay = new Map<number, Reminder[]>();

    for (const r of reminders) {
      if (r.dateType !== 'daily') continue;
      if (r.recur === 'daily') {
        dailyRecur.push(r);
      } else if (r.recur === 'monthly' && r.jd) {
        const list = monthlyRecurByDay.get(r.jd) || [];
        list.push(r);
        monthlyRecurByDay.set(r.jd, list);
      } else if (r.jy && r.jm && r.jd) {
        const key = `${r.jy}-${r.jm}-${r.jd}`;
        const list = byDateKey.get(key) || [];
        list.push(r);
        byDateKey.set(key, list);
      }
    }
    return { byDateKey, dailyRecur, monthlyRecurByDay };
  }, [reminders]);

  // Helper to query reminders for a specific date in $O(1)$
  const getRemindersForDate = (jy: number, jm: number, jd: number): Reminder[] => {
    const key = `${jy}-${jm}-${jd}`;
    const specific = remindersIndex.byDateKey.get(key) || [];
    const monthly = remindersIndex.monthlyRecurByDay.get(jd) || [];
    return [...specific, ...remindersIndex.dailyRecur, ...monthly];
  };

  // Month navigation
  const handlePrevMonth = () => {
    setSlideDirection(-1);
    let newM = currentDate.jm - 1;
    let newY = currentDate.jy;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    onChangeMonth(newY, newM);
  };

  const handleNextMonth = () => {
    setSlideDirection(1);
    let newM = currentDate.jm + 1;
    let newY = currentDate.jy;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    onChangeMonth(newY, newM);
  };

  // Week navigation
  const handlePrevWeek = () => {
    setSlideDirection(-1);
    const targetDate = addDaysToShahDate(selectedDate, -7);
    onSelectDate(targetDate);
    if (targetDate.jy !== currentDate.jy || targetDate.jm !== currentDate.jm) {
      onChangeMonth(targetDate.jy, targetDate.jm);
    }
  };

  const handleNextWeek = () => {
    setSlideDirection(1);
    const targetDate = addDaysToShahDate(selectedDate, 7);
    onSelectDate(targetDate);
    if (targetDate.jy !== currentDate.jy || targetDate.jm !== currentDate.jm) {
      onChangeMonth(targetDate.jy, targetDate.jm);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const y = parseInt(jumpYearInput, 10);
    const m = parseInt(jumpMonthInput, 10);
    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      setSlideDirection(y > currentDate.jy || (y === currentDate.jy && m > currentDate.jm) ? 1 : -1);
      onChangeMonth(y, m);
      onSelectDate({ jy: y, jm: m, jd: 1 });
      setShowJumpSelector(false);
    }
  };

  // Month days layout calculations
  const monthDaysCount = useMemo(
    () => shahMonthLength(currentDate.jy, currentDate.jm),
    [currentDate.jy, currentDate.jm]
  );
  const firstDayWeekday = useMemo(
    () => weekdayOfShahDate(currentDate.jy, currentDate.jm, 1),
    [currentDate.jy, currentDate.jm]
  );

  // Gregorian range for Month Header
  const monthGregRangeText = useMemo(() => {
    const firstGreg = toGregorian(currentDate.jy, currentDate.jm, 1);
    const lastGreg = toGregorian(currentDate.jy, currentDate.jm, monthDaysCount);
    return `${firstGreg.gd} ${GREGORIAN_MONTH_NAMES_FA[firstGreg.gm - 1]} — ${lastGreg.gd} ${GREGORIAN_MONTH_NAMES_FA[lastGreg.gm - 1]} ${lastGreg.gy}`;
  }, [currentDate.jy, currentDate.jm, monthDaysCount]);

  // Week days layout
  const weekDays = useMemo(() => getWeekDaysForShahDate(selectedDate), [selectedDate]);
  const weekFirstDay = weekDays[0];
  const weekLastDay = weekDays[6];

  const weekTitleFa = useMemo(() => {
    return `${toFa(weekFirstDay.jd)} ${MONTH_NAMES_FA[weekFirstDay.jm - 1]} تا ${toFa(weekLastDay.jd)} ${MONTH_NAMES_FA[weekLastDay.jm - 1]} ${toFa(weekLastDay.jy)}`;
  }, [weekFirstDay, weekLastDay]);

  const weekGregRangeText = useMemo(() => {
    const weekFirstGreg = toGregorian(weekFirstDay.jy, weekFirstDay.jm, weekFirstDay.jd);
    const weekLastGreg = toGregorian(weekLastDay.jy, weekLastDay.jm, weekLastDay.jd);
    return `${weekFirstGreg.gd} ${GREGORIAN_MONTH_NAMES_FA[weekFirstGreg.gm - 1]} — ${weekLastGreg.gd} ${GREGORIAN_MONTH_NAMES_FA[weekLastGreg.gm - 1]} ${weekLastGreg.gy}`;
  }, [weekFirstDay, weekLastDay]);

  // Selected Day Details
  const selectedDayTasks = useMemo(
    () => getRemindersForDate(selectedDate.jy, selectedDate.jm, selectedDate.jd),
    [selectedDate.jy, selectedDate.jm, selectedDate.jd, remindersIndex]
  );

  const selectedDayOccasions = useMemo(
    () => (showOccasions ? getOccasionsForDate(selectedDate.jm, selectedDate.jd) : []),
    [selectedDate.jm, selectedDate.jd, showOccasions]
  );

  // Close the reminders popup whenever the selected day changes
  useEffect(() => {
    setIsDayRemindersPopupOpen(false);
  }, [selectedDate.jy, selectedDate.jm, selectedDate.jd]);

  const selectedDayWeekdayIndex = weekdayOfShahDate(selectedDate.jy, selectedDate.jm, selectedDate.jd);
  const selectedDayWeekdayName = WEEKDAYS_FA[selectedDayWeekdayIndex];
  const selectedDayGreg = toGregorian(selectedDate.jy, selectedDate.jm, selectedDate.jd);

  // Motion animation variants for month slide
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : direction < 0 ? -30 : 0,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -30 : direction < 0 ? 30 : 0,
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 flex flex-col gap-5 transition-colors duration-300">
      {/* Main Calendar Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="p-4 sm:p-7 rounded-3xl glass-panel shadow-2xl transition-all duration-300 relative"
      >
        {/* Top Control Bar: [Month / Week Toggle] + [Occasions On/Off Switch] */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b ${
            isDark ? 'border-white/10' : isTurquoise ? 'border-sky-100' : 'border-stone-200'
          }`}
        >
          {/* View Mode Segmented Control (Month / Week) */}
          <div
            className={`flex items-center p-1 rounded-2xl border transition-colors relative ${
              isDark
                ? 'bg-black/40 border-white/10'
                : isTurquoise
                ? 'bg-sky-50/80 border-sky-200'
                : 'bg-stone-100/90 border-stone-200'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setSlideDirection(0);
                setViewMode('month');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors relative cursor-pointer select-none z-10 ${
                viewMode === 'month'
                  ? isTurquoise ? 'text-white font-extrabold' : 'text-stone-950 font-extrabold'
                  : isDark
                  ? 'text-stone-400 hover:text-stone-200'
                  : isTurquoise
                  ? 'text-sky-800 hover:text-sky-950'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {viewMode === 'month' && (
                <motion.div
                  layoutId="viewModePill"
                  className={`absolute inset-0 rounded-xl shadow-md -z-10 ${
                    isTurquoise ? 'bg-sky-500 shadow-sky-500/30' : 'bg-[#f27d26] shadow-[#f27d26]/30'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>ماهانه</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSlideDirection(0);
                setViewMode('week');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors relative cursor-pointer select-none z-10 ${
                viewMode === 'week'
                  ? isTurquoise ? 'text-white font-extrabold' : 'text-stone-950 font-extrabold'
                  : isDark
                  ? 'text-stone-400 hover:text-stone-200'
                  : isTurquoise
                  ? 'text-sky-800 hover:text-sky-950'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {viewMode === 'week' && (
                <motion.div
                  layoutId="viewModePill"
                  className={`absolute inset-0 rounded-xl shadow-md -z-10 ${
                    isTurquoise ? 'bg-sky-500 shadow-sky-500/30' : 'bg-[#f27d26] shadow-[#f27d26]/30'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <CalendarRange className="w-3.5 h-3.5" />
              <span>هفتگی</span>
            </button>
          </div>

          {/* National Occasions Toggle Switch */}
          <button
            type="button"
            onClick={() => setShowOccasions((prev) => !prev)}
            title={showOccasions ? 'مخفی‌سازی مناسبت‌ها' : 'نمایش مناسبت‌های ملی و باستانی'}
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border transition-all cursor-pointer select-none ${
              showOccasions
                ? isDark
                  ? 'bg-[#f27d26]/20 border-[#f27d26]/50 text-orange-300 shadow-sm shadow-[#f27d26]/20'
                  : isTurquoise
                  ? 'bg-sky-500/15 border-sky-300 text-sky-700 shadow-sm shadow-sky-500/20'
                  : 'bg-orange-50 border-[#f27d26]/50 text-orange-950'
                : isDark
                ? 'bg-white/[0.04] border-white/10 text-stone-400 hover:text-stone-200'
                : isTurquoise
                ? 'bg-white/80 border-sky-200 text-sky-800 hover:text-sky-950'
                : 'bg-white/80 border-stone-200 text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles
              className={`w-3.5 h-3.5 transition-colors ${
                showOccasions
                  ? isTurquoise ? 'text-sky-500 animate-pulse' : 'text-[#f27d26] animate-pulse'
                  : 'text-stone-400'
              }`}
            />
            <span className="text-xs font-bold">نمایش مناسبت‌ها</span>

            {/* Switch Toggle */}
            <div
              className={`w-8 h-4.5 rounded-full p-0.5 flex items-center transition-colors duration-300 ${
                showOccasions
                  ? isTurquoise ? 'bg-sky-500' : 'bg-[#f27d26]'
                  : isDark ? 'bg-stone-700' : 'bg-stone-300'
              }`}
            >
              <div
                style={{ transform: showOccasions ? 'translateX(-14px)' : 'translateX(0)' }}
                className="w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-200"
              />
            </div>
          </button>
        </div>

        {/* Navigation Bar (Month or Week depending on mode) */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Previous Button */}
          <button
            type="button"
            onClick={viewMode === 'month' ? handlePrevMonth : handlePrevWeek}
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95 ${
              isDark
                ? 'bg-white/[0.05] hover:bg-[#f27d26]/20 hover:border-[#f27d26]/50 text-[#f27d26] border-white/10'
                : isTurquoise
                ? 'bg-white/90 hover:bg-sky-50 hover:border-sky-300 text-sky-600 border-sky-200 shadow-xs'
                : 'bg-white/90 hover:bg-orange-50 hover:border-[#f27d26]/50 text-[#c75a10] border-stone-200 shadow-xs'
            }`}
            title={viewMode === 'month' ? 'ماه قبل' : 'هفته قبل'}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Title and Gregorian Range */}
          {viewMode === 'month' ? (
            <button
              type="button"
              onClick={() => {
                setJumpYearInput(currentDate.jy.toString());
                setJumpMonthInput(currentDate.jm.toString());
                setShowJumpSelector(!showJumpSelector);
              }}
              className={`group flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all cursor-pointer ${
                isDark ? 'hover:bg-white/5' : isTurquoise ? 'hover:bg-sky-50/70' : 'hover:bg-stone-100/70'
              }`}
              title="برای تغییر ماه و سال کلیک کنید"
            >
              <span
                className={`text-xl sm:text-2xl font-black tracking-normal flex items-center gap-2 transition-colors ${
                  isDark
                    ? 'text-white group-hover:text-[#f27d26]'
                    : isTurquoise
                    ? 'text-slate-800 group-hover:text-sky-600'
                    : 'text-stone-900 group-hover:text-[#f27d26]'
                }`}
              >
                <span>{MONTH_NAMES_FA[currentDate.jm - 1]}</span>
                <span className={`font-extrabold ${isTurquoise ? 'text-sky-500' : 'text-[#f27d26]'}`}>
                  {toFa(currentDate.jy)}
                </span>
              </span>
              <span
                className={`text-[11px] font-medium tracking-normal mt-0.5 ${
                  isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-500' : 'text-stone-500'
                }`}
              >
                {monthGregRangeText}
              </span>
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center px-2 py-1">
              <span
                className={`text-lg sm:text-xl font-black tracking-normal flex items-center gap-2 ${
                  isDark ? 'text-white' : isTurquoise ? 'text-slate-800' : 'text-stone-900'
                }`}
              >
                <span>هفته</span>
                <span className={isTurquoise ? 'text-sky-500' : 'text-[#f27d26]'}>{weekTitleFa}</span>
              </span>
              <span
                className={`text-[11px] font-medium tracking-normal mt-0.5 ${
                  isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-500' : 'text-stone-500'
                }`}
              >
                {weekGregRangeText}
              </span>
            </div>
          )}

          {/* Next Button */}
          <button
            type="button"
            onClick={viewMode === 'month' ? handleNextMonth : handleNextWeek}
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95 ${
              isDark
                ? 'bg-white/[0.05] hover:bg-[#f27d26]/20 hover:border-[#f27d26]/50 text-[#f27d26] border-white/10'
                : isTurquoise
                ? 'bg-white/90 hover:bg-sky-50 hover:border-sky-300 text-sky-600 border-sky-200 shadow-xs'
                : 'bg-white/90 hover:bg-orange-50 hover:border-[#f27d26]/50 text-[#c75a10] border-stone-200 shadow-xs'
            }`}
            title={viewMode === 'month' ? 'ماه بعد' : 'هفته بعد'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Jump to Month/Year Drawer */}
        <AnimatePresence>
          {viewMode === 'month' && showJumpSelector && (
            <motion.form
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onSubmit={handleJumpSubmit}
              className={`mb-6 p-4 rounded-2xl border flex flex-wrap items-center justify-center gap-3 overflow-hidden shadow-xl ${
                isDark ? 'bg-[#141418]/95 border-[#f27d26]/40' : 'bg-white/95 border-stone-200 shadow-stone-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <label className={`text-xs font-bold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  ماه:
                </label>
                <select
                  value={jumpMonthInput}
                  onChange={(e) => setJumpMonthInput(e.target.value)}
                  className={`text-xs rounded-xl px-3 py-2 border outline-none focus:border-[#f27d26] ${
                    isDark
                      ? 'bg-[#1f1f25] text-stone-100 border-white/15'
                      : 'bg-stone-50 text-stone-900 border-stone-300'
                  }`}
                >
                  {MONTH_NAMES_FA.map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className={`text-xs font-bold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  سال شاهنشاهی:
                </label>
                <input
                  type="number"
                  value={jumpYearInput}
                  onChange={(e) => setJumpYearInput(e.target.value)}
                  className={`w-24 text-xs rounded-xl px-3 py-2 border outline-none text-center focus:border-[#f27d26] ${
                    isDark
                      ? 'bg-[#1f1f25] text-stone-100 border-white/15'
                      : 'bg-stone-50 text-stone-900 border-stone-300'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#f27d26] text-stone-950 text-xs font-bold rounded-xl hover:bg-[#ff8a38] transition cursor-pointer shadow-sm active:scale-95"
              >
                برو
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* ----------------- MODE 1: MONTH VIEW ----------------- */}
        {viewMode === 'month' && (
          <div>
            {/* Weekday Names Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {WEEKDAYS_SHORT_FA.map((dayName, idx) => {
                const isFriday = idx === 6;
                return (
                  <div
                    key={dayName}
                    className={`text-center py-2 text-xs font-bold ${
                      isFriday
                        ? isDark
                          ? 'text-rose-400 font-black'
                          : 'text-rose-600 font-black'
                        : isDark
                        ? 'text-[#f27d26]/90'
                        : 'text-[#c75a10]'
                    }`}
                  >
                    {dayName}
                  </div>
                );
              })}
            </div>

            {/* Calendar Days Grid with Slide Animation */}
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={`${currentDate.jy}-${currentDate.jm}`}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="grid grid-cols-7 gap-1 sm:gap-2"
              >
                {/* Empty spacer cells before first day */}
                {Array.from({ length: firstDayWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square opacity-0 pointer-events-none" />
                ))}

                {/* Actual Month Days */}
                {Array.from({ length: monthDaysCount }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSelected =
                    selectedDate.jy === currentDate.jy &&
                    selectedDate.jm === currentDate.jm &&
                    selectedDate.jd === dayNum;

                  const isToday =
                    today.jy === currentDate.jy &&
                    today.jm === currentDate.jm &&
                    today.jd === dayNum;

                  const isFriday = (firstDayWeekday + i) % 7 === 6;

                  const occasions = showOccasions ? getOccasionsForDate(currentDate.jm, dayNum) : [];
                  const hasOccasion = showOccasions && occasions.length > 0;
                  const dayReminders = getRemindersForDate(currentDate.jy, currentDate.jm, dayNum);
                  const hasReminder = dayReminders.length > 0;
                  const hasImportant = dayReminders.some((r) => r.important && !r.done);

                  return (
                    <DayCell
                      key={`day-${dayNum}`}
                      dayNum={dayNum}
                      currentJy={currentDate.jy}
                      currentJm={currentDate.jm}
                      isSelected={isSelected}
                      isToday={isToday}
                      isFriday={isFriday}
                      showOccasions={showOccasions}
                      hasOccasion={hasOccasion}
                      hasReminder={hasReminder}
                      hasImportant={hasImportant}
                      isDark={isDark}
                      isTurquoise={isTurquoise}
                      onSelect={onSelectDate}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ----------------- MODE 2: WEEKLY VIEW ----------------- */}
        {viewMode === 'week' && (
          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key={`${selectedDate.jy}-${selectedDate.jm}-${selectedDate.jd}`}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 sm:grid-cols-7 gap-2.5"
            >
              {weekDays.map((dayDate, idx) => {
                const weekdayIndex = weekdayOfShahDate(dayDate.jy, dayDate.jm, dayDate.jd);
                const weekdayName = WEEKDAYS_FA[weekdayIndex];
                const isFriday = weekdayIndex === 6;
                const isSelected = isSameShahDate(selectedDate, dayDate);
                const isToday = isSameShahDate(today, dayDate);

                const greg = toGregorian(dayDate.jy, dayDate.jm, dayDate.jd);
                const occasions = showOccasions ? getOccasionsForDate(dayDate.jm, dayDate.jd) : [];
                const dayReminders = getRemindersForDate(dayDate.jy, dayDate.jm, dayDate.jd);
                const hasOccasion = showOccasions && occasions.length > 0;

                return (
                  <button
                    type="button"
                    key={`week-day-${idx}`}
                    onClick={() => {
                      onSelectDate(dayDate);
                      if (dayDate.jy !== currentDate.jy || dayDate.jm !== currentDate.jm) {
                        onChangeMonth(dayDate.jy, dayDate.jm);
                      }
                    }}
                    className={`relative p-3 rounded-2xl border flex flex-col items-center justify-between gap-2 text-center cursor-pointer min-h-[140px] sm:min-h-[160px] select-none transition-all active:scale-95 ${
                      isSelected
                        ? isTurquoise
                          ? 'bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-500/40 border-transparent z-10'
                          : 'bg-gradient-to-b from-[#f27d26] to-[#d66512] text-stone-950 shadow-lg shadow-[#f27d26]/40 border-transparent z-10'
                        : isDark
                        ? 'bg-[#181822]/80 backdrop-blur-md border-white/10 hover:bg-[#282836]/90 hover:border-[#f27d26]/50 text-stone-100 shadow-sm'
                        : isTurquoise
                        ? 'bg-white/90 backdrop-blur-md border-sky-200 hover:bg-sky-50/95 hover:border-sky-300 text-slate-800 shadow-xs'
                        : 'bg-white/90 backdrop-blur-md border-stone-200 hover:bg-orange-50/95 hover:border-[#f27d26]/50 text-stone-800 shadow-xs'
                    }`}
                  >
                    {/* Today indicator badge */}
                    {isToday && !isSelected && (
                      <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                        isTurquoise ? 'bg-sky-500 ring-4 ring-sky-500/20' : 'bg-[#f27d26] ring-4 ring-[#f27d26]/20'
                      }`} />
                    )}

                    {/* Weekday name */}
                    <div className="w-full pb-1 border-b border-current/10">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? isTurquoise ? 'text-white font-black' : 'text-stone-950 font-black'
                            : isFriday
                            ? isDark
                              ? 'text-rose-400 font-black'
                              : 'text-rose-600 font-black'
                            : isDark
                            ? 'text-stone-300'
                            : isTurquoise
                            ? 'text-sky-800'
                            : 'text-stone-600'
                        }`}
                      >
                        {weekdayName}
                      </span>
                    </div>

                    {/* Main Persian Day Number */}
                    <div className="my-1 flex flex-col items-center">
                      <span
                        className={`text-2xl sm:text-3xl font-black leading-none ${
                          isSelected ? (isTurquoise ? 'text-white font-black' : 'text-stone-950 font-black') : isDark ? 'text-stone-100' : isTurquoise ? 'text-slate-800' : 'text-stone-900'
                        }`}
                      >
                        {toFa(dayDate.jd)}
                      </span>
                      <span
                        className={`text-[10px] font-bold mt-1 ${
                          isSelected ? (isTurquoise ? 'text-sky-100' : 'text-stone-900') : isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-400' : 'text-stone-500'
                        }`}
                      >
                        {MONTH_NAMES_FA[dayDate.jm - 1]}
                      </span>
                    </div>

                    {/* Gregorian info */}
                    <div
                      className={`text-[10px] font-medium ${
                        isSelected ? (isTurquoise ? 'text-sky-100' : 'text-stone-900/90') : isDark ? 'text-stone-400/90' : isTurquoise ? 'text-slate-400' : 'text-stone-500'
                      }`}
                    >
                      {greg.gd} {GREGORIAN_MONTH_NAMES_FA[greg.gm - 1].slice(0, 3)}
                    </div>

                    {/* Occasions / Reminders Pills */}
                    <div className="w-full flex flex-col gap-1 mt-1">
                      {hasOccasion && (
                        <div
                          className={`text-[10px] py-0.5 px-1 rounded-md font-bold truncate ${
                            isSelected
                              ? isTurquoise ? 'bg-white/20 text-white' : 'bg-stone-950/20 text-stone-950'
                              : isDark
                              ? 'bg-[#f27d26]/20 text-[#f27d26] border border-[#f27d26]/30'
                              : isTurquoise
                              ? 'bg-sky-100 text-sky-700 border border-sky-200'
                              : 'bg-orange-100 text-[#c75a10] border border-orange-200'
                          }`}
                          title={occasions.map((o) => o.name).join(' • ')}
                        >
                          <span className="truncate">{occasions[0].name}</span>
                        </div>
                      )}

                      {dayReminders.length > 0 && (
                        <div
                          className={`text-[10px] py-0.5 px-1 rounded-md font-bold flex items-center justify-center gap-1 ${
                            isSelected
                              ? isTurquoise ? 'bg-sky-900 text-white' : 'bg-stone-950 text-white'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          <span>{toFa(dayReminders.length)} یادآور</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Legend */}
        <div
          className={`flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t text-[11px] ${
            isDark ? 'border-white/5 text-stone-400' : 'border-stone-200 text-stone-600'
          }`}
        >
          {showOccasions && (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f27d26]" />
              <span>مناسبت ملی / باستانی</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>یادآور</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
            <span>مهم</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-lg border border-[#f27d26] inline-block" />
            <span>امروز</span>
          </div>
        </div>
      </motion.div>

      {/* ----------------- SELECTED DAY INTERACTIVE PANEL ----------------- */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 sm:p-6 rounded-3xl border shadow-xl transition-all ${
          isDark
            ? 'bg-[#14141a]/90 backdrop-blur-xl border-white/10 shadow-black/40'
            : isTurquoise
            ? 'bg-white/95 backdrop-blur-xl border-sky-100 shadow-sky-900/5'
            : 'bg-white/95 backdrop-blur-xl border-stone-200 shadow-stone-200/50'
        }`}
      >
        {/* Day Header */}
        <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b ${
          isDark ? 'border-white/10' : isTurquoise ? 'border-sky-100' : 'border-stone-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
              isTurquoise
                ? 'bg-sky-500/20 text-sky-600'
                : 'bg-[#f27d26]/20 text-[#f27d26]'
            }`}>
              {toFa(selectedDate.jd)}
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : isTurquoise ? 'text-slate-800' : 'text-stone-900'}`}>
                {selectedDayWeekdayName}، {toFa(selectedDate.jd)} {MONTH_NAMES_FA[selectedDate.jm - 1]} {toFa(selectedDate.jy)}
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-500' : 'text-stone-500'}`}>
                معادل میلادی: {selectedDayGreg.gd} {GREGORIAN_MONTH_NAMES_FA[selectedDayGreg.gm - 1]} {selectedDayGreg.gy}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => selectedDayTasks.length > 0 && setIsDayRemindersPopupOpen(true)}
            disabled={selectedDayTasks.length === 0}
            className={`text-xs font-bold px-3 py-1 rounded-xl border transition cursor-pointer disabled:cursor-default flex items-center gap-1.5 ${
              selectedDayTasks.length > 0
                ? isTurquoise
                  ? 'bg-sky-500/15 border-sky-500/30 text-sky-700 hover:bg-sky-500/25'
                  : 'bg-sky-500/15 border-sky-500/30 text-sky-500 hover:bg-sky-500/25'
                : isDark
                ? 'bg-white/5 border-white/10 text-stone-400'
                : isTurquoise
                ? 'bg-sky-50 border-sky-100 text-sky-800'
                : 'bg-stone-100 border-stone-200 text-stone-600'
            }`}
          >
            <span>{selectedDayTasks.length > 0 ? `${toFa(selectedDayTasks.length)} یادآور برای این روز` : 'بدون یادآور'}</span>
            {selectedDayTasks.length > 0 && <ListTodo className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Occasions summary for this day if any */}
        {showOccasions && selectedDayOccasions.length > 0 && (
          <div className="space-y-2">
            {selectedDayOccasions.map((occ, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs ${
                  isDark
                    ? 'bg-[#f27d26]/12 border-[#f27d26]/30 text-orange-200'
                    : isTurquoise
                    ? 'bg-sky-50 border-sky-200 text-slate-800'
                    : 'bg-orange-50 border-orange-200 text-orange-950'
                }`}
              >
                <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${isTurquoise ? 'text-sky-500' : 'text-[#f27d26]'}`} />
                <div>
                  <strong className="font-bold">{occ.name}</strong>
                  <p className="text-[11px] opacity-85 mt-0.5">{occ.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Reminders Popup for the Selected Day */}
      <AnimatePresence>
        {isDayRemindersPopupOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex min-h-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDayRemindersPopupOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className={`relative z-10 w-full max-w-md max-h-[80vh] overflow-y-auto p-5 rounded-3xl border shadow-2xl flex flex-col gap-3 overscroll-contain my-auto ${
                isDark
                  ? 'bg-[#141418] border-white/10 text-stone-100'
                  : isTurquoise
                  ? 'bg-white text-slate-800 border-sky-200 shadow-sky-950/10'
                  : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b sticky top-0 z-10 ${
                  isDark
                    ? 'bg-[#141418] border-white/10'
                    : isTurquoise
                    ? 'bg-white border-sky-100'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div>
                  <h3 className={`text-sm font-black ${isDark ? 'text-white' : isTurquoise ? 'text-slate-800' : 'text-stone-900'}`}>
                    یادآورهای {selectedDayWeekdayName}
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-500' : 'text-stone-500'}`}>
                    {toFa(selectedDate.jd)} {MONTH_NAMES_FA[selectedDate.jm - 1]} {toFa(selectedDate.jy)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDayRemindersPopupOpen(false)}
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

              <div className="space-y-2">
                {selectedDayTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      t.done
                        ? isDark
                          ? 'bg-white/[0.02] border-white/5 opacity-60'
                          : 'bg-stone-100/60 border-stone-200 opacity-60'
                        : isDark
                        ? 'bg-white/[0.04] border-white/10 hover:border-[#f27d26]/30'
                        : isTurquoise
                        ? 'bg-sky-50/40 border-sky-100 hover:border-sky-300'
                        : 'bg-white border-stone-200 hover:border-[#f27d26]/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {onToggleReminder && (
                        <button
                          type="button"
                          onClick={() => onToggleReminder(t.id)}
                          className="text-stone-400 hover:text-[#f27d26] transition cursor-pointer shrink-0"
                        >
                          {t.done ? (
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-4.5 h-4.5" />
                          )}
                        </button>
                      )}

                      <span
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          t.done
                            ? 'line-through text-stone-500'
                            : isDark
                            ? 'text-stone-100'
                            : isTurquoise
                            ? 'text-slate-800'
                            : 'text-stone-900'
                        }`}
                      >
                        {t.title}
                      </span>

                      {t.important && <Star className="w-3 h-3 fill-amber-400 stroke-amber-500 shrink-0" />}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[11px] opacity-80">
                      {t.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{t.time}</span>
                        </span>
                      )}
                      {t.recur !== 'none' && (
                        <span className="flex items-center gap-1 text-sky-400">
                          <RotateCw className="w-2.5 h-2.5" />
                          <span>{t.recur === 'daily' ? 'روزانه' : 'ماهانه'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dedicated Occasion Box under the Calendar */}
      {showOccasions && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <OccasionCard
            selectedDate={selectedDate}
            theme={theme}
            onSelectDayInMonth={(day) => {
              onSelectDate({
                jy: currentDate.jy,
                jm: currentDate.jm,
                jd: day,
              });
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

