/**
 * Cache utilities for images and 3D models
 * Uses browser Cache API for persistent caching
 */

const CACHE_NAME = 'crystal-assets-v1';
const MODEL_CACHE_NAME = 'crystal-models-v1';

// In-memory cache for preloaded images
const imageCache = new Map<string, HTMLImageElement>();
const modelCache = new Map<string, boolean>();

/**
 * Preload an image and store it in memory cache
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images in parallel
 */
export const preloadImages = (srcs: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(srcs.map(preloadImage));
};

/**
 * Check if an image is already cached
 */
export const isImageCached = (src: string): boolean => {
  return imageCache.has(src);
};

/**
 * Cache a 3D model using the Cache API
 */
export const cacheModel = async (url: string): Promise<void> => {
  if (modelCache.has(url)) return;

  try {
    if ('caches' in window) {
      const cache = await caches.open(MODEL_CACHE_NAME);
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        modelCache.set(url, true);
      }
    }
  } catch (error) {
    console.warn('Failed to cache model:', url, error);
  }
};

/**
 * Get a cached model URL or fetch it
 */
export const getCachedModel = async (url: string): Promise<string> => {
  try {
    if ('caches' in window) {
      const cache = await caches.open(MODEL_CACHE_NAME);
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }
    }
  } catch (error) {
    console.warn('Cache retrieval failed, using original URL:', error);
  }
  return url;
};

/**
 * Preload a 3D model file
 */
export const preloadModel = async (url: string): Promise<void> => {
  if (modelCache.has(url)) return;

  try {
    // First try to cache it
    await cacheModel(url);
    
    // Also do a fetch to warm up the browser cache
    const response = await fetch(url, { 
      method: 'GET',
      cache: 'force-cache'
    });
    if (response.ok) {
      modelCache.set(url, true);
    }
  } catch (error) {
    console.warn('Failed to preload model:', url, error);
  }
};

/**
 * Generate a low-quality placeholder color from image URL
 */
export const generatePlaceholderColor = (src: string): string => {
  // Simple hash-based color generation for consistent placeholders
  let hash = 0;
  for (let i = 0; i < src.length; i++) {
    hash = src.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a muted luxury color
  const h = Math.abs(hash % 360);
  const s = 10 + Math.abs((hash >> 8) % 20); // 10-30% saturation
  const l = 15 + Math.abs((hash >> 16) % 15); // 15-30% lightness
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

/**
 * Clear all caches
 */
export const clearAssetCaches = async (): Promise<void> => {
  imageCache.clear();
  modelCache.clear();
  
  if ('caches' in window) {
    await caches.delete(CACHE_NAME);
    await caches.delete(MODEL_CACHE_NAME);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { images: number; models: number } => {
  return {
    images: imageCache.size,
    models: modelCache.size,
  };
};
