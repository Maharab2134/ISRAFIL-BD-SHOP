<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\PurchasePayment;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Permissions
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
            $permissionModels[$p['slug']] = Permission::create($p);
        }

        // 2. Roles
        $superAdminRole = Role::create([
            'name' => 'Super Admin',
            'name_bn' => 'সুপার অ্যাডমিন',
            'slug' => 'super-admin',
            'description' => 'সম্পূর্ণ সিস্টেমের পূর্ণ নিয়ন্ত্রণ',
            'is_system' => true,
        ]);

        $managerRole = Role::create([
            'name' => 'Store Manager',
            'name_bn' => 'স্টোর ম্যানেজার',
            'slug' => 'manager',
            'description' => 'দোকান, স্টক, ক্রয় ও বিক্রয় ব্যবস্থাপনা',
            'is_system' => true,
        ]);

        $cashierRole = Role::create([
            'name' => 'Cashier',
            'name_bn' => 'ক্যাশিয়ার',
            'slug' => 'cashier',
            'description' => 'পিওএস বিক্রয় ও গ্রাহক লেনদেন',
            'is_system' => true,
        ]);

        // Assign permissions
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

        // 3. Users
        $adminUser = User::create([
            'name' => 'ইসরাফিল মজুমদার (Israfil)',
            'email' => 'admin@israfilbd.com',
            'phone' => '01711000001',
            'password' => Hash::make('password123'),
            'role_id' => $superAdminRole->id,
            'status' => 'active',
        ]);

        $managerUser = User::create([
            'name' => 'তারেক মাহমুদ (Tarek - Manager)',
            'email' => 'manager@israfilbd.com',
            'phone' => '01711000002',
            'password' => Hash::make('password123'),
            'role_id' => $managerRole->id,
            'status' => 'active',
        ]);

        $cashierUser = User::create([
            'name' => 'সাকিব হাসান (Sakib - Cashier)',
            'email' => 'cashier@israfilbd.com',
            'phone' => '01711000003',
            'password' => Hash::make('password123'),
            'role_id' => $cashierRole->id,
            'status' => 'active',
        ]);

        // 4. Units
        $units = [
            ['name' => 'Piece', 'name_bn' => 'পিস', 'code' => 'pcs'],
            ['name' => 'Kilogram', 'name_bn' => 'কেজি', 'code' => 'kg'],
            ['name' => 'Packet', 'name_bn' => 'প্যাকেট', 'code' => 'pkt'],
            ['name' => 'Box', 'name_bn' => 'বক্স', 'code' => 'box'],
            ['name' => 'Liter', 'name_bn' => 'লিটার', 'code' => 'ltr'],
        ];
        $unitModels = [];
        foreach ($units as $u) {
            $unitModels[$u['code']] = Unit::create($u);
        }

        // 5. Brands
        $brands = [
            ['name' => 'Samsung', 'name_bn' => 'স্যামসাং', 'slug' => 'samsung'],
            ['name' => 'Walton', 'name_bn' => 'ওয়ালটন', 'slug' => 'walton'],
            ['name' => 'Unilever', 'name_bn' => 'ইউনিলিভার', 'slug' => 'unilever'],
            ['name' => 'PRAN', 'name_bn' => 'প্রাণ', 'slug' => 'pran'],
            ['name' => 'Square', 'name_bn' => 'স্কয়ার', 'slug' => 'square'],
            ['name' => 'Xiaomi', 'name_bn' => 'শাওমি', 'slug' => 'xiaomi'],
            ['name' => 'Nestle', 'name_bn' => 'নেস্লে', 'slug' => 'nestle'],
        ];
        $brandModels = [];
        foreach ($brands as $b) {
            $brandModels[$b['slug']] = Brand::create($b);
        }

        // 6. Categories
        $categories = [
            ['name' => 'Electronics & Gadgets', 'name_bn' => 'ইলেকট্রনিক্স ও গ্যাজেট', 'slug' => 'electronics', 'code' => 'CAT-ELEC'],
            ['name' => 'Mobile Accessories', 'name_bn' => 'মোবাইল এক্সেসরিজ', 'slug' => 'mobile-acc', 'code' => 'CAT-MOB'],
            ['name' => 'Grocery & Daily Needs', 'name_bn' => 'মুদি ও নিত্যপ্রয়োজনীয় পণ্য', 'slug' => 'groceries', 'code' => 'CAT-GROC'],
            ['name' => 'Fashion & Apparel', 'name_bn' => 'পোশাক ও ফ্যাশন', 'slug' => 'fashion', 'code' => 'CAT-FASH'],
            ['name' => 'Cosmetics & Personal Care', 'name_bn' => 'প্রসাধনী ও স্কিন কেয়ার', 'slug' => 'cosmetics', 'code' => 'CAT-COSM'],
        ];
        $catModels = [];
        foreach ($categories as $c) {
            $catModels[$c['slug']] = Category::create($c);
        }

        // 7. Products (Real retail products with barcodes)
        $productsData = [
            [
                'name' => 'Wireless Bluetooth Earbuds Pro',
                'name_bn' => 'ওয়্যারলেস ব্লুটুথ ইয়ারবাডস প্রো',
                'barcode' => '894110001001',
                'sku' => 'EAR-PRO-01',
                'category_id' => $catModels['mobile-acc']->id,
                'brand_id' => $brandModels['xiaomi']->id,
                'unit_id' => $unitModels['pcs']->id,
                'purchase_price' => 1250.00,
                'selling_price' => 1850.00,
                'current_stock' => 45,
                'alert_stock' => 10,
                'tax_percent' => 5.00,
                'image_url' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
            ],
            [
                'name' => 'Fast Charging Power Bank 20000mAh',
                'name_bn' => 'ফাস্ট চার্জিং পাওয়ার ব্যাংক ২০০০০ mAh',
                'barcode' => '894110001002',
                'sku' => 'PWR-20K-02',
                'category_id' => $catModels['mobile-acc']->id,
                'brand_id' => $brandModels['xiaomi']->id,
                'unit_id' => $unitModels['pcs']->id,
                'purchase_price' => 1600.00,
                'selling_price' => 2200.00,
                'current_stock' => 30,
                'alert_stock' => 8,
                'tax_percent' => 5.00,
                'image_url' => 'https://images.unsplash.com/photo-1609592424368-96942c7fa370?w=500',
            ],
            [
                'name' => 'Smart Watch Fitness Tracker',
                'name_bn' => 'স্মার্ট ওয়াচ ফিটনেস ট্র্যাকার',
                'barcode' => '894110001003',
                'sku' => 'SMT-WTC-03',
                'category_id' => $catModels['electronics']->id,
                'brand_id' => $brandModels['samsung']->id,
                'unit_id' => $unitModels['pcs']->id,
                'purchase_price' => 2800.00,
                'selling_price' => 3800.00,
                'current_stock' => 18,
                'alert_stock' => 5,
                'tax_percent' => 5.00,
                'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            ],
            [
                'name' => 'Pran Premium Chinigura Rice 1kg',
                'name_bn' => 'প্রাণ প্রিমিয়াম চিনিগুঁড়া চাল ১ কেজি',
                'barcode' => '894110001004',
                'sku' => 'RICE-CHINI-1KG',
                'category_id' => $catModels['groceries']->id,
                'brand_id' => $brandModels['pran']->id,
                'unit_id' => $unitModels['pkt']->id,
                'purchase_price' => 135.00,
                'selling_price' => 165.00,
                'current_stock' => 120,
                'alert_stock' => 20,
                'tax_percent' => 0.00,
                'image_url' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
            ],
            [
                'name' => 'Square Radhuni Pure Mustard Oil 500ml',
                'name_bn' => 'রাধুনী খাঁটি সরিষার তেল ৫০০ মিলি',
                'barcode' => '894110001005',
                'sku' => 'RAD-OIL-500ML',
                'category_id' => $catModels['groceries']->id,
                'brand_id' => $brandModels['square']->id,
                'unit_id' => $unitModels['pcs']->id,
                'purchase_price' => 140.00,
                'selling_price' => 170.00,
                'current_stock' => 60,
                'alert_stock' => 15,
                'tax_percent' => 0.00,
                'image_url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
            ],
            [
                'name' => 'Dove Deep Moisture Shampoo 340ml',
                'name_bn' => 'ডোভ ডিপ ময়েশ্চার শ্যাম্পু ৩৪০ মিলি',
                'barcode' => '894110001006',
                'sku' => 'DOVE-SHMP-340',
                'category_id' => $catModels['cosmetics']->id,
                'brand_id' => $brandModels['unilever']->id,
                'unit_id' => $unitModels['pcs']->id,
                'purchase_price' => 360.00,
                'selling_price' => 450.00,
                'current_stock' => 40,
                'alert_stock' => 10,
                'tax_percent' => 5.00,
                'image_url' => 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500',
            ],
            [
                'name' => 'Premium Cotton Polo Shirt - Navy Blue',
                'name_bn' => 'প্রিমিয়াম কটন পোলো শার্ট - নেভি ব্লু',
                'barcode' => '894110001007',
                'sku' => 'POLO-NVY-L',
                'category_id' => $catModels['fashion']->id,
                'brand_id' => null,
                'unit_id' => $unitModels['pcs']->id,
                'purchase_price' => 520.00,
                'selling_price' => 850.00,
                'current_stock' => 25,
                'alert_stock' => 6,
                'tax_percent' => 5.00,
                'image_url' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500',
            ],
            [
                'name' => 'USB-C to Lightning Cable 1.5M',
                'name_bn' => 'ইউএসবি-সি টু লাইটনিং কেবল ১.৫ মিটার',
                'barcode' => '894110001008',
                'sku' => 'CAB-LGT-15M',
                'category_id' => $catModels['mobile-acc']->id,
                'brand_id' => $brandModels['xiaomi']->id,
                'unit_id' => $unitModels['pcs']->id,
                'purchase_price' => 190.00,
                'selling_price' => 350.00,
                'current_stock' => 85,
                'alert_stock' => 15,
                'tax_percent' => 5.00,
                'image_url' => 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500',
            ],
            [
                'name' => 'Nescafe Classic Instant Coffee Jar 200g',
                'name_bn' => 'নেসক্যাফে ক্লাসিক ইনস্ট্যান্ট কফি ২০০ গ্রাম',
                'barcode' => '894110001009',
                'sku' => 'NES-COF-200G',
                'category_id' => $catModels['groceries']->id,
                'brand_id' => $brandModels['nestle']->id,
                'unit_id' => $unitModels['pcs']->id,
                'purchase_price' => 610.00,
                'selling_price' => 750.00,
                'current_stock' => 4, // Low stock on purpose
                'alert_stock' => 8,
                'tax_percent' => 5.00,
                'image_url' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
            ],
            [
                'name' => 'Walton Rechargeable Desk Fan 12-inch',
                'name_bn' => 'ওয়ালটন রিচার্জেবল ডেস্ক ফ্যান ১২ ইঞ্চি',
                'barcode' => '894110001010',
                'sku' => 'WLT-FAN-12',
                'category_id' => $catModels['electronics']->id,
                'brand_id' => $brandModels['walton']->id,
                'unit_id' => $unitModels['pcs']->id,
                'purchase_price' => 3100.00,
                'selling_price' => 4200.00,
                'current_stock' => 2, // Low stock alert
                'alert_stock' => 5,
                'tax_percent' => 5.00,
                'image_url' => 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=500',
            ],
        ];

        $productModels = [];
        foreach ($productsData as $pData) {
            $p = Product::create($pData);
            $productModels[] = $p;

            // Initial stock movement record
            StockMovement::create([
                'product_id' => $p->id,
                'movement_type' => 'initial',
                'user_id' => $adminUser->id,
                'quantity' => $p->current_stock,
                'stock_before' => 0,
                'stock_after' => $p->current_stock,
                'unit_cost' => $p->purchase_price,
                'reason' => 'প্রাথমিক উদ্বোধনী স্টক এন্ট্রি',
            ]);
        }

        // 8. Customers
        $customers = [
            [
                'name' => 'রফিকুল ইসলাম (Rafiqul Islam)',
                'phone' => '01819123456',
                'email' => 'rafiq@gmail.com',
                'address' => 'রোড #৪, বাড়ি #১২, নাসিরাবাদ, চট্টগ্রাম',
                'opening_balance' => 0,
                'current_balance' => 1250.00, // Due 1250 BDT
                'credit_limit' => 10000.00,
            ],
            [
                'name' => 'তানভীর চৌধুরী (Tanvir Chowdhury)',
                'phone' => '01712987654',
                'email' => 'tanvir.ctg@yahoo.com',
                'address' => 'ওআর নিজাম রোড, জিইসি, চট্টগ্রাম',
                'opening_balance' => 0,
                'current_balance' => 0.00,
                'credit_limit' => 20000.00,
            ],
            [
                'name' => 'ফারহানা সুলতানা (Farhana Sultana)',
                'phone' => '01911445566',
                'email' => 'farhana.s@gmail.com',
                'address' => 'হালিশহর হাউজিং এস্টেট, চট্টগ্রাম',
                'opening_balance' => 0,
                'current_balance' => 3400.00,
                'credit_limit' => 15000.00,
            ],
        ];
        $customerModels = [];
        foreach ($customers as $c) {
            $customerModels[] = Customer::create($c);
        }

        // 9. Suppliers
        $suppliers = [
            [
                'name' => 'স্কয়ার ডিস্ট্রিবিউশন হাব (Square Distribution)',
                'company_name' => 'Square Consumer Products Ltd.',
                'phone' => '01711223344',
                'email' => 'supply@squaregroup.com',
                'address' => 'তেজগাঁও শিল্প এলাকা, ঢাকা',
                'current_balance' => 15000.00,
            ],
            [
                'name' => 'প্রাণ আরএফএল ট্রেডিং (PRAN-RFL)',
                'company_name' => 'PRAN Trading Corporation',
                'phone' => '01811334455',
                'email' => 'sales@pranrflgroup.com',
                'address' => 'প্রাণ-আরএফএল সেন্টার, বাড্ডা, ঢাকা',
                'current_balance' => 8500.00,
            ],
            [
                'name' => 'ওয়ালটন সেন্ট্রাল ডিপো (Walton Central)',
                'company_name' => 'Walton Hi-Tech Industries PLC',
                'phone' => '01911556677',
                'email' => 'depot@waltonbd.com',
                'address' => 'চন্দ্রা, গাজীপুর',
                'current_balance' => 0.00,
            ],
        ];
        $supplierModels = [];
        foreach ($suppliers as $s) {
            $supplierModels[] = Supplier::create($s);
        }

        // 10. Sample Purchases
        $purchase1 = Purchase::create([
            'purchase_number' => 'PUR-2026-0001',
            'supplier_id' => $supplierModels[0]->id,
            'user_id' => $adminUser->id,
            'purchase_date' => now()->subDays(5)->format('Y-m-d'),
            'total_amount' => 15000.00,
            'discount_amount' => 500.00,
            'tax_amount' => 0.00,
            'shipping_cost' => 200.00,
            'grand_total' => 14700.00,
            'paid_amount' => 10000.00,
            'due_amount' => 4700.00,
            'payment_status' => 'partial',
            'purchase_status' => 'received',
            'notes' => 'মাসিক নিয়মিত স্টক ক্রয়',
        ]);

        PurchaseItem::create([
            'purchase_id' => $purchase1->id,
            'product_id' => $productModels[4]->id,
            'quantity' => 100,
            'unit_cost' => 140.00,
            'subtotal' => 14000.00,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total' => 14000.00,
        ]);

        PurchasePayment::create([
            'purchase_id' => $purchase1->id,
            'supplier_id' => $supplierModels[0]->id,
            'user_id' => $adminUser->id,
            'payment_number' => 'PPAY-2026-0001',
            'payment_date' => now()->subDays(5)->format('Y-m-d'),
            'payment_method' => 'bank',
            'amount' => 10000.00,
            'transaction_reference' => 'EFT-789123',
            'note' => 'প্রাথমিক ব্যাংক ট্রান্সফার পেমেন্ট',
        ]);

        // 11. Sample Sales
        $sale1 = Sale::create([
            'invoice_number' => 'INV-2026-0001',
            'customer_id' => $customerModels[0]->id,
            'customer_name' => $customerModels[0]->name,
            'customer_phone' => $customerModels[0]->phone,
            'user_id' => $cashierUser->id,
            'sale_date' => now()->subDays(2),
            'total_items' => 2,
            'subtotal' => 4050.00,
            'product_discount_total' => 0,
            'order_discount_type' => 'fixed',
            'order_discount_rate' => 50,
            'order_discount_amount' => 50.00,
            'tax_rate' => 5.00,
            'tax_amount' => 200.00,
            'grand_total' => 4200.00,
            'total_cost' => 2850.00, // COGS snapshot
            'total_profit' => 1150.00, // Profit
            'paid_amount' => 4200.00,
            'change_amount' => 0.00,
            'due_amount' => 0.00,
            'payment_status' => 'paid',
            'sale_status' => 'completed',
        ]);

        SaleItem::create([
            'sale_id' => $sale1->id,
            'product_id' => $productModels[0]->id,
            'product_name' => $productModels[0]->name,
            'product_code' => $productModels[0]->barcode,
            'quantity' => 1,
            'purchase_cost' => 1250.00,
            'unit_price' => 1850.00,
            'subtotal' => 1850.00,
            'tax_amount' => 92.50,
            'total' => 1850.00,
        ]);

        SaleItem::create([
            'sale_id' => $sale1->id,
            'product_id' => $productModels[1]->id,
            'product_name' => $productModels[1]->name,
            'product_code' => $productModels[1]->barcode,
            'quantity' => 1,
            'purchase_cost' => 1600.00,
            'unit_price' => 2200.00,
            'subtotal' => 2200.00,
            'tax_amount' => 107.50,
            'total' => 2200.00,
        ]);

        SalePayment::create([
            'sale_id' => $sale1->id,
            'customer_id' => $customerModels[0]->id,
            'user_id' => $cashierUser->id,
            'payment_number' => 'SPAY-2026-0001',
            'payment_date' => now()->subDays(2),
            'payment_method' => 'bkash',
            'amount' => 4200.00,
            'transaction_reference' => 'BK89X7Y12',
            'note' => 'বিকাশ মার্চেন্ট পেমেন্ট',
        ]);

        // Sale 2: Today Walk-in customer sale
        $sale2 = Sale::create([
            'invoice_number' => 'INV-2026-0002',
            'customer_id' => null,
            'customer_name' => 'ওয়াক-ইন কাস্টমার (Walk-in)',
            'customer_phone' => '01700000000',
            'user_id' => $cashierUser->id,
            'sale_date' => now(),
            'total_items' => 1,
            'subtotal' => 3800.00,
            'product_discount_total' => 0,
            'tax_rate' => 5.00,
            'tax_amount' => 190.00,
            'grand_total' => 3990.00,
            'total_cost' => 2800.00,
            'total_profit' => 1000.00,
            'paid_amount' => 4000.00,
            'change_amount' => 10.00,
            'due_amount' => 0.00,
            'payment_status' => 'paid',
            'sale_status' => 'completed',
        ]);

        SaleItem::create([
            'sale_id' => $sale2->id,
            'product_id' => $productModels[2]->id,
            'product_name' => $productModels[2]->name,
            'product_code' => $productModels[2]->barcode,
            'quantity' => 1,
            'purchase_cost' => 2800.00,
            'unit_price' => 3800.00,
            'subtotal' => 3800.00,
            'tax_amount' => 190.00,
            'total' => 3800.00,
        ]);

        SalePayment::create([
            'sale_id' => $sale2->id,
            'customer_id' => null,
            'user_id' => $cashierUser->id,
            'payment_number' => 'SPAY-2026-0002',
            'payment_date' => now(),
            'payment_method' => 'cash',
            'amount' => 3990.00,
            'note' => 'ক্যাশ কাউন্টার পেমেন্ট',
        ]);

        // 12. Expense Categories & Expenses
        $expCatRent = ExpenseCategory::create(['name' => 'Shop Rent', 'name_bn' => 'দোকান ভাড়া', 'description' => 'মাসিক দোকান ভাড়া']);
        $expCatUtility = ExpenseCategory::create(['name' => 'Electricity & Utilities', 'name_bn' => 'বিদ্যুৎ ও পরিষেবা', 'description' => 'বিদ্যুৎ, পানি ও ইন্টারনেটের বিল']);
        $expCatSalary = ExpenseCategory::create(['name' => 'Staff Salary', 'name_bn' => 'কর্মচারীদের বেতন', 'description' => 'মাসিক স্টাফ বেতন ও বোনাস']);
        $expCatSnacks = ExpenseCategory::create(['name' => 'Refreshment & Snacks', 'name_bn' => 'চা-নাস্তা ও মেহমানদারি', 'description' => 'অফিস চা নাস্তা']);

        Expense::create([
            'expense_category_id' => $expCatUtility->id,
            'user_id' => $adminUser->id,
            'expense_number' => 'EXP-2026-0001',
            'expense_date' => now()->subDays(1)->format('Y-m-d'),
            'title' => 'পিডিবি বিদ্যুৎ বিল পরিশোধ',
            'amount' => 3200.00,
            'payment_method' => 'bkash',
            'reference' => 'PDB-BILL-OCT26',
            'note' => 'গত মাসের বকেয়া বিদ্যুৎ বিল পরিশোধ করা হয়েছে',
        ]);

        Expense::create([
            'expense_category_id' => $expCatSnacks->id,
            'user_id' => $cashierUser->id,
            'expense_number' => 'EXP-2026-0002',
            'expense_date' => now()->format('Y-m-d'),
            'title' => 'গ্রাহক ও কর্মীদের চা-নাস্তা খরচ',
            'amount' => 350.00,
            'payment_method' => 'cash',
            'note' => 'কাউন্টার ক্যাশ থেকে প্রদান',
        ]);

        // 13. System Settings
        $settings = [
            ['key' => 'shop_name', 'value' => 'ইসরাফিল বিডি শপ (ISRAFIL BD SHOP)', 'group' => 'general'],
            ['key' => 'shop_name_en', 'value' => 'ISRAFIL BD SHOP', 'group' => 'general'],
            ['key' => 'shop_phone', 'value' => '+880 1711-234567', 'group' => 'general'],
            ['key' => 'shop_email', 'value' => 'contact@israfilbd.com', 'group' => 'general'],
            ['key' => 'shop_address', 'value' => 'দোকান নং #১২ (দোতলা), সেন্ট্রাল প্লাজা মার্কেট, জিইসি মোড়, চট্টগ্রাম', 'group' => 'general'],
            ['key' => 'currency_symbol', 'value' => '৳', 'group' => 'currency'],
            ['key' => 'currency_code', 'value' => 'BDT', 'group' => 'currency'],
            ['key' => 'tax_rate', 'value' => '5.00', 'group' => 'tax'],
            ['key' => 'default_language', 'value' => 'bn', 'group' => 'system'],
            ['key' => 'default_theme', 'value' => 'light', 'group' => 'system'],
            ['key' => 'invoice_prefix', 'value' => 'INV-', 'group' => 'invoice'],
            ['key' => 'invoice_footer_note', 'value' => 'ইসরাফিল বিডি শপে কেনাকাটার জন্য আন্তরিক ধন্যবাদ! বিক্রিত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমো সহ অক্ষত অবস্থায় পরিবর্তনযোগ্য।', 'group' => 'invoice'],
            ['key' => 'receipt_printer_type', 'value' => 'thermal_80mm', 'group' => 'receipt'],
            ['key' => 'barcode_symbology', 'value' => 'CODE128', 'group' => 'pos'],
            ['key' => 'allow_negative_stock', 'value' => '0', 'group' => 'pos'],
        ];

        foreach ($settings as $s) {
            Setting::create($s);
        }

        // 14. Activity Log
        ActivityLog::create([
            'user_id' => $adminUser->id,
            'action' => 'system_install',
            'description' => 'ইসরাফিল বিডি শপ সিস্টেম সফলভাবে ইনিশিয়ালাইজ ও সেটআপ সম্পন্ন হয়েছে।',
            'ip_address' => '127.0.0.1',
        ]);
    }
}
