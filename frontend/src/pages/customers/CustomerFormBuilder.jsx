import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Settings,
  QrCode,
  Smartphone,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Check,
  Copy,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  Gift,
  ShieldCheck,
  AlertCircle,
  Eye,
  RefreshCw,
  ShoppingBag,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const THEME_COLORS = [
  { name: 'Indigo', value: '#4F46E5', class: 'bg-[#4F46E5]' },
  { name: 'Emerald', value: '#10B981', class: 'bg-[#10B981]' },
  { name: 'Blue', value: '#2563EB', class: 'bg-[#2563EB]' },
  { name: 'Violet', value: '#7C3AED', class: 'bg-[#7C3AED]' },
  { name: 'Rose', value: '#E11D48', class: 'bg-[#E11D48]' },
  { name: 'Amber', value: '#D97706', class: 'bg-[#D97706]' },
];

export const CustomerFormBuilder = () => {
  const { lang } = useLanguage();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'qr' | 'preview'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form Configuration State
  const [title, setTitle] = useState('গ্রাহক মেম্বারশিপ ও কাস্টমার রেজিস্ট্রেশন');
  const [titleEn, setTitleEn] = useState('Customer Membership & Registration');
  const [description, setDescription] = useState('ইসরাফিল বিডি শপের মেম্বারশিপ প্রোগ্রামে যুক্ত হোন এবং প্রতিটি কেনাকাটায় বিশেষ ছাড় ও লয়্যালটি পয়েন্ট উপভোগ করুন!');
  const [welcomePoints, setWelcomePoints] = useState(50);
  const [autoApprove, setAutoApprove] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [themeColor, setThemeColor] = useState('#4F46E5');
  const [fields, setFields] = useState([
    { id: 'name', label: 'Full Name', label_bn: 'পূর্ণ নাম', type: 'text', placeholder: 'আপনার নাম লিখুন', required: true, enabled: true, is_system: true },
    { id: 'phone', label: 'Mobile Number', label_bn: 'মোবাইল নম্বর', type: 'tel', placeholder: '০১৭XXXXXXXX', required: true, enabled: true, is_system: true },
    { id: 'email', label: 'Email Address', label_bn: 'ইমেইল ঠিকানা (ঐচ্ছিক)', type: 'email', placeholder: 'example@mail.com', required: false, enabled: true, is_system: false },
    { id: 'address', label: 'Address / Area', label_bn: 'ঠিকানা / এলাকা', type: 'textarea', placeholder: 'বাসা/রোড, এলাকা ও থানা লিখুন', required: false, enabled: true, is_system: false },
  ]);
  const [shopInfo, setShopInfo] = useState(null);

  // New Custom Field State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldLabelBn, setNewFieldLabelBn] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const qrRef = useRef(null);
  const printStandeeRef = useRef(null);

  // Registration URL
  const publicUrl = `${window.location.origin}/join-customer`;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer-registration/admin/form');
      if (res.data?.status === 'success') {
        const form = res.data.form;
        setTitle(form.title || 'গ্রাহক মেম্বারশিপ ও কাস্টমার রেজিস্ট্রেশন');
        setTitleEn(form.title_en || 'Customer Membership & Registration');
        setDescription(form.description || '');
        setWelcomePoints(form.welcome_points ?? 50);
        setAutoApprove(Boolean(form.auto_approve));
        setIsActive(Boolean(form.is_active));
        setThemeColor(form.theme_color || '#4F46E5');
        setFields(form.fields || []);
        setShopInfo(res.data.shop || null);
      }
    } catch (err) {
      console.error(err);
      error(lang === 'bn' ? 'ফর্ম কনফিগারেশন লোড করতে ব্যর্থ হয়েছে' : 'Failed to load form configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        title: title?.trim() || 'গ্রাহক মেম্বারশিপ ও কাস্টমার রেজিস্ট্রেশন',
        title_en: titleEn?.trim() || 'Customer Membership & Registration',
        description,
        welcome_points: 0,
        auto_approve: autoApprove,
        is_active: isActive,
        theme_color: themeColor,
        fields: Array.isArray(fields) && fields.length > 0 ? fields : [
          { id: 'name', label: 'Full Name', label_bn: 'পূর্ণ নাম', type: 'text', placeholder: 'আপনার নাম লিখুন', required: true, enabled: true, is_system: true },
          { id: 'phone', label: 'Mobile Number', label_bn: 'মোবাইল নম্বর', type: 'tel', placeholder: '০১৭XXXXXXXX', required: true, enabled: true, is_system: true },
          { id: 'email', label: 'Email Address', label_bn: 'ইমেইল ঠিকানা (ঐচ্ছিক)', type: 'email', placeholder: 'example@mail.com', required: false, enabled: true, is_system: false },
          { id: 'address', label: 'Address / Area', label_bn: 'ঠিকানা / এলাকা', type: 'textarea', placeholder: 'বাসা/রোড, এলাকা ও থানা লিখুন', required: false, enabled: true, is_system: false },
        ],
      };

      const res = await api.put('/customer-registration/admin/form', payload);
      if (res.data?.status === 'success') {
        success(lang === 'bn' ? 'ফর্ম সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Form settings saved successfully!');
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || (lang === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const toggleFieldEnabled = (index) => {
    const updated = [...fields];
    if (updated[index].is_system) return; // Core fields cannot be disabled
    updated[index].enabled = !updated[index].enabled;
    setFields(updated);
  };

  const toggleFieldRequired = (index) => {
    const updated = [...fields];
    if (updated[index].is_system && ['name', 'phone'].includes(updated[index].id)) return; // Core identifiers always required
    updated[index].required = !updated[index].required;
    setFields(updated);
  };

  const moveField = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setFields(updated);
  };

  const removeField = (index) => {
    if (fields[index].is_system) return;
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) {
      error(lang === 'bn' ? 'ফিল্ডের নাম দিন' : 'Please provide field label');
      return;
    }

    const fieldId = 'custom_' + Date.now();
    let optionsArray = [];
    if (newFieldType === 'select' && newFieldOptions.trim()) {
      optionsArray = newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean);
    }

    const newField = {
      id: fieldId,
      label: newFieldLabel.trim(),
      label_bn: newFieldLabelBn.trim() || newFieldLabel.trim(),
      type: newFieldType,
      placeholder: newFieldPlaceholder.trim(),
      options: optionsArray,
      required: newFieldRequired,
      enabled: true,
      is_system: false,
    };

    setFields([...fields, newField]);
    setShowAddModal(false);
    setNewFieldLabel('');
    setNewFieldLabelBn('');
    setNewFieldPlaceholder('');
    setNewFieldOptions('');
    setNewFieldRequired(false);
    success(lang === 'bn' ? 'কাস্টম ফিল্ড যুক্ত হয়েছে' : 'Custom field added');
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    success(lang === 'bn' ? 'রেজিস্ট্রেশন লিংক কপি করা হয়েছে!' : 'Registration link copied!');
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadQrCode = (format = 'png') => {
    const svg = document.getElementById('registration-qr-svg');
    if (!svg) return;

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const a = document.createElement('a');
      a.href = svgUrl;
      a.download = `israfil-customer-registration-qr.svg`;
      a.click();
      URL.revokeObjectURL(svgUrl);
      success(lang === 'bn' ? 'SVG ডাউনলোড সম্পন্ন!' : 'SVG Downloaded!');
      return;
    }

    // PNG download via Canvas
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 50, 50, 900, 900);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `israfil-customer-registration-qr.png`;
      a.click();
      success(lang === 'bn' ? 'PNG ডাউনলোড সম্পন্ন!' : 'PNG Downloaded!');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintStandee = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Printable Counter Standee / Flyer (Shown only during print) */}
      <div className="hidden print:block print:w-full print:min-h-screen print:p-8 bg-white text-slate-900 font-sans">
        <div className="border-4 border-indigo-600 rounded-3xl p-8 max-w-xl mx-auto text-center flex flex-col items-center justify-between min-h-[90vh]">
          {/* Header */}
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black tracking-widest uppercase mb-3">
              Official Store Membership
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {shopInfo?.shop_name || 'ISRAFIL BD SHOP'}
            </h1>
            <p className="text-lg font-bold text-indigo-600 mt-1">
              মেম্বারশিপে যুক্ত হোন ও আকর্ষণীয় পয়েন্ট জিতুন!
            </p>
          </div>

          {/* QR Code Container */}
          <div className="my-6 p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center">
            <QRCodeSVG
              value={publicUrl}
              size={260}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: shopInfo?.shop_logo || '',
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
            <p className="text-xs font-bold text-slate-500 mt-4">
              মোবাইল ক্যামেরা দিয়ে স্ক্যান করে আবেদন করুন
            </p>
          </div>

          {/* Value Proposition */}
          <div className="w-full bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center my-2">
            <p className="text-base font-black text-indigo-950">
              {lang === 'bn' ? 'ইসরাফিল বিডি শপ মেম্বারশিপে যুক্ত হোন!' : 'Join Israfil BD Shop Membership!'}
            </p>
            <p className="text-xs text-indigo-800 font-medium mt-0.5">
              {lang === 'bn' ? 'প্রতিটি কেনাকাটায় পয়েন্ট জমা হবে এবং সরাসরি ক্যাশ ডিসকাউন্ট পাওয়া যাবে।' : 'Earn loyalty points on purchases and enjoy instant discounts.'}
            </p>
          </div>

          {/* How to use steps */}
          <div className="grid grid-cols-3 gap-3 w-full my-4 text-center">
            <div className="p-3 rounded-xl bg-slate-100">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs inline-flex items-center justify-center mb-1">
                ১
              </span>
              <p className="text-xs font-bold text-slate-800">QR কোড স্ক্যান করুন</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs inline-flex items-center justify-center mb-1">
                ২
              </span>
              <p className="text-xs font-bold text-slate-800">ফর্মটি পূরণ করুন</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs inline-flex items-center justify-center mb-1">
                ৩
              </span>
              <p className="text-xs font-bold text-slate-800">পয়েন্ট ও ডিসকাউন্ট নিন</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-xs text-slate-400 border-t border-slate-200 pt-3 w-full">
            {shopInfo?.shop_address || 'ঢাকা, বাংলাদেশ'} • হেল্পলাইন: {shopInfo?.shop_phone || '01700000000'}
          </div>
        </div>
      </div>

      {/* Screen Interface (Hidden when printing) */}
      <div className="print:hidden space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'কাস্টমার ফর্ম বিল্ডার ও QR কোড' : 'Customer Form Builder & QR Code'}
              </h1>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn'
                ? 'দোকানের জন্য ডাইনামিক কাস্টমার রেজিস্ট্রেশন ফর্ম তৈরি করুন, QR কোড ও টেবিলটপ স্ট্যান্ডি প্রিন্ট করুন'
                : 'Build dynamic customer registration forms, generate QR codes, and print table-top counter standees'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/customers/approvals"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'অ্যাপ্রুভাল প্যানেল' : 'Approvals Panel'}</span>
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{lang === 'bn' ? 'সেভ করুন' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* 3 Main View Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'builder'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{lang === 'bn' ? '১. ফর্ম কনফিগারেশন ও ফিল্ডস' : '1. Form Fields & Settings'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'qr'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{lang === 'bn' ? '২. QR কোড ও মেম্বারশিপ স্ট্যান্ডি' : '2. QR Code & Standee Flyer'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{lang === 'bn' ? '৩. লাইভ মোবাইল প্রিভিউ' : '3. Live Mobile Preview'}</span>
          </button>
        </div>

        {/* TAB 1: FORM BUILDER */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: General Settings (1 col) */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  <span>{lang === 'bn' ? 'সাধারণ কনফিগারেশন' : 'General Configuration'}</span>
                </h2>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'ফর্মের শিরোনাম (বাংলা)' : 'Form Title (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'ফর্মের শিরোনাম (English)' : 'Form Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'বিবরণ বা প্রমোশনাল মেসেজ' : 'Description / Subtitle'}
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Theme Color Selector */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {lang === 'bn' ? 'ফর্মের থিম কালার' : 'Theme Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    {THEME_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setThemeColor(c.value)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                          c.class
                        } ${themeColor === c.value ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 shadow-md' : 'hover:scale-110'}`}
                        title={c.name}
                      >
                        {themeColor === c.value && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === 'bn' ? 'স্বয়ংক্রিয় অনুমোদন (Auto Approve)' : 'Auto Approve'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        সরাসরি কাস্টমার প্রোফাইল সক্রিয় হবে
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoApprove}
                      onChange={(e) => setAutoApprove(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {lang === 'bn' ? 'ফর্ম স্ট্যাটাস (Active)' : 'Form Active'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        QR কোড স্ক্যান করে রেজিস্ট্রেশন চালু থাকবে
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Field List & Custom Field Management (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {lang === 'bn' ? 'ফর্মের ফিল্ডসমূহ সাজান ও নিয়ন্ত্রণ করুন' : 'Manage & Reorder Form Fields'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang === 'bn'
                        ? 'কোন তথ্যগুলো গ্রাহকের কাছ থেকে গ্রহণ করবেন তা নির্বাচন করুন'
                        : 'Choose which fields customers must fill when registering'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition flex items-center gap-1.5 cursor-pointer border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'নতুন ফিল্ড যোগ' : 'Add Custom Field'}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        field.enabled !== false
                          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                          : 'bg-slate-100/40 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveField(index, -1)}
                            className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === fields.length - 1}
                            onClick={() => moveField(index, 1)}
                            className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {field.label_bn || field.label}
                            </span>
                            {field.is_system && (
                              <span className="px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                                কোর ফিল্ড
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-[10px] font-mono">
                              {field.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {field.placeholder || `Field ID: ${field.id}`}
                          </div>
                        </div>
                      </div>

                      {/* Controls: Required & Enable Toggles */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Required toggle */}
                        <button
                          type="button"
                          disabled={field.is_system && ['name', 'phone'].includes(field.id)}
                          onClick={() => toggleFieldRequired(index)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            field.required
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {field.required
                            ? (lang === 'bn' ? 'বাধ্যতামূলক' : 'Required')
                            : (lang === 'bn' ? 'ঐচ্ছিক' : 'Optional')}
                        </button>

                        {/* Enable/Disable toggle */}
                        <button
                          type="button"
                          disabled={field.is_system}
                          onClick={() => toggleFieldEnabled(index)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            field.enabled !== false
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {field.enabled !== false
                            ? (lang === 'bn' ? 'চালু' : 'Enabled')
                            : (lang === 'bn' ? 'বন্ধ' : 'Disabled')}
                        </button>

                        {/* Delete custom field */}
                        {!field.is_system && (
                          <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QR CODE & STANDee */}
        {activeTab === 'qr' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Scannable QR & Direct Links (1 col) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col items-center text-center space-y-4">
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-center">
                <div id="registration-qr-container" className="p-3 bg-white rounded-2xl shadow-md">
                  <QRCodeSVG
                    id="registration-qr-svg"
                    value={publicUrl}
                    size={220}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: shopInfo?.shop_logo || '',
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'bn' ? 'হাই-রেজোলিউশন স্ক্যানেবল ভেক্টর QR' : 'High-Resolution Scannable QR'}</span>
                </div>
              </div>

              {/* Public Link Box */}
              <div className="w-full space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-left">
                  {lang === 'bn' ? 'পাবলিক রেজিস্ট্রেশন লিংক' : 'Public Registration URL'}
                </label>
                <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="w-full text-xs font-mono text-slate-700 dark:text-slate-300 bg-transparent outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={copyPublicLink}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'কপি হয়েছে' : 'কপি লিংক'}</span>
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition"
                    title="নতুন ট্যাবে ওপেন করুন"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button
                  type="button"
                  onClick={() => downloadQrCode('png')}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadQrCode('svg')}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড (SVG)</span>
                </button>
              </div>
            </div>

            {/* Right: Table-top Standee Preview & Print (1 col) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <span>{lang === 'bn' ? 'কাউন্টার টেবিলটপ স্ট্যান্ডি / ফ্লায়ার' : 'Table-top Standee / Counter Flyer'}</span>
                  </h2>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    Print Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  সুপারশপের ক্যাশ কাউন্টার বা ডিসপ্লে ডেস্কে রাখার জন্য প্রস্তুত স্ট্যান্ডি ডিজাইন। এক ক্লিকে যেকোনো প্রিন্টারে প্রিন্ট করুন।
                </p>
              </div>

              {/* Miniature Standee Preview Box */}
              <div className="border-2 border-indigo-500/80 rounded-2xl p-5 bg-gradient-to-b from-indigo-50/40 to-white dark:from-slate-900 dark:to-slate-950 text-center space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  {shopInfo?.shop_name || 'ISRAFIL BD SHOP'}
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  মেম্বারশিপে যুক্ত হোন ও আকর্ষণীয় পয়েন্ট পান!
                </h3>
                <div className="inline-block p-2 bg-white rounded-xl shadow-xs">
                  <QRCodeSVG value={publicUrl} size={110} level="M" />
                </div>
                <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {lang === 'bn' ? 'কেনাকাটায় আকর্ষণীয় ডিসকাউন্ট ও পয়েন্ট!' : 'Exclusive member discounts on purchases!'}
                </div>
                <div className="text-[10px] text-slate-400">
                  ক্যামেরা দিয়ে স্ক্যান করে সহজে নিবন্ধন করুন
                </div>
              </div>

              {/* Action Button: Print Flyer */}
              <button
                type="button"
                onClick={handlePrintStandee}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'bn' ? 'প্রিন্ট মেম্বারশিপ স্ট্যান্ডি / ফ্লায়ার' : 'Print Counter Standee / Flyer'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE MOBILE PREVIEW */}
        {activeTab === 'preview' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-sm rounded-[40px] border-8 border-slate-900 shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
              {/* Phone Top Notch */}
              <div className="h-6 bg-slate-900 w-full flex items-center justify-center">
                <div className="w-20 h-3.5 bg-slate-800 rounded-full" />
              </div>

              {/* Phone Inner Screen */}
              <div className="p-4 space-y-4 max-h-[550px] overflow-y-auto text-center font-sans">
                {/* Header preview */}
                <div className="pt-2">
                  <div
                    className="w-12 h-12 rounded-2xl text-white flex items-center justify-center mx-auto mb-2 shadow-sm"
                    style={{ backgroundColor: themeColor }}
                  >
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {title || 'গ্রাহক মেম্বারশিপ রেজিস্ট্রেশন'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {description || 'মেম্বারশিপে যুক্ত হোন ও ছাড় পান'}
                  </p>
                </div>

                {/* Form fields preview */}
                <div className="space-y-2.5 text-left pt-2">
                  {fields.filter((f) => f.enabled !== false).map((f) => (
                    <div key={f.id} className="space-y-0.5">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {f.label_bn || f.label}
                        {f.required && <span className="text-rose-500 ml-0.5">*</span>}
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder={f.placeholder || ''}
                        className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    disabled
                    style={{ backgroundColor: themeColor }}
                    className="w-full mt-3 py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-sm cursor-not-allowed opacity-90"
                  >
                    মেম্বারশিপের জন্য আবেদন জমা দিন
                  </button>
                </div>
              </div>

              {/* Phone Bottom Bar */}
              <div className="h-4 bg-slate-900 w-full flex items-center justify-center">
                <div className="w-24 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Custom Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'bn' ? 'নতুন কাস্টম ফিল্ড যোগ করুন' : 'Add New Custom Field'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'ফিল্ডের লেবেল (বাংলা)' : 'Field Label (Bangla)'} *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: পেশা / পেশাগত পদবী"
                  value={newFieldLabelBn}
                  onChange={(e) => setNewFieldLabelBn(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'ফিল্ডের লেবেল (English)' : 'Field Label (English)'} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Occupation"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'ইনপুট টাইপ' : 'Input Type'}
                  </label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  >
                    <option value="text">Text (লেখা)</option>
                    <option value="number">Number (সংখ্যা)</option>
                    <option value="date">Date (তারিখ)</option>
                    <option value="select">Select Dropdown (তালিকা)</option>
                    <option value="textarea">Textarea (বড় লেখা)</option>
                    <option value="email">Email (ইমেইল)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'প্লেসহোল্ডার' : 'Placeholder'}
                  </label>
                  <input
                    type="text"
                    placeholder="ইনপুট হিন্ট"
                    value={newFieldPlaceholder}
                    onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {newFieldType === 'select' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'ড্রপডাউন অপশনসমূহ (কমা দিয়ে আলাদা করুন)' : 'Options (comma-separated)'}
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ছাত্র, চাকরিজীবী, ব্যবসায়ী, গৃহিণী"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="new-field-req"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="new-field-req" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {lang === 'bn' ? 'বাধ্যতামূলক ফিল্ড (Required)' : 'Required Field'}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
              >
                যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFormBuilder;

