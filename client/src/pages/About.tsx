import { Award, Users, Target, Heart, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { AboutContent } from "@/types";
import { getMediaUrl } from "@/lib/media";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import InvestmentBox from "@/components/InvestmentBox";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000";

const iconMap = {
  award: Award,
  users: Users,
  target: Target,
  heart: Heart,
} as const;

const About = () => {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate text containers
      const textBlocks = gsap.utils.toArray<HTMLElement>(".reveal-text");
      textBlocks.forEach((block) => {
        gsap.fromTo(block,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: block, start: "top 85%" } }
        );
      });

      // Animate cards
      const cards = gsap.utils.toArray<HTMLElement>(".reveal-card");
      gsap.fromTo(cards,
        { opacity: 0, scale: 0.95, y: 20 },
        {
          opacity: 1, scale: 1, y: 0,
          stagger: 0.1, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: ".cards-container", start: "top 80%" }
        }
      );

    }, mainRef);
    return () => ctx.revert();
  }, []);

  const fallbackAbout = useMemo<AboutContent>(() => ({
    heroImage: FALLBACK_IMAGE,
    heroTitle: t("about.heroTitle"),
    heroSubtitle: t("about.heroSubtitle"),
    storyParagraphs: t("about.storyParagraphs", { returnObjects: true }) as string[],
    values: [
      { iconKey: "award", title: t("about.values.excellence.title"), description: t("about.values.excellence.description") },
      { iconKey: "users", title: t("about.values.expertise.title"), description: t("about.values.expertise.description") },
      { iconKey: "target", title: t("about.values.integrity.title"), description: t("about.values.integrity.description") },
      { iconKey: "heart", title: t("about.values.service.title"), description: t("about.values.service.description") },
    ],
    stats: t("about.stats", { returnObjects: true }) as { label: string; value: string }[],
  }), [t]);

  const { data: aboutContent } = useCmsSection<AboutContent>("about", fallbackAbout);
  const content = aboutContent ?? fallbackAbout;
  const heroImage = content.heroImage ? getMediaUrl(content.heroImage) : fallbackAbout.heroImage;
  const storyParagraphs = content.storyParagraphs?.length ? content.storyParagraphs : fallbackAbout.storyParagraphs;
  const values = content.values?.length ? content.values : fallbackAbout.values;
  const stats = content.stats?.length ? content.stats : fallbackAbout.stats;

  return (
    <div ref={mainRef} className="min-h-screen">
      <PageHero
        eyebrow={t("about.heroEyebrow")}
        title={content.heroTitle || t("about.heroTitle")}
        description={content.heroSubtitle || t("about.heroSubtitle")}
        icon={Award}
        backgroundImage={heroImage}
        stats={stats.map((stat) => ({ label: stat.label, value: stat.value }))}
        actions={(
          <>
            <Button asChild className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold/80 shadow-lg shadow-luxury-gold/20">
              <Link to="/listings">{t("about.ctaListings")}</Link>
            </Button>
            <Button asChild variant="outline" className="border-accent bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent-foreground">
              <Link to="/contact">{t("about.ctaContact")}</Link>
            </Button>
          </>
        )}
      />

      {/* Our Story */}
      <section className="py-24 bg-background reveal-text overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1 reveal-card">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img src="/backgroundphoto.jpg" alt="Our Legacy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl max-w-xs hidden md:block">
                <p className="text-3xl font-display font-bold text-luxury-gold mb-1">20+</p>
                <p className="text-sm text-gray-600">Years of redefining luxury real estate excellence.</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3">Our Legacy</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">{t("about.storyTitle")}</h2>
              <div className="space-y-4 text-lg text-muted-foreground font-light leading-relaxed">
                {storyParagraphs.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`}>{paragraph}</p>
                ))}
                <p>Founded on the principles of integrity and innovation, CrystalDBC has evolved from a boutique agency into a global powerhouse. We don't just sell properties; we curate lifestyles for the world's most discerning clientele.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Global Reach */}
      <section className="py-20 bg-luxury-dark text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="p-4 reveal-text">
              <h3 className="text-4xl md:text-5xl font-display font-bold text-luxury-gold mb-2">$5B+</h3>
              <p className="text-sm text-white/60 uppercase tracking-wider">Property Sold</p>
            </div>
            <div className="p-4 reveal-text">
              <h3 className="text-4xl md:text-5xl font-display font-bold text-luxury-gold mb-2">12</h3>
              <p className="text-sm text-white/60 uppercase tracking-wider">Global Offices</p>
            </div>
            <div className="p-4 reveal-text">
              <h3 className="text-4xl md:text-5xl font-display font-bold text-luxury-gold mb-2">850+</h3>
              <p className="text-sm text-white/60 uppercase tracking-wider">Happy Clients</p>
            </div>
            <div className="p-4 reveal-text">
              <h3 className="text-4xl md:text-5xl font-display font-bold text-luxury-gold mb-2">30+</h3>
              <p className="text-sm text-white/60 uppercase tracking-wider">Industry Awards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values (Darkened Cards) */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal-text">
            <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">Philosophy</span>
            <h2 className="text-4xl font-display font-bold text-primary">
              {t("about.valuesTitle")}
            </h2>
          </div>
          <div className="cards-container grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = iconMap[value.iconKey?.toLowerCase() as keyof typeof iconMap] ?? Award;
              return (
                <div
                  className="group rounded-xl border border-white/10 bg-luxury-dark p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl reveal-card"
                  key={`${value.title}-${value.description}`}
                >
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-luxury-gold/10 text-luxury-gold group-hover:bg-luxury-gold group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Impact (Replaces Leadership) */}
      <section className="py-24 bg-background reveal-text relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">Our Impact</span>
              <h2 className="text-4xl font-display font-bold text-primary mb-6">Building the Future</h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed mb-6">
                CrystalDBC isn't just about transactions; it's about transformation. We invest heavily in sustainable development and community growth across the regions we serve.
              </p>
              <ul className="space-y-4">
                {[
                  "Sustainable Urban Planning Initiatives",
                  "Community Heritage Preservation",
                  "Green Building Standards",
                  "Local Economic Development"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-primary">
                    <div className="w-2 h-2 rounded-full bg-luxury-gold"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 reveal-card">
              <div className="aspect-video bg-luxury-dark rounded-2xl overflow-hidden relative">
                <img src="/backgroundphoto.jpg" alt="Impact" className="w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Globe2 className="w-20 h-20 text-white/20" strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground/70">{t("about.investmentSection.eyebrow")}</p>
            <h2 className="text-4xl font-display font-bold text-primary">{t("about.investmentSection.title")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("about.investmentSection.description")}</p>
          </div>
          <InvestmentBox />
        </div>
      </section>
    </div>
  );
};

export default About;
