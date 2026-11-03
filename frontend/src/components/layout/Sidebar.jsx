import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Tag,
  Scale,
  Barcode,
  Boxes,
  Sliders,
  History,
  Users,
  UserPlus,
  Truck,
  ShoppingBag,
  Receipt,
  RotateCcw,
  WalletCards,
  ArrowDownCircle,
  FolderTree,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  UserCheck,
  ShieldCheck,
  Activity,
  Settings,
  ChevronDown,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout, hasPermission } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [expandedSections, setExpandedSections] = useState({
    products: true,
    inventory: false,
    sales: true,
    purchases: false,
    people: false,
    finance: false,
    admin: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-[#1E293B] border-r border-slate-200 dark:border-slate-800 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-md">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {t('brandName')}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {t('brandSubtitle')}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Menu */}
        <div>
          {!isCollapsed && (
            <span className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              {t('mainMenu')}
            </span>
          )}
          <div className="mt-2 space-y-1">
            <NavLink to="/dashboard" className={navLinkClass} title={t('dashboard')}>
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{t('dashboard')}</span>}
            </NavLink>

            {hasPermission('pos.access') && (
              <NavLink
                to="/pos"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60'
                  }`
                }
                title={t('pos')}
              >
                <ShoppingCart className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition" />
                {!isCollapsed && <span>{t('pos')}</span>}
              </NavLink>
            )}
          </div>
        </div>

        {/* Products */}
        <div>
          {!isCollapsed && (
            <button
              onClick={() => toggleSection('products')}
              className="w-full flex items-center justify-between px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <span>{t('products')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  expandedSections.products ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
          {(isCollapsed || expandedSections.products) && (
            <div className="mt-2 space-y-1">
              <NavLink to="/products" end className={navLinkClass} title={t('productList')}>
                <Package className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('productList')}</span>}
              </NavLink>

              <NavLink to="/products/new" className={navLinkClass} title={t('addProduct')}>
                <Tag className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('addProduct')}</span>}
              </NavLink>

              <NavLink to="/categories" className={navLinkClass} title={t('categories')}>
                <Layers className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('categories')}</span>}
              </NavLink>

              <NavLink to="/brands" className={navLinkClass} title={t('brands')}>
                <FolderTree className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('brands')}</span>}
              </NavLink>

              <NavLink to="/units" className={navLinkClass} title={t('units')}>
                <Scale className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('units')}</span>}
              </NavLink>

              <NavLink to="/barcode-generator" className={navLinkClass} title={t('barcodeGenerator')}>
                <Barcode className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('barcodeGenerator')}</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Inventory */}
        <div>
          {!isCollapsed && (
            <button
              onClick={() => toggleSection('inventory')}
              className="w-full flex items-center justify-between px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <span>{t('inventory')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  expandedSections.inventory ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
          {(isCollapsed || expandedSections.inventory) && (
            <div className="mt-2 space-y-1">
              <NavLink to="/inventory" end className={navLinkClass} title={t('stockOverview')}>
                <Boxes className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('stockOverview')}</span>}
              </NavLink>

              <NavLink to="/inventory/adjustment" className={navLinkClass} title={t('stockAdjustment')}>
                <Sliders className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('stockAdjustment')}</span>}
              </NavLink>

              <NavLink to="/inventory/history" className={navLinkClass} title={t('stockHistory')}>
                <History className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('stockHistory')}</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Sales & Purchases */}
        <div>
          {!isCollapsed && (
            <button
              onClick={() => toggleSection('sales')}
              className="w-full flex items-center justify-between px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <span>{t('sales')} & {t('purchases')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  expandedSections.sales ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
          {(isCollapsed || expandedSections.sales) && (
            <div className="mt-2 space-y-1">
              <NavLink to="/sales" end className={navLinkClass} title={t('saleList')}>
                <Receipt className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('saleList')}</span>}
              </NavLink>

              <NavLink to="/sales/returns" className={navLinkClass} title={t('saleReturns')}>
                <RotateCcw className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('saleReturns')}</span>}
              </NavLink>

              <NavLink to="/purchases" end className={navLinkClass} title={t('purchaseList')}>
                <ShoppingBag className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('purchaseList')}</span>}
              </NavLink>

              <NavLink to="/purchases/new" className={navLinkClass} title={t('newPurchase')}>
                <ArrowDownCircle className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('newPurchase')}</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Customers & Suppliers */}
        <div>
          {!isCollapsed && (
            <button
              onClick={() => toggleSection('people')}
              className="w-full flex items-center justify-between px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <span>{t('management')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  expandedSections.people ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
          {(isCollapsed || expandedSections.people) && (
            <div className="mt-2 space-y-1">
              <NavLink to="/customers" end className={navLinkClass} title={t('customerList')}>
                <Users className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('customerList')}</span>}
              </NavLink>

              <NavLink to="/customers/new" className={navLinkClass} title={t('addCustomer')}>
                <UserPlus className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('addCustomer')}</span>}
              </NavLink>

              <NavLink to="/suppliers" end className={navLinkClass} title={t('supplierList')}>
                <Truck className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('supplierList')}</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Expenses & Accounting */}
        <div>
          {!isCollapsed && (
            <button
              onClick={() => toggleSection('finance')}
              className="w-full flex items-center justify-between px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <span>{t('finance')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  expandedSections.finance ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
          {(isCollapsed || expandedSections.finance) && (
            <div className="mt-2 space-y-1">
              <NavLink to="/expenses" end className={navLinkClass} title={t('expenseList')}>
                <WalletCards className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('expenseList')}</span>}
              </NavLink>

              <NavLink to="/expenses/new" className={navLinkClass} title={t('addExpense')}>
                <DollarSign className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('addExpense')}</span>}
              </NavLink>

              <NavLink to="/accounting" className={navLinkClass} title={t('accounting')}>
                <TrendingUp className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('accounting')}</span>}
              </NavLink>

              <NavLink to="/reports" className={navLinkClass} title={t('reports')}>
                <FileSpreadsheet className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('reports')}</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Administration */}
        <div>
          {!isCollapsed && (
            <button
              onClick={() => toggleSection('admin')}
              className="w-full flex items-center justify-between px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <span>{t('administration')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  expandedSections.admin ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
          {(isCollapsed || expandedSections.admin) && (
            <div className="mt-2 space-y-1">
              <NavLink to="/employees" end className={navLinkClass} title={t('employeeList')}>
                <UserCheck className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('employeeList')}</span>}
              </NavLink>

              <NavLink to="/activity-logs" className={navLinkClass} title={t('activityLogs')}>
                <Activity className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('activityLogs')}</span>}
              </NavLink>

              <NavLink to="/settings" className={navLinkClass} title={t('settings')}>
                <Settings className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('settings')}</span>}
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* User Profile & Logout Section at Bottom */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-2">
          <NavLink
            to="/profile"
            className="flex items-center gap-2.5 overflow-hidden flex-1 p-1 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="truncate text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.role?.name_bn || user?.role?.name || 'User'}
                </div>
              </div>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
            title={t('logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

