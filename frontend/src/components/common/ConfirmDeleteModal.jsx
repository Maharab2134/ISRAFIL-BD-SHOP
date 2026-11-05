import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  count = 1,
  loading = false,
  dangerText,
}) => {
  const { lang } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const isBulk = count > 1;

  const defaultTitle = isBulk
    ? (lang === 'bn' ? `নির্বাচিত ${count}টি আইটেম মুছে ফেলুন` : `Delete ${count} Selected Items`)
    : (lang === 'bn' ? 'মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Deletion');

  const defaultMessage = isBulk
    ? (lang === 'bn'
        ? `আপনি কি নিশ্চিতভাবে নির্বাচিত মোট ${count}টি আইটেম একসাথে মুছে ফেলতে চান?`
        : `Are you sure you want to delete these ${count} selected items?`)
    : itemName
    ? (lang === 'bn'
        ? `আপনি কি নিশ্চিতভাবে "${itemName}" মুছে ফেলতে চান?`
        : `Are you sure you want to delete "${itemName}"?`)
    : (lang === 'bn'
        ? 'আপনি কি নিশ্চিতভাবে এই আইটেমটি মুছে ফেলতে চান?'
        : 'Are you sure you want to delete this item?');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
              {isBulk ? <AlertTriangle className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {title || defaultTitle}
              </h3>
              {isBulk && (
                <span className="inline-block mt-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  {lang === 'bn' ? `${count}টি আইটেম নির্বাচিত` : `${count} items selected`}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message || defaultMessage}
          </p>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
            <span className="font-semibold">⚠️ {lang === 'bn' ? 'সতর্কতা:' : 'Warning:'}</span>{' '}
            {dangerText ||
              (lang === 'bn'
                ? 'মুছে ফেলা হলে এই তথ্যটি সিস্টেম থেকে স্থায়ীভাবে অপসারিত হবে।'
                : 'This action cannot be easily undone.')}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            {lang === 'bn' ? 'বাতিল করুন' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition flex items-center gap-2 shadow-md shadow-red-600/25 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{lang === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...'}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

