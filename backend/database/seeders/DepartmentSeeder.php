<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@israfilbd.com')->first();
        $adminId = $adminUser ? $adminUser->id : null;

        $departments = [
            [
                'name' => 'Management',
                'name_bn' => 'ম্যানেজমেন্ট',
                'code' => 'DEP-MGMT',
                'description' => 'শীর্ষ নির্বাহী পরিচালনা, ব্যবসায়িক কৌশল ও নীতিনির্ধারণী সিদ্ধান্ত গ্রহণ।',
                'head_id' => $adminId,
                'status' => 'active',
            ],
            [
                'name' => 'Administration',
                'name_bn' => 'প্রশাসন',
                'code' => 'DEP-ADMIN',
                'description' => 'দৈনিক অফিস ও দোকান প্রশাসন, প্রাতিষ্ঠানিক সুযোগ-সুবিধা ও নীতি বাস্তবায়ন।',
                'head_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'Sales & POS',
                'name_bn' => 'বিক্রয় ও পিওএস',
                'code' => 'DEP-SALES',
                'description' => 'কাউন্টার বিক্রয়, ক্যাশিয়ার অপারেশন, বিলিং এবং গ্রাহক ক্রয় সহায়তা।',
                'head_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'Inventory & Stock',
                'name_bn' => 'ইনভেন্টরি ও স্টক',
                'code' => 'DEP-INVENTORY',
                'description' => 'পণ্যের মজুদ ট্র্যাকিং, স্টক অডিট, এক্সপায়ারি মনিটরিং ও সমন্বয়।',
                'head_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'Purchase & Procurement',
                'name_bn' => 'ক্রয় ও সংগ্রহ',
                'code' => 'DEP-PURCHASE',
                'description' => 'পাইকারি পণ্য সংগ্রহ, সরবরাহকারী লিয়াজোঁ ও পারচেজ অর্ডার নির্বাহ।',
                'head_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'Accounts & Finance',
                'name_bn' => 'হিসাবরক্ষণ ও অর্থ',
                'code' => 'DEP-ACCOUNTS',
                'description' => 'দৈনিক আর্থিক লেনদেন, ক্যাশ ফ্লো, বকেয়া খাতা, ট্যাক্স ও আয়-ব্যয় অডিট।',
                'head_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'Customer Service',
                'name_bn' => 'গ্রাহক সেবা',
                'code' => 'DEP-CS',
                'description' => 'মেম্বারশিপ যাচাই, লয়্যালটি কার্ড ব্যবস্থাপনা, গ্রাহক অভিযোগ ও অনুসন্ধান সমাধান।',
                'head_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'Warehouse & Logistics',
                'name_bn' => 'ওয়্যারহাউস ও লজিস্টিকস',
                'code' => 'DEP-LOGISTICS',
                'description' => 'কেন্দ্রীয় গুদাম ব্যবস্থাপনা, পণ্য পরিবহন ও আন্তঃশাখা পণ্য স্থানান্তর।',
                'head_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'Marketing',
                'name_bn' => 'মার্কেটিং',
                'code' => 'DEP-MKT',
                'description' => 'প্রচারণা, মৌসুমী ডিসকাউন্ট অফার, ক্যাম্পেইন ও ব্যান্ডিং প্রসার।',
                'head_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'IT & Technical Support',
                'name_bn' => 'আইটি ও কারিগরি সহায়তা',
                'code' => 'DEP-IT',
                'description' => 'পিওএস হার্ডওয়্যার, নেটওয়ার্ক, বারকোড স্ক্যানার ও সফটওয়্যার ব্যবস্থাপনা।',
                'head_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'Security & Compliance',
                'name_bn' => 'নিরাপত্তা ও কমপ্লায়েন্স',
                'code' => 'DEP-SECURITY',
                'description' => 'স্টোর নিরাপত্তা, সিসিটিভি নজরদারি ও সরকারি লাইসেন্স কমপ্লায়েন্স।',
                'head_id' => null,
                'status' => 'active',
            ],
            [
                'name' => 'Human Resources (HR)',
                'name_bn' => 'মানবসম্পদ বিভাগ',
                'code' => 'DEP-HR',
                'description' => 'কর্মী নিয়োগ, হাজিরা, ছুটি, রোস্টার, প্রশিক্ষণ ও প্রাতিষ্ঠানিক আচরণবিধি।',
                'head_id' => null,
                'status' => 'active',
            ],
        ];

        foreach ($departments as $dept) {
            Department::updateOrCreate(
                ['code' => $dept['code']],
                $dept
            );
        }
    }
}

