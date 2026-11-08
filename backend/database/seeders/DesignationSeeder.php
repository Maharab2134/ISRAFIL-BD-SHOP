<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Designation;
use Illuminate\Database\Seeder;

class DesignationSeeder extends Seeder
{
    public function run(): void
    {
        $deptMap = Department::pluck('id', 'code')->toArray();

        $designations = [
            // Management
            ['dept' => 'DEP-MGMT', 'name' => 'Business Manager', 'name_bn' => 'বিজনেস ম্যানেজার', 'code' => 'DES-MGMT-BM', 'description' => 'সার্বিক ব্যবসা তদারকি ও কৌশলগত ব্যবস্থাপনা।'],
            ['dept' => 'DEP-MGMT', 'name' => 'Store Manager', 'name_bn' => 'স্টোর ম্যানেজার', 'code' => 'DES-MGMT-SM', 'description' => 'দৈনিক স্টোর পরিচালনা ও সমন্বয়কারী।'],
            ['dept' => 'DEP-MGMT', 'name' => 'Assistant Manager', 'name_bn' => 'সহকারী ম্যানেজার', 'code' => 'DES-MGMT-AM', 'description' => 'স্টোর পরিচালনায় ম্যানেজারের সহায়তা প্রদান।'],
            ['dept' => 'DEP-MGMT', 'name' => 'Branch Manager', 'name_bn' => 'শাখা ব্যবস্থাপক', 'code' => 'DES-MGMT-BRM', 'description' => 'নির্দিষ্ট আউটলেট বা শাখার পূর্ণ ব্যবস্থাপনা।'],

            // Sales & POS
            ['dept' => 'DEP-SALES', 'name' => 'Senior Cashier', 'name_bn' => 'সিনিয়র ক্যাশিয়ার', 'code' => 'DES-SALES-SC', 'description' => 'কাউন্টার ক্যাশ ক্লিয়ারেন্স ও দ্রুত চেকআউট।'],
            ['dept' => 'DEP-SALES', 'name' => 'Cashier', 'name_bn' => 'ক্যাশিয়ার', 'code' => 'DES-SALES-CSH', 'description' => 'কাউন্টার পিওএস বিক্রয় ও রসিদ প্রদান।'],
            ['dept' => 'DEP-SALES', 'name' => 'Sales Supervisor', 'name_bn' => 'বিক্রয় সুপারভাইজার', 'code' => 'DES-SALES-SS', 'description' => 'বিক্রয়কর্মী তদারকি ও ফ্লোর ডিসপ্লে নিয়ন্ত্রণ।'],
            ['dept' => 'DEP-SALES', 'name' => 'Sales Executive', 'name_bn' => 'সেলস এক্সিকিউটিভ', 'code' => 'DES-SALES-SE', 'description' => 'গ্রাহক সহায়তা ও আউটলেট পণ্য বিক্রয়।'],
            ['dept' => 'DEP-SALES', 'name' => 'Sales Associate', 'name_bn' => 'সেলস সহযোগী', 'code' => 'DES-SALES-SA', 'description' => 'আউটলেট পণ্য সেলফে সাজানো ও গ্রাহক পথপ্রদর্শন।'],

            // Inventory & Stock
            ['dept' => 'DEP-INVENTORY', 'name' => 'Inventory Manager', 'name_bn' => 'ইনভেন্টরি ম্যানেজার', 'code' => 'DES-INV-MGR', 'description' => 'মজুদ পণ্যের সমন্বয় ও ইনভেন্টরি নিয়ন্ত্রণ।'],
            ['dept' => 'DEP-INVENTORY', 'name' => 'Stock Controller', 'name_bn' => 'স্টক নিয়ন্ত্রক', 'code' => 'DES-INV-SC', 'description' => 'স্টক কাউন্টিং, ঘাটতি ট্র্যাকিং ও অডিট।'],
            ['dept' => 'DEP-INVENTORY', 'name' => 'Inventory Assistant', 'name_bn' => 'ইনভেন্টরি সহকারী', 'code' => 'DES-INV-AST', 'description' => 'পণ্য গ্রহণ ও স্টকে এন্ট্রি সহযোগিতা।'],

            // Purchase & Procurement
            ['dept' => 'DEP-PURCHASE', 'name' => 'Purchase Manager', 'name_bn' => 'পারচেজ ম্যানেজার', 'code' => 'DES-PUR-MGR', 'description' => 'পাইকারি ক্রয় ও সাপ্লায়ার রেট নির্ধারণ।'],
            ['dept' => 'DEP-PURCHASE', 'name' => 'Procurement Officer', 'name_bn' => 'সংগ্রহ কর্মকর্তা', 'code' => 'DES-PUR-PRO', 'description' => 'সাপ্লায়ার অর্ডার ও পণ্য চালান নিশ্চিতকরণ।'],

            // Accounts & Finance
            ['dept' => 'DEP-ACCOUNTS', 'name' => 'Accountant', 'name_bn' => 'অ্যাকাউন্ট্যান্ট', 'code' => 'DES-ACC-ACT', 'description' => 'দৈনিক আয়-ব্যয়, চালান ও ব্যাংকিং হিসাব।'],
            ['dept' => 'DEP-ACCOUNTS', 'name' => 'Accounts Executive', 'name_bn' => 'অ্যাকাউন্টস এক্সিকিউটিভ', 'code' => 'DES-ACC-EXE', 'description' => 'বিল ভাউচার যাচাই ও লেজার হিসাব।'],
            ['dept' => 'DEP-ACCOUNTS', 'name' => 'Finance Officer', 'name_bn' => 'অর্থ কর্মকর্তা', 'code' => 'DES-ACC-FO', 'description' => 'ক্যাশ ফ্লো ও পেমেন্ট রিকনসিলিয়েশন।'],

            // Customer Service
            ['dept' => 'DEP-CS', 'name' => 'Customer Service Executive', 'name_bn' => 'গ্রাহক সেবা এক্সিকিউটিভ', 'code' => 'DES-CS-EXE', 'description' => 'মেম্বারশিপ, লয়্যালটি ও গ্রাহক মতামত সমাধান।'],
            ['dept' => 'DEP-CS', 'name' => 'Customer Support Officer', 'name_bn' => 'কাস্টমার সাপোর্ট অফিসার', 'code' => 'DES-CS-OFF', 'description' => 'ফোন ও ইন-স্টোর গ্রাহক সমস্যার সমাধান।'],

            // Warehouse & Logistics
            ['dept' => 'DEP-LOGISTICS', 'name' => 'Warehouse Manager', 'name_bn' => 'ওয়্যারহাউস ম্যানেজার', 'code' => 'DES-LOG-MGR', 'description' => 'কেন্দ্রীয় গুদাম ও ডেলিভারি নিয়ন্ত্রণ।'],
            ['dept' => 'DEP-LOGISTICS', 'name' => 'Warehouse Supervisor', 'name_bn' => 'ওয়্যারহাউস সুপারভাইজার', 'code' => 'DES-LOG-SUP', 'description' => 'লোডিং-আনলোডিং ও র্যাক অর্গানাইজেশন।'],
            ['dept' => 'DEP-LOGISTICS', 'name' => 'Warehouse Assistant', 'name_bn' => 'ওয়্যারহাউস সহকারী', 'code' => 'DES-LOG-AST', 'description' => 'পণ্য প্যাকিং ও ডেলিভারি সরবরাহ।'],

            // Human Resources (HR)
            ['dept' => 'DEP-HR', 'name' => 'HR Manager', 'name_bn' => 'এইচআর ম্যানেজার', 'code' => 'DES-HR-MGR', 'description' => 'কর্মী নীতি, নিয়োগ ও কর্মপরিবেশ তদারকি।'],
            ['dept' => 'DEP-HR', 'name' => 'HR Executive', 'name_bn' => 'এইচআর এক্সিকিউটিভ', 'code' => 'DES-HR-EXE', 'description' => 'হাজিরা, ছুটি ও কর্মী নথি ব্যবস্থাপনা।'],

            // IT & Technical Support
            ['dept' => 'DEP-IT', 'name' => 'IT Specialist', 'name_bn' => 'আইটি বিশেষজ্ঞ', 'code' => 'DES-IT-SPEC', 'description' => 'সফটওয়্যার ও সিস্টেম ইন্টিগ্রেশন রক্ষণাবেক্ষণ।'],
            ['dept' => 'DEP-IT', 'name' => 'Network Support', 'name_bn' => 'নেটওয়ার্ক সাপোর্ট', 'code' => 'DES-IT-NET', 'description' => 'লোকাল নেটওয়ার্ক, রাউটার ও প্রিন্টার সাপোর্ট।'],
        ];

        foreach ($designations as $des) {
            $deptId = $deptMap[$des['dept']] ?? null;
            Designation::updateOrCreate(
                ['code' => $des['code']],
                [
                    'department_id' => $deptId,
                    'name' => $des['name'],
                    'name_bn' => $des['name_bn'],
                    'description' => $des['description'],
                    'status' => 'active',
                ]
            );
        }
    }
}

