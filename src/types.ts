export type MainTabType = 'calendar' | 'tasks';

export type CalendarViewMode = 'month' | 'week';

export type TaskTabType = 'daily' | 'general' | 'lists';

export type ThemeMode = 'dark' | 'light' | 'turquoise';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CustomListItem {
  id: string;
  category: string; // e.g. 'فیلم و سریال', 'کتاب‌ها', 'یادداشت‌های آزاد' or custom
  title: string;
  note?: string;
  done: boolean;
  createdAt: string;
}

export interface Occasion {
  id?: string;
  jm: number; // Jalali/Shahanshahi Month (1-12)
  jd: number; // Jalali/Shahanshahi Day (1-31)
  name: string;
  desc: string;
  isAncient?: boolean;
}

export type TaskPriority = 'gold' | 'silver' | 'bronze';

export interface Reminder {
  id: string;
  title: string;
  time?: string;
  folder?: string;
  important?: boolean;
  priority?: TaskPriority;
  recur: RecurrenceType;
  done: boolean;
  dateType: 'daily' | 'general';
  dateKey?: string | null; // e.g. "2585-05-26" for quick O(1) indexed lookups
  jy?: number | null;
  jm?: number | null;
  jd?: number | null;
  createdAt: string;
}

export interface ShahDate {
  jy: number; // Shahanshahi Year (e.g. 2585) or Jalali
  jm: number; // Month 1-12
  jd: number; // Day 1-31
}

export interface GregDate {
  gy: number; // e.g. 2026
  gm: number; // 1-12
  gd: number; // 1-31
}

export interface AppSettings {
  theme: ThemeMode;
  notif: boolean;
  showGregorian: boolean;
}

export interface Countdown {
  id: string;
  title: string;
  jy: number;
  jm: number;
  jd: number;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  birthJy: number;
  birthJm: number;
  birthJd: number;
}

