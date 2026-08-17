import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  Palette,
  ArrowLeftRight,
  Download,
  Check,
  Sparkles,
  Volume2,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  onOpenConverter: () => void;
  onOpenBackup: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSelectTheme,
  onOpenConverter,
  onOpenBackup,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';

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
          className={`relative z-10 w-full max-w-xl max-h-[88vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border shadow-2xl flex flex-col gap-5 overscroll-contain my-auto ${
            isDark
              ? 'bg-[#121217] border-white/10 text-stone-100'
              : isTurquoise
              ? 'bg-white border-sky-100 text-slate-800'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between pb-3.5 border-b sticky top-0 bg-inherit z-20 ${
              isDark ? 'border-white/10' : isTurquoise ? 'border-sky-100' : 'border-stone-200'
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
                  مدیریت تم ظاهری، ابزارهای تقویم و پشتیبان‌گیری
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
              <Palette className="w-4 h-4 text-[#f27d26]" />
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

          {/* Section 2: Quick Tools & Utilities */}
          <div className="space-y-3 pt-2">
            <span className="text-xs sm:text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f27d26]" />
              <span>ابزارهای کاربردی</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Date Converter Card */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onOpenConverter();
                }}
                className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex items-center gap-3 ${
                  isDark
                    ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-[#f27d26]/40'
                    : isTurquoise
                    ? 'bg-sky-50/50 hover:bg-sky-50 border-sky-100 hover:border-sky-300'
                    : 'bg-stone-50 hover:bg-orange-50/60 border-stone-200 hover:border-[#f27d26]/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#f27d26]/15 text-[#f27d26] flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">مبدل تاریخ</h4>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    تبدیل شاهنشاهی، خورشیدی، میلادی
                  </p>
                </div>
              </motion.button>

              {/* Backup & Restore Card */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onOpenBackup();
                }}
                className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex items-center gap-3 ${
                  isDark
                    ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-[#f27d26]/40'
                    : isTurquoise
                    ? 'bg-sky-50/50 hover:bg-sky-50 border-sky-100 hover:border-sky-300'
                    : 'bg-stone-50 hover:bg-orange-50/60 border-stone-200 hover:border-[#f27d26]/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">پشتیبان‌گیری و بازیابی</h4>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    خروجی فایل JSON و بازیابی یادآورها
                  </p>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Section 3: App Info & Tactile feedback indicator */}
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
              <span>نسخه ۲.۵ (سال ۲۵۸۵)</span>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-2 border-t border-current/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[#f27d26] text-stone-950 text-xs font-black rounded-xl hover:bg-[#ff8a38] transition cursor-pointer shadow-lg shadow-[#f27d26]/20 active:scale-95"
            >
              بستن پنجره تنظیمات
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
