import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Reusable Smart Back Button
 * - Uses browser history back (`navigate(-1)`) to preserve scroll position and filters
 * - Falls back to a default route if directly opened/refreshed without prior history
 */
export const BackButton = ({
  fallback = '/',
  title,
  className = "p-2.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer shadow-xs active:scale-95",
  iconClassName = "w-5 h-5",
  children,
  onClick,
}) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const handleBack = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }

    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  const defaultTitle = lang === 'bn' ? 'পিছনে যান' : 'Go back';

  return (
    <button
      type="button"
      onClick={handleBack}
      className={className}
      title={title || defaultTitle}
    >
      {children || <ArrowLeft className={iconClassName} />}
    </button>
  );
};

export default BackButton;

