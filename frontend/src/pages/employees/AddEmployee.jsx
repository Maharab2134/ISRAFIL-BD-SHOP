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
  AlertCircle,
  Building2,
  Briefcase,
  Calendar,
  Fingerprint,
  Sparkles,
  RefreshCw,
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
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    employee_id: '',
    department: 'Retail Operations',
    designation: '',
    branch_id: '',
    joining_date: new Date().toISOString().split('T')[0],
    role_id: '',
    status: 'active',
    password: '',
  });

  // Generate random Employee ID
  const handleAutoGenerateId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setForm((prev) => ({ ...prev, employee_id: `EMP-${randomNum}` }));
  };

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [rolesRes, branchesRes] = await Promise.all([
          api.get('/roles').catch(() => api.get('/employees/roles')),
          api.get('/branches').catch(() => ({ data: [] })),
        ]);

        const loadedRoles = rolesRes.data || [];
        const loadedBranches = branchesRes.data || [];
        setRoles(loadedRoles);
        setBranches(loadedBranches);

        try {
          sessionStorage.setItem('israfil_roles_cache', JSON.stringify(loadedRoles));
        } catch (e) {}

        if (!isEdit) {
          setForm((prev) => {
            const updates = { ...prev };
            if (!prev.role_id && loadedRoles.length > 0) {
              const cashierRole = loadedRoles.find((r) => r.slug === 'cashier') || loadedRoles[0];
              updates.role_id = cashierRole.id;
            }
            if (!prev.branch_id && loadedBranches.length > 0) {
              const mainBranch = loadedBranches.find((b) => b.is_main) || loadedBranches[0];
              updates.branch_id = mainBranch.id;
            }
            if (!prev.employee_id) {
              updates.employee_id = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
            }
            return updates;
          });
        }
      } catch (err) {
        error(lang === 'bn' ? 'ডাটা লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load initial data.');
      }
    };

    fetchPrerequisites();
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      const fetchEmployee = async () => {
        try {
          const res = await api.get(`/employees/${id}`);
          const emp = res.data;
          setForm({
            name: emp.name || '',
            email: emp.email || '',
            phone: emp.phone || '',
            employee_id: emp.employee_id || '',
            department: emp.department || 'Retail Operations',
            designation: emp.designation || '',
            branch_id: emp.branch_id || (emp.branch ? emp.branch.id : ''),
            joining_date: emp.joining_date ? emp.joining_date.split('T')[0] : '',
            role_id: emp.role_id || '',
            status: emp.status || 'active',
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

    // Rule 2: Strictly enforce max 11 digits
    if (form.phone && form.phone.trim()) {
      const cleanPhone = form.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length !== 11 || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
        error(
          lang === 'bn'
            ? 'মোবাইল নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 017XXXXXXXX)। ১১ ডিজিটের বেশি বা কম গ্রহণযোগ্য নয়।'
            : 'Phone number must be exactly 11 digits (e.g. 017XXXXXXXX).'
        );
        return;
      }
    }

    setLoading(true);

    try {
      const cleanPayload = {
        ...form,
        phone: form.phone ? form.phone.replace(/[^0-9]/g, '').slice(0, 11) : null,
        branch_id: form.branch_id ? Number(form.branch_id) : null,
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
      <div className="p-16 text-center text-slate-400 space-y-3 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold">{t('loading')}</p>
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
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-indigo-600" />
              <span>
                {isEdit
                  ? (lang === 'bn' ? 'কর্মীর তথ্য সম্পাদন' : 'Edit Employee Profile')
                  : (lang === 'bn' ? 'নতুন কর্মী যুক্ত করুন' : 'Add New Enterprise Employee')}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'সুপার শপে কর্মীদের পদবী, আইডি, শাখা অ্যাসাইনমেন্ট ও অ্যাক্সেস পারমিশন রোল নির্ধারণ করুন'
                : 'Configure departmental designations, branch isolation, credentials, and RBAC roles'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Full Name */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Employee ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'কর্মী আইডি (Employee ID)' : 'Employee ID'}
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateId}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{lang === 'bn' ? 'অটো জেনারেট' : 'Auto Generate'}</span>
              </button>
            </div>
            <div className="relative">
              <Fingerprint className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value.toUpperCase() })}
                placeholder="EMP-1005"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'ইমেইল অ্যাড্রেস (লগইন ইউজারনেম)' : 'Email Address (Login)'} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="staff@israfilbd.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Phone (Rule 2: max 11 digits) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'মোবাইল নম্বর (ঠিক ১১ ডিজিট)' : 'Phone Number (11 Digits)'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                maxLength={11}
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 11),
                  })
                }
                placeholder="017XXXXXXXX"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'বিভাগ (Department)' : 'Department'}
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Retail Operations">Retail Operations</option>
                <option value="Front Desk & Cash">Front Desk & Cash</option>
                <option value="Administration">Administration</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Inventory & Supply Chain">Inventory & Supply Chain</option>
                <option value="Procurement">Procurement</option>
                <option value="Customer Experience">Customer Experience</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Internal Audit & Compliance">Internal Audit & Compliance</option>
                <option value="Executive Board">Executive Board</option>
              </select>
            </div>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'পদবী (Designation)' : 'Designation'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder={lang === 'bn' ? 'যেমন: হেড ক্যাশিয়ার, পারচেজ স্পেশালিস্ট' : 'e.g. Senior Accountant, Head Cashier'}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'ভূমিকা / রোল (RBAC Role)' : 'Assigned Role'} *
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                required
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                {roles.length === 0 ? (
                  <option value="">{lang === 'bn' ? 'রোল লোড হচ্ছে...' : 'Loading roles...'}</option>
                ) : (
                  roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {lang === 'bn' ? (r.name_bn || r.name) : r.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Branch Assignment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'নিযুক্ত শাখা (Branch Assignment)' : 'Assigned Branch'}
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={form.branch_id}
                onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="">{lang === 'bn' ? 'কোনো শাখা নেই / সাধারণ' : 'None / Central HQ'}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {lang === 'bn' ? (b.name_bn || b.name) : b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'bn' ? 'যোগদানের তারিখ (Joining Date)' : 'Joining Date'}
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={form.joining_date}
                onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('status')} *
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
          </div>

          {/* Password */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Link
            to="/employees"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{loading ? t('loading') : t('save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
