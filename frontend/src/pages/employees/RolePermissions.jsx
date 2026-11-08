import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Search,
  Check,
  X,
  Sliders,
  Sparkles,
  Lock,
  Layers,
  Package,
  ShoppingCart,
  Truck,
  ShoppingBag,
  WalletCards,
  FileSpreadsheet,
  Activity,
  Settings,
  Copy,
  Store,
  Headphones,
  FileCheck,
  Building2,
  RefreshCw,
  Info,
} from 'lucide-react';
import api from '../../services/api';

export const RolePermissions = () => {
  const { lang, formatNumber } = useLanguage();
  const { success, error } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.slug === 'super-admin' || user?.email === 'admin@israfilbd.com';

  const [roles, setRoles] = useState([]);
  const [permissionsGrouped, setPermissionsGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all, system, custom

  // Strict NO-MODAL: Inline Role Editor Panel
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', name_bn: '', description: '' });
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Strict NO-MODAL: Inline Delete Confirmation State
  const [deletingRoleId, setDeletingRoleId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Duplicating state
  const [duplicatingId, setDuplicatingId] = useState(null);

  // Comprehensive 16 Categories Meta
  const groupMeta = {
    dashboard: {
      name: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
      icon: Activity,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    pos: {
      name: lang === 'bn' ? 'বিক্রয় টার্মিনাল (POS)' : 'POS Terminal',
      icon: ShoppingCart,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    },
    products: {
      name: lang === 'bn' ? 'পণ্য ও ক্যাটালগ' : 'Products & Catalog',
      icon: Package,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    },
    inventory: {
      name: lang === 'bn' ? 'ইনভেন্টরি ও স্টক' : 'Inventory & Stock',
      icon: Layers,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    },
    purchases: {
      name: lang === 'bn' ? 'পাইকারি ক্রয় ও সাপ্লায়ার' : 'Purchase & Suppliers',
      icon: ShoppingBag,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
    },
    sales: {
      name: lang === 'bn' ? 'বিক্রয় ও ফেরত' : 'Sales & Returns',
      icon: ShoppingCart,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800',
    },
    customers: {
      name: lang === 'bn' ? 'গ্রাহক ও লয়্যালটি' : 'Customers & Loyalty',
      icon: Users,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
    },
    employees: {
      name: lang === 'bn' ? 'কর্মী ও উপস্থিতি' : 'Employees & Staff',
      icon: Users,
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800',
    },
    accounting: {
      name: lang === 'bn' ? 'হিসাবরক্ষণ ও নগদ প্রবাহ' : 'Accounting & Finance',
      icon: FileSpreadsheet,
      color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    },
    expenses: {
      name: lang === 'bn' ? 'দোকানের খরচ' : 'Store Expenses',
      icon: WalletCards,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    },
    reports: {
      name: lang === 'bn' ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics',
      icon: Activity,
      color: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    },
    warehouse: {
      name: lang === 'bn' ? 'ওয়্যারহাউস' : 'Warehouse',
      icon: Store,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800',
    },
    customer_service: {
      name: lang === 'bn' ? 'গ্রাহক সেবা' : 'Customer Service',
      icon: Headphones,
      color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800',
    },
    audit: {
      name: lang === 'bn' ? 'অডিট ও কার্যকলাপ লগ' : 'Audit & Activity Logs',
      icon: FileCheck,
      color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    },
    branch: {
      name: lang === 'bn' ? 'শাখা ব্যবস্থাপনা' : 'Branch Management',
      icon: Building2,
      color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    settings: {
      name: lang === 'bn' ? 'সিস্টেম সেটিংস' : 'System Settings',
      icon: Settings,
      color: 'text-slate-700 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    },
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions'),
      ]);
      setRoles(rolesRes.data || []);
      setPermissionsGrouped(permsRes.data || {});
    } catch (err) {
      error(lang === 'bn' ? 'ভূমিকা ও পারমিশন লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load roles and permissions.');
    } finally {
      setLoading(false);
    }
  };

  // Open Inline Role Editor
  const handleOpenEditor = (role = null) => {
    setEditingRole(role);
    if (role) {
      setRoleForm({
        name: role.name || '',
        name_bn: role.name_bn || '',
        description: role.description || '',
      });
    } else {
      setRoleForm({ name: '', name_bn: '', description: '' });
    }
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingRole(null);
    setRoleForm({ name: '', name_bn: '', description: '' });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      error(lang === 'bn' ? 'ভূমিকার নাম আবশ্যক।' : 'Role name is required.');
      return;
    }

    setIsSavingRole(true);
    try {
      if (editingRole) {
        const res = await api.put(`/roles/${editingRole.id}`, roleForm);
        setRoles((prev) =>
          prev.map((r) => (r.id === editingRole.id ? { ...r, ...res.data.role } : r))
        );
        success(lang === 'bn' ? 'ভূমিকা সফলভাবে আপডেট হয়েছে!' : 'Role updated successfully!');
      } else {
        const res = await api.post('/roles', roleForm);
        setRoles((prev) => [...prev, res.data.role]);
        success(lang === 'bn' ? 'নতুন ভূমিকা সফলভাবে তৈরি হয়েছে!' : 'New role created successfully!');
      }
      handleCloseEditor();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (lang === 'bn' ? 'ভূমিকা সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save role.');
      error(msg);
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleDuplicateRole = async (role) => {
    setDuplicatingId(role.id);
    try {
      const res = await api.post(`/roles/${role.id}/duplicate`);
      setRoles((prev) => [...prev, res.data.role]);
      success(
        lang === 'bn'
          ? `'${role.name_bn || role.name}' সফলভাবে ডুপ্লিকেট করা হয়েছে!`
          : `'${role.name}' duplicated successfully!`
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (lang === 'bn' ? 'রোল ডুপ্লিকেট করতে ব্যর্থ হয়েছে।' : 'Failed to duplicate role.');
      error(msg);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDeleteRole = async (role) => {
    setIsDeleting(true);
    try {
      await api.delete(`/roles/${role.id}`);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      setDeletingRoleId(null);
      success(lang === 'bn' ? 'ভূমিকা সফলভাবে মুছে ফেলা হয়েছে!' : 'Role deleted successfully!');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (lang === 'bn' ? 'ভূমিকা মুছে ফেলা সম্ভব হয়নি।' : 'Failed to delete role.');
      error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPossiblePermissions = Object.values(permissionsGrouped).reduce(
    (acc, curr) => acc + curr.length,
    0
  );

  // Filter roles based on search and system/custom tabs
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      (role.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.name_bn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter === 'system') return role.is_system;
    if (roleFilter === 'custom') return !role.is_system;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {lang === 'bn' ? 'সুপার শপ রোল ও পারমিশন কন্ট্রোল' : 'Enterprise RBAC Role Management'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? '১২টি ডিফল্ট এন্টারপ্রাইজ ভূমিকা এবং কাস্টম রোলসমূহ পরিচালনা করুন'
                  : 'Manage 12 predefined retail roles and custom permissions across branches'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Inline Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/employees"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {lang === 'bn' ? '👥 কর্মী তালিকা' : 'Staff List'}
          </Link>
          <Link
            to="/activity-logs"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {lang === 'bn' ? '📋 অডিট ও কার্যকলাপ লগ' : 'Activity Logs'}
          </Link>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => (isEditorOpen ? handleCloseEditor() : handleOpenEditor(null))}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              {isEditorOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>
                {isEditorOpen
                  ? (lang === 'bn' ? 'ফর্ম বন্ধ করুন' : 'Close Form')
                  : (lang === 'bn' ? 'নতুন কাস্টম রোল তৈরি' : 'Create Custom Role')}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* STRICT NO-MODAL: INLINE ROLE CREATION / EDIT PANEL */}
      {/* ======================================================== */}
      {isEditorOpen && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border-2 border-indigo-500/40 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingRole
                    ? (lang === 'bn' ? `রোল সম্পাদনা: ${editingRole.name}` : `Edit Role: ${editingRole.name}`)
                    : (lang === 'bn' ? 'নতুন কাস্টম রোল তৈরি করুন' : 'Create New Custom Role')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'bn'
                    ? 'ভূমিকার নাম ও বিবরণ দিন। তৈরির পর পারমিশন কাস্টমাইজ করতে পারবেন।'
                    : 'Provide role title and description. You can configure granular permissions next.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseEditor}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveRole} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ভূমিকার নাম (English) *' : 'Role Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                placeholder="e.g. Senior Shift Supervisor, Assistant Accountant"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ভূমিকার বাংলা নাম' : 'Role Name (Bengali)'}
              </label>
              <input
                type="text"
                value={roleForm.name_bn}
                onChange={(e) => setRoleForm({ ...roleForm, name_bn: e.target.value })}
                placeholder="যেমন: সিনিয়র শিফট সুপারভাইজার, সহকারী হিসাবরক্ষক"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'বিবরণ ও কাজের পরিধি' : 'Role Description & Scope'}
              </label>
              <textarea
                rows="2"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder={lang === 'bn' ? 'এই ভূমিকার দায়িত্বসমূহ এবং সুপার শপে কাজের আওতা...' : 'Scope and responsibility of this position in super shop...'}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2 pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseEditor}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSavingRole}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingRole && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {editingRole
                    ? (lang === 'bn' ? 'আপডেট সংরক্ষণ' : 'Update Role')
                    : (lang === 'bn' ? 'রোল তৈরি করুন' : 'Create Role')}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Enterprise Security Advisory Pill */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <div className="font-bold text-indigo-900 dark:text-indigo-200">
            {lang === 'bn' ? 'সুপার শপ রোল ব্যবস্থাপনা ও সুরক্ষা নীতি:' : 'Super Shop RBAC Security Architecture:'}
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {lang === 'bn'
              ? 'ক্যাশিয়ারগণ পণ্যের ক্রয়মূল্য ও লাভ দেখতে পারবেন না এবং বিক্রয় ফেরত অনুমোদনের ক্ষমতা শুধুমাত্র ব্যবস্থাপকদের জন্য সংরক্ষিত। যেকোনো রোল ডুপ্লিকেট করে সহজেই বিশেষ শাখা বা দায়িত্বের জন্য নতুন রোল তৈরি করতে পারেন।'
              : 'Cashiers are strictly forbidden from viewing product cost prices/profit margins, and refunds require manager authorization. You can one-click duplicate any role to quickly provision branch-specific privileges.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'রোল বা দায়িত্ব অনুসন্ধান করুন...' : 'Search roles by name or responsibility...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {lang === 'bn' ? `সকল রোল (${formatNumber(roles.length)})` : `All (${roles.length})`}
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('system')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'system'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {lang === 'bn'
              ? `ডিফল্ট সিস্টেম রোল (${formatNumber(roles.filter((r) => r.is_system).length)})`
              : `Default Roles (${roles.filter((r) => r.is_system).length})`}
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === 'custom'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {lang === 'bn'
              ? `কাস্টম রোল (${formatNumber(roles.filter((r) => !r.is_system).length)})`
              : `Custom Roles (${roles.filter((r) => !r.is_system).length})`}
          </button>
        </div>
      </div>

      {/* Role Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">{lang === 'bn' ? 'রোল ও পারমিশন লোড হচ্ছে...' : 'Loading roles and permissions...'}</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="p-12 text-center text-slate-400 space-y-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            {lang === 'bn' ? 'কোনো ভূমিকা খুঁজে পাওয়া যায়নি' : 'No roles found'}
          </p>
          <p className="text-xs text-slate-400">
            {lang === 'bn' ? 'অনুসন্ধানের কীওয়ার্ড পরিবর্তন করুন অথবা নতুন ভূমিকা তৈরি করুন।' : 'Try another search query or create a new custom role.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoles.map((role) => {
            const isSuper = role.slug === 'super-admin';
            const permCount = isSuper ? totalPossiblePermissions : (role.permissions || []).length;
            const percent = totalPossiblePermissions > 0 ? Math.round((permCount / totalPossiblePermissions) * 100) : 0;
            const isDeletingThis = deletingRoleId === role.id;

            return (
              <div
                key={role.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isSuper
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          : role.is_system
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                      }`}
                    >
                      {isSuper
                        ? (lang === 'bn' ? 'সিস্টেম ওনার' : 'System Owner')
                        : role.is_system
                        ? (lang === 'bn' ? 'ডিফল্ট ভূমিকা' : 'Default Role')
                        : (lang === 'bn' ? 'কাস্টম ভূমিকা' : 'Custom Role')}
                    </span>

                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatNumber(role.users_count || 0)} {lang === 'bn' ? 'কর্মী' : 'Staff'}</span>
                    </span>
                  </div>

                  {/* Role Title & Description */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center gap-2">
                      <span>{lang === 'bn' ? (role.name_bn || role.name) : role.name}</span>
                      {isSuper && <Shield className="w-4 h-4 text-rose-500 fill-rose-500/20" />}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {role.description || (lang === 'bn' ? 'সুপার শপে নির্দিষ্ট কাজের অনুমতিপ্রাপ্ত কর্মী ভূমিকা' : 'Staff role with configured permissions')}
                    </p>
                  </div>

                  {/* Permission Coverage Bar */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{lang === 'bn' ? 'পারমিশন আওতা' : 'Permission Coverage'}</span>
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                        {isSuper ? '১০০%' : `${formatNumber(permCount)} / ${formatNumber(totalPossiblePermissions)}`}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSuper ? 'bg-rose-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${isSuper ? 100 : percent}%` }}
                      />
                    </div>
                  </div>

                  {/* STRICT NO-MODAL: INLINE DELETE CONFIRMATION BOX */}
                  {isDeletingThis && (
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-rose-900 dark:text-rose-200 leading-snug">
                          <p className="font-bold">
                            {lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}
                          </p>
                          <p className="text-[11px] text-rose-700 dark:text-rose-300">
                            {lang === 'bn'
                              ? `'${role.name}' রোলটি মুছে ফেলা হবে।`
                              : `Role '${role.name}' will be permanently deleted.`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setDeletingRoleId(null)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-white"
                        >
                          {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role)}
                          disabled={isDeleting}
                          className="px-3 py-1 text-xs rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs flex items-center gap-1"
                        >
                          {isDeleting && <RefreshCw className="w-3 h-3 animate-spin" />}
                          <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  {isSuper ? (
                    <div className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-center text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 select-none">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'bn' ? 'পূর্ণ প্ল্যাটফর্ম নিয়ন্ত্রণ (সংরক্ষিত)' : 'Full Root Access (Reserved)'}</span>
                    </div>
                  ) : (
                    <>
                      <Link
                        to={`/roles/${role.id}/permissions`}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                        title={lang === 'bn' ? 'কাজের অনুমতি কনফিগার করুন' : 'Configure Permissions'}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'পারমিশন কনফিগার' : 'Configure'}</span>
                      </Link>

                      {/* Duplicate Role Button (Available for all roles!) */}
                      <button
                        type="button"
                        onClick={() => handleDuplicateRole(role)}
                        disabled={duplicatingId === role.id}
                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                        title={lang === 'bn' ? 'রোল ডুপ্লিকেট করুন' : 'Duplicate Role'}
                      >
                        {duplicatingId === role.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Edit & Delete (Custom Roles only) */}
                      {!role.is_system && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEditor(role)}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title={lang === 'bn' ? 'ভূমিকা সম্পাদন' : 'Edit Role'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingRoleId(role.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title={lang === 'bn' ? 'ভূমিকা মুছুন' : 'Delete Role'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RolePermissions;
