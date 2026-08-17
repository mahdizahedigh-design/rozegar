import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Upload, Bell, Database, ShieldCheck } from 'lucide-react';
import { Reminder, ThemeMode } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  folders: string[];
  onImportData: (data: { reminders: Reminder[]; folders: string[] }) => void;
  notifEnabled: boolean;
  onToggleNotif: (enabled: boolean) => void;
  theme?: ThemeMode;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  reminders,
  folders,
  onImportData,
  notifEnabled,
  onToggleNotif,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const backupObj = {
      version: 1,
      appName: 'Shahanshahi Calendar',
      exportedAt: new Date().toISOString(),
      reminders,
      folders,
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shahanshahi-calendar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.reminders)) {
          onImportData({
            reminders: parsed.reminders,
            folders: Array.isArray(parsed.folders) ? parsed.folders : [],
          });
          alert('اطلاعات با موفقیت بازیابی شد.');
          onClose();
        } else {
          alert('فرمت فایل پشتیبان معتبر نیست.');
        }
      } catch (err) {
        alert('خطا در خواندن فایل پشتیبان.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRequestNotif = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onToggleNotif(true);
      } else {
        onToggleNotif(false);
      }
    } else {
      alert('مرورگر شما از سیستم اعلان‌ها پشتیبانی نمی‌کند.');
    }
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

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className={`relative z-10 w-full max-w-md max-h-[88vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border shadow-2xl flex flex-col gap-4 overscroll-contain my-auto ${
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
                <Database className="w-5 h-5" />
                <h3>پشتیبان‌گیری و تنظیمات داده</h3>
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

            {/* Export / Import Section */}
            <div className="space-y-3">
              <h4 className={`text-xs font-bold ${isDark ? 'text-stone-300' : 'text-stone-800'}`}>
                خروجی و درون‌ریزی یادآورها
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleExport}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition group text-xs font-bold cursor-pointer ${
                    isDark
                      ? 'bg-white/[0.03] hover:bg-[#f27d26]/10 border-white/10 hover:border-[#f27d26]/30 text-orange-300'
                      : 'bg-stone-50 hover:bg-orange-50 border-stone-200 hover:border-orange-300 text-stone-800'
                  }`}
                >
                  <Download className="w-5 h-5 group-hover:scale-110 transition-transform text-[#f27d26]" />
                  <span>دانلود فایل JSON</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition group text-xs font-bold cursor-pointer ${
                    isDark
                      ? 'bg-white/[0.03] hover:bg-[#f27d26]/10 border-white/10 hover:border-[#f27d26]/30 text-orange-300'
                      : 'bg-stone-50 hover:bg-orange-50 border-stone-200 hover:border-orange-300 text-stone-800'
                  }`}
                >
                  <Upload className="w-5 h-5 group-hover:scale-110 transition-transform text-[#f27d26]" />
                  <span>بازیابی از فایل</span>
                </motion.button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/json"
                  className="hidden"
                />
              </div>
            </div>

            {/* Notifications Toggle */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-white/[0.03] border-white/5' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#f27d26]" />
                <div>
                  <p className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                    اعلان‌های مرورگر
                  </p>
                  <p className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    یادآوری برای کارهای زمان‌دار
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRequestNotif}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  notifEnabled
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                    : isDark
                    ? 'bg-white/10 text-stone-300 hover:bg-white/20'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {notifEnabled ? 'فعال است' : 'فعال‌سازی'}
              </motion.button>
            </div>

            {/* Privacy Info */}
            <div
              className={`flex items-start gap-2 p-3 rounded-2xl border text-[11px] leading-relaxed ${
                isDark
                  ? 'bg-white/[0.02] border-white/5 text-stone-400'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                اطلاعات شما به صورت امن در حافظه محلی مرورگر (LocalStorage) همین دستگاه نگهداری می‌شود.
                جهت استفاده در دستگاه‌های دیگر می‌توانید از خروجی JSON استفاده نمایید.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
