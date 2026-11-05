<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('products', 'measurement_value')) {
            Schema::table('products', function (Blueprint $table) {
                $table->string('measurement_value', 50)->nullable()->after('unit_id');
            });
        }

        // Update missing Bengali unit names
        DB::table('units')->where('code', 'g')->whereNull('name_bn')->update(['name_bn' => 'গ্রাম']);
        DB::table('units')->where('code', 'ml')->whereNull('name_bn')->update(['name_bn' => 'মিলি.লি.']);
        DB::table('units')->where('code', 'l')->whereNull('name_bn')->update(['name_bn' => 'লিটার']);
        DB::table('units')->where('code', 'bags')->whereNull('name_bn')->update(['name_bn' => 'ব্যাগ']);

        // Backfill measurement_value for all existing products from their names
        $products = DB::table('products')->select('id', 'name')->get();
        foreach ($products as $p) {
            if (preg_match('/(\d+(?:\.\d+)?)\s*(?:g|gm|gram|kg|kilogram|l|ltr|liter|litre|ml|pcs|pkt|packet|box|dzn|bags|bag)\b/i', $p->name, $matches)) {
                DB::table('products')->where('id', $p->id)->update([
                    'measurement_value' => $matches[1]
                ]);
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'measurement_value')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('measurement_value');
            });
        }
    }
};

