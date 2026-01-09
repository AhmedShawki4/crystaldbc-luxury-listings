import { Award, Users, Target, Heart, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { AboutContent } from "@/types";
import { getMediaUrl } from "@/lib/media";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import InvestmentBox from "@/components/InvestmentBox";
import LazyImage from "@/components/LazyImage";

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

  const toStringArray = (value: unknown, fallback: string[] = []) => {
    const arrayValue = Array.isArray(value) ? value : Array.isArray(fallback) ? fallback : [];
    return arrayValue.map((item) => String(item));
  };

  const toStatsArray = (value: unknown, fallback: { label: string; value: string }[] = []) => {
    const arrayValue = Array.isArray(value) ? value : Array.isArray(fallback) ? fallback : [];
    return arrayValue
      .filter((item): item is { label: unknown; value: unknown } => Boolean(item) && typeof item === "object")
      .map((item) => ({
        label: String((item as { label?: unknown }).label ?? ""),
        value: String((item as { value?: unknown }).value ?? ""),
      }))
      .filter((item) => item.label || item.value);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
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
  const storyParagraphs = toStringArray(content.storyParagraphs, fallbackAbout.storyParagraphs);
  const values = Array.isArray(content.values) && content.values.length ? content.values : fallbackAbout.values;
  const stats = toStatsArray(content.stats, fallbackAbout.stats);
  const impactItems = toStringArray(t("about.impact.items", { returnObjects: true }));

  return (
    <div ref={mainRef} className="min-h-screen">
      <PageHero
        eyebrow={t("about.heroEyebrow")}
        title={content.heroTitle || t("about.heroTitle")}
        description={content.heroSubtitle || t("about.heroSubtitle")}
        icon={Award}
        use3DGlobe={true}
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

      {/* Our Legacy */}
      <section className="relative py-24 overflow-hidden bg-background min-h-[540px]">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-background/15 to-background/85"
            aria-hidden
          />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-luxury-gold/50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className="relative order-2 lg:order-1 z-10">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <LazyImage 
                  src={heroImage || "/backgroundphoto.jpg"} 
                  alt="Our Legacy" 
                  className="w-full h-full hover:scale-105 transition-transform duration-1000" 
                  blurUp={true}
                  rootMargin="200px"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 hidden max-w-xs rounded-xl border border-white/10 bg-luxury-dark/80 p-8 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.35)] md:block">
                <p className="mb-2 text-4xl font-display font-bold text-luxury-gold">20+</p>
                <p className="text-sm font-medium leading-relaxed text-white/80">{t("about.heroSubtitle") || "Years of Excellence"}</p>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">{t("about.storyEyebrow")}</span>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">{t("about.storyTitle")}</h2>
                <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
                  {storyParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-border/50">
                {/* Displaying first 2 stats here as per design, though they are also in the hero/banner */}
                {stats.slice(2, 4).map((stat, i) => (
                  <div key={i}>
                    <h4 className="font-display font-bold text-2xl text-primary mb-1">{stat.value}</h4>
                    <span className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Global Stats Bar */}
      <section className="py-20 bg-luxury-dark text-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            {stats.map((stat, i) => (
              <div className="p-4" key={i}>
                <h3 className="text-4xl md:text-5xl font-display font-bold text-luxury-gold mb-2">{stat.value}</h3>
                <p className="text-sm text-white/60 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy / Values */}
      <section className="py-24 bg-luxury-dark text-white relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-[0.22]"
          style={{ backgroundImage: "url(/crystalpattern.png)", backgroundRepeat: "repeat" }}
          aria-hidden
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-luxury-dark/35 via-luxury-dark/55 to-luxury-dark/75" aria-hidden />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">Philosophy</span>
            <h2 className="text-4xl font-display font-bold text-white">{t("about.valuesTitle")}</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = iconMap[value.iconKey?.toLowerCase() as keyof typeof iconMap] ?? Award;
              const palette = [
                {
                  card: "bg-luxury-dark/35 backdrop-blur-xl",
                  border: "border-luxury-gold/25 hover:border-luxury-gold/60 hover:bg-luxury-dark/45",
                  iconWrap: "bg-luxury-gold/15 text-luxury-gold group-hover:bg-luxury-gold group-hover:text-luxury-dark",
                },
                {
                  card: "bg-luxury-dark/35 backdrop-blur-xl",
                  border: "border-accent/20 hover:border-accent/60 hover:bg-luxury-dark/45",
                  iconWrap: "bg-accent/15 text-accent group-hover:bg-accent group-hover:text-accent-foreground",
                },
                {
                  card: "bg-luxury-dark/35 backdrop-blur-xl",
                  border: "border-luxury-gold/25 hover:border-luxury-gold/60 hover:bg-luxury-dark/45",
                  iconWrap: "bg-luxury-gold/15 text-luxury-gold group-hover:bg-luxury-gold group-hover:text-luxury-dark",
                },
                {
                  card: "bg-luxury-dark/35 backdrop-blur-xl",
                  border: "border-accent/20 hover:border-accent/60 hover:bg-luxury-dark/45",
                  iconWrap: "bg-accent/15 text-accent group-hover:bg-accent group-hover:text-accent-foreground",
                },
              ];
              const theme = palette[index % palette.length];
              return (
                <div
                  className={`group rounded-2xl border ${theme.border} ${theme.card} p-8 text-left shadow-lg shadow-black/25 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
                  key={value.title}
                >
                  <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500 ${theme.iconWrap}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-white/70 leading-relaxed text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className="order-2 lg:order-1">
              <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">{t("about.impact.eyebrow")}</span>
              <h2 className="text-4xl font-display font-bold text-primary mb-6">{t("about.impact.title")}</h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed mb-6">
                {t("about.impact.description")}
              </p>
              <ul className="space-y-4 mt-8">
                {impactItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-primary p-4 rounded-lg bg-muted/20 border border-transparent hover:border-luxury-gold/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                      <Globe2 className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-luxury-gold/10 blur-3xl transform rotate-12 -z-10"></div>
              <div className="aspect-square bg-luxury-dark rounded-2xl overflow-hidden relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-dark via-[#0a0f1d] to-black opacity-90"></div>

                {/* Decorative Globe Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64 border border-white/5 rounded-full animate-spin-slow">
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-luxury-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.8)]"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe2 className="w-32 h-32 text-luxury-gold/20" strokeWidth={0.5} />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-center font-display text-xl">"Creating spaces that inspire."</p>
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
