import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Adds a cache-busting query parameter to image URLs to force browser reload
 * The key prop on AvatarImage components will force React remount when URL changes.
 * This function adds a stable cache-busting parameter based on the URL hash to ensure
 * browsers don't serve stale cached images while avoiding unnecessary reloads.
 * @param url - The image URL
 * @returns URL with cache-busting parameter, or undefined if url is null/undefined
 */
export function getImageUrlWithCacheBust(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  // If URL already has our cache-busting parameter, return as-is
  if (url.includes('_cb=')) {
    return url;
  }
  
  const separator = url.includes('?') ? '&' : '?';
  
  // Create a hash from the URL for stable but unique cache-busting
  // This ensures the same URL gets the same parameter, but different URLs get different ones
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value to ensure positive number
  const cacheBuster = `_cb=${Math.abs(hash)}`;
  
  return `${url}${separator}${cacheBuster}`;
}