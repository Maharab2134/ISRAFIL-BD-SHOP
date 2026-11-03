<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function index()
    {
        $todayStart = Carbon::today()->startOfDay();
        $todayEnd = Carbon::today()->endOfDay();
        $yesterdayStart = Carbon::yesterday()->startOfDay();
        $yesterdayEnd = Carbon::yesterday()->endOfDay();

        // 1. Today's KPIs
        $todaySales = (float) Sale::whereBetween('sale_date', [$todayStart, $todayEnd])
            ->where('sale_status', '!=', 'void')
            ->sum('grand_total');

        $yesterdaySales = (float) Sale::whereBetween('sale_date', [$yesterdayStart, $yesterdayEnd])
            ->where('sale_status', '!=', 'void')
            ->sum('grand_total');

        $salesChangePercent = $yesterdaySales > 0 
            ? round((($todaySales - $yesterdaySales) / $yesterdaySales) * 100, 1) 
            : 0;

        $todayOrders = Sale::whereBetween('sale_date', [$todayStart, $todayEnd])
            ->where('sale_status', '!=', 'void')
            ->count();

        $todayProfit = (float) Sale::whereBetween('sale_date', [$todayStart, $todayEnd])
            ->where('sale_status', '!=', 'void')
            ->sum('total_profit');

        $todayExpenses = (float) Expense::where('expense_date', Carbon::today()->format('Y-m-d'))
            ->sum('amount');

        $totalProducts = Product::where('status', 'active')->count();
        $lowStockCount = Product::where('status', 'active')
            ->whereRaw('current_stock <= alert_stock')
            ->count();

        // 2. Charts: 14 Days Daily Trends
        $dailyTrends = $this->reportService->getDailyTrend(14);

        // 3. Payment Method Breakdown (This month)
        $monthStart = Carbon::now()->startOfMonth();
        $paymentBreakdown = SalePayment::where('payment_date', '>=', $monthStart)
            ->select('payment_method', DB::raw('SUM(amount) as total_amount'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_method')
            ->get();

        // 4. Best Selling Products (Top 5)
        $bestSelling = SaleItem::select('product_id', 'product_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(total) as total_revenue'))
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // 5. Recent Sales (Latest 6)
        $recentSales = Sale::with(['user', 'customer'])
            ->latest('id')
            ->limit(6)
            ->get();

        // 6. Low Stock Alerts (Products with stock <= alert_stock)
        $lowStockProducts = Product::with(['unit', 'category'])
            ->where('status', 'active')
            ->whereRaw('current_stock <= alert_stock')
            ->orderBy('current_stock', 'asc')
            ->limit(6)
            ->get();

        // 7. Recent Activities
        $recentActivities = ActivityLog::with('user')
            ->latest('id')
            ->limit(6)
            ->get();

        return response()->json([
            'kpis' => [
                'today_sales' => $todaySales,
                'yesterday_sales' => $yesterdaySales,
                'sales_change_percent' => $salesChangePercent,
                'today_orders' => $todayOrders,
                'today_profit' => $todayProfit,
                'today_expenses' => $todayExpenses,
                'total_products' => $totalProducts,
                'low_stock_count' => $lowStockCount,
            ],
            'charts' => [
                'daily_trends' => $dailyTrends,
                'payment_breakdown' => $paymentBreakdown,
            ],
            'best_selling' => $bestSelling,
            'recent_sales' => $recentSales,
            'low_stock_alerts' => $lowStockProducts,
            'recent_activities' => $recentActivities,
        ]);
    }
}

