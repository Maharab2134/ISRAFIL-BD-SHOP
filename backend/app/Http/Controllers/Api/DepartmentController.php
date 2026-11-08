<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $departments = Department::with(['head', 'branch'])
            ->withCount(['employees', 'designations'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('name', 'like', "%{$request->search}%")
                        ->orWhere('name_bn', 'like', "%{$request->search}%")
                        ->orWhere('code', 'like', "%{$request->search}%")
                        ->orWhere('description', 'like', "%{$request->search}%");
                });
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('branch_id'), function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            })
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($departments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'name_bn' => 'nullable|string|max:100',
            'code' => 'required|string|max:50|unique:departments,code',
            'description' => 'nullable|string|max:500',
            'head_id' => 'nullable|exists:users,id',
            'branch_id' => 'nullable|exists:branches,id',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $department = Department::create($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_department',
            'description' => "নতুন বিভাগ '{$department->name}' তৈরি করা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'নতুন বিভাগ সফলভাবে তৈরি হয়েছে।',
            'department' => $department->load(['head', 'branch'])->loadCount(['employees', 'designations']),
        ], 201);
    }

    public function show($id)
    {
        $department = Department::with([
            'head',
            'branch',
            'designations' => function ($q) {
                $q->withCount('employees');
            },
            'employees' => function ($q) {
                $q->select('id', 'name', 'email', 'phone', 'employee_id', 'designation_id', 'role_id', 'branch_id', 'status', 'avatar', 'department_id')
                  ->with(['designationRelation', 'role', 'branch']);
            }
        ])->withCount(['employees', 'designations'])->findOrFail($id);

        return response()->json($department);
    }

    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'name_bn' => 'nullable|string|max:100',
            'code' => 'required|string|max:50|unique:departments,code,' . $department->id,
            'description' => 'nullable|string|max:500',
            'head_id' => 'nullable|exists:users,id',
            'branch_id' => 'nullable|exists:branches,id',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $department->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_department',
            'description' => "বিভাগ '{$department->name}' এর তথ্য আপডেট করা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'বিভাগের তথ্য সফলভাবে আপডেট হয়েছে।',
            'department' => $department->load(['head', 'branch'])->loadCount(['employees', 'designations']),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $department = Department::withCount('employees')->findOrFail($id);

        // Dependency protection: Check if department has assigned employees
        if ($department->employees_count > 0) {
            return response()->json([
                'message' => "এই বিভাগে বর্তমানে {$department->employees_count} জন সক্রিয় কর্মী নিযুক্ত আছেন। বিভাগ মুছে ফেলার পূর্বে কর্মীদের অন্য বিভাগে স্থানান্তর (Reassign) করুন।",
                'has_dependencies' => true,
                'employees_count' => $department->employees_count,
            ], 422);
        }

        $name = $department->name;
        $department->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_department',
            'description' => "বিভাগ '{$name}' মুছে ফেলা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => "বিভাগ '{$name}' সফলভাবে অপসারণ করা হয়েছে।",
        ]);
    }

    public function assignHead(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        $validated = $request->validate([
            'head_id' => 'nullable|exists:users,id',
        ]);

        $department->update(['head_id' => $validated['head_id']]);
        $head = $department->head;

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'assign_department_head',
            'description' => $head
                ? "বিভাগ '{$department->name}' এর প্রধান হিসেবে '{$head->name}' কে নিযুক্ত করা হয়েছে।"
                : "বিভাগ '{$department->name}' এর প্রধান পদ শূন্য করা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'বিভাগীয় প্রধান সফলভাবে নির্ধারিত হয়েছে।',
            'department' => $department->load(['head', 'branch']),
        ]);
    }
}

