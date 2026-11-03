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
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $throttleKey = Str::lower($request->input('email')) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "খুব বেশিবার ভুল প্রচেষ্টা করা হয়েছে। অনুগ্রহ করে {$seconds} সেকেন্ড পর পুনরায় চেষ্টা করুন।"
            ], 429);
        }

        $user = User::with(['role.permissions'])->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json([
                'message' => 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'আপনার অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় বা স্থগিত রয়েছে। প্রশাসকের সাথে যোগাযোগ করুন।'
            ], 403);
        }

        RateLimiter::clear($throttleKey);

        $user->update(['last_login_at' => now()]);

        // Revoke previous tokens for clean security or generate new device token
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
        $user = $request->user()->load(['role.permissions']);
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
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
