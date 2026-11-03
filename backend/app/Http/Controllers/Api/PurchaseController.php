<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CashTransaction;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\PurchasePayment;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $query = Purchase::with(['supplier', 'user', 'items.product']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('purchase_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%");
                  });
        }

        $purchases = $query->latest('id')->paginate($request->integer('per_page', 20));
        return response()->json($purchases);
    }

    public function show($id)
    {
        $purchase = Purchase::with(['supplier', 'user', 'items.product.unit', 'payments'])->findOrFail($id);
        return response()->json($purchase);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $supplier = Supplier::lockForUpdate()->findOrFail($validated['supplier_id']);
            $items = $validated['items'];

            // 1. Calculate totals
            $totalAmount = 0;
            $itemRows = [];

            foreach ($items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $qty = (float) $item['quantity'];
                $unitCost = (float) $item['unit_cost'];
                $subtotal = $qty * $unitCost;
                $totalAmount += $subtotal;

                $itemRows[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'unit_cost' => $unitCost,
                    'subtotal' => $subtotal,
                    'tax_amount' => 0,
                    'discount_amount' => 0,
                    'total' => $subtotal,
                ];
            }

            $discount = (float) ($validated['discount_amount'] ?? 0);
            $tax = (float) ($validated['tax_amount'] ?? 0);
            $shipping = (float) ($validated['shipping_cost'] ?? 0);
            $grandTotal = max(0, ($totalAmount - $discount) + $tax + $shipping);

            $paidAmount = (float) ($validated['paid_amount'] ?? 0);
            $dueAmount = max(0, $grandTotal - $paidAmount);
            $paymentStatus = $paidAmount >= $grandTotal ? 'paid' : ($paidAmount > 0 ? 'partial' : 'due');

            $purchaseNumber = 'PUR-' . date('Ymd') . '-' . uniqid();

            // 2. Create Purchase
            $purchase = Purchase::create([
                'purchase_number' => $purchaseNumber,
                'supplier_id' => $supplier->id,
                'user_id' => auth()->id(),
                'purchase_date' => $validated['purchase_date'],
                'total_amount' => $totalAmount,
                'discount_amount' => $discount,
                'tax_amount' => $tax,
                'shipping_cost' => $shipping,
                'grand_total' => $grandTotal,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'payment_status' => $paymentStatus,
                'purchase_status' => 'received',
                'notes' => $validated['notes'] ?? null,
            ]);

            // 3. Save Items & Update Stock
            foreach ($itemRows as $iRow) {
                $product = $iRow['product'];
                $qty = $iRow['quantity'];
                $unitCost = $iRow['unit_cost'];

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'unit_cost' => $unitCost,
                    'subtotal' => $iRow['subtotal'],
                    'tax_amount' => $iRow['tax_amount'],
                    'discount_amount' => $iRow['discount_amount'],
                    'total' => $iRow['total'],
                ]);

                // Stock update
                $stockBefore = (float) $product->current_stock;
                $stockAfter = $stockBefore + $qty;
                
                // Update purchase price and stock
                $product->update([
                    'current_stock' => $stockAfter,
                    'purchase_price' => $unitCost, // latest purchase cost
                ]);

                StockMovement::create([
                    'product_id' => $product->id,
                    'movement_type' => 'purchase',
                    'reference_type' => Purchase::class,
                    'reference_id' => $purchase->id,
                    'user_id' => auth()->id(),
                    'quantity' => $qty,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'unit_cost' => $unitCost,
                    'reason' => "ক্রয় ইনভয়েস #{$purchaseNumber}",
                ]);
            }

            // 4. Save Payment if paid > 0
            if ($paidAmount > 0) {
                $paymentMethod = $validated['payment_method'] ?? 'cash';
                $payNumber = 'PPAY-' . date('Ymd') . '-' . uniqid();

                PurchasePayment::create([
                    'purchase_id' => $purchase->id,
                    'supplier_id' => $supplier->id,
                    'user_id' => auth()->id(),
                    'payment_number' => $payNumber,
                    'payment_date' => $validated['purchase_date'],
                    'payment_method' => $paymentMethod,
                    'amount' => $paidAmount,
                    'note' => 'ক্রয়ের সময় প্রাথমিক প্রদান',
                ]);

                CashTransaction::create([
                    'transaction_number' => 'CT-' . date('Ymd') . '-' . uniqid(),
                    'user_id' => auth()->id(),
                    'transaction_type' => 'out',
                    'category' => 'purchase',
                    'reference_type' => Purchase::class,
                    'reference_id' => $purchase->id,
                    'amount' => $paidAmount,
                    'balance_after' => 0,
                    'payment_method' => $paymentMethod,
                    'description' => "পণ্য ক্রয়ের পেমেন্ট: চালান #{$purchaseNumber}",
                    'transaction_date' => now(),
                ]);
            }

            // 5. Update Supplier Balance if due > 0
            if ($dueAmount > 0) {
                $supplier->increment('current_balance', $dueAmount);
            }

            ActivityLog::log('purchase', "নতুন ক্রয় সম্পন্ন হয়েছে: চালান #{$purchaseNumber}, মোট: ৳{$grandTotal}", $purchase);

            return response()->json([
                'message' => 'ক্রয় সফলভাবে সম্পন্ন হয়েছে এবং ইনভেন্টরি স্টক বৃদ্ধি করা হয়েছে!',
                'purchase' => $purchase->load(['items.product', 'supplier', 'user']),
            ], 201);
        });
    }
}
