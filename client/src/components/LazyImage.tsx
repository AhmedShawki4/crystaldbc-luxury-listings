import { useState, useEffect, useRef, memo, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { preloadImage, isImageCached, generatePlaceholderColor } from '@/lib/cache';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string;
  alt: string;
  /** Custom placeholder image URL (low-res version) */
  placeholderSrc?: string;
  /** Use blur-up effect when loading */
  blurUp?: boolean;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Callback when image finishes loading */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Custom loading skeleton className */
  skeletonClassName?: string;
  /** Aspect ratio for skeleton (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string;
  /** Priority loading - skip lazy loading */
  priority?: boolean;
}

const LazyImage = memo(({
  src,
  alt,
  placeholderSrc,
  blurUp = true,
  rootMargin = '200px',
  threshold = 0.1,
  onLoad,
  onError,
  className,
  skeletonClassName,
  aspectRatio,
  priority = false,
  style,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(() => isImageCached(src) || priority);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate placeholder color based on src
  const placeholderColor = generatePlaceholderColor(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, priority, isInView]);

  // Preload image when in view
  useEffect(() => {
    if (!isInView || isLoaded || !src) return;

    preloadImage(src)
      .then(() => {
        setIsLoaded(true);
        onLoad?.();
      })
      .catch(() => {
        setHasError(true);
        onError?.();
      });
  }, [isInView, src, isLoaded, onLoad, onError]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        ...style,
        aspectRatio: aspectRatio,
        backgroundColor: !isLoaded ? placeholderColor : undefined,
      }}
    >
      {/* Skeleton/Placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse',
            skeletonClassName
          )}
          style={{ backgroundColor: placeholderColor }}
        >
          {placeholderSrc && (
            <img
              src={placeholderSrc}
              alt=""
              className={cn(
                'w-full h-full object-cover',
                blurUp && 'blur-sm scale-105'
              )}
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* Main Image */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;

// Preload images utility for critical above-the-fold images
export const preloadCriticalImages = (urls: string[]) => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};
