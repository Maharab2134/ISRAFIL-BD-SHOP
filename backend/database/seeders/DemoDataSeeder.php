<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\PurchasePayment;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Run optional sample/demo retail records for development preview.
     * To run: php artisan db:seed --class=DemoDataSeeder
     */
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@israfilbd.com')->first();
        $cashierUser = User::where('email', 'cashier@israfilbd.com')->first();

        // Sample Brands
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
            $brandModels[$b['slug']] = Brand::firstOrCreate(['slug' => $b['slug']], $b);
        }

        // Sample Categories
        $categories = [
            ['name' => 'Electronics & Gadgets', 'name_bn' => 'ইলেকট্রনিক্স ও গ্যাজেট', 'slug' => 'electronics', 'code' => 'CAT-ELEC'],
            ['name' => 'Mobile Accessories', 'name_bn' => 'মোবাইল এক্সেসরিজ', 'slug' => 'mobile-acc', 'code' => 'CAT-MOB'],
            ['name' => 'Grocery & Daily Needs', 'name_bn' => 'মুদি ও নিত্যপ্রয়োজনীয় পণ্য', 'slug' => 'groceries', 'code' => 'CAT-GROC'],
            ['name' => 'Fashion & Apparel', 'name_bn' => 'পোশাক ও ফ্যাশন', 'slug' => 'fashion', 'code' => 'CAT-FASH'],
            ['name' => 'Cosmetics & Personal Care', 'name_bn' => 'প্রসাধনী ও স্কিন কেয়ার', 'slug' => 'cosmetics', 'code' => 'CAT-COSM'],
        ];
        $catModels = [];
        foreach ($categories as $c) {
            $catModels[$c['slug']] = Category::firstOrCreate(['slug' => $c['slug']], $c);
        }

        $pcs = Unit::where('code', 'pcs')->first();
        $pkt = Unit::where('code', 'pkt')->first() ?? $pcs;

        // Sample Products
        $productsData = [
            [
                'name' => 'Wireless Bluetooth Earbuds Pro',
                'name_bn' => 'ওয়্যারলেস ব্লুটুথ ইয়ারবাডস প্রো',
                'barcode' => '894110001001',
                'sku' => 'EAR-PRO-01',
                'category_id' => $catModels['mobile-acc']->id,
                'brand_id' => $brandModels['xiaomi']->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 1250.00,
                'selling_price' => 1850.00,
                'current_stock' => 45,
                'alert_stock' => 10,
                'tax_percent' => 5.00,
            ],
            [
                'name' => 'Fast Charging Power Bank 20000mAh',
                'name_bn' => 'ফাস্ট চার্জিং পাওয়ার ব্যাংক ২০০০০ mAh',
                'barcode' => '894110001002',
                'sku' => 'PWR-20K-02',
                'category_id' => $catModels['mobile-acc']->id,
                'brand_id' => $brandModels['xiaomi']->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 1600.00,
                'selling_price' => 2200.00,
                'current_stock' => 30,
                'alert_stock' => 8,
                'tax_percent' => 5.00,
            ],
            [
                'name' => 'Smart Watch Fitness Tracker',
                'name_bn' => 'স্মার্ট ওয়াচ ফিটনেস ট্র্যাকার',
                'barcode' => '894110001003',
                'sku' => 'SMT-WTC-03',
                'category_id' => $catModels['electronics']->id,
                'brand_id' => $brandModels['samsung']->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 2800.00,
                'selling_price' => 3800.00,
                'current_stock' => 18,
                'alert_stock' => 5,
                'tax_percent' => 5.00,
            ],
            [
                'name' => 'Pran Premium Chinigura Rice 1kg',
                'name_bn' => 'প্রাণ প্রিমিয়াম চিনিগুঁড়া চাল ১ কেজি',
                'barcode' => '894110001004',
                'sku' => 'RICE-CHINI-1KG',
                'category_id' => $catModels['groceries']->id,
                'brand_id' => $brandModels['pran']->id,
                'unit_id' => $pkt->id,
                'purchase_price' => 135.00,
                'selling_price' => 165.00,
                'current_stock' => 120,
                'alert_stock' => 20,
                'tax_percent' => 0.00,
            ],
            [
                'name' => 'Square Radhuni Pure Mustard Oil 500ml',
                'name_bn' => 'রাধুনী খাঁটি সরিষার তেল ৫০০ মিলি',
                'barcode' => '894110001005',
                'sku' => 'RAD-OIL-500ML',
                'category_id' => $catModels['groceries']->id,
                'brand_id' => $brandModels['square']->id,
                'unit_id' => $pcs->id,
                'purchase_price' => 140.00,
                'selling_price' => 170.00,
                'current_stock' => 60,
                'alert_stock' => 15,
                'tax_percent' => 0.00,
            ],
        ];

        foreach ($productsData as $pData) {
            $p = Product::firstOrCreate(['barcode' => $pData['barcode']], $pData);
            if ($p->current_stock > 0) {
                StockMovement::firstOrCreate(
                    ['product_id' => $p->id, 'movement_type' => 'initial'],
                    [
                        'user_id' => $adminUser?->id,
                        'quantity' => $p->current_stock,
                        'stock_before' => 0,
                        'stock_after' => $p->current_stock,
                        'unit_cost' => $p->purchase_price,
                        'reason' => 'প্রাথমিক উদ্বোধনী স্টক',
                    ]
                );
            }
        }

        // Sample Customers
        $customers = [
            [
                'name' => 'রফিকুল ইসলাম (Rafiqul Islam)',
                'phone' => '01819123456',
                'email' => 'rafiq@gmail.com',
                'address' => 'রোড #৪, নাসিরাবাদ, চট্টগ্রাম',
                'opening_balance' => 0,
                'current_balance' => 1250.00,
                'credit_limit' => 10000.00,
            ],
            [
                'name' => 'তানভীর চৌধুরী (Tanvir Chowdhury)',
                'phone' => '01712987654',
                'email' => 'tanvir@yahoo.com',
                'address' => 'ওআর নিজাম রোড, চট্টগ্রাম',
                'opening_balance' => 0,
                'current_balance' => 0.00,
                'credit_limit' => 20000.00,
            ],
        ];
        foreach ($customers as $c) {
            Customer::firstOrCreate(['phone' => $c['phone']], $c);
        }

        // Sample Suppliers
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
                'address' => 'বাড্ডা, ঢাকা',
                'current_balance' => 8500.00,
            ],
        ];
        foreach ($suppliers as $s) {
            Supplier::firstOrCreate(['phone' => $s['phone']], $s);
        }
    }
}

