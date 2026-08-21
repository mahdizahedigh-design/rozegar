import { ShahDate, GregDate } from '../types';

export const SHAHANSHAHI_OFFSET = 1180; // Standard offset from Solar Hijri (1405 + 1180 = 2585)

export const MONTH_NAMES_FA = [
  'فروردین',
  'اردیبهشت',
  'خورداد',
  'تیر',
  'امرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
];

export const GREGORIAN_MONTH_NAMES_FA = [
  'ژانویه',
  'فوریه',
  'مارس',
  'آوریل',
  'مه',
  'ژوئن',
  'ژوئیه',
  'اوت',
  'سپتامبر',
  'اکتبر',
  'نوامبر',
  'دسامبر'
];

export const WEEKDAYS_FA = [
  'شنبه',
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه'
];

export const WEEKDAYS_SHORT_FA = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

// Exact integer truncation division
function trunc(a: number, b: number): number {
  return Math.trunc(a / b);
}

function mod(a: number, b: number): number {
  return a - Math.trunc(a / b) * b;
}

export function toFa(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (c) => persianDigits[parseInt(c, 10)]);
}

// Convert ShahDate to unique dateKey string (e.g., "2585-05-26")
export function toShahDateKey(date: ShahDate | { jy?: number | null; jm?: number | null; jd?: number | null }): string {
  if (!date.jy || !date.jm || !date.jd) return '';
  return `${date.jy}-${String(date.jm).padStart(2, '0')}-${String(date.jd).padStart(2, '0')}`;
}

export function parseShahDateKey(key: string): ShahDate | null {
  if (!key) return null;
  const parts = key.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { jy: parts[0], jm: parts[1], jd: parts[2] };
}

// Jalali astronomical calendar calculation (Borkowski algorithm)
export function jalCal(jySolar: number) {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
  ];
  const bl = breaks.length;
  const gy = jySolar + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm: number;
  let jump: number;
  let leap: number;
  let leapG: number;
  let march: number;
  let n: number;
  let i: number;

  if (jySolar < jp || jySolar >= breaks[bl - 1]) {
    const leapEst = (jySolar % 33 % 4 === 1) ? 0 : 1;
    return { leap: leapEst, gy, march: 20 };
  }

  for (i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jySolar < jm) break;
    leapJ = leapJ + trunc(jump, 33) * 8 + trunc(mod(jump, 33), 4);
    jp = jm;
  }
  n = jySolar - jp;

  leapJ = leapJ + trunc(n, 33) * 8 + trunc(mod(n, 33) + 3, 4);
  if (mod(jump!, 33) === 4 && jump! - n === 4) leapJ += 1;

  leapG = trunc(gy, 4) - trunc((trunc(gy, 100) + 1) * 3, 4) - 150;
  march = 20 + leapJ - leapG;

  if (jump! - n < 6) n = n - jump! + trunc(jump! + 4, 33) * 33;
  leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) {
    leap = 4;
  }

  return { leap, gy, march };
}

// Convert Shahanshahi year to Solar Hijri year for math formulas
export function shahToSolar(sy: number): number {
  if (sy > 2000) return sy - SHAHANSHAHI_OFFSET;
  return sy;
}

// Convert Solar Hijri year to Shahanshahi year
export function solarToShah(jySolar: number): number {
  if (jySolar < 2000) return jySolar + SHAHANSHAHI_OFFSET;
  return jySolar;
}

export function isLeapShahYear(sy: number): boolean {
  const jy = shahToSolar(sy);
  return jalCal(jy).leap === 0;
}

export function shahMonthLength(sy: number, sm: number): number {
  if (sm <= 6) return 31;
  if (sm <= 11) return 30;
  return isLeapShahYear(sy) ? 30 : 29;
}

