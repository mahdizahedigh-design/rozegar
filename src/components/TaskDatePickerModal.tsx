import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  RotateCw,
  Star,
  Folder as FolderIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { ShahDate, RecurrenceType, ThemeMode, Reminder, TaskPriority } from '../types';
import {
  MONTH_NAMES_FA,
  WEEKDAYS_SHORT_FA,
  WEEKDAYS_FA,
  toFa,
  shahMonthLength,
  weekdayOfShahDate,
  toGregorian,
  GREGORIAN_MONTH_NAMES_FA,
  toShahDateKey,
  getTodayShahanshahi,
} from '../utils/calendar';
import { getOccasionsForDate } from '../data/occasions';

interface TaskDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskData: Omit<Reminder, 'id' | 'createdAt'>) => void;
  initialDate?: ShahDate;
  initialTitle?: string;
  initialTime?: string;
  initialPriority?: TaskPriority;
  folders: string[];
  theme?: ThemeMode;
}

export const TaskDatePickerModal: React.FC<TaskDatePickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialDate,
  initialTitle = '',
  initialTime = '',
  initialPriority = 'silver',
  folders,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';

  const defaultDate = initialDate || getTodayShahanshahi();

  // Form states
  const [title, setTitle] = useState(initialTitle);
  const [time, setTime] = useState(initialTime);
  const [folder, setFolder] = useState('');
  const [recur, setRecur] = useState<RecurrenceType>('none');
  const [priority, setPriority] = useState<TaskPriority>(initialPriority);

  // Exact target date picker state (Year, Month, Day)
  const [viewYear, setViewYear] = useState<number>(defaultDate.jy);
  const [viewMonth, setViewMonth] = useState<number>(defaultDate.jm);
  const [chosenDay, setChosenDay] = useState<number>(defaultDate.jd);

  // Quick year dropdown or custom year typing
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const base = initialDate || getTodayShahanshahi();
      setTitle(initialTitle);
      setTime(initialTime);
      setViewYear(base.jy);
      setViewMonth(base.jm);
      setChosenDay(base.jd);
      setFolder('');
      setRecur('none');
      setPriority(initialPriority);
      setIsYearPickerOpen(false);
    }
  }, [isOpen, initialDate, initialTitle, initialTime, initialPriority]);

  if (!isOpen) return null;

  // Selected date info
  const targetDate: ShahDate = {
    jy: viewYear,
    jm: viewMonth,
    jd: chosenDay,
  };

  const targetDateKey = toShahDateKey(targetDate);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onConfirm({
      title: title.trim(),
      time: time.trim() || undefined,
      folder: folder.trim() || undefined,
      important: priority === 'gold',
      priority,
      recur,
      done: false,
      dateType: 'daily',
      dateKey: targetDateKey,
      jy: targetDate.jy,
      jm: targetDate.jm,
      jd: targetDate.jd,
    });

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
          className={`relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border shadow-2xl flex flex-col gap-4 overscroll-contain my-auto ${
            isDark
              ? 'bg-[#141418] border-white/10 text-stone-100'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between pb-3 border-b sticky top-0 bg-inherit z-20 ${
              isDark ? 'border-white/10' : 'border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#f27d26]/20 text-[#f27d26] flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  ثبت یادآور زمان‌دار (انتخاب دقیق تاریخ)
                </h3>
                <p
                  className={`text-[11px] font-medium ${
                    isDark ? 'text-stone-400' : 'text-stone-500'
                  }`}
                >
                  تعیین دقیق سال، ماه و روز برای ثبت فقط روی این تاریخ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'border-white/10 hover:bg-white/10 text-stone-400 hover:text-white'
                  : 'border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-90">
                عنوان یادآور <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: جلسه کاری با تیم، خرید هدیه، پرداخت قبض..."
                className={`w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border outline-none transition focus:border-[#f27d26] ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-stone-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
                }`}
              />
            </div>

            {/* Interactive Exact Date Selector Box */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col gap-3 ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-orange-50/40 border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-[#f27d26]">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>تقویم انتخاب تاریخ</span>
                </span>

                {/* Selected Date Badge */}
                <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-[#f27d26] text-stone-950 shadow-xs">
                  {weekdayName} {toFa(chosenDay)} {MONTH_NAMES_FA[viewMonth - 1]} {toFa(viewYear)}
                </span>
              </div>

              {/* Month/Year Navigation Bar */}
              <div
                className={`flex items-center justify-between p-2 rounded-xl border ${
                  isDark ? 'bg-[#1a1a22] border-white/5' : 'bg-white border-stone-200 shadow-xs'
                }`}
              >
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-[#f27d26]/20 text-[#f27d26] transition cursor-pointer"
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
                          : 'bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      <span>سال {toFa(viewYear)}</span>
                    </button>

                    {isYearPickerOpen && (
                      <div
                        className={`absolute top-full mt-1 left-0 z-30 p-2 rounded-xl border shadow-xl flex flex-col gap-1 w-32 max-h-40 overflow-y-auto ${
                          isDark ? 'bg-[#181820] border-white/15' : 'bg-white border-stone-200'
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
                                ? 'bg-[#f27d26] text-stone-950 font-bold'
                                : isDark
                                ? 'hover:bg-white/10 text-stone-300'
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
                  className="p-1.5 rounded-lg hover:bg-[#f27d26]/20 text-[#f27d26] transition cursor-pointer"
                  title="ماه بعد"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Mini Calendar Grid for Day Selection */}
              <div className="space-y-1">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 py-1">
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
                            ? 'bg-[#f27d26] text-stone-950 font-black shadow-md shadow-[#f27d26]/40 scale-105 z-10'
                            : isFri
                            ? isDark
                              ? 'text-rose-400 hover:bg-white/5'
                              : 'text-rose-600 hover:bg-orange-50'
                            : isDark
                            ? 'text-stone-200 hover:bg-white/5'
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
                <div className={`flex items-center justify-between ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  <span>معادل تقویم میلادی:</span>
                  <span className="font-semibold">
                    {greg.gd} {GREGORIAN_MONTH_NAMES_FA[greg.gm - 1]} {greg.gy}
                  </span>
                </div>
                {dayOccasions.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium truncate mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#f27d26]" />
                    <span className="truncate">مناسبت: {dayOccasions.map((o) => o.name).join('، ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Time, Folder, Recurrence & Importance Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Time Picker */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>ساعت یادآوری (اختیاری)</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border outline-none ${
                    isDark
                      ? 'bg-black/30 text-stone-200 border-white/10'
                      : 'bg-stone-50 text-stone-900 border-stone-200'
                  }`}
                />
              </div>

              {/* Folder Selector */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80 flex items-center gap-1">
                  <FolderIcon className="w-3.5 h-3.5 text-stone-400" />
                  <span>دسته‌بندی / پوشه</span>
                </label>
                <select
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border outline-none ${
                    isDark
                      ? 'bg-[#18181e] text-stone-200 border-white/10'
                      : 'bg-stone-50 text-stone-900 border-stone-200'
                  }`}
                >
                  <option value="">بدون پوشه (عمومی)</option>
                  {folders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recurrence Mode */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 text-stone-400" />
                  <span>الگوی تکرار</span>
                </label>
                <select
                  value={recur}
                  onChange={(e) => setRecur(e.target.value as RecurrenceType)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border outline-none ${
                    isDark
                      ? 'bg-[#18181e] text-stone-200 border-white/10'
                      : 'bg-stone-50 text-stone-900 border-stone-200'
                  }`}
                >
                  <option value="none">فقط همین یک روز (یک‌باره)</option>
                  <option value="daily">هر روز (تکرار روزانه)</option>
                  <option value="monthly">هر ماه در روز {toFa(chosenDay)}ام (تکرار ماهانه)</option>
                </select>
              </div>

              {/* Priority Selector (Gold, Silver, Bronze) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-1.5 opacity-80 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#f27d26]" />
                  <span>سطح اولویت کار</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Gold / High */}
                  <button
                    type="button"
                    onClick={() => setPriority('gold')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[44px] ${
                      priority === 'gold'
                        ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-300 border-amber-400/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                        : isDark
                        ? 'bg-white/[0.02] text-stone-400 border-white/10 hover:bg-white/5'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50/50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 shadow-xs shadow-amber-400" />
                    <span>زرین (بالا)</span>
                  </button>

                  {/* Silver / Medium */}
                  <button
                    type="button"
                    onClick={() => setPriority('silver')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[44px] ${
                      priority === 'silver'
                        ? isTurquoise
                          ? 'bg-sky-500/25 text-sky-200 border-sky-400/60 ring-1 ring-sky-400 shadow-md'
                          : 'bg-slate-400/25 text-slate-200 border-slate-300/60 ring-1 ring-slate-300 shadow-md'
                        : isDark
                        ? 'bg-white/[0.02] text-stone-400 border-white/10 hover:bg-white/5'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0 shadow-xs shadow-slate-300" />
                    <span>سیمین (متوسط)</span>
                  </button>

                  {/* Bronze / Normal */}
                  <button
                    type="button"
                    onClick={() => setPriority('bronze')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer min-h-[44px] ${
                      priority === 'bronze'
                        ? 'bg-amber-800/25 text-amber-200 border-amber-700/60 ring-1 ring-amber-700 shadow-md'
                        : isDark
                        ? 'bg-white/[0.02] text-stone-400 border-white/10 hover:bg-white/5'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-orange-50/40'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#cd7f32] shrink-0 shadow-xs" />
                    <span>برنز (معمولی)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-current/10">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isDark
                    ? 'border-white/10 hover:bg-white/5 text-stone-400 hover:text-white'
                    : 'border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900'
                }`}
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#f27d26] text-stone-950 text-xs font-black rounded-xl hover:bg-[#ff8a38] transition cursor-pointer shadow-lg shadow-[#f27d26]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>ثبت قطعی یادآور</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
