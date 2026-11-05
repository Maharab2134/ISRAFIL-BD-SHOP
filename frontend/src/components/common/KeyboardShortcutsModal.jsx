import React from 'react';
import {
  Keyboard,
  X,
  RotateCcw,
  Check,
  Edit3,
  Sparkles,
  Command,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useShortcuts } from '../../context/ShortcutContext';
import { useLanguage } from '../../context/LanguageContext';

export const KeyboardShortcutsModal = () => {
  const {
    shortcuts,
    isModalOpen,
    closeShortcutsModal,
    recordingId,
    setRecordingId,
    resetSingleShortcut,
    resetAllShortcuts,
  } = useShortcuts();
  const { lang } = useLanguage();

  if (!isModalOpen) return null;

  // Split shortcut key string into individual key badges (e.g. "Alt+P" -> ["Alt", "P"])
  const renderKeyBadges = (keyString, isPulsing = false) => {
    if (isPulsing) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 text-xs font-bold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>{lang === 'bn' ? 'যেকোনো কী চাপুন...' : 'Press any key...'}</span>
        </span>
      );
    }

    const keys = keyString.split('+');
    return (
      <div className="flex items-center gap-1">
        {keys.map((k, idx) => (
          <React.Fragment key={idx}>
            <kbd className="min-w-[28px] h-7 px-2 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold shadow-2xs">
              {k}
            </kbd>
            {idx < keys.length - 1 && (
              <span className="text-[11px] font-bold text-slate-400">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const categories = [
    {
      id: 'navigation',
      title: lang === 'bn' ? 'পেজ নেভিগেশন (গুরুত্বপূর্ণ পেজসমূহ)' : 'Page Navigation (Important Pages)',
      items: shortcuts.filter((s) => s.category === 'navigation'),
    },
    {
      id: 'pos',
      title: lang === 'bn' ? 'পিওএস টার্মিনাল অ্যাকশন' : 'POS Terminal Quick Actions',
      items: shortcuts.filter((s) => s.category === 'pos'),
    },
    {
      id: 'general',
      title: lang === 'bn' ? 'সাধারণ ও শর্টকাট গাইড' : 'General & Shortcuts Guide',
      items: shortcuts.filter((s) => s.category === 'general'),
    },
  ];

  const hasAnyCustom = shortcuts.some((s) => s.isCustomized);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/80 shadow-xs">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'কীবোর্ড শর্টকাট ও কাস্টমাইজ' : 'Keyboard Shortcuts Manager'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {lang === 'bn' ? 'কাস্টমাইজেবল' : 'Customizable'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'দ্রুত কাজের জন্য শর্টকাট দেখুন বা "পরিবর্তন" বাটনে ক্লিক করে নিজের মতো কী সেট করুন।'
                  : 'View shortcuts or click "Rebind" to customize any key combination.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeShortcutsModal}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={lang === 'bn' ? 'বন্ধ করুন (Esc)' : 'Close (Esc)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Shortcut Groups */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {recordingId && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span>
                  {lang === 'bn'
                    ? 'আপনার পছন্দের কী বা কম্বিনেশন (যেমন: F1, Alt+1, Ctrl+M ইত্যাদি) চাপুন...'
                    : 'Press your desired key combination (e.g. F1, Alt+1, Ctrl+M)...'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRecordingId(null)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          )}

          {categories.map((cat) => (
            <div key={cat.id} className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                {cat.title}
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/40 dark:bg-slate-900/30">
                {cat.items.map((item) => {
                  const isRecordingThis = recordingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 sm:px-4 flex items-center justify-between gap-3 transition ${
                        isRecordingThis
                          ? 'bg-amber-500/10 dark:bg-amber-500/15'
                          : 'hover:bg-white dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Left: Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {lang === 'bn' ? item.title_bn : item.title_en}
                          </span>
                          {item.isCustomized && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase tracking-wider">
                              {lang === 'bn' ? 'কাস্টম' : 'Custom'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {lang === 'bn' ? item.desc_bn : item.desc_en}
                        </p>
                      </div>

                      {/* Right: Key Badge + Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {renderKeyBadges(item.key, isRecordingThis)}

                        {isRecordingThis ? (
                          <button
                            type="button"
                            onClick={() => setRecordingId(null)}
                            className="px-2.5 py-1 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition cursor-pointer"
                          >
                            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setRecordingId(item.id)}
                              className="px-2.5 py-1 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              title={lang === 'bn' ? 'শর্টকাট পরিবর্তন করুন' : 'Rebind this shortcut'}
                            >
                              <Edit3 className="w-3 h-3" />
                              <span className="hidden sm:inline">
                                {lang === 'bn' ? 'পরিবর্তন' : 'Rebind'}
                              </span>
                            </button>

                            {item.isCustomized && (
                              <button
                                type="button"
                                onClick={() => resetSingleShortcut(item.id)}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title={lang === 'bn' ? 'ডিফল্ট কী-তে ফেরত যান' : 'Reset to default'}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              {lang === 'bn'
                ? 'টিপস: যেকোনো সময় কীবোর্ডে Alt + K চাপলে এই শর্টকাট উইন্ডোটি খুলবে।'
                : 'Tip: Press Alt + K anytime anywhere to toggle this shortcuts window.'}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {hasAnyCustom && (
              <button
                type="button"
                onClick={resetAllShortcuts}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সব ডিফল্ট করুন' : 'Reset All to Defaults'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeShortcutsModal}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-xs shadow-xs cursor-pointer"
            >
              {lang === 'bn' ? 'সম্পন্ন (Done)' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

