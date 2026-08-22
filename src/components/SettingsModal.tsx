import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  Palette,
  Check,
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { APP_VERSION, APP_YEAR_SHAHANSHAHI } from '../data/changelog';
import { toFa } from '../utils/calendar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSelectTheme,
}) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';
  const accent = isDark ? '#f27d26' : isTurquoise ? '#0284c7' : '#d97706';

  const themeOptions: {
    id: ThemeMode;
    title: string;
    desc: string;
    tag: string;
    previewBg: string;
    accentColor: string;
    borderPreview: string;
  }[] = [
    {
      id: 'dark',
      title: 'شاهنشاهی تاریک',
      desc: 'جلوهٔ رازآلود سنگ‌های سیاه تخت جمشید در تلالو طلایی شاهانه.',
      tag: 'پیش‌فرض لوکس',
      previewBg: 'from-[#0b0b0f] via-[#14141d] to-[#1c1410]',
      accentColor: '#f27d26',
      borderPreview: 'border-amber-500/40',
    },
    {
      id: 'turquoise',
      title: 'فیروزه‌ای ایرانی',
      desc: 'شکوه کاشی‌کاری‌های اسلیمی و روح‌بخشِ هنر و اصالت پارسی.',
      tag: 'طراحی ویژه',
      previewBg: 'from-[#f0f9fa] via-[#e0f2fe] to-[#ccfbf1]',
      accentColor: '#0284c7',
      borderPreview: 'border-sky-500/40',
    },
    {
      id: 'light',
      title: 'کتیبه سنگی روشن',
      desc: 'روشنیِ سپیده‌دم بر نگاره‌های سنگی و یادگار ماندگار کتیبه‌های تاریخی.',
      tag: 'کلاسیک روشن',
      previewBg: 'from-[#fbfaf6] via-[#f5f3ec] to-[#eae5d8]',
      accentColor: '#d97706',
      borderPreview: 'border-stone-400/40',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex min-h-full items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl max-h-[88vh] my-auto"
        >
          {/* Clipping wrapper kept separate from the transformed/animated element above —
              combining `transform` (from framer-motion) with `overflow-hidden` and a
              `position: sticky` descendant on the SAME element makes some browsers fail
              to clip the sticky child to the rounded corners, letting the backdrop show
              through above the header. Splitting them into two nested elements fixes it. */}
          <div
            className={`h-full max-h-[88vh] rounded-3xl border shadow-2xl overflow-hidden ${
              isDark
                ? 'bg-[#121217] border-white/10 text-stone-100'
                : isTurquoise
                ? 'bg-white border-sky-100 text-slate-800'
                : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
          {/* Scrollable inner wrapper — kept transform-free so sticky headers work on mobile */}
          <div className="h-full max-h-[88vh] overflow-y-auto overscroll-contain p-5 sm:p-6 flex flex-col gap-5">
          {/* Header */}
          <div
            className={`flex items-center justify-between pb-3.5 border-b sticky top-0 z-20 ${
              isDark
                ? 'bg-[#121217] border-white/10'
                : isTurquoise
                ? 'bg-white border-sky-100'
                : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isDark
                    ? 'bg-[#f27d26]/15 text-[#f27d26]'
                    : isTurquoise
                    ? 'bg-sky-500/15 text-sky-600'
                    : 'bg-amber-500/15 text-amber-600'
                }`}
              >
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">تنظیمات و شخصی‌سازی</h3>
                <p
                  className={`text-xs ${
                    isDark ? 'text-stone-400' : isTurquoise ? 'text-sky-800/70' : 'text-stone-500'
                  }`}
                >
                  مدیریت تم و پوستهٔ ظاهری برنامه
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'border-white/10 hover:bg-white/10 text-stone-400 hover:text-white'
                  : 'border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Themes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" style={{ color: accent }} />
              <span className="text-xs sm:text-sm font-bold">انتخاب تم و پوسته ظاهری</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {themeOptions.map((opt) => {
                const isSelected = theme === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelectTheme(opt.id)}
                    className={`relative p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? isDark
                          ? 'border-[#f27d26] bg-gradient-to-r from-[#f27d26]/20 to-transparent shadow-lg shadow-[#f27d26]/10 ring-1 ring-[#f27d26]'
                          : opt.id === 'turquoise'
                          ? 'border-sky-500 bg-sky-50/80 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500'
                          : 'border-amber-500 bg-amber-50/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                        : isDark
                        ? 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15'
                        : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Theme Color Preview Pill */}
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.previewBg} border ${opt.borderPreview} shadow-xs flex items-center justify-center shrink-0`}
                      >
                        {opt.id === 'turquoise' && (
                          <div className="w-5 h-5 rounded-full bg-sky-500/30 border border-sky-400" />
                        )}
                        {opt.id === 'dark' && (
                          <div className="w-5 h-5 rounded-full bg-[#f27d26]/30 border border-[#f27d26]" />
                        )}
                        {opt.id === 'light' && (
                          <div className="w-5 h-5 rounded-full bg-amber-600/20 border border-amber-600" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm">{opt.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[#f27d26] text-stone-950'
                                : isDark
                                ? 'bg-white/10 text-stone-400'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {opt.tag}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] sm:text-xs mt-0.5 leading-relaxed ${
                            isDark ? 'text-stone-400' : 'text-stone-600'
                          }`}
                        >
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    {/* Radio indicator */}
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-[#f27d26] border-[#f27d26] text-stone-950 font-bold'
                          : isDark
                          ? 'border-white/20 bg-black/20'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Section 2: App Info & Tactile feedback indicator */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
              isDark
                ? 'bg-black/30 border-white/5 text-stone-400'
                : isTurquoise
                ? 'bg-sky-50/40 border-sky-100 text-sky-800'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>بازخورد صوتی کریستالی تیک کارها فعال است</span>
            </div>

            <div className="flex items-center gap-1 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>نسخه {toFa(APP_VERSION)} (سال {APP_YEAR_SHAHANSHAHI})</span>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-2 border-t border-current/10">
            <button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: accent, boxShadow: `0 10px 25px -5px ${accent}33` }}
              className="px-6 py-2.5 text-stone-950 text-xs font-black rounded-xl transition cursor-pointer active:scale-95 hover:brightness-110"
            >
              بستن پنجره تنظیمات
            </button>
          </div>
          </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
