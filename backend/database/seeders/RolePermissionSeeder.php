<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the comprehensive Super Shop RBAC upgrade seeder.
     * Completely idempotent, preserves all existing data and relationships.
     */
    public function run(): void
    {
        // -------------------------------------------------------------
        // 1. Ensure Default Main Branch Exists
        // -------------------------------------------------------------
        $mainBranch = Branch::firstOrCreate(
            ['code' => 'MAIN-01'],
            [
                'name' => 'Main Branch',
                'name_bn' => 'প্রধান শাখা (ঢাকা সদর)',
                'code' => 'MAIN-01',
                'phone' => '01700000000',
                'email' => 'branch.main@israfilbd.com',
                'address' => 'প্রধান বিক্রয় কেন্দ্র, ঢাকা, বাংলাদেশ',
                'is_active' => true,
                'is_main' => true,
            ]
        );

        // -------------------------------------------------------------
        // 2. Comprehensive 16 Permission Categories (Granular Super Shop RBAC)
        // -------------------------------------------------------------
        $permissions = [
            // Category 1: Dashboard
            ['name' => 'View Dashboard', 'name_bn' => 'ড্যাশবোর্ড দেখুন', 'slug' => 'dashboard.view', 'group' => 'dashboard'],
            ['name' => 'View Gross Profit & Financial Summary', 'name_bn' => 'আর্থিক পরিসংখ্যান ও লাভ দেখুন', 'slug' => 'dashboard.financial_stats', 'group' => 'dashboard'],

            // Category 2: POS & Checkout
            ['name' => 'Access POS Terminal', 'name_bn' => 'পিওএস অ্যাক্সেস', 'slug' => 'pos.access', 'group' => 'pos'],
            ['name' => 'Process Checkout & Payments', 'name_bn' => 'বিক্রয় ও পেমেন্ট সম্পন্নকরণ', 'slug' => 'pos.checkout', 'group' => 'pos'],
            ['name' => 'Apply Manual Discount', 'name_bn' => 'কাস্টম ছাড় প্রয়োগ', 'slug' => 'pos.discount_apply', 'group' => 'pos'],
            ['name' => 'Override Item Unit Price', 'name_bn' => 'পণ্য বিক্রয়মূল্য পরিবর্তন', 'slug' => 'pos.price_override', 'group' => 'pos'],
            ['name' => 'Print POS Receipts', 'name_bn' => 'পিওএস ক্যাশ মেমো প্রিন্ট', 'slug' => 'pos.print', 'group' => 'pos'],

            // Category 3: Products & Categories
            ['name' => 'View Products Catalog', 'name_bn' => 'পণ্য ক্যাটালগ দেখুন', 'slug' => 'products.view', 'group' => 'products'],
            ['name' => 'View Product Cost Price & Margins', 'name_bn' => 'পণ্যের ক্রয়মূল্য ও লাভ দেখুন', 'slug' => 'products.view_cost', 'group' => 'products'],
            ['name' => 'Create Products & Categories', 'name_bn' => 'নতুন পণ্য ও ক্যাটাগরি তৈরি', 'slug' => 'products.create', 'group' => 'products'],
            ['name' => 'Edit Products & Pricing', 'name_bn' => 'পণ্য ও দাম পরিবর্তন', 'slug' => 'products.edit', 'group' => 'products'],
            ['name' => 'Delete Products', 'name_bn' => 'পণ্য মুছুন', 'slug' => 'products.delete', 'group' => 'products'],
            ['name' => 'Export Products List', 'name_bn' => 'পণ্য তালিকা এক্সপোর্ট', 'slug' => 'products.export', 'group' => 'products'],
            ['name' => 'Generate & Print Barcodes', 'name_bn' => 'বারকোড তৈরি ও প্রিন্ট', 'slug' => 'products.print_barcode', 'group' => 'products'],

            // Category 4: Inventory & Stock
            ['name' => 'View Inventory Overview', 'name_bn' => 'ইনভেন্টরি স্টক দেখুন', 'slug' => 'inventory.view', 'group' => 'inventory'],
            ['name' => 'Adjust Stock Quantities', 'name_bn' => 'স্টক সমন্বয় ও অ্যাডজাস্ট', 'slug' => 'inventory.adjust', 'group' => 'inventory'],
            ['name' => 'View Stock Movement History', 'name_bn' => 'স্টক চলাচলের ইতিহাস', 'slug' => 'inventory.history', 'group' => 'inventory'],
            ['name' => 'Export Inventory Reports', 'name_bn' => 'ইনভেন্টরি ডাটা এক্সপোর্ট', 'slug' => 'inventory.export', 'group' => 'inventory'],

            // Category 5: Purchase & Suppliers
            ['name' => 'View Suppliers', 'name_bn' => 'সরবরাহকারী দেখুন', 'slug' => 'suppliers.view', 'group' => 'purchases'],
            ['name' => 'Create & Edit Suppliers', 'name_bn' => 'সরবরাহকারী পরিচালনা', 'slug' => 'suppliers.manage', 'group' => 'purchases'],
            ['name' => 'View Purchase Orders', 'name_bn' => 'পাইকারি ক্রয় দেখুন', 'slug' => 'purchases.view', 'group' => 'purchases'],
            ['name' => 'Create Purchase Orders', 'name_bn' => 'নতুন ক্রয় তৈরি', 'slug' => 'purchases.create', 'group' => 'purchases'],
            ['name' => 'Approve Purchase Orders', 'name_bn' => 'ক্রয় অর্ডার অনুমোদন', 'slug' => 'purchases.approve', 'group' => 'purchases'],
            ['name' => 'Print Purchase Invoices', 'name_bn' => 'ক্রয় চালান প্রিন্ট', 'slug' => 'purchases.print', 'group' => 'purchases'],

            // Category 6: Sales & Returns
            ['name' => 'View Sales Orders & Invoices', 'name_bn' => 'বিক্রয় তালিকা দেখুন', 'slug' => 'sales.view', 'group' => 'sales'],
            ['name' => 'Export Sales Reports', 'name_bn' => 'বিক্রয় রিপোর্ট এক্সপোর্ট', 'slug' => 'sales.export', 'group' => 'sales'],
            ['name' => 'Print Sales Invoices', 'name_bn' => 'বিক্রয় চালান প্রিন্ট', 'slug' => 'sales.print', 'group' => 'sales'],
            ['name' => 'View Sales Returns', 'name_bn' => 'বিক্রয় ফেরত তালিকা', 'slug' => 'sales.returns_view', 'group' => 'sales'],
            ['name' => 'Create Return Request', 'name_bn' => 'পণ্য ফেরত আবেদন তৈরি', 'slug' => 'sales.returns_create', 'group' => 'sales'],
            ['name' => 'Approve Returns & Refunds', 'name_bn' => 'ফেরত ও রিফান্ড অনুমোদন', 'slug' => 'sales.returns_approve', 'group' => 'sales'],

            // Category 7: Customers & Loyalty
            ['name' => 'View Customer Directory', 'name_bn' => 'গ্রাহক তালিকা দেখুন', 'slug' => 'customers.view', 'group' => 'customers'],
            ['name' => 'Create Customer Profile', 'name_bn' => 'নতুন গ্রাহক যোগ', 'slug' => 'customers.create', 'group' => 'customers'],
            ['name' => 'Edit Customer Details', 'name_bn' => 'গ্রাহক তথ্য পরিবর্তন', 'slug' => 'customers.edit', 'group' => 'customers'],
            ['name' => 'Delete Customer Records', 'name_bn' => 'গ্রাহক মুছে ফেলুন', 'slug' => 'customers.delete', 'group' => 'customers'],
            ['name' => 'Receive Customer Payments & Dues', 'name_bn' => 'বকেয়া আদায় ও লেজার পরিচালনা', 'slug' => 'customers.manage', 'group' => 'customers'],
            ['name' => 'Manage Loyalty Points', 'name_bn' => 'লয়্যালটি পয়েন্ট পরিচালনা', 'slug' => 'customers.loyalty_manage', 'group' => 'customers'],
            ['name' => 'Export Customer Data', 'name_bn' => 'গ্রাহক তালিকা এক্সপোর্ট', 'slug' => 'customers.export', 'group' => 'customers'],

            // Category 8: Employees & Attendance
            ['name' => 'View Employees Directory', 'name_bn' => 'কর্মী তালিকা দেখুন', 'slug' => 'employees.view', 'group' => 'employees'],
            ['name' => 'Create Employee Profile', 'name_bn' => 'নতুন কর্মী যুক্ত করুন', 'slug' => 'employees.create', 'group' => 'employees'],
            ['name' => 'Edit Employee Profile', 'name_bn' => 'কর্মী তথ্য সম্পাদনা', 'slug' => 'employees.edit', 'group' => 'employees'],
            ['name' => 'Delete Employee Records', 'name_bn' => 'কর্মী অপসারণ', 'slug' => 'employees.delete', 'group' => 'employees'],
            ['name' => 'Manage Roles & Permissions', 'name_bn' => 'ভূমিকা ও পারমিশন পরিচালনা', 'slug' => 'employees.roles_manage', 'group' => 'employees'],

            // Category 9: Accounting & Finance
            ['name' => 'View Financial Accounting & Cash Flow', 'name_bn' => 'হিসাবরক্ষণ ও নগদ প্রবাহ দেখুন', 'slug' => 'accounting.view', 'group' => 'accounting'],
            ['name' => 'View Customer Due Ledger', 'name_bn' => 'গ্রাহক বকেয়া লেজার দেখুন', 'slug' => 'accounting.customer_due', 'group' => 'accounting'],
            ['name' => 'View Supplier Due Ledger', 'name_bn' => 'সরবরাহকারী বকেয়া লেজার দেখুন', 'slug' => 'accounting.supplier_due', 'group' => 'accounting'],
            ['name' => 'Export Financial Statements', 'name_bn' => 'আর্থিক বিবরণী এক্সপোর্ট', 'slug' => 'accounting.export', 'group' => 'accounting'],

            // Category 10: Expenses
            ['name' => 'View Store Expenses', 'name_bn' => 'দোকানের খরচ দেখুন', 'slug' => 'expenses.view', 'group' => 'expenses'],
            ['name' => 'Record New Expense', 'name_bn' => 'নতুন খরচ এন্ট্রি', 'slug' => 'expenses.create', 'group' => 'expenses'],
            ['name' => 'Edit Expense Records', 'name_bn' => 'খরচ তথ্য পরিবর্তন', 'slug' => 'expenses.edit', 'group' => 'expenses'],
            ['name' => 'Delete Expense Records', 'name_bn' => 'খরচ মুছে ফেলুন', 'slug' => 'expenses.delete', 'group' => 'expenses'],
            ['name' => 'Manage Expense Categories', 'name_bn' => 'খরচ খাত পরিচালনা', 'slug' => 'expenses.categories', 'group' => 'expenses'],

            // Category 11: Reports & Analytics
            ['name' => 'View Analytics Reports', 'name_bn' => 'প্রতিবেদন ও বিশ্লেষণ দেখুন', 'slug' => 'reports.view', 'group' => 'reports'],
            ['name' => 'View Daily Sales Report', 'name_bn' => 'দৈনিক বিক্রয় রিপোর্ট', 'slug' => 'reports.daily', 'group' => 'reports'],
            ['name' => 'View Monthly Performance Report', 'name_bn' => 'মাসিক বিক্রয় রিপোর্ট', 'slug' => 'reports.monthly', 'group' => 'reports'],
            ['name' => 'View Stock Valuation Report', 'name_bn' => 'স্টক মূল্যায়ন রিপোর্ট', 'slug' => 'reports.stock', 'group' => 'reports'],
            ['name' => 'Export Comprehensive Reports', 'name_bn' => 'রিপোর্ট এক্সপোর্ট করুন', 'slug' => 'reports.export', 'group' => 'reports'],

            // Category 12: Warehouse
            ['name' => 'View Warehouse Inventory & Racks', 'name_bn' => 'ওয়্যারহাউস স্টক ও র্যাক দেখুন', 'slug' => 'warehouse.view', 'group' => 'warehouse'],
            ['name' => 'Receive Incoming Goods to Warehouse', 'name_bn' => 'ওয়্যারহাউসে পণ্য গ্রহণ', 'slug' => 'warehouse.receive', 'group' => 'warehouse'],
            ['name' => 'Dispatch Goods & Transfers', 'name_bn' => 'শাখা স্থানান্তর ও ডেলিভারি', 'slug' => 'warehouse.dispatch', 'group' => 'warehouse'],

            // Category 13: Customer Service
            ['name' => 'Review & Approve Membership Requests', 'name_bn' => 'মেম্বারশিপ আবেদন যাচাই ও অনুমোদন', 'slug' => 'customer_service.approvals', 'group' => 'customer_service'],
            ['name' => 'Configure Customer Registration Form', 'name_bn' => 'রেজিস্ট্রেশন ফর্ম কনফিগার', 'slug' => 'customer_service.form_builder', 'group' => 'customer_service'],
            ['name' => 'Handle Customer Feedback & Inquiries', 'name_bn' => 'গ্রাহক সেবা ও অনুসন্ধান', 'slug' => 'customer_service.inquiries', 'group' => 'customer_service'],

            // Category 14: Audit & Activity Logs
            ['name' => 'View Audit Activity Logs', 'name_bn' => 'অডিট ও কার্যকলাপ লগ দেখুন', 'slug' => 'audit.view', 'group' => 'audit'],
            ['name' => 'Export Audit Logs', 'name_bn' => 'অডিট লগ এক্সপোর্ট', 'slug' => 'audit.export', 'group' => 'audit'],

            // Category 15: Branch Management
            ['name' => 'View Branch Stations', 'name_bn' => 'শাখা তালিকা দেখুন', 'slug' => 'branch.view', 'group' => 'branch'],
            ['name' => 'Manage Branches & Stations', 'name_bn' => 'শাখা ও কাউন্টার পরিচালনা', 'slug' => 'branch.manage', 'group' => 'branch'],

            // Category 16: System Settings
            ['name' => 'View Store Configurations', 'name_bn' => 'দোকান সেটিংস দেখুন', 'slug' => 'settings.view', 'group' => 'settings'],
            ['name' => 'Update Settings & Logo', 'name_bn' => 'সেটিংস ও লোগো পরিবর্তন', 'slug' => 'settings.manage', 'group' => 'settings'],
            ['name' => 'Download Database Backups', 'name_bn' => 'ডাটাবেজ ব্যাকআপ ডাউনলোড', 'slug' => 'settings.backup', 'group' => 'settings'],
        ];

        $permMap = [];
        foreach ($permissions as $p) {
            $perm = Permission::updateOrCreate(
                ['slug' => $p['slug']],
                [
                    'name' => $p['name'],
                    'name_bn' => $p['name_bn'],
                    'group' => $p['group'],
                ]
            );
            $permMap[$p['slug']] = $perm->id;
        }

        // Backward compatibility map for previous slug names
        $legacyMap = [
            'employees.manage' => 'employees.view',
            'expenses.manage' => 'expenses.create',
        ];
        foreach ($legacyMap as $oldSlug => $targetSlug) {
            if (isset($permMap[$targetSlug]) && !isset($permMap[$oldSlug])) {
                $permMap[$oldSlug] = $permMap[$targetSlug];
            }
        }

        // Helper to get permission IDs by list of slugs
        $getIds = function (array $slugs) use ($permMap) {
            $ids = [];
            foreach ($slugs as $s) {
                if (isset($permMap[$s])) {
                    $ids[] = $permMap[$s];
                }
            }
            return array_values(array_unique($ids));
        };

        // -------------------------------------------------------------
        // 3. Exactly 12 Predefined System Roles (Enterprise Super Shop Suite)
        // -------------------------------------------------------------
        $rolesData = [
            // 1. Super Admin
            [
                'slug' => 'super-admin',
                'name' => 'Super Admin',
                'name_bn' => 'সুপার অ্যাডমিন',
                'description' => 'সম্পূর্ণ সিস্টেম ও সমস্ত শাখার ওপর পূর্ণ ও অবাধ নিয়ন্ত্রণাধিকার।',
                'is_system' => true,
                'permissions' => array_values($permMap), // All permissions
            ],

            // 2. Admin / Store Administrator
            [
                'slug' => 'admin',
                'name' => 'Admin',
                'name_bn' => 'অ্যাডমিন',
                'description' => 'সিস্টেম মালিকের প্রতিনিধি হিসেবে দৈনিক দোকান প্রশাসন, কর্মী, ক্রয় ও বিক্রয় পরিচালনা।',
                'is_system' => true,
                'permissions' => $getIds([
                    'dashboard.view', 'dashboard.financial_stats',
                    'pos.access', 'pos.checkout', 'pos.discount_apply', 'pos.print',
                    'products.view', 'products.view_cost', 'products.create', 'products.edit', 'products.delete', 'products.export', 'products.print_barcode',
                    'inventory.view', 'inventory.adjust', 'inventory.history', 'inventory.export',
                    'suppliers.view', 'suppliers.manage',
                    'purchases.view', 'purchases.create', 'purchases.approve', 'purchases.print',
                    'sales.view', 'sales.export', 'sales.print', 'sales.returns_view', 'sales.returns_create', 'sales.returns_approve',
                    'customers.view', 'customers.create', 'customers.edit', 'customers.delete', 'customers.manage', 'customers.loyalty_manage', 'customers.export',
                    'employees.view', 'employees.create', 'employees.edit',
                    'accounting.view', 'accounting.customer_due', 'accounting.supplier_due', 'accounting.export',
                    'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.categories',
                    'reports.view', 'reports.daily', 'reports.monthly', 'reports.stock', 'reports.export',
                    'warehouse.view', 'warehouse.receive', 'warehouse.dispatch',
                    'customer_service.approvals', 'customer_service.form_builder', 'customer_service.inquiries',
                    'audit.view', 'audit.export',
                    'branch.view',
                    'settings.view', 'settings.manage',
                ]),
            ],

            // 3. Store Manager
            [
                'slug' => 'manager',
                'name' => 'Store Manager',
                'name_bn' => 'স্টোর ম্যানেজার',
                'description' => 'সুপার শপের দৈনিক আউটলেট অপারেশন, স্টক রিসিভ, বিক্রয় ও ফেরত অনুমোদন।',
                'is_system' => true,
                'permissions' => $getIds([
                    'dashboard.view', 'dashboard.financial_stats',
                    'pos.access', 'pos.checkout', 'pos.discount_apply', 'pos.price_override', 'pos.print',
                    'products.view', 'products.view_cost', 'products.create', 'products.edit', 'products.export', 'products.print_barcode',
                    'inventory.view', 'inventory.adjust', 'inventory.history', 'inventory.export',
                    'suppliers.view', 'suppliers.manage',
                    'purchases.view', 'purchases.create', 'purchases.approve', 'purchases.print',
                    'sales.view', 'sales.export', 'sales.print', 'sales.returns_view', 'sales.returns_create', 'sales.returns_approve',
                    'customers.view', 'customers.create', 'customers.edit', 'customers.manage', 'customers.loyalty_manage', 'customers.export',
                    'employees.view',
                    'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.categories',
                    'reports.view', 'reports.daily', 'reports.monthly', 'reports.stock', 'reports.export',
                    'warehouse.view', 'warehouse.receive',
                    'customer_service.approvals', 'customer_service.inquiries',
                    'branch.view',
                ]),
            ],

            // 4. Branch Manager
            [
                'slug' => 'branch-manager',
                'name' => 'Branch Manager',
                'name_bn' => 'শাখা ব্যবস্থাপক',
                'description' => 'নির্দিষ্ট শাখার কর্মী দল, দৈনিক নগদ লেনদেন, বিক্রয় লক্ষ্যমাত্রা ও স্থানীয় হিসাব ব্যবস্থাপনা।',
                'is_system' => true,
                'permissions' => $getIds([
                    'dashboard.view', 'dashboard.financial_stats',
                    'pos.access', 'pos.checkout', 'pos.discount_apply', 'pos.print',
                    'products.view', 'products.view_cost', 'products.edit', 'products.print_barcode',
                    'inventory.view', 'inventory.adjust', 'inventory.history',
                    'purchases.view', 'purchases.create', 'purchases.print',
                    'sales.view', 'sales.export', 'sales.print', 'sales.returns_view', 'sales.returns_create', 'sales.returns_approve',
                    'customers.view', 'customers.create', 'customers.edit', 'customers.manage', 'customers.loyalty_manage',
                    'employees.view',
                    'accounting.view', 'accounting.customer_due',
                    'expenses.view', 'expenses.create',
                    'reports.view', 'reports.daily', 'reports.stock',
                    'customer_service.approvals', 'customer_service.inquiries',
                    'branch.view',
                ]),
            ],

            // 5. Inventory Manager
            [
                'slug' => 'inventory-manager',
                'name' => 'Inventory Manager',
                'name_bn' => 'ইনভেন্টরি ম্যানেজার',
                'description' => 'পণ্যের মজুদ, ক্ষতি/ঘাটতি সমন্বয়, স্টক কাউন্টিং ও রিঅর্ডার লেভেল মনিটরিং।',
                'is_system' => true,
                'permissions' => $getIds([
                    'dashboard.view',
                    'products.view', 'products.create', 'products.edit', 'products.export', 'products.print_barcode',
                    'inventory.view', 'inventory.adjust', 'inventory.history', 'inventory.export',
                    'suppliers.view',
                    'purchases.view', 'purchases.create', 'purchases.print',
                    'warehouse.view', 'warehouse.receive', 'warehouse.dispatch',
                    'reports.view', 'reports.stock',
                ]),
            ],

            // 6. Purchase Manager
            [
                'slug' => 'purchase-manager',
                'name' => 'Purchase Manager',
                'name_bn' => 'পারচেজ ম্যানেজার',
                'description' => 'সরবরাহকারীদের সাথে যোগাযোগ, পাইকারি ক্রয় আদেশ প্রণয়ন ও মূল্য অনুমোদন।',
                'is_system' => true,
                'permissions' => $getIds([
                    'dashboard.view',
                    'products.view', 'products.view_cost', 'products.create', 'products.edit',
                    'suppliers.view', 'suppliers.manage',
                    'purchases.view', 'purchases.create', 'purchases.approve', 'purchases.print',
                    'inventory.view', 'inventory.history',
                    'accounting.supplier_due',
                    'reports.view', 'reports.stock',
                ]),
            ],

            // 7. Accountant
            [
                'slug' => 'accountant',
                'name' => 'Accountant',
                'name_bn' => 'হিসাবরক্ষক',
                'description' => 'আর্থিক প্রতিবেদন, অডিট, দৈনিক ক্যাশ ফ্লো, গ্রাহক ও সরবরাহকারী বকেয়া সমন্বয়। (ইনভেন্টরি স্টক পরিবর্তন নিষিদ্ধ)',
                'is_system' => true,
                'permissions' => $getIds([
                    'dashboard.view', 'dashboard.financial_stats',
                    'sales.view', 'sales.export', 'sales.print', 'sales.returns_view',
                    'purchases.view', 'purchases.print',
                    'customers.view', 'customers.manage', 'customers.export',
                    'suppliers.view',
                    'accounting.view', 'accounting.customer_due', 'accounting.supplier_due', 'accounting.export',
                    'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.categories',
                    'reports.view', 'reports.daily', 'reports.monthly', 'reports.stock', 'reports.export',
                    'audit.view',
                ]),
            ],

            // 8. Cashier
            [
                'slug' => 'cashier',
                'name' => 'Cashier',
                'name_bn' => 'ক্যাশিয়ার',
                'description' => 'কাউন্টারে দ্রুত বারকোড স্ক্যান, পিওএস বিক্রয় ও রসিদ প্রদান। (অন্যান্য সকল মডিউল সম্পূর্ণরূপে লুকানো থাকবে)',
                'is_system' => true,
                'permissions' => $getIds([
                    'pos.access', 'pos.checkout', 'pos.discount_apply', 'pos.print',
                ]),
            ],

            // 9. Sales Staff
            [
                'slug' => 'sales-staff',
                'name' => 'Sales Staff',
                'name_bn' => 'বিক্রয় কর্মী',
                'description' => 'আউটলেটে ক্রেতাদের সহায়তা, মূল্য ও ডিসকাউন্ট তথ্য যাচাই এবং কাউন্টার বিক্রয়।',
                'is_system' => true,
                'permissions' => $getIds([
                    'pos.access', 'pos.print',
                    'products.view',
                ]),
            ],

            // 10. Customer Service Staff
            [
                'slug' => 'customer-service',
                'name' => 'Customer Service Staff',
                'name_bn' => 'গ্রাহক সেবা কর্মী',
                'description' => 'গ্রাহক মেম্বারশিপ আবেদন অনুমোদন, লয়্যালটি কার্ড প্রদান ও গ্রাহক সেবা পরিচালনা।',
                'is_system' => true,
                'permissions' => $getIds([
                    'customers.view', 'customers.create', 'customers.edit', 'customers.manage', 'customers.loyalty_manage', 'customers.export',
                    'customer_service.approvals', 'customer_service.form_builder', 'customer_service.inquiries',
                ]),
            ],

            // 11. Warehouse Staff
            [
                'slug' => 'warehouse-staff',
                'name' => 'Warehouse Staff',
                'name_bn' => 'ওয়্যারহাউস কর্মী',
                'description' => 'গুদামে পণ্য লোডিং-আনলোডিং, চালান মিলিয়ে গ্রহণ ও শাখার উদ্দেশ্যে মালামাল স্থানান্তর।',
                'is_system' => true,
                'permissions' => $getIds([
                    'inventory.view',
                    'products.print_barcode',
                    'warehouse.view', 'warehouse.receive', 'warehouse.dispatch',
                ]),
            ],

            // 12. Auditor / Supervisor
            [
                'slug' => 'auditor',
                'name' => 'Auditor / Supervisor',
                'name_bn' => 'নিরীক্ষক / সুপারভাইজার',
                'description' => 'আর্থিক লেনদেন, অডিট ট্রেইল, ক্যাশ ট্রানজেকশন ও স্টক নিরীক্ষা। (রেকর্ড পরিবর্তন বা মুছে ফেলা সম্পূর্ণ নিষিদ্ধ)',
                'is_system' => true,
                'permissions' => $getIds([
                    'dashboard.view', 'dashboard.financial_stats',
                    'products.view', 'products.view_cost', 'products.export',
                    'inventory.view', 'inventory.history', 'inventory.export',
                    'sales.view', 'sales.export', 'sales.returns_view',
                    'purchases.view',
                    'customers.view', 'customers.export',
                    'suppliers.view',
                    'accounting.view', 'accounting.customer_due', 'accounting.supplier_due', 'accounting.export',
                    'expenses.view',
                    'reports.view', 'reports.daily', 'reports.monthly', 'reports.stock', 'reports.export',
                    'audit.view', 'audit.export',
                    'branch.view',
                ]),
            ],
        ];

        $roleModels = [];
        foreach ($rolesData as $rd) {
            $role = Role::updateOrCreate(
                ['slug' => $rd['slug']],
                [
                    'name' => $rd['name'],
                    'name_bn' => $rd['name_bn'],
                    'description' => $rd['description'],
                    'is_system' => true,
                ]
            );

            // Sync permissions
            $role->permissions()->sync($rd['permissions']);
            $roleModels[$rd['slug']] = $role;
        }

        // -------------------------------------------------------------
        // 4. Update Existing Users & Seed Enterprise Department Roles
        // -------------------------------------------------------------
        // Israfil - Super Admin
        $superAdminUser = User::where('email', 'admin@israfilbd.com')->first();
        if ($superAdminUser) {
            $superAdminUser->update([
                'employee_id' => $superAdminUser->employee_id ?: 'EMP-1001',
                'department' => $superAdminUser->department ?: 'Executive Board',
                'designation' => $superAdminUser->designation ?: 'Managing Director & Super Admin',
                'branch_id' => $superAdminUser->branch_id ?: $mainBranch->id,
                'joining_date' => $superAdminUser->joining_date ?: '2024-01-01',
                'role_id' => $roleModels['super-admin']->id,
            ]);
        }

        // Tarek - Manager
        $managerUser = User::where('email', 'manager@israfilbd.com')->first();
        if ($managerUser) {
            $managerUser->update([
                'employee_id' => $managerUser->employee_id ?: 'EMP-1002',
                'department' => $managerUser->department ?: 'Retail Operations',
                'designation' => $managerUser->designation ?: 'Chief Store Manager',
                'branch_id' => $managerUser->branch_id ?: $mainBranch->id,
                'joining_date' => $managerUser->joining_date ?: '2024-03-01',
                'role_id' => $roleModels['manager']->id,
            ]);
        }

        // Sakib - Cashier
        $cashierUser = User::where('email', 'cashier@israfilbd.com')->first();
        if ($cashierUser) {
            $cashierUser->update([
                'employee_id' => $cashierUser->employee_id ?: 'EMP-1003',
                'department' => $cashierUser->department ?: 'Front Desk & Cash',
                'designation' => $cashierUser->designation ?: 'Head Cashier',
                'branch_id' => $cashierUser->branch_id ?: $mainBranch->id,
                'joining_date' => $cashierUser->joining_date ?: '2024-06-01',
                'role_id' => $roleModels['cashier']->id,
            ]);
        }

        // Seed demonstration employee accounts for key super shop roles (if not exists)
        $staffAccounts = [
            [
                'email' => 'admin.store@israfilbd.com',
                'name' => 'আব্দুর রহিম (Rahim - Admin)',
                'phone' => '01711000004',
                'role_slug' => 'admin',
                'employee_id' => 'EMP-1004',
                'department' => 'Administration',
                'designation' => 'Store Administrator',
            ],
            [
                'email' => 'accountant@israfilbd.com',
                'name' => 'মাহমুদুল হক (Mahmud - Accountant)',
                'phone' => '01711000005',
                'role_slug' => 'accountant',
                'employee_id' => 'EMP-1005',
                'department' => 'Finance & Accounts',
                'designation' => 'Senior Accountant',
            ],
            [
                'email' => 'inventory@israfilbd.com',
                'name' => 'কামাল হোসেন (Kamal - Inventory)',
                'phone' => '01711000006',
                'role_slug' => 'inventory-manager',
                'employee_id' => 'EMP-1006',
                'department' => 'Inventory & Supply Chain',
                'designation' => 'Inventory Controller',
            ],
            [
                'email' => 'purchase@israfilbd.com',
                'name' => 'নাজমুল হাসান (Nazmul - Purchase)',
                'phone' => '01711000007',
                'role_slug' => 'purchase-manager',
                'employee_id' => 'EMP-1007',
                'department' => 'Procurement',
                'designation' => 'Purchase Specialist',
            ],
            [
                'email' => 'auditor@israfilbd.com',
                'name' => 'শাহীন আলম (Shahin - Auditor)',
                'phone' => '01711000008',
                'role_slug' => 'auditor',
                'employee_id' => 'EMP-1008',
                'department' => 'Internal Audit & Compliance',
                'designation' => 'Internal Compliance Auditor',
            ],
            [
                'email' => 'customer.care@israfilbd.com',
                'name' => 'সালমা আক্তার (Salma - Customer Care)',
                'phone' => '01711000009',
                'role_slug' => 'customer-service',
                'employee_id' => 'EMP-1009',
                'department' => 'Customer Experience',
                'designation' => 'Customer Care Officer',
            ],
        ];

        foreach ($staffAccounts as $acc) {
            User::firstOrCreate(
                ['email' => $acc['email']],
                [
                    'name' => $acc['name'],
                    'phone' => $acc['phone'],
                    'password' => Hash::make('password123'),
                    'role_id' => $roleModels[$acc['role_slug']]->id ?? $roleModels['manager']->id,
                    'employee_id' => $acc['employee_id'],
                    'department' => $acc['department'],
                    'designation' => $acc['designation'],
                    'branch_id' => $mainBranch->id,
                    'joining_date' => '2024-08-01',
                    'status' => 'active',
                ]
            );
        }
    }
}

