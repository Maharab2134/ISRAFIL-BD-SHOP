<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    protected GoogleDriveService $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'unit']);

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

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->boolean('low_stock')) {
            $query->whereRaw('current_stock <= alert_stock');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->integer('per_page', 20);
        $products = $query->orderBy('name', 'asc')->paginate($perPage);

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'brand', 'unit', 'images', 'stockMovements' => function ($q) {
            $q->latest('id')->limit(20);
        }])->findOrFail($id);

        return response()->json($product);
    }

    public function findByBarcode($barcode)
    {
        $product = Product::with(['unit', 'category', 'brand'])
            ->where('barcode', $barcode)
            ->orWhere('sku', $barcode)
            ->first();

        if (!$product) {
            return response()->json([
                'message' => "বারকোড '{$barcode}' যুক্ত কোনো পণ্য খুঁজে পাওয়া যায়নি।"
            ], 404);
        }

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'barcode' => 'required|string|max:100|unique:products,barcode',
            'sku' => 'required|string|max:100|unique:products,sku',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'unit_id' => 'required|exists:units,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'current_stock' => 'nullable|numeric|min:0',
            'alert_stock' => 'nullable|numeric|min:0',
            'tax_percent' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:fixed,percentage',
            'discount_value' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
        ]);

        $imageUrl = null;
        $driveFileId = null;

        if ($request->hasFile('image')) {
            $upload = $this->driveService->uploadImage($request->file('image'), 'products');
            $imageUrl = $upload['url'];
            $driveFileId = $upload['file_id'];
        }

        $validated['image_url'] = $imageUrl;
        $validated['drive_file_id'] = $driveFileId;
        $validated['current_stock'] = $validated['current_stock'] ?? 0;
        $validated['alert_stock'] = $validated['alert_stock'] ?? 5;

        $product = Product::create($validated);

        if ($product->current_stock > 0) {
            StockMovement::create([
                'product_id' => $product->id,
                'movement_type' => 'initial',
                'user_id' => auth()->id(),
                'quantity' => $product->current_stock,
                'stock_before' => 0,
                'stock_after' => $product->current_stock,
                'unit_cost' => $product->purchase_price,
                'reason' => 'পণ্য তৈরির সময় প্রাথমিক স্টক',
            ]);
        }

        ActivityLog::log('create', "নতুন পণ্য '{$product->name}' তৈরি করা হয়েছে।", $product);

        return response()->json([
            'message' => 'পণ্যটি সফলভাবে যুক্ত করা হয়েছে।',
            'product' => $product->load(['category', 'brand', 'unit']),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if ($request->input('brand_id') === '' || $request->input('brand_id') === 'null') {
            $request->merge(['brand_id' => null]);
        }
        if ($request->input('wholesale_price') === '' || $request->input('wholesale_price') === 'null') {
            $request->merge(['wholesale_price' => null]);
        }
        if ($request->input('description') === '' || $request->input('description') === 'null') {
            $request->merge(['description' => null]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'barcode' => 'required|string|max:100|unique:products,barcode,' . $product->id,
            'sku' => 'required|string|max:100|unique:products,sku,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'unit_id' => 'required|exists:units,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'alert_stock' => 'nullable|numeric|min:0',
            'tax_percent' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:fixed,percentage',
            'discount_value' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $upload = $this->driveService->uploadImage($request->file('image'), 'products');
            $this->driveService->deleteImage($product->drive_file_id, $product->image_url);
            $validated['image_url'] = $upload['url'];
            $validated['drive_file_id'] = $upload['file_id'];
        }

        $oldValues = $product->toArray();
        $product->update($validated);

        ActivityLog::log('update', "পণ্য '{$product->name}' এর তথ্য আপডেট করা হয়েছে।", $product, $oldValues, $product->toArray());

        return response()->json([
            'message' => 'পণ্যের তথ্য সফলভাবে আপডেট করা হয়েছে।',
            'product' => $product->load(['category', 'brand', 'unit']),
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $name = $product->name;
        $product->delete();

        ActivityLog::log('delete', "পণ্য '{$name}' মুছে ফেলা হয়েছে।", $product);

        return response()->json([
            'message' => "পণ্য '{$name}' সফলভাবে মুছে ফেলা হয়েছে।"
        ]);
    }
}

