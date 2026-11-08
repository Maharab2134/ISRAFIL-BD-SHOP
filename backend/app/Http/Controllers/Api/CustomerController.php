<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CashTransaction;
use App\Models\Customer;
use App\Models\CustomerPayment;
use App\Models\CustomerRegistrationRequest;
use App\Models\Sale;
use App\Models\ShopReturn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::withCount('sales');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('name_bn', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('has_due')) {
            $query->where('current_balance', '>', 0);
        }

        $customers = $query->orderBy('name', 'asc')->paginate($request->integer('per_page', 20));

        return response()->json($customers);
    }

    public function show($id)
    {
        $customer = Customer::with([
            'sales' => function ($q) {
                $q->latest('id')->limit(15);
            },
            'payments' => function ($q) {
                $q->latest('id')->limit(15);
            }
        ])->findOrFail($id);

        return response()->json($customer);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20|unique:customers,phone',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'opening_balance' => 'nullable|numeric',
            'credit_limit' => 'nullable|numeric|min:0',
        ]);

        $validated['current_balance'] = $validated['opening_balance'] ?? 0;
        $customer = Customer::create($validated);

        ActivityLog::log('create', "নতুন গ্রাহক '{$customer->name}' তৈরি করা হয়েছে।", $customer);

        return response()->json([
            'message' => 'গ্রাহক সফলভাবে তৈরি করা হয়েছে।',
            'customer' => $customer,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20|unique:customers,phone,' . $customer->id,
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'credit_limit' => 'nullable|numeric|min:0',
            'loyalty_points' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive',
        ]);

        if (empty($validated['status'])) {
            $validated['status'] = $customer->status ?? 'active';
        }

        $customer->update($validated);
        ActivityLog::log('update', "গ্রাহক '{$customer->name}' এর তথ্য আপডেট করা হয়েছে।", $customer);

        return response()->json([
            'message' => 'গ্রাহকের তথ্য সফলভাবে আপডেট হয়েছে।',
            'customer' => $customer->fresh()->loadCount('sales'),
        ]);
    }

    public function destroy($id)
    {
        $customer = Customer::withCount('sales')->findOrFail($id);
        $user = auth()->user();
        $isSuperAdmin = $user && ($user->role?->slug === 'super-admin' || $user->email === 'admin@israfilbd.com');

        if (!$isSuperAdmin && ($customer->sales_count > 0 || (float) $customer->current_balance > 0)) {
            return response()->json([
                'message' => 'এই গ্রাহকের বিক্রয় রেকর্ড অথবা বকেয়া ব্যালেন্স রয়েছে, তাই ম্যানেজার মুছে ফেলতে পারবেন না। শুধুমাত্র সুপার অ্যাডমিন এটি অপসারণ করতে পারবেন।'
            ], 403);
        }

        $this->performCustomerFullCleanup($customer);

        ActivityLog::log('delete', "গ্রাহক '{$customer->name}' এবং সংশ্লিষ্ট সমস্ত রেজিস্ট্রেশন রেকর্ড সম্পূর্ণ অপসারণ করা হয়েছে।", $customer);

        return response()->json([
            'message' => 'গ্রাহক এবং তার সমস্ত পূর্ববর্তী রেজিস্ট্রেশন রেকর্ড সফলভাবে সম্পূর্ণ অপসারণ করা হয়েছে।'
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer',
        ])['ids'];

        $user = auth()->user();
        $isSuperAdmin = $user && ($user->role?->slug === 'super-admin' || $user->email === 'admin@israfilbd.com');

        $deleted = 0;
        $skipped = 0;
        foreach ($ids as $id) {
            $customer = Customer::withCount('sales')->find($id);
            if (!$customer) continue;

            if ($isSuperAdmin || ($customer->sales_count == 0 && (float) $customer->current_balance == 0)) {
                $this->performCustomerFullCleanup($customer);
                $deleted++;
            } else {
                $skipped++;
            }
        }

        if ($deleted > 0) {
            ActivityLog::log('delete', "{$deleted} জন গ্রাহক এবং তাদের পূর্ববর্তী রেজিস্ট্রেশন রেকর্ড সম্পূর্ণ মুছে ফেলা হয়েছে।");
        }

        $msg = "{$deleted} জন গ্রাহক সফলভাবে সম্পূর্ণ মুছে ফেলা হয়েছে।";
        if ($skipped > 0) {
            $msg .= " ({$skipped} জনের সক্রিয় বিক্রয়/বকেয়া রেকর্ড থাকায় বাদ দেওয়া হয়েছে, যা কেবল সুপার এডমিন মুছতে পারবেন)";
        }

        return response()->json([
            'message' => $msg,
            'deleted_count' => $deleted,
            'skipped_count' => $skipped,
        ]);
    }

    /**
     * Completely remove all traces of a customer:
     * - CustomerRegistrationRequest (by customer_id or phone variants)
     * - CustomerPayment
     * - Disassociate from Sales & Returns
     * - Customer record
     */
    protected function performCustomerFullCleanup(Customer $customer)
    {
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

        DB::transaction(function () use ($customer, $phoneVariants) {
            // 1. Remove all registration requests matching customer_id or phone variants
            CustomerRegistrationRequest::where('customer_id', $customer->id)
                ->orWhereIn('phone', $phoneVariants)
                ->delete();

            // 2. Remove all payments
            CustomerPayment::where('customer_id', $customer->id)->delete();

            // 3. Unlink past sales and returns so reports stay intact but customer identity is completely purged
            Sale::where('customer_id', $customer->id)->update(['customer_id' => null]);
            ShopReturn::where('return_type', 'sale')->where('party_id', $customer->id)->update(['party_id' => null]);

            // 4. Delete the customer
            $customer->delete();
        });
    }

    public function receivePayment(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|in:cash,bkash,nagad,bank,cheque',
            'reference' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($customer, $validated) {
            $amount = (float) $validated['amount'];
            $paymentNumber = 'CPAY-' . date('Ymd') . '-' . uniqid();

            $payment = CustomerPayment::create([
                'payment_number' => $paymentNumber,
                'customer_id' => $customer->id,
                'user_id' => auth()->id(),
                'payment_date' => now()->toDateString(),
                'amount' => $amount,
                'payment_method' => $validated['payment_method'],
                'reference' => $validated['reference'] ?? null,
                'note' => $validated['note'] ?? 'গ্রাহক বকেয়া পরিশোধ',
            ]);

            // Deduct due
            $customer->decrement('current_balance', $amount);

            // Record cash transaction
            CashTransaction::create([
                'transaction_number' => 'CT-' . date('Ymd') . '-' . uniqid(),
                'user_id' => auth()->id(),
                'transaction_type' => 'in',
                'category' => 'customer_due',
                'reference_type' => CustomerPayment::class,
                'reference_id' => $payment->id,
                'amount' => $amount,
                'balance_after' => 0,
                'payment_method' => $validated['payment_method'],
                'description' => "গ্রাহক '{$customer->name}' এর বকেয়া আদায় (মানি রসিদ #{$paymentNumber})",
                'transaction_date' => now(),
            ]);

            ActivityLog::log('customer_payment', "গ্রাহক '{$customer->name}' থেকে ৳{$amount} বকেয়া আদায় করা হয়েছে।", $payment);

            return response()->json([
                'message' => "৳{$amount} বকেয়া পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।",
                'customer' => $customer->fresh(),
                'payment' => $payment,
            ]);
        });
    }
}

