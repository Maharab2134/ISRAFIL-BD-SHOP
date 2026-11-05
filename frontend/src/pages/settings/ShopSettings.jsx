import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { BarcodeSvg } from '../../components/common/BarcodeSvg';
import { normalizeImageUrl } from '../../utils/imageHelper';
import {
  Settings,
  Store,
  Printer,
  DollarSign,
  Database,
  Save,
  Download,
  Upload,
  CheckCircle2,
  FileCode,
  ShieldAlert,
  Percent,
  Receipt,
  FileText,
  Sliders,
  Phone,
  Mail,
  MapPin,
  User,
  Barcode,
  Tag,
  Sparkles,
  Eye,
  Check,
  Globe,
  Link2,
  X,
  Trash2,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  Lock,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';

export default function ShopSettings() {
  const { t, lang, formatCurrency } = useLanguage();
  const { success, error, info } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Database Management State
  const [dbStats, setDbStats] = useState(null);
  const [loadingDbStats, setLoadingDbStats] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearMode, setClearMode] = useState('clear_transactions'); // 'clear_transactions' or 'full_reset'
  const [clearPassword, setClearPassword] = useState('');
  const [clearConfirmation, setClearConfirmation] = useState('');
  const [resetStock, setResetStock] = useState(true);
  const [seedDemo, setSeedDemo] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [settings, setSettings] = useState({
    shop_name: 'ISRAFIL BD SHOP',
    shop_tagline: 'প্রিমিয়াম রিটেইল ও পিওএস আউটলেট',
    shop_phone: '+880 1700-000000',
    shop_email: 'info@israfilbd.com',
    shop_address: 'ঢাকা, বাংলাদেশ',
    vat_bin_number: 'BIN-123456789-001',
    default_printer_type: '80mm',
    invoice_prefix: 'INV-',
    receipt_header_title: 'CASH RECEIPT / ক্যাশ মেমো',
    receipt_footer: 'আমাদের সাথে কেনাকাটার জন্য আন্তরিক ধন্যবাদ!',
    receipt_terms: 'পণ্য পরিবর্তনের জন্য ৭ দিনের মধ্যে ক্যাশ মেমোসহ যোগাযোগ করুন। খোলা বা ব্যবহৃত পণ্য ফেরতযোগ্য নহে।',
    auto_print: '1',
    default_tax_rate: '0',
    currency_symbol: '৳',
    currency_code: 'BDT',
    // Invoice A to Z Toggles (1 = Yes, 0 = No)
    show_shop_logo: '1',
    show_shop_tagline: '1',
    show_shop_phone: '1',
    show_shop_email: '1',
    show_shop_address: '1',
    show_vat_bin: '1',
    show_customer_info: '1',
    show_cashier_name: '1',
    show_invoice_date_time: '1',
    show_item_code: '1',
    show_item_discount: '1',
    show_total_discount: '1',
    show_loyalty_points: '1',
    show_due_change: '1',
    show_terms_conditions: '1',
    show_receipt_barcode: '1',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoTab, setLogoTab] = useState('upload'); // 'upload' | 'url'
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...res.data.settings,
          }));
          if (res.data.settings.shop_logo) {
            const rawLogo = res.data.settings.shop_logo;
            const normalized = normalizeImageUrl(rawLogo);
            setLogoPreview(normalized);
            setLogoUrlInput(rawLogo);
            if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://')) {
              setLogoTab('url');
            }
          }
        }
      } catch (err) {
        error(lang === 'bn' ? 'সেটিংস লোড করতে সমস্যা হয়েছে।' : 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUrlChange = (url) => {
    setLogoUrlInput(url);
    setLogoError(false);
    const normalized = normalizeImageUrl(url);
    if (normalized) {
      setLogoPreview(normalized);
      setSettings((prev) => ({ ...prev, shop_logo: normalized }));
    } else {
      setLogoPreview(null);
      setSettings((prev) => ({ ...prev, shop_logo: '' }));
    }
  };

  const handleClearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrlInput('');
    setLogoError(false);
    setSettings((prev) => ({ ...prev, shop_logo: '' }));
  };

  const toggleSwitch = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === '1' ? '0' : '1',
    }));
  };

  const toggleItems = [
    { key: 'show_shop_logo', title: lang === 'bn' ? 'দোকানের লোগো' : 'Shop Logo', desc: lang === 'bn' ? 'রসিদের শীর্ষে লোগো প্রদর্শন' : 'Print logo at receipt header', icon: Store },
    { key: 'show_shop_tagline', title: lang === 'bn' ? 'ট্যাগলাইন / স্লোগান' : 'Tagline / Slogan', desc: lang === 'bn' ? 'দোকানের নামের নিচে স্লোগান' : 'Display tagline under shop name', icon: FileText },
    { key: 'show_shop_phone', title: lang === 'bn' ? 'ফোন / হটলাইন নম্বর' : 'Phone / Hotline', desc: lang === 'bn' ? 'দোকানের মোবাইল নম্বর' : 'Display shop phone number', icon: Phone },
    { key: 'show_shop_email', title: lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address', desc: lang === 'bn' ? 'দোকানের ইমেইল ঠিকানা' : 'Display shop email address', icon: Mail },
    { key: 'show_shop_address', title: lang === 'bn' ? 'দোকানের পূর্ণ ঠিকানা' : 'Shop Address', desc: lang === 'bn' ? 'দোকানের সম্পূর্ণ ঠিকানা' : 'Display full shop address', icon: MapPin },
    { key: 'show_vat_bin', title: lang === 'bn' ? 'ভ্যাট / বিআইএন নম্বর' : 'VAT / BIN Number', desc: lang === 'bn' ? 'সরকারি ভ্যাট রেজিস্ট্রেশন নম্বর' : 'Display tax registration number', icon: Percent },
    { key: 'show_customer_info', title: lang === 'bn' ? 'ক্রেতার নাম ও মোবাইল' : 'Customer Info', desc: lang === 'bn' ? 'ক্রেতার তথ্য প্রদর্শন' : 'Show customer name and phone', icon: User },
    { key: 'show_cashier_name', title: lang === 'bn' ? 'ক্যাশিয়ার / অপারেটর নাম' : 'Cashier Name', desc: lang === 'bn' ? 'যে ইউজার বিক্রয় করেছেন' : 'Show cashier/operator name', icon: User },
    { key: 'show_invoice_date_time', title: lang === 'bn' ? 'তারিখ ও সময়' : 'Date & Time', desc: lang === 'bn' ? 'বিক্রয়ের সময় ও তারিখ' : 'Show exact date and time', icon: CheckCircle2 },
    { key: 'show_item_code', title: lang === 'bn' ? 'পণ্য কোড / বারকোড' : 'Item Code / Barcode', desc: lang === 'bn' ? 'পণ্যের নিচে বারকোড নম্বর' : 'Show item barcode under name', icon: Barcode },
    { key: 'show_item_discount', title: lang === 'bn' ? 'পণ্যভিত্তিক বিশেষ ছাড়' : 'Item-wise Discount', desc: lang === 'bn' ? 'আইটেমের আলাদা ছাড় লাইন' : 'Show item discount line', icon: Tag },
    { key: 'show_total_discount', title: lang === 'bn' ? 'মোট ছাড় ও সাশ্রয় বার্তা' : 'Total Discount & Savings', desc: lang === 'bn' ? 'সর্বমোট কত টাকা ছাড় পেয়েছেন' : 'Show total discount & savings banner', icon: Sparkles },
    { key: 'show_loyalty_points', title: lang === 'bn' ? 'লয়ালটি পয়েন্ট তথ্য' : 'Loyalty Points Info', desc: lang === 'bn' ? 'অর্জিত, ব্যবহৃত ও ব্যালেন্স পয়েন্ট' : 'Show earned, redeemed & balance pts', icon: Sparkles },
    { key: 'show_due_change', title: lang === 'bn' ? 'পরিশোধিত, ফেরত ও বকেয়া' : 'Paid, Due & Change', desc: lang === 'bn' ? 'পেমেন্ট ও বকেয়া হিসাব' : 'Show paid, change return and due', icon: DollarSign },
    { key: 'show_terms_conditions', title: lang === 'bn' ? 'ফেরত সংক্রান্ত শর্তাবলী' : 'Terms & Conditions', desc: lang === 'bn' ? 'রসিদের নিচে ফেরত নিয়ম' : 'Show return and exchange terms', icon: ShieldAlert },
    { key: 'show_receipt_barcode', title: lang === 'bn' ? 'চালান বারকোড' : 'Invoice Barcode', desc: lang === 'bn' ? 'স্ক্যান করার সুবিধার্থে বারকোড' : 'Vector barcode of invoice number', icon: Barcode },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payloadSettings = { ...settings };
      if (logoTab === 'url' && logoUrlInput.trim()) {
        payloadSettings.shop_logo = normalizeImageUrl(logoUrlInput.trim());
      }
      const res = await api.post('/settings', { settings: payloadSettings });
      setSettings(payloadSettings);
      success(res.data.message || (lang === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings saved successfully!'));
    } catch (err) {
      error(lang === 'bn' ? 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('logo', file);

    setLogoUploading(true);
    try {
      const res = await api.post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.url) {
        setSettings((prev) => ({ ...prev, shop_logo: res.data.url }));
        setLogoPreview(res.data.url);
      }
      success(res.data.message || (lang === 'bn' ? 'লোগো সফলভাবে আপলোড হয়েছে!' : 'Logo uploaded!'));
    } catch (err) {
      error(lang === 'bn' ? 'লোগো আপলোড ব্যর্থ হয়েছে।' : 'Failed to upload logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    info(lang === 'bn' ? 'ডাটাবেজ ব্যাকআপ তৈরি হচ্ছে...' : 'Generating SQL dump backup...');
    try {
      const res = await api.get('/settings/backup/download', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `israfil_shop_backup_${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      success(lang === 'bn' ? 'ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!' : 'Database SQL backup downloaded!');
    } catch (err) {
      error(lang === 'bn' ? 'ব্যাকআপ তৈরিতে সমস্যা হয়েছে।' : 'Failed to create backup.');
    } finally {
      setBackupLoading(false);
    }
  };

  const fetchDbStats = async () => {
    setLoadingDbStats(true);
    try {
      const res = await api.get('/settings/database/stats');
      setDbStats(res.data.stats);
    } catch (e) {
      console.error('Failed to load db stats', e);
    } finally {
      setLoadingDbStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'backup') {
      fetchDbStats();
    }
  }, [activeTab]);

  const handleOpenClearModal = (mode) => {
    setClearMode(mode);
    setClearPassword('');
    setClearConfirmation('');
    setShowPassword(false);
    setShowClearModal(true);
  };

  const handleExecuteClearDatabase = async (e) => {
    e.preventDefault();
    if (clearConfirmation.trim().toUpperCase() !== 'CLEAR') {
      error(lang === 'bn' ? 'নিশ্চিত করতে "CLEAR" শব্দটি ইংরেজিতে টাইপ করুন!' : 'Please type "CLEAR" to confirm!');
      return;
    }
    if (!clearPassword) {
      error(lang === 'bn' ? 'সুপার অ্যাডমিন পাসওয়ার্ড প্রদান করুন!' : 'Please enter super admin password!');
      return;
    }

    setClearing(true);
    try {
      const res = await api.post('/settings/database/clear', {
        mode: clearMode,
        password: clearPassword,
        confirmation: clearConfirmation,
        reset_stock: resetStock,
        seed_demo: seedDemo,
      });

      success(res.data.message || (lang === 'bn' ? 'ডাটাবেজ সফলভাবে সম্পন্ন হয়েছে!' : 'Database action completed!'));
      setShowClearModal(false);
      fetchDbStats();
      if (clearMode === 'full_reset') {
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'ডাটাবেজ ক্লিয়ার করতে ব্যর্থ হয়েছে!' : 'Failed to clear database!');
      error(msg);
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-600" />
          {t('settings')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'bn'
            ? 'দোকানের সাধারণ তথ্য, পিওএস রসিদ প্রিন্টার কনফিগারেশন এবং ডাটাবেজ ব্যাকআপ'
            : 'Configure shop profile, POS receipts, tax rules, and emergency database recovery'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Store className="w-4 h-4" />
          {lang === 'bn' ? 'সাধারণ দোকান তথ্য' : 'Store Profile'}
        </button>

        <button
          onClick={() => setActiveTab('pos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === 'pos'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Printer className="w-4 h-4" />
          {lang === 'bn' ? 'পিওএস ও প্রিন্টার' : 'POS & Printing'}
        </button>

        <button
          onClick={() => setActiveTab('invoice')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === 'invoice'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Receipt className="w-4 h-4" />
          {lang === 'bn' ? 'ইনভয়েস কনফিগারেশন (A to Z)' : 'Invoice Customizer (A to Z)'}
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === 'finance'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          {lang === 'bn' ? 'ভ্যাট ও মুদ্রা' : 'Tax & Currency'}
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === 'backup'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-4 h-4" />
          {lang === 'bn' ? 'ডাটাবেজ ও ব্যাকআপ' : 'Database & Backup'}
        </button>
      </div>

      {/* Main Settings Form */}
      {activeTab !== 'backup' && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Official Shop Logo Section (Dual-Mode: File Upload or Direct Image URL / Google Drive) */}
              <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Store className="w-4 h-4 text-indigo-500" />
                      <span>{lang === 'bn' ? 'দোকানের অফিসিয়াল লোগো (Official Shop Logo)' : 'Official Shop Logo'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang === 'bn'
                        ? 'ইনভয়েস ও ক্যাশ মেমোর শীর্ষে প্রিন্ট হবে — সরাসরি ফাইল আপলোড করুন অথবা অনলাইন/গুগল ড্রাইভ লিংক দিন'
                        : 'Prints on top of customer receipts — upload an image file or provide a direct web / Google Drive link'}
                    </p>
                  </div>

                  {/* Mode Switcher Tabs */}
                  <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 self-start sm:self-auto text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setLogoTab('upload')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        logoTab === 'upload'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'ফাইল আপলোড' : 'Upload File'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoTab('url')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        logoTab === 'url'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'লোগো URL লিংক' : 'Logo URL'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                  {/* Live Logo Preview Box */}
                  <div className="relative group w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center bg-white dark:bg-slate-800 shrink-0 shadow-inner">
                    {logoPreview && !logoError ? (
                      <>
                        <img
                          src={logoPreview}
                          alt="Shop Logo"
                          onError={() => setLogoError(true)}
                          className="w-full h-full object-contain p-1"
                        />
                        <button
                          type="button"
                          onClick={handleClearLogo}
                          title={lang === 'bn' ? 'লোগো মুছুন' : 'Remove Logo'}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <Store className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-1" />
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {logoError
                            ? (lang === 'bn' ? 'ভুল লিংক' : 'Load Failed')
                            : (lang === 'bn' ? 'লোগো নেই' : 'No Logo')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tab 1: Local File Upload */}
                  {logoTab === 'upload' && (
                    <div className="flex-1 space-y-1.5 w-full">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition shadow-sm">
                        <Upload className="w-4 h-4 text-indigo-500" />
                        <span>{logoUploading ? t('loading') : (lang === 'bn' ? 'কম্পিউটার/ডিভাইস থেকে লোগো ফাইল নির্বাচন করুন' : 'Choose Logo File')}</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                      <p className="text-[11px] text-slate-400">
                        {lang === 'bn'
                          ? 'সর্বোচ্চ ৩ মেগাবাইট (PNG, JPG, SVG, WEBP - স্বচ্ছ ব্যাকগ্রাউন্ড সুপারিশকৃত)'
                          : 'Max 3MB (PNG, JPG, SVG, WEBP - transparent background recommended)'}
                      </p>
                      {logoFile && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          ✓ {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Direct Image / Google Drive URL */}
                  {logoTab === 'url' && (
                    <div className="flex-1 space-y-2 w-full">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          value={logoUrlInput}
                          onChange={(e) => handleLogoUrlChange(e.target.value)}
                          placeholder="https://drive.google.com/file/d/... বা https://example.com/logo.png"
                          className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        {logoUrlInput && (
                          <button
                            type="button"
                            onClick={() => handleLogoUrlChange('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {logoUrlInput && logoUrlInput.includes('drive.google.com') && !logoError && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {lang === 'bn'
                            ? '✓ গুগল ড্রাইভ লোগো সরাসরি লাইভ স্ট্রিমিং মোডে সক্রিয় হয়েছে।'
                            : '✓ Google Drive logo direct stream active.'}
                        </p>
                      )}
                      {logoError ? (
                        <p className="text-[11px] text-rose-500 font-medium">
                          {lang === 'bn'
                            ? '⚠️ লোগোটি লোড করা যায়নি। অনুগ্রহ করে সরাসরি ছবির লিংক (Direct Image URL) দিন।'
                            : '⚠️ Could not load logo from URL. Please ensure it is a direct image link.'}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          {lang === 'bn'
                            ? 'গুগল ড্রাইভ (Google Drive) অথবা ওয়েব থেকে যেকোনো অফিসিয়াল লোগোর লিংক দিন।'
                            : 'Paste any direct web or Google Drive logo URL.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'দোকানের নাম' : 'Shop Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    name="shop_name"
                    value={settings.shop_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'ট্যাগলাইন / স্লোগান' : 'Tagline / Slogan'}
                  </label>
                  <input
                    type="text"
                    name="shop_tagline"
                    value={settings.shop_tagline}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'হটলাইন / মোবাইল নম্বর' : 'Phone'} *
                  </label>
                  <input
                    type="text"
                    required
                    name="shop_phone"
                    value={settings.shop_phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email'}
                  </label>
                  <input
                    type="email"
                    name="shop_email"
                    value={settings.shop_email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'দোকানের ঠিকানা' : 'Address'} *
                  </label>
                  <textarea
                    rows={2}
                    required
                    name="shop_address"
                    value={settings.shop_address}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* POS & Printer Tab */}
          {activeTab === 'pos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'ডিফল্ট প্রিন্টার কাগজ সাইজ' : 'Default Paper Size'}
                  </label>
                  <select
                    name="default_printer_type"
                    value={settings.default_printer_type}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="80mm">80 মিমি থার্মাল POS রসিদ (80mm Thermal)</option>
                    <option value="58mm">58 মিমি ছোট থার্মাল রসিদ (58mm Thermal)</option>
                    <option value="a4">A4 সাধারণ ইনভয়েস পেপার (A4 Sheet)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'ইনভয়েস নম্বর প্রিফিক্স' : 'Invoice Prefix'}
                  </label>
                  <input
                    type="text"
                    name="invoice_prefix"
                    value={settings.invoice_prefix}
                    onChange={handleChange}
                    placeholder="INV-"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'রসিদের পাদটীকা বার্তা (Footer Note)' : 'Receipt Footer Note'}
                  </label>
                  <textarea
                    rows={2}
                    name="receipt_footer"
                    value={settings.receipt_footer}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invoice Customizer (A to Z) Tab */}
          {activeTab === 'invoice' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
                <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                    {lang === 'bn' ? 'সুপার অ্যাডমিন ইনভয়েস কাস্টমাইজার (A to Z কনফিগারেশন)' : 'Super Admin Invoice Customizer (A to Z)'}
                  </h3>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                    {lang === 'bn'
                      ? 'ক্যাশ মেমো ও ইনভয়েসে কোন কোন উপাদান থাকবে, ডিসকাউন্ট কীভাবে দেখাবে এবং শর্তাবলী কী হবে তা আপনার ইচ্ছা মতো নিয়ন্ত্রণ করুন। ডানের প্রিভিউতে লাইভ পরিবর্তন দেখুন।'
                      : 'Customize exactly which elements appear on cash receipts and tax invoices, how discounts are displayed, and preview live changes.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form Controls and Toggles (7 cols) */}
                <div className="xl:col-span-7 space-y-6">
                  {/* 1. Header & Text Fields */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>{lang === 'bn' ? 'ইনভয়েস পরিচিতি ও শিরোনাম বার্তা' : 'Invoice Header & Text Messages'}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'মেমো শিরোনাম (Header Title)' : 'Receipt Header Title'}
                        </label>
                        <input
                          type="text"
                          name="receipt_header_title"
                          value={settings.receipt_header_title || ''}
                          onChange={handleChange}
                          placeholder="CASH RECEIPT / ক্যাশ মেমো"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'ভ্যাট / বিআইএন নম্বর (VAT / BIN #)' : 'VAT / BIN Number'}
                        </label>
                        <input
                          type="text"
                          name="vat_bin_number"
                          value={settings.vat_bin_number || ''}
                          onChange={handleChange}
                          placeholder="BIN-000000000-000"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'শুভেচ্ছা বার্তা (Receipt Footer Message)' : 'Receipt Footer Message'}
                        </label>
                        <input
                          type="text"
                          name="receipt_footer"
                          value={settings.receipt_footer || ''}
                          onChange={handleChange}
                          placeholder="আমাদের সাথে কেনাকাটার জন্য আন্তরিক ধন্যবাদ!"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {lang === 'bn' ? 'ফেরত ও পরিবর্তন নীতি (Return & Exchange Terms)' : 'Return & Exchange Policy / Terms'}
                        </label>
                        <textarea
                          rows={2}
                          name="receipt_terms"
                          value={settings.receipt_terms || ''}
                          onChange={handleChange}
                          placeholder="পণ্য পরিবর্তনের জন্য ৭ দিনের মধ্যে ক্যাশ মেমোসহ যোগাযোগ করুন।"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. A to Z Toggles */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-indigo-600" />
                        <span>{lang === 'bn' ? 'রসিদে কী কী থাকবে (A to Z প্রদর্শন অন/অফ সুইচ)' : 'What to Include (A to Z Display Switches)'}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {lang === 'bn' ? 'যেকোনো উপাদানে ক্লিক করে সরাসরি ইনভয়েসে চালু বা বন্ধ করুন' : 'Click any toggle to show or hide it on printed receipts and invoices'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {toggleItems.map((item) => {
                        const isChecked = settings[item.key] !== '0';
                        return (
                          <div
                            key={item.key}
                            onClick={() => toggleSwitch(item.key)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                              isChecked
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 rounded-lg ${isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                <item.icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate">{item.title}</div>
                                <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                              </div>
                            </div>

                            <div className={`w-8 h-4.5 rounded-full transition-colors relative shrink-0 ${isChecked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${isChecked ? 'left-4' : 'left-0.5'}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Thermal Receipt Preview (5 cols) */}
                <div className="xl:col-span-5 sticky top-24">
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-indigo-600" />
                        <span>{lang === 'bn' ? 'লাইভ ইনভয়েস প্রিভিউ (80mm Thermal)' : 'Live Invoice Preview (80mm)'}</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {lang === 'bn' ? 'সরাসরি রিয়েল-টাইম' : 'Live Realtime'}
                      </span>
                    </div>

                    {/* The Receipt Mockup */}
                    <div className="bg-white text-black p-4 rounded-xl shadow-md border border-slate-300 font-mono text-[10px] max-w-sm mx-auto space-y-2">
                      {/* Header */}
                      <div className="text-center pb-2 border-b border-dashed border-black">
                        {settings.show_shop_logo !== '0' && logoPreview && (
                          <img src={logoPreview} alt="Logo" className="h-8 mx-auto mb-1 object-contain" />
                        )}
                        <div className="font-extrabold text-sm">{settings.shop_name || 'ISRAFIL BD SHOP'}</div>
                        {settings.show_shop_tagline !== '0' && settings.shop_tagline && (
                          <div className="text-[9px] text-slate-600">{settings.shop_tagline}</div>
                        )}
                        <div className="text-[9px] text-slate-700">
                          {settings.show_shop_address !== '0' && settings.shop_address && <span>{settings.shop_address}</span>}
                          {settings.show_shop_phone !== '0' && settings.shop_phone && <span> • {settings.shop_phone}</span>}
                          {settings.show_shop_email !== '0' && settings.shop_email && <span> • {settings.shop_email}</span>}
                        </div>
                        {settings.show_vat_bin !== '0' && settings.vat_bin_number && (
                          <div className="text-[9px] font-bold mt-0.5">BIN/VAT: {settings.vat_bin_number}</div>
                        )}
                        <div className="text-[10px] font-black mt-1 uppercase tracking-wide">
                          {settings.receipt_header_title || 'CASH RECEIPT / ক্যাশ মেমো'}
                        </div>
                      </div>

                      {/* Meta & Customer */}
                      <div className="py-1 text-[9px] space-y-0.5 border-b border-dashed border-black">
                        <div>Invoice: {settings.invoice_prefix || 'INV-'}20261104-0012</div>
                        {settings.show_invoice_date_time !== '0' && <div>Date: {new Date().toLocaleString()}</div>}
                        {settings.show_customer_info !== '0' && (
                          <>
                            <div>Customer: মোঃ রফিকুল ইসলাম (Rafiqul Islam)</div>
                            <div>Phone: 01712-345678</div>
                          </>
                        )}
                        {settings.show_cashier_name !== '0' && <div>Cashier: Super Admin</div>}
                      </div>

                      {/* Items Table */}
                      <table className="w-full text-[9px] my-1">
                        <thead>
                          <tr className="border-b border-black text-left">
                            <th className="py-0.5">Item</th>
                            <th className="text-center">Qty</th>
                            <th className="text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-0.5">
                              মিনিকেট চাল ৫ কেজি
                              {settings.show_item_code !== '0' && <span className="block text-[8px] text-slate-500 font-normal">[89410001001]</span>}
                              {settings.show_item_discount !== '0' && <span className="block text-[8px] text-emerald-700 font-bold">ছাড়: -৳৫০.০০</span>}
                            </td>
                            <td className="text-center">২</td>
                            <td className="text-right">৳৮৮০.০০</td>
                          </tr>
                          <tr>
                            <td className="py-0.5">
                              সয়াবিন তেল ২ লিটার
                              {settings.show_item_code !== '0' && <span className="block text-[8px] text-slate-500 font-normal">[89410001002]</span>}
                            </td>
                            <td className="text-center">১</td>
                            <td className="text-right">৳৩৫০.০০</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Totals & Discounts */}
                      <div className="pt-1 border-t border-dashed border-black text-[9px] space-y-0.5">
                        <div className="flex justify-between"><span>Subtotal:</span><span>৳১,২৮০.০০</span></div>

                        {settings.show_total_discount !== '0' && (
                          <>
                            <div className="flex justify-between font-bold text-emerald-700">
                              <span>মোট ডিসকাউন্ট / ছাড়:</span>
                              <span>-৳৬০.০০</span>
                            </div>
                            <div className="flex justify-between text-[8px] text-slate-600 pl-1.5">
                              <span>↳ পয়েন্ট রিডিম ছাড় (১০০ pt):</span>
                              <span>-৳১০.০০</span>
                            </div>
                            <div className="flex justify-between text-[8px] text-slate-600 pl-1.5">
                              <span>↳ পণ্য বিশেষ ছাড়:</span>
                              <span>-৳৫০.০০</span>
                            </div>
                            <div className="text-center text-[8px] font-bold py-0.5 bg-emerald-50 border border-emerald-200 rounded my-0.5">
                              🎉 আপনি সর্বমোট ৳৬০.০০ সাশ্রয় করেছেন!
                            </div>
                          </>
                        )}

                        <div className="flex justify-between font-black text-xs border-t border-black pt-1">
                          <span>Grand Total:</span><span>৳১,২২০.০০</span>
                        </div>

                        {settings.show_due_change !== '0' && (
                          <>
                            <div className="flex justify-between"><span>Paid (Cash):</span><span>৳১,৫০০.০০</span></div>
                            <div className="flex justify-between"><span>Change Return:</span><span>৳২৮০.০০</span></div>
                          </>
                        )}
                      </div>

                      {/* Loyalty Points */}
                      {settings.show_loyalty_points !== '0' && (
                        <div className="pt-1 border-t border-dotted border-black text-[8px] space-y-0.5">
                          <div className="font-bold">⭐ লয়ালটি রিওয়ার্ড তথ্য:</div>
                          <div>ব্যবহৃত পয়েন্ট (ছাড়): -১০০ pt (৳১০.০০ ছাড়)</div>
                          <div>নতুন অর্জিত পয়েন্ট: +১২ pt</div>
                          <div className="font-bold">বর্তমান মোট ব্যালেন্স: ৭২ pts</div>
                        </div>
                      )}

                      {/* Footer & Terms */}
                      <div className="text-center text-[8px] pt-2 border-t border-dashed border-black space-y-1">
                        <div>{settings.receipt_footer || 'আমাদের সাথে কেনাকাটার জন্য আন্তরিক ধন্যবাদ!'}</div>
                        {settings.show_terms_conditions !== '0' && settings.receipt_terms && (
                          <div className="italic text-[7px] text-slate-600">{settings.receipt_terms}</div>
                        )}
                      </div>

                      {/* Barcode */}
                      {settings.show_receipt_barcode !== '0' && (
                        <div className="pt-1 text-center">
                          <BarcodeSvg code="INV-20261104-0012" height={28} className="h-6 w-36 mx-auto" />
                          <span className="text-[7px] font-mono tracking-wider block">INV-20261104-0012</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'ডিফল্ট ভ্যাট / ট্যাক্স হার (%)' : 'Default Tax Rate (%)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="default_tax_rate"
                      value={settings.default_tax_rate}
                      onChange={handleChange}
                      className="w-full pl-3.5 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'মুদ্রার প্রতীক' : 'Currency Symbol'}
                  </label>
                  <input
                    type="text"
                    name="currency_symbol"
                    value={settings.currency_symbol}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'মুদ্রার কোড' : 'Currency Code'}
                  </label>
                  <input
                    type="text"
                    name="currency_code"
                    value={settings.currency_code}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      )}

      {/* Database & Backup Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* 1. Live Database Overview */}
          <div className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'ডাটাবেজ ওভারভিউ ও পরিসংখ্যান' : 'Database Overview & Live Statistics'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'bn' ? 'সিস্টেমের বর্তমান ডাটাবেজ এন্ট্রি ও রেকর্ডের সংখ্যা' : 'Current live record counts in Israfil Shop database'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchDbStats}
                disabled={loadingDbStats}
                className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDbStats ? 'animate-spin' : ''}`} />
                {lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh Stats'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: lang === 'bn' ? 'পণ্য (Products)' : 'Products', val: dbStats?.products ?? '...', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
                { label: lang === 'bn' ? 'ক্যাটাগরি' : 'Categories', val: dbStats?.categories ?? '...', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                { label: lang === 'bn' ? 'বিক্রয় চালান' : 'Sales', val: dbStats?.sales ?? '...', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                { label: lang === 'bn' ? 'ক্রয় এন্ট্রি' : 'Purchases', val: dbStats?.purchases ?? '...', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
                { label: lang === 'bn' ? 'গ্রাহক' : 'Customers', val: dbStats?.customers ?? '...', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
                { label: lang === 'bn' ? 'খরচের ভাউচার' : 'Expenses', val: dbStats?.expenses ?? '...', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 ${item.bg}`}>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">{item.label}</div>
                  <div className={`text-xl font-extrabold mt-1 font-mono ${item.color}`}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. SQL Backup Download Card */}
          <div className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <h4 className="font-bold text-amber-900 dark:text-amber-200">
                  {lang === 'bn' ? 'জরুরি অফলাইন ডাটাবেজ ব্যাকআপ (SQL Backup)' : 'Emergency Database SQL Dump'}
                </h4>
                <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনার দোকানের সমস্ত পণ্য, বিক্রয়, ইনভয়েস এবং কাস্টমার লেজার নিরাপদে সংরক্ষণ করতে এক ক্লিকেই সম্পূর্ণ SQL ব্যাকআপ ডাউনলোড করুন।'
                    : 'Download a full standalone SQL database dump file including all products, sales, customers, and ledger entries.'}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'সম্পূর্ণ স্কিমা ও ডাটাবেজ ডাম্প' : 'Full MySQL Schema & Data Dump'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    MySQL .sql dump file (tables: 15, single-store clean schema)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={backupLoading}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {backupLoading ? t('loading') : (lang === 'bn' ? 'ব্যাকআপ ডাউনলোড করুন (.sql)' : 'Download Backup (.sql)')}
              </button>
            </div>
          </div>

          {/* 3. Super Admin Danger Zone (Database Clear & Reset) */}
          <div className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 rounded-2xl border-2 border-rose-300 dark:border-rose-900/60 shadow-sm space-y-6 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 uppercase tracking-wide">
                  {lang === 'bn' ? '⚠️ সুপার অ্যাডমিন নিয়ন্ত্রিত' : '⚠️ Super Admin Control'}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'সুপার অ্যাডমিন ডেঞ্জার জোন (ডাটাবেজ ক্লিয়ার ও রিসেট)' : 'Super Admin Danger Zone (Database Clear & Reset)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {lang === 'bn'
                    ? 'প্রয়োজনমাফিক এখান থেকে দোকানের পরীক্ষামূলক বিক্রয় ডাটা মুছে ফ্রেশ করতে পারবেন অথবা সম্পূর্ণ ডাটাবেজ ফ্যাক্টরি রিসেট দিতে পারবেন। প্রতিটি মোছার পূর্বমুহূর্তে সিস্টেম স্বয়ংক্রিয়ভাবে জরুরি ব্যাকআপ তৈরি করবে।'
                    : 'Clear sales transactions or perform a full clean factory reset. The system automatically creates a safety SQL backup right before performing any deletion.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Option A: Clear Transactions Only */}
              <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/15 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {lang === 'bn' ? '১. বিক্রয় ও আর্থিক লেনদেন ডাটা মুছুন' : '1. Clear Sales & Transaction Data'}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lang === 'bn' ? 'পণ্য ক্যাটালগ ঠিক থাকবে, শুধু হিসাব রিসেট হবে' : 'Keeps products & settings, resets transactions'}
                      </span>
                    </div>
                  </div>

                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-1">
                    <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <span>✓</span> {lang === 'bn' ? 'সমস্ত পণ্য, ক্যাটাগরি, ব্র্যান্ড ও ইউনিট বহাল থাকবে' : 'Keeps all products, categories, brands & units'}
                    </li>
                    <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <span>✓</span> {lang === 'bn' ? 'দোকানের নাম, অ্যাডমিন অ্যাকাউন্ট ও সেটিংস অপরিবর্তিত থাকবে' : 'Keeps admin login & shop settings intact'}
                    </li>
                    <li className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                      <span>✕</span> {lang === 'bn' ? 'সকল বিক্রয় ইনভয়েস, পেমেন্ট ও রিটার্ন মুছে যাবে' : 'Deletes all sales, sale items, payments & returns'}
                    </li>
                    <li className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                      <span>✕</span> {lang === 'bn' ? 'সকল ক্রয়, খরচ ও কাস্টমার বাকি ব্যালেন্স ০ হবে' : 'Deletes purchases, expenses & resets customer dues'}
                    </li>
                  </ul>

                  <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={resetStock}
                      onChange={(e) => setResetStock(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <span>{lang === 'bn' ? 'পণ্যগুলোর বর্তমান স্টক শূন্য (0) করুন' : 'Reset all product stock to 0'}</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenClearModal('clear_transactions')}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-rose-700 dark:text-rose-300 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <Trash2 className="w-4 h-4" />
                  {lang === 'bn' ? 'ট্রানজ্যাকশন ডাটা মুছুন' : 'Clear Transactions'}
                </button>
              </div>

              {/* Option B: Full Factory Reset */}
              <div className="p-5 rounded-2xl border border-red-300 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {lang === 'bn' ? '২. সম্পূর্ণ ডাটাবেজ ফ্যাক্টরি রিসেট' : '2. Full Factory Database Reset'}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lang === 'bn' ? 'সম্পূর্ণ নতুন ফ্রেশ রিটেল ইনস্টলেশনে রিসেট হবে' : 'Wipes all tables & fresh re-seeds clean foundation'}
                      </span>
                    </div>
                  </div>

                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-1">
                    <li className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                      <span>✕</span> {lang === 'bn' ? 'সমস্ত পণ্য, ক্যাটাগরি, গ্রাহক ও ক্যাটালগ মুছে যাবে' : 'Deletes all custom products, customers & catalog'}
                    </li>
                    <li className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                      <span>✕</span> {lang === 'bn' ? 'সকল ইনভয়েস, পেমেন্ট, খরচ ও ইতিহাস মুছে যাবে' : 'Wipes entire ledger & all operational history'}
                    </li>
                    <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <span>✓</span> {lang === 'bn' ? 'সিস্টেম ক্লিন মাইগ্রেশন ও স্ট্যান্ডার্ড রোল-পারমিশন পাবে' : 'Clean migrations & standard retail permissions'}
                    </li>
                    <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <span>✓</span> {lang === 'bn' ? 'ডিফল্ট অ্যাডমিন (admin@israfilbd.com / password123)' : 'Default admin recreated (password123)'}
                    </li>
                  </ul>

                  <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={seedDemo}
                      onChange={(e) => setSeedDemo(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                    <span>{lang === 'bn' ? 'স্যাম্পল ডেমো প্রোডাক্ট ক্যাটালগ যোগ করুন' : 'Include sample retail demo catalog'}</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenClearModal('full_reset')}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/20 active:scale-[0.99]"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {lang === 'bn' ? 'সম্পূর্ণ ডাটাবেজ রিসেট করুন' : 'Full Factory Reset'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing Database */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {clearMode === 'clear_transactions'
                    ? (lang === 'bn' ? 'বিক্রয় ও ট্রানজ্যাকশন ডাটা মোছার নিশ্চিতকরণ' : 'Confirm Clearing Transaction Data')
                    : (lang === 'bn' ? 'সম্পূর্ণ ডাটাবেজ ফ্যাক্টরি রিসেটের নিশ্চিতকরণ' : 'Confirm Full Factory Reset')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {clearMode === 'clear_transactions'
                    ? (lang === 'bn' ? 'দোকানের সকল বিক্রয়, ক্রয়, খরচ ও লেজার হিসাব মুছে শূন্য হয়ে যাবে।' : 'All sales, purchases, expenses and ledger balances will be cleared.')
                    : (lang === 'bn' ? 'সম্পূর্ণ ডাটাবেজ মুছে ফ্রেশভাবে পুনরায় তৈরি হবে।' : 'The entire database will be dropped and re-created fresh.')}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>🛡️</span>
                {lang === 'bn' ? 'স্বয়ংক্রিয় ব্যাকআপ সুরক্ষা' : 'Automatic Safety Backup'}
              </div>
              <p className="text-[11px] leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার সুরক্ষার জন্য ডাটা মোছার ঠিক পূর্বমুহূর্তে একটি পূর্ণাঙ্গ SQL ব্যাকআপ ফাইল "backend/database/backups/" ফোল্ডারে সংরক্ষিত হবে।'
                  : 'An automatic emergency SQL backup file will be created in "backend/database/backups/" before deletion.'}
              </p>
            </div>

            <form onSubmit={handleExecuteClearDatabase} className="space-y-4">
              {/* Step 1: Confirmation Word */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? '১. নিশ্চিত করতে নিচে ' : '1. Type '}
                  <span className="font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">CLEAR</span>
                  {lang === 'bn' ? ' শব্দটি লিখুন:' : ' to confirm:'}
                </label>
                <input
                  type="text"
                  required
                  value={clearConfirmation}
                  onChange={(e) => setClearConfirmation(e.target.value)}
                  placeholder="CLEAR"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Step 2: Super Admin Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? '২. সুপার অ্যাডমিন পাসওয়ার্ড প্রদান করুন:' : '2. Enter Super Admin Password:'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={clearPassword}
                    onChange={(e) => setClearPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={clearing}
                  onClick={() => setShowClearModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={clearing || clearConfirmation.trim().toUpperCase() !== 'CLEAR' || !clearPassword}
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition flex items-center gap-2 shadow-md shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {clearing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'bn' ? 'প্রসেসিং হচ্ছে...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'হ্যাঁ, নিশ্চিত মুছে ফেলুন' : 'Yes, Proceed & Clear'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

