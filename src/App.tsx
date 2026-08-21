import React, { useState, useEffect } from 'react';
import { MainTabType, Reminder, ShahDate, ThemeMode, Countdown, UserProfile } from './types';
import { getTodayShahanshahi } from './utils/calendar';
import { getOccasionsForDate } from './data/occasions';
import { Header } from './components/Header';
import { MainTabs } from './components/MainTabs';
import { CalendarView } from './components/CalendarView';
import { TasksView } from './components/TasksView';
import { DateConverterModal } from './components/DateConverterModal';
import { BackupModal } from './components/BackupModal';
import { SettingsModal } from './components/SettingsModal';
import { CountdownModal } from './components/CountdownModal';
import { OnboardingModal } from './components/OnboardingModal';
import { PersepolisBg } from './components/PersepolisBg';
import { playTaskCompleteSound, playTaskUncheckSound } from './utils/sound';

const STORAGE_REMINDERS_KEY = 'sc_reminders_v2';
const STORAGE_FOLDERS_KEY = 'sc_folders_v2';
const STORAGE_SETTINGS_KEY = 'sc_settings_v2';
const STORAGE_THEME_KEY = 'sc_theme_mode';
const STORAGE_COUNTDOWNS_KEY = 'sc_countdowns_v1';
const STORAGE_PROFILE_KEY = 'sc_profile_v1';

const DEFAULT_FOLDERS = ['کار', 'شخصی', 'مطالعه', 'خرید'];

