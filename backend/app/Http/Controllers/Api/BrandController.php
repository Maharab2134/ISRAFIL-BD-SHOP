<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $brands = Brand::withCount('products')
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('name_bn', 'like', "%{$request->search}%");
            })
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($brands);
    }

    public function show($id)
    {
        $brand = Brand::withCount('products')->with('products')->findOrFail($id);
        return response()->json($brand);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        $validated['status'] = $validated['status'] ?? 'active';

        $brand = Brand::create($validated);
        ActivityLog::log('create', "ব্র্যান্ড '{$brand->name}' তৈরি করা হয়েছে।", $brand);

        return response()->json([
            'message' => 'ব্র্যান্ড সফলভাবে তৈরি করা হয়েছে।',
            'brand' => $brand,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
        ]);

        $brand->update($validated);
        ActivityLog::log('update', "ব্র্যান্ড '{$brand->name}' আপডেট করা হয়েছে।", $brand);

        return response()->json([
            'message' => 'ব্র্যান্ড সফলভাবে আপডেট করা হয়েছে।',
            'brand' => $brand,
        ]);
    }

    public function destroy($id)
    {
        $brand = Brand::withCount('products')->findOrFail($id);
        if ($brand->products_count > 0) {
            return response()->json([
                'message' => 'এই ব্র্যান্ডের অধীনে পণ্য রয়েছে, তাই এটি মুছে ফেলা যাবে না।'
            ], 422);
        }

        $brand->delete();
        ActivityLog::log('delete', "ব্র্যান্ড '{$brand->name}' মুছে ফেলা হয়েছে।", $brand);

        return response()->json([
            'message' => 'ব্র্যান্ড সফলভাবে মুছে ফেলা হয়েছে।'
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

        if (isset($data['brands']) && is_array($data['brands'])) {
            $data = $data['brands'];
        }

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
            $slug = !empty($item['slug']) ? trim($item['slug']) : (Str::slug($name) . '-' . uniqid());

            $status = 'active';
            if (isset($item['is_active'])) {
                $status = $item['is_active'] ? 'active' : 'inactive';
            } elseif (isset($item['status']) && in_array($item['status'], ['active', 'inactive'])) {
                $status = $item['status'];
            }

            $brand = null;
            if (!empty($item['id'])) {
                $brand = Brand::find($item['id']);
            }
            if (!$brand) {
                $brand = Brand::whereRaw('LOWER(name) = ?', [strtolower($name)])->first();
            }

            if ($brand) {
                $brand->update([
                    'name' => $name,
                    'name_bn' => $nameBn ?? $brand->name_bn,
                    'status' => $status,
                ]);
                $updated++;
            } else {
                $createData = [
                    'name' => $name,
                    'name_bn' => $nameBn,
                    'slug' => $slug,
                    'status' => $status,
                ];
                if (!empty($item['id']) && !Brand::where('id', $item['id'])->exists()) {
                    $createData['id'] = $item['id'];
                }
                Brand::create($createData);
                $inserted++;
            }
        }

        ActivityLog::log('import', "JSON থেকে ব্র্যান্ড ইমপোর্ট সম্পন্ন: {$inserted} টি নতুন, {$updated} টি আপডেট।");

        return response()->json([
            'message' => "ব্র্যান্ড ইমপোর্ট সফল হয়েছে! {$inserted} টি নতুন যুক্ত এবং {$updated} টি আপডেট করা হয়েছে।",
            'total' => count($data),
            'inserted' => $inserted,
            'updated' => $updated,
            'failed' => $failed,
        ]);
    }
}

