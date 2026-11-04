<?php

namespace App\Helpers;

class ImageHelper
{
    /**
     * Normalize any image URL (Google Drive, Dropbox, etc.) to a direct image streaming URL.
     */
    public static function normalize(?string $url): ?string
    {
        if (!$url) {
            return null;
        }

        $url = trim($url);
        if (empty($url)) {
            return null;
        }

        // 1. Google Drive URLs (extract file ID and convert to direct lh3 stream)
        // Matches:
        // - drive.google.com/file/d/FILE_ID/view...
        // - drive.google.com/open?id=FILE_ID
        // - drive.google.com/uc?id=FILE_ID
        if (preg_match('#drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]*&)*id=)([a-zA-Z0-9_-]+)#i', $url, $matches)) {
            return 'https://lh3.googleusercontent.com/d/' . $matches[1];
        }

        // 2. Dropbox URLs (replaces dl=0 with raw=1 for direct streaming)
        if (str_contains($url, 'dropbox.com')) {
            if (str_contains($url, 'dl=0')) {
                return str_replace('dl=0', 'raw=1', $url);
            }
            if (!str_contains($url, 'raw=1')) {
                $sep = str_contains($url, '?') ? '&' : '?';
                return $url . $sep . 'raw=1';
            }
        }

        return $url;
    }
}

