<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique()->index();
            $table->string('return_type')->index(); // sale_return, purchase_return
            $table->unsignedBigInteger('reference_id'); // sale_id or purchase_id
            $table->unsignedBigInteger('party_id')->nullable(); // customer_id or supplier_id
            $table->foreignId('user_id')->constrained('users');
            $table->date('return_date')->index();
            $table->decimal('total_amount', 12, 2);
            $table->decimal('refund_amount', 12, 2)->default(0);
            $table->string('payment_method')->default('cash');
            $table->text('reason')->nullable();
            $table->string('status')->default('completed'); // pending, completed, rejected
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('customer_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique()->index();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->date('payment_date')->index();
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->default('cash'); // cash, bkash, nagad, bank, cheque
            $table->string('reference')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('supplier_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique()->index();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->date('payment_date')->index();
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->default('cash'); // cash, bank, bkash, nagad, cheque
            $table->string('reference')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique()->index();
            $table->foreignId('user_id')->constrained('users');
            $table->string('transaction_type')->index(); // in, out
            $table->string('category')->index(); // sales, purchase, customer_due, supplier_payment, expense, adjustment, etc.
            $table->nullableMorphs('reference');
            $table->decimal('amount', 12, 2);
            $table->decimal('balance_after', 12, 2)->default(0);
            $table->string('payment_method')->default('cash');
            $table->string('description');
            $table->timestamp('transaction_date')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
        Schema::dropIfExists('supplier_payments');
        Schema::dropIfExists('customer_payments');
        Schema::dropIfExists('returns');
    }
};

