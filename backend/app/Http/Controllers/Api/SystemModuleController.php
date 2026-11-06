<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\Request;

class SystemModuleController extends Controller
{
    /**
     * Default list of controllable system modules.
     */
    protected array $defaultModules = [
        'pos' => [
            'id' => 'pos',
            'name' => 'POS Terminal',
            'name_bn' => 'পিওএস টার্মিনাল',
            'routes' => ['/pos'],
            'is_maintenance' => false,
            'message' => 'This section is temporarily paused for maintenance.',
            'message_bn' => 'পিওএস টার্মিনালটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
        'products' => [
            'id' => 'products',
            'name' => 'Products & Catalog',
            'name_bn' => 'পণ্য ও ক্যাটালগ',
            'routes' => ['/products', '/categories', '/brands', '/units', '/barcode', '/barcode-generator'],
            'is_maintenance' => false,
            'message' => 'Products section is temporarily paused for maintenance.',
            'message_bn' => 'পণ্য ও ক্যাটালগ সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
        'sales' => [
            'id' => 'sales',
            'name' => 'Sales & Invoices',
            'name_bn' => 'বিক্রয় ও চালান',
            'routes' => ['/sales'],
            'is_maintenance' => false,
            'message' => 'Sales section is temporarily paused for maintenance.',
            'message_bn' => 'বিক্রয় ও চালান সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
        'purchases' => [
            'id' => 'purchases',
            'name' => 'Purchases',
            'name_bn' => 'ক্রয় ব্যবস্থাপনা',
            'routes' => ['/purchases'],
            'is_maintenance' => false,
            'message' => 'Purchases section is temporarily paused for maintenance.',
            'message_bn' => 'ক্রয় ব্যবস্থাপনা সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
        'inventory' => [
            'id' => 'inventory',
            'name' => 'Inventory & Stocks',
            'name_bn' => 'ইনভেন্টরি ও স্টক',
            'routes' => ['/inventory'],
            'is_maintenance' => false,
            'message' => 'Inventory section is temporarily paused for maintenance.',
            'message_bn' => 'ইনভেন্টরি ও স্টক সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
        'customers' => [
            'id' => 'customers',
            'name' => 'Customers',
            'name_bn' => 'গ্রাহক ব্যবস্থাপনা',
            'routes' => ['/customers'],
            'is_maintenance' => false,
            'message' => 'Customers section is temporarily paused for maintenance.',
            'message_bn' => 'গ্রাহক ব্যবস্থাপনা সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
        'suppliers' => [
            'id' => 'suppliers',
            'name' => 'Suppliers',
            'name_bn' => 'সরবরাহকারী',
            'routes' => ['/suppliers'],
            'is_maintenance' => false,
            'message' => 'Suppliers section is temporarily paused for maintenance.',
            'message_bn' => 'সরবরাহকারী সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
        'expenses' => [
            'id' => 'expenses',
            'name' => 'Expenses',
            'name_bn' => 'খরচ ব্যবস্থাপনা',
            'routes' => ['/expenses', '/expense-categories'],
            'is_maintenance' => false,
            'message' => 'Expenses section is temporarily paused for maintenance.',
            'message_bn' => 'খরচ ব্যবস্থাপনা সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
        'accounting' => [
            'id' => 'accounting',
            'name' => 'Accounting & Cash Flow',
            'name_bn' => 'হিসাব ও ক্যাশ ফ্লো',
            'routes' => ['/accounting', '/cash-flow'],
            'is_maintenance' => false,
            'message' => 'Accounting section is temporarily paused for maintenance.',
            'message_bn' => 'হিসাব ও ক্যাশ ফ্লো সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
        'reports' => [
            'id' => 'reports',
            'name' => 'Reports & Analytics',
            'name_bn' => 'রিপোর্ট ও অ্যানালিটিক্স',
            'routes' => ['/reports'],
            'is_maintenance' => false,
            'message' => 'Reports section is temporarily paused for maintenance.',
            'message_bn' => 'রিপোর্ট ও অ্যানালিটিক্স সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
        'employees' => [
            'id' => 'employees',
            'name' => 'Employees',
            'name_bn' => 'কর্মী ব্যবস্থাপনা',
            'routes' => ['/employees'],
            'is_maintenance' => false,
            'message' => 'Employees section is temporarily paused for maintenance.',
            'message_bn' => 'কর্মী ব্যবস্থাপনা সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
        ],
    ];

    /**
     * Get module maintenance statuses and (for super-admin) recent error alerts.
     */
    public function getModules(Request $request)
    {
        $raw = Setting::get('maintenance_sections');
        $stored = [];
        if ($raw) {
            $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
            if (is_array($decoded)) {
                $stored = $decoded;
            }
        }

        $modules = $this->defaultModules;
        foreach ($modules as $key => &$mod) {
            if (isset($stored[$key])) {
                $mod['is_maintenance'] = (bool) ($stored[$key]['is_maintenance'] ?? false);
                if (!empty($stored[$key]['message'])) {
                    $mod['message'] = $stored[$key]['message'];
                }
                if (!empty($stored[$key]['message_bn'])) {
                    $mod['message_bn'] = $stored[$key]['message_bn'];
                }
                $mod['updated_at'] = $stored[$key]['updated_at'] ?? null;
            }
        }

        $user = $request->user();
        $isSuperAdmin = $user && ($user->role?->slug === 'super-admin' || $user->email === 'admin@israfilbd.com');

        $recentErrors = [];
        $unreadErrorCount = 0;
        if ($isSuperAdmin) {
            $recentErrors = ActivityLog::with('user:id,name,email')
                ->where('action', 'system_crash_alert')
                ->latest('id')
                ->take(15)
                ->get();

            $unreadErrorCount = ActivityLog::where('action', 'system_crash_alert')
                ->where('created_at', '>=', now()->subHours(24))
                ->count();
        }

        return response()->json([
            'modules' => $modules,
            'recent_errors' => $recentErrors,
            'unread_error_count' => $unreadErrorCount,
            'is_super_admin' => $isSuperAdmin,
        ]);
    }

    /**
     * Toggle module maintenance status (Super Admin Only).
     */
    public function toggleModule(Request $request)
    {
        $user = $request->user();
        if (!$user || ($user->role?->slug !== 'super-admin' && $user->email !== 'admin@israfilbd.com')) {
            return response()->json(['message' => 'অননুমোদিত অ্যাক্সেস। শুধুমাত্র সুপার অ্যাডমিন এই পরিবর্তন করতে পারেন।'], 403);
        }

        $validated = $request->validate([
            'module_id' => 'required|string',
            'is_maintenance' => 'required|boolean',
            'message' => 'nullable|string|max:500',
            'message_bn' => 'nullable|string|max:500',
        ]);

        $raw = Setting::get('maintenance_sections');
        $stored = [];
        if ($raw) {
            $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
            if (is_array($decoded)) {
                $stored = $decoded;
            }
        }

        $key = $validated['module_id'];
        $stored[$key] = [
            'is_maintenance' => $validated['is_maintenance'],
            'message' => $validated['message'] ?? 'This section is temporarily paused for maintenance.',
            'message_bn' => $validated['message_bn'] ?? 'এই সেকশনটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ আছে।',
            'updated_at' => now()->toIso8601String(),
            'updated_by' => $user->name,
        ];

        Setting::set('maintenance_sections', json_encode($stored), 'system');

        $moduleName = $this->defaultModules[$key]['name_bn'] ?? $key;
        $stateText = $validated['is_maintenance'] ? 'রক্ষণাবেক্ষণে নেওয়া হয়েছে (Maintenance ON)' : 'পুনরায় সক্রিয় করা হয়েছে (Active)';
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'module_maintenance',
            'description' => "সুপার অ্যাডমিন '{$user->name}' কর্তৃক '{$moduleName}' সেকশন {$stateText}।",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'new_values' => $stored[$key],
        ]);

        return response()->json([
            'message' => "'{$moduleName}' সেকশন সফলভাবে " . ($validated['is_maintenance'] ? 'রক্ষণাবেক্ষণে রাখা হলো।' : 'সক্রিয় করা হলো।'),
            'module_id' => $key,
            'is_maintenance' => $validated['is_maintenance'],
        ]);
    }

    /**
     * Client-side crash and error reporting.
     * Informs Super Admin immediately when any section fails or throws an exception.
     */
    public function reportError(Request $request)
    {
        $validated = $request->validate([
            'section' => 'nullable|string|max:100',
            'error_message' => 'required|string|max:1000',
            'error_stack' => 'nullable|string',
            'component_stack' => 'nullable|string',
            'url' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $userName = $user ? $user->name : 'ভিজিটর/অজ্ঞাত ব্যবহারকারী';
        $userRole = $user && $user->role ? $user->role->name_bn : 'N/A';
        $section = $validated['section'] ?? 'System';

        ActivityLog::create([
            'user_id' => $user?->id,
            'action' => 'system_crash_alert',
            'description' => "⚠️ ক্র্যাশ সতর্কতা: '{$section}' সেকশনে ত্রুটি ঘটেছে [ইউজার: {$userName} ({$userRole})]: {$validated['error_message']}",
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'new_values' => [
                'section' => $section,
                'error_message' => $validated['error_message'],
                'error_stack' => substr((string) ($validated['error_stack'] ?? ''), 0, 2000),
                'component_stack' => substr((string) ($validated['component_stack'] ?? ''), 0, 2000),
                'url' => $validated['url'] ?? null,
                'reported_at' => now()->toIso8601String(),
            ],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'ত্রুটি রিপোর্ট সফলভাবে সংরক্ষণ করা হয়েছে এবং সুপার অ্যাডমিনকে সতর্ক করা হয়েছে।',
        ]);
    }

    /**
     * Clear / Dismiss system error alerts (Super Admin Only).
     */
    public function clearErrors(Request $request)
    {
        $user = $request->user();
        if (!$user || ($user->role?->slug !== 'super-admin' && $user->email !== 'admin@israfilbd.com')) {
            return response()->json(['message' => 'অননুমোদিত অ্যাক্সেস।'], 403);
        }

        ActivityLog::where('action', 'system_crash_alert')->delete();

        return response()->json([
            'message' => 'সকল সিস্টেম ক্র্যাশ সতর্কতা সফলভাবে ক্লিয়ার করা হয়েছে।',
        ]);
    }
}

