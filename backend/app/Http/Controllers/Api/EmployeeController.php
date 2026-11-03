<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = User::with('role')
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            })
            ->latest('id')
            ->paginate(20);

        return response()->json($employees);
    }

    public function show($id)
    {
        $employee = User::with(['role.permissions', 'activityLogs' => function ($q) {
            $q->latest('id')->limit(20);
        }])->findOrFail($id);

        return response()->json($employee);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'password' => 'required|string|min:6',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $employee = User::create($validated);

        ActivityLog::log('create', "নতুন কর্মী '{$employee->name}' যুক্ত করা হয়েছে।", $employee);

        return response()->json([
            'message' => 'কর্মী সফলভাবে যুক্ত করা হয়েছে।',
            'employee' => $employee->load('role'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $employee = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $employee->id,
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'password' => 'nullable|string|min:6',
            'status' => 'required|in:active,inactive',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $employee->update($validated);
        ActivityLog::log('update', "কর্মী '{$employee->name}' এর তথ্য আপডেট করা হয়েছে।", $employee);

        return response()->json([
            'message' => 'কর্মীর তথ্য সফলভাবে আপডেট হয়েছে।',
            'employee' => $employee->load('role'),
        ]);
    }

    public function roles()
    {
        $roles = Role::with('permissions')->withCount('users')->get();
        return response()->json($roles);
    }

    public function permissions()
    {
        $permissions = Permission::all()->groupBy('group');
        return response()->json($permissions);
    }

    public function activityLogs(Request $request)
    {
        $logs = ActivityLog::with('user')
            ->when($request->filled('action'), function ($q) use ($request) {
                $q->where('action', $request->action);
            })
            ->latest('id')
            ->paginate($request->integer('per_page', 30));

        return response()->json($logs);
    }
}
