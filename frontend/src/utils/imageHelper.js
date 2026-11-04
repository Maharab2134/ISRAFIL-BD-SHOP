/**
 * Normalizes any image URL (Google Drive, Dropbox, etc.) to a direct image stream link.
 */
export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // 1. Google Drive URLs (converts share / view links to direct lh3 stream)
  const driveFileRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]*&)*id=)([a-zA-Z0-9_-]+)/i;
  const driveMatch = trimmed.match(driveFileRegex);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 2. Dropbox URLs (replaces dl=0 with raw=1 for direct streaming)
  if (trimmed.includes('dropbox.com')) {
    if (trimmed.includes('dl=0')) {
      return trimmed.replace('dl=0', 'raw=1');
    }
    if (!trimmed.includes('raw=1')) {
      const sep = trimmed.includes('?') ? '&' : '?';
      return `${trimmed}${sep}raw=1`;
    }
  }

  return trimmed;
};

/**
 * Checks if a string is a valid HTTP/HTTPS URL
 */
export const isValidUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

export default {
  normalizeImageUrl,
  isValidUrl,
};
