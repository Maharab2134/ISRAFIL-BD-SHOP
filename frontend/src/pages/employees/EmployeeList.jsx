import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Edit,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  Trash2,
  Building2,
  Briefcase,
  AlertCircle,
  RefreshCw,
  X,
  Filter,
  Eye,
  LayoutGrid,
  List,
  Printer,
  Download,
  FileSpreadsheet,
  Network,
  Clock,
  Sparkles,
  MapPin,
  Coffee,
  UserX,
  ChevronDown,
} from 'lucide-react';

export default function EmployeeList() {
  const { t, lang, formatNumber } = useLanguage();
  const { success, error } = useToast();
  const { user: currentUser, hasPermission } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = currentUser?.role?.slug === 'super-admin' || currentUser?.email === 'admin@israfilbd.com';
  const canCreate = isSuperAdmin || hasPermission('employees.create');
  const canEdit = isSuperAdmin || hasPermission('employees.edit');
  const canDelete = isSuperAdmin || hasPermission('employees.delete');
  const canViewSalary = isSuperAdmin || hasPermission('employees.view_salary');

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // KPIs
  const [kpis, setKpis] = useState({
    total_employees: 0,
    active_employees: 0,
    inactive_employees: 0,
    on_leave_employees: 0,
    departments_count: 0,
    new_this_month: 0,
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dropdown Metadata
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);

  // View Mode: 'table' | 'grid'
  const [viewMode, setViewMode] = useState('table');

  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Multi-select & Inline Delete (Strict NO-MODAL Policy)
  const [selectedIds, setSelectedIds] = useState([]);
  const [inlineDeleteTarget, setInlineDeleteTarget] = useState(null); // { item: emp, isBulk: bool }
  const [deleting, setDeleting] = useState(false);

  // Quick Status Updating ID
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  useEffect(() => {
    fetchMetadata();
    fetchKpis();
    fetchEmployees(1);
  }, []);

  const fetchMetadata = async () => {
    try {
      const [roleRes, deptRes, branchRes] = await Promise.all([
        api.get('/roles').catch(() => api.get('/employees/roles')),
        api.get('/departments').catch(() => ({ data: [] })),
        api.get('/branches').catch(() => ({ data: [] })),
      ]);
      setRoles(roleRes.data || []);
      setDepartments(deptRes.data || []);
      setBranches(branchRes.data?.data || branchRes.data || []);
    } catch (e) {
      // quiet
    }
  };

  const fetchKpis = async () => {
    try {
      const res = await api.get('/employees/kpis');
      if (res.data) setKpis(res.data);
    } catch (e) {
      // quiet
    }
  };

  const fetchEmployees = async (
    page = pagination.current_page,
    searchQuery = search,
    rId = roleFilter,
    dept = deptFilter,
    branch = branchFilter,
    st = statusFilter
  ) => {
    setLoading(true);
    try {
      const params = { page, search: searchQuery };
      if (rId) params.role_id = rId;
      if (dept) params.department_id = dept;
      if (branch) params.branch_id = branch;
      if (st) params.status = st;

      const res = await api.get('/employees', { params });
      setEmployees(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (err) {
      error(lang === 'bn' ? 'কর্মী তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load employee list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(1, search, roleFilter, deptFilter, branchFilter, statusFilter);
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setDeptFilter('');
    setBranchFilter('');
    setStatusFilter('');
    fetchEmployees(1, '', '', '', '', '');
  };

  const handleQuickStatusChange = async (empId, newStatus) => {
    setStatusUpdatingId(empId);
    try {
      await api.patch(`/employees/${empId}/status`, {
        status: newStatus,
        notes: `Status changed to ${newStatus} from Employee Directory table`,
      });
      success(lang === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে।' : 'Status updated.');
      fetchEmployees();
      fetchKpis();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'স্ট্যাটাস আপডেট ব্যর্থ।' : 'Failed to update status.'));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Inline Delete
  const handleConfirmDelete = async () => {
    if (!inlineDeleteTarget) return;
    setDeleting(true);
    try {
      if (inlineDeleteTarget.isBulk) {
        const res = await api.post('/employees/bulk-delete', { ids: selectedIds });
        success(res.data.message || (lang === 'bn' ? 'কর্মী অপসারণ সম্পন্ন হয়েছে।' : 'Employees deleted.'));
        setSelectedIds([]);
      } else {
        const res = await api.delete(`/employees/${inlineDeleteTarget.item.id}`);
        success(res.data.message || (lang === 'bn' ? 'কর্মী অপসারণ সম্পন্ন হয়েছে।' : 'Employee deleted.'));
      }
      setInlineDeleteTarget(null);
      fetchEmployees();
      fetchKpis();
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'অপসারণ ব্যর্থ হয়েছে।' : 'Failed to delete.'));
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((e) => e.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Employee ID,Name,Phone,Email,Department,Designation,Role,Branch,Status,Joining Date\n'];
    const rows = employees.map((e) =>
      [
        `"${e.employee_id || ''}"`,
        `"${e.name || ''}"`,
        `"${e.phone || ''}"`,
        `"${e.email || ''}"`,
        `"${e.department_relation?.name || e.department || ''}"`,
        `"${e.designation_relation?.name || e.designation || ''}"`,
        `"${e.role?.name || ''}"`,
        `"${e.branch?.name || ''}"`,
        `"${e.status || ''}"`,
        `"${e.joining_date ? e.joining_date.split('T')[0] : ''}"`,
      ].join(',')
    );

    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print employee directory
  const handlePrintList = () => {
    window.print();
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle className="w-3 h-3" />
            <span>{lang === 'bn' ? 'সক্রিয়' : 'Active'}</span>
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
            <Coffee className="w-3 h-3" />
            <span>{lang === 'bn' ? 'ছুটিতে' : 'On Leave'}</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertCircle className="w-3 h-3" />
            <span>{lang === 'bn' ? 'বরখাস্ত' : 'Suspended'}</span>
          </span>
        );
      case 'resigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            <UserX className="w-3 h-3" />
            <span>{lang === 'bn' ? 'পদত্যাগকৃত' : 'Resigned'}</span>
          </span>
        );
      case 'terminated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            <XCircle className="w-3 h-3" />
            <span>{lang === 'bn' ? 'চাকরিচ্যুত' : 'Terminated'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Users className="w-6 h-6" />
            </div>
            <span>{lang === 'bn' ? 'কর্মী ও মানবসম্পদ পরিচালনা' : 'Enterprise Workforce Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'সুপার শপের বিভাগীয় কাঠামো, পদবী, উপস্থিতি, ভূমিকা ও শাখা ভিত্তিক কর্মী ডিরেক্টরি'
              : 'Manage departmental staff profiles, branch assignments, credentials, and access roles'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/organization-chart"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
          >
            <Network className="w-4 h-4 text-indigo-600" />
            <span>{lang === 'bn' ? 'অর্গানোগ্রাম' : 'Org Chart'}</span>
          </Link>

          <Link
            to="/attendance"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'bn' ? 'হাজিরা রেজিস্টার' : 'Attendance'}</span>
          </Link>

          {isSuperAdmin && (
            <Link
              to="/roles"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>{lang === 'bn' ? 'ভূমিকা ও পারমিশন' : 'Roles'}</span>
            </Link>
          )}

          {canCreate && (
            <Link
              to="/employees/new"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন কর্মী যুক্ত করুন' : 'Add Employee'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 6 KPI Cards (Section 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'মোট কর্মী' : 'Total Employees'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {kpis.total_employees}
            </span>
            <Users className="w-5 h-5 text-indigo-500 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {lang === 'bn' ? 'সক্রিয় কর্মী' : 'Active Staff'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {kpis.active_employees}
            </span>
            <CheckCircle className="w-5 h-5 text-emerald-500 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'নিষ্ক্রিয় / বরখাস্ত' : 'Inactive / Susp.'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-600 dark:text-slate-300">
              {kpis.inactive_employees}
            </span>
            <XCircle className="w-5 h-5 text-slate-400 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            {lang === 'bn' ? 'ছুটিতে আছেন' : 'On Leave'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {kpis.on_leave_employees}
            </span>
            <Coffee className="w-5 h-5 text-sky-500 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
            {lang === 'bn' ? 'মোট বিভাগ' : 'Departments'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {kpis.departments_count}
            </span>
            <Building2 className="w-5 h-5 text-purple-500 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {lang === 'bn' ? 'এই মাসে নতুন' : 'New This Month'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {kpis.new_this_month}
            </span>
            <Sparkles className="w-5 h-5 text-amber-500 opacity-60" />
          </div>
        </div>
      </div>

      {/* STRICT NO-MODAL: INLINE DELETE CONFIRMATION BANNER */}
      {inlineDeleteTarget && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-300 dark:border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-900 dark:text-rose-100">
                {lang === 'bn' ? 'কর্মী মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Employee Deletion'}
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                {inlineDeleteTarget.isBulk
                  ? lang === 'bn'
                    ? `আপনি কি নিশ্চিতভাবে নির্বাচিত ${selectedIds.length} জন কর্মীকে মুছে ফেলতে চান?`
                    : `Are you sure you want to delete ${selectedIds.length} selected employee(s)?`
                  : lang === 'bn'
                  ? `আপনি কি নিশ্চিতভাবে কর্মী '${inlineDeleteTarget.item?.name}' (${inlineDeleteTarget.item?.employee_id || 'ID#' + inlineDeleteTarget.item?.id}) কে সিস্টেম থেকে মুছে ফেলতে চান?`
                  : `Are you sure you want to permanently delete employee '${inlineDeleteTarget.item?.name}'?`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setInlineDeleteTarget(null)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-1.5 text-xs font-black rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{lang === 'bn' ? 'হ্যাঁ, নিশ্চিত মুছুন' : 'Confirm Delete'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'bn' ? 'নাম, আইডি, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by name, employee ID, phone, email...'}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </form>

          {/* View Toggle, Export, Print */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrintList}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              fetchEmployees(1, search, roleFilter, e.target.value, branchFilter, statusFilter);
            }}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-hidden"
          >
            <option value="">{lang === 'bn' ? 'সকল বিভাগ' : 'All Departments'}</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              fetchEmployees(1, search, e.target.value, deptFilter, branchFilter, statusFilter);
            }}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-hidden"
          >
            <option value="">{lang === 'bn' ? 'সকল ভূমিকা (Role)' : 'All Roles'}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              fetchEmployees(1, search, roleFilter, deptFilter, e.target.value, statusFilter);
            }}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-hidden"
          >
            <option value="">{lang === 'bn' ? 'সকল শাখা' : 'All Branches'}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchEmployees(1, search, roleFilter, deptFilter, branchFilter, e.target.value);
            }}
            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-hidden"
          >
            <option value="">{lang === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="active">{lang === 'bn' ? 'সক্রিয়' : 'Active'}</option>
            <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}</option>
            <option value="on_leave">{lang === 'bn' ? 'ছুটিতে' : 'On Leave'}</option>
            <option value="suspended">{lang === 'bn' ? 'বরখাস্ত' : 'Suspended'}</option>
            <option value="resigned">{lang === 'bn' ? 'পদত্যাগকৃত' : 'Resigned'}</option>
            <option value="terminated">{lang === 'bn' ? 'চাকরিচ্যুত' : 'Terminated'}</option>
          </select>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            {lang === 'bn' ? 'ফিল্টার মুছুন' : 'Reset Filters'}
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  {canDelete && (
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === employees.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="p-4">{lang === 'bn' ? 'কর্মী আইডি' : 'ID'}</th>
                  <th className="p-4">{lang === 'bn' ? 'কর্মীর নাম' : 'Employee Name'}</th>
                  <th className="p-4">{lang === 'bn' ? 'ফোন (১১ ডিজিট)' : 'Phone'}</th>
                  <th className="p-4">{lang === 'bn' ? 'বিভাগ ও পদবী' : 'Department / Title'}</th>
                  <th className="p-4">{lang === 'bn' ? 'ভূমিকা (Role)' : 'Assigned Role'}</th>
                  <th className="p-4">{lang === 'bn' ? 'শাখা' : 'Branch'}</th>
                  <th className="p-4 text-center">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="p-4 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      <span>{t('loading')}</span>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <span>{t('noData')}</span>
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const isSelected = selectedIds.includes(emp.id);
                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition ${
                          isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        {canDelete && (
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(emp.id)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                        )}

                        <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {emp.employee_id || `#${emp.id}`}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                              {emp.avatar ? (
                                <img src={emp.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                emp.name[0]?.toUpperCase()
                              )}
                            </div>
                            <div>
                              <Link
                                to={`/employees/${emp.id}`}
                                className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                              >
                                {emp.name}
                              </Link>
                              <div className="text-[11px] text-slate-400">{emp.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {emp.phone || '-'}
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {emp.department_relation?.name || emp.department || 'General'}
                          </div>
                          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                            {emp.designation_relation?.name || emp.designation || '-'}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60">
                            <UserCheck className="w-3 h-3" />
                            {emp.role?.name || 'Staff'}
                          </span>
                        </td>

                        <td className="p-4">
                          {emp.branch ? (
                            <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {emp.branch.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">All Branches</span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <div className="relative inline-block">
                            <select
                              value={emp.status}
                              disabled={statusUpdatingId === emp.id}
                              onChange={(e) => handleQuickStatusChange(emp.id, e.target.value)}
                              className="text-[11px] font-bold py-1 px-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-hidden"
                            >
                              <option value="active">Active</option>
                              <option value="on_leave">On Leave</option>
                              <option value="inactive">Inactive</option>
                              <option value="suspended">Suspended</option>
                              <option value="resigned">Resigned</option>
                              <option value="terminated">Terminated</option>
                            </select>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/employees/${emp.id}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
                              title={lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Profile'}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {canEdit && (
                              <Link
                                to={`/employees/${emp.id}/edit`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition"
                                title={lang === 'bn' ? 'সম্পাদনা করুন' : 'Edit Employee'}
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setInlineDeleteTarget({ item: emp, isBulk: false })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                                title={lang === 'bn' ? 'অপসারণ করুন' : 'Delete'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
              <span>{t('loading')}</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <span>{t('noData')}</span>
            </div>
          ) : (
            employees.map((emp) => (
              <div
                key={emp.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center shrink-0 overflow-hidden">
                      {emp.avatar ? (
                        <img src={emp.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        emp.name[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/employees/${emp.id}`}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition block truncate"
                      >
                        {emp.name}
                      </Link>
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {emp.employee_id || `#${emp.id}`}
                      </span>
                    </div>
                  </div>

                  {renderStatusBadge(emp.status)}
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {emp.designation_relation?.name || emp.designation || 'Staff'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">
                      {emp.department_relation?.name || emp.department || 'Operations'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono">{emp.phone || '-'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.branch?.name || 'All Branches'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {emp.role?.name || 'Role'}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/employees/${emp.id}`}
                      className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition"
                    >
                      {lang === 'bn' ? 'প্রোফাইল' : 'Profile'}
                    </Link>

                    {canEdit && (
                      <Link
                        to={`/employees/${emp.id}/edit`}
                        className="p-1 rounded-lg text-slate-400 hover:text-amber-600 transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-slate-500">
            {lang === 'bn'
              ? `মোট ${pagination.total} জন কর্মীর মধ্যে পৃষ্ঠা ${pagination.current_page} এর ${pagination.last_page}`
              : `Showing page ${pagination.current_page} of ${pagination.last_page} (${pagination.total} total)`}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchEmployees(pagination.current_page - 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
            </button>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchEmployees(pagination.current_page + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              {lang === 'bn' ? 'পরবর্তী' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