export default function App() {
  const [today] = useState<ShahDate>(() => getTodayShahanshahi());
  const [currentDate, setCurrentDate] = useState<ShahDate>(() => getTodayShahanshahi());
  const [selectedDate, setSelectedDate] = useState<ShahDate>(() => getTodayShahanshahi());
  const [activeTab, setActiveTab] = useState<MainTabType>('calendar');

  // Theme state: default to 'dark'
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_THEME_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'turquoise') {
        return savedTheme;
      }
    } catch (e) {
      console.error(e);
    }
    return 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'dark') return 'turquoise';
      if (prev === 'turquoise') return 'light';
      return 'dark';
    });
  };

  // Synchronize document theme class
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch (e) {
      console.error(e);
    }

    const docEl = document.documentElement;
    const bodyEl = document.body;

    docEl.classList.remove('dark', 'light', 'turquoise');
    bodyEl.classList.remove('dark', 'light', 'turquoise');

    docEl.classList.add(theme);
    bodyEl.classList.add(theme);
  }, [theme]);

  // Reminders and Folders State
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_REMINDERS_KEY);
      if (stored) return JSON.parse(stored);
      // fallback to old storage key if exists
      const old = localStorage.getItem('sc_reminders');
      if (old) return JSON.parse(old);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [folders, setFolders] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_FOLDERS_KEY);
      if (stored) return JSON.parse(stored);
      const old = localStorage.getItem('sc_folders');
      if (old) return JSON.parse(old);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_FOLDERS;
  });

  const [notifEnabled, setNotifEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (stored) return JSON.parse(stored).notif || false;
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  // Modal states
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCountdownOpen, setIsCountdownOpen] = useState(false);

  // Countdowns State
  const [countdowns, setCountdowns] = useState<Countdown[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_COUNTDOWNS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // User Profile State (name + Shahanshahi birth date, collected on first launch)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_PROFILE_KEY) !== null || localStorage.getItem('sc_onboarding_skipped') === '1';
    } catch (e) {
      return false;
    }
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(reminders));
    } catch (e) {
      console.error(e);
    }
  }, [reminders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(folders));
    } catch (e) {
      console.error(e);
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify({ notif: notifEnabled }));
    } catch (e) {
      console.error(e);
    }
  }, [notifEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COUNTDOWNS_KEY, JSON.stringify(countdowns));
    } catch (e) {
      console.error(e);
    }
  }, [countdowns]);

  // Handlers for Countdowns
  const handleAddCountdown = (data: Omit<Countdown, 'id' | 'createdAt'>) => {
    const newCountdown: Countdown = {
      ...data,
      id: 'cd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    };
    setCountdowns((prev) => [newCountdown, ...prev]);
  };

  const handleDeleteCountdown = (id: string) => {
    setCountdowns((prev) => prev.filter((c) => c.id !== id));
  };

  // Onboarding handlers
  const handleCompleteOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    setHasSeenOnboarding(true);
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSkipOnboarding = () => {
    setHasSeenOnboarding(true);
    try {
      localStorage.setItem('sc_onboarding_skipped', '1');
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for Reminders
  const handleAddReminder = (data: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...data,
      id: 'rem_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newReminder, ...prev]);
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const willBeDone = !r.done;
          if (willBeDone) {
            playTaskCompleteSound();
          } else {
            playTaskUncheckSound();
          }
          return { ...r, done: willBeDone };
        }
        return r;
      })
    );
  };

  const handleUpdateReminder = (id: string, updated: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Handlers for Folders
  const handleAddFolder = (name: string) => {
    if (!folders.includes(name)) {
      setFolders((prev) => [...prev, name]);
    }
  };

  const handleDeleteFolder = (name: string) => {
    setFolders((prev) => prev.filter((f) => f !== name));
    // update reminders that had this folder
    setReminders((prev) =>
      prev.map((r) => (r.folder === name ? { ...r, folder: undefined } : r))
    );
  };

  const handleImportData = (data: { reminders: Reminder[]; folders: string[] }) => {
    setReminders(data.reminders);
    if (data.folders && data.folders.length > 0) {
      setFolders(data.folders);
    }
  };

  const handleJumpToday = () => {
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleSelectDate = (date: ShahDate) => {
    setSelectedDate(date);
  };

  const handleChangeMonth = (year: number, month: number) => {
    setCurrentDate((prev) => ({
      ...prev,
      jy: year,
      jm: month,
    }));
  };

  // Count pending tasks
  const pendingTasksCount = reminders.filter((r) => !r.done).length;
  const todayOccasions = getOccasionsForDate(today.jm, today.jd);
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';

  return (
    <div
      className={`min-h-screen flex flex-col justify-between selection:bg-[#f27d26]/30 selection:text-orange-300 transition-colors duration-300 relative ${
        isDark ? 'text-stone-100' : isTurquoise ? 'text-slate-800' : 'text-stone-900'
      }`}
    >
      <PersepolisBg theme={theme} />

      <div className="relative z-10">
        {/* Minimalist Top App Bar */}
        <Header
          today={today}
          theme={theme}
          userName={userProfile?.name}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onJumpToday={handleJumpToday}
        />

        {/* Main Two Tabs: تقویم | یادآورها و کارها */}
        <MainTabs
          activeTab={activeTab}
          theme={theme}
          onChangeTab={setActiveTab}
          pendingTasksCount={pendingTasksCount}
          hasOccasionToday={todayOccasions.length > 0}
        />

        {/* Tab 1: Calendar View */}
        {activeTab === 'calendar' && (
          <main>
            <CalendarView
              currentDate={currentDate}
              selectedDate={selectedDate}
              today={today}
              theme={theme}
              reminders={reminders}
              onSelectDate={handleSelectDate}
              onChangeMonth={handleChangeMonth}
              onToggleReminder={handleToggleReminder}
            />
          </main>
        )}

        {/* Tab 2: Tasks & Reminders View */}
        {activeTab === 'tasks' && (
          <main>
            <TasksView
              selectedDate={selectedDate}
              theme={theme}
              reminders={reminders}
              folders={folders}
              onAddReminder={handleAddReminder}
              onToggleReminder={handleToggleReminder}
              onUpdateReminder={handleUpdateReminder}
              onDeleteReminder={handleDeleteReminder}
              onAddFolder={handleAddFolder}
              onDeleteFolder={handleDeleteFolder}
            />
          </main>
        )}
      </div>

      {/* Footer Note */}
      <footer
        className={`w-full py-4 text-center text-xs relative z-10 border-t transition-colors duration-300 mt-auto ${
          isDark
            ? 'text-stone-500 border-white/5'
            : isTurquoise
            ? 'text-sky-900/60 border-sky-100'
            : 'text-stone-500 border-stone-200'
        }`}
      >
        تقویم شاهنشاهی و یادآورها • تاریخ خورشیدی هماهنگ با اعتدال بهاری و جشن‌های کهن ایران‌زمین
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        theme={theme}
        onClose={() => setIsSettingsOpen(false)}
        onSelectTheme={setTheme}
        onOpenConverter={() => setIsConverterOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenCountdown={() => setIsCountdownOpen(true)}
      />

      <DateConverterModal
        isOpen={isConverterOpen}
        theme={theme}
        onClose={() => setIsConverterOpen(false)}
        initialShahDate={selectedDate}
      />

      <BackupModal
        isOpen={isBackupOpen}
        theme={theme}
        onClose={() => setIsBackupOpen(false)}
        reminders={reminders}
        folders={folders}
        onImportData={handleImportData}
        notifEnabled={notifEnabled}
        onToggleNotif={setNotifEnabled}
      />

      <CountdownModal
        isOpen={isCountdownOpen}
        theme={theme}
        onClose={() => setIsCountdownOpen(false)}
        countdowns={countdowns}
        onAddCountdown={handleAddCountdown}
        onDeleteCountdown={handleDeleteCountdown}
        userProfile={userProfile}
      />

      <OnboardingModal
        isOpen={!hasSeenOnboarding}
        theme={theme}
        onComplete={handleCompleteOnboarding}
        onSkip={handleSkipOnboarding}
      />
    </div>
  );
}

