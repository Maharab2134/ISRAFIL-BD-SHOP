import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  Check,
  X,
  Search,
  Sliders,
  Users,
  Save,
  CheckCircle2,
  Sparkles,
  Lock,
  Layers,
  ShoppingCart,
  Package,
  Truck,
  ShoppingBag,
  WalletCards,
  FileSpreadsheet,
  Activity,
  Settings,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';

export const RolePermissionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, formatNumber } = useLanguage();
  const { success, error } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.slug === 'super-admin' || user?.email === 'admin@israfilbd.com';

  const [role, setRole] = useState(null);
  const [permissionsGrouped, setPermissionsGrouped] = useState({});
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Category visual metadata
  const groupMeta = {
    pos: {
      name: lang === 'bn' ? 'বিক্রয় টার্মিনাল (POS)' : 'POS Terminal',
      nameEn: 'POS Terminal',
      icon: ShoppingCart,
      badgeColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    },
    products: {
      name: lang === 'bn' ? 'পণ্য ও ক্যাটালগ' : 'Products & Catalog',
      nameEn: 'Products & Catalog',
      icon: Package,
      badgeColor: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    },
    inventory: {
      name: lang === 'bn' ? 'ইনভেন্টরি ও স্টক' : 'Inventory & Stock',
      nameEn: 'Inventory & Stock',
      icon: Layers,
      badgeColor: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    },
    customers: {
      name: lang === 'bn' ? 'গ্রাহক ও বাকি খাতা' : 'Customers & Dues',
      nameEn: 'Customers & Dues',
      icon: Users,
      badgeColor: 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    suppliers: {
      name: lang === 'bn' ? 'সরবরাহকারী' : 'Suppliers',
      nameEn: 'Suppliers',
      icon: Truck,
      badgeColor: 'text-purple-700 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    },
    purchases: {
      name: lang === 'bn' ? 'পাইকারি ক্রয়' : 'Purchases',
      nameEn: 'Purchases',
      icon: ShoppingBag,
      badgeColor: 'text-teal-700 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
    },
    sales: {
      name: lang === 'bn' ? 'বিক্রয় চালান ও অর্ডার' : 'Sales & Invoices',
      nameEn: 'Sales & Invoices',
      icon: ShoppingCart,
      badgeColor: 'text-cyan-700 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800',
    },
    expenses: {
      name: lang === 'bn' ? 'দোকানের খরচ' : 'Store Expenses',
      nameEn: 'Store Expenses',
      icon: WalletCards,
      badgeColor: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    },
    accounting: {
      name: lang === 'bn' ? 'হিসাবরক্ষণ ও ক্যাশ ফ্লো' : 'Accounting & Cash Flow',
      nameEn: 'Accounting & Cash Flow',
      icon: FileSpreadsheet,
      badgeColor: 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    },
    reports: {
      name: lang === 'bn' ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics',
      nameEn: 'Reports & Analytics',
      icon: Activity,
      badgeColor: 'text-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800',
    },
    employees: {
      name: lang === 'bn' ? 'কর্মী পরিচালনা' : 'Employee Management',
      nameEn: 'Employee Management',
      icon: Users,
      badgeColor: 'text-violet-700 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800',
    },
    settings: {
      name: lang === 'bn' ? 'সিস্টেম সেটিংস' : 'System Settings',
      nameEn: 'System Settings',
      icon: Settings,
      badgeColor: 'text-slate-700 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    },
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roleRes, permsRes] = await Promise.all([
        api.get(`/roles/${id}`),
        api.get('/permissions'),
      ]);

      const roleData = roleRes.data;
      setRole(roleData);
      setPermissionsGrouped(permsRes.data || {});

      const initialPermIds = (roleData.permissions || []).map((p) => p.id);
      setSelectedPermissionIds(initialPermIds);
      setHasUnsavedChanges(false);
    } catch (err) {
      error(lang === 'bn' ? 'ভূমিকা বা পারমিশন লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load role permissions.');
      navigate('/roles');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const allPermissions = useMemo(() => {
    const list = [];
    Object.values(permissionsGrouped).forEach((group) => {
      group.forEach((p) => list.push(p));
    });
    return list;
  }, [permissionsGrouped]);

  const totalPossible = allPermissions.length;
  const totalSelected = selectedPermissionIds.length;
  const percentage = totalPossible > 0 ? Math.round((totalSelected / totalPossible) * 100) : 0;

  // Toggle single permission
  const handleToggle = (permId) => {
    setHasUnsavedChanges(true);
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((item) => item !== permId) : [...prev, permId]
    );
  };

  // Toggle whole category
  const handleToggleCategory = (groupKey, shouldSelect) => {
    setHasUnsavedChanges(true);
    const groupPerms = permissionsGrouped[groupKey] || [];
    const groupIds = groupPerms.map((p) => p.id);

    setSelectedPermissionIds((prev) => {
      if (shouldSelect) {
        return [...new Set([...prev, ...groupIds])];
      } else {
        return prev.filter((item) => !groupIds.includes(item));
      }
    });
  };

  // Select all permissions
  const handleSelectAll = () => {
    setHasUnsavedChanges(true);
    setSelectedPermissionIds(allPermissions.map((p) => p.id));
  };

  // Clear all permissions
  const handleClearAll = () => {
    setHasUnsavedChanges(true);
    setSelectedPermissionIds([]);
  };

  // Reset to originally loaded permissions
  const handleReset = () => {
    if (role) {
      setSelectedPermissionIds((role.permissions || []).map((p) => p.id));
      setHasUnsavedChanges(false);
    }
  };

  // Save to backend
  const handleSave = async () => {
    if (!role) return;
    setIsSaving(true);

    try {
      const res = await api.put(`/roles/${role.id}/permissions`, {
        permission_ids: selectedPermissionIds,
      });

      const updated = res.data.role;
      setRole(updated);
      setSelectedPermissionIds((updated.permissions || []).map((p) => p.id));
      setHasUnsavedChanges(false);

      success(
        res.data.message ||
          (lang === 'bn'
            ? `"${role.name_bn || role.name}" রোলের পারমিশন সফলভাবে হালনাগাদ করা হয়েছে!`
            : 'Role permissions saved successfully!')
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (lang === 'bn' ? 'পারমিশন সংরক্ষণ করতে ব্যর্থ হয়েছে।' : 'Failed to save permissions.');
      error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">
          {lang === 'bn' ? 'পারমিশন তথ্য লোড হচ্ছে...' : 'Loading permissions...'}
        </p>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  const isSuper = role.slug === 'super-admin';

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <Link to="/dashboard" className="hover:text-indigo-600 transition">
              {lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
            </Link>
            <span>/</span>
            <Link to="/roles" className="hover:text-indigo-600 transition">
              {lang === 'bn' ? 'ভূমিকা ও পারমিশন' : 'Roles & Permissions'}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">
              {lang === 'bn' ? (role.name_bn || role.name) : role.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/roles"
              className="p-2.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-xs"
              title={lang === 'bn' ? 'তালিকায় ফিরে যান' : 'Back to Roles'}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <span>{lang === 'bn' ? 'পারমিশন নির্ধারণ ও কনফিগারেশন' : 'Configure Permissions'}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono">
                  {role.slug}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? `"${role.name_bn || role.name}" ভূমিকার কর্মীরা সিস্টেমে কি কি কাজ করতে পারবেন তা নির্ধারণ করুন`
                  : `Select which modules and actions staff with "${role.name}" role are allowed to access`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons in Header */}
        {!isSuper && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95 ${
                hasUnsavedChanges
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Role Summary Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              {isSuper ? (
                <Shield className="w-7 h-7 text-rose-400" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black">
                  {lang === 'bn' ? (role.name_bn || role.name) : role.name}
                </h2>
                {role.name_bn && role.name !== role.name_bn && (
                  <span className="text-sm font-medium text-indigo-200">({role.name})</span>
                )}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isSuper
                      ? 'bg-rose-500/30 text-rose-200 border border-rose-400/30'
                      : role.is_system
                      ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30'
                      : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                  }`}
                >
                  {isSuper
                    ? (lang === 'bn' ? 'সিস্টেম ওনার' : 'System Owner')
                    : role.is_system
                    ? (lang === 'bn' ? 'সিস্টেম ভূমিকা' : 'System Role')
                    : (lang === 'bn' ? 'কাস্টম ভূমিকা' : 'Custom Role')}
                </span>
              </div>

              <p className="text-xs text-indigo-100/90 max-w-2xl line-clamp-2">
                {role.description ||
                  (lang === 'bn'
                    ? 'এই ভূমিকার আওতাভুক্ত কর্মীদের জন্য প্রযোজ্য অনুমতি ও কার্যক্রম'
                    : 'Configured security permissions and capabilities for this staff role')}
              </p>

              <div className="flex items-center gap-3 text-xs text-indigo-200 pt-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-300" />
                  <span>
                    {lang === 'bn'
                      ? `${formatNumber(role.users_count || 0)} জন কর্মী নিযুক্ত`
                      : `${role.users_count || 0} staff assigned`}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Permission Stats Gauge */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-indigo-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'পারমিশন কাভারেজ' : 'Coverage'}</span>
              </span>
              <span className="text-white text-sm font-black">
                {isSuper ? '১০০%' : `${percentage}%`}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSuper ? 'bg-rose-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${isSuper ? 100 : percentage}%` }}
              />
            </div>

            <div className="text-[11px] text-indigo-200 text-right font-medium">
              {isSuper
                ? (lang === 'bn' ? 'পূর্ণ রুট অ্যাক্সেস' : 'All permissions active')
                : `${formatNumber(totalSelected)} / ${formatNumber(totalPossible)} টি পারমিশন সক্রিয়`}
            </div>
          </div>
        </div>
      </div>

      {/* Super Admin Special Notice */}
      {isSuper ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {lang === 'bn' ? 'সুপার অ্যাডমিনের পারমিশন সংরক্ষিত' : 'Super Admin Permissions Protected'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'সুপার অ্যাডমিন অ্যাকাউন্টে সর্বদা সফটওয়্যারের প্রতিটি মডিউল ও অপশনের সর্বোচ্চ রুট পারমিশন স্বয়ংক্রিয়ভাবে বহাল থাকে। এটি পরিবর্তন করার প্রয়োজন নেই।'
                : 'Super Admin always retains absolute system access ("*"). These root permissions are permanent and cannot be modified.'}
            </p>
          </div>
          <Link
            to="/roles"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ভূমিকা তালিকায় ফিরে যান' : 'Back to Roles'}</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Sticky Quick Toolbar */}
          <div className="sticky top-16 z-30 p-3 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'পারমিশন বা মডিউল খুঁজুন...' : 'Search permissions by name or keyword...'}
                className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selection Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সব নির্বাচন করুন' : 'Select All'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সব বাতিল করুন' : 'Clear All'}</span>
              </button>
            </div>
          </div>

          {/* Permissions Grouped Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(permissionsGrouped).map(([groupKey, groupPerms]) => {
              const meta = groupMeta[groupKey] || {
                name: groupKey.toUpperCase(),
                nameEn: groupKey.toUpperCase(),
                icon: Layers,
                badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
              };
              const GroupIcon = meta.icon;

              // Filter permissions if search active
              const filteredPerms = groupPerms.filter((p) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  p.name.toLowerCase().includes(q) ||
                  (p.name_bn && p.name_bn.toLowerCase().includes(q)) ||
                  p.slug.toLowerCase().includes(q) ||
                  groupKey.toLowerCase().includes(q)
                );
              });

              if (filteredPerms.length === 0) return null;

              const groupIds = groupPerms.map((p) => p.id);
              const selectedInGroup = groupPerms.filter((p) => selectedPermissionIds.includes(p.id)).length;
              const isAllSelected = groupPerms.length > 0 && selectedInGroup === groupPerms.length;

              return (
                <div
                  key={groupKey}
                  className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Category Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl border shadow-xs ${meta.badgeColor}`}>
                        <GroupIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                          {meta.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatNumber(selectedInGroup)} / {formatNumber(groupPerms.length)} টি পারমিশন সক্রিয়
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCategory(groupKey, !isAllSelected)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        isAllSelected
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                      }`}
                    >
                      {isAllSelected
                        ? (lang === 'bn' ? 'গ্রুপ আনচেক' : 'Deselect Group')
                        : (lang === 'bn' ? 'গ্রুপ সিলেক্ট' : 'Select Group')}
                    </button>
                  </div>

                  {/* Permission Items */}
                  <div className="p-4 sm:p-5 space-y-2.5 flex-1">
                    {filteredPerms.map((perm) => {
                      const isChecked = selectedPermissionIds.includes(perm.id);

                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleToggle(perm.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                            isChecked
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs'
                              : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                                isChecked
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <div>
                              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{lang === 'bn' ? (perm.name_bn || perm.name) : perm.name}</span>
                              </div>
                              {perm.name_bn && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {perm.name}
                                </div>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                            {perm.slug}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Floating Save Bar */}
          <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
            <div className="max-w-4xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 text-white backdrop-blur-md shadow-2xl border border-white/10 flex items-center justify-between gap-4 pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold">
                    {lang === 'bn'
                      ? `মোট ${formatNumber(totalSelected)} টি পারমিশন নির্বাচিত`
                      : `${totalSelected} permissions selected`}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {hasUnsavedChanges
                      ? (lang === 'bn' ? '⚠️ কিছু পরিবর্তন এখনও সংরক্ষণ করা হয়নি' : 'Unsaved changes pending')
                      : (lang === 'bn' ? '✓ সকল পরিবর্তন সংরক্ষিত রয়েছে' : 'All changes saved')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  to="/roles"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  {lang === 'bn' ? 'ফিরে যান' : 'Back'}
                </Link>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/40 flex items-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RolePermissionEdit;
