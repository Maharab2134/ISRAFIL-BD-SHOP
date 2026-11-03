<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\ExpenseCategory;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Setting;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's real foundation database.
     * ZERO dummy products or fake sales. Ready for 100% real retail store operations.
     */
    public function run(): void
    {
        // 1. System Permissions (Core Security & RBAC)
        $permissions = [
            ['name' => 'Access POS', 'name_bn' => 'পিওএস অ্যাক্সেস', 'slug' => 'pos.access', 'group' => 'pos'],
            ['name' => 'View Products', 'name_bn' => 'পণ্য দেখুন', 'slug' => 'products.view', 'group' => 'products'],
            ['name' => 'Create Products', 'name_bn' => 'নতুন পণ্য তৈরি', 'slug' => 'products.create', 'group' => 'products'],
            ['name' => 'Edit Products', 'name_bn' => 'পণ্য সম্পাদন', 'slug' => 'products.edit', 'group' => 'products'],
            ['name' => 'Delete Products', 'name_bn' => 'পণ্য মুছুন', 'slug' => 'products.delete', 'group' => 'products'],
            ['name' => 'View Inventory', 'name_bn' => 'ইনভেন্টরি দেখুন', 'slug' => 'inventory.view', 'group' => 'inventory'],
            ['name' => 'Adjust Stock', 'name_bn' => 'স্টক সমন্বয়', 'slug' => 'inventory.adjust', 'group' => 'inventory'],
            ['name' => 'View Customers', 'name_bn' => 'গ্রাহক দেখুন', 'slug' => 'customers.view', 'group' => 'customers'],
            ['name' => 'Manage Customers', 'name_bn' => 'গ্রাহক পরিচালনা', 'slug' => 'customers.manage', 'group' => 'customers'],
            ['name' => 'View Suppliers', 'name_bn' => 'সরবরাহকারী দেখুন', 'slug' => 'suppliers.view', 'group' => 'suppliers'],
            ['name' => 'Manage Suppliers', 'name_bn' => 'সরবরাহকারী পরিচালনা', 'slug' => 'suppliers.manage', 'group' => 'suppliers'],
            ['name' => 'View Purchases', 'name_bn' => 'ক্রয় দেখুন', 'slug' => 'purchases.view', 'group' => 'purchases'],
            ['name' => 'Create Purchases', 'name_bn' => 'নতুন ক্রয় তৈরি', 'slug' => 'purchases.create', 'group' => 'purchases'],
            ['name' => 'View Sales', 'name_bn' => 'বিক্রয় তালিকা দেখুন', 'slug' => 'sales.view', 'group' => 'sales'],
            ['name' => 'View Expenses', 'name_bn' => 'খরচ দেখুন', 'slug' => 'expenses.view', 'group' => 'expenses'],
            ['name' => 'Manage Expenses', 'name_bn' => 'খরচ পরিচালনা', 'slug' => 'expenses.manage', 'group' => 'expenses'],
            ['name' => 'View Accounting', 'name_bn' => 'হিসাবরক্ষণ দেখুন', 'slug' => 'accounting.view', 'group' => 'accounting'],
            ['name' => 'View Reports', 'name_bn' => 'প্রতিবেদন দেখুন', 'slug' => 'reports.view', 'group' => 'reports'],
            ['name' => 'Manage Employees', 'name_bn' => 'কর্মচারী পরিচালনা', 'slug' => 'employees.manage', 'group' => 'employees'],
            ['name' => 'Manage Settings', 'name_bn' => 'সেটিংস পরিচালনা', 'slug' => 'settings.manage', 'group' => 'settings'],
        ];

        $permissionModels = [];
        foreach ($permissions as $p) {
            $permissionModels[$p['slug']] = Permission::firstOrCreate(['slug' => $p['slug']], $p);
        }

        // 2. System Roles
        $superAdminRole = Role::firstOrCreate(
            ['slug' => 'super-admin'],
            [
                'name' => 'Super Admin',
                'name_bn' => 'সুপার অ্যাডমিন',
                'description' => 'সম্পূর্ণ সিস্টেমের পূর্ণ নিয়ন্ত্রণ',
                'is_system' => true,
            ]
        );

        $managerRole = Role::firstOrCreate(
            ['slug' => 'manager'],
            [
                'name' => 'Store Manager',
                'name_bn' => 'স্টোর ম্যানেজার',
                'description' => 'দোকান, স্টক, ক্রয় ও বিক্রয় ব্যবস্থাপনা',
                'is_system' => true,
            ]
        );

        $cashierRole = Role::firstOrCreate(
            ['slug' => 'cashier'],
            [
                'name' => 'Cashier',
                'name_bn' => 'ক্যাশিয়ার',
                'description' => 'পিওএস বিক্রয় ও গ্রাহক লেনদেন',
                'is_system' => true,
            ]
        );

        // Assign Permissions to Roles
        $superAdminRole->permissions()->sync(array_values(array_map(fn($m) => $m->id, $permissionModels)));
        $managerRole->permissions()->sync([
            $permissionModels['pos.access']->id,
            $permissionModels['products.view']->id,
            $permissionModels['products.create']->id,
            $permissionModels['products.edit']->id,
            $permissionModels['inventory.view']->id,
            $permissionModels['inventory.adjust']->id,
            $permissionModels['customers.view']->id,
            $permissionModels['customers.manage']->id,
            $permissionModels['suppliers.view']->id,
            $permissionModels['purchases.view']->id,
            $permissionModels['purchases.create']->id,
            $permissionModels['sales.view']->id,
            $permissionModels['expenses.view']->id,
            $permissionModels['reports.view']->id,
        ]);
        $cashierRole->permissions()->sync([
            $permissionModels['pos.access']->id,
            $permissionModels['products.view']->id,
            $permissionModels['customers.view']->id,
            $permissionModels['customers.manage']->id,
            $permissionModels['sales.view']->id,
        ]);

        // 3. Initial Staff User Accounts (Real initial credentials)
        User::firstOrCreate(
            ['email' => 'admin@israfilbd.com'],
            [
                'name' => 'ইসরাফিল মজুমদার (Israfil)',
                'phone' => '01711000001',
                'password' => Hash::make('admin123'),
                'role_id' => $superAdminRole->id,
                'status' => 'active',
            ]
        );

        User::firstOrCreate(
            ['email' => 'manager@israfilbd.com'],
            [
                'name' => 'তারেক মাহমুদ (Tarek - Manager)',
                'phone' => '01711000002',
                'password' => Hash::make('manager123'),
                'role_id' => $managerRole->id,
                'status' => 'active',
            ]
        );

        User::firstOrCreate(
            ['email' => 'cashier@israfilbd.com'],
            [
                'name' => 'সাকিব হাসান (Sakib - Cashier)',
                'phone' => '01711000003',
                'password' => Hash::make('cashier123'),
                'role_id' => $cashierRole->id,
                'status' => 'active',
            ]
        );

        // 4. Standard Measurement Units (প্রয়োজনীয় পরিমাপক একক)
        $units = [
            ['name' => 'Piece', 'name_bn' => 'পিস', 'code' => 'pcs'],
            ['name' => 'Kilogram', 'name_bn' => 'কেজি', 'code' => 'kg'],
            ['name' => 'Packet', 'name_bn' => 'প্যাকেট', 'code' => 'pkt'],
            ['name' => 'Box', 'name_bn' => 'বক্স', 'code' => 'box'],
            ['name' => 'Liter', 'name_bn' => 'লিটার', 'code' => 'ltr'],
            ['name' => 'Dozen', 'name_bn' => 'ডজন', 'code' => 'dzn'],
        ];
        foreach ($units as $u) {
            Unit::firstOrCreate(['code' => $u['code']], $u);
        }

        // 5. Standard Expense Categories (দোকানের নিয়মিত খরচের খাত)
        $expenseCategories = [
            ['name' => 'Shop Rent', 'name_bn' => 'দোকান ভাড়া', 'description' => 'মাসিক দোকান ভাড়া বাবদ ব্যয়', 'status' => 'active'],
            ['name' => 'Electricity & Utilities', 'name_bn' => 'বিদ্যুৎ ও ইউটিলিটি বিল', 'description' => 'বিদ্যুৎ, পানি ও গ্যাস বিল', 'status' => 'active'],
            ['name' => 'Staff Salaries', 'name_bn' => 'কর্মচারীর বেতন ও ভাতা', 'description' => 'কর্মচারীদের বেতন ও দৈনিক ভাতা', 'status' => 'active'],
            ['name' => 'Transport & Logistics', 'name_bn' => 'পরিবহন ও যাতায়াত খরচ', 'description' => 'পণ্য পরিবহন ও যাতায়াত খরচ', 'status' => 'active'],
            ['name' => 'Internet & Phone', 'name_bn' => 'ইন্টারনেট ও ফোন বিল', 'description' => 'দোকানের ইন্টারনেট ও মোবাইল রিচার্জ বিল', 'status' => 'active'],
            ['name' => 'Entertainment & Tea', 'name_bn' => 'চা-নাস্তা ও আপ্যায়ন', 'description' => 'অতিথি ও কর্মচারীদের চা-নাস্তা খরচ', 'status' => 'active'],
            ['name' => 'Maintenance & Repairs', 'name_bn' => 'দোকান মেরামত ও রক্ষণাবেক্ষণ', 'description' => 'দোকান ও আসবাবপত্র মেরামত', 'status' => 'active'],
            ['name' => 'Miscellaneous', 'name_bn' => 'অন্যান্য পরিচালনা ব্যয়', 'description' => 'বিবিধ পরিচালনা খরচ', 'status' => 'active'],
        ];
        foreach ($expenseCategories as $ec) {
            ExpenseCategory::firstOrCreate(['name' => $ec['name']], $ec);
        }

        // 6. Default Walk-in Customer (নগদ বিক্রয়ের সাধারণ ক্রেতা)
        Customer::firstOrCreate(
            ['phone' => '01700000000'],
            [
                'name' => 'ওয়াক-ইন কাস্টমার (Walk-in Customer)',
                'phone' => '01700000000',
                'email' => null,
                'address' => 'ঢাকা, বাংলাদেশ',
                'opening_balance' => 0.00,
                'current_balance' => 0.00,
                'credit_limit' => 0.00,
            ]
        );

        // 7. System & Shop Settings (দোকানের প্রাথমিক কনফিগারেশন)
        $settings = [
            'shop_name' => 'ISRAFIL BD SHOP',
            'shop_tagline' => 'প্রিমিয়াম রিটেইল ও পিওএস আউটলেট',
            'shop_phone' => '+880 1700-000000',
            'shop_email' => 'info@israfilbd.com',
            'shop_address' => 'ঢাকা, বাংলাদেশ',
            'default_printer_type' => '80mm',
            'invoice_prefix' => 'INV-',
            'receipt_footer' => 'আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ! পণ্য পরিবর্তনের জন্য ৭ দিনের মধ্যে ক্যাশ মেমোসহ আসুন।',
            'auto_print' => '1',
            'default_tax_rate' => '0',
            'currency_symbol' => '৳',
            'currency_code' => 'BDT',
        ];

        foreach ($settings as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
