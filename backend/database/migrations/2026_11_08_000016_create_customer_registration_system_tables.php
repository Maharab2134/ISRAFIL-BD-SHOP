<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Dynamic Form Builder Settings Table
        Schema::create('customer_registration_forms', function (Blueprint $table) {
            $table->id();
            $table->string('title')->default('গ্রাহক মেম্বারশিপ ও কাস্টমার রেজিস্ট্রেশন');
            $table->string('title_en')->default('Customer Membership & Registration');
            $table->text('description')->nullable();
            $table->text('description_en')->nullable();
            $table->integer('welcome_points')->default(50);
            $table->boolean('auto_approve')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('theme_color')->default('#4F46E5');
            $table->string('slug')->default('join-customer')->unique();
            $table->json('fields'); // Array of form field definitions
            $table->timestamps();
        });

        // 2. Customer Registration Requests Queue Table
        Schema::create('customer_registration_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique()->index();
            $table->string('name');
            $table->string('phone')->index();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->date('dob')->nullable();
            $table->string('gender')->nullable();
            $table->string('nid')->nullable();
            $table->json('custom_data')->nullable(); // Store any dynamic custom fields
            $table->string('status')->default('pending')->index(); // pending, approved, rejected
            $table->text('rejection_reason')->nullable();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->integer('welcome_points_awarded')->default(0);
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        // Seed default registration form configuration
        $defaultFields = [
            [
                'id' => 'name',
                'label' => 'Full Name',
                'label_bn' => 'পূর্ণ নাম',
                'type' => 'text',
                'placeholder' => 'আপনার নাম লিখুন',
                'required' => true,
                'enabled' => true,
                'is_system' => true,
            ],
            [
                'id' => 'phone',
                'label' => 'Mobile Number',
                'label_bn' => 'মোবাইল নম্বর',
                'type' => 'tel',
                'placeholder' => '০১৭XXXXXXXX',
                'required' => true,
                'enabled' => true,
                'is_system' => true,
            ],
            [
                'id' => 'email',
                'label' => 'Email Address',
                'label_bn' => 'ইমেইল ঠিকানা (ঐচ্ছিক)',
                'type' => 'email',
                'placeholder' => 'example@mail.com',
                'required' => false,
                'enabled' => true,
                'is_system' => false,
            ],
            [
                'id' => 'address',
                'label' => 'Address / Area',
                'label_bn' => 'ঠিকানা / এলাকা',
                'type' => 'textarea',
                'placeholder' => 'বাসা/রোড, এলাকা ও থানা লিখুন',
                'required' => false,
                'enabled' => true,
                'is_system' => false,
            ],
            [
                'id' => 'dob',
                'label' => 'Date of Birth',
                'label_bn' => 'জন্ম তারিখ',
                'type' => 'date',
                'placeholder' => '',
                'required' => false,
                'enabled' => true,
                'is_system' => false,
            ],
            [
                'id' => 'gender',
                'label' => 'Gender',
                'label_bn' => 'লিঙ্গ (Gender)',
                'type' => 'select',
                'placeholder' => 'লিঙ্গ নির্বাচন করুন',
                'options' => ['পুরুষ (Male)', 'নারী (Female)', 'অন্যান্য (Other)'],
                'required' => false,
                'enabled' => true,
                'is_system' => false,
            ],
            [
                'id' => 'nid',
                'label' => 'National ID / NID',
                'label_bn' => 'জাতীয় পরিচয়পত্র (NID) নম্বর',
                'type' => 'text',
                'placeholder' => 'জাতীয় পরিচয়পত্র নম্বর (যদি থাকে)',
                'required' => false,
                'enabled' => false,
                'is_system' => false,
            ],
            [
                'id' => 'notes',
                'label' => 'Additional Notes',
                'label_bn' => 'মন্তব্য বা অতিরিক্ত তথ্য',
                'type' => 'textarea',
                'placeholder' => 'কোনো বিশেষ তথ্য থাকলে জানান',
                'required' => false,
                'enabled' => false,
                'is_system' => false,
            ],
        ];

        DB::table('customer_registration_forms')->insert([
            'title' => 'গ্রাহক মেম্বারশিপ ও কাস্টমার রেজিস্ট্রেশন',
            'title_en' => 'Customer Membership & Registration',
            'description' => 'ইসরাফিল বিডি শপের মেম্বারশিপ প্রোগ্রামে যুক্ত হোন এবং প্রতিটি কেনাকাটায় বিশেষ ছাড় ও লয়্যালটি পয়েন্ট উপভোগ করুন!',
            'description_en' => 'Join Israfil BD Shop membership to earn loyalty rewards and enjoy exclusive store discounts!',
            'welcome_points' => 0,
            'auto_approve' => false,
            'is_active' => true,
            'theme_color' => '#4F46E5',
            'slug' => 'join-customer',
            'fields' => json_encode($defaultFields),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_registration_requests');
        Schema::dropIfExists('customer_registration_forms');
    }
};

