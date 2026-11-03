<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique()->index();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_name')->default('Walk-in Customer');
            $table->string('customer_phone')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamp('sale_date')->index();
            $table->integer('total_items')->default(1);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('product_discount_total', 12, 2)->default(0);
            $table->string('order_discount_type')->nullable(); // fixed / percentage
            $table->decimal('order_discount_rate', 12, 2)->default(0);
            $table->decimal('order_discount_amount', 12, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->decimal('total_cost', 12, 2)->default(0); // COGS Snapshot
            $table->decimal('total_profit', 12, 2)->default(0); // Profit Snapshot
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('change_amount', 12, 2)->default(0);
            $table->decimal('due_amount', 12, 2)->default(0);
            $table->string('payment_status')->default('paid')->index(); // paid, partial, due
            $table->string('sale_status')->default('completed')->index(); // completed, returned, partially_returned, void
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->string('product_name');
            $table->string('product_code');
            $table->decimal('quantity', 12, 2);
            $table->decimal('purchase_cost', 12, 2)->default(0); // Cost Snapshot
            $table->decimal('unit_price', 12, 2); // Selling price snapshot
            $table->string('discount_type')->nullable();
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->timestamps();
        });

        Schema::create('sale_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->string('payment_number')->unique();
            $table->timestamp('payment_date')->index();
            $table->string('payment_method')->default('cash'); // cash, bkash, nagad, card, bank
            $table->decimal('amount', 12, 2);
            $table->string('transaction_reference')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_payments');
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
    }
};

