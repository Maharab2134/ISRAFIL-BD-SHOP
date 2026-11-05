<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

    private function ensureSuperAdmin(Request $request): void
    {
        $user = $request->user();
        $isSuperAdmin = $user && ($user->role?->slug === 'super-admin' || $user->email === 'admin@israfilbd.com');
        if (!$isSuperAdmin) {
            abort(response()->json([
                'message' => 'শুধুমাত্র সুপার অ্যাডমিন পারমিশন ও ভূমিকা পরিবর্তন করতে পারেন।'
            ], 403));
        }
    }

    public function showRole($id)
    {
        $role = Role::with('permissions')->withCount('users')->findOrFail($id);
        return response()->json($role);
    }

    public function storeRole(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'name_bn' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:255',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);

        $baseSlug = Str::slug($validated['name']);
        $slug = $baseSlug ?: 'role-' . time();
        $counter = 1;
        while (Role::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $role = Role::create([
            'name' => $validated['name'],
            'name_bn' => $validated['name_bn'] ?? $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'is_system' => false,
        ]);

        if (!empty($validated['permission_ids'])) {
            $role->permissions()->sync($validated['permission_ids']);
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_role',
            'description' => "সুপার অ্যাডমিন নতুন ভূমিকা '{$role->name}' তৈরি করেছেন।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'নতুন ভূমিকা সফলভাবে তৈরি হয়েছে।',
            'role' => $role->load('permissions')->loadCount('users'),
        ], 201);
    }

    public function updateRole(Request $request, $id)
    {
        $this->ensureSuperAdmin($request);
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'name_bn' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:255',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'name_bn' => $validated['name_bn'] ?? $role->name_bn,
            'description' => $validated['description'] ?? $role->description,
        ];
        if (!$role->is_system) {
            $updateData['slug'] = Str::slug($validated['name']);
        }
        $role->update($updateData);

        if ($role->slug !== 'super-admin' && isset($validated['permission_ids'])) {
            $role->permissions()->sync($validated['permission_ids']);
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_role',
            'description' => "সুপার অ্যাডমিন ভূমিকা '{$role->name}' এর তথ্য ও পারমিশন আপডেট করেছেন।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'ভূমিকা সফলভাবে আপডেট হয়েছে।',
            'role' => $role->fresh(['permissions'])->loadCount('users'),
        ]);
    }

    public function updateRolePermissions(Request $request, $id)
    {
        $this->ensureSuperAdmin($request);
        $role = Role::findOrFail($id);

        if ($role->slug === 'super-admin') {
            return response()->json([
                'message' => 'সুপার অ্যাডমিনের পূর্ণ সিস্টেম পারমিশন সংরক্ষিত থাকে, এটি পরিবর্তনযোগ্য নয়।'
            ], 422);
        }

        $validated = $request->validate([
            'permission_ids' => 'present|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);

        $role->permissions()->sync($validated['permission_ids']);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_role_permissions',
            'description' => "সুপার অ্যাডমিন '{$role->name}' রোলের পারমিশন পরিবর্তন করেছেন। মোট পারমিশন: " . count($validated['permission_ids']) . " টি।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => "'{$role->name}' রোলের পারমিশন সফলভাবে হালনাগাদ করা হয়েছে।",
            'role' => $role->fresh(['permissions'])->loadCount('users'),
        ]);
    }

    public function destroyRole(Request $request, $id)
    {
        $this->ensureSuperAdmin($request);
        $role = Role::findOrFail($id);

        if ($role->is_system || in_array($role->slug, ['super-admin', 'manager', 'cashier'])) {
            return response()->json([
                'message' => 'সিস্টেমের ডিফল্ট ভূমিকা (Role) মুছে ফেলা সম্ভব নয়।'
            ], 422);
        }

        if ($role->users()->count() > 0) {
            return response()->json([
                'message' => 'এই ভূমিকায় সক্রিয় কর্মী বিদ্যমান রয়েছে। মুছে ফেলার আগে কর্মীদের অন্য ভূমিকায় স্থানান্তর করুন।'
            ], 422);
        }

        $roleName = $role->name;
        $role->permissions()->detach();
        $role->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_role',
            'description' => "সুপার অ্যাডমিন '{$roleName}' ভূমিকা মুছে ফেলেছেন।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => "'{$roleName}' ভূমিকা সফলভাবে মুছে ফেলা হয়েছে।"
        ]);
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

    public function destroy($id, Request $request)
    {
        $employee = User::findOrFail($id);
        if ($employee->id === $request->user()->id) {
            return response()->json(['message' => 'আপনি নিজের অ্যাকাউন্ট মুছতে পারবেন না।'], 422);
        }
        if ($employee->role?->slug === 'super-admin') {
            return response()->json(['message' => 'সুপার অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা সম্ভব নয়।'], 422);
        }

        $name = $employee->name;
        $employee->delete();
        ActivityLog::log('delete', "কর্মী '{$name}' কে মুছে ফেলা হয়েছে।");

        return response()->json(['message' => 'কর্মী সফলভাবে মুছে ফেলা হয়েছে।']);
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer',
        ])['ids'];

        $currentUserId = $request->user()->id;
        $deleted = 0;
        $skipped = 0;

        foreach ($ids as $id) {
            $emp = User::with('role')->find($id);
            if ($emp && $emp->id !== $currentUserId && $emp->role?->slug !== 'super-admin') {
                $emp->delete();
                $deleted++;
            } else {
                $skipped++;
            }
        }

        if ($deleted > 0) {
            ActivityLog::log('delete', "{$deleted} জন কর্মী একসাথে মুছে ফেলা হয়েছে।");
        }

        $msg = "{$deleted} জন কর্মী সফলভাবে মুছে ফেলা হয়েছে।";
        if ($skipped > 0) {
            $msg .= " (সুপার অ্যাডমিন বা আপনার নিজের অ্যাকাউন্ট বাদ দেওয়া হয়েছে)";
        }

        return response()->json([
            'message' => $msg,
            'deleted_count' => $deleted,
            'skipped_count' => $skipped,
        ]);
    }
}

