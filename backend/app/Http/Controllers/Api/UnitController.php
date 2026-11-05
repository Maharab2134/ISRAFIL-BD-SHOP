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
        if ($unit->products_count > 0) {
            return response()->json([
                'message' => 'এই এককের অধীনে পণ্য রয়েছে, তাই মুছে ফেলা সম্ভব নয়।'
            ], 422);
        }

        $unit->delete();
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

        $deleted = 0;
        $skipped = 0;
        foreach ($ids as $id) {
            $unit = Unit::withCount('products')->find($id);
            if ($unit && $unit->products_count == 0) {
                $unit->delete();
                $deleted++;
            } else {
                $skipped++;
            }
        }

        if ($deleted > 0) {
            ActivityLog::log('delete', "{$deleted} টি পরিমাপক একক মুছে ফেলা হয়েছে।");
        }

        $msg = "{$deleted} টি পরিমাপক একক সফলভাবে মুছে ফেলা হয়েছে।";
        if ($skipped > 0) {
            $msg .= " ({$skipped} টি এককে পণ্য যুক্ত থাকায় বাদ দেওয়া হয়েছে)";
        }

        return response()->json([
            'message' => $msg,
            'deleted_count' => $deleted,
            'skipped_count' => $skipped,
        ]);
    }
}

