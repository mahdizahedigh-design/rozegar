import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Timer, Plus, Trash2, Cake } from 'lucide-react';
import { Countdown, ShahDate, ThemeMode, UserProfile } from '../types';
import {
  MONTH_NAMES_FA,
  toFa,
  shahMonthLength,
  daysUntilShahDate,
  nextOccurrenceOfMonthDay,
  getTodayShahanshahi,
} from '../utils/calendar';

interface CountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
  countdowns: Countdown[];
  onAddCountdown: (data: Omit<Countdown, 'id' | 'createdAt'>) => void;
  onDeleteCountdown: (id: string) => void;
  userProfile: UserProfile | null;
}

const daysLabel = (n: number): string => {
  if (n === 0) return 'امروزه!';
  if (n < 0) return `${toFa(Math.abs(n))} روز پیش گذشت`;
  return `${toFa(n)} روز مانده`;
};

export const CountdownModal: React.FC<CountdownModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  countdowns,
  onAddCountdown,
  onDeleteCountdown,
  userProfile,
}) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';
  const accent = isTurquoise ? 'text-sky-600' : 'text-[#f27d26]';
  const accentBtn = isTurquoise
    ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
    : 'bg-[#f27d26] hover:bg-[#ff8a38] text-stone-950 shadow-[#f27d26]/20';

  const today = getTodayShahanshahi();
  const [title, setTitle] = useState('');
  const [d, setD] = useState(today.jd);
  const [m, setM] = useState(today.jm);
  const [y, setY] = useState(today.jy);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddCountdown({ title: title.trim(), jy: y, jm: m, jd: d });
    setTitle('');
    setD(today.jd);
    setM(today.jm);
    setY(today.jy);
  };

  const birthdayCountdown = userProfile
    ? (() => {
        const next = nextOccurrenceOfMonthDay(userProfile.birthJm, userProfile.birthJd);
        return { target: next, days: daysUntilShahDate(next) };
      })()
    : null;

  const sortedCountdowns = [...countdowns]
    .map((c) => ({ c, days: daysUntilShahDate({ jy: c.jy, jm: c.jm, jd: c.jd }) }))
    .sort((a, b) => a.days - b.days);

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex min-h-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className={`relative z-10 w-full max-w-lg max-h-[88vh] rounded-3xl border shadow-2xl my-auto overflow-hidden ${
            isDark
              ? 'bg-[#141416] border-white/10 text-stone-100'
              : isTurquoise
              ? 'bg-white text-slate-800 border-sky-200 shadow-sky-950/10'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          {/* Scrollable inner wrapper — kept transform-free so sticky headers work on mobile */}
          <div className="h-full max-h-[88vh] overflow-y-auto overscroll-contain p-5 sm:p-6 flex flex-col gap-4">
            <div
              className={`flex items-center justify-between pb-3 border-b sticky top-0 z-10 ${
                isDark
                  ? 'bg-[#141416] border-white/10'
                  : isTurquoise
                  ? 'bg-white border-sky-100'
                  : 'bg-white border-stone-200'
              }`}
            >
              <div className={`flex items-center gap-2 font-bold text-base ${accent}`}>
                <Timer className="w-5 h-5" />
                <h3>شمارش معکوس روزها</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-1.5 rounded-xl cursor-pointer transition ${
                  isDark
                    ? 'text-stone-400 hover:text-white hover:bg-white/10'
                    : isTurquoise
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-sky-50'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Birthday auto-countdown */}
            {birthdayCountdown && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark
                    ? 'bg-[#f27d26]/10 border-[#f27d26]/30'
                    : isTurquoise
                    ? 'bg-sky-50 border-sky-200'
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cake className={`w-5 h-5 ${accent}`} />
                  <div>
                    <p className="text-xs sm:text-sm font-bold">تولد {userProfile!.name}</p>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                      {toFa(birthdayCountdown.target.jd)} {MONTH_NAMES_FA[birthdayCountdown.target.jm - 1]}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${isTurquoise ? 'bg-sky-500 text-white' : 'bg-[#f27d26] text-stone-950'}`}>
                  {daysLabel(birthdayCountdown.days)}
                </span>
              </div>
            )}

            {/* List of user-added countdowns */}
            <div className="space-y-2">
              {sortedCountdowns.length === 0 && (
                <p className={`text-xs text-center py-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  هنوز شمارش معکوسی اضافه نکردی.
                </p>
              )}
              {sortedCountdowns.map(({ c, days }) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDark
                      ? 'bg-white/[0.04] border-white/10'
                      : isTurquoise
                      ? 'bg-sky-50/40 border-sky-100'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold truncate">{c.title}</p>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-stone-400' : 'text-slate-500'}`}>
                      {toFa(c.jd)} {MONTH_NAMES_FA[c.jm - 1]} {toFa(c.jy)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${
                        days < 0
                          ? isDark
                            ? 'bg-white/10 text-stone-400'
                            : 'bg-stone-200 text-stone-600'
                          : isTurquoise
                          ? 'bg-sky-500 text-white'
                          : 'bg-[#f27d26] text-stone-950'
                      }`}
                    >
                      {daysLabel(days)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteCountdown(c.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new countdown form */}
            <form
              onSubmit={handleAdd}
              className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-white/[0.03] border-white/5' : isTurquoise ? 'bg-sky-50/50 border-sky-100' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان شمارش معکوس (مثلاً: کنکور، سفر، عروسی)..."
                className={`w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border outline-none transition ${
                  isDark
                    ? 'bg-black/30 text-stone-100 border-white/10 placeholder-stone-500 focus:border-[#f27d26]'
                    : isTurquoise
                    ? 'bg-white text-slate-900 border-sky-200 placeholder-slate-400 focus:border-sky-500'
                    : 'bg-white text-stone-900 border-stone-200 placeholder-stone-400 focus:border-[#f27d26]'
                }`}
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={d}
                  onChange={(e) => setD(parseInt(e.target.value, 10) || 1)}
                  className={`w-full px-2 py-2 rounded-xl border text-xs text-center outline-none ${
                    isDark ? 'bg-black/30 text-stone-100 border-white/10' : isTurquoise ? 'bg-white border-sky-200 text-slate-800' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
                <select
                  value={m}
                  onChange={(e) => {
                    const mm = parseInt(e.target.value, 10);
                    setM(mm);
                    const maxD = shahMonthLength(y, mm);
                    if (d > maxD) setD(maxD);
                  }}
                  className={`w-full px-1 py-2 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-black/30 text-stone-100 border-white/10' : isTurquoise ? 'bg-white border-sky-200 text-slate-800' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                >
                  {MONTH_NAMES_FA.map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {mName}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={y}
                  onChange={(e) => setY(parseInt(e.target.value, 10) || today.jy)}
                  className={`w-full px-2 py-2 rounded-xl border text-xs text-center outline-none ${
                    isDark ? 'bg-black/30 text-stone-100 border-white/10' : isTurquoise ? 'bg-white border-sky-200 text-slate-800' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={!title.trim()}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${accentBtn}`}
              >
                <Plus className="w-4 h-4" />
                <span>افزودن شمارش معکوس</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
