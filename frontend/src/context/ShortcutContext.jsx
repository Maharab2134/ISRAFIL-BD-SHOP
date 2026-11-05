import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

const ShortcutContext = createContext(null);

export const DEFAULT_SHORTCUTS = [
  // Page Navigation Shortcuts
  {
    id: 'goto_pos',
    category: 'navigation',
    title_bn: 'পিওএস টার্মিনাল',
    title_en: 'POS Terminal',
    desc_bn: 'সরাসরি বিক্রয় ও ক্যাশিয়ার টার্মিনালে যান',
    desc_en: 'Go directly to POS Terminal & cashier desk',
    defaultKey: 'Alt+P',
    path: '/pos',
  },
  {
    id: 'goto_dashboard',
    category: 'navigation',
    title_bn: 'ড্যাশবোর্ড',
    title_en: 'Dashboard',
    desc_bn: 'ব্যবসায়িক রিপোর্ট ও সার্বিক পরিসংখ্যান দেখুন',
    desc_en: 'View business analytics and dashboard',
    defaultKey: 'Alt+D',
    path: '/dashboard',
  },
  {
    id: 'goto_products',
    category: 'navigation',
    title_bn: 'পণ্য তালিকা ও স্টক',
    title_en: 'Product Catalog & Stock',
    desc_bn: 'সকল পণ্য, মূল্য ও ইনভেন্টরি স্টক তালিকা',
    desc_en: 'Browse all products and inventory levels',
    defaultKey: 'Alt+I',
    path: '/products',
  },
  {
    id: 'goto_add_product',
    category: 'navigation',
    title_bn: 'নতুন পণ্য যোগ করুন',
    title_en: 'Add New Product',
    desc_bn: 'নতুন পণ্য, ক্রয়-বিক্রয় মূল্য ও ভ্যাট যুক্ত করুন',
    desc_en: 'Add new product with pricing and VAT',
    defaultKey: 'Alt+N',
    path: '/products/new',
  },
  {
    id: 'goto_sales',
    category: 'navigation',
    title_bn: 'বিক্রয় ও ইনভয়েস তালিকা',
    title_en: 'Sales & Invoices History',
    desc_bn: 'সকল বিক্রয় চালান ও ইনভয়েস ইতিহাস দেখুন',
    desc_en: 'View past sales orders and printed invoices',
    defaultKey: 'Alt+S',
    path: '/sales',
  },
  {
    id: 'goto_customers',
    category: 'navigation',
    title_bn: 'ক্রেতা ও লয়ালটি পয়েন্ট',
    title_en: 'Customers & Loyalty Points',
    desc_bn: 'গ্রাহকদের তালিকা ও পয়েন্ট হিসাব দেখুন',
    desc_en: 'Manage customer accounts & points',
    defaultKey: 'Alt+C',
    path: '/customers',
  },
  {
    id: 'goto_barcode',
    category: 'navigation',
    title_bn: 'বারকোড জেনারেটর',
    title_en: 'Barcode Generator',
    desc_bn: 'পণ্যের বারকোড তৈরি ও স্টিকার প্রিন্টিং',
    desc_en: 'Generate and print barcode label sheets',
    defaultKey: 'Alt+B',
    path: '/products/barcode-generator',
  },

  // POS In-Terminal Actions
  {
    id: 'pos_focus_barcode',
    category: 'pos',
    title_bn: 'বারকোড স্ক্যান বক্সে ফোকাস',
    title_en: 'Focus Barcode Scanner Box',
    desc_bn: 'পিওএস-এ স্ক্যানার ঘরে দ্রুত কার্সার নিয়ে যান',
    desc_en: 'Instantly jump cursor into POS barcode input',
    defaultKey: 'F2',
    eventName: 'pos:focus-barcode',
  },
  {
    id: 'pos_clear_cart',
    category: 'pos',
    title_bn: 'পিওএস কার্ট খালি করুন',
    title_en: 'Clear POS Shopping Cart',
    desc_bn: 'পিওএস টার্মিনালের বর্তমান শপিং কার্ট খালি করুন',
    desc_en: 'Reset all items in current POS cart',
    defaultKey: 'Alt+X',
    eventName: 'pos:clear-cart',
  },

  // General & Helper
  {
    id: 'open_shortcuts_page',
    category: 'general',
    title_bn: 'কীবোর্ড শর্টকাট পেজ',
    title_en: 'Keyboard Shortcuts Page',
    desc_bn: 'কীবোর্ড শর্টকাট তালিকা ও কাস্টমাইজেশন পেজে যান',
    desc_en: 'Open keyboard shortcuts and customization page',
    defaultKey: 'Alt+K',
    path: '/shortcuts',
  },
];

const STORAGE_KEY = 'israfil_custom_shortcuts_v1';

/**
 * Normalizes keyboard event into standardized string like "Alt+P", "Ctrl+Shift+F1", etc.
 */
