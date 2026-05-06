import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense, lazy, useEffect, useRef } from "react";
import LazyImage from "@/components/LazyImage";
import gsap from "gsap";

// Lazy load the GlobeViewer for better initial page load
const GlobeViewer = lazy(() => import("@/components/GlobeViewer"));

interface PageHeroStat {
  label: string;
  value: string;
  helper?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isPattern?: boolean;
  backgroundImage?: string;
  use3DGlobe?: boolean;
  actions?: ReactNode;
  stats?: PageHeroStat[];
  className?: string;
}

const PageHero = ({
  eyebrow,
  title,
  description,
  icon: Icon,
  isPattern,
  backgroundImage,
  use3DGlobe,
  actions,
  stats,
  className,
}: PageHeroProps) => {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate hero content
      if (contentRef.current) {
        const elements = contentRef.current.children;
        gsap.fromTo(
          elements,
          { opacity: 0, y: 40, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            delay: 0.2,
          }
        );
      }

      // Animate stats cards
      if (statsRef.current) {
        const cards = statsRef.current.children;
        gsap.fromTo(
          statsRef.current,
          { opacity: 0, x: 60, scale: 0.95 },
          { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.4 }
        );
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.6 }
        );
      }

      // Animate ambient blobs
      gsap.to(".hero-blob-1", {
        y: -20,
        x: 10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".hero-blob-2", {
        y: 15,
        x: -15,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className={cn(
        "relative isolate overflow-hidden border-b border-white/10 bg-gradient-to-br from-luxury-dark via-luxury-dark/95 to-[#111] pt-36 md:pt-44 pb-16 text-white",
        use3DGlobe && "min-h-[540px] md:min-h-[600px]",
        className
      )}
    >
      {/* 3D Globe Background */}
      {use3DGlobe ? (
        <>
          <Suspense fallback={
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-dark via-luxury-dark/95 to-[#111]" />
          }>
            <div className="absolute inset-0 z-0">
              <GlobeViewer className="opacity-90" />
            </div>
          </Suspense>
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-dark/85 via-luxury-dark/40 to-transparent z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/70 via-transparent to-luxury-dark/30 z-[1]" />
        </>
      ) : backgroundImage ? (
        <div className="absolute inset-0">
          {isPattern ? (
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundRepeat: "repeat"
              }}
            />
          ) : (
            <LazyImage 
              src={backgroundImage} 
              alt="Section background" 
              className="h-full w-full" 
              priority={true}
              blurUp={true}
            />
          )}
          <div className="absolute inset-0 bg-luxury-dark/90" />
        </div>
      ) : null}

      {/* Animated ambient blobs */}
      <div className="hero-blob-1 absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-luxury-gold/20 blur-[120px]" aria-hidden />
      <div className="hero-blob-2 absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-accent/20 blur-[120px]" aria-hidden />
      
      {/* Decorative grid lines */}
      <div className="absolute inset-0 z-[1] opacity-[0.03]" aria-hidden>
        <div className="h-full w-full" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px"
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr),auto] lg:items-start">
          <div ref={contentRef} className="space-y-6">
            {eyebrow ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-luxury-gold animate-pulse" />
                {eyebrow}
              </span>
            ) : null}
            <div className="flex flex-wrap items-center gap-4">
              <span className="hero-icon-box inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm shadow-lg shadow-black/10">
                <Icon className="h-7 w-7" />
              </span>
              <h1 className="text-4xl font-display font-bold leading-tight md:text-5xl">
                {title}
              </h1>
            </div>
            <p className="text-lg text-white/80 md:text-xl max-w-2xl">{description}</p>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>

          {stats && stats.length > 0 ? (
            <div ref={statsRef} className="grid min-w-[260px] gap-4 rounded-3xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-2xl shadow-black/20 mt-2">
              {stats.map((stat, index) => (
                <div
                  key={`${stat.label}-${stat.value}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg"
                >
                  <p className="text-3xl font-display font-bold text-white whitespace-pre-line">{stat.value}</p>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
                  {stat.helper ? <p className="text-xs text-white/50 mt-1">{stat.helper}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-luxury-dark/50 to-transparent z-[2]" />
    </section>
  );
};

export default PageHero;
