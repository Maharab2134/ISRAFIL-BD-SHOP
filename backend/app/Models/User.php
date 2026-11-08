<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'phone',
        'status',
        'avatar',
        'last_login_at',
        'employee_id',
        'department',
        'designation',
        'branch_id',
        'joining_date',
        // Enterprise HR fields
        'department_id',
        'designation_id',
        'reporting_manager_id',
        'employment_type',
        'father_name',
        'mother_name',
        'dob',
        'gender',
        'present_address',
        'permanent_address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'salary',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'joining_date' => 'date',
            'dob' => 'date',
            'salary' => 'decimal:2',
            'password' => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function departmentRelation()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function designationRelation()
    {
        return $this->belongsTo(Designation::class, 'designation_id');
    }

    public function reportingManager()
    {
        return $this->belongsTo(User::class, 'reporting_manager_id');
    }

    public function subordinates()
    {
        return $this->hasMany(User::class, 'reporting_manager_id');
    }

    public function attendances()
    {
        return $this->hasMany(EmployeeAttendance::class);
    }

    public function transfers()
    {
        return $this->hasMany(EmployeeTransfer::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(EmployeeStatusHistory::class);
    }

    public function documents()
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function hasPermission(string $permissionSlug): bool
    {
        if (!$this->role) {
            return false;
        }

        // Super Admin bypasses all checks
        if ($this->role->slug === 'super-admin') {
            return true;
        }

        return $this->role->permissions()->where('slug', $permissionSlug)->exists();
    }
}
