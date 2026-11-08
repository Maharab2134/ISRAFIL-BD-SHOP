<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerRegistrationForm;
use App\Models\CustomerRegistrationRequest;
use App\Models\Setting;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class CustomerRegistrationController extends Controller
{
    /**
     * Get active registration form configuration and shop branding.
     * Accessible publicly (for customer scan page) and by admin.
     */
    public function getFormConfig()
    {
        $form = CustomerRegistrationForm::where('is_active', true)->first();

        if (!$form) {
            $form = CustomerRegistrationForm::first();
        }

        if (!$form) {
            // Seed a default form on the fly if table was fresh
            $defaultFields = [
                ['id' => 'name', 'label' => 'Full Name', 'label_bn' => 'পূর্ণ নাম', 'type' => 'text', 'placeholder' => 'আপনার নাম লিখুন', 'required' => true, 'enabled' => true, 'is_system' => true],
                ['id' => 'phone', 'label' => 'Mobile Number', 'label_bn' => 'মোবাইল নম্বর', 'type' => 'tel', 'placeholder' => '০১৭XXXXXXXX', 'required' => true, 'enabled' => true, 'is_system' => true],
                ['id' => 'email', 'label' => 'Email Address', 'label_bn' => 'ইমেইল ঠিকানা (ঐচ্ছিক)', 'type' => 'email', 'placeholder' => 'example@mail.com', 'required' => false, 'enabled' => true, 'is_system' => false],
                ['id' => 'address', 'label' => 'Address / Area', 'label_bn' => 'ঠিকানা / এলাকা', 'type' => 'textarea', 'placeholder' => 'বাসা/রোড, এলাকা ও থানা লিখুন', 'required' => false, 'enabled' => true, 'is_system' => false],
                ['id' => 'dob', 'label' => 'Date of Birth', 'label_bn' => 'জন্ম তারিখ', 'type' => 'date', 'placeholder' => '', 'required' => false, 'enabled' => true, 'is_system' => false],
                ['id' => 'gender', 'label' => 'Gender', 'label_bn' => 'লিঙ্গ (Gender)', 'type' => 'select', 'placeholder' => 'লিঙ্গ নির্বাচন করুন', 'options' => ['পুরুষ (Male)', 'নারী (Female)', 'অন্যান্য (Other)'], 'required' => false, 'enabled' => true, 'is_system' => false],
                ['id' => 'nid', 'label' => 'National ID / NID', 'label_bn' => 'জাতীয় পরিচয়পত্র (NID) নম্বর', 'type' => 'text', 'placeholder' => 'জাতীয় পরিচয়পত্র নম্বর (যদি থাকে)', 'required' => false, 'enabled' => false, 'is_system' => false],
                ['id' => 'notes', 'label' => 'Additional Notes', 'label_bn' => 'মন্তব্য বা অতিরিক্ত তথ্য', 'type' => 'textarea', 'placeholder' => 'কোনো বিশেষ তথ্য থাকলে জানান', 'required' => false, 'enabled' => false, 'is_system' => false],
            ];

            $form = CustomerRegistrationForm::create([
                'title' => 'গ্রাহক মেম্বারশিপ ও কাস্টমার রেজিস্ট্রেশন',
                'title_en' => 'Customer Membership & Registration',
                'description' => 'ইসরাফিল বিডি শপের মেম্বারশিপ প্রোগ্রামে যুক্ত হোন এবং প্রতিটি কেনাকাটায় বিশেষ ছাড় ও লয়্যালটি পয়েন্ট উপভোগ করুন!',
                'description_en' => 'Join Israfil BD Shop membership to earn loyalty rewards and enjoy exclusive store discounts!',
                'welcome_points' => 50,
                'auto_approve' => false,
                'is_active' => true,
                'theme_color' => '#4F46E5',
                'slug' => 'join-customer',
                'fields' => $defaultFields,
            ]);
        }

        // Fetch Shop Settings for branding on the form & flyer
        $settings = Setting::pluck('value', 'key')->toArray();
        $shopInfo = [
            'shop_name' => $settings['shop_name'] ?? 'ISRAFIL BD SHOP',
            'shop_name_bn' => $settings['shop_name_bn'] ?? 'ইসরাফিল বিডি শপ',
            'shop_phone' => $settings['shop_phone'] ?? '01700000000',
            'shop_email' => $settings['shop_email'] ?? 'admin@israfilbd.com',
            'shop_address' => $settings['shop_address'] ?? 'Dhaka, Bangladesh',
            'shop_logo' => $settings['shop_logo'] ?? null,
            'currency_symbol' => $settings['currency_symbol'] ?? '৳',
        ];

        return response()->json([
            'status' => 'success',
            'form' => $form,
            'shop' => $shopInfo,
        ]);
    }

    /**
     * Update registration form configuration (Super Admin).
     */
    public function saveFormConfig(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_en' => 'nullable|string',
            'welcome_points' => 'required|integer|min:0|max:10000',
            'auto_approve' => 'boolean',
            'is_active' => 'boolean',
            'theme_color' => 'nullable|string|max:30',
            'slug' => 'nullable|string|max:50',
            'fields' => 'required|array',
            'fields.*.id' => 'required|string',
            'fields.*.label' => 'required|string',
            'fields.*.label_bn' => 'nullable|string',
            'fields.*.type' => 'required|string|in:text,tel,email,textarea,select,date,number',
            'fields.*.required' => 'boolean',
            'fields.*.enabled' => 'boolean',
            'fields.*.placeholder' => 'nullable|string',
            'fields.*.options' => 'nullable|array',
            'fields.*.is_system' => 'nullable|boolean',
        ]);

        $form = CustomerRegistrationForm::first();
        if (!$form) {
            $form = new CustomerRegistrationForm();
        }

        $form->title = $validated['title'];
        $form->title_en = $validated['title_en'] ?? $validated['title'];
        $form->description = $validated['description'] ?? null;
        $form->description_en = $validated['description_en'] ?? null;
        $form->welcome_points = $validated['welcome_points'] ?? 50;
        $form->auto_approve = $validated['auto_approve'] ?? false;
        $form->is_active = $validated['is_active'] ?? true;
        $form->theme_color = $validated['theme_color'] ?? '#4F46E5';
        $form->slug = $validated['slug'] ?? 'join-customer';
        $form->fields = $validated['fields'];
        $form->save();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'update',
            'description' => 'Updated Customer Registration Form Builder settings',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'কাস্টমার রেজিস্ট্রেশন ফর্ম সফলভাবে সংরক্ষিত হয়েছে',
            'form' => $form,
        ]);
    }

    /**
     * Public submission of customer registration from QR code scan.
     */
    public function submitRegistration(Request $request)
    {
        $form = CustomerRegistrationForm::where('is_active', true)->first();
        if (!$form) {
            $form = CustomerRegistrationForm::first();
        }

        // Basic validation
        $rules = [
            'name' => 'required|string|min:2|max:100',
            'phone' => 'required|string|min:10|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string|max:500',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string|max:50',
            'nid' => 'nullable|string|max:50',
            'custom_data' => 'nullable|array',
        ];

        // Apply any active dynamic required field rules
        if ($form && is_array($form->fields)) {
            foreach ($form->fields as $field) {
                if (!empty($field['enabled']) && !empty($field['required'])) {
                    $fieldId = $field['id'];
                    if (in_array($fieldId, ['name', 'phone', 'email', 'address', 'dob', 'gender', 'nid'])) {
                        $rules[$fieldId] = ($fieldId === 'email' ? 'required|email|max:100' : 'required|string|max:255');
                    } else {
                        $rules['custom_data.' . $fieldId] = 'required';
                    }
                }
            }
        }

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'ফর্মটি সঠিকভাবে পূরণ করুন',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Normalize phone number (standardize 11-digit BD number)
        $cleanPhone = preg_replace('/[^0-9]/', '', $request->input('phone'));
        if (str_starts_with($cleanPhone, '880')) {
            $cleanPhone = substr($cleanPhone, 2);
        }

        // 1. Check if phone already belongs to an active customer
        $existingCustomer = Customer::where('phone', $cleanPhone)->first();
        if ($existingCustomer) {
            return response()->json([
                'status' => 'already_registered',
                'message' => 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে ইসরাফিল বিডি শপে মেম্বারশিপ অ্যাকাউন্ট তৈরি আছে। সরাসরি কাউন্টারে মোবাইল নম্বর দিয়ে লয়্যালটি সুবিধা গ্রহণ করুন!',
                'customer' => [
                    'name' => $existingCustomer->name,
                    'phone' => $existingCustomer->phone,
                    'loyalty_points' => $existingCustomer->loyalty_points,
                ],
            ], 200);
        }

        // 2. Check if a pending registration already exists with this phone
        $pendingRequest = CustomerRegistrationRequest::where('phone', $cleanPhone)
            ->where('status', 'pending')
            ->first();

        if ($pendingRequest) {
            return response()->json([
                'status' => 'already_pending',
                'message' => 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি আবেদন অনুমোদনের অপেক্ষায় রয়েছে (আবেদন নম্বর: ' . $pendingRequest->request_number . ')। আমাদের অ্যাডমিন টিম দ্রুত এটি যাচাই করে অনুমোদন দেবে।',
                'request_number' => $pendingRequest->request_number,
            ], 200);
        }

        // Generate unique request number: REG-YYYYMMDD-XXXX
        $todayPrefix = 'REG-' . Carbon::now()->format('Ymd') . '-';
        $latest = CustomerRegistrationRequest::where('request_number', 'like', $todayPrefix . '%')
            ->orderByDesc('id')
            ->first();

        $nextSeq = 1;
        if ($latest && preg_match('/-(\d+)$/', $latest->request_number, $matches)) {
            $nextSeq = intval($matches[1]) + 1;
        }
        $requestNumber = $todayPrefix . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);

        DB::beginTransaction();
        try {
            $welcomePoints = $form ? $form->welcome_points : 50;
            $autoApprove = $form ? (bool)$form->auto_approve : false;

            $regRequest = CustomerRegistrationRequest::create([
                'request_number' => $requestNumber,
                'name' => trim($request->input('name')),
                'phone' => $cleanPhone,
                'email' => $request->input('email'),
                'address' => $request->input('address'),
                'dob' => $request->input('dob'),
                'gender' => $request->input('gender'),
                'nid' => $request->input('nid'),
                'custom_data' => $request->input('custom_data', []),
                'status' => $autoApprove ? 'approved' : 'pending',
                'welcome_points_awarded' => $welcomePoints,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'reviewed_at' => $autoApprove ? now() : null,
            ]);

            // If auto-approve is enabled in Form Builder, create Customer instantly!
            if ($autoApprove) {
                $customer = Customer::create([
                    'name' => $regRequest->name,
                    'phone' => $regRequest->phone,
                    'email' => $regRequest->email,
                    'address' => $regRequest->address,
                    'loyalty_points' => $welcomePoints,
                    'opening_balance' => 0,
                    'current_balance' => 0,
                    'credit_limit' => 0,
                    'status' => 'active',
                ]);

                $regRequest->customer_id = $customer->id;
                $regRequest->save();
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => $autoApprove
                    ? 'অভিনন্দন! আপনার মেম্বারশিপ অ্যাকাউন্ট অবিলম্বে সক্রিয় হয়েছে এবং ' . $welcomePoints . ' বোনাস পয়েন্ট যোগ করা হয়েছে!'
                    : 'আপনার মেম্বারশিপ আবেদন সফলভাবে জমা হয়েছে! অ্যাডমিন অনুমোদনের সাথে সাথে আপনার অ্যাকাউন্টে ' . $welcomePoints . ' পয়েন্ট যুক্ত হবে।',
                'request_number' => $requestNumber,
                'welcome_points' => $welcomePoints,
                'auto_approved' => $autoApprove,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'আবেদন প্রক্রিয়া করতে সমস্যা হয়েছে: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List all customer registration requests for Admin approval panel.
     */
    public function getRequests(Request $request)
    {
        $query = CustomerRegistrationRequest::with(['customer', 'reviewer']);

        // Status Filter
        if ($request->has('status') && in_array($request->status, ['pending', 'approved', 'rejected'])) {
            $query->where('status', $request->status);
        }

        // Search Filter (name, phone, request_number)
        if ($request->filled('search')) {
            $s = trim($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%")
                    ->orWhere('request_number', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%");
            });
        }

        // Date Range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $perPage = (int) $request->input('per_page', 15);
        $requests = $query->orderBy('status', 'asc') // 'pending' comes first
            ->latest('id')
            ->paginate($perPage);

        // Calculate summary counters for admin badges
        $counts = [
            'all' => CustomerRegistrationRequest::count(),
            'pending' => CustomerRegistrationRequest::where('status', 'pending')->count(),
            'approved' => CustomerRegistrationRequest::where('status', 'approved')->count(),
            'rejected' => CustomerRegistrationRequest::where('status', 'rejected')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $requests,
            'counts' => $counts,
        ]);
    }

    /**
     * Get details of a single registration request.
     */
    public function getRequestDetails($id)
    {
        $request = CustomerRegistrationRequest::with(['customer', 'reviewer'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'request' => $request,
        ]);
    }

    /**
     * Approve a customer registration request.
     */
    public function approveRequest(Request $request, $id)
    {
        $regRequest = CustomerRegistrationRequest::findOrFail($id);

        if ($regRequest->status === 'approved') {
            return response()->json([
                'status' => 'error',
                'message' => 'এই আবেদনটি ইতিমধ্যে অনুমোদিত হয়েছে',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $form = CustomerRegistrationForm::where('is_active', true)->first();
            $welcomePoints = $regRequest->welcome_points_awarded > 0
                ? $regRequest->welcome_points_awarded
                : ($form ? $form->welcome_points : 50);

            // Check if customer with this phone already exists
            $customer = Customer::where('phone', $regRequest->phone)->first();

            if (!$customer) {
                // Create customer
                $customer = Customer::create([
                    'name' => $regRequest->name,
                    'phone' => $regRequest->phone,
                    'email' => $regRequest->email,
                    'address' => $regRequest->address,
                    'loyalty_points' => $welcomePoints,
                    'opening_balance' => 0,
                    'current_balance' => 0,
                    'credit_limit' => 0,
                    'status' => 'active',
                ]);
            } else {
                // Customer already exists, award welcome points if zero or update address
                $customer->loyalty_points = ($customer->loyalty_points ?? 0) + $welcomePoints;
                if (!$customer->address && $regRequest->address) {
                    $customer->address = $regRequest->address;
                }
                if (!$customer->email && $regRequest->email) {
                    $customer->email = $regRequest->email;
                }
                $customer->save();
            }

            $regRequest->status = 'approved';
            $regRequest->customer_id = $customer->id;
            $regRequest->reviewed_by = auth()->id();
            $regRequest->reviewed_at = now();
            $regRequest->welcome_points_awarded = $welcomePoints;
            $regRequest->rejection_reason = null;
            $regRequest->save();

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'approve',
                'description' => "Approved customer registration {$regRequest->request_number} for {$customer->name} (awarded {$welcomePoints} points)",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "আবেদন সফলভাবে অনুমোদিত হয়েছে! গ্রাহক আইডি তৈরি এবং {$welcomePoints} লয়্যালটি পয়েন্ট যোগ করা হয়েছে।",
                'request' => $regRequest->load(['customer', 'reviewer']),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'অনুমোদন প্রক্রিয়া করতে ব্যর্থ: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject a customer registration request.
     */
    public function rejectRequest(Request $request, $id)
    {
        $regRequest = CustomerRegistrationRequest::findOrFail($id);

        $regRequest->status = 'rejected';
        $regRequest->rejection_reason = $request->input('reason', 'প্রয়োজনীয় তথ্যের অসঙ্গতি বা ডুপ্লিকেট আবেদন');
        $regRequest->reviewed_by = auth()->id();
        $regRequest->reviewed_at = now();
        $regRequest->save();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'reject',
            'description' => "Rejected customer registration {$regRequest->request_number} for {$regRequest->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'আবেদনটি প্রত্যাখ্যান করা হয়েছে',
            'request' => $regRequest->load(['customer', 'reviewer']),
        ]);
    }

    /**
     * Bulk approve selected registration requests.
     */
    public function bulkApprove(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer',
        ]);

        $ids = $validated['ids'];
        $approvedCount = 0;

        DB::beginTransaction();
        try {
            $form = CustomerRegistrationForm::where('is_active', true)->first();
            $defaultPoints = $form ? $form->welcome_points : 50;

            $pendingRequests = CustomerRegistrationRequest::whereIn('id', $ids)
                ->where('status', 'pending')
                ->get();

            foreach ($pendingRequests as $req) {
                $points = $req->welcome_points_awarded > 0 ? $req->welcome_points_awarded : $defaultPoints;
                $customer = Customer::where('phone', $req->phone)->first();

                if (!$customer) {
                    $customer = Customer::create([
                        'name' => $req->name,
                        'phone' => $req->phone,
                        'email' => $req->email,
                        'address' => $req->address,
                        'loyalty_points' => $points,
                        'opening_balance' => 0,
                        'current_balance' => 0,
                        'credit_limit' => 0,
                        'status' => 'active',
                    ]);
                } else {
                    $customer->loyalty_points = ($customer->loyalty_points ?? 0) + $points;
                    $customer->save();
                }

                $req->status = 'approved';
                $req->customer_id = $customer->id;
                $req->reviewed_by = auth()->id();
                $req->reviewed_at = now();
                $req->welcome_points_awarded = $points;
                $req->save();

                $approvedCount++;
            }

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'bulk_approve',
                'description' => "Bulk approved {$approvedCount} customer registration requests",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "একসাথে {$approvedCount} টি গ্রাহক আবেদন সফলভাবে অনুমোদিত হয়েছে!",
                'count' => $approvedCount,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'বাল্ক অনুমোদন ব্যর্থ হয়েছে: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk reject selected registration requests.
     */
    public function bulkReject(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer',
            'reason' => 'nullable|string',
        ]);

        $ids = $validated['ids'];
        $reason = $validated['reason'] ?? 'বাল্ক বাতিল করা হয়েছে';

        $updated = CustomerRegistrationRequest::whereIn('id', $ids)
            ->where('status', 'pending')
            ->update([
                'status' => 'rejected',
                'rejection_reason' => $reason,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'bulk_reject',
            'description' => "Bulk rejected {$updated} customer registration requests",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "{$updated} টি আবেদন প্রত্যাখ্যান করা হয়েছে",
            'count' => $updated,
        ]);
    }
}
