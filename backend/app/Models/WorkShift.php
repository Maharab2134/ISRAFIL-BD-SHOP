<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkShift extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_bn',
        'shift_code',
        'start_time',
        'end_time',
        'status',
    ];

    public function attendances()
    {
        return $this->hasMany(EmployeeAttendance::class, 'shift_id');
    }
}

