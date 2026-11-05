<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Brand;
use App\Models\CashTransaction;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerPayment;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\PurchasePayment;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\Setting;
use App\Models\ShopReturn;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SettingController extends Controller
{
    protected GoogleDriveService $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    public function index()
    {
        $settings = Setting::all()->groupBy('group');
        $flattened = Setting::pluck('value', 'key')->toArray();

        return response()->json([
            'grouped' => $settings,
            'settings' => $flattened,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable',
        ]);

        foreach ($data['settings'] as $key => $val) {
            $finalVal = is_array($val) ? json_encode($val) : (string) $val;
            if ($key === 'shop_logo' && is_string($val) && !empty($val)) {
                $finalVal = \App\Helpers\ImageHelper::normalize($val) ?? $val;
            }
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $finalVal]
            );
        }

        ActivityLog::log('update', 'দোকান ও সিস্টেম সেটিংস আপডেট করা হয়েছে।');

        return response()->json([
            'message' => 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!',
            'settings' => Setting::pluck('value', 'key')->toArray(),
        ]);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|max:3072',
        ]);

        $upload = $this->driveService->uploadImage($request->file('logo'), 'brand');
        Setting::updateOrCreate(
            ['key' => 'shop_logo'],
            ['value' => $upload['url'], 'group' => 'general']
        );

        return response()->json([
            'message' => 'লোগো সফলভাবে আপলোড করা হয়েছে!',
            'url' => $upload['url'],
        ]);
    }

    public function downloadBackup()
    {
        // Simple SQL dump generator for emergency local recovery
        $filename = 'israfil_shop_backup_' . date('Y_m_d_His') . '.sql';
        $socket = config('database.connections.mysql.unix_socket');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');
        $db = config('database.connections.mysql.database');

        $passArg = $pass ? "-p" . escapeshellarg($pass) : "";
        $socketArg = $socket ? "-S " . escapeshellarg($socket) : "";
        $command = "mysqldump {$socketArg} -u " . escapeshellarg($user) . " {$passArg} " . escapeshellarg($db);
        $output = [];
        $returnVar = 0;
        exec($command, $output, $returnVar);

        if ($returnVar === 0) {
            $sqlContent = implode("\n", $output);
            ActivityLog::log('backup', 'সিস্টেম ডাটাবেজ ব্যাকআপ ফাইল ডাউনলোড করা হয়েছে।');

            return response($sqlContent, 200, [
                'Content-Type' => 'application/sql',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ]);
        }

        return response()->json(['message' => 'ব্যাকআপ ফাইল তৈরি করতে ব্যর্থ হয়েছে।'], 500);
    }

    public function getDatabaseStats(Request $request)
    {
        $user = $request->user();
        if ($user->role?->slug !== 'super-admin' && $user->email !== 'admin@israfilbd.com') {
            return response()->json(['message' => 'শুধুমাত্র সুপার অ্যাডমিন ডাটাবেজ পরিসংখ্যান দেখতে পারবেন।'], 403);
        }

        return response()->json([
            'stats' => [
                'products' => Product::count(),
                'categories' => Category::count(),
                'brands' => Brand::count(),
                'sales' => Sale::count(),
                'purchases' => Purchase::count(),
                'customers' => Customer::count(),
                'suppliers' => Supplier::count(),
                'expenses' => Expense::count(),
                'activity_logs' => ActivityLog::count(),
            ]
        ]);
    }

    public function clearDatabase(Request $request)
    {
        $user = $request->user();
        if ($user->role?->slug !== 'super-admin' && $user->email !== 'admin@israfilbd.com') {
            return response()->json(['message' => 'শুধুমাত্র সুপার অ্যাডমিন ডাটাবেজ রিসেট/ক্লিয়ার করতে পারবেন।'], 403);
        }

        $request->validate([
            'mode' => 'required|in:clear_transactions,full_reset',
            'password' => 'required|string',
            'confirmation' => 'required|string',
            'reset_stock' => 'nullable|boolean',
            'seed_demo' => 'nullable|boolean',
        ]);

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'প্রদত্ত সুপার অ্যাডমিন পাসওয়ার্ডটি সঠিক নয়!'], 422);
        }

        if (strtoupper(trim($request->confirmation)) !== 'CLEAR') {
            return response()->json(['message' => 'নিশ্চিত করতে "CLEAR" শব্দটি টাইপ করুন।'], 422);
        }

        // Automatic safety backup before any deletion
        $this->createAutoBackup('auto_backup_before_' . $request->mode);

        if ($request->mode === 'clear_transactions') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            SaleItem::truncate();
            SalePayment::truncate();
            Sale::truncate();
            PurchaseItem::truncate();
            PurchasePayment::truncate();
            Purchase::truncate();
            ShopReturn::truncate();
            StockMovement::truncate();
            CustomerPayment::truncate();
            SupplierPayment::truncate();
            Expense::truncate();
            CashTransaction::truncate();
            ActivityLog::truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            if ($request->boolean('reset_stock')) {
                Product::query()->update(['current_stock' => 0]);
            }

            Customer::query()->update([
                'current_balance' => 0,
                'loyalty_points' => 0,
            ]);
            Supplier::query()->update([
                'current_balance' => 0,
            ]);

            ActivityLog::log('settings', 'সুপার অ্যাডমিন কর্তৃক সমস্ত বিক্রয়, ক্রয় ও লেনদেন ডাটা মুছে ফেলা হয়েছে।');

            return response()->json([
                'message' => 'সমস্ত বিক্রয়, ক্রয় ও আর্থিক লেনদেন ডাটা সফলভাবে মুছে ফেলা হয়েছে!',
                'mode' => 'clear_transactions',
            ]);
        }

        if ($request->mode === 'full_reset') {
            Artisan::call('migrate:fresh', ['--force' => true]);
            Artisan::call('db:seed', ['--class' => 'DatabaseSeeder', '--force' => true]);

            if ($request->boolean('seed_demo')) {
                Artisan::call('db:seed', ['--class' => 'DemoDataSeeder', '--force' => true]);
            }

            ActivityLog::log('settings', 'সুপার অ্যাডমিন কর্তৃক সম্পূর্ণ ডাটাবেজ ফ্যাক্টরি রিসেট করা হয়েছে।');

            return response()->json([
                'message' => 'সম্পূর্ণ ডাটাবেজ সফলভাবে ফ্যাক্টরি রিসেট ও নতুনভাবে প্রস্তুত করা হয়েছে!',
                'mode' => 'full_reset',
            ]);
        }

        return response()->json(['message' => 'অজানা অপারেশন।'], 400);
    }

    protected function createAutoBackup(string $prefix = 'auto_backup'): ?string
    {
        try {
            $backupDir = database_path('backups');
            if (!is_dir($backupDir)) {
                mkdir($backupDir, 0755, true);
            }
            $filename = $prefix . '_' . date('Y_m_d_His') . '.sql';
            $path = $backupDir . '/' . $filename;

            $socket = config('database.connections.mysql.unix_socket');
            $user = config('database.connections.mysql.username');
            $pass = config('database.connections.mysql.password');
            $db = config('database.connections.mysql.database');

            $passArg = $pass ? "-p" . escapeshellarg($pass) : "";
            $socketArg = $socket ? "-S " . escapeshellarg($socket) : "";
            $command = "mysqldump {$socketArg} -u " . escapeshellarg($user) . " {$passArg} " . escapeshellarg($db) . " > " . escapeshellarg($path);

            exec($command, $output, $returnVar);
            return $returnVar === 0 ? $path : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}

