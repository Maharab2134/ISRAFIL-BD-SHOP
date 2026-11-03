import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
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
  Receipt
} from 'lucide-react';

export default function ShopSettings() {
  const { t, lang } = useLanguage();
  const { success, error, info } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    shop_name: 'ISRAFIL BD SHOP',
    shop_tagline: 'প্রিমিয়াম রিটেইল ও পিওএস আউটলেট',
    shop_phone: '+880 1700-000000',
    shop_email: 'info@israfilbd.com',
    shop_address: 'ঢাকা, বাংলাদেশ',
    default_printer_type: '80mm',
    invoice_prefix: 'INV-',
    receipt_footer: 'আমাদের সাথে থাকার জন্য ধন্যবাদ! পণ্য পরিবর্তনের জন্য ৭ দিনের মধ্যে ক্যাশ মেমোসহ আসুন।',
    auto_print: '1',
    default_tax_rate: '0',
    currency_symbol: '৳',
    currency_code: 'BDT',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

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
            setLogoPreview(res.data.settings.shop_logo);
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/settings', { settings });
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

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-4 h-4" />
          {lang === 'bn' ? 'ডাটাবেজ ব্যাকআপ' : 'Database Backup'}
        </button>
      </div>

      {/* Main Settings Form */}
      {activeTab !== 'backup' && (
        <form onSubmit={handleSave} className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Logo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center bg-white dark:bg-slate-800 shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Shop Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Store className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {lang === 'bn' ? 'দোকানের অফিসিয়াল লোগো' : 'Official Shop Logo'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'bn' ? 'ইনভয়েস ও ক্যাশ মেমোর শীর্ষে প্রিন্ট হবে (PNG/JPG, সর্বোচ্চ 3MB)' : 'Prints on top of customer receipts (PNG/JPG, max 3MB)'}
                  </p>
                  <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition shadow-sm mt-1">
                    <Upload className="w-3.5 h-3.5" />
                    {logoUploading ? t('loading') : (lang === 'bn' ? 'লোগো ছবি নির্বাচন করুন' : 'Choose Logo')}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
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

      {/* Database Backup Tab */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <h4 className="font-bold text-amber-900 dark:text-amber-200">
                {lang === 'bn' ? 'জরুরি অফলাইন ডাটাবেজ ব্যাকআপ' : 'Emergency Database SQL Dump'}
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
                  MySQL .sql dump file (tables: 25, utf8mb4)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadBackup}
              disabled={backupLoading}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {backupLoading ? t('loading') : (lang === 'bn' ? 'ব্যাকআপ ডাউনলোড করুন (.sql)' : 'Download Backup (.sql)')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

