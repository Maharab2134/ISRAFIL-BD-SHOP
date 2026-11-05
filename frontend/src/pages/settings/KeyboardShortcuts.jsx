import React, { useState } from 'react';
import {
  Keyboard,
  RotateCcw,
  Edit3,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Zap,
  HelpCircle,
  Laptop,
} from 'lucide-react';
import { useShortcuts } from '../../context/ShortcutContext';
import { useLanguage } from '../../context/LanguageContext';

export const KeyboardShortcuts = () => {
  const {
    shortcuts,
    recordingId,
    setRecordingId,
    resetSingleShortcut,
    resetAllShortcuts,
  } = useShortcuts();
  const { lang, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', title: lang === 'bn' ? 'সকল শর্টকাট' : 'All Shortcuts' },
    { id: 'navigation', title: lang === 'bn' ? 'পেজ নেভিগেশন' : 'Page Navigation' },
    { id: 'pos', title: lang === 'bn' ? 'পিওএস অ্যাকশন' : 'POS Actions' },
    { id: 'general', title: lang === 'bn' ? 'সাধারণ' : 'General' },
  ];

  // Filter shortcuts
  const filteredShortcuts = shortcuts.filter((s) => {
    const matchesCat = activeCategory === 'all' || s.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCat;

    const matchesSearch =
      s.title_bn.toLowerCase().includes(query) ||
      s.title_en.toLowerCase().includes(query) ||
      s.desc_bn.toLowerCase().includes(query) ||
      s.desc_en.toLowerCase().includes(query) ||
      s.key.toLowerCase().includes(query);

    return matchesCat && matchesSearch;
  });

  const hasAnyCustom = shortcuts.some((s) => s.isCustomized);

  // Render individual key badges
  const renderKeyBadges = (keyString, isPulsing = false) => {
    if (isPulsing) {
      return (
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 text-xs font-bold animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>{lang === 'bn' ? 'কীবোর্ডে যেকোনো কী চাপুন...' : 'Press any key on keyboard...'}</span>
        </span>
      );
    }

    const keys = keyString.split('+');
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {keys.map((k, idx) => (
          <React.Fragment key={idx}>
            <kbd className="min-w-[32px] h-8 px-2.5 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-xs font-black shadow-xs tracking-wide">
              {k}
            </kbd>
            {idx < keys.length - 1 && (
              <span className="text-xs font-black text-slate-400 dark:text-slate-500">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <Keyboard className="w-7 h-7 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {lang === 'bn' ? 'কীবোর্ড শর্টকাট ও কাস্টমাইজার' : 'Keyboard Shortcuts Manager'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                {lang === 'bn' ? '১০০% কাস্টমাইজেবল' : 'Fully Customizable'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-200/90 mt-1 max-w-xl">
              {lang === 'bn'
                ? 'মাউস ছাড়া দ্রুত কাজের জন্য গুরুত্বপূর্ণ পেজগুলোর শর্টকাট দেখুন অথবা যেকোনো শর্টকাট নিজের ইচ্ছামতো পরিবর্তন করুন।'
                : 'Browse keyboard shortcuts for instant navigation and customize any key combo to fit your personal workflow.'}
            </p>
          </div>
        </div>

        {hasAnyCustom && (
          <button
            type="button"
            onClick={resetAllShortcuts}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition flex items-center gap-2 self-start md:self-auto shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সকল শর্টকাট ডিফল্ট করুন' : 'Reset All to Defaults'}</span>
          </button>
        )}
      </div>

      {/* Recording Alert Banner */}
      {recordingId && (
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border-2 border-amber-400 dark:border-amber-500/60 shadow-md flex items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 animate-bounce">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-amber-900 dark:text-amber-200">
                {lang === 'bn' ? 'কীবোর্ড ইনপুট শুনছি...' : 'Listening for keyboard input...'}
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                {lang === 'bn'
                  ? 'আপনার পছন্দের যেকোনো কী চাপুন (যেমন: F1, F3, Alt+1, Ctrl+M)। বাতিল করতে Esc চাপুন।'
                  : 'Press any key combination (e.g. F1, F3, Alt+1, Ctrl+M). Press Esc to cancel.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRecordingId(null)}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-bold hover:bg-amber-100 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
          >
            {lang === 'bn' ? 'বাতিল করুন (Esc)' : 'Cancel (Esc)'}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-full sm:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'শর্টকাট বা পেজ খুঁজুন...' : 'Search shortcut or page...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Shortcuts List Table / Card Grid */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'শর্টকাট তালিকা' : 'Active Shortcut Keys'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn'
                ? 'ডানপাশের "পরিবর্তন" বাটনে ক্লিক করে নতুন কী নির্ধারণ করতে পারবেন।'
                : 'Click "Rebind" to change the shortcut key combination to whatever you prefer.'}
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-xl">
            {filteredShortcuts.length} {lang === 'bn' ? 'টি শর্টকাট' : 'shortcuts'}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredShortcuts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              {lang === 'bn' ? 'কোনো শর্টকাট খুঁজে পাওয়া যায়নি।' : 'No shortcuts found matching search.'}
            </div>
          ) : (
            filteredShortcuts.map((item) => {
              const isRecordingThis = recordingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                    isRecordingThis
                      ? 'bg-amber-50/70 dark:bg-amber-500/10'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {lang === 'bn' ? item.title_bn : item.title_en}
                      </span>
                      {item.isCustomized ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                          {lang === 'bn' ? 'কাস্টম' : 'Custom'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
                          {lang === 'bn' ? 'ডিফল্ট' : 'Default'}
                        </span>
                      )}
                      {item.path && (
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          ({item.path})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {lang === 'bn' ? item.desc_bn : item.desc_en}
                    </p>
                  </div>

                  {/* Right: Key Badge + Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                    {renderKeyBadges(item.key, isRecordingThis)}

                    {isRecordingThis ? (
                      <button
                        type="button"
                        onClick={() => setRecordingId(null)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition cursor-pointer"
                      >
                        {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRecordingId(item.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                          title={lang === 'bn' ? 'শর্টকাট পরিবর্তন করুন' : 'Rebind shortcut'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'পরিবর্তন' : 'Rebind'}</span>
                        </button>

                        {item.isCustomized && (
                          <button
                            type="button"
                            onClick={() => resetSingleShortcut(item.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            title={lang === 'bn' ? 'ডিফল্ট কী-তে ফেরত যান' : 'Reset to default'}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pro Tips Section */}
      <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>{lang === 'bn' ? 'ক্যাশিয়ার ও সুপারশপ প্র্যাকটিস টিপস' : 'Cashier Pro Tips'}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              {lang === 'bn' ? '১. পিওএস-এ দ্রুত বারকোড স্ক্যান' : '1. Fast Barcode Scanning'}
            </span>
            <span>
              {lang === 'bn'
                ? 'পিওএস-এ কাজ করার সময় F2 চাপলেই সরাসরি বারকোড স্ক্যান ঘরে ফোকাস চলে যাবে।'
                : 'Pressing F2 in POS directly focuses the barcode input without using mouse.'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              {lang === 'bn' ? '২. টাইপিং ফ্রেন্ডলি শর্টকাট' : '2. Form Input Protection'}
            </span>
            <span>
              {lang === 'bn'
                ? 'পণ্য বা ক্রেতার নাম টাইপ করার সময় কোনো শর্টকাট সমস্যা করবে না। Alt বা F-কি কাজ করবে নির্বিঘ্নে।'
                : 'Typing normal text inside inputs won\'t trigger shortcuts accidentally.'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              {lang === 'bn' ? '৩. স্থায়ী ব্রাউজার মেমোরি' : '3. Permanent Storage'}
            </span>
            <span>
              {lang === 'bn'
                ? 'আপনার কাস্টমাইজ করা শর্টকাটগুলো ব্রাউজারে স্থায়ীভাবে সেভ থাকবে, পেজ রিলোড করলেও পরিবর্তন হবে না।'
                : 'All custom keybindings persist in local storage across browser reloads.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;

