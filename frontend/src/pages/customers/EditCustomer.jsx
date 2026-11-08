import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, UserCheck, Phone, Mail, MapPin, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { BackButton } from '../../components/common/BackButton';

export const EditCustomer = () => {
  const { id } = useParams();
  const { t, lang, formatCurrency } = useLanguage();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('10000');
  const [loyaltyPoints, setLoyaltyPoints] = useState('0');
  const [status, setStatus] = useState('active');
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers/${id}`);
      const c = res.data;
      setName(c.name || '');
      setNameBn(c.name_bn || '');
      setPhone(c.phone || '');
      setEmail(c.email || '');
      setAddress(c.address || '');
      setCreditLimit(c.credit_limit !== null ? String(c.credit_limit) : '10000');
      setLoyaltyPoints(c.loyalty_points !== null ? String(c.loyalty_points) : '0');
      setStatus(c.status || 'active');
      setCurrentBalance(Number(c.current_balance || 0));
    } catch (err) {
      error(lang === 'bn' ? 'গ্রাহকের তথ্য লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load customer details.');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      error(lang === 'bn' ? 'গ্রাহকের নাম আবশ্যক।' : 'Customer name is required.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 11 || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
      error(lang === 'bn' ? 'মোবাইল নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 017XXXXXXXX)। ১১ ডিজিটের বেশি গ্রহণযোগ্য নয়।' : 'Phone number must be exactly 11 digits (e.g. 017XXXXXXXX).');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/customers/${id}`, {
        name: name.trim(),
        name_bn: nameBn.trim() || null,
        phone: cleanPhone,
        email: email.trim() || null,
        address: address.trim() || null,
        credit_limit: creditLimit ? Number(creditLimit) : 0,
        loyalty_points: loyaltyPoints ? parseInt(loyaltyPoints, 10) : 0,
        status,
      });

      success(lang === 'bn' ? 'গ্রাহকের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Customer updated successfully!');
      navigate('/customers');
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'গ্রাহকের তথ্য আপডেট করতে ব্যর্থ হয়েছে।' : 'Failed to update customer.');
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">{lang === 'bn' ? 'গ্রাহকের তথ্য লোড হচ্ছে...' : 'Loading customer details...'}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton fallback="/customers" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lang === 'bn' ? 'গ্রাহকের তথ্য সম্পাদন' : 'Edit Customer'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                ID #{id}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'bn' ? 'গ্রাহকের নাম, ফোন, বাকির সীমা ও পয়েন্ট পরিবর্তন করুন' : 'Update customer profile, credit limit, and loyalty points'}
            </p>
          </div>
        </div>

        {/* Current Balance Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
          <span className="text-slate-500 font-medium">{lang === 'bn' ? 'বর্তমান বকেয়া:' : 'Current Due:'}</span>
          <span className={`font-mono font-black ${currentBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(currentBalance)}
          </span>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Name (English / Primary) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang === 'bn' ? 'গ্রাহকের নাম *' : 'Customer Name *'}</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Md. Rafiqul Islam"
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
            />
          </div>

          {/* 2. Bengali Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'বাংলা নাম (ঐচ্ছিক)' : 'Bangla Name (Optional)'}
            </label>
            <input
              type="text"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              placeholder="যেমন: মোঃ রফিকুল ইসলাম"
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          {/* 3. Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}</span>
            </label>
            <input
              type="tel"
              required
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
              placeholder="017xxxxxxxx"
              className="w-full py-2.5 px-3.5 text-sm font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          {/* 4. Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>{lang === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@email.com"
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-mono"
            />
          </div>

          {/* 5. Credit Limit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-violet-500" />
              <span>{lang === 'bn' ? 'সর্বোচ্চ বাকির সীমা (Credit Limit ৳)' : 'Credit Limit (৳)'}</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          {/* 6. Loyalty Points */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'bn' ? 'লয়ালটি পয়েন্ট (Loyalty Points pt)' : 'Loyalty Points (pt)'}</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                value={loyaltyPoints}
                onChange={(e) => setLoyaltyPoints(e.target.value)}
                className="w-full py-2.5 px-3.5 text-sm font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              <span className="absolute right-3 top-2.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                ৳{(Number(loyaltyPoints || 0) * 0.75).toFixed(0)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn' ? '১০০ পয়েন্ট = ৭৫ টাকা ডিসকাউন্ট' : '100 points = 75 BDT discount'}
            </p>
          </div>

          {/* 7. Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'স্ট্যাটাস (Status)' : 'Status'}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-bold"
            >
              <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
              <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
            </select>
          </div>

          {/* 8. Address */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{lang === 'bn' ? 'ঠিকানা (Address)' : 'Address'}</span>
            </label>
            <textarea
              rows="2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={lang === 'bn' ? 'গ্রাহকের ঠিকানা ও অবস্থান...' : 'Customer address...'}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Link
            to="/customers"
            className="py-2.5 px-5 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2.5 px-6 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? (lang === 'bn' ? 'আপডেট হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'আপডেট করুন' : 'Update Customer')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default EditCustomer;

