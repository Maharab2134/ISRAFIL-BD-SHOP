import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Globe,
  User,
  LogOut,
  Calendar,
  Clock,
  X,
  Volume2,
  VolumeX,
  Keyboard,
} from 'lucide-react';
import api from '../../services/api';
import { playNotificationChime } from '../../utils/sound';
import { useShortcuts } from '../../context/ShortcutContext';

export const TopNavbar = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { openShortcutsModal } = useShortcuts();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'notifications' | 'user' | null
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refs for outside-click detection
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);
  const prevCountRef = useRef(null);

  // Sound preference state (persists in localStorage)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('israfil_sound_enabled') !== 'false';
  });

  const toggleSound = (e) => {
    e?.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('israfil_sound_enabled', String(next));
    if (next) {
      playNotificationChime(0.35);
    }
  };

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Outside click listener without any overlay backdrop div
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideNotifications =
        !notificationsRef.current || !notificationsRef.current.contains(event.target);
      const isOutsideUserMenu =
        !userMenuRef.current || !userMenuRef.current.contains(event.target);

      if (isOutsideNotifications && isOutsideUserMenu) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeDropdown]);

  // Live Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch low stock alerts & trigger notification sound
  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      try {
        const res = await api.get('/dashboard');
        if (!isMounted) return;

        if (res.data?.low_stock_alerts) {
          const alerts = res.data.low_stock_alerts;
          setNotifications(alerts);

          // Trigger audible notification chime when alerts exist or increase
          if (alerts.length > 0) {
            if (prevCountRef.current === null) {
              prevCountRef.current = alerts.length;
              if (soundEnabled) {
                // Play notification chime on initial load if alerts present
                setTimeout(() => playNotificationChime(0.3), 800);
              }
            } else if (alerts.length > prevCountRef.current) {
              prevCountRef.current = alerts.length;
              if (soundEnabled) {
                playNotificationChime(0.35);
              }
            }
          } else {
            prevCountRef.current = 0;
          }
        }
      } catch (e) {
        // quiet error
      }
    };

    fetchAlerts();

    // Check every 30 seconds for new alerts/stock changes
    const interval = setInterval(fetchAlerts, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [soundEnabled]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // User display name & initial based on language
  const rawName = user?.name || '';
  const englishParenMatch = rawName.match(/\((.*?)\)/);
  const englishName = englishParenMatch ? englishParenMatch[1].trim() : rawName;
  const banglaName = rawName.replace(/\(.*?\)/, '').trim() || rawName;

  const displayName = lang === 'en' ? englishName : banglaName;
  const initialLetter = (displayName || 'U')[0].toUpperCase();

  const roleName =
    lang === 'bn'
      ? user?.role?.name_bn || user?.role?.name || 'স্টাফ'
      : user?.role?.name || user?.role?.name_bn || 'Staff';

  // Generate dynamic breadcrumbs with concise labels to prevent wrapping
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbLabel = (segment) => {
    const key = segment.toLowerCase();
    const shortMap = {
      units: lang === 'bn' ? 'একক (M.U)' : 'M.U',
      products: lang === 'bn' ? 'পণ্য' : 'Products',
      categories: lang === 'bn' ? 'ক্যাটাগরি' : 'Categories',
      brands: lang === 'bn' ? 'ব্র্যান্ড' : 'Brands',
      'barcode-generator': lang === 'bn' ? 'বারকোড' : 'Barcode',
      inventory: lang === 'bn' ? 'ইনভেন্টরি' : 'Inventory',
      adjustment: lang === 'bn' ? 'স্টক সমন্বয়' : 'Stock Adjust',
      history: lang === 'bn' ? 'ইতিহাস' : 'History',
      sales: lang === 'bn' ? 'বিক্রয়' : 'Sales',
      returns: lang === 'bn' ? 'ফেরত' : 'Returns',
      purchases: lang === 'bn' ? 'ক্রয়' : 'Purchases',
      customers: lang === 'bn' ? 'ক্রেতা' : 'Customers',
      suppliers: lang === 'bn' ? 'সাপ্লায়ার' : 'Suppliers',
      expenses: lang === 'bn' ? 'খরচ' : 'Expenses',
      'expense-categories': lang === 'bn' ? 'খরচ খাত' : 'Expense Cats',
      accounting: lang === 'bn' ? 'হিসাব' : 'Accounting',
      'cash-flow': lang === 'bn' ? 'নগদ প্রবাহ' : 'Cash Flow',
      reports: lang === 'bn' ? 'রিপোর্ট' : 'Reports',
      employees: lang === 'bn' ? 'কর্মী' : 'Employees',
      'activity-logs': lang === 'bn' ? 'অডিট লগ' : 'Logs',
      settings: lang === 'bn' ? 'সেটিংস' : 'Settings',
      shortcuts: lang === 'bn' ? 'কীবোর্ড শর্টকাট' : 'Shortcuts',
      pos: lang === 'bn' ? 'পিওএস' : 'POS',
      new: lang === 'bn' ? 'নতুন' : 'New',
      edit: lang === 'bn' ? 'সম্পাদনা' : 'Edit',
      profile: lang === 'bn' ? 'প্রোফাইল' : 'Profile',
      dashboard: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
    };

    if (shortMap[key]) return shortMap[key];
    const trans = t(key);
    if (trans && trans !== key) return trans;
    return segment.replace(/-/g, ' ');
  };

  return (
    <header
      className={`fixed top-0 right-0 z-40 h-16 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-6 ${
        isCollapsed ? 'left-20' : 'left-72'
      }`}
    >
      {/* Left: Breadcrumbs & Global Search */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <nav className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap overflow-hidden">
          <Link
            to="/dashboard"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium shrink-0"
          >
            {lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </Link>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const label = getBreadcrumbLabel(name);
            return (
              <span key={name} className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <span className="text-slate-300 dark:text-slate-600">/</span>
                {isLast ? (
                  <span className="font-semibold text-slate-900 dark:text-white capitalize whitespace-nowrap">
                    {label}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 capitalize transition whitespace-nowrap"
                  >
                    {label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
          />
        </form>
      </div>

      {/* Right: Date, Language, Theme, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Live Date / Time */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {currentTime.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {currentTime.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="Switch Language (বাংলা / English)"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title={theme === 'dark' ? t('lightMode') : t('darkMode')}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Keyboard Shortcuts Page Button */}
        <button
          onClick={() => navigate('/shortcuts')}
          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer flex items-center gap-1.5"
          title={lang === 'bn' ? 'কীবোর্ড শর্টকাট পেজ (Alt + K)' : 'Keyboard Shortcuts Page (Alt + K)'}
        >
          <Keyboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden xl:inline text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            Alt+K
          </span>
        </button>

        {/* Notification Center */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() =>
              setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')
            }
            className={`p-2 rounded-xl transition relative ${
              activeDropdown === 'notifications'
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 ring-2 ring-indigo-500/30'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={t('notifications')}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {activeDropdown === 'notifications' && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {t('notifications')}
                  </span>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded-full">
                    {notifications.length} {t('lowStock')}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Sound Toggle / Test Ring Button */}
                  <button
                    type="button"
                    onClick={toggleSound}
                    className={`p-1 rounded-lg transition ${
                      soundEnabled
                        ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title={
                      soundEnabled
                        ? lang === 'bn'
                          ? 'নোটিফিকেশন শব্দ চালু (বাজিয়ে টেস্ট করুন / মিউট করতে ক্লিক করুন)'
                          : 'Notification sound ON (Click to test / mute)'
                        : lang === 'bn'
                        ? 'নোটিফিকেশন শব্দ বন্ধ (চালু করতে ক্লিক করুন)'
                        : 'Notification sound muted (Click to enable)'
                    }
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-3.5 h-3.5" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-xs text-center text-slate-400">
                    {lang === 'bn' ? 'কোনো নতুন নোটিফিকেশন নেই' : 'No new notifications'}
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      to={`/products/${item.id}`}
                      onClick={() => setActiveDropdown(null)}
                      className="p-3 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition text-xs block group"
                    >
                      <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {lang === 'bn' ? item.name_bn || item.name : item.name}
                        </div>
                        <div className="text-[11px] text-rose-500 font-medium">
                          {lang === 'bn'
                            ? `বর্তমান স্টক: ${item.current_stock} (সতর্কতা: ${item.alert_stock})`
                            : `Current Stock: ${item.current_stock} (Alert: ${item.alert_stock})`}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
            className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl transition ${
              activeDropdown === 'user'
                ? 'bg-indigo-50 dark:bg-slate-800 ring-2 ring-indigo-500/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {initialLetter}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block leading-tight">
                {displayName.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">{roleName}</span>
            </div>
          </button>

          {activeDropdown === 'user' && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="truncate pr-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    {roleName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition shrink-0"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <Link
                to="/profile"
                onClick={() => setActiveDropdown(null)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('profile')}</span>
              </Link>
              <button
                onClick={() => {
                  setActiveDropdown(null);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
