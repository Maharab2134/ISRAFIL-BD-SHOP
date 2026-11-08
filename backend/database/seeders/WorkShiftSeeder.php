<?php

namespace Database\Seeders;

use App\Models\WorkShift;
use Illuminate\Database\Seeder;

class WorkShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shifts = [
            [
                'name' => 'General Shift',
                'name_bn' => 'সাধারণ শিফট',
                'shift_code' => 'SHIFT-GEN',
                'start_time' => '09:00:00',
                'end_time' => '18:00:00',
                'status' => 'active',
            ],
            [
                'name' => 'Morning Shift',
                'name_bn' => 'সকাল শিফট',
                'shift_code' => 'SHIFT-MORN',
                'start_time' => '08:00:00',
                'end_time' => '16:00:00',
                'status' => 'active',
            ],
            [
                'name' => 'Evening Shift',
                'name_bn' => 'সন্ধ্যা শিফট',
                'shift_code' => 'SHIFT-EVE',
                'start_time' => '14:00:00',
                'end_time' => '22:00:00',
                'status' => 'active',
            ],
            [
                'name' => 'Night Shift',
                'name_bn' => 'রাত শিফট',
                'shift_code' => 'SHIFT-NGT',
                'start_time' => '22:00:00',
                'end_time' => '06:00:00',
                'status' => 'active',
            ],
        ];

        foreach ($shifts as $s) {
            WorkShift::updateOrCreate(
                ['shift_code' => $s['shift_code']],
                $s
            );
        }
    }
}

