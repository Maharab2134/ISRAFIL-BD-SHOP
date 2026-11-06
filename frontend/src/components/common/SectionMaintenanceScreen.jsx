import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hammer, Wrench, ArrowLeft, Home, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const SectionMaintenanceScreen = ({ module }) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const sectionName = lang === 'bn' ? (module?.name_bn || module?.name || 'এই সেকশন') : (module?.name || 'This section');
  const customMessage = lang === 'bn' 
    ? (module?.message_bn || module?.message || 'এই সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।')
    : (module?.message || 'This section will be back soon for maintenance.');

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />

        {/* Floating Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Maintenance Icon */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/60 dark:to-orange-950/40 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-center mb-6 shadow-inner">
          <Wrench className="w-12 h-12 text-amber-600 dark:text-amber-400 animate-bounce duration-1000" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md">
            <Hammer className="w-4 h-4" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-4 shadow-2xs">
          <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>{lang === 'bn' ? 'উন্নয়ন ও রক্ষণাবেক্ষণ চলছে' : 'Under Development & Maintenance'}</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          {lang === 'bn' ? `${sectionName} সাময়িক স্থগিত` : `${sectionName} is Temporarily Paused`}
        </h2>

        {/* Message */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
          {customMessage}
        </p>

        {/* Notice Info Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 mb-8 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {lang === 'bn'
              ? 'আরও উন্নত ফিচার ও কার্যক্ষমতা নিশ্চিত করার জন্য কাজ চলছে।'
              : 'Our developers are actively upgrading this module for optimal performance.'}
          </span>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'bn' ? 'পূর্বের পেজে যান' : 'Go Back'}</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionMaintenanceScreen;

