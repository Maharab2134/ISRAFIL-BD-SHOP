<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_bn',
        'phone',
        'email',
        'address',
        'opening_balance',
        'current_balance',
        'credit_limit',
        'loyalty_points',
        'status',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'credit_limit' => 'decimal:2',
        'loyalty_points' => 'integer',
    ];

    protected static function booted()
    {
        static::deleting(function ($customer) {
            $rawPhone = preg_replace('/[^0-9]/', '', (string) $customer->phone);
            $trimmedPhone = ltrim($rawPhone, '0');
            if (str_starts_with($trimmedPhone, '880')) {
                $trimmedPhone = substr($trimmedPhone, 3);
            }
            $phoneVariants = array_unique(array_filter([
                $customer->phone,
                $rawPhone,
                $trimmedPhone,
                '0' . $trimmedPhone,
                '880' . $trimmedPhone,
                '+880' . $trimmedPhone,
            ]));

            // Rule 1: Completely delete any linked registration request / approval record
            CustomerRegistrationRequest::where('customer_id', $customer->id)
                ->orWhereIn('phone', $phoneVariants)
                ->delete();

            // Remove payments
            CustomerPayment::where('customer_id', $customer->id)->delete();
        });
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function payments()
    {
        return $this->hasMany(CustomerPayment::class);
    }
}

