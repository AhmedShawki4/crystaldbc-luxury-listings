import { useRef, useLayoutEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { HeroContent } from "@/types";
import { getMediaUrl } from "@/lib/media";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const fallbackHero: HeroContent = {
  heading: "Discover Your Dream",
  highlight: "Luxury Property",
  subheading: "Exceptional homes, unparalleled service, and a commitment to excellence in every detail",
  backgroundImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000",
  primaryCta: { label: "Explore Properties", href: "/listings" },
  secondaryCta: { label: "Contact Us", href: "/contact" },
};

const Hero = () => {
  const { data } = useCmsSection<HeroContent>("hero", fallbackHero);
  const content = data ?? fallbackHero;
  const heroImage = content.backgroundImage ? getMediaUrl(content.backgroundImage) : fallbackHero.backgroundImage;

  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Overlay Parallax (Slower)
      gsap.to(overlayRef.current, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Content Staggered Entry
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".hero-text",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, delay: 0.2 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, [data]);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Layer */}
      <div ref={bgRef} className="absolute inset-0 z-0 h-[120%] -top-[10%]">
        <img
          src={heroImage}
          alt="Luxury PropertyBackground"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient/Overlay Layer */}
      <div ref={overlayRef} className="absolute inset-0 z-10 bg-gradient-to-b from-luxury-dark/40 via-luxury-dark/50 to-background/90 h-[120%] -top-[10%]" />

      {/* Content Layer */}
      <div
        ref={contentRef}
        className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 sm:pt-28 lg:pt-32"
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="hero-text text-5xl sm:text-6xl md:text-8xl font-display font-medium text-white mb-8 leading-tight tracking-tight pb-10">
            {content.heading}
            <span className="block text-gradient mt-2 font-serif italic leading-[1.15] pt-1 pb-3">{content.highlight}</span>
          </h1>
          <p className="hero-text text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            {content.subheading}
          </p>
          <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              asChild
              size="lg"
              className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-dark text-lg px-10 py-7 h-auto w-full sm:w-auto rounded-none tracking-wide transition-all duration-500 hover:scale-105"
            >
              <Link to={content.primaryCta.href}>
                {content.primaryCta.label}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent hover:bg-white/10 text-white border-white/40 text-lg px-10 py-7 h-auto w-full sm:w-auto rounded-none tracking-wide transition-all duration-500 hover:scale-105"
            >
              <Link to={content.secondaryCta.href}>{content.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce hidden lg:block">
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-white/50 to-white" />
        <span className="block text-white/50 text-xs tracking-[0.2em] transform -rotate-90 origin-left translate-x-3 -translate-y-8 uppercase">Scroll</span>
      </div>
    </section>
  );
};

export default Hero;
