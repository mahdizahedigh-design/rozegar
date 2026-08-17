import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode } from '../types';
import darkWallpaper from '../assets/images/dark_persepolis_wallpaper_1786950825358.jpg';
import lightWallpaper from '../assets/images/light_persepolis_wallpaper_1786950837250.jpg';
import turquoiseWallpaper from '../assets/images/turquoise_persepolis_bg_1786978703722.jpg';

interface PersepolisBgProps {
  theme: ThemeMode;
}

export const PersepolisBg: React.FC<PersepolisBgProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';

  const currentWallpaper = isDark
    ? darkWallpaper
    : isTurquoise
    ? turquoiseWallpaper
    : lightWallpaper;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#09090c]' : isTurquoise ? 'bg-[#f0f9fa]' : 'bg-[#f6f5f0]'
      }`}
    >
      {/* Dynamic Wallpaper Image with Motion Crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0 transform-gpu will-change-transform"
        >
          <img
            src={currentWallpaper}
            alt="الگوی تخت جمشید"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
              isDark
                ? 'opacity-40 contrast-105 brightness-90'
                : isTurquoise
                ? 'opacity-55 contrast-105 brightness-100'
                : 'opacity-35 contrast-100 brightness-100'
            }`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Atmospheric Soft Lighting Overlay */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-b from-[#09090c]/70 via-[#09090c]/40 to-[#09090c]/80'
            : isTurquoise
            ? 'bg-gradient-to-b from-[#f0f9fa]/80 via-[#f0f9fa]/45 to-[#f0f9fa]/85'
            : 'bg-gradient-to-b from-[#f6f5f0]/75 via-[#f6f5f0]/45 to-[#f6f5f0]/85'
        }`}
      />

      {/* Optimized Ambient Glow Orbs for smooth 60fps on mobile */}
      <div
        className={`absolute -top-32 -right-32 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[100px] pointer-events-none opacity-20 transform-gpu will-change-transform ${
          isDark ? 'bg-[#f27d26]' : isTurquoise ? 'bg-[#00a896]' : 'bg-amber-400'
        }`}
      />
      <div
        className={`absolute -bottom-32 -left-32 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full blur-[80px] sm:blur-[100px] pointer-events-none opacity-15 transform-gpu will-change-transform ${
          isDark ? 'bg-[#f27d26]' : isTurquoise ? 'bg-[#0284c7]' : 'bg-amber-300'
        }`}
      />
    </div>
  );
};
