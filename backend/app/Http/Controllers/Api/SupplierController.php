<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CashTransaction;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::withCount('purchases');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('name')->paginate($request->integer('per_page', 20));
        return response()->json($suppliers);
    }

    public function show($id)
    {
        $supplier = Supplier::with([
            'purchases' => function ($q) {
                $q->latest('id')->limit(15);
            },
            'payments' => function ($q) {
                $q->latest('id')->limit(15);
            }
        ])->findOrFail($id);

        return response()->json($supplier);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20|unique:suppliers,phone',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'opening_balance' => 'nullable|numeric',
        ]);

        $validated['current_balance'] = $validated['opening_balance'] ?? 0;
        $supplier = Supplier::create($validated);

        ActivityLog::log('create', "নতুন সরবরাহকারী '{$supplier->name}' যোগ করা হয়েছে।", $supplier);

        return response()->json([
            'message' => 'সরবরাহকারী সফলভাবে যোগ করা হয়েছে।',
            'supplier' => $supplier,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20|unique:suppliers,phone,' . $supplier->id,
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $supplier->update($validated);
        ActivityLog::log('update', "সরবরাহকারী '{$supplier->name}' এর তথ্য আপডেট করা হয়েছে।", $supplier);

        return response()->json([
            'message' => 'সরবরাহকারীর তথ্য সফলভাবে আপডেট হয়েছে।',
            'supplier' => $supplier,
        ]);
    }

    public function paySupplier(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|in:cash,bank,bkash,nagad,cheque',
            'reference' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($supplier, $validated) {
            $amount = (float) $validated['amount'];
            $paymentNumber = 'SUPPAY-' . date('Ymd') . '-' . uniqid();

            $payment = SupplierPayment::create([
                'payment_number' => $paymentNumber,
                'supplier_id' => $supplier->id,
                'user_id' => auth()->id(),
                'payment_date' => now()->toDateString(),
                'amount' => $amount,
                'payment_method' => $validated['payment_method'],
                'reference' => $validated['reference'] ?? null,
                'note' => $validated['note'] ?? 'সরবরাহকারীকে দেনা পরিশোধ',
            ]);

            // Deduct payable
            $supplier->decrement('current_balance', $amount);

            // Record Cash Transaction
            CashTransaction::create([
                'transaction_number' => 'CT-' . date('Ymd') . '-' . uniqid(),
                'user_id' => auth()->id(),
                'transaction_type' => 'out',
                'category' => 'supplier_payment',
                'reference_type' => SupplierPayment::class,
                'reference_id' => $payment->id,
                'amount' => $amount,
                'balance_after' => 0,
                'payment_method' => $validated['payment_method'],
                'description' => "সরবরাহকারী '{$supplier->name}' কে দেনা পরিশোধ (ভাউচার #{$paymentNumber})",
                'transaction_date' => now(),
            ]);

            ActivityLog::log('supplier_payment', "সরবরাহকারী '{$supplier->name}' কে ৳{$amount} পরিশোধ করা হয়েছে।", $payment);

            return response()->json([
                'message' => "সরবরাহকারীকে ৳{$amount} সফলভাবে প্রদান করা হয়েছে।",
                'supplier' => $supplier->fresh(),
                'payment' => $payment,
            ]);
        });
    }

    public function destroy($id)
    {
        $supplier = Supplier::withCount('purchases')->findOrFail($id);
        if ($supplier->purchases_count > 0 || $supplier->current_balance > 0) {
            return response()->json([
                'message' => 'এই সরবরাহকারীর সক্রিয় ক্রয় বা ব্যালেন্স রেকর্ড রয়েছে, তাই মুছে ফেলা সম্ভব নয়।'
            ], 422);
        }

        $supplier->delete();
        ActivityLog::log('delete', "সরবরাহকারী '{$supplier->name}' মুছে ফেলা হয়েছে।", $supplier);

        return response()->json(['message' => 'সরবরাহকারী সফলভাবে মুছে ফেলা হয়েছে।']);
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer',
        ])['ids'];

        $deleted = 0;
        $skipped = 0;
        foreach ($ids as $id) {
            $supplier = Supplier::withCount('purchases')->find($id);
            if ($supplier && $supplier->purchases_count == 0 && (float) $supplier->current_balance == 0) {
                $supplier->delete();
                $deleted++;
            } else {
                $skipped++;
            }
        }

        if ($deleted > 0) {
            ActivityLog::log('delete', "{$deleted} টি সরবরাহকারী মুছে ফেলা হয়েছে।");
        }

        $msg = "{$deleted} টি সরবরাহকারী সফলভাবে মুছে ফেলা হয়েছে।";
        if ($skipped > 0) {
            $msg .= " ({$skipped} টির সক্রিয় ক্রয়/বকেয়া রেকর্ড থাকায় বাদ দেওয়া হয়েছে)";
        }

        return response()->json([
            'message' => $msg,
            'deleted_count' => $deleted,
            'skipped_count' => $skipped,
        ]);
    }
}

