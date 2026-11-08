<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:4|max:100',
        ]);

        $cleanEmail = Str::lower(trim($validated['email']));
        $throttleKey = $cleanEmail . '|' . $request->ip();

        // 1. Strict Brute-Force Rate Limiting (5 attempts per 60 seconds)
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "খুব বেশিবার ভুল প্রচেষ্টা করা হয়েছে। নিরাপত্তার স্বার্থে সাময়িক লক করা হয়েছে। অনুগ্রহ করে {$seconds} সেকেন্ড পর পুনরায় চেষ্টা করুন।"
            ], 429);
        }

        // 2. Lookup user by normalized email
        $user = User::with(['role.permissions', 'branch'])->where('email', $cleanEmail)->first();

        // 3. Strict cryptographic bcrypt hash verification (no hardcoded plaintext bypasses)
        $isPasswordValid = $user && Hash::check($request->password, $user->password);

        if (!$user || !$isPasswordValid) {
            RateLimiter::hit($throttleKey, 60);
            $attempts = RateLimiter::attempts($throttleKey);
            $remaining = max(0, 5 - $attempts);

            // Audit log failed login attempts for security forensics
            ActivityLog::create([
                'user_id' => $user?->id,
                'action' => 'failed_login',
                'description' => "ব্যর্থ লগইন প্রচেষ্টা (ইমেইল: {$cleanEmail})। অবশিষ্ট চেষ্টা: {$remaining} বার।",
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ]);

            $errorMsg = 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
            if ($remaining > 0 && $remaining <= 3) {
                $errorMsg .= " সতর্কতা: আর {$remaining} বার ভুল দিলে একাউন্ট সাময়িক লক হবে।";
            }

            return response()->json([
                'message' => $errorMsg,
                'remaining_attempts' => $remaining,
            ], 401);
        }

        // 4. Strict account status check
        if ($user->status !== 'active') {
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'blocked_login',
                'description' => "নিষ্ক্রিয় একাউন্টে লগইন প্রচেষ্টা (স্ট্যাটাস: {$user->status})",
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ]);

            return response()->json([
                'message' => 'আপনার অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় বা স্থগিত রয়েছে। প্রশাসকের সাথে যোগাযোগ করুন।'
            ], 403);
        }

        // 5. Successful authentication: Clear rate limiter
        RateLimiter::clear($throttleKey);

        // 6. Revoke previous tokens to prevent session hijacking & enforce token hygiene
        $user->tokens()->where('name', 'auth_token')->delete();

        // 7. Update last login timestamp
        $user->update(['last_login_at' => now()]);

        // 8. Generate fresh bearer token
        $token = $user->createToken('auth_token')->plainTextToken;

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'description' => "ইউজার '{$user->name}' সফলভাবে লগইন করেছেন।",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'সফলভাবে লগইন হয়েছে!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'employee_id' => $user->employee_id,
                'department' => $user->department,
                'designation' => $user->designation,
                'joining_date' => $user->joining_date?->format('Y-m-d'),
                'branch' => $user->branch ? [
                    'id' => $user->branch->id,
                    'name' => $user->branch->name,
                    'name_bn' => $user->branch->name_bn,
                    'code' => $user->branch->code,
                ] : null,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'name_bn' => $user->role->name_bn,
                    'slug' => $user->role->slug,
                    'permissions' => $user->role->slug === 'super-admin' 
                        ? ['*'] 
                        : $user->role->permissions->pluck('slug')->toArray(),
                ] : null,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()->delete();
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'description' => "ইউজার '{$user->name}' লগআউট করেছেন।",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return response()->json([
            'message' => 'সফলভাবে লগআউট হয়েছে।'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['role.permissions', 'branch']);
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'employee_id' => $user->employee_id,
                'department' => $user->department,
                'designation' => $user->designation,
                'joining_date' => $user->joining_date?->format('Y-m-d'),
                'branch' => $user->branch ? [
                    'id' => $user->branch->id,
                    'name' => $user->branch->name,
                    'name_bn' => $user->branch->name_bn,
                    'code' => $user->branch->code,
                ] : null,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'name_bn' => $user->role->name_bn,
                    'slug' => $user->role->slug,
                    'permissions' => $user->role->slug === 'super-admin'
                        ? ['*']
                        : $user->role->permissions->pluck('slug')->toArray(),
                ] : null,
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।',
            'user' => $user,
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['বর্তমান পাসওয়ার্ডটি সঠিক নয়।'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'password_change',
            'description' => 'পাসওয়ার্ড পরিবর্তন করা হয়েছে।',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।'
        ]);
    }
}
