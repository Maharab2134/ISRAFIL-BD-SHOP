<?php

namespace App\Services;

use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GoogleDriveService
{
    protected ?string $folderId;
    protected ?string $apiKey;
    protected ?string $accessToken;

    public function __construct()
    {
        $this->folderId = config('services.google_drive.folder_id', env('GOOGLE_DRIVE_FOLDER_ID'));
        $this->apiKey = config('services.google_drive.api_key', env('GOOGLE_DRIVE_API_KEY'));
        $this->accessToken = config('services.google_drive.access_token', env('GOOGLE_DRIVE_ACCESS_TOKEN'));
    }

    /**
     * Upload image to Google Drive or fallback to local disk storage if credentials not set.
     */
    public function uploadImage(UploadedFile $file, string $subfolder = 'products'): array
    {
        // 1. Strict validation
        $validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($file->getMimeType(), $validMimes)) {
            throw new Exception('শুধুমাত্র JPG, PNG, WEBP অথবা GIF ফরম্যাটের ছবি আপলোড করা যাবে।');
        }

        if ($file->getSize() > 5 * 1024 * 1024) { // 5MB max
            throw new Exception('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারে।');
        }

        // If Google Drive API access token is configured, upload to Google Drive
        if ($this->accessToken) {
            try {
                $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                
                $response = Http::withToken($this->accessToken)
                    ->attach('data', file_get_contents($file->getRealPath()), $filename, ['Content-Type' => $file->getMimeType()])
                    ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', [
                        'metadata' => json_encode([
                            'name' => $filename,
                            'parents' => $this->folderId ? [$this->folderId] : [],
                        ])
                    ]);

                if ($response->successful()) {
                    $driveData = $response->json();
                    $fileId = $driveData['id'] ?? null;
                    $url = "https://lh3.googleusercontent.com/d/{$fileId}";

                    return [
                        'file_id' => $fileId,
                        'url' => $url,
                        'disk' => 'google_drive',
                    ];
                }
            } catch (Exception $e) {
                Log::warning('Google Drive upload failed, falling back to local public storage: ' . $e->getMessage());
            }
        }

        // Fallback: Safe local public storage
        $safeName = Str::random(30) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("uploads/{$subfolder}", $safeName, 'public');
        $url = asset("storage/{$path}");

        return [
            'file_id' => null,
            'url' => $url,
            'disk' => 'local',
        ];
    }

    /**
     * Delete an image from Google Drive or local storage
     */
    public function deleteImage(?string $fileId, ?string $url): bool
    {
        if ($fileId && $this->accessToken) {
            try {
                Http::withToken($this->accessToken)->delete("https://www.googleapis.com/drive/v3/files/{$fileId}");
                return true;
            } catch (Exception $e) {
                Log::warning('Failed to delete Google Drive file: ' . $e->getMessage());
            }
        }

        if ($url && str_contains($url, '/storage/uploads/')) {
            $relativePath = Str::after($url, '/storage/');
            Storage::disk('public')->delete($relativePath);
            return true;
        }

        return false;
    }
}
