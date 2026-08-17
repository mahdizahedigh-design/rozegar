import React from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
import { MainTabType, ThemeMode } from '../types';
import { toFa } from '../utils/calendar';

interface MainTabsProps {
  activeTab: MainTabType;
  theme: ThemeMode;
  onChangeTab: (tab: MainTabType) => void;
  pendingTasksCount: number;
  hasOccasionToday: boolean;
}

export const MainTabs: React.FC<MainTabsProps> = ({
  activeTab,
  theme,
  onChangeTab,
  pendingTasksCount,
  hasOccasionToday,
}) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-2.5">
      <div
        className={`p-1.5 rounded-2xl backdrop-blur-xl flex items-center gap-1 shadow-lg transition-colors duration-300 border relative ${
          isDark
            ? 'bg-[#14141a]/90 border-white/10 shadow-black/60'
            : isTurquoise
            ? 'bg-white/95 border-sky-100 shadow-sky-900/5'
            : 'bg-white/92 border-stone-200 shadow-stone-200/60'
        }`}
      >
        {/* Tab 1: تقویم */}
        <motion.button
          onClick={() => onChangeTab('calendar')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors relative cursor-pointer z-10 ${
            activeTab === 'calendar'
              ? isTurquoise
                ? 'text-white font-extrabold'
                : 'text-stone-950 font-extrabold'
              : isDark
              ? 'text-stone-300 hover:text-white'
              : isTurquoise
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {activeTab === 'calendar' && (
            <motion.div
              layoutId="mainTabIndicator"
              className={`absolute inset-0 rounded-xl shadow-md -z-10 ${
                isTurquoise
                  ? 'bg-gradient-to-r from-[#0284c7] to-[#06b6d4] shadow-sky-500/25'
                  : 'bg-gradient-to-r from-[#f27d26] to-[#ff9843] shadow-[#f27d26]/30'
              }`}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <CalendarIcon
            className={`w-4 h-4 transition-transform duration-200 ${
              activeTab === 'calendar'
                ? isTurquoise
                  ? 'text-white scale-105'
                  : 'text-stone-950 scale-105'
                : isTurquoise
                ? 'text-sky-600'
                : 'text-[#f27d26]'
            }`}
          />
          <span>تقویم شاهنشاهی</span>
          {hasOccasionToday && activeTab !== 'calendar' && (
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                isTurquoise ? 'bg-sky-500' : 'bg-[#f27d26]'
              }`}
              title="مناسبت امروز"
            />
          )}
        </motion.button>

        {/* Tab 2: یادآورها و کارها */}
        <motion.button
          onClick={() => onChangeTab('tasks')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors relative cursor-pointer z-10 ${
            activeTab === 'tasks'
              ? isTurquoise
                ? 'text-white font-extrabold'
                : 'text-stone-950 font-extrabold'
              : isDark
              ? 'text-stone-300 hover:text-white'
              : isTurquoise
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {activeTab === 'tasks' && (
            <motion.div
              layoutId="mainTabIndicator"
              className={`absolute inset-0 rounded-xl shadow-md -z-10 ${
                isTurquoise
                  ? 'bg-gradient-to-r from-[#0284c7] to-[#06b6d4] shadow-sky-500/25'
                  : 'bg-gradient-to-r from-[#f27d26] to-[#ff9843] shadow-[#f27d26]/30'
              }`}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <CheckSquare
            className={`w-4 h-4 transition-transform duration-200 ${
              activeTab === 'tasks'
                ? isTurquoise
                  ? 'text-white scale-105'
                  : 'text-stone-950 scale-105'
                : isTurquoise
                ? 'text-sky-600'
                : 'text-[#f27d26]'
            }`}
          />
          <span>یادآورها و مجموعه‌ها</span>
          {pendingTasksCount > 0 && (
            <motion.span
              key={pendingTasksCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                activeTab === 'tasks'
                  ? isTurquoise
                    ? 'bg-white text-sky-800'
                    : 'bg-stone-950 text-[#f27d26]'
                  : isDark
                  ? 'bg-[#f27d26]/25 text-orange-300 border border-[#f27d26]/40'
                  : isTurquoise
                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                  : 'bg-orange-100 text-[#c75a10] border border-orange-200'
              }`}
            >
              {toFa(pendingTasksCount)}
            </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  );
};
