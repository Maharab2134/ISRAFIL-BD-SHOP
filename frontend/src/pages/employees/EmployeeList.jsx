import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  Shield,
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
} from 'lucide-react';

export default function EmployeeList() {
  const { t, lang } = useLanguage();
  const { success, error } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.slug === 'super-admin' || user?.email === 'admin@israfilbd.com';

  const [employees, setEmployees] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_employees_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_employees_cache');
      return !cached || JSON.parse(cached).length === 0;
    } catch (e) {
      return true;
    }
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roles, setRoles] = useState([]);

  const [pagination, setPagination] = useState(() => {
    try {
      const cached = sessionStorage.getItem('israfil_employees_pagination');
      return cached ? JSON.parse(cached) : { current_page: 1, last_page: 1, total: 0 };
    } catch (e) {
      return { current_page: 1, last_page: 1, total: 0 };
    }
  });

  // Multi-select & Inline Delete (Strict NO-MODAL Policy)
  const [selectedIds, setSelectedIds] = useState([]);
  const [inlineDeleteTarget, setInlineDeleteTarget] = useState(null); // { item: emp, isBulk: bool }
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = async (
    page = pagination.current_page,
    searchQuery = search,
    rId = roleFilter,
    dept = deptFilter,
    st = statusFilter
  ) => {
    if (employees.length === 0) {
      setLoading(true);
    }
    try {
      const params = { page, search: searchQuery };
      if (rId) params.role_id = rId;
      if (dept) params.department = dept;
      if (st) params.status = st;

      const res = await api.get('/employees', { params });
      const loadedEmployees = res.data.data || [];
      const loadedPagination = {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      };
      setEmployees(loadedEmployees);
      setPagination(loadedPagination);

      try {
        const empJson = JSON.stringify(loadedEmployees);
        if (empJson.length < 500000) {
          sessionStorage.setItem('israfil_employees_cache', empJson);
          sessionStorage.setItem('israfil_employees_pagination', JSON.stringify(loadedPagination));
        }
      } catch (e) {}
    } catch (err) {
      error(lang === 'bn' ? 'কর্মী তালিকা লোড করতে সমস্যা হয়েছে।' : 'Failed to load employee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
    // Fetch roles for filter dropdown
    api.get('/roles').then((res) => setRoles(res.data || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(1, search, roleFilter, deptFilter, statusFilter);
  };

  const handleFilterChange = (field, val) => {
    if (field === 'role') {
      setRoleFilter(val);
      fetchEmployees(1, search, val, deptFilter, statusFilter);
    } else if (field === 'dept') {
      setDeptFilter(val);
      fetchEmployees(1, search, roleFilter, val, statusFilter);
    } else if (field === 'status') {
      setStatusFilter(val);
      fetchEmployees(1, search, roleFilter, deptFilter, val);
    }
  };

  // Selection handlers
  const isAllSelected = employees.length > 0 && employees.every((emp) => selectedIds.includes(emp.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((emp) => emp.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Strict NO-MODAL: Execute Deletion
  const handleConfirmDelete = async () => {
    if (!inlineDeleteTarget) return;
    setDeleting(true);
    try {
      if (inlineDeleteTarget.isBulk) {
        const res = await api.post('/employees/bulk-delete', { ids: selectedIds });
        success(res.data.message || (lang === 'bn' ? 'নির্বাচিত কর্মী মুছে ফেলা হয়েছে।' : 'Employees deleted.'));
        setSelectedIds([]);
      } else if (inlineDeleteTarget.item) {
        await api.delete(`/employees/${inlineDeleteTarget.item.id}`);
        success(
          lang === 'bn'
            ? `"${inlineDeleteTarget.item.name}" মুছে ফেলা হয়েছে।`
            : 'Employee deleted successfully.'
        );
        setSelectedIds((prev) => prev.filter((id) => id !== inlineDeleteTarget.item.id));
      }
      setInlineDeleteTarget(null);
      fetchEmployees(pagination.current_page, search, roleFilter, deptFilter, statusFilter);
    } catch (err) {
      error(err.response?.data?.message || (lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ হয়েছে।' : 'Failed to delete.'));
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (role) => {
    if (!role) return null;
    if (role.slug === 'super-admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Shield className="w-3 h-3" />
          {role.name_bn || role.name}
        </span>
      );
    }
    if (role.slug === 'admin' || role.slug === 'manager' || role.slug === 'branch-manager') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <ShieldCheck className="w-3 h-3" />
          {role.name_bn || role.name}
        </span>
      );
    }
    if (role.slug === 'cashier' || role.slug === 'sales-staff') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <UserCheck className="w-3 h-3" />
          {role.name_bn || role.name}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <UserCheck className="w-3 h-3" />
        {role.name_bn || role.name}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Users className="w-6 h-6" />
            </div>
            <span>{lang === 'bn' ? 'সুপার শপ কর্মী পরিচালনা' : 'Enterprise Staff Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'দোকান ও শাখা ভিত্তিক কর্মীদের পদবী, আইডি, দায়িত্ব ও এক্সেস নিয়ন্ত্রণ করুন'
              : 'Manage departmental staff profiles, branch assignments, credentials, and access roles'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isSuperAdmin && (
            <Link
              to="/roles"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>{lang === 'bn' ? 'ভূমিকা ও পারমিশন' : 'Roles & Permissions'}</span>
            </Link>
          )}

          <Link
            to="/employees/new"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন কর্মী যুক্ত করুন' : 'Add Employee'}</span>
          </Link>
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
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
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
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'নাম, কর্মী আইডি (EMP-XXXX), ইমেইল, পদবী বা ফোন দিয়ে খুঁজুন...'
                : 'Search by employee ID, name, email, designation, phone...'
            }
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{lang === 'bn' ? 'সকল রোল' : 'All Roles'}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {lang === 'bn' ? (r.name_bn || r.name) : r.name}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => handleFilterChange('dept', e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{lang === 'bn' ? 'সকল বিভাগ' : 'All Departments'}</option>
            <option value="Executive Board">Executive Board</option>
            <option value="Administration">Administration</option>
            <option value="Retail Operations">Retail Operations</option>
            <option value="Front Desk & Cash">Front Desk & Cash</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
            <option value="Inventory & Supply Chain">Inventory & Supply Chain</option>
            <option value="Procurement">Procurement</option>
            <option value="Customer Experience">Customer Experience</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Internal Audit & Compliance">Internal Audit & Compliance</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{lang === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
            <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              {lang === 'bn'
                ? `${selectedIds.length} জন কর্মী বাছাই করা হয়েছে`
                : `${selectedIds.length} employee(s) selected`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="py-1 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              {lang === 'bn' ? 'বাছাই বাতিল' : 'Deselect'}
            </button>
            <button
              onClick={() => setInlineDeleteTarget({ isBulk: true })}
              className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নির্বাচিতগুলো মুছুন' : 'Delete Selected'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Employee Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">{t('loading')}</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">{t('noData')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'কর্মী ও আইডি' : 'Employee & ID'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'পদবী ও বিভাগ' : 'Designation & Dept'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'রোল ও শাখা' : 'Role & Branch'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'যোগাযোগ' : 'Contact'}</th>
                  <th className="py-3 px-4">{t('status')}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'যোগদানের তারিখ' : 'Joining Date'}</th>
                  <th className="py-3 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => {
                  const isSelected = selectedIds.includes(emp.id);
                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(emp.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                            {emp.name ? emp.name[0].toUpperCase() : 'E'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {emp.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono font-bold flex items-center gap-1">
                              <span>{emp.employee_id || `ID#${emp.id}`}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {emp.designation || '—'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {emp.department || 'General'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div>{getRoleBadge(emp.role)}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{emp.branch ? (emp.branch.name_bn || emp.branch.name) : 'Main Branch'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {emp.email}
                          </div>
                          {emp.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {emp.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {emp.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle className="w-3 h-3" />
                            {t('active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                            <XCircle className="w-3 h-3" />
                            {t('inactive')}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {emp.joining_date
                          ? emp.joining_date
                          : emp.created_at
                          ? new Date(emp.created_at).toLocaleDateString('bn-BD', { dateStyle: 'medium' })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={`/employees/edit/${emp.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>{t('edit')}</span>
                          </Link>
                          {emp.id !== user?.id && emp.role?.slug !== 'super-admin' && (
                            <button
                              type="button"
                              onClick={() => setInlineDeleteTarget({ item: emp, isBulk: false })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'bn'
                ? `পৃষ্ঠা ${pagination.current_page} এর ${pagination.last_page} (মোট ${pagination.total} জন কর্মী)`
                : `Page ${pagination.current_page} of ${pagination.last_page} (Total ${pagination.total} staff)`}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => fetchEmployees(pagination.current_page - 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchEmployees(pagination.current_page + 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {lang === 'bn' ? 'পরবর্তী' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
