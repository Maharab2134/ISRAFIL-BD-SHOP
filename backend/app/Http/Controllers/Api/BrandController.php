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
}
