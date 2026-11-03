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

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/products/barcode/894110001001');

        $response->assertStatus(200)
            ->assertJsonPath('barcode', '894110001001')
            ->assertJsonStructure(['id', 'name', 'selling_price', 'current_stock']);
    }

    public function test_pos_checkout_flow()
    {
        $user = User::where('email', 'cashier@israfilbd.com')->first();
        $product = Product::where('barcode', '894110001001')->first();
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
}
