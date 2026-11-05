<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'customer_id',
        'customer_name',
        'customer_phone',
        'user_id',
        'sale_date',
        'total_items',
        'subtotal',
        'product_discount_total',
        'order_discount_type',
        'order_discount_rate',
        'order_discount_amount',
        'tax_rate',
        'tax_amount',
        'grand_total',
        'points_earned',
        'points_redeemed',
        'points_discount_amount',
        'customer_points_balance',
        'total_cost',
        'total_profit',
        'paid_amount',
        'change_amount',
        'due_amount',
        'payment_status',
        'sale_status',
        'notes',
    ];

    protected $casts = [
        'sale_date' => 'datetime',
        'subtotal' => 'decimal:2',
        'product_discount_total' => 'decimal:2',
        'order_discount_rate' => 'decimal:2',
        'order_discount_amount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'points_earned' => 'integer',
        'points_redeemed' => 'integer',
        'points_discount_amount' => 'decimal:2',
        'customer_points_balance' => 'integer',
        'total_cost' => 'decimal:2',
        'total_profit' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments()
    {
        return $this->hasMany(SalePayment::class);
    }
}

