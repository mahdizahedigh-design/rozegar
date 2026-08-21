import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  BookOpen,
  FileText,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Tag,
  Search,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { CustomListItem, ThemeMode } from '../types';
import { toFa } from '../utils/calendar';
import { playTaskCompleteSound, playTaskUncheckSound } from '../utils/sound';

interface CustomListsViewProps {
  theme?: ThemeMode;
}

const STORAGE_LISTS_KEY = 'shah_calendar_custom_lists';
const STORAGE_CATEGORIES_KEY = 'shah_calendar_custom_list_categories';

const DEFAULT_CATEGORIES = [
  { id: 'movies', name: 'فیلم و سریال', icon: Film, placeholder: 'نام فیلم یا سریال (مثلاً: میان‌ستاره‌ای)...' },
  { id: 'books', name: 'کتاب‌ها', icon: BookOpen, placeholder: 'نام کتاب یا نویسنده (مثلاً: بوف کور)...' },
  { id: 'notes', name: 'یادداشت‌های آزاد', icon: FileText, placeholder: 'عنوان یادداشت یا ایده...' },
];

const INITIAL_SAMPLE_ITEMS: CustomListItem[] = [
  {
    id: 'sample_1',
    category: 'فیلم و سریال',
    title: 'مستند کوروش بزرگ و شگفتی‌های هخامنشی',
    note: 'کیفیت 4K و بررسی منشور حقوق بشر',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample_2',
    category: 'کتاب‌ها',
    title: 'شاهنامه فردوسی (بخش پادشاهی جمشید و فریدون)',
    note: 'مطالعه روزانه ۵۰ بیت',
    done: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample_3',
    category: 'یادداشت‌های آزاد',
    title: 'ایده‌های توسعه تقویم شاهنشاهی',
    note: 'افزودن تبدیل تاریخ‌های باستانی و یادآورهای دوره‌ای',
    done: true,
    createdAt: new Date().toISOString(),
  },
];

