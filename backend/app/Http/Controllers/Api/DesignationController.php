<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Designation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DesignationController extends Controller
{
    public function index(Request $request)
    {
        $designations = Designation::with('department')
            ->withCount('employees')
            ->when($request->filled('department_id'), function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('name', 'like', "%{$request->search}%")
                        ->orWhere('name_bn', 'like', "%{$request->search}%")
                        ->orWhere('code', 'like', "%{$request->search}%");
                });
            })
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($designations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:100',
            'name_bn' => 'nullable|string|max:100',
            'code' => 'nullable|string|max:50|unique:designations,code',
            'description' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive',
        ]);

        if (empty($validated['code'])) {
            $base = 'DES-' . Str::upper(Str::slug(substr($validated['name'], 0, 10)));
            $code = $base;
            $counter = 1;
            while (Designation::where('code', $code)->exists()) {
                $code = "{$base}-{$counter}";
                $counter++;
            }
            $validated['code'] = $code;
        } else {
            $validated['code'] = strtoupper(trim($validated['code']));
        }

        $designation = Designation::create($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_designation',
            'description' => "নতুন পদবী '{$designation->name}' যুক্ত করা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'নতুন পদবী সফলভাবে তৈরি হয়েছে।',
            'designation' => $designation->load('department')->loadCount('employees'),
        ], 201);
    }

    public function show($id)
    {
        $designation = Designation::with(['department', 'employees.branch', 'employees.role'])
            ->withCount('employees')
            ->findOrFail($id);

        return response()->json($designation);
    }

    public function update(Request $request, $id)
    {
        $designation = Designation::findOrFail($id);

        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:100',
            'name_bn' => 'nullable|string|max:100',
            'code' => 'nullable|string|max:50|unique:designations,code,' . $designation->id,
            'description' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive',
        ]);

        if (!empty($validated['code'])) {
            $validated['code'] = strtoupper(trim($validated['code']));
        }
        $designation->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_designation',
            'description' => "পদবী '{$designation->name}' এর তথ্য আপডেট করা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'পদবীর তথ্য সফলভাবে আপডেট হয়েছে।',
            'designation' => $designation->load('department')->loadCount('employees'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $designation = Designation::withCount('employees')->findOrFail($id);

        if ($designation->employees_count > 0) {
            return response()->json([
                'message' => "এই পদবীতে বর্তমানে {$designation->employees_count} জন সক্রিয় কর্মী আছেন। পদবী মুছে ফেলার পূর্বে তাদের অন্য পদবীতে স্থানান্তর করুন।",
                'has_dependencies' => true,
                'employees_count' => $designation->employees_count,
            ], 422);
        }

        $name = $designation->name;
        $designation->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_designation',
            'description' => "পদবী '{$name}' মুছে ফেলা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => "পদবী '{$name}' সফলভাবে অপসারণ করা হয়েছে।",
        ]);
    }
}

