<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index()
    {
        return response()->json(Unit::withCount('products')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'code' => 'required|string|max:20|unique:units,code',
            'status' => 'nullable|in:active,inactive',
        ]);

        $unit = Unit::create($validated);
        ActivityLog::log('create', "পরিমাপক একক '{$unit->name}' তৈরি করা হয়েছে।", $unit);

        return response()->json([
            'message' => 'পরিমাপক একক সফলভাবে তৈরি হয়েছে।',
            'unit' => $unit,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $unit = Unit::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'code' => 'required|string|max:20|unique:units,code,' . $unit->id,
            'status' => 'required|in:active,inactive',
        ]);

        $unit->update($validated);
        ActivityLog::log('update', "পরিমাপক একক '{$unit->name}' আপডেট করা হয়েছে।", $unit);

        return response()->json([
            'message' => 'পরিমাপক একক আপডেট হয়েছে।',
            'unit' => $unit,
        ]);
    }

    public function destroy($id)
    {
        $unit = Unit::withCount('products')->findOrFail($id);
        $user = auth()->user();
        $isSuperAdmin = $user && ($user->role?->slug === 'super-admin' || $user->email === 'admin@israfilbd.com');

        if (!$isSuperAdmin && $unit->products_count > 0) {
            return response()->json([
                'message' => 'এই এককের অধীনে পণ্য রয়েছে, তাই ম্যানেজার মুছে ফেলতে পারবেন না। শুধুমাত্র সুপার অ্যাডমিন এটি অপসারণ করতে পারবেন।'
            ], 403);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($unit) {
            if ($unit->products_count > 0) {
                $fallback = Unit::where('id', '!=', $unit->id)->where('code', 'pcs')->first()
                    ?? Unit::where('id', '!=', $unit->id)->first();
                \App\Models\Product::where('unit_id', $unit->id)->update([
                    'unit_id' => $fallback ? $fallback->id : null,
                ]);
            }
            $unit->delete();
        });

        ActivityLog::log('delete', "পরিমাপক একক '{$unit->name}' মুছে ফেলা হয়েছে।", $unit);

        return response()->json([
            'message' => 'পরিমাপক একক সফলভাবে মুছে ফেলা হয়েছে।'
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
            $fallback = Unit::whereNotIn('id', $ids)->where('code', 'pcs')->first()
                ?? Unit::whereNotIn('id', $ids)->first();

            foreach ($ids as $id) {
                $unit = Unit::withCount('products')->find($id);
                if (!$unit) continue;

                if ($isSuperAdmin || $unit->products_count == 0) {
                    if ($unit->products_count > 0) {
                        \App\Models\Product::where('unit_id', $unit->id)->update([
                            'unit_id' => $fallback ? $fallback->id : null,
                        ]);
                    }
                    $unit->delete();
                    $deleted++;
                } else {
                    $skipped++;
                }
            }
        });

        if ($deleted > 0) {
            ActivityLog::log('delete', "{$deleted} টি পরিমাপক একক মুছে ফেলা হয়েছে।");
        }

        $msg = "{$deleted} টি পরিমাপক একক সফলভাবে মুছে ফেলা হয়েছে।";
        if ($skipped > 0) {
            $msg .= " ({$skipped} টি এককে পণ্য যুক্ত থাকায় বাদ দেওয়া হয়েছে; শুধুমাত্র সুপার অ্যাডমিন এগুলো মুছতে পারবেন)";
        }

        return response()->json([
            'message' => $msg,
            'deleted_count' => $deleted,
            'skipped_count' => $skipped,
        ]);
    }
}

