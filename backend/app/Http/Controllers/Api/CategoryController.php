<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::withCount('products')
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('name_bn', 'like', "%{$request->search}%");
            })
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($categories);
    }

    public function show($id)
    {
        $category = Category::withCount('products')->with('products')->findOrFail($id);
        return response()->json($category);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'code' => 'nullable|string|unique:categories,code',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        $validated['status'] = $validated['status'] ?? 'active';

        $category = Category::create($validated);
        ActivityLog::log('create', "ক্যাটাগরি '{$category->name}' তৈরি করা হয়েছে।", $category);

        return response()->json([
            'message' => 'ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে।',
            'category' => $category,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'code' => 'nullable|string|unique:categories,code,' . $category->id,
            'status' => 'required|in:active,inactive',
        ]);

        $category->update($validated);
        ActivityLog::log('update', "ক্যাটাগরি '{$category->name}' আপডেট করা হয়েছে।", $category);

        return response()->json([
            'message' => 'ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে।',
            'category' => $category,
        ]);
    }

    public function destroy($id)
    {
        $category = Category::withCount('products')->findOrFail($id);
        if ($category->products_count > 0) {
            return response()->json([
                'message' => 'এই ক্যাটাগরির অধীনে পণ্য রয়েছে, তাই এটি মুছে ফেলা সম্ভব নয়।'
            ], 422);
        }

        $category->delete();
        ActivityLog::log('delete', "ক্যাটাগরি '{$category->name}' মুছে ফেলা হয়েছে।", $category);

        return response()->json([
            'message' => 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।'
        ]);
    }
}
