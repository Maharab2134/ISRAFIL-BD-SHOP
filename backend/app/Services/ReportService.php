<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Financial summary for a given date range.
     */
    public function getFinancialSummary(?string $startDate = null, ?string $endDate = null): array
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::now()->startOfMonth();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::now()->endOfDay();

        // Sales aggregate
        $salesQuery = Sale::whereBetween('sale_date', [$start, $end])
            ->where('sale_status', '!=', 'void');

        $grossSales = (float) $salesQuery->sum('subtotal');
        $discountTotal = (float) ($salesQuery->sum('product_discount_total') + $salesQuery->sum('order_discount_amount'));
        $netSales = (float) $salesQuery->sum('grand_total');
        $taxTotal = (float) $salesQuery->sum('tax_amount');
        $totalCogs = (float) $salesQuery->sum('total_cost');
        $grossProfit = max(0, ($netSales - $taxTotal) - $totalCogs);
        $totalPaidSales = (float) $salesQuery->sum('paid_amount');
        $totalDueSales = (float) $salesQuery->sum('due_amount');
        $totalOrders = $salesQuery->count();

        // Expenses aggregate
        $expenseQuery = Expense::whereBetween('expense_date', [$start->format('Y-m-d'), $end->format('Y-m-d')]);
        $totalExpenses = (float) $expenseQuery->sum('amount');

        // Purchases aggregate
        $purchaseQuery = Purchase::whereBetween('purchase_date', [$start->format('Y-m-d'), $end->format('Y-m-d')]);
        $totalPurchases = (float) $purchaseQuery->sum('grand_total');
        $totalPurchasePaid = (float) $purchaseQuery->sum('paid_amount');
        $totalPurchaseDue = (float) $purchaseQuery->sum('due_amount');

        // Net profit = Gross profit - Operating expenses
        $netProfit = $grossProfit - $totalExpenses;

        // Current Overall Receivables & Payables (Shop overall)
        $totalCustomerDue = (float) Customer::sum('current_balance');
        $totalSupplierDue = (float) Supplier::sum('current_balance');

        return [
            'period' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'gross_sales' => $grossSales,
            'discount_total' => $discountTotal,
            'net_sales' => $netSales,
            'tax_total' => $taxTotal,
            'total_cogs' => $totalCogs,
            'gross_profit' => $grossProfit,
            'total_expenses' => $totalExpenses,
            'net_profit' => $netProfit,
            'total_orders' => $totalOrders,
            'sales_paid' => $totalPaidSales,
            'sales_due' => $totalDueSales,
            'total_purchases' => $totalPurchases,
            'purchases_paid' => $totalPurchasePaid,
            'purchases_due' => $totalPurchaseDue,
            'total_customer_due' => $totalCustomerDue,
            'total_supplier_due' => $totalSupplierDue,
        ];
    }

    /**
     * Daily sales and expense trend for charts.
     */
    public function getDailyTrend(int $days = 14): array
    {
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
        $dates = [];
        
        for ($i = 0; $i < $days; $i++) {
            $date = Carbon::now()->subDays($days - 1 - $i)->format('Y-m-d');
            $dates[$date] = [
                'date' => $date,
                'label' => Carbon::parse($date)->format('d M'),
                'sales' => 0,
                'profit' => 0,
                'expenses' => 0,
            ];
        }

        $sales = Sale::where('sale_date', '>=', $startDate)
            ->where('sale_status', '!=', 'void')
            ->select(
                DB::raw('DATE(sale_date) as date'),
                DB::raw('SUM(grand_total) as total_sales'),
                DB::raw('SUM(total_profit) as total_profit')
            )
            ->groupBy('date')
            ->get();

        foreach ($sales as $s) {
            if (isset($dates[$s->date])) {
                $dates[$s->date]['sales'] = (float) $s->total_sales;
                $dates[$s->date]['profit'] = (float) $s->total_profit;
            }
        }

        $expenses = Expense::where('expense_date', '>=', $startDate->format('Y-m-d'))
            ->select(
                'expense_date as date',
                DB::raw('SUM(amount) as total_expenses')
            )
            ->groupBy('date')
            ->get();

        foreach ($expenses as $e) {
            if (isset($dates[$e->date])) {
                $dates[$e->date]['expenses'] = (float) $e->total_expenses;
            }
        }

        return array_values($dates);
    }
}

