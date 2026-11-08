<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Department;
use App\Models\Designation;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeDocument;
use App\Models\EmployeeStatusHistory;
use App\Models\EmployeeTransfer;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmployeeController extends Controller
{
    /**
     * List employees with enterprise multi-filter and pagination.
     */
    public function index(Request $request)
    {
        $query = User::with([
            'role',
            'branch',
            'departmentRelation',
            'designationRelation',
            'reportingManager:id,name,email,employee_id'
        ])
        ->when($request->filled('search'), function ($q) use ($request) {
            $search = trim($request->search);
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%")
                    ->orWhere('designation', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%");
            });
        })
        ->when($request->filled('role_id'), function ($q) use ($request) {
            $q->where('role_id', $request->role_id);
        })
        ->when($request->filled('branch_id'), function ($q) use ($request) {
            $q->where('branch_id', $request->branch_id);
        })
        ->when($request->filled('department_id'), function ($q) use ($request) {
            $q->where('department_id', $request->department_id);
        })
        ->when($request->filled('designation_id'), function ($q) use ($request) {
            $q->where('designation_id', $request->designation_id);
        })
        ->when($request->filled('status'), function ($q) use ($request) {
            $q->where('status', $request->status);
        })
        ->when($request->filled('employment_type'), function ($q) use ($request) {
            $q->where('employment_type', $request->employment_type);
        })
        ->when($request->filled('joining_date_from'), function ($q) use ($request) {
            $q->whereDate('joining_date', '>=', $request->joining_date_from);
        })
        ->when($request->filled('joining_date_to'), function ($q) use ($request) {
            $q->whereDate('joining_date', '<=', $request->joining_date_to);
        });

        if ($request->boolean('all')) {
            $employees = $query->orderBy('name', 'asc')->get();
            return response()->json($employees);
        }

        $employees = $query->latest('id')->paginate($request->integer('per_page', 15));
        return response()->json($employees);
    }

    /**
     * Live KPI counters for Employee Dashboard.
     */
    public function kpis()
    {
        $total = User::count();
        $active = User::where('status', 'active')->count();
        $inactive = User::where('status', 'inactive')->count();
        $onLeave = User::where('status', 'on_leave')->count();
        $suspended = User::where('status', 'suspended')->count();
        $resigned = User::where('status', 'resigned')->count();
        $terminated = User::where('status', 'terminated')->count();

        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $newThisMonth = User::where(function ($q) use ($startOfMonth) {
            $q->whereDate('joining_date', '>=', $startOfMonth)
              ->orWhereDate('created_at', '>=', $startOfMonth);
        })->count();

        $departmentsCount = Department::where('status', 'active')->count();

        return response()->json([
            'total_employees' => $total,
            'active_employees' => $active,
            'inactive_employees' => $inactive,
            'on_leave_employees' => $onLeave,
            'suspended_employees' => $suspended,
            'resigned_employees' => $resigned,
            'terminated_employees' => $terminated,
            'new_this_month' => $newThisMonth,
            'departments_count' => $departmentsCount,
        ]);
    }

    /**
     * Get single employee profile with full 360-degree relation history.
     */
    public function show($id)
    {
        $employee = User::with([
            'role.permissions',
            'branch',
            'departmentRelation',
            'designationRelation',
            'reportingManager:id,name,email,employee_id,phone,avatar,designation',
            'subordinates' => function ($q) {
                $q->select('id', 'name', 'email', 'employee_id', 'designation', 'status', 'avatar', 'reporting_manager_id')
                  ->with('designationRelation');
            },
            'documents.uploader:id,name',
            'transfers.fromBranch',
            'transfers.toBranch',
            'transfers.fromDepartment',
            'transfers.toDepartment',
            'transfers.approver:id,name',
            'statusHistories.changer:id,name',
            'attendances' => function ($q) {
                $q->latest('date')->limit(30);
            },
            'activityLogs' => function ($q) {
                $q->latest('id')->limit(30);
            }
        ])->findOrFail($id);

        return response()->json($employee);
    }

    /**
     * Store new employee & login account inside a safe DB transaction.
     */
    public function store(Request $request)
    {
        // Rule 2: Strict 11-digit mobile validation
        if ($request->filled('phone')) {
            $rawPhone = preg_replace('/[^0-9]/', '', (string) $request->input('phone'));
            if (str_starts_with($rawPhone, '8801') && strlen($rawPhone) === 13) {
                $cleanPhone = substr($rawPhone, 2);
            } else {
                $cleanPhone = $rawPhone;
            }
            if (strlen($cleanPhone) !== 11 || !preg_match('/^01[3-9]\d{8}$/', $cleanPhone)) {
                return response()->json([
                    'message' => 'মোবাইল নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 017XXXXXXXX)। ১১ ডিজিটের বেশি বা কম নম্বর কোনোভাবেই সমর্থন করবে না।',
                    'errors' => ['phone' => ['মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে (যেমন: 01XXXXXXXXX)।']]
                ], 422);
            }
            $request->merge(['phone' => $cleanPhone]);
        }

        if ($request->filled('emergency_contact_phone')) {
            $rawEmergency = preg_replace('/[^0-9]/', '', (string) $request->input('emergency_contact_phone'));
            if (str_starts_with($rawEmergency, '8801') && strlen($rawEmergency) === 13) {
                $cleanEmergency = substr($rawEmergency, 2);
            } else {
                $cleanEmergency = $rawEmergency;
            }
            if (strlen($cleanEmergency) !== 11 || !preg_match('/^01[3-9]\d{8}$/', $cleanEmergency)) {
                return response()->json([
                    'message' => 'জরুরি যোগাযোগের ফোন নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 01XXXXXXXXX)।',
                    'errors' => ['emergency_contact_phone' => ['জরুরি যোগাযোগের নম্বর অবশ্যই ১১ ডিজিটের হতে হবে।']]
                ], 422);
            }
            $request->merge(['emergency_contact_phone' => $cleanEmergency]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|size:11',
            'employee_id' => 'nullable|string|max:50|unique:users,employee_id',
            'role_id' => 'required|exists:roles,id',
            'branch_id' => 'nullable|exists:branches,id',
            'department_id' => 'nullable|exists:departments,id',
            'designation_id' => 'nullable|exists:designations,id',
            'reporting_manager_id' => 'nullable|exists:users,id',
            'employment_type' => 'required|in:full_time,part_time,contract,temporary,probation',
            'status' => 'required|in:active,inactive,on_leave,suspended,resigned,terminated',
            'joining_date' => 'nullable|date',
            'password' => 'required|string|min:6',
            'father_name' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'dob' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'present_address' => 'nullable|string|max:500',
            'permanent_address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|size:11',
            'emergency_contact_relation' => 'nullable|string|max:100',
            'salary' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Auto generate Employee ID if not supplied
            if (empty($validated['employee_id'])) {
                $lastId = User::max('id') ?? 0;
                $empId = 'EMP-' . str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);
                while (User::where('employee_id', $empId)->exists()) {
                    $lastId++;
                    $empId = 'EMP-' . str_pad($lastId + 1, 4, '0', STR_PAD_LEFT);
                }
                $validated['employee_id'] = $empId;
            }

            // Sync string labels for department and designation
            if (!empty($validated['department_id'])) {
                $dept = Department::find($validated['department_id']);
                $validated['department'] = $dept ? $dept->name : null;
            }
            if (!empty($validated['designation_id'])) {
                $desig = Designation::find($validated['designation_id']);
                $validated['designation'] = $desig ? $desig->name : null;
            }

            $rawPassword = $validated['password'];
            $validated['password'] = Hash::make($rawPassword);

            $employee = User::create($validated);

            // Record initial status history
            EmployeeStatusHistory::create([
                'user_id' => $employee->id,
                'previous_status' => 'new_hire',
                'new_status' => $employee->status,
                'changed_by' => $request->user()->id,
                'reason' => 'প্রাথমিক কর্মী নিবন্ধন ও একাউন্ট তৈরি।',
                'effective_date' => $employee->joining_date ?? Carbon::today()->toDateString(),
            ]);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'create_employee',
                'description' => "নতুন কর্মী '{$employee->name}' (আইডি: {$employee->employee_id}) নিবন্ধিত হয়েছে। পদবী: " . ($employee->designation ?: 'Staff'),
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ]);

            return response()->json([
                'message' => "কর্মী '{$employee->name}' সফলভাবে নিবন্ধিত হয়েছে।",
                'employee' => $employee->load(['role', 'branch', 'departmentRelation', 'designationRelation', 'reportingManager']),
            ], 201);
        });
    }

    /**
     * Update employee profile & HR attributes.
     */
    public function update(Request $request, $id)
    {
        $employee = User::findOrFail($id);

        // Rule 2: Strict 11-digit mobile validation
        if ($request->filled('phone')) {
            $rawPhone = preg_replace('/[^0-9]/', '', (string) $request->input('phone'));
            if (str_starts_with($rawPhone, '8801') && strlen($rawPhone) === 13) {
                $cleanPhone = substr($rawPhone, 2);
            } else {
                $cleanPhone = $rawPhone;
            }
            if (strlen($cleanPhone) !== 11 || !preg_match('/^01[3-9]\d{8}$/', $cleanPhone)) {
                return response()->json([
                    'message' => 'মোবাইল নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে (যেমন: 017XXXXXXXX)।',
                    'errors' => ['phone' => ['মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে।']]
                ], 422);
            }
            $request->merge(['phone' => $cleanPhone]);
        }

        if ($request->filled('emergency_contact_phone')) {
            $rawEmergency = preg_replace('/[^0-9]/', '', (string) $request->input('emergency_contact_phone'));
            if (str_starts_with($rawEmergency, '8801') && strlen($rawEmergency) === 13) {
                $cleanEmergency = substr($rawEmergency, 2);
            } else {
                $cleanEmergency = $rawEmergency;
            }
            if (strlen($cleanEmergency) !== 11 || !preg_match('/^01[3-9]\d{8}$/', $cleanEmergency)) {
                return response()->json([
                    'message' => 'জরুরি যোগাযোগের ফোন নম্বর অবশ্যই সঠিক ১১ ডিজিটের হতে হবে।',
                    'errors' => ['emergency_contact_phone' => ['জরুরি যোগাযোগের নম্বর অবশ্যই ১১ ডিজিটের হতে হবে।']]
                ], 422);
            }
            $request->merge(['emergency_contact_phone' => $cleanEmergency]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $employee->id,
            'phone' => 'nullable|string|size:11',
            'employee_id' => 'nullable|string|max:50|unique:users,employee_id,' . $employee->id,
            'role_id' => 'required|exists:roles,id',
            'branch_id' => 'nullable|exists:branches,id',
            'department_id' => 'nullable|exists:departments,id',
            'designation_id' => 'nullable|exists:designations,id',
            'reporting_manager_id' => 'nullable|exists:users,id',
            'employment_type' => 'required|in:full_time,part_time,contract,temporary,probation',
            'status' => 'required|in:active,inactive,on_leave,suspended,resigned,terminated',
            'joining_date' => 'nullable|date',
            'password' => 'nullable|string|min:6',
            'father_name' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'dob' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'present_address' => 'nullable|string|max:500',
            'permanent_address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|size:11',
            'emergency_contact_relation' => 'nullable|string|max:100',
            'salary' => 'nullable|numeric|min:0',
        ]);

        // Anti-Circular Reporting Prevention
        if (!empty($validated['reporting_manager_id'])) {
            if ($validated['reporting_manager_id'] == $employee->id) {
                return response()->json([
                    'message' => 'কর্মী নিজেকে নিজের রিপোর্টিং ম্যানেজার হিসেবে নির্ধারণ করতে পারবে না।',
                    'errors' => ['reporting_manager_id' => ['কর্মী নিজে নিজের ম্যানেজার হতে পারে না।']]
                ], 422);
            }

            // Check if proposed manager is currently a direct or indirect subordinate of this employee
            $isSubordinate = $this->isDescendant($employee->id, (int) $validated['reporting_manager_id']);
            if ($isSubordinate) {
                return response()->json([
                    'message' => 'বিজ্ঞপ্তি: চক্রাকার রিপোর্টিং সম্পর্ক (Circular Reporting Loop) নিষিদ্ধ। অধীনস্থ কোনো কর্মীকে নিজের ম্যানেজার নির্ধারণ করা যাবে না।',
                    'errors' => ['reporting_manager_id' => ['চক্রাকার রিপোর্টিং সম্পর্ক প্রতিরোধ করা হয়েছে।']]
                ], 422);
            }
        }

        return DB::transaction(function () use ($employee, $validated, $request) {
            // Check if status changed
            $oldStatus = $employee->status;
            $newStatus = $validated['status'];
            if ($oldStatus !== $newStatus) {
                EmployeeStatusHistory::create([
                    'user_id' => $employee->id,
                    'previous_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'changed_by' => $request->user()->id,
                    'reason' => $request->input('status_change_reason', 'প্রোফাইল সম্পাদনার মাধ্যমে স্ট্যাটাস পরিবর্তন।'),
                    'effective_date' => Carbon::today()->toDateString(),
                ]);
            }

            // Sync string labels for department and designation
            if (isset($validated['department_id'])) {
                $dept = Department::find($validated['department_id']);
                $validated['department'] = $dept ? $dept->name : null;
            }
            if (isset($validated['designation_id'])) {
                $desig = Designation::find($validated['designation_id']);
                $validated['designation'] = $desig ? $desig->name : null;
            }

            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            $employee->update($validated);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'update_employee',
                'description' => "কর্মী '{$employee->name}' (আইডি: {$employee->employee_id}) এর প্রোফাইল তথ্য হালনাগাদ করা হয়েছে।",
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ]);

            return response()->json([
                'message' => "কর্মীর তথ্য সফলভাবে হালনাগাদ হয়েছে।",
                'employee' => $employee->fresh(['role', 'branch', 'departmentRelation', 'designationRelation', 'reportingManager']),
            ]);
        });
    }

    /**
     * Quick status update workflow (Active, Inactive, On Leave, Suspended, Resigned, Terminated).
     */
    public function updateStatus(Request $request, $id)
    {
        $employee = User::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,on_leave,suspended,resigned,terminated',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($employee->id === $request->user()->id && $validated['status'] !== 'active') {
            return response()->json([
                'message' => 'আপনি নিজের বর্তমান একাউন্টের স্ট্যাটাস পরিবর্তন করতে পারবেন না।'
            ], 422);
        }

        $oldStatus = $employee->status;
        $newStatus = $validated['status'];

        EmployeeStatusHistory::create([
            'user_id' => $employee->id,
            'previous_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $request->user()->id,
            'reason' => $validated['reason'] ?? 'স্ট্যাটাস পরিবর্তন অ্যাকশন।',
            'effective_date' => Carbon::today()->toDateString(),
        ]);

        $employee->update(['status' => $newStatus]);

        // If deactivated, revoke active auth tokens immediately
        if ($newStatus !== 'active') {
            $employee->tokens()->delete();
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'change_employee_status',
            'description' => "কর্মী '{$employee->name}' এর স্ট্যাটাস '{$oldStatus}' থেকে '{$newStatus}' এ পরিবর্তন করা হয়েছে। কারণ: " . ($validated['reason'] ?? 'এন/এ'),
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => "কর্মীর স্ট্যাটাস সফলভাবে '{$newStatus}' এ পরিবর্তন করা হয়েছে।",
            'employee' => $employee->fresh(['role', 'branch']),
        ]);
    }

    /**
     * Branch & Department Transfer Workflow.
     */
    public function transfer(Request $request, $id)
    {
        $employee = User::findOrFail($id);

        $validated = $request->validate([
            'to_branch_id' => 'required|exists:branches,id',
            'to_department_id' => 'nullable|exists:departments,id',
            'transfer_date' => 'required|date',
            'reason' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($employee, $validated, $request) {
            $fromBranchId = $employee->branch_id;
            $fromDeptId = $employee->department_id;

            $toDeptName = null;
            if (!empty($validated['to_department_id'])) {
                $dept = Department::find($validated['to_department_id']);
                $toDeptName = $dept ? $dept->name : null;
            }

            EmployeeTransfer::create([
                'user_id' => $employee->id,
                'from_branch_id' => $fromBranchId,
                'to_branch_id' => $validated['to_branch_id'],
                'from_department_id' => $fromDeptId,
                'to_department_id' => $validated['to_department_id'] ?? $fromDeptId,
                'transfer_date' => $validated['transfer_date'],
                'reason' => $validated['reason'] ?? null,
                'approved_by' => $request->user()->id,
                'status' => 'completed',
            ]);

            $updateData = [
                'branch_id' => $validated['to_branch_id'],
            ];
            if (isset($validated['to_department_id'])) {
                $updateData['department_id'] = $validated['to_department_id'];
                $updateData['department'] = $toDeptName;
            }

            $employee->update($updateData);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'transfer_employee',
                'description' => "কর্মী '{$employee->name}' কে শাখা আইডি {$fromBranchId} থেকে শাখা আইডি {$validated['to_branch_id']} এ স্থানান্তর করা হয়েছে।",
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ]);

            return response()->json([
                'message' => 'কর্মী সফলভাবে স্থানান্তরিত হয়েছেন।',
                'employee' => $employee->fresh(['role', 'branch', 'departmentRelation']),
            ]);
        });
    }

    /**
     * Interactive Organization Hierarchy Tree Structure.
     */
    public function orgChart()
    {
        // Fetch all active employees
        $allEmployees = User::select('id', 'name', 'email', 'phone', 'employee_id', 'department_id', 'designation_id', 'branch_id', 'reporting_manager_id', 'role_id', 'status', 'avatar')
            ->with(['designationRelation:id,name,name_bn', 'departmentRelation:id,name,name_bn', 'branch:id,name,name_bn', 'role:id,name,name_bn'])
            ->where('status', 'active')
            ->get();

        // Index by ID
        $byManager = [];
        $roots = [];

        foreach ($allEmployees as $emp) {
            $mgrId = $emp->reporting_manager_id;
            if ($mgrId) {
                $byManager[$mgrId][] = $emp;
            }
        }

        foreach ($allEmployees as $emp) {
            if (!$emp->reporting_manager_id || !User::where('id', $emp->reporting_manager_id)->exists()) {
                $roots[] = $this->buildOrgNode($emp, $byManager);
            }
        }

        return response()->json([
            'tree' => $roots,
            'total_active' => $allEmployees->count(),
        ]);
    }

    private function buildOrgNode($employee, &$byManager): array
    {
        $node = [
            'id' => $employee->id,
            'name' => $employee->name,
            'email' => $employee->email,
            'phone' => $employee->phone,
            'employee_id' => $employee->employee_id,
            'avatar' => $employee->avatar,
            'designation' => $employee->designationRelation?->name ?: $employee->designation,
            'designation_bn' => $employee->designationRelation?->name_bn,
            'department' => $employee->departmentRelation?->name ?: $employee->department,
            'department_bn' => $employee->departmentRelation?->name_bn,
            'branch' => $employee->branch?->name,
            'role' => $employee->role?->name,
            'subordinates_count' => count($byManager[$employee->id] ?? []),
            'children' => [],
        ];

        if (isset($byManager[$employee->id])) {
            foreach ($byManager[$employee->id] as $child) {
                $node['children'][] = $this->buildOrgNode($child, $byManager);
            }
        }

        return $node;
    }

    /**
     * Check if potentialDescendantId is a descendant of ancestorId.
     */
    private function isDescendant(int $ancestorId, int $potentialDescendantId): bool
    {
        $visited = [];
        $currentId = $potentialDescendantId;

        while ($currentId) {
            if ($currentId === $ancestorId) {
                return true;
            }
            if (in_array($currentId, $visited)) {
                break; // Circular loop detected in existing data
            }
            $visited[] = $currentId;
            $user = User::find($currentId);
            $currentId = $user ? (int) $user->reporting_manager_id : 0;
        }

        return false;
    }

    /**
     * Reset employee password securely.
     */
    public function resetPassword(Request $request, $id)
    {
        $employee = User::findOrFail($id);

        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $employee->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Revoke existing sessions
        $employee->tokens()->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'reset_password',
            'description' => "কর্মী '{$employee->name}' এর পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => "কর্মী '{$employee->name}' এর পাসওয়ার্ড সফলভাবে রিসেট হয়েছে।",
        ]);
    }

    /**
     * Upload an employee document attachment.
     */
    public function uploadDocument(Request $request, $id)
    {
        $employee = User::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'document_type' => 'required|string|in:appointment_letter,nid,passport,certificate,contract,other',
            'file' => 'nullable|file|max:10240', // 10MB max
            'file_url' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
        ]);

        $filePath = '';
        $fileName = '';
        $fileSize = '';

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $fileSize = round($file->getSize() / 1024, 2) . ' KB';
            $path = $file->store('employee_documents/' . $employee->id, 'public');
            $filePath = '/storage/' . $path;
        } elseif ($request->filled('file_url')) {
            $filePath = $validated['file_url'];
            $fileName = $validated['title'];
            $fileSize = 'External Link';
        } else {
            return response()->json(['message' => 'ফাইল আপলোড করুন অথবা ফাইল ইউআরএল প্রদান করুন।'], 422);
        }

        $doc = EmployeeDocument::create([
            'user_id' => $employee->id,
            'title' => $validated['title'],
            'document_type' => $validated['document_type'],
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'notes' => $validated['notes'] ?? null,
            'uploaded_by' => $request->user()->id,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'upload_document',
            'description' => "কর্মী '{$employee->name}' এর জন্য নথি '{$doc->title}' আপলোড করা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'নথি সফলভাবে আপলোড হয়েছে।',
            'document' => $doc->load('uploader:id,name'),
        ], 201);
    }

    /**
     * Delete an employee document attachment.
     */
    public function deleteDocument(Request $request, $id, $docId)
    {
        $employee = User::findOrFail($id);
        $doc = EmployeeDocument::where('user_id', $employee->id)->findOrFail($docId);
        $docTitle = $doc->title;
        $doc->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_document',
            'description' => "কর্মী '{$employee->name}' এর নথি '{$docTitle}' মুছে ফেলা হয়েছে।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'নথি সফলভাবে মুছে ফেলা হয়েছে।',
        ]);
    }

    /**
     * Single employee activity history.
     */
    public function activity($id)
    {
        $employee = User::findOrFail($id);
        $logs = ActivityLog::where('user_id', $employee->id)
            ->latest('id')
            ->paginate(25);

        return response()->json($logs);
    }

    /**
     * Single employee attendance summary and records.
     */
    public function attendance($id, Request $request)
    {
        $employee = User::findOrFail($id);
        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $startOfMonth = Carbon::parse($month . '-01')->startOfMonth()->toDateString();
        $endOfMonth = Carbon::parse($month . '-01')->endOfMonth()->toDateString();

        $records = EmployeeAttendance::with('shift')
            ->where('user_id', $employee->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->orderBy('date', 'desc')
            ->get();

        $summary = [
            'present_days' => $records->whereIn('status', ['present', 'late', 'half_day'])->count(),
            'late_days' => $records->where('status', 'late')->count(),
            'absent_days' => $records->where('status', 'absent')->count(),
            'leave_days' => $records->where('status', 'on_leave')->count(),
            'total_hours' => round($records->sum('working_hours'), 2),
        ];

        return response()->json([
            'month' => $month,
            'summary' => $summary,
            'records' => $records,
        ]);
    }

    // -------------------------------------------------------------
    // RBAC Role & Permission Management Methods (Preserved)
    // -------------------------------------------------------------

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

    public function duplicateRole(Request $request, $id)
    {
        $this->ensureSuperAdmin($request);
        $sourceRole = Role::with('permissions')->findOrFail($id);

        $baseName = $sourceRole->name . ' (Copy)';
        $baseSlug = Str::slug($baseName);
        $slug = $baseSlug ?: 'role-copy-' . time();
        $counter = 1;
        while (Role::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $newRole = Role::create([
            'name' => $baseName,
            'name_bn' => ($sourceRole->name_bn ?: $sourceRole->name) . ' (অনুলিপি)',
            'slug' => $slug,
            'description' => "কপি করা হয়েছে: {$sourceRole->name} - " . ($sourceRole->description ?: ''),
            'is_system' => false,
        ]);

        $permissionIds = $sourceRole->permissions->pluck('id')->toArray();
        $newRole->permissions()->sync($permissionIds);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'duplicate_role',
            'description' => "সুপার অ্যাডমিন '{$sourceRole->name}' ভূমিকা ডুপ্লিকেট করে '{$newRole->name}' তৈরি করেছেন।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => "ভূমিকা '{$sourceRole->name}' সফলভাবে ডুপ্লিকেট করা হয়েছে।",
            'role' => $newRole->fresh(['permissions'])->loadCount('users'),
        ], 201);
    }

    public function destroyRole(Request $request, $id)
    {
        $this->ensureSuperAdmin($request);
        $role = Role::findOrFail($id);

        $systemRoleSlugs = [
            'super-admin', 'admin', 'manager', 'cashier', 'branch-manager',
            'inventory-manager', 'purchase-manager', 'accountant', 'sales-staff',
            'customer-service', 'warehouse-staff', 'auditor'
        ];

        if ($role->is_system || in_array($role->slug, $systemRoleSlugs)) {
            return response()->json([
                'message' => 'সুপার শপের সংরক্ষিত ও সিস্টেমের ডিফল্ট ভূমিকা (System Role) মুছে ফেলা সম্ভব নয়।'
            ], 422);
        }

        $usersCount = $role->users()->count();
        if ($usersCount > 0) {
            return response()->json([
                'message' => "এই ভূমিকায় বর্তমানে {$usersCount} জন সক্রিয় কর্মী নিযুক্ত রয়েছেন। নির্ভরতা সুরক্ষার (Dependency Protection) কারণে ভূমিকা মুছে ফেলা সম্ভব নয়। অনুগ্রহ করে কর্মীদের অন্য ভূমিকায় স্থানান্তর করুন।"
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

        // Never destroy historical sales or transactions!
        $salesCount = $employee->sales()->count();
        $purchasesCount = $employee->purchases()->count();
        if ($salesCount > 0 || $purchasesCount > 0) {
            $employee->update(['status' => 'resigned']);
            $employee->tokens()->delete();
            return response()->json([
                'message' => "কর্মীর সাথে {$salesCount} টি বিক্রয় ও {$purchasesCount} টি ক্রয়ের লেনদেন জড়িত রয়েছে। অডিট সুরক্ষার স্বার্থে কর্মীকে মুছে ফেলার পরিবর্তে একাউন্ট 'পদত্যাগকৃত (Resigned)' হিসেবে সংরক্ষণ করা হয়েছে।"
            ]);
        }

        $name = $employee->name;
        $employee->delete();
        ActivityLog::log('delete', "কর্মী '{$name}' কে অপসারণ করা হয়েছে।");

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
        $preserved = 0;

        foreach ($ids as $id) {
            $emp = User::with(['role', 'sales'])->find($id);
            if ($emp && $emp->id !== $currentUserId && $emp->role?->slug !== 'super-admin') {
                if ($emp->sales()->count() > 0) {
                    $emp->update(['status' => 'resigned']);
                    $emp->tokens()->delete();
                    $preserved++;
                } else {
                    $emp->delete();
                    $deleted++;
                }
            }
        }

        if ($deleted > 0 || $preserved > 0) {
            ActivityLog::log('delete', "{$deleted} জন কর্মী অপসারণ এবং {$preserved} জন লেনদেনযুক্ত কর্মী সংরক্ষিত করা হয়েছে।");
        }

        $msg = "{$deleted} জন কর্মী সফলভাবে মুছে ফেলা হয়েছে।";
        if ($preserved > 0) {
            $msg .= " ({$preserved} জন কর্মীর সাথে লেনদেনের ইতিহাস থাকায় তাদের পদত্যাগকৃত হিসেবে নিরাপদ রাখা হয়েছে)";
        }

        return response()->json([
            'message' => $msg,
            'deleted_count' => $deleted,
            'preserved_count' => $preserved,
        ]);
    }
}
