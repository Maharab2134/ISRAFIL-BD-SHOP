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
        $user = auth()->user();
        $isSuperAdmin = $user && ($user->role?->slug === 'super-admin' || $user->email === 'admin@israfilbd.com');

        if (!$isSuperAdmin && $category->products_count > 0) {
            return response()->json([
                'message' => 'এই ক্যাটাগরির অধীনে পণ্য রয়েছে, তাই ম্যানেজার মুছে ফেলতে পারবেন না। শুধুমাত্র সুপার অ্যাডমিন এটি অপসারণ করতে পারবেন।'
            ], 403);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($category) {
            if ($category->products_count > 0) {
                $fallback = Category::where('id', '!=', $category->id)->first();
                if ($fallback) {
                    \App\Models\Product::where('category_id', $category->id)->update(['category_id' => $fallback->id]);
                }
            }
            $category->delete();
        });

        ActivityLog::log('delete', "ক্যাটাগরি '{$category->name}' মুছে ফেলা হয়েছে।", $category);

        return response()->json([
            'message' => 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।'
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer',
        ])['ids'];

        $user = auth()->user();
        $isSuperAdmin = $user && ($user->role?->slug === 'super-admin' || $user->email === 'admin@israfilbd.com');

        $deleted = 0;
        $skipped = 0;

        \Illuminate\Support\Facades\DB::transaction(function () use ($ids, $isSuperAdmin, &$deleted, &$skipped) {
            $fallback = Category::whereNotIn('id', $ids)->first();

            foreach ($ids as $id) {
                $cat = Category::withCount('products')->find($id);
                if (!$cat) continue;

                if ($isSuperAdmin || $cat->products_count == 0) {
                    if ($cat->products_count > 0 && $fallback) {
                        \App\Models\Product::where('category_id', $cat->id)->update(['category_id' => $fallback->id]);
                    }
                    $cat->delete();
                    $deleted++;
                } else {
                    $skipped++;
                }
            }
        });

        if ($deleted > 0) {
            ActivityLog::log('delete', "{$deleted} টি ক্যাটাগরি মুছে ফেলা হয়েছে।");
        }

        $msg = "{$deleted} টি ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।";
        if ($skipped > 0) {
            $msg .= " ({$skipped} টি ক্যাটাগরিতে পণ্য যুক্ত থাকায় বাদ দেওয়া হয়েছে; শুধুমাত্র সুপার অ্যাডমিন এগুলো মুছতে পারবেন)";
        }

        return response()->json([
            'message' => $msg,
            'deleted_count' => $deleted,
            'skipped_count' => $skipped,
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

        if (isset($data['categories']) && is_array($data['categories'])) {
            $data = $data['categories'];
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
            $code = !empty($item['code']) ? trim($item['code']) : (!empty($item['slug']) ? trim($item['slug']) : null);
            $slug = !empty($item['slug']) ? trim($item['slug']) : (Str::slug($name) . '-' . uniqid());

            $status = 'active';
            if (isset($item['is_active'])) {
                $status = $item['is_active'] ? 'active' : 'inactive';
            } elseif (isset($item['status']) && in_array($item['status'], ['active', 'inactive'])) {
                $status = $item['status'];
            }

            $category = null;
            if (!empty($item['id'])) {
                $category = Category::find($item['id']);
            }
            if (!$category && $code) {
                $category = Category::where('code', $code)->orWhere('slug', $code)->first();
            }
            if (!$category) {
                $category = Category::whereRaw('LOWER(name) = ?', [strtolower($name)])->first();
            }

            if ($category) {
                $category->update([
                    'name' => $name,
                    'name_bn' => $nameBn ?? $category->name_bn,
                    'code' => $code ?? $category->code,
                    'status' => $status,
                ]);
                $updated++;
            } else {
                $createData = [
                    'name' => $name,
                    'name_bn' => $nameBn,
                    'code' => $code,
                    'slug' => $slug,
                    'status' => $status,
                ];
                if (!empty($item['id']) && !Category::where('id', $item['id'])->exists()) {
                    $createData['id'] = $item['id'];
                }
                Category::create($createData);
                $inserted++;
            }
        }

        ActivityLog::log('import', "JSON থেকে ক্যাটাগরি ইমপোর্ট সম্পন্ন: {$inserted} টি নতুন, {$updated} টি আপডেট।");

        return response()->json([
            'message' => "ক্যাটাগরি ইমপোর্ট সফল হয়েছে! {$inserted} টি নতুন যুক্ত এবং {$updated} টি আপডেট করা হয়েছে।",
            'total' => count($data),
            'inserted' => $inserted,
            'updated' => $updated,
            'failed' => $failed,
        ]);
    }
}

