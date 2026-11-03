<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashTransaction;
use App\Models\Customer;
use App\Models\CustomerPayment;
use App\Models\Expense;
use App\Models\Sale;
use App\Models\SalePayment;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountingController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function summary(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $summary = $this->reportService->getFinancialSummary($startDate, $endDate);
        return response()->json($summary);
    }

    public function cashFlow(Request $request)
    {
        $query = CashTransaction::with('user');

        if ($request->filled('type')) {
            $query->where('transaction_type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('transaction_date', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        $transactions = $query->latest('id')->paginate($request->integer('per_page', 25));

        $totalCashIn = (float) CashTransaction::where('transaction_type', 'in')->sum('amount');
        $totalCashOut = (float) CashTransaction::where('transaction_type', 'out')->sum('amount');
        $netCash = $totalCashIn - $totalCashOut;

        return response()->json([
            'transactions' => $transactions,
            'summary' => [
                'total_in' => $totalCashIn,
                'total_out' => $totalCashOut,
                'net_cash' => $netCash,
            ]
        ]);
    }

    public function customerDueList()
    {
        $customers = Customer::where('current_balance', '>', 0)
            ->orderByDesc('current_balance')
            ->paginate(20);

        $totalDue = (float) Customer::where('current_balance', '>', 0)->sum('current_balance');

        return response()->json([
            'customers' => $customers,
            'total_customer_due' => $totalDue,
        ]);
    }

    public function supplierDueList()
    {
        $suppliers = Supplier::where('current_balance', '>', 0)
            ->orderByDesc('current_balance')
            ->paginate(20);

        $totalDue = (float) Supplier::where('current_balance', '>', 0)->sum('current_balance');

        return response()->json([
            'suppliers' => $suppliers,
            'total_supplier_due' => $totalDue,
        ]);
    }
}
