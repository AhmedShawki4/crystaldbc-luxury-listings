import { Award, Users, Target, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { AboutContent } from "@/types";
import { getMediaUrl } from "@/lib/media";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import InvestmentBox from "@/components/InvestmentBox";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000";

const iconMap = {
  award: Award,
  users: Users,
  target: Target,
  heart: Heart,
} as const;

const About = () => {
  const { t } = useTranslation();
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
  const storyParagraphs = content.storyParagraphs?.length ? content.storyParagraphs : fallbackAbout.storyParagraphs;
  const values = content.values?.length ? content.values : fallbackAbout.values;
  const stats = content.stats?.length ? content.stats : fallbackAbout.stats;

  return (
    <div className="min-h-screen">
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-border/60 bg-card/60 p-10 shadow-2xl shadow-black/5">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/70">{t("about.storyEyebrow")}</p>
            <h2 className="mt-4 text-4xl font-display font-bold text-primary">{t("about.storyTitle")}</h2>
            <div className="mt-6 space-y-4 text-lg text-muted-foreground leading-relaxed">
              {storyParagraphs.map((paragraph, index) => (
                <p key={`${paragraph}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl font-display font-bold text-primary mb-16">
            {t("about.valuesTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = iconMap[value.iconKey?.toLowerCase() as keyof typeof iconMap] ?? Award;
              return (
                <div
                  className="group rounded-3xl border border-border/60 bg-card/60 p-8 text-left shadow-lg shadow-black/5 transition duration-300 hover:-translate-y-1 hover:border-accent/40"
                  key={`${value.title}-${value.description}`}
                >
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover:bg-accent/20">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-primary mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
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
