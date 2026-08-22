import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, User, Cake, ChevronLeft } from 'lucide-react';
import { ThemeMode, UserProfile } from '../types';
import { MONTH_NAMES_FA, shahMonthLength, getTodayShahanshahi } from '../utils/calendar';

interface OnboardingModalProps {
  isOpen: boolean;
  theme?: ThemeMode;
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, theme = 'dark', onComplete, onSkip }) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';
  const accent = isTurquoise ? 'text-sky-600' : 'text-[#f27d26]';
  const accentBtn = isTurquoise
    ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
    : 'bg-[#f27d26] hover:bg-[#ff8a38] text-stone-950 shadow-[#f27d26]/20';

  const today = getTodayShahanshahi();
  const [name, setName] = useState('');
  const [d, setD] = useState(today.jd);
  const [m, setM] = useState(today.jm);
  const [y, setY] = useState(today.jy - 20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onComplete({ name: name.trim(), birthJy: y, birthJm: m, birthJd: d });
  };

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-[60] overflow-y-auto p-3 sm:p-4 flex min-h-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className={`relative z-10 w-full max-w-md max-h-[90vh] rounded-3xl border shadow-2xl my-auto overflow-hidden ${
            isDark
              ? 'bg-[#141418] border-white/10 text-stone-100'
              : isTurquoise
              ? 'bg-white text-slate-800 border-sky-200 shadow-sky-950/10'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          <div className="h-full max-h-[90vh] overflow-y-auto overscroll-contain p-6 flex flex-col gap-5">
            <div className="text-center space-y-2">
              <div
                className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                  isTurquoise ? 'bg-sky-100 text-sky-600' : 'bg-[#f27d26]/15 text-[#f27d26]'
                }`}
              >
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-black">به روزگار خوش اومدی!</h2>
              <p className={`text-xs ${isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-500' : 'text-stone-500'}`}>
                برای شخصی‌سازی تجربه‌ت، اسم و تاریخ تولدت رو (به شاهنشاهی) وارد کن.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${accent}`}>
                  <User className="w-3.5 h-3.5" />
                  <span>اسم شما</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: کوروش"
                  autoFocus
                  className={`w-full text-sm rounded-xl px-3.5 py-2.5 border outline-none transition ${
                    isDark
                      ? 'bg-black/30 text-stone-100 border-white/10 placeholder-stone-500 focus:border-[#f27d26]'
                      : isTurquoise
                      ? 'bg-sky-50/50 text-slate-900 border-sky-200 placeholder-slate-400 focus:border-sky-500'
                      : 'bg-stone-50 text-stone-900 border-stone-200 placeholder-stone-400 focus:border-[#f27d26]'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold flex items-center gap-1.5 ${accent}`}>
                  <Cake className="w-3.5 h-3.5" />
                  <span>تاریخ تولد (شاهنشاهی)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={d}
                    onChange={(e) => setD(parseInt(e.target.value, 10) || 1)}
                    className={`w-full px-2 py-2.5 rounded-xl border text-xs text-center outline-none ${
                      isDark
                        ? 'bg-black/30 text-stone-100 border-white/10'
                        : isTurquoise
                        ? 'bg-sky-50/50 border-sky-200 text-slate-800'
                        : 'bg-stone-50 border-stone-200 text-stone-900'
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
                    className={`w-full px-1 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark
                        ? 'bg-black/30 text-stone-100 border-white/10'
                        : isTurquoise
                        ? 'bg-sky-50/50 border-sky-200 text-slate-800'
                        : 'bg-stone-50 border-stone-200 text-stone-900'
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
                    onChange={(e) => {
                      const yy = parseInt(e.target.value, 10) || today.jy;
                      setY(yy);
                      const maxD = shahMonthLength(yy, m);
                      if (d > maxD) setD(maxD);
                    }}
                    className={`w-full px-2 py-2.5 rounded-xl border text-xs text-center outline-none ${
                      isDark
                        ? 'bg-black/30 text-stone-100 border-white/10'
                        : isTurquoise
                        ? 'bg-sky-50/50 border-sky-200 text-slate-800'
                        : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className={`w-full flex items-center justify-center gap-1.5 py-3 font-black text-sm rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 ${accentBtn}`}
              >
                <span>شروع کن</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onSkip}
                className={`w-full text-center text-xs font-bold py-1 transition cursor-pointer ${
                  isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                فعلاً رد شو
              </button>
            </form>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
