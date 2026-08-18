import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Clock,
  Folder as FolderIcon,
  RotateCw,
  Trash2,
  CheckCircle2,
  Circle,
  X,
  ListTodo,
  CalendarDays,
  Layers,
  Calendar,
  Sparkles,
  Pencil,
  Check,
  Filter,
} from 'lucide-react';
import { Reminder, ShahDate, TaskTabType, RecurrenceType, ThemeMode, TaskPriority } from '../types';
import { MONTH_NAMES_FA, toFa, WEEKDAYS_FA, weekdayOfShahDate } from '../utils/calendar';
import { CustomListsView } from './CustomListsView';
import { TaskDatePickerModal } from './TaskDatePickerModal';

interface TasksViewProps {
  selectedDate: ShahDate;
  theme?: ThemeMode;
  reminders: Reminder[];
  folders: string[];
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  onToggleReminder: (id: string) => void;
  onUpdateReminder?: (id: string, updated: Partial<Reminder>) => void;
  onDeleteReminder: (id: string) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (name: string) => void;
}

type QuickFilterType = 'all' | 'gold' | 'silver' | 'bronze' | 'pending' | 'completed';

type PriorityStyle = {
  borderClass: string;
  badgeClass: string;
  dotColor: string;
  label: string;
};

interface ReminderItemProps {
  reminder: Reminder;
  pStyle: PriorityStyle;
  isDark: boolean;
  isTurquoise: boolean;
  onToggleReminder: (id: string) => void;
  onStartEdit: (reminder: Reminder) => void;
  onDeleteReminder: (id: string) => void;
}