export const getEventKeyCombo = (e) => {
  // Ignore bare modifier key presses
  if (['Alt', 'Control', 'Shift', 'Meta', 'AltGraph', 'CapsLock'].includes(e.key)) {
    return null;
  }

  const parts = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  if (e.metaKey) parts.push('Cmd');

  let key = e.key;
  if (key === ' ') {
    key = 'Space';
  } else if (/^[a-zA-Z]$/.test(key)) {
    key = key.toUpperCase();
  } else if (key.startsWith('Arrow')) {
    key = key.replace('Arrow', '');
  }

  parts.push(key);
  return parts.join('+');
};

export const ShortcutProvider = ({ children }) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { success, warning } = useToast();

  // Load custom shortcuts map from localStorage
  const [customMap, setCustomMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Recording state: id of shortcut currently awaiting user keypress
  const [recordingId, setRecordingId] = useState(null);

  // Active shortcuts combined with defaults and overrides
  const shortcuts = useMemo(() => {
    return DEFAULT_SHORTCUTS.map((item) => ({
      ...item,
      key: customMap[item.id] || item.defaultKey,
      isCustomized: Boolean(customMap[item.id] && customMap[item.id] !== item.defaultKey),
    }));
  }, [customMap]);

  // Update a single shortcut
  const updateShortcut = useCallback(
    (id, newKey) => {
      // Check if newKey is already used by another shortcut
      const existing = shortcuts.find(
        (s) => s.id !== id && s.key.toLowerCase() === newKey.toLowerCase()
      );

      setCustomMap((prev) => {
        const next = { ...prev, [id]: newKey };
        // If conflict exists, swap or clear
        if (existing) {
          delete next[existing.id];
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch { }
        return next;
      });

      setRecordingId(null);

      if (existing) {
        warning(
          lang === 'bn'
            ? `'${newKey}' ইতিমধ্যে '${existing.title_bn}' এর জন্য নির্ধারিত ছিল। এখন নতুন অ্যাকশনে সেট করা হয়েছে।`
            : `'${newKey}' was bound to '${existing.title_en}'. Overridden now.`
        );
      } else {
        success(
          lang === 'bn'
            ? `শর্টকাট সফলভাবে '${newKey}' এ পরিবর্তন করা হয়েছে!`
            : `Shortcut successfully updated to '${newKey}'!`
        );
      }
    },
    [shortcuts, lang, success, warning]
  );

  // Reset a specific shortcut to default
  const resetSingleShortcut = useCallback((id) => {
    setCustomMap((prev) => {
      const next = { ...prev };
      delete next[id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { }
      return next;
    });
  }, []);

  // Reset all shortcuts to default
  const resetAllShortcuts = useCallback(() => {
    setCustomMap({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { }
    success(
      lang === 'bn'
        ? 'সকল শর্টকাট ডিফল্ট সেটিংসে ফিরিয়ে নেওয়া হয়েছে।'
        : 'All keyboard shortcuts reset to factory defaults.'
    );
  }, [lang, success]);

  // Execute a shortcut action
  const executeShortcut = useCallback(
    (shortcut) => {
      if (shortcut.actionType === 'modal') {
        setIsModalOpen((prev) => !prev);
        return;
      }

      if (shortcut.path) {
        navigate(shortcut.path);
        return;
      }

      if (shortcut.eventName) {
        window.dispatchEvent(new CustomEvent(shortcut.eventName));
      }
    },
    [navigate]
  );

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If currently recording a new shortcut key chord:
      if (recordingId) {
        const combo = getEventKeyCombo(e);
        if (combo) {
          e.preventDefault();
          e.stopPropagation();
          if (combo === 'Escape') {
            setRecordingId(null);
            return;
          }
          updateShortcut(recordingId, combo);
        }
        return;
      }

      // If Escape key pressed and modal is open, close modal
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        return;
      }

      // Check if user is typing in form field
      const target = e.target;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      const combo = getEventKeyCombo(e);
      if (!combo) return;

      // Find matching shortcut
      const match = shortcuts.find(
        (s) => s.key.toLowerCase() === combo.toLowerCase()
      );

      if (!match) return;

      // If user is actively typing, only permit shortcut if it includes a modifier (Alt/Ctrl/Cmd) or is a Function key (F1-F12)
      const hasModifierOrFKey =
        e.altKey || e.ctrlKey || e.metaKey || /^F\d{1,2}$/i.test(combo);

      if (isTyping && !hasModifierOrFKey) {
        return;
      }

      // Prevent browser default behavior
      e.preventDefault();
      e.stopPropagation();

      executeShortcut(match);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recordingId, shortcuts, isModalOpen, updateShortcut, executeShortcut]);

  const value = {
    shortcuts,
    isModalOpen,
    setIsModalOpen,
    openShortcutsModal: () => setIsModalOpen(true),
    closeShortcutsModal: () => {
      setIsModalOpen(false);
      setRecordingId(null);
    },
    recordingId,
    setRecordingId,
    updateShortcut,
    resetSingleShortcut,
    resetAllShortcuts,
  };

  return <ShortcutContext.Provider value={value}>{children}</ShortcutContext.Provider>;
};

export const useShortcuts = () => {
  const context = useContext(ShortcutContext);
  if (!context) {
    throw new Error('useShortcuts must be used within a ShortcutProvider');
  }
  return context;
};

