// Central place to bump the app version and describe what changed.
// App.tsx compares this version against the last one stored in
// localStorage on launch, and shows the "به‌روز شدی!" modal with the
// matching entry below whenever they differ.
export const APP_VERSION = '2.7.5';
export const APP_YEAR_SHAHANSHAHI = '۲۵۸۵';

export interface ChangelogEntry {
  version: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.7.5',
    changes: [
      'تغییر: ابزارهای کاربردی (مبدل تاریخ، پشتیبان‌گیری و بازیابی، شمارش معکوس) از بخش تنظیمات به پاپ‌آپ جدیدی منتقل شدند که با زدن روی لگوی برنامه در بالای صفحه باز می‌شود.',
    ],
  },
  {
    version: '2.7.4',
    changes: [
      'رفع اشکال: در تم فیروزه‌ای، دکمهٔ «بستن پنجره تنظیمات» و آیکون‌های بخش تنظیمات به‌جای رنگ نارنجیِ ثابت، هم‌رنگ تم فعال نمایش داده می‌شوند.',
      'رفع اشکال: نمایش ناخواستهٔ گوشه‌ای از پس‌زمینهٔ صفحه در بالای پنجرهٔ تنظیمات برطرف شد.',
      'قابلیت جدید: از این پس با هر به‌روزرسانی برنامه، فهرست تغییرات و نسخهٔ جدید هنگام ورود نمایش داده می‌شود.',
    ],
  },
];
