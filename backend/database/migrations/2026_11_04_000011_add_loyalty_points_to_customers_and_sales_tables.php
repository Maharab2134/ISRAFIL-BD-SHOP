<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'loyalty_points')) {
                $table->unsignedInteger('loyalty_points')->default(0)->after('credit_limit');
            }
        });

        Schema::table('sales', function (Blueprint $table) {
            if (!Schema::hasColumn('sales', 'points_earned')) {
                $table->unsignedInteger('points_earned')->default(0)->after('grand_total');
            }
            if (!Schema::hasColumn('sales', 'points_redeemed')) {
                $table->unsignedInteger('points_redeemed')->default(0)->after('points_earned');
            }
            if (!Schema::hasColumn('sales', 'points_discount_amount')) {
                $table->decimal('points_discount_amount', 12, 2)->default(0)->after('points_redeemed');
            }
            if (!Schema::hasColumn('sales', 'customer_points_balance')) {
                $table->unsignedInteger('customer_points_balance')->default(0)->after('points_discount_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (Schema::hasColumn('customers', 'loyalty_points')) {
                $table->dropColumn('loyalty_points');
            }
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn([
                'points_earned',
                'points_redeemed',
                'points_discount_amount',
                'customer_points_balance',
            ]);
        });
    }
};

