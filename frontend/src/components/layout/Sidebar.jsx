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
  Keyboard,
} from 'lucide-react';
import { useShortcuts } from '../../context/ShortcutContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout, hasPermission } = useAuth();
  const { t, lang } = useLanguage();
  const { openShortcutsModal } = useShortcuts();
  const navigate = useNavigate();

  const roleSlug = user?.role?.slug;
  const isSuperAdmin = roleSlug === 'super-admin' || user?.email === 'admin@israfilbd.com';

  const canViewDashboard = isSuperAdmin || hasPermission('reports.view');
  const canViewPos = isSuperAdmin || hasPermission('pos.access');
  const canViewProducts = isSuperAdmin || hasPermission('products.view');
  const canCreateProducts = isSuperAdmin || hasPermission('products.create');
  const canViewInventory = isSuperAdmin || hasPermission('inventory.view');
  const canAdjustInventory = isSuperAdmin || hasPermission('inventory.adjust');
  const canViewPurchases = isSuperAdmin || hasPermission('purchases.view');
  const canCreatePurchases = isSuperAdmin || hasPermission('purchases.create');
  const canViewSales = isSuperAdmin || hasPermission('sales.view');
  const canViewCustomers = isSuperAdmin || hasPermission('customers.view');
  const canManageCustomers = isSuperAdmin || hasPermission('customers.manage');
  const canViewSuppliers = isSuperAdmin || hasPermission('suppliers.view');
  const canViewExpenses = isSuperAdmin || hasPermission('expenses.view');
  const canManageExpenses = isSuperAdmin || hasPermission('expenses.manage');
  const canViewAccounting = isSuperAdmin || hasPermission('accounting.view');
  const canViewReports = isSuperAdmin || hasPermission('reports.view');
  const canViewFinance = isSuperAdmin || canViewExpenses || canViewAccounting || canViewReports;
  const canViewSalesPurchases = isSuperAdmin || canViewSales || canViewPurchases;
  const canViewPeople = isSuperAdmin || canViewCustomers || canViewSuppliers;
  const canManageEmployees = isSuperAdmin || hasPermission('employees.manage');
  const canManageSettings = isSuperAdmin || hasPermission('settings.manage');

  const rawName = user?.name || '';
  const englishParenMatch = rawName.match(/\((.*?)\)/);
  const englishName = englishParenMatch ? englishParenMatch[1].trim() : rawName;
  const banglaName = rawName.replace(/\(.*?\)/, '').trim() || rawName;
  const displayName = lang === 'en' ? englishName : banglaName;
  const initialLetter = (displayName || 'U')[0].toUpperCase();
  const roleName = lang === 'bn'
    ? (user?.role?.name_bn || user?.role?.name || 'স্টাফ')
    : (user?.role?.name || user?.role?.name_bn || 'Staff');

  const [expandedSections, setExpandedSections] = useState({
    products: false,
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
    `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
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
      <div
        className={`h-16 flex items-center border-b border-slate-200 dark:border-slate-800 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105 cursor-pointer relative group"
            title="Expand Sidebar"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-[9px] flex items-center justify-center border border-white dark:border-slate-800 shadow-xs group-hover:scale-110 transition-transform">
              <ChevronRight className="w-2.5 h-2.5" />
            </span>
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-md">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="truncate">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('brandName')}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {t('brandSubtitle')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Navigation Links Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Main Section */}
        <div>
          {!isCollapsed && (
            <span className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              {t('mainMenu')}
            </span>
          )}
          <div className="mt-2 space-y-1">
            {/* Dashboard */}
            {canViewDashboard && (
              <NavLink to="/dashboard" className={navLinkClass} title={t('dashboard')}>
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('dashboard')}</span>}
              </NavLink>
            )}

            {/* POS Terminal */}
            {canViewPos && (
              <NavLink
                to="/pos"
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700'
                  }`
                }
                title={t('pos')}
              >
                <ShoppingCart className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{t('pos')}</span>}
              </NavLink>
            )}
          </div>
        </div>

        {/* Products & Catalog */}
        {canViewProducts && (
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

                {canCreateProducts && (
                  <NavLink to="/products/new" className={navLinkClass} title={t('addProduct')}>
                    <Tag className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{t('addProduct')}</span>}
                  </NavLink>
                )}

                <NavLink to="/products/categories" className={navLinkClass} title={t('categories')}>
                  <Layers className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{t('categories')}</span>}
                </NavLink>

                <NavLink to="/products/brands" className={navLinkClass} title={t('brands')}>
                  <FolderTree className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{t('brands')}</span>}
                </NavLink>

                <NavLink to="/products/units" className={navLinkClass} title={t('units')}>
                  <Scale className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{t('units')}</span>}
                </NavLink>

                <NavLink to="/products/barcode-generator" className={navLinkClass} title={t('barcodeGenerator')}>
                  <Barcode className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{t('barcodeGenerator')}</span>}
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Inventory & Stock */}
        {canViewInventory && (
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

                {canAdjustInventory && (
                  <NavLink to="/inventory/adjustment" className={navLinkClass} title={t('stockAdjustment')}>
                    <Sliders className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{t('stockAdjustment')}</span>}
                  </NavLink>
                )}

                <NavLink to="/inventory/history" className={navLinkClass} title={t('stockHistory')}>
                  <History className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{t('stockHistory')}</span>}
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Sales & Purchases */}
        {canViewSalesPurchases && (
          <div>
            {!isCollapsed && (
              <button
                onClick={() => toggleSection('sales')}
                className="w-full flex items-center justify-between px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <span>
                  {canViewSales && canViewPurchases
                    ? `${t('sales')} & ${t('purchases')}`
                    : canViewSales
                    ? t('sales')
                    : t('purchases')}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    expandedSections.sales ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
            {(isCollapsed || expandedSections.sales) && (
              <div className="mt-2 space-y-1">
                {canViewSales && (
                  <>
                    <NavLink to="/sales" end className={navLinkClass} title={t('saleList')}>
                      <Receipt className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{t('saleList')}</span>}
                    </NavLink>

                    <NavLink to="/sales/returns" className={navLinkClass} title={t('saleReturns')}>
                      <RotateCcw className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{t('saleReturns')}</span>}
                    </NavLink>
                  </>
                )}

                {/* Purchases */}
                {canViewPurchases && (
                  <>
                    <NavLink to="/purchases" end className={navLinkClass} title={t('purchaseList')}>
                      <ShoppingBag className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{t('purchaseList')}</span>}
                    </NavLink>

                    {canCreatePurchases && (
                      <NavLink to="/purchases/new" className={navLinkClass} title={t('newPurchase')}>
                        <ArrowDownCircle className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span>{t('newPurchase')}</span>}
                      </NavLink>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Customers & Suppliers */}
        {canViewPeople && (
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
                {canViewCustomers && (
                  <>
                    <NavLink to="/customers" end className={navLinkClass} title={t('customerList')}>
                      <Users className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{t('customerList')}</span>}
                    </NavLink>

                    {canManageCustomers && (
                      <NavLink to="/customers/new" className={navLinkClass} title={t('addCustomer')}>
                        <UserPlus className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span>{t('addCustomer')}</span>}
                      </NavLink>
                    )}
                  </>
                )}

                {/* Suppliers */}
                {canViewSuppliers && (
                  <NavLink to="/suppliers" end className={navLinkClass} title={t('supplierList')}>
                    <Truck className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{t('supplierList')}</span>}
                  </NavLink>
                )}
              </div>
            )}
          </div>
        )}

        {/* Expenses, Accounting & Reports */}
        {canViewFinance && (
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
                {canViewExpenses && (
                  <>
                    <NavLink to="/expenses" end className={navLinkClass} title={t('expenseList')}>
                      <WalletCards className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{t('expenseList')}</span>}
                    </NavLink>

                    {canManageExpenses && (
                      <NavLink to="/expenses/new" className={navLinkClass} title={t('addExpense')}>
                        <DollarSign className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span>{t('addExpense')}</span>}
                      </NavLink>
                    )}

                    <NavLink to="/expenses/categories" className={navLinkClass} title={t('expenseCategories')}>
                      <Layers className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{t('expenseCategories')}</span>}
                    </NavLink>
                  </>
                )}

                {canViewAccounting && (
                  <>
                    <NavLink to="/accounting" className={navLinkClass} title={t('accounting')}>
                      <TrendingUp className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{t('accounting')}</span>}
                    </NavLink>

                    <NavLink to="/accounting/cash-flow" className={navLinkClass} title={t('cashFlow')}>
                      <DollarSign className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{t('cashFlow')}</span>}
                    </NavLink>
                  </>
                )}

                {canViewReports && (
                  <NavLink to="/reports" className={navLinkClass} title={t('reports')}>
                    <FileSpreadsheet className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{t('reports')}</span>}
                  </NavLink>
                )}
              </div>
            )}
          </div>
        )}

        {/* Administration: Super Admin or Managers with permissions */}
        {(isSuperAdmin || canManageEmployees || canManageSettings) && (
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
                {canManageEmployees && (
                  <NavLink to="/employees" end className={navLinkClass} title={t('employeeList')}>
                    <UserCheck className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{t('employeeList')}</span>}
                  </NavLink>
                )}

                {isSuperAdmin && (
                  <>
                    <NavLink to="/roles" className={navLinkClass} title={lang === 'bn' ? 'ভূমিকা ও পারমিশন' : 'Roles & Permissions'}>
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{lang === 'bn' ? 'ভূমিকা ও পারমিশন' : 'Roles & Permissions'}</span>}
                    </NavLink>

                    <NavLink to="/activity-logs" className={navLinkClass} title={t('activityLogs')}>
                      <Activity className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{t('activityLogs')}</span>}
                    </NavLink>
                  </>
                )}

                {canManageSettings && (
                  <NavLink to="/settings" className={navLinkClass} title={t('settings')}>
                    <Settings className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{t('settings')}</span>}
                  </NavLink>
                )}
              </div>
            )}
          </div>
        )}
        {/* Keyboard Shortcuts Page Link in Sidebar */}
        <div className="pt-2">
          <NavLink
            to="/shortcuts"
            className={navLinkClass}
            title={lang === 'bn' ? 'কীবোর্ড শর্টকাট (Alt + K)' : 'Keyboard Shortcuts (Alt + K)'}
          >
            <Keyboard className="w-5 h-5 shrink-0 text-indigo-500" />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>{lang === 'bn' ? 'কীবোর্ড শর্টকাট' : 'Shortcuts'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                  Alt+K
                </span>
              </div>
            )}
          </NavLink>
        </div>
      </div>

      {/* User Profile & Logout Section at Bottom */}
      <div
        className={`border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 ${
          isCollapsed ? 'p-2.5 flex flex-col items-center gap-2' : 'p-3'
        }`}
      >
        {isCollapsed ? (
          <>
            <NavLink
              to="/profile"
              className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition shadow-2xs cursor-pointer"
              title={`${displayName} (${roleName})`}
            >
              {initialLetter}
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <NavLink
              to="/profile"
              className="flex items-center gap-2.5 overflow-hidden flex-1 p-1 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                {initialLetter}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {displayName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {roleName}
                </div>
              </div>
            </NavLink>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
