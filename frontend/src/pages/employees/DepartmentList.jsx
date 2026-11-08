import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  Briefcase,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const DepartmentList = () => {
  const { lang } = useLanguage();
  const { success, error } = useToast();
  const { user: currentUser, hasPermission } = useAuth();

  const isSuperAdmin = currentUser?.role?.slug === 'super-admin' || currentUser?.email === 'admin@israfilbd.com';
  const canCreate = isSuperAdmin || hasPermission('departments.create');
  const canEdit = isSuperAdmin || hasPermission('departments.edit');
  const canDelete = isSuperAdmin || hasPermission('departments.delete');
  const canAssignHead = isSuperAdmin || hasPermission('departments.assign_head');

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [potentialHeads, setPotentialHeads] = useState([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Inline Form State (NO-MODAL)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_bn: '',
    code: '',
    description: '',
    head_id: '',
    branch_id: '',
    status: 'active',
  });

  // Inline Delete Confirmation State (NO-MODAL)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchMetadata();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data || []);
    } catch (err) {
      error(lang === 'bn' ? 'বিভাগ তালিকা লোড করা যায়নি।' : 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [branchRes, empRes] = await Promise.all([
        api.get('/branches').catch(() => ({ data: [] })),
        api.get('/employees?per_page=100').catch(() => ({ data: { data: [] } })),
      ]);
      setBranches(branchRes.data?.data || branchRes.data || []);
      const empList = empRes.data?.data || empRes.data || [];
      setPotentialHeads(empList);
    } catch (e) {
      // quiet
    }
  };

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      name_bn: '',
      code: '',
      description: '',
      head_id: '',
      branch_id: '',
      status: 'active',
    });
    setDeleteTarget(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name || '',
      name_bn: dept.name_bn || '',
      code: dept.code || '',
      description: dept.description || '',
      head_id: dept.head_id ? String(dept.head_id) : '',
      branch_id: dept.branch_id ? String(dept.branch_id) : '',
      status: dept.status || 'active',
    });
    setDeleteTarget(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDept(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      error(lang === 'bn' ? 'বিভাগের নাম ও কোড আবশ্যক।' : 'Department name and code are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        name_bn: formData.name_bn.trim() || null,
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || null,
        head_id: formData.head_id ? Number(formData.head_id) : null,
        branch_id: formData.branch_id ? Number(formData.branch_id) : null,
        status: formData.status,
      };

      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, payload);
        success(lang === 'bn' ? 'বিভাগের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।' : 'Department updated successfully.');
      } else {
        await api.post('/departments', payload);
        success(lang === 'bn' ? 'নতুন বিভাগ সফলভাবে তৈরি হয়েছে।' : 'Department created successfully.');
      }

      handleCloseForm();
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save department.');
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dept) => {
    if (dept.employees_count > 0) {
      error(
        lang === 'bn'
          ? `এই বিভাগে ${dept.employees_count} জন সক্রিয় কর্মী রয়েছে। ডিলিট করার পূর্বে কর্মীদের অন্য বিভাগে স্থানান্তর করতে হবে।`
          : `This department has ${dept.employees_count} active employees. Reassign employees before deleting.`
      );
      return;
    }

    setDeleteLoading(true);
    try {
      await api.delete(`/departments/${dept.id}`);
      success(lang === 'bn' ? 'বিভাগ সফলভাবে অপসারণ করা হয়েছে।' : 'Department deleted successfully.');
      setDeleteTarget(null);
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'অপসারণ ব্যর্থ হয়েছে।' : 'Failed to delete department.');
      error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered List
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      !search ||
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      (dept.name_bn && dept.name_bn.includes(search)) ||
      dept.code.toLowerCase().includes(search.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = !statusFilter || dept.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI calculations
  const totalDepts = departments.length;
  const activeDepts = departments.filter((d) => d.status === 'active').length;
  const totalAssignedStaff = departments.reduce((acc, d) => acc + (d.employees_count || 0), 0);
  const totalDesignations = departments.reduce((acc, d) => acc + (d.designations_count || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {lang === 'bn' ? 'বিভাগ ব্যবস্থাপনা (Departments)' : 'Department Management'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'সুপার শপের বিভাগীয় কাঠামো, বিভাগ প্রধান ও কর্মকর্তা ব্যবস্থাপনা'
                  : 'Manage organizational departments, department heads, and workforce distribution'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDepartments}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title={lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && !isFormOpen && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন বিভাগ যুক্ত করুন' : 'Add Department'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'সর্বমোট বিভাগ' : 'Total Departments'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalDepts}</span>
            <Building2 className="w-5 h-5 text-indigo-500 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {lang === 'bn' ? 'সক্রিয় বিভাগ' : 'Active Departments'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeDepts}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            {lang === 'bn' ? 'নিযুক্ত কর্মী' : 'Assigned Employees'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{totalAssignedStaff}</span>
            <Users className="w-5 h-5 text-sky-500 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
            {lang === 'bn' ? 'মোট পদবী (Designations)' : 'Total Designations'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{totalDesignations}</span>
            <Briefcase className="w-5 h-5 text-purple-500 opacity-60" />
          </div>
        </div>
      </div>

      {/* Inline Delete Confirmation Alert (NO-MODAL Policy) */}
      {deleteTarget && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                {lang === 'bn' ? 'বিভাগ অপসারণ নিশ্চিতকরণ' : 'Confirm Department Deletion'}
              </h3>
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-1">
                {lang === 'bn'
                  ? `আপনি কি নিশ্চিত যে '${deleteTarget.name}' বিভাগটি স্থায়ীভাবে মুছে ফেলতে চান?`
                  : `Are you sure you want to permanently delete '${deleteTarget.name}'?`}
              </p>
              {deleteTarget.employees_count > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-100/80 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {lang === 'bn'
                      ? `সতর্কতা: এই বিভাগে বর্তমানে ${deleteTarget.employees_count} জন সক্রিয় কর্মী রয়েছেন! তাদের স্থানান্তর না করা পর্যন্ত বিভাগটি ডিলিট করা যাবে না।`
                      : `Warning: This department currently has ${deleteTarget.employees_count} active employees! They must be reassigned before deletion.`}
                  </span>
                </div>
              )}
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  disabled={deleteTarget.employees_count > 0 || deleteLoading}
                  onClick={() => handleDelete(deleteTarget)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  {deleteLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{lang === 'bn' ? 'স্থায়ীভাবে ডিলিট করুন' : 'Confirm Delete'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Department Create / Edit Form (Strict NO-MODAL Policy) */}
      {isFormOpen && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500/30 dark:border-indigo-500/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {editingDept
                  ? lang === 'bn'
                    ? `বিভাগ সম্পাদনা: ${editingDept.name}`
                    : `Edit Department: ${editingDept.name}`
                  : lang === 'bn'
                  ? 'নতুন বিভাগ তৈরি করুন'
                  : 'Create New Department'}
              </h2>
            </div>
            <button
              onClick={handleCloseForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিভাগের নাম (ইংরেজি) *' : 'Department Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Inventory & Stock"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিভাগের নাম (বাংলা)' : 'Department Name (Bangla)'}
                </label>
                <input
                  type="text"
                  value={formData.name_bn}
                  onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  placeholder="উদাঃ ইনভেন্টরি ও স্টক"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিভাগ কোড (Code) *' : 'Department Code *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. DEPT-INV"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিভাগ প্রধান (Department Head)' : 'Department Head'}
                </label>
                <select
                  value={formData.head_id}
                  onChange={(e) => setFormData({ ...formData, head_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="">{lang === 'bn' ? '-- প্রধান নির্বাচন করুন --' : '-- Select Department Head --'}</option>
                  {potentialHeads.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employee_id || emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'শাখা আওতা (Branch Scope)' : 'Branch Scope'}
                </label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="">{lang === 'bn' ? 'সকল শাখা (All Branches / Head Office)' : 'All Branches (Company Wide)'}</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'স্ট্যাটাস (Status)' : 'Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                  <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'বিভাগের বিবরণ (Description)' : 'Department Description'}
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={lang === 'bn' ? 'বিভাগের দায়িত্ব ও কাজের বিবরণ লিখুন...' : 'Brief summary of department responsibilities...'}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseForm}
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
                <span>{editingDept ? (lang === 'bn' ? 'আপডেট করুন' : 'Update') : (lang === 'bn' ? 'তৈরি করুন' : 'Save')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'বিভাগ নাম, কোড দিয়ে খুঁজুন...' : 'Search by name, code...'}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
          >
            <option value="">{lang === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="active">{lang === 'bn' ? 'শুধুমাত্র সক্রিয়' : 'Active Only'}</option>
            <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}</option>
          </select>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-700/80">
              <tr>
                <th className="p-4">{lang === 'bn' ? 'বিভাগ কোড' : 'Code'}</th>
                <th className="p-4">{lang === 'bn' ? 'বিভাগের নাম' : 'Department Name'}</th>
                <th className="p-4">{lang === 'bn' ? 'বিভাগ প্রধান' : 'Department Head'}</th>
                <th className="p-4">{lang === 'bn' ? 'শাখা আওতা' : 'Branch Scope'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'নিযুক্ত কর্মী' : 'Employees'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'পদবী সংখ্যা' : 'Designations'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-indigo-500" />
                    <span>{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading departments...'}</span>
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span>{lang === 'bn' ? 'কোনো বিভাগ পাওয়া যায়নি' : 'No departments found'}</span>
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => {
                  const isDeptActive = dept.status === 'active';
                  return (
                    <tr key={dept.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                      <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {dept.code}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {dept.name}
                        </div>
                        {dept.name_bn && (
                          <div className="text-[11px] text-slate-400">
                            {dept.name_bn}
                          </div>
                        )}
                        {dept.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {dept.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {dept.head ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                              {dept.head.avatar ? (
                                <img src={dept.head.avatar} alt="" className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                dept.head.name[0]?.toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white text-xs">
                                {dept.head.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {dept.head.employee_id || dept.head.phone}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            {lang === 'bn' ? 'অনির্ধারিত' : 'Unassigned'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {dept.branch ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {dept.branch.name}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                            {lang === 'bn' ? 'সকল শাখা' : 'All Branches'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          to={`/employees?department_id=${dept.id}`}
                          className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{dept.employees_count || 0}</span>
                        </Link>
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          to={`/designations?department_id=${dept.id}`}
                          className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{dept.designations_count || 0}</span>
                        </Link>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isDeptActive
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isDeptActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{lang === 'bn' ? 'সক্রিয়' : 'Active'}</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>{lang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(dept)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition cursor-pointer"
                              title={lang === 'bn' ? 'সম্পাদনা করুন' : 'Edit Department'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => {
                                setEditingDept(null);
                                setIsFormOpen(false);
                                setDeleteTarget(dept);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition cursor-pointer"
                              title={lang === 'bn' ? 'অপসারণ করুন' : 'Delete Department'}
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
    </div>
  );
};

export default DepartmentList;

