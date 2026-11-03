<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;

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
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($val) ? json_encode($val) : (string) $val]
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
        $db = config('database.connections.mysql.database');

        $command = "mysqldump -S {$socket} -u {$user} {$db}";
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
}

