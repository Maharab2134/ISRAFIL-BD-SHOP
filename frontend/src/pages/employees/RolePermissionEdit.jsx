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
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  CheckSquare,
  Square,
  Store,
  Headphones,
  FileCheck,
  Building2,
  RefreshCw,
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
  const [initialPermissionIds, setInitialPermissionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Accordion state: which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState({});

  // 16 Comprehensive Super Shop RBAC Category Metadata
  const groupMeta = {
    dashboard: {
      name: lang === 'bn' ? 'ড্যাশবোর্ড ও পরিসংখ্যান' : 'Dashboard & Stats',
      icon: Activity,
      badgeColor: 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    pos: {
      name: lang === 'bn' ? 'বিক্রয় টার্মিনাল (POS & Checkout)' : 'POS & Checkout',
      icon: ShoppingCart,
      badgeColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    },
    products: {
      name: lang === 'bn' ? 'পণ্য ও ক্যাটালগ' : 'Products & Catalog',
      icon: Package,
      badgeColor: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    },
    inventory: {
      name: lang === 'bn' ? 'ইনভেন্টরি ও স্টক' : 'Inventory & Stock',
      icon: Layers,
      badgeColor: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    },
    purchases: {
      name: lang === 'bn' ? 'পাইকারি ক্রয় ও সরবরাহকারী' : 'Purchase & Suppliers',
      icon: ShoppingBag,
      badgeColor: 'text-teal-700 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
    },
    sales: {
      name: lang === 'bn' ? 'বিক্রয় ও ফেরত (Returns)' : 'Sales & Returns',
      icon: ShoppingCart,
      badgeColor: 'text-cyan-700 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800',
    },
    customers: {
      name: lang === 'bn' ? 'গ্রাহক ও লয়্যালটি' : 'Customers & Loyalty',
      icon: Users,
      badgeColor: 'text-sky-700 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
    },
    employees: {
      name: lang === 'bn' ? 'কর্মী ও ভূমিকা পরিচালনা' : 'Employees & Staff',
      icon: Users,
      badgeColor: 'text-violet-700 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800',
    },
    accounting: {
      name: lang === 'bn' ? 'হিসাবরক্ষণ ও নগদ প্রবাহ' : 'Accounting & Finance',
      icon: FileSpreadsheet,
      badgeColor: 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    },
    expenses: {
      name: lang === 'bn' ? 'দোকানের খরচ' : 'Store Expenses',
      icon: WalletCards,
      badgeColor: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    },
    reports: {
      name: lang === 'bn' ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics',
      icon: Activity,
      badgeColor: 'text-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800',
    },
    warehouse: {
      name: lang === 'bn' ? 'ওয়্যারহাউস ও শাখা স্থানান্তর' : 'Warehouse & Logistics',
      icon: Store,
      badgeColor: 'text-orange-700 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800',
    },
    customer_service: {
      name: lang === 'bn' ? 'গ্রাহক সেবা ও মেম্বারশিপ' : 'Customer Service & Helpdesk',
      icon: Headphones,
      badgeColor: 'text-pink-700 bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800',
    },
    audit: {
      name: lang === 'bn' ? 'অডিট ও কার্যকলাপ লগ' : 'Audit & Activity Logs',
      icon: FileCheck,
      badgeColor: 'text-slate-700 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    },
    branch: {
      name: lang === 'bn' ? 'শাখা ব্যবস্থাপনা' : 'Branch Management',
      icon: Building2,
      badgeColor: 'text-blue-800 bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800',
    },
    settings: {
      name: lang === 'bn' ? 'সিস্টেম সেটিংস' : 'System Settings',
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
      const groups = permsRes.data || {};
      setRole(roleData);
      setPermissionsGrouped(groups);

      const initialPermIds = (roleData.permissions || []).map((p) => p.id);
      setSelectedPermissionIds(initialPermIds);
      setInitialPermissionIds(initialPermIds);
      setHasUnsavedChanges(false);

      // Default expand all groups
      const initialExp = {};
      Object.keys(groups).forEach((key) => {
        initialExp[key] = true;
      });
      setExpandedGroups(initialExp);
    } catch (err) {
      error(lang === 'bn' ? 'ভূমিকা বা পারমিশন লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load role permissions.');
      navigate('/roles');
    } finally {
      setLoading(false);
    }
  };

  // Flattened all permissions
  const allPermissions = useMemo(() => {
    const list = [];
    Object.values(permissionsGrouped).forEach((group) => {
      group.forEach((p) => list.push(p));
    });
    return list;
  }, [permissionsGrouped]);

  const totalPossible = allPermissions.length;
  const isSuperAdminRole = role?.slug === 'super-admin';
  const totalSelected = isSuperAdminRole ? totalPossible : selectedPermissionIds.length;
  const percentage = totalPossible > 0 ? Math.round((totalSelected / totalPossible) * 100) : 0;

  // Toggle single permission
  const handleToggle = (permId) => {
    if (isSuperAdminRole) return;
    setHasUnsavedChanges(true);
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((item) => item !== permId) : [...prev, permId]
    );
  };

  // Toggle category
  const handleToggleCategory = (groupKey, shouldSelect) => {
    if (isSuperAdminRole) return;
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

  // Global Select All
  const handleSelectAll = () => {
    if (isSuperAdminRole) return;
    setHasUnsavedChanges(true);
    setSelectedPermissionIds(allPermissions.map((p) => p.id));
  };

  // Global Clear All
  const handleClearAll = () => {
    if (isSuperAdminRole) return;
    setHasUnsavedChanges(true);
    setSelectedPermissionIds([]);
  };

  // Reset to initial
  const handleReset = () => {
    setSelectedPermissionIds(initialPermissionIds);
    setHasUnsavedChanges(false);
    success(lang === 'bn' ? 'পারমিশন পূর্বাবস্থায় ফিরিয়ে আনা হয়েছে।' : 'Permissions reset to initial state.');
  };

  // Expand / Collapse all
  const handleExpandAll = () => {
    const next = {};
    Object.keys(permissionsGrouped).forEach((k) => (next[k] = true));
    setExpandedGroups(next);
  };

  const handleCollapseAll = () => {
    const next = {};
    Object.keys(permissionsGrouped).forEach((k) => (next[k] = false));
    setExpandedGroups(next);
  };

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Save changes
  const handleSave = async () => {
    if (isSuperAdminRole) return;
    setIsSaving(true);
    try {
      await api.put(`/roles/${id}/permissions`, {
        permission_ids: selectedPermissionIds,
      });
      setInitialPermissionIds(selectedPermissionIds);
      setHasUnsavedChanges(false);
      success(
        lang === 'bn'
          ? `'${role.name_bn || role.name}' এর পারমিশন সফলভাবে হালনাগাদ হয়েছে!`
          : `'${role.name}' permissions updated successfully!`
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (lang === 'bn' ? 'পারমিশন সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save permissions.');
      error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter groups and permissions by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return permissionsGrouped;
    const q = searchQuery.toLowerCase().trim();
    const result = {};

    Object.entries(permissionsGrouped).forEach(([groupKey, perms]) => {
      const groupTitle = groupMeta[groupKey]?.name?.toLowerCase() || '';
      const matchingPerms = perms.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.name_bn && p.name_bn.toLowerCase().includes(q)) ||
          (p.slug && p.slug.toLowerCase().includes(q)) ||
          groupTitle.includes(q)
      );

      if (matchingPerms.length > 0) {
        result[groupKey] = matchingPerms;
      }
    });

    return result;
  }, [permissionsGrouped, searchQuery, groupMeta]);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold">
          {lang === 'bn' ? 'ভূমিকা ও পারমিশন ম্যাট্রিক্স লোড হচ্ছে...' : 'Loading role permission matrix...'}
        </p>
      </div>
    );
  }

  if (!role) return null;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Role Info Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/roles"
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title={lang === 'bn' ? 'তালিকায় ফিরে যান' : 'Back to Roles'}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isSuperAdminRole
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : role.is_system
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {isSuperAdminRole
                    ? (lang === 'bn' ? 'সিস্টেম ওনার' : 'System Owner')
                    : role.is_system
                    ? (lang === 'bn' ? 'ডিফল্ট ভূমিকা' : 'Default Role')
                    : (lang === 'bn' ? 'কাস্টম ভূমিকা' : 'Custom Role')}
                </span>
                <span className="text-xs text-slate-400 font-mono">#{role.slug}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <span>{lang === 'bn' ? (role.name_bn || role.name) : role.name}</span>
                {isSuperAdminRole && <Shield className="w-5 h-5 text-rose-500 fill-rose-500/20" />}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasUnsavedChanges && !isSuperAdminRole && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
              </button>
            )}

            {!isSuperAdminRole ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 flex items-center gap-1.5 select-none">
                <Lock className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সুপার অ্যাডমিন অপরিবর্তনযোগ্য' : 'Super Admin Locked'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Role Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
          {role.description ||
            (lang === 'bn'
              ? 'এই ভূমিকার জন্য নির্ধারিত কাজের অনুমোদন ও সীমাবদ্ধতাসমূহ নিচে টিক দিয়ে নিয়ন্ত্রণ করুন।'
              : 'Configure permissions and boundaries for this position below.')}
        </p>

        {/* Coverage Metrics Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>{lang === 'bn' ? 'পারমিশন আওতা:' : 'Permission Coverage:'}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                {isSuperAdminRole ? '১০০%' : `${formatNumber(totalSelected)} / ${formatNumber(totalPossible)} (${percentage}%)`}
              </span>
            </span>

            <span className="text-slate-500 text-[11px] flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{formatNumber(role.users_count || 0)} {lang === 'bn' ? 'কর্মী এই রোলে কর্মরত' : 'Staff assigned'}</span>
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSuperAdminRole ? 'bg-rose-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${isSuperAdminRole ? 100 : percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Global Toggles */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'পারমিশন বা ক্যাটাগরি অনুসন্ধান করুন...' : 'Search permissions by name, key, or category...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isSuperAdminRole && (
            <>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সব নির্বাচন' : 'Select All'}</span>
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সব খালি করুন' : 'Clear All'}</span>
              </button>
            </>
          )}

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {lang === 'bn' ? 'সব প্রসারিত' : 'Expand All'}
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {lang === 'bn' ? 'সব সংকুচিত' : 'Collapse All'}
          </button>
        </div>
      </div>

      {/* 16 Permission Category Groups (Accordion Style) */}
      <div className="space-y-4">
        {Object.entries(filteredGroups).map(([groupKey, perms]) => {
          const meta = groupMeta[groupKey] || {
            name: groupKey.toUpperCase(),
            icon: Shield,
            badgeColor: 'text-slate-700 bg-slate-100 border-slate-300',
          };
          const IconComponent = meta.icon;
          const isExpanded = expandedGroups[groupKey] !== false;

          const groupPermIds = perms.map((p) => p.id);
          const activeInGroupCount = isSuperAdminRole
            ? perms.length
            : groupPermIds.filter((id) => selectedPermissionIds.includes(id)).length;
          const isAllSelectedInGroup = activeInGroupCount === perms.length && perms.length > 0;

          return (
            <div
              key={groupKey}
              className="rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
            >
              {/* Category Header */}
              <div
                onClick={() => toggleGroup(groupKey)}
                className="p-4 sm:px-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-2xl border ${meta.badgeColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{meta.name}</span>
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        ({formatNumber(activeInGroupCount)}/{formatNumber(perms.length)})
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {!isSuperAdminRole && (
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(groupKey, !isAllSelectedInGroup)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                        isAllSelectedInGroup
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isAllSelectedInGroup
                        ? (lang === 'bn' ? 'সব নিষ্ক্রিয়' : 'Deselect')
                        : (lang === 'bn' ? 'গ্রুপের সব সক্রিয়' : 'Select All')}
                    </button>
                  )}

                  <div className="text-slate-400 hover:text-slate-600 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Permissions Grid inside Accordion */}
              {isExpanded && (
                <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {perms.map((perm) => {
                    const isChecked = isSuperAdminRole || selectedPermissionIds.includes(perm.id);

                    return (
                      <label
                        key={perm.id}
                        onClick={() => handleToggle(perm.id)}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 select-none ${
                          isSuperAdminRole
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 cursor-not-allowed'
                            : isChecked
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 shadow-xs cursor-pointer'
                            : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-200 hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isSuperAdminRole}
                            onChange={() => {}} // Controlled by label onClick
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {lang === 'bn' ? (perm.name_bn || perm.name) : perm.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate" title={perm.slug}>
                            {perm.slug}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Save Bar (Sticky on bottom when unsaved changes exist) */}
      {hasUnsavedChanges && !isSuperAdminRole && (
        <div className="sticky bottom-4 z-40 p-4 rounded-3xl bg-indigo-900 text-white shadow-2xl border border-indigo-700/80 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-800 text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">
                {lang === 'bn' ? 'অসংরক্ষিত পারমিশন পরিবর্তন রয়েছে' : 'You have unsaved permission changes'}
              </p>
              <p className="text-[11px] text-indigo-200">
                {lang === 'bn'
                  ? 'এই ভূমিকাভূক্ত কর্মীরা অবিলম্বে হালনাগাদকৃত অধিকার পাবেন।'
                  : 'Changes take effect across all staff under this role immediately upon saving.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-xs font-semibold text-white transition cursor-pointer"
            >
              {lang === 'bn' ? 'বাতিল' : 'Reset'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-black shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-900" /> : <Save className="w-4 h-4 text-indigo-900" />}
              <span>{lang === 'bn' ? 'এখনই সংরক্ষণ করুন' : 'Save Now'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissionEdit;
