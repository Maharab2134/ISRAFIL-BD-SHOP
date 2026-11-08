import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { BackButton } from '../../components/common/BackButton';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Shield,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Edit,
  FileText,
  Activity,
  UserCheck,
  Key,
  Upload,
  Trash2,
  Download,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Printer,
  Eye,
  Check,
  X,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang, formatNumber, formatCurrency } = useLanguage();
  const { success, error } = useToast();
  const { user: currentUser, hasPermission } = useAuth();
  const isSuperAdmin = currentUser?.role?.slug === 'super-admin' || currentUser?.email === 'admin@israfilbd.com';

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, job, access, attendance, activity, documents

  // Attendance Tab State
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceData, setAttendanceData] = useState({ summary: {}, records: [] });
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Transfer Branch State (Inline, NO-MODAL)
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferForm, setTransferForm] = useState({
    to_branch_id: '',
    to_department_id: '',
    transfer_date: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  // Document Upload State (Inline, NO-MODAL)
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    document_type: 'appointment_letter',
    file_url: '',
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Reset Password State (Inline, NO-MODAL)
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  // Inline Status Change State
  const [statusChangeValue, setStatusChangeValue] = useState('');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/employees/${id}`);
      setEmployee(res.data);
      setStatusChangeValue(res.data.status);
    } catch (err) {
      error(lang === 'bn' ? 'কর্মীর তথ্য লোড করতে সমস্যা হয়েছে।' : 'Failed to load employee details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (month = attendanceMonth) => {
    try {
      setLoadingAttendance(true);
      const res = await api.get(`/employees/${id}/attendance`, { params: { month } });
      setAttendanceData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchPrerequisites = async () => {
    try {
      const [brRes, dpRes] = await Promise.all([
        api.get('/branches').catch(() => ({ data: [] })),
        api.get('/departments').catch(() => ({ data: [] })),
      ]);
      setBranches(brRes.data || []);
      setDepartments(dpRes.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchEmployee();
    fetchPrerequisites();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendance(attendanceMonth);
    }
  }, [activeTab, attendanceMonth]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusChangeValue || statusChangeValue === employee.status) return;
    try {
      setUpdatingStatus(true);
      await api.patch(`/employees/${id}/status`, {
        status: statusChangeValue,
        reason: statusChangeReason,
      });
      success(lang === 'bn' ? 'স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।' : 'Status updated successfully.');
      setStatusChangeReason('');
      fetchEmployee();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে।' : 'Failed to change status.'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingTransfer(true);
      await api.post(`/employees/${id}/transfer`, transferForm);
      success(lang === 'bn' ? 'কর্মী সফলভাবে স্থানান্তরিত হয়েছেন।' : 'Employee transferred successfully.');
      setShowTransferForm(false);
      setTransferForm({
        to_branch_id: '',
        to_department_id: '',
        transfer_date: new Date().toISOString().split('T')[0],
        reason: '',
      });
      fetchEmployee();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'স্থানান্তর ব্যর্থ হয়েছে।' : 'Transfer failed.'));
    } finally {
      setSubmittingTransfer(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      error(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }
    try {
      setResettingPassword(true);
      await api.post(`/employees/${id}/reset-password`, { password: newPassword });
      success(lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে।' : 'Password reset successfully.');
      setShowPasswordForm(false);
      setNewPassword('');
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।' : 'Failed to reset password.'));
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!docForm.title) {
      error(lang === 'bn' ? 'নথির শিরোনাম লিখুন।' : 'Please enter document title.');
      return;
    }
    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('title', docForm.title);
      formData.append('document_type', docForm.document_type);
      if (docForm.notes) formData.append('notes', docForm.notes);
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (docForm.file_url) {
        formData.append('file_url', docForm.file_url);
      } else {
        error(lang === 'bn' ? 'অনুগ্রহ করে ফাইল বাছাই করুন।' : 'Please choose a file or URL.');
        setUploadingDoc(false);
        return;
      }

      await api.post(`/employees/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      success(lang === 'bn' ? 'নথি সফলভাবে আপলোড হয়েছে।' : 'Document uploaded successfully.');
      setShowDocForm(false);
      setSelectedFile(null);
      setDocForm({ title: '', document_type: 'appointment_letter', file_url: '', notes: '' });
      fetchEmployee();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'নথি আপলোড ব্যর্থ হয়েছে।' : 'Failed to upload document.'));
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await api.delete(`/employees/${id}/documents/${docId}`);
      success(lang === 'bn' ? 'নথি মুছে ফেলা হয়েছে।' : 'Document deleted.');
      fetchEmployee();
    } catch (err) {
      error(lang === 'bn' ? 'নথি মুছতে ব্যর্থ হয়েছে।' : 'Failed to delete document.');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">{t('loading')}</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center text-rose-500 font-bold">
        {lang === 'bn' ? 'কর্মীর তথ্য পাওয়া যায়নি।' : 'Employee not found.'}
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1.5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}
          </span>
        );
      case 'on_leave':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 flex items-center gap-1.5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {lang === 'bn' ? 'ছুটিতে (On Leave)' : 'On Leave'}
          </span>
        );
      case 'suspended':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 flex items-center gap-1.5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {lang === 'bn' ? 'বরখাস্ত (Suspended)' : 'Suspended'}
          </span>
        );
      case 'resigned':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 inline-flex">
            {lang === 'bn' ? 'পদত্যাগকৃত (Resigned)' : 'Resigned'}
          </span>
        );
      case 'terminated':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 inline-flex">
            {lang === 'bn' ? 'চাকরিচ্যুত (Terminated)' : 'Terminated'}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 inline-flex">
            {lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}
          </span>
        );
    }
  };

  const getEmploymentTypeLabel = (type) => {
    const map = {
      full_time: lang === 'bn' ? 'স্থায়ী (Full Time)' : 'Full Time',
      part_time: lang === 'bn' ? 'খণ্ডকালীন (Part Time)' : 'Part Time',
      contract: lang === 'bn' ? 'চুক্তিভিত্তিক (Contract)' : 'Contract',
      temporary: lang === 'bn' ? 'অস্থায়ী (Temporary)' : 'Temporary',
      probation: lang === 'bn' ? 'শিক্ষানবিস (Probation)' : 'Probation',
    };
    return map[type] || type;
  };

  const tabs = [
    { id: 'overview', label: lang === 'bn' ? 'সারসংক্ষেপ (Overview)' : 'Overview', icon: User },
    { id: 'job', label: lang === 'bn' ? 'কাজের তথ্য ও বদলি' : 'Job & Transfer', icon: Briefcase },
    { id: 'access', label: lang === 'bn' ? 'অনুমতি ও নিরাপত্তা' : 'Access & Security', icon: Shield },
    { id: 'attendance', label: lang === 'bn' ? 'হাজিরা খাতা' : 'Attendance', icon: Calendar },
    { id: 'activity', label: lang === 'bn' ? 'সিস্টেম লগ' : 'Activity Logs', icon: Activity },
    { id: 'documents', label: lang === 'bn' ? 'নথি ও কাগজপত্র' : 'Documents', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar with BackButton & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton fallback="/employees" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>{employee.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono font-bold border border-indigo-200 dark:border-indigo-800">
                {employee.employee_id || 'ID-NONE'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {employee.designationRelation?.name || employee.designation || 'Staff'} • {employee.departmentRelation?.name || employee.department || 'Operations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          <button
            onClick={() => window.print()}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            title="Print Profile"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রোফাইল প্রিন্ট' : 'Print Profile'}</span>
          </button>
          <Link
            to={`/employees/edit/${employee.id}`}
            className="py-2 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5 transition"
          >
            <Edit className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রোফাইল সম্পাদনা' : 'Edit Employee'}</span>
          </Link>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-3xl font-black shadow-md border-2 border-white dark:border-slate-800 shrink-0 overflow-hidden">
            {employee.avatar ? (
              <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
            ) : (
              (employee.name || 'E')[0].toUpperCase()
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{employee.name}</h2>
              {getStatusBadge(employee.status)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                {employee.designationRelation?.name || employee.designation || 'Staff'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                {employee.departmentRelation?.name || employee.department || 'Retail'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                {employee.branch ? employee.branch.name : (lang === 'bn' ? 'প্রধান আউটলেট' : 'Main Outlet')}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 pt-0.5">
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{employee.phone || '—'}</span>
              <span>•</span>
              <span className="text-slate-400">{employee.email}</span>
            </div>
          </div>
        </div>

        {/* Quick KPI Pills on Header */}
        <div className="flex items-center gap-3 self-start md:self-auto border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div className="text-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {lang === 'bn' ? 'চাকরির ধরন' : 'Type'}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {getEmploymentTypeLabel(employee.employment_type)}
            </span>
          </div>
          <div className="text-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {lang === 'bn' ? 'যোগদান' : 'Joined'}
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US') : '—'}
            </span>
          </div>
          <div className="text-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {lang === 'bn' ? 'ভূমিকা' : 'Role'}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {employee.role?.name || 'Staff'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="w-4 h-4 text-indigo-600" />
              <span>{lang === 'bn' ? 'ব্যক্তিগত ও পারিবারিক তথ্য' : 'Personal & Contact Information'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'কর্মী আইডি' : 'Employee ID'}</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{employee.employee_id || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'পিতার নাম' : "Father's Name"}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{employee.father_name || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'মাতার নাম' : "Mother's Name"}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{employee.mother_name || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {employee.dob ? new Date(employee.dob).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US') : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'লিঙ্গ' : 'Gender'}</span>
                <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                  {employee.gender === 'male' ? (lang === 'bn' ? 'পুরুষ (Male)' : 'Male') : employee.gender === 'female' ? (lang === 'bn' ? 'মহিলা (Female)' : 'Female') : (employee.gender || '—')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{employee.phone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{employee.email}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'বর্তমান ঠিকানা' : 'Present Address'}</span>
                <p className="text-slate-700 dark:text-slate-300">{employee.present_address || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'স্থায়ী ঠিকানা' : 'Permanent Address'}</span>
                <p className="text-slate-700 dark:text-slate-300">{employee.permanent_address || '—'}</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <Phone className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'জরুরি যোগাযোগ (Emergency Contact)' : 'Emergency Contact'}</span>
              </h4>
              <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'যোগাযোগের ব্যক্তি' : 'Contact Person'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{employee.emergency_contact_name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{employee.emergency_contact_phone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'সম্পর্ক' : 'Relationship'}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{employee.emergency_contact_relation || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Reporting Manager & Status Change */}
          <div className="space-y-6">
            {/* Reporting Manager Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'bn' ? 'রিপোর্টিং ম্যানেজার' : 'Reporting Manager'}</span>
              </h3>

              {employee.reportingManager ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {(employee.reportingManager.name || 'M')[0].toUpperCase()}
                  </div>
                  <div className="truncate">
                    <Link
                      to={`/employees/${employee.reportingManager.id}`}
                      className="font-bold text-xs text-indigo-600 dark:text-indigo-400 hover:underline block truncate"
                    >
                      {employee.reportingManager.name}
                    </Link>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {employee.reportingManager.designation || 'Manager'} • {employee.reportingManager.employee_id}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                  {lang === 'bn' ? 'কোনো সরাসরি রিপোর্টিং ম্যানেজার নির্ধারিত নেই (Top Level/Owner)' : 'No Reporting Manager Assigned (Top Level)'}
                </div>
              )}

              {/* Subordinates count */}
              {employee.subordinates && employee.subordinates.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                    {lang === 'bn' ? `অধীনস্থ কর্মী দল (${employee.subordinates.length} জন):` : `Direct Subordinates (${employee.subordinates.length}):`}
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {employee.subordinates.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/employees/${sub.id}`}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center justify-between text-xs transition"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{sub.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sub.designationRelation?.name || sub.designation}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Workflow Box (NO MODAL) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'bn' ? 'কর্মীর স্ট্যাটাস পরিবর্তন' : 'Change Employment Status'}</span>
              </h3>

              <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">{lang === 'bn' ? 'নতুন স্ট্যাটাস' : 'New Status'}</label>
                  <select
                    value={statusChangeValue}
                    onChange={(e) => setStatusChangeValue(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                    <option value="on_leave">{lang === 'bn' ? 'ছুটিতে (On Leave)' : 'On Leave'}</option>
                    <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
                    <option value="suspended">{lang === 'bn' ? 'সাময়িক বরখাস্ত (Suspended)' : 'Suspended'}</option>
                    <option value="resigned">{lang === 'bn' ? 'পদত্যাগকৃত (Resigned)' : 'Resigned'}</option>
                    <option value="terminated">{lang === 'bn' ? 'চাকরিচ্যুত (Terminated)' : 'Terminated'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{lang === 'bn' ? 'পরিবর্তনের কারণ বা নোট' : 'Reason / Note'}</label>
                  <textarea
                    rows="2"
                    value={statusChangeReason}
                    onChange={(e) => setStatusChangeReason(e.target.value)}
                    placeholder={lang === 'bn' ? 'কারণ বা রেফারেন্স উল্লেখ করুন...' : 'Specify reason or reference note...'}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingStatus || statusChangeValue === employee.status}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow transition cursor-pointer"
                >
                  {updatingStatus ? (lang === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...') : (lang === 'bn' ? 'স্ট্যাটাস নিশ্চিত করুন' : 'Confirm Status Change')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOB INFORMATION & TRANSFER */}
      {activeTab === 'job' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                  <span>{lang === 'bn' ? 'শাখা ও বিভাগ স্থানান্তর ইতিহাস' : 'Branch & Department Transfer History'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn' ? 'কর্মীর আউটলেট বদলি ও ডিপার্টমেন্ট রিলোকেশনের পূর্ণ অডিট ট্রেল' : 'Historical records of all outlet relocations and transfers'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTransferForm(!showTransferForm)}
                className="py-2 px-3.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition flex items-center gap-1.5 self-start cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{showTransferForm ? (lang === 'bn' ? 'ফর্ম লুকান' : 'Hide Form') : (lang === 'bn' ? '+ নতুন শাখা স্থানান্তর' : '+ Transfer Employee')}</span>
              </button>
            </div>

            {/* Inline Transfer Form (NO MODAL) */}
            {showTransferForm && (
              <form onSubmit={handleTransferSubmit} className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 mb-6 space-y-4 animate-in fade-in duration-150">
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  {lang === 'bn' ? 'নতুন শাখায় কর্মী স্থানান্তর ফরম' : 'Branch Transfer Form'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'bn' ? 'গন্তব্য শাখা *' : 'Target Branch *'}</label>
                    <select
                      required
                      value={transferForm.to_branch_id}
                      onChange={(e) => setTransferForm({ ...transferForm, to_branch_id: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">{lang === 'bn' ? 'শাখা বাছাই করুন' : 'Select Branch'}</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'bn' ? 'নতুন বিভাগ (ঐচ্ছিক)' : 'Target Department (Optional)'}</label>
                    <select
                      value={transferForm.to_department_id}
                      onChange={(e) => setTransferForm({ ...transferForm, to_department_id: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">{lang === 'bn' ? 'বর্তমান বিভাগ বজায় রাখুন' : 'Keep Current Department'}</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'bn' ? 'স্থানান্তরের তারিখ *' : 'Effective Date *'}</label>
                    <input
                      type="date"
                      required
                      value={transferForm.transfer_date}
                      onChange={(e) => setTransferForm({ ...transferForm, transfer_date: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'bn' ? 'স্থানান্তরের কারণ' : 'Transfer Reason / Order'}</label>
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'যেমন: গুলশান শাখায় লোকবল ঘাটতির কারণে বদলি আদেশ নং...' : 'e.g., Relocation order due to staffing shortage...'}
                    value={transferForm.reason}
                    onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowTransferForm(false)}
                    className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTransfer}
                    className="py-1.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submittingTransfer ? (lang === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...') : (lang === 'bn' ? 'স্থানান্তর অনুমোদন ও সম্পন্ন' : 'Confirm Transfer')}
                  </button>
                </div>
              </form>
            )}

            {/* Transfers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3.5">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'পূর্ববর্তী শাখা' : 'From Branch'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'গন্তব্য শাখা' : 'To Branch'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'বিভাগ পরিবর্তন' : 'Department'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'অনুমোদনকারী' : 'Approved By'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'কারণ' : 'Reason'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(!employee.transfers || employee.transfers.length === 0) ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">
                        {lang === 'bn' ? 'কোনো পূর্ববর্তী শাখা স্থানান্তরের ইতিহাস নেই।' : 'No transfer history records found for this employee.'}
                      </td>
                    </tr>
                  ) : (
                    employee.transfers.map((tr) => (
                      <tr key={tr.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                          {new Date(tr.transfer_date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                        </td>
                        <td className="p-3.5 font-medium text-slate-600 dark:text-slate-300">
                          {tr.from_branch?.name || (lang === 'bn' ? 'প্রধান আউটলেট' : 'Main Outlet')}
                        </td>
                        <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                          {tr.to_branch?.name}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {tr.to_department?.name || '—'}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {tr.approver?.name || (lang === 'bn' ? 'সিস্টেম অ্যাডমিন' : 'System Admin')}
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]">
                          {tr.reason || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCESS & PERMISSIONS */}
      {activeTab === 'access' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Credentials & Status */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'bn' ? 'লগইন অ্যাকাউন্ট ও নিরাপত্তা' : 'Login Credentials & Security'}</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'লগইন ইমেইল' : 'Login Email'}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{employee.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'একাউন্ট স্ট্যাটাস' : 'Account Status'}</span>
                  {getStatusBadge(employee.status)}
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'সর্বশেষ লগইন সময়' : 'Last Login Timestamp'}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {employee.last_login_at ? new Date(employee.last_login_at).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US') : (lang === 'bn' ? 'এখনো লগইন করেননি' : 'Never logged in')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 hover:bg-amber-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{showPasswordForm ? (lang === 'bn' ? 'বাতিল' : 'Cancel') : (lang === 'bn' ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Password')}</span>
                </button>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordSubmit} className="mt-3 space-y-2 text-xs animate-in fade-in">
                    <input
                      type="password"
                      required
                      placeholder={lang === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New password (min 6 chars)'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="submit"
                      disabled={resettingPassword}
                      className="w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow text-xs"
                    >
                      {resettingPassword ? (lang === 'bn' ? 'রিসেট হচ্ছে...' : 'Resetting...') : (lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password')}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Assigned Role & System Permissions */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'অর্পণকৃত ভূমিকা ও অনুমোদনাদি' : 'Assigned Role & Permissions'}
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  {employee.role?.name || 'Staff'}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {employee.role?.description || (lang === 'bn' ? 'এই ভূমিকার জন্য কোনো বর্ণনা প্রদান করা হয়নি।' : 'No description provided for this role.')}
              </p>

              {/* Permissions list */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {lang === 'bn' ? 'কার্যকর পারমিশন তালিকা:' : 'Active System Permissions:'}
                </h4>

                {employee.role?.slug === 'super-admin' ? (
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'সুপার অ্যাডমিন: সিস্টেমে কোনো সীমাবদ্ধতা নেই (পূর্ণ এক্সেস)।' : 'Super Admin: Unrestricted Platform-Level Access.'}</span>
                  </div>
                ) : (!employee.role?.permissions || employee.role.permissions.length === 0) ? (
                  <div className="text-xs text-slate-400 p-4 text-center">
                    {lang === 'bn' ? 'কোনো পারমিশন অর্পণ করা নেই।' : 'No granular permissions assigned.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {employee.role.permissions.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
            {/* Month Filter & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>{lang === 'bn' ? 'মাসিক হাজিরা বিবরণ' : 'Monthly Attendance Ledger'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn' ? 'কর্মীর চেক-ইন, চেক-আউট ও কাজের সময়ের পূর্ণ হিসাব' : 'Daily check-in, check-out, working hours and attendance status'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start">
                <input
                  type="month"
                  value={attendanceMonth}
                  onChange={(e) => setAttendanceMonth(e.target.value)}
                  className="py-1.5 px-3 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* 5 Attendance Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  {lang === 'bn' ? 'উপস্থিত দিন' : 'Present'}
                </span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                  {formatNumber(attendanceData.summary?.present_days || 0)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  {lang === 'bn' ? 'বিলম্বে আগমন' : 'Late'}
                </span>
                <span className="text-xl font-black text-amber-700 dark:text-amber-300">
                  {formatNumber(attendanceData.summary?.late_days || 0)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  {lang === 'bn' ? 'অনুপস্থিত' : 'Absent'}
                </span>
                <span className="text-xl font-black text-rose-700 dark:text-rose-300">
                  {formatNumber(attendanceData.summary?.absent_days || 0)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  {lang === 'bn' ? 'ছুটি' : 'Leave'}
                </span>
                <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">
                  {formatNumber(attendanceData.summary?.leave_days || 0)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {lang === 'bn' ? 'মোট কর্মঘণ্টা' : 'Total Hours'}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {formatNumber(attendanceData.summary?.total_hours || 0)} h
                </span>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3.5">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'শিফট' : 'Shift'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'চেক-ইন' : 'Check-In'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'চেক-আউট' : 'Check-Out'}</th>
                    <th className="p-3.5 text-center">{lang === 'bn' ? 'কর্মঘণ্টা' : 'Hours'}</th>
                    <th className="p-3.5 text-center">{t('status')}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'নোট' : 'Notes'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingAttendance ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
                        {t('loading')}
                      </td>
                    </tr>
                  ) : (!attendanceData.records || attendanceData.records.length === 0) ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
                        {lang === 'bn' ? 'এই মাসে কোনো হাজিরার তথ্য পাওয়া যায়নি।' : 'No attendance entries found for this month.'}
                      </td>
                    </tr>
                  ) : (
                    attendanceData.records.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono text-slate-800 dark:text-slate-200 font-bold">
                          {new Date(att.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', weekday: 'short' })}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {att.shift?.name || (lang === 'bn' ? 'সাধারণ শিফট' : 'General Shift')}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-600">
                          {att.check_in || '—'}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {att.check_out || '—'}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold">
                          {att.working_hours ? `${att.working_hours} h` : '—'}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            att.status === 'present'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : att.status === 'late'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : att.status === 'on_leave'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {att.status === 'present' ? (lang === 'bn' ? 'উপস্থিত' : 'Present') : att.status === 'late' ? (lang === 'bn' ? 'দেরি' : 'Late') : att.status === 'on_leave' ? (lang === 'bn' ? 'ছুটি' : 'Leave') : (lang === 'bn' ? 'অনুপস্থিত' : 'Absent')}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px]">
                          {att.notes || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVITY LOGS */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>{lang === 'bn' ? 'সিস্টেম কার্যকলাপ অডিট লগ' : 'System Activity Audit Log'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn' ? 'এই কর্মী কর্তৃক পরিচালিত লগইন, পিওএস বিক্রয় ও অন্যান্য পদক্ষেপের টাইমলাইন' : 'Audit trail of recent system events performed by this employee'}
            </p>
          </div>

          <div className="space-y-3">
            {(!employee.activityLogs || employee.activityLogs.length === 0) ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {lang === 'bn' ? 'কোনো সাম্প্রতিক কার্যকলাপ লগ পাওয়া যায়নি।' : 'No activity logs found for this employee.'}
              </div>
            ) : (
              employee.activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white capitalize truncate">
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(log.created_at).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                      {log.description}
                    </p>
                    {log.ip_address && (
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        IP: {log.ip_address}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'bn' ? 'কর্মী নিয়োগ ও পরিচয়পত্র নথি' : 'Employee Documents & Attachments'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'bn' ? 'নিয়োগপত্র, এনআইডি, পাসপোর্ট, চুক্তিপত্র ও অন্যান্য সংরক্ষিত ফাইল' : 'Appointment letters, NID cards, certificates and contracts'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDocForm(!showDocForm)}
              className="py-2 px-3.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{showDocForm ? (lang === 'bn' ? 'ফর্ম লুকান' : 'Hide Form') : (lang === 'bn' ? '+ নতুন নথি যোগ' : '+ Upload Document')}</span>
            </button>
          </div>

          {/* Inline Upload Form (NO MODAL) */}
          {showDocForm && (
            <form onSubmit={handleDocumentSubmit} className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-in fade-in text-xs">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-200">
                {lang === 'bn' ? 'নথি সংযুক্তি ফরম' : 'Attach Document'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'bn' ? 'নথির শিরোনাম *' : 'Document Title *'}</label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'bn' ? 'যেমন: জাতীয় পরিচয়পত্র (NID)' : 'e.g. National ID Card'}
                    value={docForm.title}
                    onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'bn' ? 'নথির ধরন' : 'Document Type'}</label>
                  <select
                    value={docForm.document_type}
                    onChange={(e) => setDocForm({ ...docForm, document_type: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="appointment_letter">{lang === 'bn' ? 'নিয়োগপত্র (Appointment Letter)' : 'Appointment Letter'}</option>
                    <option value="nid">{lang === 'bn' ? 'জাতীয় পরিচয়পত্র (NID)' : 'National ID'}</option>
                    <option value="passport">{lang === 'bn' ? 'পাসপোর্ট (Passport)' : 'Passport'}</option>
                    <option value="contract">{lang === 'bn' ? 'চুক্তিপত্র (Contract)' : 'Contract'}</option>
                    <option value="certificate">{lang === 'bn' ? 'শিক্ষাগত সনদ (Certificate)' : 'Certificate'}</option>
                    <option value="other">{lang === 'bn' ? 'অন্যান্য (Other)' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'bn' ? 'ফাইল বাছাই করুন' : 'Choose File'}</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'bn' ? 'অথবা সরাসরি ফাইল লিংক' : 'Or File URL'}</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={docForm.file_url}
                    onChange={(e) => setDocForm({ ...docForm, file_url: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">{lang === 'bn' ? 'নোট বা বিবরণ' : 'Notes'}</label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'সংক্ষিপ্ত তথ্য...' : 'Brief notes...'}
                  value={docForm.notes}
                  onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDocForm(false)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="py-1.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow disabled:opacity-50"
                >
                  {uploadingDoc ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Document')}
                </button>
              </div>
            </form>
          )}

          {/* Documents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(!employee.documents || employee.documents.length === 0) ? (
              <div className="col-span-full p-8 text-center text-slate-400 text-xs">
                {lang === 'bn' ? 'এখনো কোনো নথি সংযুক্ত করা হয়নি।' : 'No employee documents attached yet.'}
              </div>
            ) : (
              employee.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{doc.title}</h4>
                        <span className="text-[10px] text-slate-400 capitalize block">{doc.document_type?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>{doc.file_size || 'Attached'}</span>
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{lang === 'bn' ? 'দেখুন' : 'View'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

