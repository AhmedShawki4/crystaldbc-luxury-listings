import { useState, useEffect, useRef, memo, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { preloadModel } from '@/lib/cache';
import '@google/model-viewer';

interface LazyModelViewerProps {
  /** Path to the 3D model file (.glb, .gltf) */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Poster image to show while loading */
  poster?: string;
  /** Enable auto-rotation */
  autoRotate?: boolean;
  /** Rotation speed in degrees per second */
  rotationPerSecond?: string;
  /** Enable camera controls */
  cameraControls?: boolean;
  /** Camera orbit position */
  cameraOrbit?: string;
  /** Shadow intensity */
  shadowIntensity?: string;
  /** Shadow softness */
  shadowSoftness?: string;
  /** Disable zoom */
  disableZoom?: boolean;
  /** Interaction prompt */
  interactionPrompt?: 'auto' | 'none' | 'when-focused';
  /** Container className */
  className?: string;
  /** Container style */
  style?: CSSProperties;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Skip lazy loading - load immediately */
  priority?: boolean;
  /** Callback when model finishes loading */
  onLoad?: () => void;
  /** Callback when model fails to load */
  onError?: () => void;
}

// Extend JSX to include model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          poster?: string;
          loading?: 'auto' | 'lazy' | 'eager';
          reveal?: 'auto' | 'manual';
          'auto-rotate'?: boolean;
          'rotation-per-second'?: string;
          'camera-controls'?: boolean;
          'camera-orbit'?: string;
          'shadow-intensity'?: string;
          'shadow-softness'?: string;
          'disable-zoom'?: boolean;
          'interaction-prompt'?: string;
        },
        HTMLElement
      >;
    }
  }
}

const LazyModelViewer = memo(({
  src,
  alt,
  poster,
  autoRotate = true,
  rotationPerSecond = '45deg',
  cameraControls = true,
  cameraOrbit = '90deg 75deg 2.5m',
  shadowIntensity = '1',
  shadowSoftness = '1',
  disableZoom = false,
  interactionPrompt = 'none',
  className,
  style,
  rootMargin = '300px',
  threshold = 0.1,
  priority = false,
  onLoad,
  onError,
}: LazyModelViewerProps) => {
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLElement>(null);

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

  // Preload model when in view
  useEffect(() => {
    if (!isInView || !src) return;
    
    preloadModel(src).catch(() => {
      console.warn('Failed to preload model:', src);
    });
  }, [isInView, src]);

  // Handle model-viewer events
  useEffect(() => {
    if (!isInView || !modelRef.current) return;

    const modelViewer = modelRef.current;

    const handleLoad = () => {
      setIsLoaded(true);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);

    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
    };
  }, [isInView, onLoad, onError]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={style}
    >
      {/* Loading Placeholder */}
      {!isLoaded && !hasError && poster && (
        <div className="absolute inset-0 z-10">
          <img
            src={poster}
            alt={`${alt} loading placeholder`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Skeleton when no poster */}
      {!isLoaded && !hasError && !poster && (
        <div className="absolute inset-0 z-10 bg-luxury-dark/80 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
        </div>
      )}

      {/* Model Viewer - only render when in view */}
      {isInView && !hasError && (
        // @ts-ignore
        <model-viewer
          ref={modelRef}
          src={src}
          alt={alt}
          poster={poster}
          loading="lazy"
          reveal="auto"
          auto-rotate={autoRotate || undefined}
          rotation-per-second={rotationPerSecond}
          camera-controls={cameraControls || undefined}
          camera-orbit={cameraOrbit}
          shadow-intensity={shadowIntensity}
          shadow-softness={shadowSoftness}
          disable-zoom={disableZoom || undefined}
          interaction-prompt={interactionPrompt}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
          }}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-luxury-dark/90 text-white">
          <span className="text-muted-foreground text-sm mb-2">3D model unavailable</span>
          {poster && (
            <img
              src={poster}
              alt={alt}
              className="w-full h-full object-cover opacity-50"
            />
          )}
        </div>
      )}
    </div>
  );
});

LazyModelViewer.displayName = 'LazyModelViewer';

export default LazyModelViewer;

/**
 * Preload 3D models for critical sections
 */
export const preloadCriticalModels = (urls: string[]) => {
  urls.forEach((url) => {
    preloadModel(url);
  });
};
