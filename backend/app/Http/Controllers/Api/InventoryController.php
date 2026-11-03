<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function overview()
    {
        $totalItems = Product::where('status', 'active')->count();
        $totalStockQty = (float) Product::where('status', 'active')->sum('current_stock');
        $stockCostValue = (float) Product::where('status', 'active')->sum(DB::raw('current_stock * purchase_price'));
        $stockSaleValue = (float) Product::where('status', 'active')->sum(DB::raw('current_stock * selling_price'));
        $lowStockCount = Product::where('status', 'active')->whereRaw('current_stock <= alert_stock AND current_stock > 0')->count();
        $outOfStockCount = Product::where('status', 'active')->where('current_stock', '<=', 0)->count();

        return response()->json([
            'total_items' => $totalItems,
            'total_quantity' => $totalStockQty,
            'stock_cost_value' => $stockCostValue,
            'stock_sale_value' => $stockSaleValue,
            'potential_profit' => max(0, $stockSaleValue - $stockCostValue),
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
        ]);
    }

    public function adjustStock(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:255',
        ]);

        return DB::transaction(function () use ($validated) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
            $qty = (float) $validated['quantity'];
            $stockBefore = (float) $product->current_stock;

            if ($validated['type'] === 'in') {
                $stockAfter = $stockBefore + $qty;
                $movementType = 'adjustment_in';
                $movementQty = $qty;
            } elseif ($validated['type'] === 'out') {
                if ($stockBefore < $qty) {
                    return response()->json(['message' => 'বর্তমান স্টকের চেয়ে বেশি পরিমাণ বের করা সম্ভব নয়।'], 422);
                }
                $stockAfter = $stockBefore - $qty;
                $movementType = 'adjustment_out';
                $movementQty = -$qty;
            } else { // Direct set adjustment
                $stockAfter = $qty;
                $movementQty = $stockAfter - $stockBefore;
                $movementType = $movementQty >= 0 ? 'adjustment_in' : 'adjustment_out';
            }

            $product->update(['current_stock' => $stockAfter]);

            StockMovement::create([
                'product_id' => $product->id,
                'movement_type' => $movementType,
                'user_id' => auth()->id(),
                'quantity' => $movementQty,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'unit_cost' => $product->purchase_price,
                'reason' => $validated['reason'],
            ]);

            ActivityLog::log('adjust_stock', "পণ্য '{$product->name}' এর স্টক সমন্বয়: {$stockBefore} -> {$stockAfter} ({$validated['reason']})", $product);

            return response()->json([
                'message' => 'স্টক সমন্বয় সফলভাবে সম্পন্ন হয়েছে।',
                'product' => $product->fresh(['unit', 'category']),
            ]);
        });
    }

    public function history(Request $request)
    {
        $query = StockMovement::with(['product.unit', 'user']);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('movement_type')) {
            $query->where('movement_type', $request->movement_type);
        }

        $movements = $query->latest('id')->paginate($request->integer('per_page', 25));

        return response()->json($movements);
    }
}

