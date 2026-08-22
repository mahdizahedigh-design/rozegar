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

      {/* Ambient Glow — rendered as radial-gradients instead of CSS blur().
          filter:blur() is one of the most GPU-expensive CSS properties and,
          since these orbs are always mounted, a real drag on low-end mobile
          GPUs (especially during scroll/compositing). A radial-gradient
          gives the same soft-glow look with near-zero rendering cost. */}
      <div
        className={`absolute -top-32 -right-32 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full pointer-events-none opacity-20 ${
          isDark
            ? 'bg-[radial-gradient(circle,#f27d26_0%,transparent_70%)]'
            : isTurquoise
            ? 'bg-[radial-gradient(circle,#00a896_0%,transparent_70%)]'
            : 'bg-[radial-gradient(circle,#fbbf24_0%,transparent_70%)]'
        }`}
      />
      <div
        className={`absolute -bottom-32 -left-32 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full pointer-events-none opacity-15 ${
          isDark
            ? 'bg-[radial-gradient(circle,#f27d26_0%,transparent_70%)]'
            : isTurquoise
            ? 'bg-[radial-gradient(circle,#0284c7_0%,transparent_70%)]'
            : 'bg-[radial-gradient(circle,#fcd34d_0%,transparent_70%)]'
        }`}
      />
    </div>
  );
};
