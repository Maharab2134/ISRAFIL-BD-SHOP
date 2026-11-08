import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  Mail,
  MapPin,
  Calendar,
  Gift,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import axios from 'axios';

export const PublicCustomerRegister = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formConfig, setFormConfig] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [formData, setFormData] = useState({});
  const [customData, setCustomData] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Read backend base URL from env
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await axios.get(`${apiUrl}/customer-registration/form`);
      if (res.data?.status === 'success') {
        setFormConfig(res.data.form);
        setShopInfo(res.data.shop);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('ফর্ম লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId, value, isCustom = false) => {
    if (isCustom) {
      setCustomData((prev) => ({ ...prev, [fieldId]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [fieldId]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate phone number
    const phone = (formData.phone || '').trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        phone: cleanPhone,
        custom_data: customData,
      };

      const res = await axios.post(`${apiUrl}/customer-registration/submit`, payload);

      if (res.data?.status === 'success' || res.data?.status === 'already_registered' || res.data?.status === 'already_pending') {
        setSuccessData(res.data);
      } else {
        setErrorMsg(res.data?.message || 'আবেদন প্রক্রিয়া করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'আবেদন সম্পন্ন হতে ব্যর্থ হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setCustomData({});
    setSuccessData(null);
    setErrorMsg(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-100 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center animate-spin mb-4">
            <RefreshCw className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">ফর্ম লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Active fields from form builder
  const activeFields = (formConfig?.fields || []).filter((f) => f.enabled !== false);
  const themeColor = formConfig?.theme_color || '#4F46E5';
  const welcomePoints = formConfig?.welcome_points || 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 py-6 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-lg">
        {/* Header Branding Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-100 p-6 sm:p-8 overflow-hidden relative mb-4">
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{ backgroundColor: themeColor }}
          />

          <div className="flex flex-col items-center text-center">
            {shopInfo?.shop_logo ? (
              <img
                src={shopInfo.shop_logo}
                alt={shopInfo.shop_name}
                className="w-16 h-16 rounded-2xl object-cover shadow-md mb-3 border border-slate-100"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-lg mb-3"
                style={{ backgroundColor: themeColor }}
              >
                <ShoppingBag className="w-8 h-8" />
              </div>
            )}

            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
              {shopInfo?.shop_name || 'ISRAFIL BD SHOP'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {formConfig?.title || 'গ্রাহক মেম্বারশিপ রেজিস্ট্রেশন'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm">
              {formConfig?.description || 'আমাদের মেম্বারশিপ প্রোগ্রামে যুক্ত হোন এবং বিশেষ ছাড় উপভোগ করুন!'}
            </p>

            {/* Welcome Loyalty Bonus Badge */}
            {welcomePoints > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
                <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  রেজিস্ট্রেশন করলেই পাচ্ছেন <strong className="text-amber-700 font-black">{welcomePoints} বোনাস লয়্যালটি পয়েন্ট</strong>!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area: Success State or Registration Form */}
        {successData ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-100 p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-xl font-black text-slate-900">
              {successData.status === 'already_registered'
                ? 'ইতিমধ্যে নিবন্ধিত সদস্য!'
                : successData.status === 'already_pending'
                ? 'আবেদন প্রক্রিয়াধীন আছে!'
                : 'অভিনন্দন! আবেদন সম্পন্ন হয়েছে'}
            </h2>

            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {successData.message}
            </p>

            {successData.request_number && (
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 inline-block text-left w-full max-w-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  আবেদন নম্বর / Request ID
                </div>
                <div className="text-lg font-black text-indigo-600 font-mono mt-0.5">
                  {successData.request_number}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 font-medium text-left space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>পরবর্তী কেনাকাটায় ক্যাশ কাউন্টারে শুধু আপনার মোবাইল নম্বর বললেই মেম্বারশিপ সুবিধা পাবেন।</span>
              </div>
              <div className="flex items-start gap-2">
                <Gift className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>প্রতিটি কেনাকাটায় সংগৃহীত পয়েন্ট দিয়ে ভবিষ্যতে সরাসরি ক্যাশ ডিসকাউন্ট নেওয়া যাবে!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="mt-6 w-full py-3 px-4 rounded-2xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>আরেকটি সদস্যপদ নিবন্ধন করুন</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-100 p-6 sm:p-8 space-y-4"
          >
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Dynamic Form Fields */}
            {activeFields.map((field) => {
              const isCustom = !['name', 'phone', 'email', 'address', 'dob', 'gender', 'nid', 'notes'].includes(field.id);
              const val = isCustom ? customData[field.id] || '' : formData[field.id] || '';

              return (
                <div key={field.id} className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    {field.label_bn || field.label}
                    {field.required && <span className="text-rose-500 ml-1">*</span>}
                  </label>

                  {/* Render based on field type */}
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={2}
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      value={val}
                      onChange={(e) => handleInputChange(field.id, e.target.value, isCustom)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 transition outline-hidden"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={val}
                      onChange={(e) => handleInputChange(field.id, e.target.value, isCustom)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 transition outline-hidden bg-white"
                    >
                      <option value="">{field.placeholder || 'নির্বাচন করুন...'}</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                        required={field.required}
                        placeholder={field.placeholder || ''}
                        value={val}
                        onChange={(e) => handleInputChange(field.id, e.target.value, isCustom)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 transition outline-hidden ${
                          field.id === 'phone' ? 'font-mono' : ''
                        }`}
                      />
                      {field.id === 'phone' && (
                        <div className="absolute right-3 top-2.5 text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Terms confirmation */}
            <div className="pt-2 text-center text-[11px] text-slate-400">
              রেজিস্ট্রেশন বাটনে ক্লিক করে আপনি ইসরাফিল বিডি শপের মেম্বারশিপ পলিসির সাথে সম্মতি জানাচ্ছেন।
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: themeColor }}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white shadow-lg shadow-indigo-600/20 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>আবেদন পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>মেম্বারশিপের জন্য আবেদন জমা দিন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {shopInfo?.shop_name || 'ISRAFIL BD SHOP'}. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default PublicCustomerRegister;

