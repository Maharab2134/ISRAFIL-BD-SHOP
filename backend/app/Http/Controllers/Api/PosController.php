<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Services\PosService;
use Exception;
use Illuminate\Http\Request;

class PosController extends Controller
{
    protected PosService $posService;

    public function __construct(PosService $posService)
    {
        $this->posService = $posService;
    }

    /**
     * Get initial state for POS terminal: categories, customers, and active products.
     */
    public function getPosData(Request $request)
    {
        $categories = Category::where('status', 'active')->orderBy('name')->get();
        // Limit initial preloaded customers to the 200 most recent active customers for fast load time.
        // POS terminal performs live remote search when typing customer phone/name outside this pool.
        $customers = Customer::where('status', 'active')->latest('id')->limit(200)->get();

        $query = Product::with(['unit', 'category', 'brand'])
            ->where('status', 'active');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('name_bn', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->orderBy('name')->get();

        $user = $request->user();
        $canViewCost = $user && ($user->role?->slug === 'super-admin' || $user->hasPermission('products.view_cost'));
        if (! $canViewCost) {
            $products->each(function ($p) {
                $p->purchase_price = null;
            });
        }

        return response()->json([
            'categories' => $categories,
            'customers' => $customers,
            'products' => $products,
            'shop_settings' => \App\Models\Setting::pluck('value', 'key')->toArray(),
        ]);
    }

    /**
     * Complete checkout and generate invoice
     */
    public function checkout(Request $request)
    {
        // Rule 2: Ensure customer_phone does not exceed 11 digits
        if ($request->filled('customer_phone')) {
            $rawPhone = preg_replace('/[^0-9]/', '', (string) $request->input('customer_phone'));
            if (str_starts_with($rawPhone, '8801') && strlen($rawPhone) === 13) {
                $cleanPhone = substr($rawPhone, 2);
            } else {
                $cleanPhone = $rawPhone;
            }
            if (strlen($cleanPhone) > 11) {
                $cleanPhone = substr($cleanPhone, 0, 11);
            }
            $request->merge(['customer_phone' => $cleanPhone]);
        }

        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:11',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:fixed,percentage',
            'discount_rate' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'redeem_points' => 'nullable|integer|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:cash,bkash,nagad,card,bank,split',
            'payments' => 'nullable|array',
            'transaction_reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $sale = $this->posService->processCheckout($validated, auth()->id());

            ActivityLog::log('pos_sale', "নতুন পিওএস বিক্রয় সম্পন্ন হয়েছে: চালান #{$sale->invoice_number}, মোট: ৳{$sale->grand_total}", $sale);

            return response()->json([
                'message' => 'বিক্রয় সফলভাবে সম্পন্ন হয়েছে!',
                'sale' => $sale,
                'shop_settings' => \App\Models\Setting::pluck('value', 'key')->toArray(),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }
}