export function g2d(gy: number, gm: number, gd: number): number {
  let d =
    trunc((gy + trunc(gm - 8, 6) + 100100) * 1461, 4) +
    trunc(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - trunc(trunc(gy + 100100 + trunc(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

export function d2g(jdn: number): GregDate {
  let j = 4 * jdn + 139361631;
  j = j + trunc(trunc(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = trunc(mod(j, 1461), 4) * 5 + 308;
  const gd = trunc(mod(i, 153), 5) + 1;
  const gm = mod(trunc(i, 153), 12) + 1;
  const gy = trunc(j, 1461) - 100100 + trunc(8 - gm, 6);
  return { gy, gm, gd };
}

export function j2d(jySolar: number, jm: number, jd: number): number {
  const r = jalCal(jySolar);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - trunc(jm, 7) * (jm - 7) + jd - 1;
}

export function d2j(jdn: number): { jy: number; jm: number; jd: number } {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  let r = jalCal(jy);
  let jdn1f = g2d(gy, 3, r.march);
  let jd: number;
  let jm: number;
  let k = jdn - jdn1f;

  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + trunc(k, 31);
      jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    } else {
      k -= 186;
    }
  } else {
    jy -= 1;
    r = jalCal(jy);
    jdn1f = g2d(r.gy, 3, r.march);
    k = jdn - jdn1f;
    if (k <= 185) {
      jm = 1 + trunc(k, 31);
      jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    } else {
      k -= 186;
    }
  }
  jm = 7 + trunc(k, 30);
  jd = mod(k, 30) + 1;
  return { jy, jm, jd };
}

// Convert Gregorian to Shahanshahi
export function toShahanshahi(gy: number, gm: number, gd: number): ShahDate {
  const jdn = g2d(gy, gm, gd);
  const j = d2j(jdn);
  return {
    jy: solarToShah(j.jy),
    jm: j.jm,
    jd: j.jd
  };
}

// Convert Shahanshahi to Gregorian
export function toGregorian(sy: number, sm: number, sd: number): GregDate {
  const jySolar = shahToSolar(sy);
  const jdn = j2d(jySolar, sm, sd);
  return d2g(jdn);
}

// Get day of week (0=Saturday, 1=Sunday, ..., 6=Friday)
export function weekdayOfShahDate(sy: number, sm: number, sd: number): number {
  const jySolar = shahToSolar(sy);
  const jdn = j2d(jySolar, sm, sd);
  const g = d2g(jdn);
  const jsDate = new Date(Date.UTC(g.gy, g.gm - 1, g.gd));
  const day = jsDate.getUTCDay(); // 0=Sunday, 6=Saturday
  return (day + 1) % 7; // Convert so 0=Saturday, 6=Friday
}

// Dynamically extracts today's exact date from device/client
export function getTodayShahanshahi(): ShahDate {
  const now = new Date();
  try {
    // Cross-verify with Intl API for Persian calendar if available
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-persian', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tehran'
    });
    const parts = formatter.formatToParts(now);
    let jySolar = 0;
    let jm = 0;
    let jd = 0;
    for (const p of parts) {
      if (p.type === 'year') jySolar = parseInt(p.value, 10);
      if (p.type === 'month') jm = parseInt(p.value, 10);
      if (p.type === 'day') jd = parseInt(p.value, 10);
    }
    if (jySolar > 0 && jm >= 1 && jm <= 12 && jd >= 1 && jd <= 31) {
      return {
        jy: solarToShah(jySolar),
        jm,
        jd,
      };
    }
  } catch (e) {
    // Fallback to mathematical converter
  }
  return toShahanshahi(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function isValidShahDate(sy: number, sm: number, sd: number): boolean {
  if (!sy || !sm || !sd) return false;
  if (sm < 1 || sm > 12) return false;
  const maxDays = shahMonthLength(sy, sm);
  return sd >= 1 && sd <= maxDays;
}

export function isValidGregDate(gy: number, gm: number, gd: number): boolean {
  if (!gy || !gm || !gd) return false;
  if (gm < 1 || gm > 12) return false;
  const isLeap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return gd >= 1 && gd <= daysInMonth[gm - 1];
}

export function isSameShahDate(a: ShahDate, b: ShahDate): boolean {
  return a.jy === b.jy && a.jm === b.jm && a.jd === b.jd;
}

// Add or subtract days from a ShahDate
export function addDaysToShahDate(date: ShahDate, days: number): ShahDate {
  const jySolar = shahToSolar(date.jy);
  const jdn = j2d(jySolar, date.jm, date.jd);
  const newJdn = jdn + days;
  const j = d2j(newJdn);
  return {
    jy: solarToShah(j.jy),
    jm: j.jm,
    jd: j.jd,
  };
}

// Returns the 7 days of the week containing the given date (Saturday = index 0 to Friday = index 6)
export function getWeekDaysForShahDate(date: ShahDate): ShahDate[] {
  const weekday = weekdayOfShahDate(date.jy, date.jm, date.jd); // 0=Sat, ..., 6=Fri
  const days: ShahDate[] = [];
  for (let i = 0; i < 7; i++) {
    const diff = i - weekday;
    days.push(addDaysToShahDate(date, diff));
  }
  return days;
}

// Absolute day-count difference between two Shahanshahi dates (b - a), in days
export function daysBetweenShahDates(a: ShahDate, b: ShahDate): number {
  const jdnA = j2d(shahToSolar(a.jy), a.jm, a.jd);
  const jdnB = j2d(shahToSolar(b.jy), b.jm, b.jd);
  return jdnB - jdnA;
}

// Days remaining until a target Shahanshahi date, relative to today
// (negative if the date is in the past, 0 if it's today)
export function daysUntilShahDate(target: ShahDate): number {
  return daysBetweenShahDates(getTodayShahanshahi(), target);
}

// Given a recurring month/day (e.g. a birthday), returns its next upcoming
// occurrence — this year if it hasn't passed yet, otherwise next year.
export function nextOccurrenceOfMonthDay(jm: number, jd: number): ShahDate {
  const today = getTodayShahanshahi();
  const thisYear: ShahDate = { jy: today.jy, jm, jd };
  if (daysUntilShahDate(thisYear) >= 0) return thisYear;
  return { jy: today.jy + 1, jm, jd };
}

