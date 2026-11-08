import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const DesignationList = () => {
  const { lang } = useLanguage();
  const { success, error } = useToast();
  const { user: currentUser, hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSuperAdmin = currentUser?.role?.slug === 'super-admin' || currentUser?.email === 'admin@israfilbd.com';
  const canCreate = isSuperAdmin || hasPermission('designations.create');
  const canEdit = isSuperAdmin || hasPermission('designations.edit');
  const canDelete = isSuperAdmin || hasPermission('designations.delete');

  const [loading, setLoading] = useState(true);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState(searchParams.get('department_id') || '');
  const [statusFilter, setStatusFilter] = useState('');

  // Inline Form State (NO-MODAL Policy)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    department_id: '',
    name: '',
    name_bn: '',
    code: '',
    description: '',
    status: 'active',
  });

  // Inline Delete State (NO-MODAL Policy)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, [deptFilter, statusFilter]);

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (deptFilter) params.department_id = deptFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/designations', { params });
      setDesignations(res.data || []);
    } catch (err) {
      error(lang === 'bn' ? 'পদবী তালিকা লোড করা যায়নি।' : 'Failed to load designations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data || []);
    } catch (e) {
      // quiet
    }
  };

  const handleOpenCreate = () => {
    setEditingDesignation(null);
    setFormData({
      department_id: deptFilter || (departments[0]?.id ? String(departments[0].id) : ''),
      name: '',
      name_bn: '',
      code: '',
      description: '',
      status: 'active',
    });
    setDeleteTarget(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEdit = (desig) => {
    setEditingDesignation(desig);
    setFormData({
      department_id: desig.department_id ? String(desig.department_id) : '',
      name: desig.name || '',
      name_bn: desig.name_bn || '',
      code: desig.code || '',
      description: desig.description || '',
      status: desig.status || 'active',
    });
    setDeleteTarget(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDesignation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.department_id) {
      error(lang === 'bn' ? 'পদবীর নাম ও বিভাগ আবশ্যক।' : 'Designation name and department are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        department_id: Number(formData.department_id),
        name: formData.name.trim(),
        name_bn: formData.name_bn.trim() || null,
        code: formData.code.trim().toUpperCase() || null,
        description: formData.description.trim() || null,
        status: formData.status,
      };

      if (editingDesignation) {
        await api.put(`/designations/${editingDesignation.id}`, payload);
        success(lang === 'bn' ? 'পদবীর তথ্য সফলভাবে হালনাগাদ করা হয়েছে।' : 'Designation updated successfully.');
      } else {
        await api.post('/designations', payload);
        success(lang === 'bn' ? 'নতুন পদবী সফলভাবে তৈরি হয়েছে।' : 'Designation created successfully.');
      }

      handleCloseForm();
      fetchDesignations();
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save designation.');
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (desig) => {
    if (desig.employees_count > 0) {
      error(
        lang === 'bn'
          ? `এই পদবীতে ${desig.employees_count} জন সক্রিয় কর্মী রয়েছে। ডিলিট করার পূর্বে কর্মীদের অন্য পদবীতে স্থানান্তর করতে হবে।`
          : `This designation has ${desig.employees_count} active employees. Reassign employees before deleting.`
      );
      return;
    }

    setDeleteLoading(true);
    try {
      await api.delete(`/designations/${desig.id}`);
      success(lang === 'bn' ? 'পদবী সফলভাবে অপসারণ করা হয়েছে।' : 'Designation deleted successfully.');
      setDeleteTarget(null);
      fetchDesignations();
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'অপসারণ ব্যর্থ হয়েছে।' : 'Failed to delete designation.');
      error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered List
  const filteredDesignations = designations.filter((desig) => {
    return (
      !search ||
      desig.name.toLowerCase().includes(search.toLowerCase()) ||
      (desig.name_bn && desig.name_bn.includes(search)) ||
      (desig.code && desig.code.toLowerCase().includes(search.toLowerCase())) ||
      (desig.department?.name && desig.department.name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalDesigs = designations.length;
  const activeDesigs = designations.filter((d) => d.status === 'active').length;
  const totalEmployeesWithDesig = designations.reduce((acc, d) => acc + (d.employees_count || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {lang === 'bn' ? 'পদবী ব্যবস্থাপনা (Designations)' : 'Designation Management'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'বিভাগভিত্তিক চাকরির পদবী, দায়িত্ব ও কর্মী সংযোগ ব্যবস্থাপনা'
                  : 'Manage job designations, professional hierarchy, and department assignments'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDesignations}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title={lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && !isFormOpen && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন পদবী যুক্ত করুন' : 'Add Designation'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'সর্বমোট পদবী' : 'Total Designations'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalDesigs}</span>
            <Briefcase className="w-5 h-5 text-purple-500 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {lang === 'bn' ? 'সক্রিয় পদবী' : 'Active Designations'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeDesigs}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-60" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            {lang === 'bn' ? 'পদবীপ্রাপ্ত সক্রিয় কর্মী' : 'Employees with Designation'}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{totalEmployeesWithDesig}</span>
            <Users className="w-5 h-5 text-sky-500 opacity-60" />
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
                {lang === 'bn' ? 'পদবী অপসারণ নিশ্চিতকরণ' : 'Confirm Designation Deletion'}
              </h3>
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-1">
                {lang === 'bn'
                  ? `আপনি কি নিশ্চিত যে '${deleteTarget.name}' পদবীটি স্থায়ীভাবে মুছে ফেলতে চান?`
                  : `Are you sure you want to permanently delete '${deleteTarget.name}'?`}
              </p>
              {deleteTarget.employees_count > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-100/80 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {lang === 'bn'
                      ? `সতর্কতা: এই পদবীতে বর্তমানে ${deleteTarget.employees_count} জন সক্রিয় কর্মী রয়েছেন! তাদের স্থানান্তর না করা পর্যন্ত পদবীটি ডিলিট করা যাবে না।`
                      : `Warning: This designation currently has ${deleteTarget.employees_count} active employees! They must be reassigned before deletion.`}
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

      {/* Inline Designation Create / Edit Form (Strict NO-MODAL Policy) */}
      {isFormOpen && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-purple-500/30 dark:border-purple-500/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {editingDesignation
                  ? lang === 'bn'
                    ? `পদবী সম্পাদনা: ${editingDesignation.name}`
                    : `Edit Designation: ${editingDesignation.name}`
                  : lang === 'bn'
                  ? 'নতুন পদবী তৈরি করুন'
                  : 'Create New Designation'}
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
                  {lang === 'bn' ? 'সংশ্লিষ্ট বিভাগ (Department) *' : 'Department *'}
                </label>
                <select
                  required
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="">{lang === 'bn' ? '-- বিভাগ নির্বাচন করুন --' : '-- Select Department --'}</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পদবীর নাম (ইংরেজি) *' : 'Designation Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Senior Cashier"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পদবীর নাম (বাংলা)' : 'Designation Name (Bangla)'}
                </label>
                <input
                  type="text"
                  value={formData.name_bn}
                  onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  placeholder="উদাঃ সিনিয়র ক্যাশিয়ার"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পদবী কোড (Code - ঐচ্ছিক)' : 'Designation Code (Optional)'}
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. DES-SR-CSH (ফাঁকা রাখলে অটো তৈরি হবে)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'স্ট্যাটাস (Status)' : 'Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                  <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'দায়িত্ব ও বিবরণ (Description)' : 'Responsibilities & Description'}
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={lang === 'bn' ? 'পদবীর মূল দায়িত্বসমূহ লিখুন...' : 'Primary responsibilities and duties...'}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{editingDesignation ? (lang === 'bn' ? 'আপডেট করুন' : 'Update') : (lang === 'bn' ? 'তৈরি করুন' : 'Save')}</span>
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
            placeholder={lang === 'bn' ? 'পদবী নাম, কোড, বিভাগ খুঁজুন...' : 'Search designation, code, department...'}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              if (e.target.value) {
                setSearchParams({ department_id: e.target.value });
              } else {
                setSearchParams({});
              }
            }}
            className="w-full sm:w-52 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden cursor-pointer"
          >
            <option value="">{lang === 'bn' ? 'সকল বিভাগ' : 'All Departments'}</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden cursor-pointer"
          >
            <option value="">{lang === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="active">{lang === 'bn' ? 'সক্রিয়' : 'Active Only'}</option>
            <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}</option>
          </select>
        </div>
      </div>

      {/* Designation Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-700/80">
              <tr>
                <th className="p-4">{lang === 'bn' ? 'পদবী কোড' : 'Code'}</th>
                <th className="p-4">{lang === 'bn' ? 'পদবীর নাম' : 'Designation Name'}</th>
                <th className="p-4">{lang === 'bn' ? 'সংশ্লিষ্ট বিভাগ' : 'Department'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'নিযুক্ত কর্মী' : 'Assigned Staff'}</th>
                <th className="p-4 text-center">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="p-4 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-purple-500" />
                    <span>{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading designations...'}</span>
                  </td>
                </tr>
              ) : filteredDesignations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span>{lang === 'bn' ? 'কোনো পদবী পাওয়া যায়নি' : 'No designations found'}</span>
                  </td>
                </tr>
              ) : (
                filteredDesignations.map((desig) => {
                  const isActive = desig.status === 'active';
                  return (
                    <tr key={desig.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                      <td className="p-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {desig.code}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {desig.name}
                        </div>
                        {desig.name_bn && (
                          <div className="text-[11px] text-slate-400">
                            {desig.name_bn}
                          </div>
                        )}
                        {desig.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {desig.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {desig.department ? (
                          <Link
                            to={`/departments`}
                            className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{desig.department.name}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            {lang === 'bn' ? 'অনির্ধারিত' : 'Unassigned'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          to={`/employees?designation_id=${desig.id}`}
                          className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{desig.employees_count || 0}</span>
                        </Link>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isActive ? (
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
                              onClick={() => handleOpenEdit(desig)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-700 transition cursor-pointer"
                              title={lang === 'bn' ? 'সম্পাদনা করুন' : 'Edit Designation'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => {
                                setEditingDesignation(null);
                                setIsFormOpen(false);
                                setDeleteTarget(desig);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition cursor-pointer"
                              title={lang === 'bn' ? 'অপসারণ করুন' : 'Delete Designation'}
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

export default DesignationList;

