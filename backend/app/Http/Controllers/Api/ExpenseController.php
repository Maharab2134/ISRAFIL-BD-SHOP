<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CashTransaction;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['category', 'user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('expense_number', 'like', "%{$search}%")
                  ->orWhere('reference', 'like', "%{$search}%");
            });
        }

        if ($request->filled('expense_category_id')) {
            $query->where('expense_category_id', $request->expense_category_id);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('expense_date', [$request->start_date, $request->end_date]);
        }

        $expenses = $query->latest('expense_date')->paginate($request->integer('per_page', 20));
        return response()->json($expenses);
    }

    public function show($id)
    {
        $expense = Expense::with(['category', 'user'])->findOrFail($id);
        return response()->json($expense);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'expense_date' => 'required|date',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,bank,bkash,nagad',
            'reference' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $expenseNumber = 'EXP-' . date('Ymd') . '-' . uniqid();
            $validated['expense_number'] = $expenseNumber;
            $validated['user_id'] = auth()->id();

            $expense = Expense::create($validated);

            CashTransaction::create([
                'transaction_number' => 'CT-' . date('Ymd') . '-' . uniqid(),
                'user_id' => auth()->id(),
                'transaction_type' => 'out',
                'category' => 'expense',
                'reference_type' => Expense::class,
                'reference_id' => $expense->id,
                'amount' => $validated['amount'],
                'balance_after' => 0,
                'payment_method' => $validated['payment_method'],
                'description' => "খরচ প্রদান: {$validated['title']} (#{$expenseNumber})",
                'transaction_date' => now(),
            ]);

            ActivityLog::log('expense', "নতুন খরচ এন্ট্রি: '{$expense->title}', পরিমাণ: ৳{$expense->amount}", $expense);

            return response()->json([
                'message' => 'খরচ সফলভাবে যুক্ত করা হয়েছে।',
                'expense' => $expense->load('category'),
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);

        $validated = $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'expense_date' => 'required|date',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,bank,bkash,nagad',
            'reference' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $expense->update($validated);
        ActivityLog::log('update', "খরচ এন্ট্রি আপডেট করা হয়েছে: '{$expense->title}'", $expense);

        return response()->json([
            'message' => 'খরচের তথ্য সফলভাবে আপডেট হয়েছে।',
            'expense' => $expense->load('category'),
        ]);
    }

    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();
        ActivityLog::log('delete', "খরচ মুছে ফেলা হয়েছে: '{$expense->title}'", $expense);

        return response()->json(['message' => 'খরচ সফলভাবে মুছে ফেলা হয়েছে।']);
    }

    // Categories
    public function categories()
    {
        return response()->json(ExpenseCategory::withCount('expenses')->orderBy('name')->get());
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_bn' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category = ExpenseCategory::create($validated);
        return response()->json([
            'message' => 'খরচের খাত সফলভাবে যুক্ত করা হয়েছে।',
            'category' => $category,
        ], 201);
    }
}

