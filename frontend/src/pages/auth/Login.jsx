import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShoppingCart,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('admin@israfilbd.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(email, password);
      success('স্বাগতম! আপনি সফলভাবে সিস্টেমে লগইন করেছেন।');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড চেক করুন।';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-screen flex bg-slate-50 dark:bg-[#0F172A]">
      {/* Left Column: Premium Branding & Visual Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-900 p-12 text-white flex-col justify-between overflow-hidden">
        {/* Decorative Geometric Background Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              ISRAFIL BD SHOP
            </h1>
            <p className="text-xs text-indigo-200 font-medium">
              প্রিমিয়াম পিওএস ও পূর্ণাঙ্গ দোকান ব্যবস্থাপনা প্ল্যাটফর্ম
            </p>
          </div>
        </div>

        {/* Center Showcase Artwork & Features */}
        <div className="relative z-10 my-auto space-y-8 max-w-lg">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> পরবর্তী প্রজন্মের স্মার্ট রিটেল সলিউশন
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              স্মার্ট পয়েন্ট অব সেলস ও দ্রুততম শপ ম্যানেজমেন্ট
            </h2>
            <p className="text-indigo-100/90 text-sm leading-relaxed">
              বারকোড স্ক্যানার, তাৎক্ষণিক ইনভয়েস জেনারেশন, বহু-পদ্ধতির লেনদেন, স্বয়ংক্রিয় স্টক ট্র্যাকিং এবং বিশদ আর্থিক বিশ্লেষণের পূর্ণাঙ্গ নির্ভরযোগ্য প্ল্যাটফর্ম।
            </p>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <Zap className="w-5 h-5 text-amber-300 mb-2" />
              <div className="font-bold text-sm">তাত্ক্ষণিক পিওএস</div>
              <div className="text-xs text-indigo-200">ইউএসবি বারকোড স্ক্যানিং ও এক-ক্লিকে চেকআউট</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <BarChart3 className="w-5 h-5 text-emerald-300 mb-2" />
              <div className="font-bold text-sm">সঠিক মুনাফা ও ব্যয়</div>
              <div className="text-xs text-indigo-200">ক্রয়মূল্য ও বিক্রয়মূল্যের নির্ভুল লাভ-ক্ষতি</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <ShieldCheck className="w-5 h-5 text-cyan-300 mb-2" />
              <div className="font-bold text-sm">নিরাপদ ডেটাবেজ</div>
              <div className="text-xs text-indigo-200">লক-সুরক্ষিত কনকারেন্ট স্টক ও অডিট ট্রায়াল</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
              <CheckCircle2 className="w-5 h-5 text-indigo-300 mb-2" />
              <div className="font-bold text-sm">দ্বিভাষিক ইন্টারফেস</div>
              <div className="text-xs text-indigo-200">সম্পূর্ণ বাংলা ও ইংরেজি সাপোর্ট সহ ৳ মুদ্রা</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-indigo-200/80 pt-6 border-t border-white/10">
          <span>ভার্সন ২.০ • Israfil BD Commercial Suite</span>
          <span>সর্বস্বত্ব সংরক্ষিত © ২০২৬</span>
        </div>
      </div>

      {/* Right Column: Clean Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Brand Logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">ISRAFIL BD SHOP</h2>
              <p className="text-xs text-slate-500">প্রিমিয়াম পিওএস সিস্টেম</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              সিস্টেমে সাইন ইন করুন
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              আপনার ইউজার আইডি ও পাসওয়ার্ড ব্যবহার করে লগইন সম্পন্ন করুন।
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@israfilbd.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition shadow-subtle"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  পাসওয়ার্ড
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition shadow-subtle"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  লগইন তথ্য মনে রাখুন
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-md flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>নিরাপদ লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo User Fast Select Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              দ্রুত ডেমো লগইন নির্বাচন:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@israfilbd.com')}
                className="p-2 text-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800 text-xs transition"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">সুপার অ্যাডমিন</div>
                <div className="text-[10px] text-slate-400">admin@</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('manager@israfilbd.com')}
                className="p-2 text-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800 text-xs transition"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">ম্যানেজার</div>
                <div className="text-[10px] text-slate-400">manager@</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('cashier@israfilbd.com')}
                className="p-2 text-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800 text-xs transition"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">ক্যাশিয়ার (POS)</div>
                <div className="text-[10px] text-slate-400">cashier@</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
