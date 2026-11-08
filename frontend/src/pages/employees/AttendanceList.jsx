import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  Coffee,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Save,
  X,
  RefreshCw,
  LogIn,
  LogOut,
  Building2,
  FileSpreadsheet,
  Download,
  Users,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const AttendanceList = () => {
  const { lang, formatNumber } = useLanguage();
  const { success, error } = useToast();
  const { user: currentUser, hasPermission } = useAuth();

  const isSuperAdmin = currentUser?.role?.slug === 'super-admin' || currentUser?.email === 'admin@israfilbd.com';
  const canRecord = isSuperAdmin || hasPermission('attendance.create');
  const canEdit = isSuperAdmin || hasPermission('attendance.edit');
  const canApprove = isSuperAdmin || hasPermission('attendance.approve');
  const canExport = isSuperAdmin || hasPermission('attendance.export');

  // Mode: 'daily' | 'monthly'
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);
  const [summary, setSummary] = useState({
    total_employees: 0,
    present: 0,
    late: 0,
    absent: 0,
    on_leave: 0,
  });

  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Inline Record Entry Form (Strict NO-MODAL Policy)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    date: new Date().toISOString().split('T')[0],
    shift_id: '',
    check_in: '09:00',
    check_out: '18:00',
    status: 'present',
    notes: '',
  });

  // Monthly Report Data
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  // Self Check-in / Check-out Loading
  const [selfActionLoading, setSelfActionLoading] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyAttendance();
    } else {
      fetchMonthlyReport();
    }
  }, [selectedDate, selectedMonth, activeTab, deptFilter, statusFilter]);

  const fetchMetadata = async () => {
    try {
      const [shiftRes, deptRes, empRes] = await Promise.all([
        api.get('/attendances/shifts'),
        api.get('/departments'),
        api.get('/employees?per_page=100'),
      ]);
      setShifts(shiftRes.data || []);
      setDepartments(deptRes.data || []);
      setEmployees(empRes.data?.data || empRes.data || []);
    } catch (e) {
      // quiet
    }
  };

  const fetchDailyAttendance = async () => {
    setLoading(true);
    try {
      const params = { date: selectedDate };
      if (deptFilter) params.department_id = deptFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/attendances', { params });
      setAttendances(res.data?.attendances || []);
      setSummary(
        res.data?.summary || {
          total_employees: 0,
          present: 0,
          late: 0,
          absent: 0,
          on_leave: 0,
        }
      );
    } catch (err) {
      error(lang === 'bn' ? 'হাজিরা তথ্য লোড করা যায়নি।' : 'Failed to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setMonthlyLoading(true);
    try {
      const res = await api.get('/attendances/monthly-report', {
        params: { month: selectedMonth },
      });
      setMonthlyReport(res.data?.report || []);
    } catch (err) {
      error(lang === 'bn' ? 'মাসিক রিপোর্ট লোড করা যায়নি।' : 'Failed to load monthly report.');
    } finally {
      setMonthlyLoading(false);
    }
  };

  // Quick Self Check-in
  const handleSelfCheckIn = async () => {
    setSelfActionLoading(true);
    try {
      const res = await api.post('/attendances/check-in', {
        notes: 'Mobile/Web Quick Check-In',
      });
      success(res.data?.message || (lang === 'bn' ? 'চেক-ইন সম্পন্ন হয়েছে।' : 'Check-in recorded.'));
      fetchDailyAttendance();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'চেক-ইন ব্যর্থ হয়েছে।' : 'Check-in failed.'));
    } finally {
      setSelfActionLoading(false);
    }
  };

  // Quick Self Check-out
  const handleSelfCheckOut = async () => {
    setSelfActionLoading(true);
    try {
      const res = await api.post('/attendances/check-out', {
        notes: 'Mobile/Web Quick Check-Out',
      });
      success(res.data?.message || (lang === 'bn' ? 'চেক-আউট সম্পন্ন হয়েছে।' : 'Check-out recorded.'));
      fetchDailyAttendance();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'চেক-আউট ব্যর্থ হয়েছে।' : 'Check-out failed.'));
    } finally {
      setSelfActionLoading(false);
    }
  };

  const handleOpenForm = () => {
    setFormData({
      user_id: employees[0]?.id ? String(employees[0].id) : '',
      date: selectedDate,
      shift_id: shifts[0]?.id ? String(shifts[0].id) : '',
      check_in: '09:00',
      check_out: '18:00',
      status: 'present',
      notes: '',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.user_id) {
      error(lang === 'bn' ? 'কর্মী নির্বাচন করুন।' : 'Please select an employee.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: Number(formData.user_id),
        date: formData.date,
        shift_id: formData.shift_id ? Number(formData.shift_id) : null,
        check_in: formData.check_in || null,
        check_out: formData.check_out || null,
        status: formData.status,
        notes: formData.notes.trim() || null,
      };

      await api.post('/attendances/record', payload);
      success(lang === 'bn' ? 'হাজিরা সফলভাবে সংরক্ষণ করা হয়েছে।' : 'Attendance recorded successfully.');
      setIsFormOpen(false);
      fetchDailyAttendance();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'হাজিরা সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to record attendance.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {lang === 'bn' ? 'কর্মী হাজিরা ও শিফট (Attendance)' : 'Attendance & Shift Management'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'দৈনিক উপস্থিতি, শিফট রোস্টার, সময় হিসাব ও মাসিক হাজিরা রেজিস্টার'
                  : 'Daily employee check-in/out register, work shift schedules, and monthly timesheets'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Self Actions & New Entry */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSelfCheckIn}
            disabled={selfActionLoading}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Punch In"
          >
            <LogIn className="w-4 h-4" />
            <span>{lang === 'bn' ? 'আমার চেক-ইন' : 'My Check-In'}</span>
          </button>

          <button
            onClick={handleSelfCheckOut}
            disabled={selfActionLoading}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Punch Out"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === 'bn' ? 'আমার চেক-আউট' : 'My Check-Out'}</span>
          </button>

          {canRecord && !isFormOpen && (
            <button
              onClick={handleOpenForm}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ম্যানুয়াল হাজিরা' : 'Manual Entry'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'daily'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>{lang === 'bn' ? 'দৈনিক রেজিস্টার' : 'Daily Register'}</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'monthly'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{lang === 'bn' ? 'মাসিক রিপোর্ট' : 'Monthly Summary'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'daily' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                {lang === 'bn' ? 'তারিখ:' : 'Date:'}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                {lang === 'bn' ? 'মাস:' : 'Month:'}
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards (Daily Mode) */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'মোট সক্রিয় কর্মী' : 'Total Headcount'}
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {summary.total_employees}
              </span>
              <Users className="w-5 h-5 text-indigo-500 opacity-60" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {lang === 'bn' ? 'উপস্থিত (Present)' : 'Present'}
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {summary.present}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-60" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {lang === 'bn' ? 'দেরি (Late)' : 'Late Arrivals'}
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {summary.late}
              </span>
              <AlertCircle className="w-5 h-5 text-amber-500 opacity-60" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {lang === 'bn' ? 'অনুপস্থিত (Absent)' : 'Absent'}
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {summary.absent}
              </span>
              <UserX className="w-5 h-5 text-rose-500 opacity-60" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              {lang === 'bn' ? 'ছুটিতে (On Leave)' : 'On Leave'}
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
                {summary.on_leave}
              </span>
              <Coffee className="w-5 h-5 text-sky-500 opacity-60" />
            </div>
          </div>
        </div>
      )}

      {/* Inline Manual Entry Form (Strict NO-MODAL Policy) */}
      {isFormOpen && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500/30 dark:border-indigo-500/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'ম্যানুয়াল হাজিরা এন্ট্রি' : 'Manual Attendance Entry'}
              </h2>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'কর্মী নির্বাচন করুন *' : 'Select Employee *'}
                </label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="">{lang === 'bn' ? '-- কর্মী নির্বাচন করুন --' : '-- Select Employee --'}</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employee_id || emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'তারিখ *' : 'Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'কাজের শিফট (Shift)' : 'Work Shift'}
                </label>
                <select
                  value={formData.shift_id}
                  onChange={(e) => setFormData({ ...formData, shift_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="">{lang === 'bn' ? 'সাধারণ শিফট (General)' : 'General Shift'}</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'চেক-ইন সময় (Check In)' : 'Check In Time'}
                </label>
                <input
                  type="time"
                  value={formData.check_in}
                  onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'চেক-আউট সময় (Check Out)' : 'Check Out Time'}
                </label>
                <input
                  type="time"
                  value={formData.check_out}
                  onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'হাজিরা স্ট্যাটাস *' : 'Attendance Status *'}
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="present">{lang === 'bn' ? 'উপস্থিত (Present)' : 'Present'}</option>
                  <option value="late">{lang === 'bn' ? 'দেরি (Late Arrival)' : 'Late'}</option>
                  <option value="half_day">{lang === 'bn' ? 'অর্ধদিবস (Half Day)' : 'Half Day'}</option>
                  <option value="on_leave">{lang === 'bn' ? 'ছুটিতে (On Leave)' : 'On Leave'}</option>
                  <option value="absent">{lang === 'bn' ? 'অনুপস্থিত (Absent)' : 'Absent'}</option>
                  <option value="holiday">{lang === 'bn' ? 'ছুটির দিন (Holiday)' : 'Holiday'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'মন্তব্য বা কারণ (Notes)' : 'Notes / Remarks'}
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={lang === 'bn' ? 'দেরির কারণ বা ছুটির রেফারেন্স...' : 'Reason for late/leave or remarks...'}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Attendance'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daily Register Table */}
      {activeTab === 'daily' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-700/80">
                <tr>
                  <th className="p-4">{lang === 'bn' ? 'কর্মী আইডি' : 'Employee ID'}</th>
                  <th className="p-4">{lang === 'bn' ? 'কর্মীর নাম' : 'Employee Name'}</th>
                  <th className="p-4">{lang === 'bn' ? 'বিভাগ' : 'Department'}</th>
                  <th className="p-4">{lang === 'bn' ? 'শিফট' : 'Shift'}</th>
                  <th className="p-4 text-center">{lang === 'bn' ? 'ইন (Check In)' : 'Check In'}</th>
                  <th className="p-4 text-center">{lang === 'bn' ? 'আউট (Check Out)' : 'Check Out'}</th>
                  <th className="p-4 text-center">{lang === 'bn' ? 'মোট ঘণ্টা' : 'Total Hours'}</th>
                  <th className="p-4 text-center">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="p-4">{lang === 'bn' ? 'মন্তব্য' : 'Notes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-indigo-500" />
                      <span>{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading register...'}</span>
                    </td>
                  </tr>
                ) : attendances.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <span>
                        {lang === 'bn'
                          ? 'এই তারিখে কোনো হাজিরার রেকর্ড পাওয়া যায়নি'
                          : 'No attendance records found for this date'}
                      </span>
                    </td>
                  </tr>
                ) : (
                  attendances.map((att) => {
                    const isPresent = att.status === 'present';
                    const isLate = att.status === 'late';
                    const isLeave = att.status === 'on_leave';
                    const isAbsent = att.status === 'absent';

                    return (
                      <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                        <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {att.user?.employee_id || '-'}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {att.user?.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {att.user?.designation || att.user?.email}
                          </div>
                        </td>
                        <td className="p-4">
                          {att.user?.departmentRelation?.name || att.user?.department || '-'}
                        </td>
                        <td className="p-4">
                          {att.shift ? (
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {att.shift.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">General</span>
                          )}
                        </td>
                        <td className="p-4 text-center font-mono font-semibold">
                          {att.check_in ? att.check_in.slice(0, 5) : '-'}
                        </td>
                        <td className="p-4 text-center font-mono font-semibold">
                          {att.check_out ? att.check_out.slice(0, 5) : '-'}
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-700 dark:text-slate-200">
                          {att.working_hours ? `${att.working_hours}h` : (att.total_hours ? `${att.total_hours}h` : '-')}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : isLate
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : isLeave
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {att.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                          {att.notes || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Summary Timesheet Table */}
      {activeTab === 'monthly' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-700/80">
                <tr>
                  <th className="p-4">{lang === 'bn' ? 'কর্মী আইডি' : 'Employee ID'}</th>
                  <th className="p-4">{lang === 'bn' ? 'নাম' : 'Employee Name'}</th>
                  <th className="p-4">{lang === 'bn' ? 'বিভাগ' : 'Department'}</th>
                  <th className="p-4 text-center text-emerald-600">{lang === 'bn' ? 'উপস্থিত দিন' : 'Present Days'}</th>
                  <th className="p-4 text-center text-amber-600">{lang === 'bn' ? 'দেরির দিন' : 'Late Days'}</th>
                  <th className="p-4 text-center text-rose-600">{lang === 'bn' ? 'অনুপস্থিত' : 'Absent'}</th>
                  <th className="p-4 text-center text-sky-600">{lang === 'bn' ? 'ছুটি' : 'Leaves'}</th>
                  <th className="p-4 text-right">{lang === 'bn' ? 'মোট কর্মঘণ্টা' : 'Total Worked Hours'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {monthlyLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-indigo-500" />
                      <span>{lang === 'bn' ? 'মাসিক রিপোর্ট তৈরি হচ্ছে...' : 'Generating monthly timesheet...'}</span>
                    </td>
                  </tr>
                ) : monthlyReport.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <span>{lang === 'bn' ? 'কোনো মাসিক ডাটা পাওয়া যায়নি' : 'No data for this month'}</span>
                    </td>
                  </tr>
                ) : (
                  monthlyReport.map((row) => (
                    <tr key={row.user_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                      <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {row.employee_id || '-'}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {row.name}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {row.department || '-'}
                      </td>
                      <td className="p-4 text-center font-black text-emerald-600 dark:text-emerald-400">
                        {row.present_days || 0}
                      </td>
                      <td className="p-4 text-center font-bold text-amber-600 dark:text-amber-400">
                        {row.late_days || 0}
                      </td>
                      <td className="p-4 text-center font-bold text-rose-600 dark:text-rose-400">
                        {row.absent_days || 0}
                      </td>
                      <td className="p-4 text-center font-bold text-sky-600 dark:text-sky-400">
                        {row.leave_days || 0}
                      </td>
                      <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">
                        {row.total_hours ? `${row.total_hours} hrs` : '0 hrs'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;

