<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ImageHelper;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Unit;
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

        if ($request->boolean('all') || $request->per_page === 'all') {
            $products = $query->orderBy('name', 'asc')->get();
            return response()->json([
                'data' => $products,
                'total' => $products->count(),
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $products->count(),
            ]);
        }

        $perPage = min(1000, max(5, $request->integer('per_page', 50)));
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
            'current_stock' => 'nullable|numeric|min:0',
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
            'image_url' => 'nullable|string|max:2048',
        ]);

        $imageUrl = ImageHelper::normalize($request->input('image_url'));
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
        $validated['tax_percent'] = isset($validated['tax_percent']) && $validated['tax_percent'] !== '' ? (float) $validated['tax_percent'] : 0.00;

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
            'current_stock' => 'nullable|numeric|min:0',
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
            'image_url' => 'nullable|string|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $upload = $this->driveService->uploadImage($request->file('image'), 'products');
            $this->driveService->deleteImage($product->drive_file_id, $product->image_url);
            $validated['image_url'] = $upload['url'];
            $validated['drive_file_id'] = $upload['file_id'];
        } elseif ($request->has('image_url')) {
            $validated['image_url'] = ImageHelper::normalize($request->input('image_url'));
        }

        if ($request->has('tax_percent')) {
            $validated['tax_percent'] = isset($validated['tax_percent']) && $validated['tax_percent'] !== '' ? (float) $validated['tax_percent'] : 0.00;
        }

        $oldValues = $product->toArray();

        if (isset($validated['current_stock']) && (float) $validated['current_stock'] !== (float) $product->current_stock) {
            $diff = (float) $validated['current_stock'] - (float) $product->current_stock;
            \App\Models\StockMovement::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'type' => 'adjustment',
                'quantity' => abs($diff),
                'stock_before' => $product->current_stock,
                'stock_after' => (float) $validated['current_stock'],
                'notes' => 'পণ্য সম্পাদন পেজ থেকে সরাসরি স্টক পরিমাণ আপডেট করা হয়েছে।',
            ]);
        }

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

        // Permanently remove image files and relation records
        if ($product->images()->exists()) {
            $product->images()->delete();
        }
        if ($product->stockMovements()->exists()) {
            $product->stockMovements()->delete();
        }

        // Hard delete row directly from MySQL database
        $product->delete();

        ActivityLog::log('delete', "পণ্য '{$name}' ডাটাবেজ থেকে সম্পূর্ণ মুছে ফেলা হয়েছে।");

        return response()->json([
            'message' => "পণ্য '{$name}' ডাটাবেজ থেকে সফলভাবে মুছে ফেলা হয়েছে।"
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer',
        ])['ids'];

        $products = Product::whereIn('id', $ids)->get();
        $count = $products->count();

        foreach ($products as $product) {
            if ($product->images()->exists()) {
                $product->images()->delete();
            }
            if ($product->stockMovements()->exists()) {
                $product->stockMovements()->delete();
            }
            // Hard delete from MySQL
            $product->delete();
        }

        ActivityLog::log('delete', "{$count} টি পণ্য ডাটাবেজ থেকে সম্পূর্ণ মুছে ফেলা হয়েছে।");

        return response()->json([
            'message' => "{$count} টি পণ্য ডাটাবেজ থেকে সফলভাবে মুছে ফেলা হয়েছে।",
            'deleted_count' => $count,
        ]);
    }

    public function importJson(Request $request)
    {
        $content = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $realPath = $file->getRealPath();
            $content = file_get_contents($realPath);
            @unlink($realPath);
        } elseif ($request->has('json_data')) {
            $content = $request->input('json_data');
        } elseif ($request->isJson()) {
            $content = $request->getContent();
        }

        if (!$content) {
            return response()->json(['message' => 'কোনো JSON ফাইল বা ডাটা পাওয়া যায়নি।'], 422);
        }

        $data = json_decode($content, true);
        if (!is_array($data)) {
            return response()->json(['message' => 'অবৈধ JSON ফরম্যাট। অনুগ্রহ করে সঠিক JSON ফাইল দিন।'], 422);
        }

        if (isset($data['products']) && is_array($data['products'])) {
            $data = $data['products'];
        }

        $defaultUnit = Unit::first() ?? Unit::create(['name' => 'Piece', 'name_bn' => 'পিস', 'code' => 'pcs']);
        $defaultCat = Category::first() ?? Category::create(['name' => 'General', 'name_bn' => 'সাধারণ', 'slug' => 'general']);

        $inserted = 0;
        $updated = 0;
        $failed = 0;

        foreach ($data as $item) {
            if (!is_array($item)) {
                $failed++;
                continue;
            }

            $name = trim($item['name'] ?? $item['name_en'] ?? $item['title'] ?? '');
            if (empty($name)) {
                $failed++;
                continue;
            }

            $nameBn = !empty($item['name_bn']) ? trim($item['name_bn']) : null;
            $sellingPrice = isset($item['selling_price'])
                ? (float) $item['selling_price']
                : (isset($item['price']) ? (float) $item['price'] : (isset($item['sale_price']) ? (float) $item['sale_price'] : 0));

            $purchasePrice = isset($item['purchase_price'])
                ? (float) $item['purchase_price']
                : (isset($item['purchase_cost'])
                    ? (float) $item['purchase_cost']
                    : (isset($item['cost'])
                        ? (float) $item['cost']
                        : ($sellingPrice > 0 ? $sellingPrice * 0.8 : 0)));

            $wholesalePrice = isset($item['wholesale_price']) && is_numeric($item['wholesale_price']) ? (float) $item['wholesale_price'] : null;

            $currentStock = isset($item['current_stock'])
                ? (float) $item['current_stock']
                : (isset($item['stock_quantity'])
                    ? (float) $item['stock_quantity']
                    : (isset($item['stock']) ? (float) $item['stock'] : 0));

            $alertStock = isset($item['alert_stock'])
                ? (float) $item['alert_stock']
                : (isset($item['alert_level'])
                    ? (float) $item['alert_level']
                    : (isset($item['min_stock']) ? (float) $item['min_stock'] : 5));

            $taxPercent = isset($item['tax_percent']) ? (float) $item['tax_percent'] : 0;

            // Handle discount
            $discountType = null;
            $discountValue = 0;
            if (isset($item['discount']) && is_array($item['discount'])) {
                $dt = $item['discount']['type'] ?? 'none';
                if (in_array($dt, ['fixed', 'percentage'])) {
                    $discountType = $dt;
                    $discountValue = (float) ($item['discount']['value'] ?? 0);
                }
            } elseif (!empty($item['discount_type']) && in_array($item['discount_type'], ['fixed', 'percentage'])) {
                $discountType = $item['discount_type'];
                $discountValue = isset($item['discount_value']) ? (float) $item['discount_value'] : 0;
            }

            $description = $item['description'] ?? null;

            // Handle status
            $status = 'active';
            if (isset($item['is_active'])) {
                $status = $item['is_active'] ? 'active' : 'inactive';
            } elseif (isset($item['status']) && in_array($item['status'], ['active', 'inactive'])) {
                $status = $item['status'];
            }

            // Barcode & SKU
            $barcode = !empty($item['barcode']) ? trim((string)$item['barcode']) : ('894' . mt_rand(100000000, 999999999));
            $sku = !empty($item['sku']) ? trim($item['sku']) : ('SKU-' . substr($barcode, -6));

            // Category resolution
            $categoryId = null;
            if (!empty($item['category_id']) && Category::where('id', $item['category_id'])->exists()) {
                $categoryId = $item['category_id'];
            } elseif (!empty($item['category_name']) || !empty($item['category'])) {
                $catName = trim($item['category_name'] ?? $item['category']);
                $cat = Category::firstOrCreate(
                    ['name' => $catName],
                    ['slug' => Str::slug($catName) . '-' . uniqid(), 'status' => 'active']
                );
                $categoryId = $cat->id;
            } else {
                $categoryId = $defaultCat->id;
            }

            // Brand resolution
            $brandId = null;
            if (!empty($item['brand_id']) && Brand::where('id', $item['brand_id'])->exists()) {
                $brandId = $item['brand_id'];
            } elseif (!empty($item['brand_name']) || !empty($item['brand'])) {
                $bName = trim($item['brand_name'] ?? $item['brand']);
                $brand = Brand::firstOrCreate(
                    ['name' => $bName],
                    ['slug' => Str::slug($bName) . '-' . uniqid(), 'status' => 'active']
                );
                $brandId = $brand->id;
            }

            // Unit resolution
            $unitId = null;
            if (!empty($item['unit_id']) && Unit::where('id', $item['unit_id'])->exists()) {
                $unitId = $item['unit_id'];
            } elseif (!empty($item['unit_name']) || !empty($item['unit'])) {
                $uName = trim($item['unit_name'] ?? $item['unit']);
                $unit = Unit::firstOrCreate(
                    ['code' => Str::slug($uName)],
                    ['name' => ucfirst($uName), 'status' => 'active']
                );
                $unitId = $unit->id;
            } else {
                $unitId = $defaultUnit->id;
            }

            // Image URL normalization (handles Google Drive, Dropbox, etc. automatically)
            $imageUrl = null;
            if (!empty($item['image_url'])) {
                $imageUrl = ImageHelper::normalize($item['image_url']);
            }

            $product = Product::where('barcode', $barcode)->orWhere('sku', $sku)->first();
            if (!$product && !empty($item['id'])) {
                $product = Product::find($item['id']);
            }

            if ($product) {
                $product->update([
                    'name' => $name,
                    'name_bn' => $nameBn ?? $product->name_bn,
                    'category_id' => $categoryId,
                    'brand_id' => $brandId ?? $product->brand_id,
                    'unit_id' => $unitId,
                    'purchase_price' => $purchasePrice,
                    'selling_price' => $sellingPrice,
                    'wholesale_price' => $wholesalePrice ?? $product->wholesale_price,
                    'current_stock' => $currentStock > 0 ? $currentStock : $product->current_stock,
                    'alert_stock' => $alertStock,
                    'tax_percent' => $taxPercent,
                    'discount_type' => $discountType,
                    'discount_value' => $discountValue,
                    'description' => $description ?? $product->description,
                    'image_url' => $imageUrl ?? $product->image_url,
                    'status' => $status,
                ]);
                $updated++;
            } else {
                $createData = [
                    'name' => $name,
                    'name_bn' => $nameBn,
                    'barcode' => $barcode,
                    'sku' => $sku,
                    'category_id' => $categoryId,
                    'brand_id' => $brandId,
                    'unit_id' => $unitId,
                    'purchase_price' => $purchasePrice,
                    'selling_price' => $sellingPrice,
                    'wholesale_price' => $wholesalePrice,
                    'current_stock' => $currentStock,
                    'alert_stock' => $alertStock,
                    'tax_percent' => $taxPercent,
                    'discount_type' => $discountType,
                    'discount_value' => $discountValue,
                    'description' => $description,
                    'image_url' => $imageUrl,
                    'status' => $status,
                ];
                if (!empty($item['id']) && !Product::where('id', $item['id'])->exists()) {
                    $createData['id'] = $item['id'];
                }
                $product = Product::create($createData);

                if ($product->current_stock > 0) {
                    StockMovement::create([
                        'product_id' => $product->id,
                        'movement_type' => 'initial',
                        'user_id' => auth()->id(),
                        'quantity' => $product->current_stock,
                        'stock_before' => 0,
                        'stock_after' => $product->current_stock,
                        'unit_cost' => $product->purchase_price,
                        'reason' => 'JSON ইমপোর্টের সময় প্রাথমিক স্টক',
                    ]);
                }
                $inserted++;
            }
        }

        ActivityLog::log('import', "JSON থেকে পণ্য ইমপোর্ট সম্পন্ন: {$inserted} টি নতুন, {$updated} টি আপডেট।");

        return response()->json([
            'message' => "পণ্য ইমপোর্ট সফল হয়েছে! {$inserted} টি নতুন যুক্ত এবং {$updated} টি আপডেট করা হয়েছে।",
            'total' => count($data),
            'inserted' => $inserted,
            'updated' => $updated,
            'failed' => $failed,
        ]);
    }
}

