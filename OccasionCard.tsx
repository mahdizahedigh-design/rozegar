import React, { useState } from 'react';
import { Sparkles, CalendarDays, ChevronDown, ChevronUp, Landmark } from 'lucide-react';
import { ShahDate, ThemeMode } from '../types';
import { MONTH_NAMES_FA, toFa, WEEKDAYS_FA, weekdayOfShahDate } from '../utils/calendar';
import { getOccasionsForDate, getMonthOccasions } from '../data/occasions';

interface OccasionCardProps {
  selectedDate: ShahDate;
  theme?: ThemeMode;
  onSelectDayInMonth?: (day: number) => void;
}

export const OccasionCard: React.FC<OccasionCardProps> = ({
  selectedDate,
  theme = 'dark',
  onSelectDayInMonth,
}) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';
  const [showMonthList, setShowMonthList] = useState(false);

  const dailyOccasions = getOccasionsForDate(selectedDate.jm, selectedDate.jd);
  const monthOccasions = getMonthOccasions(selectedDate.jm);
  const weekdayIndex = weekdayOfShahDate(selectedDate.jy, selectedDate.jm, selectedDate.jd);
  const weekdayName = WEEKDAYS_FA[weekdayIndex];
  const monthName = MONTH_NAMES_FA[selectedDate.jm - 1];

  return (
    <div className="w-full mt-3 flex flex-col gap-3 transition-colors duration-300">
      {/* Selected Day Occasion Box */}
      <div
        className={`p-4 rounded-3xl border shadow-lg transition-all ${
          isDark
            ? 'bg-[#14141a]/85 backdrop-blur-xl border-[#f27d26]/40 text-stone-100 shadow-black/40'
            : isTurquoise
            ? 'bg-white/95 backdrop-blur-xl border-sky-200 text-slate-800 shadow-sky-900/5'
            : 'bg-white/90 backdrop-blur-xl border-stone-200 text-stone-900 shadow-stone-200/50'
        }`}
      >
        <div
          className={`flex items-center justify-between gap-2 mb-2 pb-2 border-b ${
            isDark ? 'border-white/10' : isTurquoise ? 'border-sky-100' : 'border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles
              className={`w-4 h-4 shrink-0 ${isTurquoise ? 'text-sky-500' : 'text-[#f27d26]'}`}
            />
            <span
              className={`text-xs font-bold ${
                isDark ? 'text-[#f27d26]' : isTurquoise ? 'text-sky-700' : 'text-[#c75a10]'
              }`}
            >
              مناسبت روز: {weekdayName} {toFa(selectedDate.jd)} {monthName}
            </span>
          </div>
          <span
            className={`text-[11px] font-medium ${
              isDark ? 'text-stone-400' : isTurquoise ? 'text-sky-800/70' : 'text-stone-500'
            }`}
          >
            سال {toFa(selectedDate.jy)} شاهنشاهی
          </span>
        </div>

        {dailyOccasions.length > 0 ? (
          <div className="space-y-2.5">
            {dailyOccasions.map((occ, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                  isDark
                    ? 'bg-[#f27d26]/12 border-[#f27d26]/25 text-stone-200'
                    : isTurquoise
                    ? 'bg-sky-50/80 border-sky-200 text-slate-800'
                    : 'bg-orange-50/80 border-orange-200 text-stone-800'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                    isDark
                      ? 'bg-[#f27d26]/20 text-[#f27d26]'
                      : isTurquoise
                      ? 'bg-sky-500/20 text-sky-600'
                      : 'bg-orange-100 text-[#c75a10]'
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-bold ${
                      isDark
                        ? 'text-orange-300'
                        : isTurquoise
                        ? 'text-sky-900'
                        : 'text-stone-900'
                    }`}
                  >
                    {occ.name}
                  </h4>
                  <p
                    className={`text-xs leading-relaxed mt-1 ${
                      isDark
                        ? 'text-stone-300'
                        : isTurquoise
                        ? 'text-slate-600'
                        : 'text-stone-700'
                    }`}
                  >
                    {occ.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2 text-center">
            <p
              className={`text-xs ${
                isDark ? 'text-stone-400' : isTurquoise ? 'text-sky-800/70' : 'text-stone-500'
              }`}
            >
              برای {toFa(selectedDate.jd)} {monthName} مناسبت خاصی در دیتابیس ثبت نشده است.
            </p>
          </div>
        )}

        {/* Toggle to see all occasions in this month */}
        <div
          className={`mt-3 pt-2.5 border-t flex items-center justify-between ${
            isDark ? 'border-white/5' : isTurquoise ? 'border-sky-100' : 'border-stone-100'
          }`}
        >
          <span
            className={`text-[11px] font-medium ${
              isDark ? 'text-stone-400' : isTurquoise ? 'text-sky-800/70' : 'text-stone-500'
            }`}
          >
            کل مناسبت‌های ماه {monthName}: {toFa(monthOccasions.length)} رویداد
          </span>
          <button
            onClick={() => setShowMonthList(!showMonthList)}
            className={`flex items-center gap-1 text-xs font-bold transition cursor-pointer ${
              isDark
                ? 'text-[#f27d26] hover:text-orange-300'
                : isTurquoise
                ? 'text-sky-600 hover:text-sky-800'
                : 'text-[#c75a10] hover:text-orange-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{showMonthList ? 'بستن لیست ماه' : 'مشاهده همه مناسبت‌های ماه'}</span>
            {showMonthList ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Accordion / Full Month Occasions List */}
      {showMonthList && (
        <div
          className={`p-4 rounded-3xl border shadow-xl transition-all animate-fadeIn ${
            isDark
              ? 'bg-[#141418]/50 border-white/10'
              : isTurquoise
              ? 'bg-white/90 border-sky-100 shadow-sky-900/5'
              : 'bg-white/70 border-stone-200 shadow-stone-200/40'
          }`}
        >
          <h4
            className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${
              isDark ? 'text-stone-200' : isTurquoise ? 'text-sky-900' : 'text-stone-800'
            }`}
          >
            <CalendarDays
              className={`w-4 h-4 ${isTurquoise ? 'text-sky-500' : 'text-[#f27d26]'}`}
            />
            <span>رویدادها و جشن‌های کهن ماه {monthName}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {monthOccasions.map((occ, idx) => {
              const isSelectedDay = occ.jd === selectedDate.jd;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectDayInMonth && onSelectDayInMonth(occ.jd)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelectedDay
                      ? isDark
                        ? 'bg-[#f27d26]/20 border-[#f27d26]/50 text-white'
                        : isTurquoise
                        ? 'bg-sky-100 border-sky-400 text-sky-950 shadow-xs'
                        : 'bg-orange-100 border-[#f27d26]/50 text-stone-950'
                      : isDark
                      ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-stone-300'
                      : isTurquoise
                      ? 'bg-sky-50/50 hover:bg-sky-50 border-sky-100 text-slate-700'
                      : 'bg-stone-50 hover:bg-orange-50/60 border-stone-200 text-stone-700'
                  }`}
                >
                  <div
                    className={`px-2 py-1 rounded-xl text-xs font-black shrink-0 ${
                      isSelectedDay
                        ? isTurquoise
                          ? 'bg-sky-600 text-white'
                          : 'bg-[#f27d26] text-stone-950'
                        : isDark
                        ? 'bg-white/10 text-orange-300'
                        : isTurquoise
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-orange-100 text-[#c75a10]'
                    }`}
                  >
                    {toFa(occ.jd)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold truncate">{occ.name}</h5>
                    <p className="text-[10px] opacity-75 line-clamp-2 leading-relaxed mt-0.5">
                      {occ.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
