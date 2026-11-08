<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CustomerRegistrationRequest;
use App\Models\Product;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get aggregated system notifications for all work.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $isSuperAdmin = $user && ($user->role?->slug === 'super-admin' || $user->email === 'admin@israfilbd.com');
        $notifications = [];

        // 1. Pending Customer Registration Requests (if user has permission)
        $canManageCustomers = $isSuperAdmin || ($user && ($user->hasPermission('customers.manage') || $user->hasPermission('customers.create') || $user->hasPermission('customers.view')));
        $pendingRequestsCount = 0;
        if ($canManageCustomers) {
            $pendingRequests = CustomerRegistrationRequest::where('status', 'pending')
                ->latest('id')
                ->limit(10)
                ->get();
            $pendingRequestsCount = CustomerRegistrationRequest::where('status', 'pending')->count();

            foreach ($pendingRequests as $req) {
                $notifications[] = [
                    'id' => 'req_' . $req->id,
                    'type' => 'customer_request',
                    'title' => 'নতুন মেম্বারশিপ আবেদন: ' . $req->name,
                    'title_en' => 'New Customer Request: ' . $req->name,
                    'message' => 'ফোন: ' . $req->phone . ' • আবেদন নং: ' . $req->request_number,
                    'message_en' => 'Phone: ' . $req->phone . ' • Request No: ' . $req->request_number,
                    'link' => '/customers/approvals',
                    'badge' => 'নতুন আবেদন',
                    'badge_en' => 'New Request',
                    'severity' => 'amber',
                    'timestamp' => $req->created_at ? $req->created_at->toIso8601String() : now()->toIso8601String(),
                ];
            }
        }

        // 2. Low Stock Alerts (if user has permission)
        $canViewInventory = $isSuperAdmin || ($user && ($user->hasPermission('inventory.view') || $user->hasPermission('products.view')));
        $lowStockCount = 0;
        if ($canViewInventory) {
            $lowStockProducts = Product::where('status', 'active')
                ->whereRaw('current_stock <= alert_stock')
                ->orderBy('current_stock', 'asc')
                ->limit(10)
                ->get();
            $lowStockCount = Product::where('status', 'active')->whereRaw('current_stock <= alert_stock')->count();

            foreach ($lowStockProducts as $prod) {
                $notifications[] = [
                    'id' => 'stock_' . $prod->id,
                    'type' => 'low_stock',
                    'title' => 'কম স্টক সতর্কতা: ' . ($prod->name_bn ?: $prod->name),
                    'title_en' => 'Low Stock Alert: ' . $prod->name,
                    'message' => "বর্তমান মজুদ: {$prod->current_stock} (সতর্কতা লেভেল: {$prod->alert_stock})",
                    'message_en' => "Current Stock: {$prod->current_stock} (Alert: {$prod->alert_stock})",
                    'link' => '/inventory',
                    'badge' => 'কম স্টক',
                    'badge_en' => 'Low Stock',
                    'severity' => 'rose',
                    'timestamp' => $prod->updated_at ? $prod->updated_at->toIso8601String() : now()->toIso8601String(),
                ];
            }
        }

        // 3. Recent Completed Sales (if user has permission)
        $canViewSales = $isSuperAdmin || ($user && $user->hasPermission('sales.view'));
        $todaySalesCount = 0;
        if ($canViewSales) {
            $recentSales = Sale::where('sale_date', '>=', Carbon::today())
                ->latest('id')
                ->limit(5)
                ->get();
            $todaySalesCount = Sale::where('sale_date', '>=', Carbon::today())->count();

            foreach ($recentSales as $sale) {
                $notifications[] = [
                    'id' => 'sale_' . $sale->id,
                    'type' => 'sale',
                    'title' => 'নতুন বিক্রয়: ' . $sale->invoice_number,
                    'title_en' => 'New Sale: ' . $sale->invoice_number,
                    'message' => 'টাকা: ৳ ' . number_format($sale->grand_total, 2) . ' (' . ($sale->payment_status === 'paid' ? 'পরিশোধিত' : 'বকেয়া') . ')',
                    'message_en' => 'Amount: ৳ ' . number_format($sale->grand_total, 2) . ' (' . ucfirst($sale->payment_status) . ')',
                    'link' => '/sales/' . $sale->id,
                    'badge' => 'বিক্রয়',
                    'badge_en' => 'Sale',
                    'severity' => 'emerald',
                    'timestamp' => $sale->created_at ? $sale->created_at->toIso8601String() : now()->toIso8601String(),
                ];
            }
        }

        // 4. System Crash / Error Alerts (Super Admin Only)
        $systemErrorsCount = 0;
        if ($isSuperAdmin) {
            $recentErrors = ActivityLog::where('action', 'system_crash_alert')
                ->where('created_at', '>=', Carbon::now()->subHours(24))
                ->latest('id')
                ->limit(5)
                ->get();
            $systemErrorsCount = $recentErrors->count();

            foreach ($recentErrors as $err) {
                $section = $err->new_values['section'] ?? 'System';
                $notifications[] = [
                    'id' => 'err_' . $err->id,
                    'type' => 'system_error',
                    'title' => 'সিস্টেম ক্র্যাশ সতর্কতা (' . $section . ')',
                    'title_en' => 'System Crash Alert (' . $section . ')',
                    'message' => $err->new_values['error_message'] ?? $err->description,
                    'message_en' => $err->new_values['error_message'] ?? $err->description,
                    'link' => '/settings',
                    'badge' => 'ত্রুটি',
                    'badge_en' => 'Error',
                    'severity' => 'rose',
                    'timestamp' => $err->created_at ? $err->created_at->toIso8601String() : now()->toIso8601String(),
                ];
            }
        }

        // Sort unified notifications by timestamp desc
        usort($notifications, function ($a, $b) {
            return strcmp($b['timestamp'], $a['timestamp']);
        });

        // Total action items requiring attention (pending requests + low stock + errors)
        $actionItemsCount = $pendingRequestsCount + $lowStockCount + $systemErrorsCount;

        return response()->json([
            'status' => 'success',
            'action_count' => $actionItemsCount,
            'counts' => [
                'pending_requests' => $pendingRequestsCount,
                'low_stock' => $lowStockCount,
                'today_sales' => $todaySalesCount,
                'system_errors' => $systemErrorsCount,
            ],
            'notifications' => array_slice($notifications, 0, 20),
        ]);
    }
}
