import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, Download, Timer, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface ToolsPopoverProps {
  isOpen: boolean;
  theme: ThemeMode;
  onClose: () => void;
  onOpenConverter: () => void;
  onOpenBackup: () => void;
  onOpenCountdown: () => void;
}

export const ToolsPopover: React.FC<ToolsPopoverProps> = ({
  isOpen,
  theme,
  onClose,
  onOpenConverter,
  onOpenBackup,
  onOpenCountdown,
}) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';
  const accent = isDark ? '#f27d26' : isTurquoise ? '#0284c7' : '#d97706';

  const tools = [
    {
      key: 'converter',
      title: 'مبدل تاریخ',
      desc: 'تبدیل شاهنشاهی، خورشیدی، میلادی',
      icon: ArrowLeftRight,
      iconBg: 'bg-[#f27d26]/15',
      iconColor: 'text-[#f27d26]',
      onClick: onOpenConverter,
    },
    {
      key: 'backup',
      title: 'پشتیبان‌گیری و بازیابی',
      desc: 'خروجی فایل JSON و بازیابی یادآورها',
      icon: Download,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-500',
      onClick: onOpenBackup,
    },
    {
      key: 'countdown',
      title: 'شمارش معکوس',
      desc: 'روزشمار برای یک تاریخ خاص',
      icon: Timer,
      iconBg: 'bg-sky-500/15',
      iconColor: 'text-sky-500',
      onClick: onOpenCountdown,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent click-outside-to-close layer — no dimming, this is a popup, not a modal */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute top-full mt-2 right-0 z-50 w-72 sm:w-80 rounded-2xl border shadow-2xl overflow-hidden ${
              isDark
                ? 'bg-[#17171f] border-white/10 text-stone-100'
                : isTurquoise
                ? 'bg-white border-sky-100 text-slate-800'
                : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            <div className="p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
                <span className="text-xs font-bold">ابزارهای کاربردی</span>
              </div>

              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <motion.button
                    key={tool.key}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onClose();
                      tool.onClick();
                    }}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer flex items-center gap-3 ${
                      isDark
                        ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-[#f27d26]/40'
                        : isTurquoise
                        ? 'bg-sky-50/50 hover:bg-sky-50 border-sky-100 hover:border-sky-300'
                        : 'bg-stone-50 hover:bg-orange-50/60 border-stone-200 hover:border-[#f27d26]/40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${tool.iconBg} ${tool.iconColor} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">{tool.title}</h4>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{tool.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
