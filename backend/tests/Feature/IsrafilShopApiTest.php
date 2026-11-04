<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class IsrafilShopApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_login_and_authentication()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@israfilbd.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['access_token', 'user' => ['id', 'name', 'email', 'role']]);

        $token = $response->json('access_token');

        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('user.email', 'admin@israfilbd.com');
    }

    public function test_dashboard_metrics_accessible()
    {
        $user = User::where('email', 'admin@israfilbd.com')->first();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'kpis' => ['today_sales', 'today_orders', 'total_products', 'low_stock_count'],
                'charts' => ['daily_trends', 'payment_breakdown'],
                'recent_sales',
                'best_selling',
            ]);
    }

    public function test_barcode_lookup()
    {
        $user = User::where('email', 'cashier@israfilbd.com')->first();

        $unit = \App\Models\Unit::first() ?? \App\Models\Unit::create(['name' => 'Piece', 'name_bn' => 'পিস', 'code' => 'pcs']);
        $cat = \App\Models\Category::first() ?? \App\Models\Category::create(['name' => 'General', 'name_bn' => 'সাধারণ', 'slug' => 'general']);
        Product::firstOrCreate(
            ['barcode' => '894110001001'],
            [
                'name' => 'Test Product',
                'sku' => 'TEST-001',
                'category_id' => $cat->id,
                'unit_id' => $unit->id,
                'purchase_price' => 100,
                'selling_price' => 150,
                'current_stock' => 50,
                'alert_stock' => 5,
            ]
        );

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/products/barcode/894110001001');

        $response->assertStatus(200)
            ->assertJsonPath('barcode', '894110001001')
            ->assertJsonStructure(['id', 'name', 'selling_price', 'current_stock']);
    }

    public function test_pos_checkout_flow()
    {
        $user = User::where('email', 'cashier@israfilbd.com')->first();

        $unit = \App\Models\Unit::first() ?? \App\Models\Unit::create(['name' => 'Piece', 'name_bn' => 'পিস', 'code' => 'pcs']);
        $cat = \App\Models\Category::first() ?? \App\Models\Category::create(['name' => 'General', 'name_bn' => 'সাধারণ', 'slug' => 'general']);
        $product = Product::firstOrCreate(
            ['barcode' => '894110001001'],
            [
                'name' => 'Test Product',
                'sku' => 'TEST-001',
                'category_id' => $cat->id,
                'unit_id' => $unit->id,
                'purchase_price' => 100,
                'selling_price' => 150,
                'current_stock' => 50,
                'alert_stock' => 5,
            ]
        );
        $stockBefore = (float) $product->current_stock;

        $payload = [
            'customer_name' => 'টেস্ট কাস্টমার (Test Customer)',
            'customer_phone' => '01899999999',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'unit_price' => (float) $product->selling_price,
                    'discount_amount' => 50,
                ]
            ],
            'discount_type' => 'fixed',
            'discount_amount' => 0,
            'paid_amount' => ($product->selling_price * 2) - 50,
            'payment_method' => 'cash',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/pos/checkout', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['sale' => ['id', 'invoice_number', 'grand_total', 'items']]);

        // Verify stock was deducted by exactly 2
        $product->refresh();
        $this->assertEquals($stockBefore - 2, (float) $product->current_stock);
    }

    public function test_product_auto_discount_in_pos_checkout()
    {
        $user = User::where('email', 'cashier@israfilbd.com')->first();
        $unit = \App\Models\Unit::first() ?? \App\Models\Unit::create(['name' => 'Piece', 'name_bn' => 'পিস', 'code' => 'pcs']);
        $cat = \App\Models\Category::first() ?? \App\Models\Category::create(['name' => 'General', 'name_bn' => 'সাধারণ', 'slug' => 'general']);

        $discountedProduct = Product::create([
            'name' => 'Auto Discount Product',
            'barcode' => '894999999001',
            'sku' => 'DISC-001',
            'category_id' => $cat->id,
            'unit_id' => $unit->id,
            'purchase_price' => 200,
            'selling_price' => 500,
            'current_stock' => 10,
            'alert_stock' => 2,
            'discount_type' => 'percentage',
            'discount_value' => 20, // 20% of 500 = 100 discount per unit
        ]);

        $payload = [
            'customer_name' => 'Discount Buyer',
            'items' => [
                [
                    'product_id' => $discountedProduct->id,
                    'quantity' => 1,
                ]
            ],
            'paid_amount' => 400,
            'payment_method' => 'cash',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/pos/checkout', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('sale.product_discount_total', '100.00')
            ->assertJsonPath('sale.grand_total', '400.00');

        $discountedProduct->delete();
    }

    public function test_inventory_overview()
    {
        $user = User::where('email', 'admin@israfilbd.com')->first();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/inventory/overview');

        $response->assertStatus(200)
            ->assertJsonStructure(['total_items', 'total_quantity', 'stock_cost_value', 'stock_sale_value']);
    }

    public function test_daily_financial_report()
    {
        $user = User::where('email', 'admin@israfilbd.com')->first();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/reports/daily');

        $response->assertStatus(200)
            ->assertJsonStructure(['gross_sales', 'net_sales', 'total_cogs', 'gross_profit', 'net_profit']);
    }

    public function test_customer_due_and_ledger()
    {
        $user = User::where('email', 'admin@israfilbd.com')->first();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/customers');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page']);
    }

    public function test_accounting_cash_flow()
    {
        $user = User::where('email', 'admin@israfilbd.com')->first();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/accounting/cash-flow');

        $response->assertStatus(200)
            ->assertJsonStructure(['transactions', 'summary' => ['total_in', 'total_out', 'net_cash']]);
    }

    public function test_settings_retrieval_and_update()
    {
        $user = User::where('email', 'admin@israfilbd.com')->first();

        $getResponse = $this->actingAs($user, 'sanctum')
            ->getJson('/api/settings');

        $getResponse->assertStatus(200)
            ->assertJsonStructure(['settings', 'grouped']);

        $postResponse = $this->actingAs($user, 'sanctum')
            ->postJson('/api/settings', [
                'settings' => [
                    'shop_name' => 'ISRAFIL BD SHOP – TEST',
                    'shop_phone' => '+8801700000000',
                ]
            ]);

        $postResponse->assertStatus(200)
            ->assertJsonPath('settings.shop_name', 'ISRAFIL BD SHOP – TEST');
    }

    public function test_employee_and_activity_logs()
    {
        $user = User::where('email', 'admin@israfilbd.com')->first();

        $empResponse = $this->actingAs($user, 'sanctum')
            ->getJson('/api/employees');

        $empResponse->assertStatus(200)
            ->assertJsonStructure(['data', 'total']);

        $logResponse = $this->actingAs($user, 'sanctum')
            ->getJson('/api/activity-logs');

        $logResponse->assertStatus(200)
            ->assertJsonStructure(['data', 'total']);
    }

    public function test_product_creation_and_update_with_image_url()
    {
        $user = User::where('email', 'admin@israfilbd.com')->first();
        $unit = \App\Models\Unit::first() ?? \App\Models\Unit::create(['name' => 'Piece', 'name_bn' => 'পিস', 'code' => 'pcs']);
        $cat = \App\Models\Category::first() ?? \App\Models\Category::create(['name' => 'General', 'name_bn' => 'সাধারণ', 'slug' => 'general']);

        $createResponse = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', [
                'name' => 'Image URL Test Product',
                'name_bn' => 'ইমেজ টেস্ট পণ্য',
                'barcode' => '894999999001',
                'sku' => 'TEST-IMG-001',
                'category_id' => $cat->id,
                'unit_id' => $unit->id,
                'purchase_price' => 120,
                'selling_price' => 180,
                'current_stock' => 10,
                'alert_stock' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('product.image_url', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e');

        $productId = $createResponse->json('product.id');

        $updateResponse = $this->actingAs($user, 'sanctum')
            ->putJson("/api/products/{$productId}", [
                'name' => 'Image URL Test Product Updated',
                'barcode' => '894999999001',
                'sku' => 'TEST-IMG-001',
                'category_id' => $cat->id,
                'unit_id' => $unit->id,
                'purchase_price' => 120,
                'selling_price' => 180,
                'alert_stock' => 2,
                'status' => 'active',
                'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
            ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('product.image_url', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30');
    }

    public function test_json_bulk_imports()
    {
        $user = User::where('email', 'admin@israfilbd.com')->first();

        // 1. Categories JSON import with user's schema (name_en, slug, is_active, etc.)
        $catPayload = [
            'categories' => [
                ['id' => 101, 'name_en' => 'Imported Electronics', 'name_bn' => 'ইমপোর্টেড ইলেকট্রনিক্স', 'slug' => 'imported-electronics', 'is_active' => true],
                ['id' => 102, 'name_en' => 'Imported Snacks', 'name_bn' => 'ইমপোর্টেড স্ন্যাক্স', 'slug' => 'imported-snacks', 'is_active' => true],
            ]
        ];
        $catRes = $this->actingAs($user, 'sanctum')->postJson('/api/categories/import-json', $catPayload);
        $catRes->assertStatus(200)->assertJsonPath('inserted', 2);

        // 2. Brands JSON import
        $brandPayload = [
            'brands' => [
                ['id' => 951, 'name_en' => 'Apex Import Unique', 'name_bn' => 'এপেক্স ইমপোর্ট ইউনিক', 'is_active' => true],
                ['id' => 952, 'name_en' => 'Samsung Import Unique', 'name_bn' => 'স্যামসাং ইমপোর্ট ইউনিক', 'is_active' => true],
            ]
        ];
        $brandRes = $this->actingAs($user, 'sanctum')->postJson('/api/brands/import-json', $brandPayload);
        $brandRes->assertStatus(200)->assertJsonPath('inserted', 2);

        // 3. Products JSON import (user's exact schema: envelope { store, products }, name_en, purchase_cost, selling_price, discount object, unit string, brand string, etc.)
        $prodPayload = [
            'store' => ['currency' => 'BDT'],
            'products' => [
                [
                    'id' => 1001,
                    'name_en' => 'Miniket Rice 5kg Spec',
                    'name_bn' => 'মিনিকেট চাল ৫ কেজি টেস্ট',
                    'barcode' => '8941100001001',
                    'sku' => 'POS-01-001',
                    'category_id' => 101,
                    'brand' => 'Fresh Spec',
                    'unit' => 'bag',
                    'purchase_cost' => 420,
                    'selling_price' => 465,
                    'discount' => [
                        'type' => 'none',
                        'value' => 0
                    ],
                    'stock_quantity' => 35,
                    'alert_level' => 8,
                    'image_url' => 'https://drive.google.com/file/d/1uTZCWKh6PftTikrXZOde-l4spvCPWBEM/view?usp=drive_link',
                    'description' => 'Premium miniket rice, 5 kg pack.',
                    'is_active' => true,
                ],
            ]
        ];
        $prodRes = $this->actingAs($user, 'sanctum')->postJson('/api/products/import-json', $prodPayload);
        $prodRes->assertStatus(200)->assertJsonPath('inserted', 1);

        // Verify product in database
        $product = Product::where('barcode', '8941100001001')->first();
        $this->assertNotNull($product);
        $this->assertEquals('Miniket Rice 5kg Spec', $product->name);
        $this->assertEquals(420, (float) $product->purchase_price);
        $this->assertEquals(465, (float) $product->selling_price);
        $this->assertEquals(35, (float) $product->current_stock);
        $this->assertEquals(8, (float) $product->alert_stock);
        $this->assertEquals('active', $product->status);
        $this->assertEquals('https://lh3.googleusercontent.com/d/1uTZCWKh6PftTikrXZOde-l4spvCPWBEM', $product->image_url);
    }
}
