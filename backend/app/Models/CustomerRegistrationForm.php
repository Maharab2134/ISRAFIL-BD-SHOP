<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerRegistrationForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_en',
        'description',
        'description_en',
        'welcome_points',
        'auto_approve',
        'is_active',
        'theme_color',
        'slug',
        'fields',
    ];

    protected $casts = [
        'fields' => 'array',
        'welcome_points' => 'integer',
        'auto_approve' => 'boolean',
        'is_active' => 'boolean',
    ];
}
