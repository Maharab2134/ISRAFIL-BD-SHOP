<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Supplier;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function dailyReport(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        return response()->json($this->reportService->getFinancialSummary($date, $date));
    }

    public function monthlyReport(Request $request)
    {
        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $start = Carbon::parse($month . '-01')->startOfMonth()->toDateString();
        $end = Carbon::parse($month . '-01')->endOfMonth()->toDateString();

        return response()->json($this->reportService->getFinancialSummary($start, $end));
    }

    public function yearlyReport(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);
        $start = "{$year}-01-01";
        $end = "{$year}-12-31";

        return response()->json($this->reportService->getFinancialSummary($start, $end));
    }

    public function productPerformanceReport(Request $request)
    {
        $query = SaleItem::select(
            'product_id',
            'product_name',
            'product_code',
            DB::raw('SUM(quantity) as units_sold'),
            DB::raw('SUM(total) as revenue'),
            DB::raw('SUM(purchase_cost * quantity) as total_cogs'),
            DB::raw('SUM(total - (purchase_cost * quantity)) as estimated_profit')
        )
        ->groupBy('product_id', 'product_name', 'product_code');

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereHas('sale', function ($q) use ($request) {
                $q->whereBetween('sale_date', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
            });
        }

        $products = $query->orderByDesc('units_sold')->paginate($request->integer('per_page', 25));

        return response()->json($products);
    }

    public function stockReport()
    {
        $products = Product::with(['category', 'brand', 'unit'])
            ->select(
                'id', 'name', 'name_bn', 'barcode', 'sku', 'category_id', 'brand_id', 'unit_id',
                'purchase_price', 'selling_price', 'current_stock', 'alert_stock',
                DB::raw('(current_stock * purchase_price) as stock_cost'),
                DB::raw('(current_stock * selling_price) as stock_value')
            )
            ->orderBy('name')
            ->paginate(50);

        return response()->json($products);
    }
}
