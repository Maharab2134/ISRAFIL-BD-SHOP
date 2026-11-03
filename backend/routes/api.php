<?php

use App\Http\Controllers\Api\AccountingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UnitController;
use Illuminate\Support\Facades\Route;

// Public Authentication
Route::post('/login', [AuthController::class, 'login']);

// Protected API Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // POS
    Route::get('/pos/data', [PosController::class, 'getPosData']);
    Route::post('/pos/checkout', [PosController::class, 'checkout']);

    // Products
    Route::get('/products/barcode/{barcode}', [ProductController::class, 'findByBarcode']);
    Route::post('/products/{id}', [ProductController::class, 'update']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::apiResource('products', ProductController::class);

    // Categories, Brands, Units
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('units', UnitController::class);

    // Inventory
    Route::get('/inventory/overview', [InventoryController::class, 'overview']);
    Route::post('/inventory/adjust', [InventoryController::class, 'adjustStock']);
    Route::get('/inventory/history', [InventoryController::class, 'history']);

    // Customers
    Route::post('/customers/{id}/payment', [CustomerController::class, 'receivePayment']);
    Route::apiResource('customers', CustomerController::class);

    // Suppliers
    Route::post('/suppliers/{id}/payment', [SupplierController::class, 'paySupplier']);
    Route::apiResource('suppliers', SupplierController::class);

    // Purchases
    Route::get('/purchases', [PurchaseController::class, 'index']);
    Route::post('/purchases', [PurchaseController::class, 'store']);
    Route::get('/purchases/{id}', [PurchaseController::class, 'show']);

    // Sales
    Route::get('/sales', [SaleController::class, 'index']);
    Route::get('/sales/{id}', [SaleController::class, 'show']);
    Route::post('/sales/{id}/return', [SaleController::class, 'returnSale']);
    Route::get('/sales-returns', [SaleController::class, 'returnsList']);

    // Expenses
    Route::get('/expense-categories', [ExpenseController::class, 'categories']);
    Route::post('/expense-categories', [ExpenseController::class, 'storeCategory']);
    Route::apiResource('expenses', ExpenseController::class);

    // Accounting
    Route::get('/accounting/summary', [AccountingController::class, 'summary']);
    Route::get('/accounting/cash-flow', [AccountingController::class, 'cashFlow']);
    Route::get('/accounting/customer-due', [AccountingController::class, 'customerDueList']);
    Route::get('/accounting/supplier-due', [AccountingController::class, 'supplierDueList']);

    // Reports
    Route::get('/reports/daily', [ReportController::class, 'dailyReport']);
    Route::get('/reports/monthly', [ReportController::class, 'monthlyReport']);
    Route::get('/reports/yearly', [ReportController::class, 'yearlyReport']);
    Route::get('/reports/products', [ReportController::class, 'productPerformanceReport']);
    Route::get('/reports/stock', [ReportController::class, 'stockReport']);

    // Employees, Roles & Logs
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);
    Route::get('/roles', [EmployeeController::class, 'roles']);
    Route::get('/permissions', [EmployeeController::class, 'permissions']);
    Route::get('/activity-logs', [EmployeeController::class, 'activityLogs']);

    // Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);
    Route::post('/settings/logo', [SettingController::class, 'uploadLogo']);
    Route::get('/settings/backup', [SettingController::class, 'downloadBackup']);
});
