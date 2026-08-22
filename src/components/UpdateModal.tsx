import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PartyPopper, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';
import { ChangelogEntry } from '../data/changelog';
import { toFa } from '../utils/calendar';

interface UpdateModalProps {
  isOpen: boolean;
  theme: ThemeMode;
  version: string;
  entry?: ChangelogEntry;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, theme, version, entry, onClose }) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';
  const accent = isDark ? '#f27d26' : isTurquoise ? '#0284c7' : '#d97706';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] overflow-y-auto p-3 sm:p-4 flex min-h-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-md max-h-[88vh] my-auto"
          >
            {/* Clipping wrapper kept separate from this transformed element so the
                rounded corners always clip content correctly (see SettingsModal.tsx
                for why transform + overflow-hidden + sticky must not share a node). */}
            <div
              className={`h-full max-h-[88vh] rounded-3xl border shadow-2xl overflow-hidden ${
                isDark
                  ? 'bg-[#141418] border-white/10 text-stone-100'
                  : isTurquoise
                  ? 'bg-white text-slate-800 border-sky-200 shadow-sky-950/10'
                  : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              <div className="h-full max-h-[88vh] overflow-y-auto overscroll-contain p-6 flex flex-col gap-5">
                <div className="text-center space-y-2">
                  <div
                    className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${accent}26`, color: accent }}
                  >
                    <PartyPopper className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg font-black">بروز شدی! 🎉</h2>
                  <p className={`text-xs ${isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-500' : 'text-stone-500'}`}>
                    روزگار به نسخهٔ جدید به‌روزرسانی شد. این‌ها تغییرات این نسخه‌ست:
                  </p>
                </div>

                {entry && entry.changes.length > 0 && (
                  <div
                    className={`rounded-2xl border p-4 space-y-2.5 ${
                      isDark ? 'bg-white/[0.03] border-white/10' : isTurquoise ? 'bg-sky-50/50 border-sky-100' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    {entry.changes.map((change, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed">
                        <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} />
                        <span className={isDark ? 'text-stone-300' : isTurquoise ? 'text-slate-700' : 'text-stone-700'}>{change}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold opacity-60">
                  <span>نسخهٔ جدید:</span>
                  <span>{toFa(version)}</span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  style={{ backgroundColor: accent, boxShadow: `0 10px 25px -5px ${accent}33` }}
                  className="w-full py-3 text-stone-950 text-sm font-black rounded-xl transition cursor-pointer active:scale-95 hover:brightness-110"
                >
                  متوجه شدم
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
