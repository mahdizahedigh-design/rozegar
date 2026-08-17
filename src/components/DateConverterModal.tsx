import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeftRight } from 'lucide-react';
import {
  MONTH_NAMES_FA,
  GREGORIAN_MONTH_NAMES_FA,
  toFa,
  toGregorian,
  toShahanshahi,
  isValidShahDate,
  isValidGregDate,
} from '../utils/calendar';
import { ShahDate, ThemeMode } from '../types';

interface DateConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialShahDate: ShahDate;
  theme?: ThemeMode;
}

export const DateConverterModal: React.FC<DateConverterModalProps> = ({
  isOpen,
  onClose,
  initialShahDate,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Shahanshahi to Gregorian state
  const [sY, setSY] = useState(initialShahDate.jy.toString());
  const [sM, setSM] = useState(initialShahDate.jm.toString());
  const [sD, setSD] = useState(initialShahDate.jd.toString());
  const [sToGResult, setSToGResult] = useState<string | null>(null);

  // Gregorian to Shahanshahi state
  const now = new Date();
  const [gY, setGY] = useState(now.getFullYear().toString());
  const [gM, setGM] = useState((now.getMonth() + 1).toString());
  const [gD, setGD] = useState(now.getDate().toString());
  const [gToSResult, setGToSResult] = useState<string | null>(null);

  const handleConvertShahToGreg = (e: React.FormEvent) => {
    e.preventDefault();
    const y = parseInt(sY, 10);
    const m = parseInt(sM, 10);
    const d = parseInt(sD, 10);

    if (!isValidShahDate(y, m, d)) {
      setSToGResult('تاریخ شاهنشاهی وارد شده نامعتبر است.');
      return;
    }

    const g = toGregorian(y, m, d);
    setSToGResult(
      `معادل میلادی: ${g.gd} ${GREGORIAN_MONTH_NAMES_FA[g.gm - 1]} ${g.gy} (${g.gy}/${String(g.gm).padStart(2, '0')}/${String(g.gd).padStart(2, '0')})`
    );
  };

  const handleConvertGregToShah = (e: React.FormEvent) => {
    e.preventDefault();
    const y = parseInt(gY, 10);
    const m = parseInt(gM, 10);
    const d = parseInt(gD, 10);

    if (!isValidGregDate(y, m, d)) {
      setGToSResult('تاریخ میلادی وارد شده نامعتبر است.');
      return;
    }

    const s = toShahanshahi(y, m, d);
    setGToSResult(
      `معادل شاهنشاهی: ${toFa(s.jd)} ${MONTH_NAMES_FA[s.jm - 1]} ${toFa(s.jy)} شاهنشاهی`
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className={`relative z-10 w-full max-w-lg max-h-[88vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border shadow-2xl flex flex-col gap-4 overscroll-contain my-auto ${
              isDark
                ? 'bg-[#141416] border-white/10 text-stone-100'
                : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between pb-3 border-b sticky top-0 bg-inherit z-10 ${
                isDark ? 'border-white/10' : 'border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2 text-[#f27d26] font-bold text-base">
                <ArrowLeftRight className="w-5 h-5" />
                <h3>مبدل تقویم شاهنشاهی ⇄ میلادی</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-1.5 rounded-xl cursor-pointer transition ${
                  isDark
                    ? 'text-stone-400 hover:text-white hover:bg-white/10'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Form 1: Shahanshahi to Gregorian */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-white/[0.03] border-white/5' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <h4 className={`text-xs font-bold ${isDark ? 'text-orange-300' : 'text-stone-900'}`}>
                ۱. تبدیل از شاهنشاهی به میلادی
              </h4>
              <form onSubmit={handleConvertShahToGreg} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={`text-[10px] block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      روز
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={sD}
                      onChange={(e) => setSD(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs text-center outline-none focus:border-[#f27d26] ${
                        isDark ? 'bg-[#1f1f23] border-white/10 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      ماه
                    </label>
                    <select
                      value={sM}
                      onChange={(e) => setSM(e.target.value)}
                      className={`w-full px-2 py-2 rounded-xl border text-xs outline-none focus:border-[#f27d26] ${
                        isDark ? 'bg-[#1f1f23] border-white/10 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    >
                      {MONTH_NAMES_FA.map((name, i) => (
                        <option key={i + 1} value={i + 1} className={isDark ? 'bg-[#141416]' : 'bg-white'}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      سال شاهنشاهی
                    </label>
                    <input
                      type="number"
                      value={sY}
                      onChange={(e) => setSY(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs text-center outline-none focus:border-[#f27d26] ${
                        isDark ? 'bg-[#1f1f23] border-white/10 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#f27d26] hover:bg-[#ff8a38] text-stone-950 font-bold text-xs transition cursor-pointer shadow-md shadow-[#f27d26]/20"
                >
                  محاسبه تاریخ میلادی
                </motion.button>
                {sToGResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center ${
                      isDark
                        ? 'bg-[#f27d26]/10 border-[#f27d26]/30 text-orange-300'
                        : 'bg-orange-50 border-orange-200 text-[#c75a10]'
                    }`}
                  >
                    {sToGResult}
                  </motion.div>
                )}
              </form>
            </div>

            {/* Form 2: Gregorian to Shahanshahi */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-white/[0.03] border-white/5' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <h4 className={`text-xs font-bold ${isDark ? 'text-orange-300' : 'text-stone-900'}`}>
                ۲. تبدیل از میلادی به شاهنشاهی
              </h4>
              <form onSubmit={handleConvertGregToShah} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={`text-[10px] block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      Day (روز)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={gD}
                      onChange={(e) => setGD(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs text-center outline-none focus:border-[#f27d26] ${
                        isDark ? 'bg-[#1f1f23] border-white/10 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      Month (ماه)
                    </label>
                    <select
                      value={gM}
                      onChange={(e) => setGM(e.target.value)}
                      className={`w-full px-2 py-2 rounded-xl border text-xs outline-none focus:border-[#f27d26] ${
                        isDark ? 'bg-[#1f1f23] border-white/10 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    >
                      {GREGORIAN_MONTH_NAMES_FA.map((name, i) => (
                        <option key={i + 1} value={i + 1} className={isDark ? 'bg-[#141416]' : 'bg-white'}>
                          {name} ({i + 1})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`text-[10px] block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      Year (سال میلادی)
                    </label>
                    <input
                      type="number"
                      value={gY}
                      onChange={(e) => setGY(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs text-center outline-none focus:border-[#f27d26] ${
                        isDark ? 'bg-[#1f1f23] border-white/10 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#f27d26] hover:bg-[#ff8a38] text-stone-950 font-bold text-xs transition cursor-pointer shadow-md shadow-[#f27d26]/20"
                >
                  محاسبه تاریخ شاهنشاهی
                </motion.button>
                {gToSResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center ${
                      isDark
                        ? 'bg-[#f27d26]/10 border-[#f27d26]/30 text-orange-300'
                        : 'bg-orange-50 border-orange-200 text-[#c75a10]'
                    }`}
                  >
                    {gToSResult}
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
