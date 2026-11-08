import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { BackButton } from '../../components/common/BackButton';
import {
  UserPlus,
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AddEmployee() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { success, error } = useToast();

  const [roles, setRoles] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_roles_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: '',
    status: 'active',
    password: '',
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        let res;
        try {
          res = await api.get('/roles');
        } catch (e) {
          res = await api.get('/employees/roles');
        }
        const loadedRoles = res.data || [];
        setRoles(loadedRoles);
        try {
          sessionStorage.setItem('israfil_roles_cache', JSON.stringify(loadedRoles));
        } catch (e) {}

        if (!isEdit && loadedRoles.length > 0) {
          setForm((prev) => {
            if (prev.role_id) return prev;
            const cashierRole = loadedRoles.find((r) => r.slug === 'cashier') || loadedRoles[0];
            return { ...prev, role_id: cashierRole.id };
          });
        }
      } catch (err) {
        error(lang === 'bn' ? 'রোল লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load roles.');
      }
    };

    fetchRoles();
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      const fetchEmployee = async () => {
        try {
          const res = await api.get(`/employees/${id}`);
          const emp = res.data;
          setForm({
            name: emp.name,
            email: emp.email,
            phone: emp.phone || '',
            role_id: emp.role_id,
            status: emp.status,
            password: '', // blank on edit
          });
        } catch (err) {
          error(lang === 'bn' ? 'কর্মীর তথ্য লোড করতে সমস্যা হয়েছে।' : 'Failed to load employee details.');
          navigate('/employees');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchEmployee();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.phone && form.phone.trim()) {
      const cleanPhone = form.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length !== 11 || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
        error(lang === 'bn' ? 'মোবাইল নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 017XXXXXXXX)। ১১ ডিজিটের বেশি বা কম গ্রহণযোগ্য নয়।' : 'Phone number must be exactly 11 digits (e.g. 017XXXXXXXX).');
        return;
      }
    }

    setLoading(true);

    try {
      const cleanPayload = {
        ...form,
        phone: form.phone ? form.phone.replace(/[^0-9]/g, '').slice(0, 11) : null,
      };

      if (isEdit) {
        if (!cleanPayload.password) delete cleanPayload.password;
        const res = await api.put(`/employees/${id}`, cleanPayload);
        success(res.data.message || (lang === 'bn' ? 'কর্মীর তথ্য আপডেট হয়েছে।' : 'Employee updated.'));
      } else {
        const res = await api.post('/employees', cleanPayload);
        success(res.data.message || (lang === 'bn' ? 'নতুন কর্মী যুক্ত করা হয়েছে।' : 'Employee added.'));
      }
      navigate('/employees');
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save.');
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton fallback="/employees" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-indigo-600" />
              {isEdit
                ? (lang === 'bn' ? 'কর্মীর তথ্য সম্পাদন' : 'Edit Employee')
                : (lang === 'bn' ? 'নতুন কর্মী যুক্ত করুন' : 'Add New Employee')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'সিস্টেমে লগইন ও কাজ করার জন্য কর্মীর পূর্ণ বিবরণ ও পদবী নির্ধারণ করুন'
                : 'Set credentials and access role for store personnel'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'কর্মীর পুরো নাম' : 'Full Name'} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ সাইফুল ইসলাম' : 'e.g. John Doe'}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'ইমেইল অ্যাড্রেস (লগইন ইউজারনেম)' : 'Email Address'} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="staff@israfilbd.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                maxLength={11}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 11) })}
                placeholder="017XXXXXXXX"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'পদবী / রোল' : 'Role'} *
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                required
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {roles.length === 0 ? (
                  <option value="">{lang === 'bn' ? 'রোল লোড হচ্ছে...' : 'Loading roles...'}</option>
                ) : (
                  roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {lang === 'bn' ? r.name_bn || r.name : r.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('status')} *
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
          </div>

          {/* Password */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {isEdit
                ? (lang === 'bn' ? 'নতুন পাসওয়ার্ড (পরিবর্তন না করতে চাইলে ফাঁকা রাখুন)' : 'New Password (leave blank to keep current)')
                : (lang === 'bn' ? 'লগইন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min. 6 characters)') + ' *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required={!isEdit}
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Link
            to="/employees"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? t('loading') : t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}

