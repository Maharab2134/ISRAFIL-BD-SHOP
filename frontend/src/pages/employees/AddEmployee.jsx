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
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  Calendar,
  Fingerprint,
  Sparkles,
  RefreshCw,
  MapPin,
  Heart,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export default function AddEmployee() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { success, error } = useToast();

  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    employee_id: '',
    department_id: '',
    designation_id: '',
    branch_id: '',
    reporting_manager_id: '',
    employment_type: 'full_time',
    joining_date: new Date().toISOString().split('T')[0],
    role_id: '',
    status: 'active',
    password: '',
    father_name: '',
    mother_name: '',
    dob: '',
    gender: 'male',
    present_address: '',
    permanent_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    salary: '',
  });

  // Auto Generate Random Password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password: pass }));
    setShowPassword(true);
  };

  // Generate random Employee ID
  const handleAutoGenerateId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setForm((prev) => ({ ...prev, employee_id: `EMP-${randomNum}` }));
  };

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [rolesRes, branchesRes, deptsRes, desigsRes, empsRes] = await Promise.all([
          api.get('/roles').catch(() => api.get('/employees/roles')),
          api.get('/branches').catch(() => ({ data: [] })),
          api.get('/departments').catch(() => ({ data: [] })),
          api.get('/designations').catch(() => ({ data: [] })),
          api.get('/employees?per_page=100').catch(() => ({ data: { data: [] } })),
        ]);

        const loadedRoles = rolesRes.data || [];
        const loadedBranches = branchesRes.data || [];
        const loadedDepts = deptsRes.data || [];
        const loadedDesigs = desigsRes.data || [];
        const loadedEmps = empsRes.data?.data || empsRes.data || [];

        setRoles(loadedRoles);
        setBranches(loadedBranches);
        setDepartments(loadedDepts);
        setDesignations(loadedDesigs);
        setManagers(loadedEmps);

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
            if (!prev.department_id && loadedDepts.length > 0) {
              updates.department_id = loadedDepts[0].id;
            }
            if (!prev.employee_id) {
              updates.employee_id = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
            }
            if (!prev.password) {
              updates.password = 'password123';
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
            department_id: emp.department_id || (emp.department_relation ? emp.department_relation.id : ''),
            designation_id: emp.designation_id || (emp.designation_relation ? emp.designation_relation.id : ''),
            branch_id: emp.branch_id || (emp.branch ? emp.branch.id : ''),
            reporting_manager_id: emp.reporting_manager_id || '',
            employment_type: emp.employment_type || 'full_time',
            joining_date: emp.joining_date ? emp.joining_date.split('T')[0] : '',
            role_id: emp.role_id || '',
            status: emp.status || 'active',
            password: '', // blank on edit
            father_name: emp.father_name || '',
            mother_name: emp.mother_name || '',
            dob: emp.dob ? emp.dob.split('T')[0] : '',
            gender: emp.gender || 'male',
            present_address: emp.present_address || '',
            permanent_address: emp.permanent_address || '',
            emergency_contact_name: emp.emergency_contact_name || '',
            emergency_contact_phone: emp.emergency_contact_phone || '',
            emergency_contact_relation: emp.emergency_contact_relation || '',
            salary: emp.salary ? String(emp.salary) : '',
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

  // Clean and filter mobile numbers
  const handlePhoneChange = (field, val) => {
    const digitsOnly = val.replace(/[^0-9]/g, '').slice(0, 11);
    setForm((prev) => ({ ...prev, [field]: digitsOnly }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Rule 2: Strictly enforce 11 digits for mobile number
    if (form.phone && form.phone.trim()) {
      const cleanPhone = form.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length !== 11 || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
        error(
          lang === 'bn'
            ? 'মোবাইল নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 017XXXXXXXX)। ১১ ডিজিটের বেশি বা কম কোনোভাবেই সমর্থন করবে না।'
            : 'Mobile number must be exactly 11 digits (e.g. 017XXXXXXXX).'
        );
        return;
      }
    }

    if (form.emergency_contact_phone && form.emergency_contact_phone.trim()) {
      const cleanEmerg = form.emergency_contact_phone.replace(/[^0-9]/g, '');
      if (cleanEmerg.length !== 11 || !/^01[3-9]\d{8}$/.test(cleanEmerg)) {
        error(
          lang === 'bn'
            ? 'জরুরি যোগাযোগের ফোন নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 01XXXXXXXXX)।'
            : 'Emergency contact phone number must be exactly 11 digits.'
        );
        return;
      }
    }

    setLoading(true);

    try {
      const cleanPayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone ? form.phone.replace(/[^0-9]/g, '').slice(0, 11) : null,
        employee_id: form.employee_id ? form.employee_id.trim() : null,
        role_id: Number(form.role_id),
        branch_id: form.branch_id ? Number(form.branch_id) : null,
        department_id: form.department_id ? Number(form.department_id) : null,
        designation_id: form.designation_id ? Number(form.designation_id) : null,
        reporting_manager_id: form.reporting_manager_id ? Number(form.reporting_manager_id) : null,
        employment_type: form.employment_type || 'full_time',
        status: form.status || 'active',
        joining_date: form.joining_date || null,
        father_name: form.father_name?.trim() || null,
        mother_name: form.mother_name?.trim() || null,
        dob: form.dob || null,
        gender: form.gender || 'male',
        present_address: form.present_address?.trim() || null,
        permanent_address: form.permanent_address?.trim() || null,
        emergency_contact_name: form.emergency_contact_name?.trim() || null,
        emergency_contact_phone: form.emergency_contact_phone ? form.emergency_contact_phone.replace(/[^0-9]/g, '').slice(0, 11) : null,
        emergency_contact_relation: form.emergency_contact_relation?.trim() || null,
        salary: form.salary ? Number(form.salary) : null,
      };

      if (!isEdit || form.password) {
        cleanPayload.password = form.password;
      }

      if (isEdit) {
        const res = await api.put(`/employees/${id}`, cleanPayload);
        success(res.data.message || (lang === 'bn' ? 'কর্মীর তথ্য সফলভাবে আপডেট হয়েছে।' : 'Employee updated successfully.'));
      } else {
        const res = await api.post('/employees', cleanPayload);
        success(res.data.message || (lang === 'bn' ? 'নতুন কর্মী সফলভাবে যুক্ত হয়েছে।' : 'New employee registered successfully.'));
      }
      navigate('/employees');
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'কর্মী সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save employee.');
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Filter designations for selected department
  const filteredDesignations = designations.filter((d) => {
    if (!form.department_id) return true;
    return String(d.department_id) === String(form.department_id);
  });

  if (initialLoading) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton fallback="/employees" />
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-indigo-600" />
              <span>
                {isEdit
                  ? lang === 'bn'
                    ? 'কর্মীর তথ্য সম্পাদন (Edit Profile)'
                    : 'Edit Employee Profile'
                  : lang === 'bn'
                  ? 'নতুন কর্মী নিবন্ধন (Register Employee)'
                  : 'Register New Enterprise Employee'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'সুপার শপের পেশাদার মানবসম্পদ, বিভাগীয় কাঠামো ও নিরাপত্তা অ্যাক্সেস কনফিগারেশন'
                : 'Enterprise HR onboarding with department, designation, branch isolation, and RBAC roles'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? '১. ব্যক্তিগত তথ্য (Personal Information)' : '1. Personal Information'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'কর্মীর নাম, জাতীয় পরিচয় ও যোগাযোগের বিশদ বিবরণ' : 'Basic identity, addresses, and family contact details'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'কর্মীর পুরো নাম *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Tanvir Ahamed"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Mobile Number (Rule 2: Max 11 digits) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Mobile Number (11 Digits) *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={form.phone}
                  onChange={(e) => handlePhoneChange('phone', e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === 'bn' ? '১১ ডিজিটের বেশি বা কম গ্রহণযোগ্য নয়' : 'Exactly 11 digits BD format'}
              </p>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="employee@israfilbd.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? "পিতার নাম (ঐচ্ছিক)" : "Father's Name (Optional)"}
              </label>
              <input
                type="text"
                value={form.father_name}
                onChange={(e) => setForm({ ...form, father_name: e.target.value })}
                placeholder="Father's full name"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Mother's Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? "মাতার নাম (ঐচ্ছিক)" : "Mother's Name (Optional)"}
              </label>
              <input
                type="text"
                value={form.mother_name}
                onChange={(e) => setForm({ ...form, mother_name: e.target.value })}
                placeholder="Mother's full name"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'লিঙ্গ' : 'Gender'}
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="male">{lang === 'bn' ? 'পুরুষ' : 'Male'}</option>
                  <option value="female">{lang === 'bn' ? 'মহিলা' : 'Female'}</option>
                  <option value="other">{lang === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'বর্তমান ঠিকানা (Present Address)' : 'Present Address'}
              </label>
              <textarea
                rows={2}
                value={form.present_address}
                onChange={(e) => setForm({ ...form, present_address: e.target.value })}
                placeholder="House, Road, Area, Police Station..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'স্থায়ী ঠিকানা (Permanent Address)' : 'Permanent Address'}
              </label>
              <textarea
                rows={2}
                value={form.permanent_address}
                onChange={(e) => setForm({ ...form, permanent_address: e.target.value })}
                placeholder="Village, Post, Thana, District..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{lang === 'bn' ? 'জরুরি যোগাযোগের তথ্য (Emergency Contact)' : 'Emergency Contact Details'}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {lang === 'bn' ? 'যোগাযোগকারীর নাম' : 'Contact Person Name'}
                </label>
                <input
                  type="text"
                  value={form.emergency_contact_name}
                  onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                  placeholder="e.g. Md. Kabir Hossain"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {lang === 'bn' ? 'ফোন নম্বর (১১ ডিজিট)' : 'Phone (11 Digits)'}
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  value={form.emergency_contact_phone}
                  onChange={(e) => handlePhoneChange('emergency_contact_phone', e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {lang === 'bn' ? 'সম্পর্ক (Relation)' : 'Relationship'}
                </label>
                <input
                  type="text"
                  value={form.emergency_contact_relation}
                  onChange={(e) => setForm({ ...form, emergency_contact_relation: e.target.value })}
                  placeholder="e.g. Brother / Father / Spouse"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Professional & Department Information */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? '২. পেশাগত ও বিভাগীয় তথ্য (Professional Information)' : '2. Professional & Department Information'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'বিভাগ, পদবী, রিপোর্টিং ম্যানেজার ও শাখা নির্ধারণ' : 'Department, designation, supervisor hierarchy, and outlet isolation'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'বিভাগ (Department) *' : 'Department *'}
              </label>
              <select
                required
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value, designation_id: '' })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">{lang === 'bn' ? '-- বিভাগ নির্বাচন করুন --' : '-- Select Department --'}</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'পদবী (Designation)' : 'Designation'}
              </label>
              <select
                value={form.designation_id}
                onChange={(e) => setForm({ ...form, designation_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">{lang === 'bn' ? '-- পদবী নির্বাচন করুন --' : '-- Select Designation --'}</option>
                {filteredDesignations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'চাকরির ধরন (Employment Type) *' : 'Employment Type *'}
              </label>
              <select
                required
                value={form.employment_type}
                onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="full_time">{lang === 'bn' ? 'ফুল টাইম (Full Time)' : 'Full Time'}</option>
                <option value="part_time">{lang === 'bn' ? 'পার্ট টাইম (Part Time)' : 'Part Time'}</option>
                <option value="contract">{lang === 'bn' ? 'চুক্তিভিত্তিক (Contractual)' : 'Contract'}</option>
                <option value="probation">{lang === 'bn' ? 'শিক্ষানবিশ (Probation)' : 'Probation'}</option>
                <option value="temporary">{lang === 'bn' ? 'অস্থায়ী (Temporary)' : 'Temporary'}</option>
              </select>
            </div>

            {/* Assigned Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'কর্মক্ষেত্র শাখা (Branch) *' : 'Assigned Branch *'}
              </label>
              <select
                required
                value={form.branch_id}
                onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">{lang === 'bn' ? '-- শাখা নির্বাচন করুন --' : '-- Select Branch --'}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned RBAC Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'সিস্টেম ভূমিকা (Assigned Role) *' : 'Assigned RBAC Role *'}
              </label>
              <select
                required
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">{lang === 'bn' ? '-- রোল নির্বাচন করুন --' : '-- Select Role --'}</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Reporting Manager */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'রিপোর্টিং ম্যানেজার (Supervisor)' : 'Reporting Manager'}
              </label>
              <select
                value={form.reporting_manager_id}
                onChange={(e) => setForm({ ...form, reporting_manager_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">{lang === 'bn' ? 'কোনো সুপারভাইজার নেই (Top Level)' : 'None (Top Level)'}</option>
                {managers
                  .filter((m) => !isEdit || String(m.id) !== String(id))
                  .map((mgr) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.name} ({mgr.employee_id || mgr.email})
                    </option>
                  ))}
              </select>
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'যোগদানের তারিখ (Joining Date)' : 'Joining Date'}
              </label>
              <input
                type="date"
                value={form.joining_date}
                onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Monthly Salary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'মাসিক মূল বেতন (Monthly Salary ৳)' : 'Monthly Basic Salary (৳)'}
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="25000"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'কর্মী স্ট্যাটাস (Status) *' : 'Employee Status *'}
              </label>
              <select
                required
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
                <option value="on_leave">{lang === 'bn' ? 'ছুটিতে (On Leave)' : 'On Leave'}</option>
                <option value="suspended">{lang === 'bn' ? 'বরখাস্ত (Suspended)' : 'Suspended'}</option>
                <option value="resigned">{lang === 'bn' ? 'পদত্যাগকৃত (Resigned)' : 'Resigned'}</option>
                <option value="terminated">{lang === 'bn' ? 'চাকরিচ্যুত (Terminated)' : 'Terminated'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Account & Login Credentials */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? '৩. সিস্টেমে লগইন এক্সেস (Login Credentials)' : '3. Login Access & Security Credentials'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'সফটওয়্যার ব্যবহারের পাসওয়ার্ড ও কর্মী আইডি' : 'System credentials and authentication controls'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
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
                <Fingerprint className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value.toUpperCase() })}
                  placeholder="EMP-1005"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'লগইন পাসওয়ার্ড' : 'Login Password'}{' '}
                  {isEdit ? (
                    <span className="text-slate-400 text-[10px] font-normal">
                      ({lang === 'bn' ? 'পরিবর্তন না করতে চাইলে ফাঁকা রাখুন' : 'leave blank to keep current'})
                    </span>
                  ) : (
                    '*'
                  )}
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'স্ট্রং পাসওয়ার্ড জেনারেট' : 'Generate Password'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!isEdit}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={isEdit ? '••••••••' : 'Min 6 characters'}
                  className="w-full pl-9 pr-10 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/employees"
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
          >
            {lang === 'bn' ? 'বাতিল করুন' : 'Cancel'}
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>
              {isEdit
                ? lang === 'bn'
                  ? 'আপডেট সংরক্ষণ করুন'
                  : 'Save Changes'
                : lang === 'bn'
                ? 'কর্মী একাউন্ট তৈরি করুন'
                : 'Create Employee Account'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
