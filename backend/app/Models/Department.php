<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'name_bn',
        'code',
        'description',
        'head_id',
        'branch_id',
        'status',
    ];

    public function head()
    {
        return $this->belongsTo(User::class, 'head_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function employees()
    {
        return $this->hasMany(User::class, 'department_id');
    }

    public function designations()
    {
        return $this->hasMany(Designation::class, 'department_id');
    }
}

