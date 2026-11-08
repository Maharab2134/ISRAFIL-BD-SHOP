<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $branches = Branch::withCount('users')
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            })
            ->when($request->has('is_active'), function ($q) use ($request) {
                $q->where('is_active', $request->boolean('is_active'));
            })
            ->orderByDesc('is_main')
            ->latest('id')
            ->get();

        return response()->json($branches);
    }

    public function store(Request $request)
    {
        // Rule 2: Strictly enforce max 11 digits on phone if provided
        if ($request->filled('phone')) {
            $rawPhone = preg_replace('/[^0-9]/', '', (string) $request->input('phone'));
            if (str_starts_with($rawPhone, '8801') && strlen($rawPhone) === 13) {
                $cleanPhone = substr($rawPhone, 2);
            } else {
                $cleanPhone = $rawPhone;
            }
            if (strlen($cleanPhone) !== 11 || !preg_match('/^01[3-9]\d{8}$/', $cleanPhone)) {
                return response()->json([
                    'message' => 'শাখার মোবাইল নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 017XXXXXXXX)। ১১ ডিজিটের বেশি বা কম নম্বর কোনোভাবেই সমর্থন করবে না।',
                    'errors' => ['phone' => ['মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে (যেমন: 01XXXXXXXXX)।']]
                ], 422);
            }
            $request->merge(['phone' => $cleanPhone]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'name_bn' => 'nullable|string|max:150',
            'code' => 'required|string|max:50|unique:branches,code',
            'phone' => 'nullable|string|size:11',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_main' => 'boolean',
        ]);

        if (!empty($validated['is_main'])) {
            Branch::where('is_main', true)->update(['is_main' => false]);
        }

        $branch = Branch::create($validated);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'create_branch',
            'description' => "নতুন শাখা '{$branch->name}' ({$branch->code}) তৈরি করা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'শাখা সফলভাবে তৈরি করা হয়েছে।',
            'branch' => $branch->loadCount('users'),
        ], 201);
    }

    public function show($id)
    {
        $branch = Branch::with(['users.role'])->withCount('users')->findOrFail($id);
        return response()->json($branch);
    }

    public function update(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);

        // Rule 2: Strictly enforce max 11 digits on phone if provided
        if ($request->filled('phone')) {
            $rawPhone = preg_replace('/[^0-9]/', '', (string) $request->input('phone'));
            if (str_starts_with($rawPhone, '8801') && strlen($rawPhone) === 13) {
                $cleanPhone = substr($rawPhone, 2);
            } else {
                $cleanPhone = $rawPhone;
            }
            if (strlen($cleanPhone) !== 11 || !preg_match('/^01[3-9]\d{8}$/', $cleanPhone)) {
                return response()->json([
                    'message' => 'শাখার মোবাইল নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 017XXXXXXXX)। ১১ ডিজিটের বেশি বা কম নম্বর কোনোভাবেই সমর্থন করবে না।',
                    'errors' => ['phone' => ['মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে (যেমন: 01XXXXXXXXX)।']]
                ], 422);
            }
            $request->merge(['phone' => $cleanPhone]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'name_bn' => 'nullable|string|max:150',
            'code' => 'required|string|max:50|unique:branches,code,' . $branch->id,
            'phone' => 'nullable|string|size:11',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_main' => 'boolean',
        ]);

        if (!empty($validated['is_main'])) {
            Branch::where('id', '!=', $branch->id)->where('is_main', true)->update(['is_main' => false]);
        }

        $branch->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'update_branch',
            'description' => "শাখা '{$branch->name}' এর তথ্য আপডেট করা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'শাখার তথ্য সফলভাবে আপডেট হয়েছে।',
            'branch' => $branch->fresh()->loadCount('users'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);

        if ($branch->is_main) {
            return response()->json([
                'message' => 'প্রধান শাখা (Main Branch) মুছে ফেলা সম্ভব নয়।'
            ], 422);
        }

        if ($branch->users()->count() > 0) {
            return response()->json([
                'message' => 'এই শাখায় কর্মীবৃন্দ নিযুক্ত রয়েছে। মুছে ফেলার আগে কর্মীদের অন্য শাখায় স্থানান্তর করুন।'
            ], 422);
        }

        $branchName = $branch->name;
        $branch->delete();

        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'delete_branch',
            'description' => "শাখা '{$branchName}' মুছে ফেলা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => "'{$branchName}' শাখা সফলভাবে মুছে ফেলা হয়েছে।"
        ]);
    }
}

