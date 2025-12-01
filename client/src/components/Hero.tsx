import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { HeroContent } from "@/types";

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

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={content.backgroundImage}
          alt="Luxury Property"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-dark/80 via-luxury-dark/60 to-luxury-dark/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto fade-in">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
            {content.heading}
            <span className="block text-gradient mt-3 md:mt-4 pb-2">{content.highlight}</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-light">
            {content.subheading}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 h-auto"
            >
              <Link to={content.primaryCta.href}>
                {content.primaryCta.label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm text-lg px-8 py-6 h-auto"
            >
              <Link to={content.secondaryCta.href}>{content.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
