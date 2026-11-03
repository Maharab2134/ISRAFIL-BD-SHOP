<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use App\Models\ShopReturn;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['user', 'customer', 'payments']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('sale_date', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('sale_status')) {
            $query->where('sale_status', $request->sale_status);
        }

        $sales = $query->latest('id')->paginate($request->integer('per_page', 20));

        return response()->json($sales);
    }

    public function show($id)
    {
        $sale = Sale::with(['user', 'customer', 'items.product.unit', 'payments'])->findOrFail($id);
        $shopSettings = Setting::pluck('value', 'key')->toArray();

        return response()->json([
            'sale' => $sale,
            'shop_settings' => $shopSettings,
        ]);
    }

    public function returnSale(Request $request, $id)
    {
        $sale = Sale::with('items.product')->findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string',
            'refund_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
        ]);

        return DB::transaction(function () use ($sale, $validated) {
            $returnNumber = 'RET-' . date('Ymd') . '-' . uniqid();

            // Return items back to stock
            foreach ($sale->items as $item) {
                $product = $item->product;
                if ($product) {
                    $stockBefore = $product->current_stock;
                    $stockAfter = $stockBefore + $item->quantity;
                    $product->update(['current_stock' => $stockAfter]);

                    StockMovement::create([
                        'product_id' => $product->id,
                        'movement_type' => 'sale_return',
                        'reference_type' => Sale::class,
                        'reference_id' => $sale->id,
                        'user_id' => auth()->id(),
                        'quantity' => $item->quantity,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'unit_cost' => $item->purchase_cost,
                        'reason' => "বিক্রয় ফেরত: চালান #{$sale->invoice_number}",
                    ]);
                }
            }

            // Create return record
            $shopReturn = ShopReturn::create([
                'return_number' => $returnNumber,
                'return_type' => 'sale_return',
                'reference_id' => $sale->id,
                'party_id' => $sale->customer_id,
                'user_id' => auth()->id(),
                'return_date' => now()->toDateString(),
                'total_amount' => $sale->grand_total,
                'refund_amount' => $validated['refund_amount'],
                'payment_method' => $validated['payment_method'],
                'reason' => $validated['reason'],
                'status' => 'completed',
            ]);

            $sale->update(['sale_status' => 'refunded']);

            ActivityLog::log('sale_return', "বিক্রয় ফেরত গৃহীত হয়েছে: চালান #{$sale->invoice_number}", $sale);

            return response()->json([
                'message' => 'বিক্রয় ফেরত সফলভাবে প্রক্রিয়া করা হয়েছে এবং পণ্য স্টকে ফেরত যোগ হয়েছে।',
                'return' => $shopReturn,
            ]);
        });
    }

    public function returnsList()
    {
        $returns = ShopReturn::with('user')->where('return_type', 'sale_return')->latest('id')->paginate(20);
        return response()->json($returns);
    }
}

