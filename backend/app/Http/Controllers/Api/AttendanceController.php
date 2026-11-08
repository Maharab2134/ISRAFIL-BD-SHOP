<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\EmployeeAttendance;
use App\Models\User;
use App\Models\WorkShift;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());

        $attendances = EmployeeAttendance::with(['user.role', 'user.branch', 'user.departmentRelation', 'shift'])
            ->whereDate('date', $date)
            ->when($request->filled('branch_id'), function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('department_id'), function ($q) use ($request) {
                $q->whereHas('user', function ($sub) use ($request) {
                    $sub->where('department_id', $request->department_id);
                });
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->whereHas('user', function ($sub) use ($request) {
                    $sub->where('name', 'like', "%{$request->search}%")
                        ->orWhere('employee_id', 'like', "%{$request->search}%");
                });
            })
            ->latest('id')
            ->get();

        // Calculate summary counts for the day
        $allActiveCount = User::where('status', 'active')->count();
        $presentCount = EmployeeAttendance::whereDate('date', $date)->whereIn('status', ['present', 'late', 'half_day'])->count();
        $lateCount = EmployeeAttendance::whereDate('date', $date)->where('status', 'late')->count();
        $absentCount = EmployeeAttendance::whereDate('date', $date)->where('status', 'absent')->count();
        $onLeaveCount = EmployeeAttendance::whereDate('date', $date)->where('status', 'on_leave')->count();

        return response()->json([
            'date' => $date,
            'summary' => [
                'total_employees' => $allActiveCount,
                'present' => $presentCount,
                'late' => $lateCount,
                'absent' => $absentCount,
                'on_leave' => $onLeaveCount,
            ],
            'attendances' => $attendances,
        ]);
    }

    public function record(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'shift_id' => 'nullable|exists:work_shifts,id',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'status' => 'required|in:present,absent,late,half_day,on_leave,holiday',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $branchId = $user->branch_id;

        // Calculate working hours if both check_in and check_out provided
        $workingHours = 0;
        $lateMinutes = 0;

        if (!empty($validated['check_in']) && !empty($validated['check_out'])) {
            $in = Carbon::createFromFormat('H:i', $validated['check_in']);
            $out = Carbon::createFromFormat('H:i', $validated['check_out']);
            if ($out->greaterThan($in)) {
                $workingHours = round($in->diffInMinutes($out) / 60, 2);
            }
        }

        // Calculate late minutes if shift exists
        if (!empty($validated['check_in']) && !empty($validated['shift_id'])) {
            $shift = WorkShift::find($validated['shift_id']);
            if ($shift) {
                $shiftStart = Carbon::createFromFormat('H:i:s', $shift->start_time);
                $actualIn = Carbon::createFromFormat('H:i', $validated['check_in']);
                if ($actualIn->greaterThan($shiftStart)) {
                    $lateMinutes = $shiftStart->diffInMinutes($actualIn);
                    if ($lateMinutes > 15 && $validated['status'] === 'present') {
                        $validated['status'] = 'late';
                    }
                }
            }
        }

        $attendance = EmployeeAttendance::updateOrCreate(
            [
                'user_id' => $user->id,
                'date' => $validated['date'],
            ],
            [
                'branch_id' => $branchId,
                'shift_id' => $validated['shift_id'] ?? null,
                'check_in' => $validated['check_in'] ?? null,
                'check_out' => $validated['check_out'] ?? null,
                'status' => $validated['status'],
                'late_minutes' => $lateMinutes,
                'working_hours' => $workingHours,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()->id,
            ]
        );

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'record_attendance',
            'description' => "কর্মী '{$user->name}' এর তারিখ {$validated['date']} এর হাজিরা রেকর্ড করা হয়েছে (স্ট্যাটাস: {$validated['status']})।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => 'হাজিরা সফলভাবে সংরক্ষিত হয়েছে।',
            'attendance' => $attendance->load(['user.role', 'user.branch', 'user.departmentRelation', 'shift']),
        ]);
    }

    public function checkIn(Request $request)
    {
        $userId = $request->input('user_id', $request->user()->id);
        $user = User::findOrFail($userId);
        $today = Carbon::today()->toDateString();
        $nowTime = Carbon::now()->format('H:i');

        $defaultShift = WorkShift::where('status', 'active')->first();
        $shiftId = $defaultShift ? $defaultShift->id : null;

        $attendance = EmployeeAttendance::updateOrCreate(
            [
                'user_id' => $user->id,
                'date' => $today,
            ],
            [
                'branch_id' => $user->branch_id,
                'shift_id' => $shiftId,
                'check_in' => $nowTime,
                'status' => 'present',
                'created_by' => $request->user()->id,
            ]
        );

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'check_in',
            'description' => "কর্মী '{$user->name}' চেক-ইন করেছেন ({$nowTime})।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => "চেক-ইন সফল হয়েছে ({$nowTime})!",
            'attendance' => $attendance->load(['user.role', 'user.branch', 'shift']),
        ]);
    }

    public function checkOut(Request $request)
    {
        $userId = $request->input('user_id', $request->user()->id);
        $user = User::findOrFail($userId);
        $today = Carbon::today()->toDateString();
        $nowTime = Carbon::now()->format('H:i');

        $attendance = EmployeeAttendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance) {
            return response()->json([
                'message' => 'আজকের কোনো চেক-ইন রেকর্ড পাওয়া যায়নি। প্রথমে চেক-ইন করুন।',
            ], 422);
        }

        $workingHours = 0;
        if ($attendance->check_in) {
            $in = Carbon::createFromFormat('H:i:s', strlen($attendance->check_in) === 5 ? $attendance->check_in . ':00' : $attendance->check_in);
            $out = Carbon::createFromFormat('H:i', $nowTime);
            if ($out->greaterThan($in)) {
                $workingHours = round($in->diffInMinutes($out) / 60, 2);
            }
        }

        $attendance->update([
            'check_out' => $nowTime,
            'working_hours' => $workingHours,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'check_out',
            'description' => "কর্মী '{$user->name}' চেক-আউট করেছেন ({$nowTime})। কর্মঘণ্টা: {$workingHours} ঘণ্টা।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        return response()->json([
            'message' => "চেক-আউট সফল হয়েছে ({$nowTime})! মোট কর্মঘণ্টা: {$workingHours} ঘণ্টা।",
            'attendance' => $attendance->load(['user.role', 'user.branch', 'shift']),
        ]);
    }

    public function shifts()
    {
        $shifts = WorkShift::where('status', 'active')->orderBy('start_time')->get();
        return response()->json($shifts);
    }

    public function monthlyReport(Request $request)
    {
        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $startOfMonth = Carbon::parse($month . '-01')->startOfMonth()->toDateString();
        $endOfMonth = Carbon::parse($month . '-01')->endOfMonth()->toDateString();

        $employees = User::with(['role', 'branch', 'departmentRelation', 'designationRelation'])
            ->where('status', 'active')
            ->when($request->filled('branch_id'), function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            })
            ->when($request->filled('department_id'), function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            })
            ->orderBy('name')
            ->get();

        $report = [];
        foreach ($employees as $emp) {
            $records = EmployeeAttendance::where('user_id', $emp->id)
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->get();

            $present = $records->whereIn('status', ['present', 'late', 'half_day'])->count();
            $late = $records->where('status', 'late')->count();
            $absent = $records->where('status', 'absent')->count();
            $onLeave = $records->where('status', 'on_leave')->count();
            $totalHours = $records->sum('working_hours');

            $report[] = [
                'employee' => $emp,
                'present_days' => $present,
                'late_days' => $late,
                'absent_days' => $absent,
                'leave_days' => $onLeave,
                'total_hours' => round($totalHours, 2),
            ];
        }

        return response()->json([
            'month' => $month,
            'report' => $report,
        ]);
    }
}