// Extracted & memoized so that typing in the search box, opening modals,
// or any other TasksView state change doesn't force every reminder row
// in the list to re-render — only the row whose own props actually changed.
const ReminderItem: React.FC<ReminderItemProps> = memo(function ReminderItem({
  reminder,
  pStyle,
  isDark,
  isTurquoise,
  onToggleReminder,
  onStartEdit,
  onDeleteReminder,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group relative overflow-hidden ${
        reminder.done
          ? isDark
            ? 'bg-white/[0.02] border-white/5 opacity-60'
            : isTurquoise
            ? 'bg-sky-50/40 border-sky-100 opacity-60'
            : 'bg-stone-100/60 border-stone-200 opacity-60'
          : pStyle.borderClass
      }`}
    >
      {/* Right Accent Stripe based on priority */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-1.5 ${
          reminder.done
            ? 'bg-stone-500/30'
            : reminder.priority === 'gold' || reminder.important
            ? 'bg-gradient-to-b from-amber-400 to-yellow-500'
            : reminder.priority === 'bronze'
            ? 'bg-[#cd7f32]'
            : isTurquoise
            ? 'bg-sky-400'
            : 'bg-slate-400'
        }`}
      />

      <div className="flex items-center gap-3 flex-1 min-w-0 pr-1">
        {/* Checkbox */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => onToggleReminder(reminder.id)}
          className={`transition cursor-pointer shrink-0 p-1 min-w-[36px] min-h-[36px] flex items-center justify-center ${
            isTurquoise ? 'text-slate-400 hover:text-sky-600' : 'text-stone-400 hover:text-[#f27d26]'
          }`}
          aria-label={reminder.done ? 'علامت‌گذاری به عنوان انجام‌نشده' : 'علامت‌گذاری به عنوان انجام‌شده'}
        >
          {reminder.done ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </motion.button>

        {/* Title & metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs sm:text-sm font-bold transition-all ${
                reminder.done
                  ? 'line-through text-stone-500'
                  : isDark
                  ? 'text-stone-100'
                  : isTurquoise
                  ? 'text-slate-800'
                  : 'text-stone-900'
              }`}
            >
              {reminder.title}
            </span>

            {/* Priority Badge */}
            <span
              className={`text-[11px] px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 ${pStyle.badgeClass}`}
              title={`اولویت: ${pStyle.label}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dotColor}`} />
              <span>{pStyle.label}</span>
            </span>

            {/* Recurrence Badge */}
            {reminder.recur && reminder.recur !== 'none' && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium flex items-center gap-1 ${
                  isDark
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}
              >
                <RotateCw className="w-2.5 h-2.5" />
                <span>
                  {reminder.recur === 'daily' ? 'تکرار روزانه' : 'تکرار ماهانه'}
                </span>
              </span>
            )}

            {/* Folder Badge */}
            {reminder.folder && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                  isDark
                    ? 'bg-white/10 text-stone-300'
                    : isTurquoise
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                📁 {reminder.folder}
              </span>
            )}
          </div>

          {reminder.time && (
            <div
              className={`text-[11px] flex items-center gap-1 mt-1 ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>ساعت {reminder.time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons (Edit & Delete) */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Edit Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onStartEdit(reminder)}
          className={`p-2 rounded-xl border transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
            isDark
              ? 'border-white/5 hover:border-white/20 text-stone-400 hover:text-white hover:bg-white/5'
              : isTurquoise
              ? 'border-sky-100 hover:border-sky-300 text-slate-600 hover:text-sky-700 hover:bg-sky-50'
              : 'border-stone-200 hover:border-stone-300 text-stone-500 hover:text-stone-900 hover:bg-stone-100'
          }`}
          title="ویرایش کار"
          aria-label="ویرایش کار"
        >
          <Pencil className="w-3.5 h-3.5" />
        </motion.button>

        {/* Delete Action */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDeleteReminder(reminder.id)}
          className={`p-2 rounded-xl border transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
            isDark
              ? 'border-transparent hover:border-rose-500/30 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10'
              : 'border-transparent hover:border-rose-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50'
          }`}
          title="حذف کار"
          aria-label="حذف کار"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
});

export const TasksView: React.FC<TasksViewProps> = ({
  selectedDate,
  theme = 'dark',
  reminders,
  folders,
  onAddReminder,
  onToggleReminder,
  onUpdateReminder,
  onDeleteReminder,
  onAddFolder,
  onDeleteFolder,
}) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';
  const [taskTab, setTaskTab] = useState<TaskTabType>('daily');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Date Picker Modal State
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('silver');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Edit Task State
  const [editingTask, setEditingTask] = useState<Reminder | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editFolder, setEditFolder] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('silver');
  const [editRecur, setEditRecur] = useState<RecurrenceType>('none');

  // Selected date info
  const weekdayIndex = weekdayOfShahDate(selectedDate.jy, selectedDate.jm, selectedDate.jd);
  const weekdayName = WEEKDAYS_FA[weekdayIndex];
  const dateLabel = `${weekdayName}، ${toFa(selectedDate.jd)} ${MONTH_NAMES_FA[selectedDate.jm - 1]} ${toFa(selectedDate.jy)}`;

  // Base list according to tab & folder.
  // Memoized so this filtering pass only reruns when one of its actual
  // inputs changes, instead of on every TasksView re-render (typing in
  // search, opening a modal, toggling a switch, etc).
  const baseTabReminders = useMemo(
    () =>
      reminders
        .filter((r) => {
          // Tab filter
          if (taskTab === 'daily') {
            if (r.dateType !== 'daily' && r.dateType !== ('specific' as any)) return false;
            if (r.recur === 'daily') return true;
            if (r.recur === 'monthly') return r.jd === selectedDate.jd;
            if (r.recur === 'none' || !r.recur) {
              return r.jy === selectedDate.jy && r.jm === selectedDate.jm && r.jd === selectedDate.jd;
            }
            return false;
          } else if (taskTab === 'general') {
            return r.dateType === 'general';
          }
          return false;
        })
        .filter((r) => {
          // Folder filter
          if (activeFolder === null) return true;
          return r.folder === activeFolder;
        }),
    [reminders, taskTab, selectedDate.jy, selectedDate.jm, selectedDate.jd, activeFolder]
  );

  // Calculate live counts for quick filters
  const { countAll, countGold, countSilver, countBronze, countPending, countCompleted } = useMemo(
    () => ({
      countAll: baseTabReminders.length,
      countGold: baseTabReminders.filter((r) => r.priority === 'gold' || r.important).length,
      countSilver: baseTabReminders.filter((r) => r.priority === 'silver' || (!r.priority && !r.important)).length,
      countBronze: baseTabReminders.filter((r) => r.priority === 'bronze').length,
      countPending: baseTabReminders.filter((r) => !r.done).length,
      countCompleted: baseTabReminders.filter((r) => r.done).length,
    }),
    [baseTabReminders]
  );

  // Filter & Sort reminders
  const filteredReminders = useMemo(
    () =>
      baseTabReminders
        .filter((r) => {
          // Quick filter
          if (quickFilter === 'gold') return r.priority === 'gold' || r.important;
          if (quickFilter === 'silver') return r.priority === 'silver' || (!r.priority && !r.important);
          if (quickFilter === 'bronze') return r.priority === 'bronze';
          if (quickFilter === 'pending') return !r.done;
          if (quickFilter === 'completed') return r.done;
          return true; // 'all'
        })
        .filter((r) => {
          // Search query filter
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return r.title.toLowerCase().includes(q) || (r.folder && r.folder.toLowerCase().includes(q));
        })
        .sort((a, b) => {
          // 1. Incomplete before completed
          if (a.done !== b.done) return a.done ? 1 : -1;
          // 2. Priority: Gold (3) > Silver (2) > Bronze (1)
          const pA = a.priority === 'gold' || a.important ? 3 : a.priority === 'bronze' ? 1 : 2;
          const pB = b.priority === 'gold' || b.important ? 3 : b.priority === 'bronze' ? 1 : 2;
          if (pA !== pB) return pB - pA;
          // 3. Time
          return (a.time || '99:99').localeCompare(b.time || '99:99');
        }),
    [baseTabReminders, quickFilter, searchQuery]
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (taskTab === 'daily') {
      const dateKey = `${selectedDate.jy}-${String(selectedDate.jm).padStart(2, '0')}-${String(selectedDate.jd).padStart(2, '0')}`;
      onAddReminder({
        title: newTitle.trim(),
        time: newTime.trim() || undefined,
        folder: newFolder.trim() || undefined,
        important: newPriority === 'gold',
        priority: newPriority,
        recur: 'none',
        done: false,
        dateType: 'daily',
        dateKey,
        jy: selectedDate.jy,
        jm: selectedDate.jm,
        jd: selectedDate.jd,
      });
    } else {
      onAddReminder({
        title: newTitle.trim(),
        time: newTime.trim() || undefined,
        folder: newFolder.trim() || undefined,
        important: newPriority === 'gold',
        priority: newPriority,
        recur: 'none',
        done: false,
        dateType: 'general',
        dateKey: null,
        jy: null,
        jm: null,
        jd: null,
      });
    }

    setNewTitle('');
    setNewTime('');
    setNewFolder('');
  };

  const handleModalConfirm = (taskData: Omit<Reminder, 'id' | 'createdAt'>) => {
    onAddReminder(taskData);
    setNewTitle('');
    setNewTime('');
    setNewFolder('');
  };

  const handleStartEdit = useCallback((reminder: Reminder) => {
    setEditingTask(reminder);
    setEditTitle(reminder.title);
    setEditTime(reminder.time || '');
    setEditFolder(reminder.folder || '');
    setEditPriority(reminder.priority || (reminder.important ? 'gold' : 'silver'));
    setEditRecur(reminder.recur || 'none');
  }, []);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    if (onUpdateReminder) {
      onUpdateReminder(editingTask.id, {
        title: editTitle.trim(),
        time: editTime.trim() || undefined,
        folder: editFolder.trim() || undefined,
        priority: editPriority,
        important: editPriority === 'gold',
        recur: editRecur,
      });
    }
    setEditingTask(null);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onAddFolder(newFolderName.trim());
    setNewFolderName('');
    setShowFolderInput(false);
  };

  // Helper for priority metadata
  const getPriorityStyle = (priority?: TaskPriority, important?: boolean) => {
    const p: TaskPriority = priority || (important ? 'gold' : 'silver');
    if (p === 'gold') {
      return {
        label: 'زرین (بالا)',
        badgeClass: isDark
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          : isTurquoise
          ? 'bg-amber-50 text-amber-800 border-amber-300'
          : 'bg-amber-100 text-amber-900 border-amber-300',
        borderClass: isDark
          ? 'border-amber-500/40 hover:border-amber-500/70 bg-amber-500/[0.03]'
          : isTurquoise
          ? 'border-amber-300/80 hover:border-amber-400 bg-amber-50/30'
          : 'border-amber-400/80 hover:border-amber-500 bg-amber-50/40',
        dotColor: 'bg-amber-400',
      };
    }
    if (p === 'silver') {
      return {
        label: 'سیمین (متوسط)',
        badgeClass: isDark
          ? 'bg-slate-500/20 text-slate-300 border-slate-400/30'
          : isTurquoise
          ? 'bg-sky-50 text-sky-800 border-sky-200'
          : 'bg-stone-100 text-stone-700 border-stone-300',
        borderClass: isDark
          ? 'border-white/10 hover:border-slate-400/40 bg-white/[0.03]'
          : isTurquoise
          ? 'border-sky-200 hover:border-sky-300 bg-white/90'
          : 'border-stone-200 hover:border-stone-300 bg-white/80',
        dotColor: 'bg-slate-300',
      };
    }
    return {
      label: 'برنز (معمولی)',
      badgeClass: isDark
        ? 'bg-orange-950/40 text-orange-300 border-orange-800/40'
        : isTurquoise
        ? 'bg-orange-50 text-orange-900 border-orange-200'
        : 'bg-orange-50 text-orange-900 border-orange-200',
      borderClass: isDark
        ? 'border-amber-900/30 hover:border-amber-800/50 bg-amber-950/[0.02]'
        : isTurquoise
        ? 'border-stone-200 hover:border-orange-200 bg-white/80'
        : 'border-stone-200 hover:border-stone-300 bg-stone-50/60',
      dotColor: 'bg-[#cd7f32]',
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-12 flex flex-col gap-4 transition-colors duration-300">
      {/* Date Picker Modal for creating task with explicit date */}
      <TaskDatePickerModal
        isOpen={isDatePickerModalOpen}
        onClose={() => setIsDatePickerModalOpen(false)}
        onConfirm={handleModalConfirm}
        initialDate={selectedDate}
        initialTitle={newTitle}
        initialTime={newTime}
        initialPriority={newPriority}
        folders={folders}
        theme={theme}
      />

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-md p-5 sm:p-6 rounded-3xl border shadow-2xl ${
                isDark
                  ? 'bg-[#18181e] text-white border-white/15'
                  : isTurquoise
                  ? 'bg-white text-slate-800 border-sky-200 shadow-sky-950/10'
                  : 'bg-white text-stone-900 border-stone-200 shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-current/10">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${isTurquoise ? 'bg-sky-100 text-sky-700' : 'bg-[#f27d26]/20 text-[#f27d26]'}`}>
                    <Pencil className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black">ویرایش کار و یادآور</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="p-1.5 rounded-xl border border-transparent hover:border-current/20 opacity-70 hover:opacity-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">عنوان کار</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border focus:outline-none transition ${
                      isDark
                        ? 'bg-black/30 border-white/10 text-white focus:border-[#f27d26]'
                        : isTurquoise
                        ? 'bg-sky-50/50 border-sky-200 text-slate-800 focus:border-sky-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-[#f27d26]'
                    }`}
                  />
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#f27d26]" />
                    <span>سطح اولویت</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditPriority('gold')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer min-h-[44px] ${
                        editPriority === 'gold'
                          ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-400 border-amber-400/80 ring-1 ring-amber-400 shadow-xs'
                          : isDark
                          ? 'bg-white/[0.02] text-stone-400 border-white/10'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400" />
                      <span>زرین (بالا)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditPriority('silver')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer min-h-[44px] ${
                        editPriority === 'silver'
                          ? isTurquoise
                            ? 'bg-sky-500/20 text-sky-700 border-sky-400 ring-1 ring-sky-400 shadow-xs'
                            : 'bg-slate-400/25 text-slate-300 border-slate-300/80 ring-1 ring-slate-300 shadow-xs'
                          : isDark
                          ? 'bg-white/[0.02] text-stone-400 border-white/10'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-xs" />
                      <span>سیمین (متوسط)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditPriority('bronze')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer min-h-[44px] ${
                        editPriority === 'bronze'
                          ? 'bg-amber-800/25 text-amber-300 border-amber-700/80 ring-1 ring-amber-700 shadow-xs'
                          : isDark
                          ? 'bg-white/[0.02] text-stone-400 border-white/10'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#cd7f32]" />
                      <span>برنز (معمولی)</span>
                    </button>
                  </div>
                </div>

                {/* Time & Folder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>ساعت</span>
                    </label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 text-xs border outline-none ${
                        isDark
                          ? 'bg-black/30 text-stone-200 border-white/10'
                          : isTurquoise
                          ? 'bg-white text-slate-800 border-sky-200'
                          : 'bg-stone-50 text-stone-900 border-stone-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80 flex items-center gap-1">
                      <FolderIcon className="w-3.5 h-3.5 text-stone-400" />
                      <span>پوشه</span>
                    </label>
                    <select
                      value={editFolder}
                      onChange={(e) => setEditFolder(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 text-xs border outline-none ${
                        isDark
                          ? 'bg-[#141418] text-stone-200 border-white/10'
                          : isTurquoise
                          ? 'bg-white text-slate-800 border-sky-200'
                          : 'bg-stone-50 text-stone-900 border-stone-200'
                      }`}
                    >
                      <option value="">بدون پوشه</option>
                      {folders.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Recurrence */}
                {editingTask.dateType === 'daily' && (
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 text-stone-400" />
                      <span>الگوی تکرار</span>
                    </label>
                    <select
                      value={editRecur}
                      onChange={(e) => setEditRecur(e.target.value as RecurrenceType)}
                      className={`w-full rounded-xl px-3 py-2 text-xs border outline-none ${
                        isDark
                          ? 'bg-[#141418] text-stone-200 border-white/10'
                          : isTurquoise
                          ? 'bg-white text-slate-800 border-sky-200'
                          : 'bg-stone-50 text-stone-900 border-stone-200'
                      }`}
                    >
                      <option value="none">یک‌باره (فقط همین روز)</option>
                      <option value="daily">روزانه (هر روز)</option>
                      <option value="monthly">ماهانه (هر ماه)</option>
                    </select>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-current/10">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border border-current/10 hover:bg-current/5 transition cursor-pointer min-h-[44px]"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className={`flex items-center gap-1.5 px-6 py-2.5 text-xs font-black rounded-xl transition cursor-pointer shadow-lg active:scale-95 min-h-[44px] ${
                      isTurquoise
                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
                        : 'bg-[#f27d26] hover:bg-[#ff8a38] text-stone-950 shadow-[#f27d26]/20'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>ذخیره تغییرات</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Task Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="p-4 sm:p-7 rounded-3xl glass-panel shadow-2xl transition-all duration-300"
      >
        {/* Sub-tabs header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-4 border-b ${
            isDark ? 'border-white/10' : isTurquoise ? 'border-sky-100' : 'border-stone-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setTaskTab('daily')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-colors relative cursor-pointer select-none z-10 min-h-[40px] ${
                taskTab === 'daily'
                  ? isTurquoise ? 'text-white font-extrabold' : 'text-stone-950 font-extrabold'
                  : isDark
                  ? 'text-stone-300 hover:text-white'
                  : isTurquoise
                  ? 'text-slate-600 hover:text-sky-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {taskTab === 'daily' && (
                <motion.div
                  layoutId="activeTaskTab"
                  className={`absolute inset-0 rounded-2xl -z-10 shadow-md ${
                    isTurquoise ? 'bg-sky-500 shadow-sky-500/20' : 'bg-[#f27d26] shadow-[#f27d26]/20'
                  }`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <CalendarDays className="w-4 h-4" />
              <span>یادآورهای روز</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setTaskTab('general')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-colors relative cursor-pointer select-none z-10 min-h-[40px] ${
                taskTab === 'general'
                  ? isTurquoise ? 'text-white font-extrabold' : 'text-stone-950 font-extrabold'
                  : isDark
                  ? 'text-stone-300 hover:text-white'
                  : isTurquoise
                  ? 'text-slate-600 hover:text-sky-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {taskTab === 'general' && (
                <motion.div
                  layoutId="activeTaskTab"
                  className={`absolute inset-0 rounded-2xl -z-10 shadow-md ${
                    isTurquoise ? 'bg-sky-500 shadow-sky-500/20' : 'bg-[#f27d26] shadow-[#f27d26]/20'
                  }`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <ListTodo className="w-4 h-4" />
              <span>کارهای عمومی</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setTaskTab('lists')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-colors relative cursor-pointer select-none z-10 min-h-[40px] ${
                taskTab === 'lists'
                  ? isTurquoise ? 'text-white font-extrabold' : 'text-stone-950 font-extrabold'
                  : isDark
                  ? 'text-stone-300 hover:text-white'
                  : isTurquoise
                  ? 'text-slate-600 hover:text-sky-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {taskTab === 'lists' && (
                <motion.div
                  layoutId="activeTaskTab"
                  className={`absolute inset-0 rounded-2xl -z-10 shadow-md ${
                    isTurquoise ? 'bg-sky-500 shadow-sky-500/20' : 'bg-[#f27d26] shadow-[#f27d26]/20'
                  }`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Layers className="w-4 h-4" />
              <span>لیست‌های موضوعی</span>
            </motion.button>
          </div>

          {/* Active Context / Date Sub-header */}
          {taskTab === 'daily' && (
            <div className="flex items-center gap-2">
              <span
                className={`text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl border ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-stone-200'
                    : isTurquoise
                    ? 'bg-sky-50 border-sky-200 text-sky-900'
                    : 'bg-stone-100 border-stone-200 text-stone-800'
                }`}
              >
                {dateLabel}
              </span>
            </div>
          )}
        </div>

        {/* Tab Content: Custom Lists */}
        {taskTab === 'lists' && <CustomListsView theme={theme} />}

        {/* Tab Content: Daily or General Tasks */}
        {taskTab !== 'lists' && (
          <div>
            {/* Search and Folders Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در بین کارها و پوشه‌ها..."
                  className={`w-full pr-10 pl-9 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none transition min-h-[44px] ${
                    isDark
                      ? 'bg-black/20 border-white/10 text-stone-200 placeholder:text-stone-500 focus:border-[#f27d26]'
                      : isTurquoise
                      ? 'bg-white/80 border-sky-200 text-slate-800 placeholder:text-slate-400 focus:border-sky-400'
                      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#f27d26]'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Folder Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin">
              <button
                onClick={() => setActiveFolder(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
                  activeFolder === null
                    ? isTurquoise
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-[#f27d26] text-stone-950 shadow-xs'
                    : isDark
                    ? 'bg-white/5 text-stone-400 hover:text-stone-200'
                    : isTurquoise
                    ? 'bg-sky-50 text-slate-600 hover:text-sky-900'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                }`}
              >
                همه پوشه‌ها
              </button>

              {folders.map((folder) => {
                const isActive = activeFolder === folder;
                return (
                  <div key={folder} className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => setActiveFolder(folder)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
                        isActive
                          ? isTurquoise
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'bg-[#f27d26] text-stone-950 shadow-xs'
                          : isDark
                          ? 'bg-white/5 text-stone-400 hover:text-stone-200'
                          : isTurquoise
                          ? 'bg-sky-50 text-slate-600 hover:text-sky-900'
                          : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      📁 {folder}
                    </button>
                    {isActive && (
                      <button
                        onClick={() => onDeleteFolder(folder)}
                        title="حذف پوشه"
                        className="p-1 text-stone-400 hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {!showFolderInput ? (
                <button
                  onClick={() => setShowFolderInput(true)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs border border-dashed transition cursor-pointer shrink-0 min-h-[36px] ${
                    isDark
                      ? 'border-white/20 text-stone-400 hover:text-white'
                      : isTurquoise
                      ? 'border-sky-300 text-sky-700 hover:bg-sky-50'
                      : 'border-stone-300 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>پوشه جدید</span>
                </button>
              ) : (
                <form onSubmit={handleCreateFolder} className="flex items-center gap-1 shrink-0">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="نام پوشه..."
                    autoFocus
                    className={`px-2.5 py-1 text-xs rounded-xl border focus:outline-none ${
                      isDark
                        ? 'bg-[#1a1a20] text-white border-white/20 focus:border-[#f27d26]'
                        : isTurquoise
                        ? 'bg-white text-slate-800 border-sky-300 focus:border-sky-500'
                        : 'bg-white text-stone-900 border-stone-300 focus:border-[#f27d26]'
                    }`}
                  />
                  <button
                    type="submit"
                    className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      isTurquoise ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'bg-[#f27d26] text-stone-950 hover:bg-[#ff8a38]'
                    }`}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFolderInput(false)}
                    className="p-1.5 bg-stone-700 text-white rounded-lg text-xs cursor-pointer"
                  >
                    ×
                  </button>
                </form>
              )}
            </div>

            {/* Quick Filter Chips Bar (فیلتر سریع) */}
            <div className={`p-2.5 sm:p-3 rounded-2xl border mb-5 transition-all ${
              isDark
                ? 'bg-white/[0.02] border-white/10'
                : isTurquoise
                ? 'bg-sky-50/60 border-sky-100'
                : 'bg-stone-50 border-stone-200/80'
            }`}>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold opacity-75">
                <Filter className="w-3.5 h-3.5 text-[#f27d26]" />
                <span>فیلتر سریع وضعیت و اولویت:</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin sm:flex-wrap">
                {/* All */}
                <button
                  type="button"
                  onClick={() => setQuickFilter('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                    quickFilter === 'all'
                      ? isTurquoise
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-[#f27d26] text-stone-950 shadow-xs'
                      : isDark
                      ? 'bg-white/5 text-stone-300 hover:bg-white/10'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>همه</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-current font-black">
                    {toFa(countAll)}
                  </span>
                </button>

                {/* Gold / Urgent */}
                <button
                  type="button"
                  onClick={() => setQuickFilter('gold')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                    quickFilter === 'gold'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                      : isDark
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                      : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-xs" />
                  <span>زرین (فوری/مهم)</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-current font-black">
                    {toFa(countGold)}
                  </span>
                </button>

                {/* Silver */}
                <button
                  type="button"
                  onClick={() => setQuickFilter('silver')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                    quickFilter === 'silver'
                      ? isTurquoise
                        ? 'bg-sky-500 text-white shadow-xs font-black'
                        : 'bg-slate-400 text-stone-950 shadow-xs font-black'
                      : isDark
                      ? 'bg-slate-500/10 text-slate-300 border border-slate-500/30 hover:bg-slate-500/20'
                      : 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-300 shadow-xs" />
                  <span>سیمین (متوسط)</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-current font-black">
                    {toFa(countSilver)}
                  </span>
                </button>

                {/* Bronze */}
                <button
                  type="button"
                  onClick={() => setQuickFilter('bronze')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                    quickFilter === 'bronze'
                      ? 'bg-amber-800 text-white shadow-xs font-black'
                      : isDark
                      ? 'bg-amber-900/15 text-amber-300 border border-amber-800/30 hover:bg-amber-900/25'
                      : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#cd7f32] shadow-xs" />
                  <span>برنز (معمولی)</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-current font-black">
                    {toFa(countBronze)}
                  </span>
                </button>

                {/* Pending */}
                <button
                  type="button"
                  onClick={() => setQuickFilter('pending')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                    quickFilter === 'pending'
                      ? isTurquoise
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-stone-700 text-white shadow-xs'
                      : isDark
                      ? 'bg-white/5 text-stone-400 hover:bg-white/10'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Circle className="w-3 h-3 text-stone-400" />
                  <span>در حال انجام</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-current font-black">
                    {toFa(countPending)}
                  </span>
                </button>

                {/* Completed */}
                <button
                  type="button"
                  onClick={() => setQuickFilter('completed')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                    quickFilter === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>تکمیل‌شده</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-current font-black">
                    {toFa(countCompleted)}
                  </span>
                </button>
              </div>
            </div>

            {/* Add New Task Form */}
            <form
              onSubmit={handleCreateTask}
              className={`p-4 sm:p-5 rounded-2xl border mb-6 transition-all ${
                isDark
                  ? 'bg-black/25 border-white/10'
                  : isTurquoise
                  ? 'bg-white/90 border-sky-200 shadow-sky-900/5'
                  : 'bg-white/70 border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    taskTab === 'daily'
                      ? `افزودن یادآور روزانه (با اولویت زرین، سیمین یا برنز)...`
                      : 'افزودن کار یا یادآور عمومی...'
                  }
                  className={`flex-1 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border focus:outline-none transition min-h-[44px] ${
                    isDark
                      ? 'bg-black/30 border-white/10 text-white placeholder:text-stone-500 focus:border-[#f27d26]'
                      : isTurquoise
                      ? 'bg-sky-50/50 border-sky-200 text-slate-800 placeholder:text-slate-400 focus:border-sky-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-[#f27d26]'
                  }`}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!newTitle.trim()}
                  className={`flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0 min-h-[44px] ${
                    isTurquoise
                      ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
                      : 'bg-[#f27d26] hover:bg-[#ff8a38] text-stone-950 shadow-[#f27d26]/20'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{taskTab === 'daily' ? 'افزودن یادآور' : 'ثبت کار عمومی'}</span>
                </motion.button>
              </div>

              {/* Form Options Row */}
              <div className={`flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t ${
                isDark ? 'border-white/5' : isTurquoise ? 'border-sky-100' : 'border-stone-100'
              }`}>
                {/* Priority Selection Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold opacity-75 ml-1">اولویت:</span>
                  <button
                    type="button"
                    onClick={() => setNewPriority('gold')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer min-h-[32px] ${
                      newPriority === 'gold'
                        ? 'bg-amber-500/25 text-amber-300 border-amber-400/70 ring-1 ring-amber-400'
                        : isDark
                        ? 'bg-white/[0.02] text-stone-400 border-white/10'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>زرین (بالا)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPriority('silver')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer min-h-[32px] ${
                      newPriority === 'silver'
                        ? isTurquoise
                          ? 'bg-sky-500/20 text-sky-700 border-sky-400 ring-1 ring-sky-400'
                          : 'bg-slate-400/25 text-slate-300 border-slate-300/70 ring-1 ring-slate-300'
                        : isDark
                        ? 'bg-white/[0.02] text-stone-400 border-white/10'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span>سیمین (متوسط)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPriority('bronze')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer min-h-[32px] ${
                      newPriority === 'bronze'
                        ? 'bg-amber-800/25 text-amber-300 border-amber-700/70 ring-1 ring-amber-700'
                        : isDark
                        ? 'bg-white/[0.02] text-stone-400 border-white/10'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#cd7f32]" />
                    <span>برنز (معمولی)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Time Picker */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className={`rounded-lg px-2 py-1 border outline-none text-xs ${
                        isDark
                          ? 'bg-black/30 text-stone-200 border-white/10'
                          : isTurquoise
                          ? 'bg-white text-slate-800 border-sky-200'
                          : 'bg-stone-50 text-stone-900 border-stone-200'
                      }`}
                    />
                  </div>

                  {/* Folder Selector */}
                  <div className="flex items-center gap-1.5">
                    <FolderIcon className="w-3.5 h-3.5 text-stone-400" />
                    <select
                      value={newFolder}
                      onChange={(e) => setNewFolder(e.target.value)}
                      className={`rounded-lg px-2 py-1 border outline-none text-xs ${
                        isDark
                          ? 'bg-[#18181e] text-stone-200 border-white/10'
                          : isTurquoise
                          ? 'bg-white text-slate-800 border-sky-200'
                          : 'bg-stone-50 text-stone-900 border-stone-200'
                      }`}
                    >
                      <option value="">بدون پوشه</option>
                      {folders.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Direct Popup Open Button for Date Picker */}
                  {taskTab === 'daily' && (
                    <button
                      type="button"
                      onClick={() => setIsDatePickerModalOpen(true)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition cursor-pointer min-h-[32px] ${
                        isTurquoise
                          ? 'border-sky-300 text-sky-700 hover:bg-sky-50'
                          : 'border-[#f27d26]/40 text-[#f27d26] hover:bg-[#f27d26]/10'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>تغییر سال/ماه/روز</span>
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Task List with motion AnimatePresence */}
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {filteredReminders.length > 0 ? (
                  filteredReminders.map((reminder) => {
                    const pStyle = getPriorityStyle(reminder.priority, reminder.important);

                    return (
                      <ReminderItem
                        key={reminder.id}
                        reminder={reminder}
                        pStyle={pStyle}
                        isDark={isDark}
                        isTurquoise={isTurquoise}
                        onToggleReminder={onToggleReminder}
                        onStartEdit={handleStartEdit}
                        onDeleteReminder={onDeleteReminder}
                      />
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`py-12 px-4 text-center rounded-2xl border border-dashed ${
                      isDark
                        ? 'bg-black/10 border-white/10'
                        : isTurquoise
                        ? 'bg-sky-50/50 border-sky-200'
                        : 'bg-stone-50/50 border-stone-200'
                    }`}
                  >
                    <p className={`text-xs sm:text-sm font-medium ${
                      isDark ? 'text-stone-400' : isTurquoise ? 'text-slate-600' : 'text-stone-600'
                    }`}>
                      {searchQuery
                        ? 'کاری با این عبارت پیدا نشد.'
                        : quickFilter !== 'all'
                        ? 'کاری با این وضعیت یا سطح اولویت در این لیست وجود ندارد.'
                        : taskTab === 'daily'
                        ? 'هیچ کاری برای این روز ثبت نشده است.'
                        : 'لیست کارهای عمومی خالی است.'}
                    </p>
                    <p className={`text-[11px] mt-1.5 ${
                      isDark ? 'text-stone-500' : isTurquoise ? 'text-slate-400' : 'text-stone-400'
                    }`}>
                      {quickFilter !== 'all' ? (
                        <button
                          type="button"
                          onClick={() => setQuickFilter('all')}
                          className={`font-bold underline cursor-pointer ${
                            isTurquoise ? 'text-sky-500' : 'text-[#f27d26]'
                          }`}
                        >
                          نمایش همه کارها
                        </button>
                      ) : (
                        'می‌توانید با فرم بالا کار جدید با اولویت زرین، سیمین یا برنز ثبت کنید.'
                      )}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