export const CustomListsView: React.FC<CustomListsViewProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const isTurquoise = theme === 'turquoise';

  // Custom categories list
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CATEGORIES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CATEGORIES.map((c) => c.name);
  });

  // Active selected category
  const [activeCategory, setActiveCategory] = useState<string>(DEFAULT_CATEGORIES[0].name);

  // List items state
  const [items, setItems] = useState<CustomListItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LISTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SAMPLE_ITEMS;
  });

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done'>('all');

  // New item inputs
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  // Add category modal / input
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LISTS_KEY, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  // Persist categories
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  // Handlers
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: CustomListItem = {
      id: 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      category: activeCategory,
      title: newTitle.trim(),
      note: newNote.trim() || undefined,
      done: false,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
    setNewTitle('');
    setNewNote('');
    setShowAddNote(false);
  };

  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const willBeDone = !item.done;
          if (willBeDone) {
            playTaskCompleteSound();
          } else {
            playTaskUncheckSound();
          }
          return { ...item, done: willBeDone };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const trimmed = newCategoryName.trim();
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      setActiveCategory(trimmed);
    }
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  const handleDeleteCategory = (catName: string) => {
    if (DEFAULT_CATEGORIES.some((d) => d.name === catName)) {
      return;
    }
    setCategories((prev) => prev.filter((c) => c !== catName));
    setItems((prev) => prev.filter((i) => i.category !== catName));
    if (activeCategory === catName) {
      setActiveCategory(DEFAULT_CATEGORIES[0].name);
    }
  };

  // Helper to get category icon
  const getCategoryIcon = (name: string) => {
    if (name.includes('فیلم') || name.includes('سریال')) return Film;
    if (name.includes('کتاب') || name.includes('مطالعه')) return BookOpen;
    if (name.includes('یادداشت') || name.includes('ایده')) return FileText;
    return Layers;
  };

  // Filtered items
  const categoryItems = items.filter((item) => item.category === activeCategory);

  const displayedItems = categoryItems
    .filter((item) => {
      if (statusFilter === 'pending') return !item.done;
      if (statusFilter === 'done') return item.done;
      return true;
    })
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.note && item.note.toLowerCase().includes(q))
      );
    });

  const totalCount = categoryItems.length;
  const completedCount = categoryItems.filter((i) => i.done).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Category Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {categories.map((catName) => {
            const Icon = getCategoryIcon(catName);
            const isActive = activeCategory === catName;
            const count = items.filter((i) => i.category === catName && !i.done).length;
            const isCustom = !DEFAULT_CATEGORIES.some((d) => d.name === catName);

            return (
              <motion.div key={catName} whileTap={{ scale: 0.95 }} className="relative group">
                <button
                  onClick={() => setActiveCategory(catName)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer select-none relative z-10 ${
                    isActive
                      ? isTurquoise ? 'text-white font-extrabold' : 'text-stone-950 font-extrabold'
                      : isDark
                      ? 'bg-white/[0.04] text-stone-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
                      : isTurquoise
                      ? 'bg-white/80 text-sky-900 hover:bg-sky-100 hover:text-sky-950 border border-sky-200'
                      : 'bg-stone-50 text-stone-700 hover:bg-orange-50 hover:text-orange-950 border border-stone-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="categoryActiveIndicator"
                      className={`absolute inset-0 rounded-2xl shadow-md -z-10 ${
                        isTurquoise
                          ? 'bg-sky-500 shadow-sky-500/30'
                          : 'bg-[#f27d26] shadow-[#f27d26]/25'
                      }`}
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{catName}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? isTurquoise
                            ? 'bg-white/20 text-white'
                            : 'bg-stone-950 text-orange-200'
                          : isDark
                          ? 'bg-white/10 text-orange-300'
                          : isTurquoise
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {toFa(count)}
                    </span>
                  )}
                </button>

                {/* Delete button for user custom categories */}
                {isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(catName);
                    }}
                    title="حذف این لیست"
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs z-20"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </motion.div>
            );
          })}

          {/* Add Category Button */}
          {!showNewCategoryInput ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewCategoryInput(true)}
              className={`flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-medium border border-dashed transition-all cursor-pointer ${
                isDark
                  ? 'border-white/20 text-stone-400 hover:text-stone-200 hover:border-[#f27d26]/50'
                  : isTurquoise
                  ? 'border-sky-300 text-sky-700 hover:text-sky-900 hover:border-sky-500'
                  : 'border-stone-300 text-stone-600 hover:text-stone-900 hover:border-[#f27d26]/50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>لیست جدید</span>
            </motion.button>
          ) : (
            <form onSubmit={handleAddCategory} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="نام لیست جدید..."
                autoFocus
                className={`text-xs rounded-xl px-2.5 py-1.5 border outline-none ${
                  isDark
                    ? 'bg-[#1a1a20] text-white border-white/20 focus:border-[#f27d26]'
                    : isTurquoise
                    ? 'bg-white text-slate-800 border-sky-300 focus:border-sky-500'
                    : 'bg-white text-stone-900 border-stone-300 focus:border-[#f27d26]'
                }`}
              />
              <button
                type="submit"
                className={`p-1.5 rounded-xl cursor-pointer ${
                  isTurquoise ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'bg-[#f27d26] text-stone-950 hover:bg-[#ff8a38]'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowNewCategoryInput(false)}
                className="p-1.5 bg-stone-700/50 text-stone-300 rounded-xl cursor-pointer hover:bg-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Progress Badge */}
        <div
          className={`text-[11px] font-bold px-3 py-1 rounded-xl border ${
            isDark
              ? 'bg-white/[0.03] border-white/10 text-stone-300'
              : isTurquoise
              ? 'bg-sky-50 border-sky-200 text-sky-900'
              : 'bg-stone-50 border-stone-200 text-stone-700'
          }`}
        >
          <span>تکمیل‌شده: </span>
          <strong className={isTurquoise ? 'text-sky-600' : 'text-[#f27d26]'}>{toFa(completedCount)}</strong> از{' '}
          <strong>{toFa(totalCount)}</strong>
        </div>
      </div>

      {/* Quick Add Item Form */}
      <form
        onSubmit={handleAddItem}
        className={`p-4 rounded-2xl border transition-all ${
          isDark
            ? 'bg-[#16161c]/60 border-white/10'
            : isTurquoise
            ? 'bg-white/90 border-sky-200 shadow-sky-900/5'
            : 'bg-white/80 border-stone-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`افزودن مورد جدید به «${activeCategory}»...`}
            className={`flex-1 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border outline-none transition ${
              isDark
                ? 'bg-black/30 text-stone-100 border-white/10 placeholder-stone-500 focus:border-[#f27d26]'
                : isTurquoise
                ? 'bg-sky-50/50 text-slate-800 border-sky-200 placeholder-slate-400 focus:border-sky-500'
                : 'bg-stone-50 text-stone-900 border-stone-200 placeholder-stone-400 focus:border-[#f27d26]'
            }`}
          />

          <button
            type="button"
            onClick={() => setShowAddNote(!showAddNote)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
              showAddNote || newNote.trim()
                ? isTurquoise
                  ? 'bg-sky-500/15 border-sky-300 text-sky-700'
                  : 'bg-[#f27d26]/15 border-[#f27d26]/40 text-[#f27d26]'
                : isDark
                ? 'bg-white/[0.03] border-white/10 text-stone-400 hover:text-stone-200'
                : isTurquoise
                ? 'bg-white border-sky-200 text-sky-800 hover:bg-sky-50'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{newNote.trim() ? 'یادداشت دارد' : 'افزودن یادداشت'}</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newTitle.trim()}
            className={`flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${
              isTurquoise
                ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
                : 'bg-[#f27d26] hover:bg-[#ff8a38] text-stone-950 shadow-[#f27d26]/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>ثبت</span>
          </motion.button>
        </div>

        {/* Expandable Note */}
        <AnimatePresence>
          {showAddNote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`overflow-hidden mt-2.5 pt-2.5 border-t ${
                isDark ? 'border-white/5' : isTurquoise ? 'border-sky-100' : 'border-stone-100'
              }`}
            >
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="توضیحات اختیاری، یادداشت کوتاه، لینک یا نظر شما..."
                rows={2}
                className={`w-full text-xs rounded-xl px-3.5 py-2 border outline-none resize-none transition ${
                  isDark
                    ? 'bg-black/30 text-stone-200 border-white/10 placeholder-stone-500 focus:border-[#f27d26]'
                    : isTurquoise
                    ? 'bg-sky-50/50 text-slate-800 border-sky-200 placeholder-slate-400 focus:border-sky-500'
                    : 'bg-stone-50 text-stone-900 border-stone-200 placeholder-stone-400 focus:border-[#f27d26]'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`جستجو در ${activeCategory}...`}
            className={`w-full text-xs rounded-xl pr-9 pl-3 py-2 border outline-none transition ${
              isDark
                ? 'bg-white/[0.03] text-stone-100 border-white/10 placeholder-stone-500 focus:border-[#f27d26]'
                : isTurquoise
                ? 'bg-white/90 text-slate-800 border-sky-200 placeholder-slate-400 focus:border-sky-500'
                : 'bg-white text-stone-900 border-stone-200 placeholder-stone-400 focus:border-[#f27d26]'
            }`}
          />
        </div>

        {/* Filter Buttons */}
        <div
          className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
            isDark
              ? 'bg-black/30 border-white/10'
              : isTurquoise
              ? 'bg-sky-50 border-sky-200'
              : 'bg-stone-100 border-stone-200'
          }`}
        >
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              statusFilter === 'all'
                ? isTurquoise
                  ? 'bg-sky-500 text-white font-bold'
                  : 'bg-[#f27d26] text-stone-950 font-bold'
                : isDark
                ? 'text-stone-400 hover:text-stone-200'
                : isTurquoise
                ? 'text-sky-800 hover:text-sky-950'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            همه ({toFa(categoryItems.length)})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              statusFilter === 'pending'
                ? isTurquoise
                  ? 'bg-sky-500 text-white font-bold'
                  : 'bg-[#f27d26] text-stone-950 font-bold'
                : isDark
                ? 'text-stone-400 hover:text-stone-200'
                : isTurquoise
                ? 'text-sky-800 hover:text-sky-950'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            در انتظار ({toFa(categoryItems.filter((i) => !i.done).length)})
          </button>
          <button
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              statusFilter === 'done'
                ? isTurquoise
                  ? 'bg-sky-500 text-white font-bold'
                  : 'bg-[#f27d26] text-stone-950 font-bold'
                : isDark
                ? 'text-stone-400 hover:text-stone-200'
                : isTurquoise
                ? 'text-sky-800 hover:text-sky-950'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            انجام‌شده ({toFa(categoryItems.filter((i) => i.done).length)})
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {displayedItems.length > 0 ? (
            displayedItems.map((item) => {
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 group ${
                    item.done
                      ? isDark
                        ? 'bg-white/[0.02] border-white/5 opacity-70'
                        : isTurquoise
                        ? 'bg-sky-50/40 border-sky-100 opacity-70'
                        : 'bg-stone-100/70 border-stone-200 opacity-70'
                      : isDark
                      ? 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10 hover:border-[#f27d26]/30'
                      : isTurquoise
                      ? 'bg-white/90 hover:bg-sky-50/70 border-sky-100 hover:border-sky-300 shadow-xs'
                      : 'bg-white hover:bg-orange-50/50 border-stone-200 hover:border-[#f27d26]/40 shadow-xs'
                  }`}
                >
                  {/* Checkbox & Title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => handleToggleItem(item.id)}
                      className={`mt-0.5 transition cursor-pointer shrink-0 ${
                        isTurquoise
                          ? 'text-slate-400 hover:text-sky-600'
                          : 'text-stone-400 hover:text-[#f27d26]'
                      }`}
                    >
                      {item.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm font-bold leading-snug break-words ${
                          item.done
                            ? 'line-through text-stone-500'
                            : isDark
                            ? 'text-stone-100'
                            : isTurquoise
                            ? 'text-slate-800'
                            : 'text-stone-900'
                        }`}
                      >
                        {item.title}
                      </h4>

                      {item.note && (
                        <p
                          className={`text-xs mt-1 leading-relaxed break-words ${
                            item.done
                              ? 'line-through text-stone-500/70'
                              : isDark
                              ? 'text-stone-400'
                              : isTurquoise
                              ? 'text-slate-600'
                              : 'text-stone-600'
                          }`}
                        >
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteItem(item.id)}
                      title="حذف از لیست"
                      className={`p-1.5 rounded-xl border transition cursor-pointer ${
                        isDark
                          ? 'border-transparent hover:border-rose-500/30 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10'
                          : 'border-transparent hover:border-rose-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`py-12 px-4 text-center rounded-2xl border border-dashed ${
                isDark
                  ? 'border-white/10 text-stone-500'
                  : isTurquoise
                  ? 'border-sky-200 text-slate-500'
                  : 'border-stone-200 text-stone-400'
              }`}
            >
              <Sparkles
                className={`w-8 h-8 mx-auto mb-2 ${
                  isTurquoise ? 'text-sky-500/40' : 'text-[#f27d26]/40'
                }`}
              />
              <p className="text-sm font-medium">
                {searchQuery
                  ? 'موردی مطابق با جستجوی شما پیدا نشد.'
                  : `هیچ موردی در لیست «${activeCategory}» وجود ندارد.`}
              </p>
              <p className="text-xs mt-1 text-stone-500">
                از کادر بالا برای ثبت کتاب، فیلم، سریال یا یادداشت جدید استفاده کنید.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
