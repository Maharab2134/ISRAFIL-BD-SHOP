<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerRegistrationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number',
        'name',
        'phone',
        'email',
        'address',
        'dob',
        'gender',
        'nid',
        'custom_data',
        'status',
        'rejection_reason',
        'customer_id',
        'reviewed_by',
        'reviewed_at',
        'welcome_points_awarded',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'custom_data' => 'array',
        'dob' => 'date',
        'reviewed_at' => 'datetime',
        'welcome_points_awarded' => 'integer',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
