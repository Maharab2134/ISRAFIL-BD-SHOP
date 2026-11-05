import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ScrollRestorationManager } from './components/common/ScrollRestorationManager';

// Auth Pages
import { Login } from './pages/auth/Login';
import Profile from './pages/auth/Profile';

// Dashboard
import { Dashboard } from './pages/dashboard/Dashboard';

// POS Terminal
import { PosTerminal } from './pages/pos/PosTerminal';

// Product Management
import { ProductList } from './pages/products/ProductList';
import { AddProduct } from './pages/products/AddProduct';
import { EditProduct } from './pages/products/EditProduct';
import { ProductDetails } from './pages/products/ProductDetails';
import { Categories } from './pages/products/Categories';
import { Brands } from './pages/products/Brands';
import { Units } from './pages/products/Units';
import { BarcodeGenerator } from './pages/products/BarcodeGenerator';

// Inventory
import { InventoryOverview } from './pages/inventory/InventoryOverview';
import { StockAdjustment } from './pages/inventory/StockAdjustment';
import { StockHistory } from './pages/inventory/StockHistory';

// Sales
import { SaleList } from './pages/sales/SaleList';
import { SaleInvoice } from './pages/sales/SaleInvoice';
import { SaleReturns } from './pages/sales/SaleReturns';

// Purchases
import { PurchaseList } from './pages/purchases/PurchaseList';
import { NewPurchase } from './pages/purchases/NewPurchase';
import { PurchaseDetails } from './pages/purchases/PurchaseDetails';

// Customers & Suppliers
import { CustomerList } from './pages/customers/CustomerList';
import { AddCustomer } from './pages/customers/AddCustomer';
import { EditCustomer } from './pages/customers/EditCustomer';
import { CustomerDetails } from './pages/customers/CustomerDetails';
import { SupplierList } from './pages/suppliers/SupplierList';
import { AddSupplier } from './pages/suppliers/AddSupplier';
import { SupplierDetails } from './pages/suppliers/SupplierDetails';

// Expenses
import { ExpenseList } from './pages/expenses/ExpenseList';
import { AddExpense } from './pages/expenses/AddExpense';
import { ExpenseCategories } from './pages/expenses/ExpenseCategories';

// Accounting & Reports
import { AccountingDashboard } from './pages/accounting/AccountingDashboard';
import CashFlow from './pages/accounting/CashFlow';
import { Reports } from './pages/reports/Reports';

// Employees & System Logs
import EmployeeList from './pages/employees/EmployeeList';
import AddEmployee from './pages/employees/AddEmployee';
import ActivityLogs from './pages/employees/ActivityLogs';
import { RolePermissions } from './pages/employees/RolePermissions';

// Settings
import ShopSettings from './pages/settings/ShopSettings';
import { KeyboardShortcuts } from './pages/settings/KeyboardShortcuts';

export default function App() {
  return (
    <>
      <ScrollRestorationManager />
      <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected App Routes inside Layout */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* POS */}
        <Route path="pos" element={<PosTerminal />} />

        {/* Products & Aliases */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="products/:id/edit" element={<EditProduct />} />
        <Route path="products/categories" element={<Categories />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products/brands" element={<Brands />} />
        <Route path="brands" element={<Brands />} />
        <Route path="products/units" element={<Units />} />
        <Route path="units" element={<Units />} />
        <Route path="products/barcode-generator" element={<BarcodeGenerator />} />
        <Route path="products/barcode" element={<BarcodeGenerator />} />
        <Route path="barcode-generator" element={<BarcodeGenerator />} />
        <Route path="barcode" element={<BarcodeGenerator />} />
        <Route path="products/:id" element={<ProductDetails />} />

        {/* Inventory */}
        <Route path="inventory" element={<InventoryOverview />} />
        <Route path="inventory/adjustment" element={<StockAdjustment />} />
        <Route path="inventory/history" element={<StockHistory />} />

        {/* Sales */}
        <Route path="sales" element={<SaleList />} />
        <Route path="sales/:id" element={<SaleInvoice />} />
        <Route path="sales/returns" element={<SaleReturns />} />

        {/* Purchases */}
        <Route path="purchases" element={<PurchaseList />} />
        <Route path="purchases/new" element={<NewPurchase />} />
        <Route path="purchases/:id" element={<PurchaseDetails />} />

        {/* People */}
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<AddCustomer />} />
        <Route path="customers/:id/edit" element={<EditCustomer />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="suppliers" element={<SupplierList />} />
        <Route path="suppliers/new" element={<AddSupplier />} />
        <Route path="suppliers/:id" element={<SupplierDetails />} />

        {/* Expenses */}
        <Route path="expenses" element={<ExpenseList />} />
        <Route path="expenses/new" element={<AddExpense />} />
        <Route path="expenses/categories" element={<ExpenseCategories />} />
        <Route path="expense-categories" element={<ExpenseCategories />} />

        {/* Accounting & Finance */}
        <Route path="accounting" element={<AccountingDashboard />} />
        <Route path="accounting/cash-flow" element={<CashFlow />} />
        <Route path="cash-flow" element={<CashFlow />} />
        <Route path="reports" element={<Reports />} />

        {/* Administration */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/new" element={<AddEmployee />} />
        <Route path="employees/edit/:id" element={<AddEmployee />} />
        <Route path="roles" element={<RolePermissions />} />
        <Route path="employees/roles" element={<RolePermissions />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="settings" element={<ShopSettings />} />
        <Route path="shortcuts" element={<KeyboardShortcuts />} />
        <Route path="settings/shortcuts" element={<KeyboardShortcuts />} />

        {/* User Account */}
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

