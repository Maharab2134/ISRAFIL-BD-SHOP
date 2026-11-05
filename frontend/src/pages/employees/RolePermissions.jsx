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
  HelpCircle,
  Save,
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';

export const RolePermissions = () => {
  const { lang, formatNumber } = useLanguage();
  const { success, error } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.slug === 'super-admin' || user?.email === 'admin@israfilbd.com';

  const [roles, setRoles] = useState([]);
  const [permissionsGrouped, setPermissionsGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  // Permission Configuration Modal
  const [configuringRole, setConfiguringRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [permSearch, setPermSearch] = useState('');

  // Create / Edit Role Modal
  const [roleModal, setRoleModal] = useState({ isOpen: false, role: null });
  const [roleForm, setRoleForm] = useState({ name: '', name_bn: '', description: '' });
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Delete Role Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, role: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Group metadata for nice icons and labels in Bengali
  const groupMeta = {
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
    customers: {
      name: lang === 'bn' ? 'গ্রাহক ও বাকি খাতা' : 'Customers & Dues',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    suppliers: {
      name: lang === 'bn' ? 'সরবরাহকারী' : 'Suppliers',
      icon: Truck,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    },
    purchases: {
      name: lang === 'bn' ? 'পাইকারি ক্রয়' : 'Purchases',
      icon: ShoppingBag,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
    },
    sales: {
      name: lang === 'bn' ? 'বিক্রয় চালান ও অর্ডার' : 'Sales & Invoices',
      icon: ShoppingCart,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800',
    },
    expenses: {
      name: lang === 'bn' ? 'দোকানের খরচ' : 'Store Expenses',
      icon: WalletCards,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    },
    accounting: {
      name: lang === 'bn' ? 'হিসাবরক্ষণ ও ক্যাশ ফ্লো' : 'Accounting & Cash Flow',
      icon: FileSpreadsheet,
      color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    },
    reports: {
      name: lang === 'bn' ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics',
      icon: Activity,
      color: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    },
    employees: {
      name: lang === 'bn' ? 'কর্মী ও ভূমিকা' : 'Employees & Staff',
      icon: Users,
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800',
    },
    settings: {
      name: lang === 'bn' ? 'সিস্টেম সেটিংস' : 'System Settings',
      icon: Settings,
      color: 'text-slate-600 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
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

  // Open Permission Editor for a Role
  const handleOpenPermissions = (role) => {
    setConfiguringRole(role);
    const initialIds = (role.permissions || []).map((p) => p.id);
    setSelectedPermissionIds(initialIds);
    setPermSearch('');
  };

  const handleTogglePermission = (id) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleGroup = (groupKey, shouldSelect) => {
    const groupPerms = permissionsGrouped[groupKey] || [];
    const groupIds = groupPerms.map((p) => p.id);

    setSelectedPermissionIds((prev) => {
      if (shouldSelect) {
        return [...new Set([...prev, ...groupIds])];
      } else {
        return prev.filter((id) => !groupIds.includes(id));
      }
    });
  };

  const handleSelectAll = () => {
    const allIds = [];
    Object.values(permissionsGrouped).forEach((group) => {
      group.forEach((p) => allIds.push(p.id));
    });
    setSelectedPermissionIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedPermissionIds([]);
  };

  const handleSavePermissions = async () => {
    if (!configuringRole) return;
    setIsSavingPermissions(true);

    try {
      const res = await api.put(`/roles/${configuringRole.id}/permissions`, {
        permission_ids: selectedPermissionIds,
      });

      const updated = res.data.role;
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      success(
        res.data.message ||
          (lang === 'bn'
            ? `"${configuringRole.name_bn || configuringRole.name}" রোলের পারমিশন সফলভাবে আপডেট হয়েছে!`
            : 'Role permissions updated successfully!')
      );
      setConfiguringRole(null);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (lang === 'bn' ? 'পারমিশন সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save permissions.');
      error(msg);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Open Create / Edit Role Modal
  const handleOpenRoleModal = (role = null) => {
    setRoleModal({ isOpen: true, role });
    if (role) {
      setRoleForm({
        name: role.name || '',
        name_bn: role.name_bn || '',
        description: role.description || '',
      });
    } else {
      setRoleForm({ name: '', name_bn: '', description: '' });
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      error(lang === 'bn' ? 'ভূমিকার নাম আবশ্যক।' : 'Role name is required.');
      return;
    }

    setIsSavingRole(true);
    try {
      if (roleModal.role) {
        const res = await api.put(`/roles/${roleModal.role.id}`, roleForm);
        setRoles((prev) =>
          prev.map((r) => (r.id === roleModal.role.id ? { ...r, ...res.data.role } : r))
        );
        success(lang === 'bn' ? 'ভূমিকা সফলভাবে আপডেট হয়েছে!' : 'Role updated successfully!');
      } else {
        const res = await api.post('/roles', roleForm);
        setRoles((prev) => [...prev, res.data.role]);
        success(lang === 'bn' ? 'নতুন ভূমিকা সফলভাবে তৈরি হয়েছে!' : 'New role created successfully!');
      }
      setRoleModal({ isOpen: false, role: null });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (lang === 'bn' ? 'ভূমিকা সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save role.');
      error(msg);
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteModal.role) return;
    setIsDeleting(true);

    try {
      await api.delete(`/roles/${deleteModal.role.id}`);
      setRoles((prev) => prev.filter((r) => r.id !== deleteModal.role.id));
      success(lang === 'bn' ? 'ভূমিকা সফলভাবে মুছে ফেলা হয়েছে!' : 'Role deleted successfully!');
      setDeleteModal({ isOpen: false, role: null });
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
                {lang === 'bn' ? 'ভূমিকা ও পারমিশন কন্ট্রোল' : 'Role & Permission Control'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'সুপার অ্যাডমিন হিসেবে বাকি ব্যবহারকারীরা সিস্টেমে কে কী কী কাজ করতে পারবে তা নির্ধারণ করুন'
                  : 'Configure exactly what actions each staff role is permitted to perform'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Action */}
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
            {lang === 'bn' ? '📋 অ্যাক্টিভিটি লগ' : 'Activity Logs'}
          </Link>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => handleOpenRoleModal(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন ভূমিকা তৈরি' : 'Create Role'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Security Advisory Pill */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <div className="font-bold text-indigo-900 dark:text-indigo-200">
            {lang === 'bn' ? 'পারমিশন কার্যপদ্ধতি ও নিরাপত্তা নোট:' : 'RBAC Security Information:'}
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {lang === 'bn'
              ? 'সুপার অ্যাডমিন সর্বদা পূর্ণ সিস্টেম এক্সেস পেয়ে থাকেন। ম্যানেজার ও ক্যাশিয়ারের মতো অন্যান্য রোলের জন্য নির্দিষ্ট পারমিশন টিক দিয়ে সংরক্ষণ করলেই ব্যবহারকারীরা কেবল তাদের জন্য অনুমোদিত মেনু ও কার্যক্রমে এক্সেস পাবেন।'
              : 'Super Admin always possesses full unrestricted access. When you toggle permissions for roles like Store Manager or Cashier, staff under those roles will immediately be restricted to only allowed actions.'}
          </p>
        </div>
      </div>

      {/* Role Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">{lang === 'bn' ? 'রোল ও পারমিশন লোড হচ্ছে...' : 'Loading roles and permissions...'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((role) => {
            const isSuper = role.slug === 'super-admin';
            const permCount = isSuper ? totalPossiblePermissions : (role.permissions || []).length;
            const percent = totalPossiblePermissions > 0 ? Math.round((permCount / totalPossiblePermissions) * 100) : 0;

            return (
              <div
                key={role.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isSuper
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : role.is_system
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {isSuper
                        ? (lang === 'bn' ? 'সিস্টেম ওনার' : 'System Owner')
                        : role.is_system
                        ? (lang === 'bn' ? 'সিস্টেম ভূমিকা' : 'System Role')
                        : (lang === 'bn' ? 'কাস্টম ভূমিকা' : 'Custom Role')}
                    </span>

                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatNumber(role.users_count || 0)} জন কর্মী</span>
                    </span>
                  </div>

                  {/* Role Title & Description */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center gap-2">
                      <span>{lang === 'bn' ? (role.name_bn || role.name) : role.name}</span>
                      {isSuper && <Shield className="w-4 h-4 text-rose-500 fill-rose-500/20" />}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {role.description || (lang === 'bn' ? 'নির্দিষ্ট কাজের অনুমতিপ্রাপ্ত কর্মী ভূমিকা' : 'Staff role with configured permissions')}
                    </p>
                  </div>

                  {/* Permission Coverage Bar */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{lang === 'bn' ? 'কাজের পারমিশন' : 'Permissions'}</span>
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400">
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
                </div>

                {/* Card Actions */}
                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  {isSuper ? (
                    <div className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-center text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 select-none">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'bn' ? 'পূর্ণ নিয়ন্ত্রণ (সর্বদা সক্রিয়)' : 'Full Root Access'}</span>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenPermissions(role)}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                        title={lang === 'bn' ? 'কাজের অনুমতি পরিবর্তন করুন' : 'Configure Permissions'}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'পারমিশন সেট করুন' : 'Set Permissions'}</span>
                      </button>

                      {!role.is_system && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenRoleModal(role)}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title={lang === 'bn' ? 'ভূমিকা সম্পাদন' : 'Edit Role'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ isOpen: true, role })}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title={lang === 'bn' ? 'ভূমিকা মুছুন' : 'Delete Role'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. PERMISSIONS CONFIGURATION MODAL / MATRIX */}
      {/* ======================================================== */}
      {configuringRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {lang === 'bn'
                        ? `"${configuringRole.name_bn || configuringRole.name}" - পারমিশন নির্ধারণ`
                        : `Configure Permissions for "${configuringRole.name}"`}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {configuringRole.slug}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === 'bn'
                      ? 'এই রোলের ব্যবহারকারীরা যেসব মেনু দেখতে ও কাজ করতে পারবে সেগুলো টিক দিন'
                      : 'Check the boxes for actions this role is authorized to execute in the system'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfiguringRole(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions & Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  placeholder={lang === 'bn' ? 'পারমিশন খুঁজুন...' : 'Search permissions...'}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  {lang === 'bn' ? 'সব নির্বাচন করুন' : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  {lang === 'bn' ? 'সব বাতিল করুন' : 'Clear All'}
                </button>
              </div>
            </div>

            {/* Permissions Grouped Cards (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {Object.entries(permissionsGrouped).map(([groupKey, groupPerms]) => {
                const meta = groupMeta[groupKey] || {
                  name: groupKey.toUpperCase(),
                  icon: Layers,
                  color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
                };
                const GroupIcon = meta.icon;

                // Filter permissions if search active
                const filteredPerms = groupPerms.filter((p) => {
                  if (!permSearch.trim()) return true;
                  const query = permSearch.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(query) ||
                    (p.name_bn && p.name_bn.toLowerCase().includes(query)) ||
                    p.slug.toLowerCase().includes(query)
                  );
                });

                if (filteredPerms.length === 0) return null;

                const groupSelectedCount = groupPerms.filter((p) =>
                  selectedPermissionIds.includes(p.id)
                ).length;
                const isAllGroupSelected = groupSelectedCount === groupPerms.length && groupPerms.length > 0;

                return (
                  <div
                    key={groupKey}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 space-y-3.5"
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${meta.color} shrink-0`}>
                          <GroupIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {meta.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatNumber(groupSelectedCount)} / {formatNumber(groupPerms.length)} টি পারমিশন সক্রিয়
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleGroup(groupKey, !isAllGroupSelected)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isAllGroupSelected
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-200'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200'
                        }`}
                      >
                        {isAllGroupSelected
                          ? (lang === 'bn' ? 'গ্রুপ বাদ দিন' : 'Deselect Group')
                          : (lang === 'bn' ? 'গ্রুপের সব দিন' : 'Select Group')}
                      </button>
                    </div>

                    {/* Permissions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {filteredPerms.map((perm) => {
                        const isChecked = selectedPermissionIds.includes(perm.id);

                        return (
                          <div
                            key={perm.id}
                            onClick={() => handleTogglePermission(perm.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                              isChecked
                                ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                                : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs">
                                {lang === 'bn' ? (perm.name_bn || perm.name) : perm.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                {perm.slug}
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Controlled via card onClick
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-4 shrink-0">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {lang === 'bn' ? 'নির্বাচিত মোট পারমিশন:' : 'Total Selected Permissions:'}{' '}
                <span className="font-black text-indigo-600 dark:text-indigo-400">
                  {formatNumber(selectedPermissionIds.length)} টি
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfiguringRole(null)}
                  disabled={isSavingPermissions}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={isSavingPermissions}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isSavingPermissions ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{lang === 'bn' ? 'পারমিশন সংরক্ষণ করুন' : 'Save Permissions'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CREATE / EDIT ROLE MODAL */}
      {/* ======================================================== */}
      {roleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span>
                  {roleModal.role
                    ? (lang === 'bn' ? 'ভূমিকা সম্পাদন করুন' : 'Edit Role')
                    : (lang === 'bn' ? 'নতুন ভূমিকা তৈরি করুন' : 'Create New Role')}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setRoleModal({ isOpen: false, role: null })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'ভূমিকার নাম (English) *' : 'Role Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="e.g. Sales Associate, Accountant"
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
                  placeholder="যেমন: সেলস এক্সিকিউটিভ, হিসাবরক্ষক"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'বিবরণ / কাজের দায়িত্ব' : 'Description'}
                </label>
                <textarea
                  rows="3"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder={lang === 'bn' ? 'এই ভূমিকার দায়িত্বসমূহ...' : 'Job responsibilities for this role...'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoleModal({ isOpen: false, role: null })}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingRole}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingRole && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. DELETE ROLE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, role: null })}
        onConfirm={handleDeleteRole}
        itemName={deleteModal.role ? (deleteModal.role.name_bn || deleteModal.role.name) : ''}
        count={1}
        loading={isDeleting}
      />
    </div>
  );
};

export default RolePermissions;
