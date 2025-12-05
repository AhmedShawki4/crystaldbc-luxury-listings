import { Award, Users, Target, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { AboutContent } from "@/types";
import { getMediaUrl } from "@/lib/media";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";

const fallbackAbout: AboutContent = {
  heroImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000",
  heroTitle: "About CrystalDBC",
  heroSubtitle: "Excellence in luxury real estate since 1995",
  storyParagraphs: [
    "Founded in 1995, CrystalDBC has established itself as a premier luxury real estate firm, specializing in exceptional properties that define sophisticated living. Our commitment to excellence and personalized service has earned us the trust of discerning clients worldwide.",
    "With decades of combined experience, our team brings unparalleled expertise in the luxury real estate market. We understand that finding the perfect property is about more than just square footage and amenities—it's about discovering a place that truly feels like home.",
    "At CrystalDBC, we pride ourselves on our attention to detail, market knowledge, and dedication to delivering results that exceed expectations. Whether you're buying, selling, or investing, we're here to guide you every step of the way.",
  ],
  values: [
    { iconKey: "award", title: "Excellence", description: "We strive for excellence in every transaction and interaction." },
    { iconKey: "users", title: "Expertise", description: "Deep market knowledge and proven track record of success." },
    { iconKey: "target", title: "Integrity", description: "Honest, transparent, and ethical in all our business practices." },
    { iconKey: "heart", title: "Service", description: "Personalized attention and dedication to client satisfaction." },
  ],
  stats: [
    { label: "Years Experience", value: "28+" },
    { label: "Properties Sold", value: "2,500+" },
    { label: "Total Sales Volume", value: "$5B+" },
    { label: "Client Satisfaction", value: "98%" },
  ],
};

const iconMap = {
  award: Award,
  users: Users,
  target: Target,
  heart: Heart,
} as const;

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: aboutContent } = useCmsSection<AboutContent>("about", fallbackAbout);
  const content = aboutContent ?? fallbackAbout;
  const heroImage = content.heroImage ? getMediaUrl(content.heroImage) : fallbackAbout.heroImage;
  const storyParagraphs = content.storyParagraphs?.length ? content.storyParagraphs : fallbackAbout.storyParagraphs;
  const values = content.values?.length ? content.values : fallbackAbout.values;
  const stats = content.stats?.length ? content.stats : fallbackAbout.stats;

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Our Legacy"
        title={content.heroTitle || "About CrystalDBC"}
        description={content.heroSubtitle || "Excellence in luxury real estate"}
        icon={Award}
        backgroundImage={heroImage}
        stats={stats.map((stat) => ({ label: stat.label, value: stat.value }))}
        actions={(
          <>
            <Button asChild className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold/80 shadow-lg shadow-luxury-gold/20">
              <Link to="/listings">Discover Listings</Link>
            </Button>
            <Button asChild variant="outline" className="border-accent bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent-foreground">
              <Link to="/contact">Speak with Experts</Link>
            </Button>
          </>
        )}
      />

      {/* Our Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-border/60 bg-card/60 p-10 shadow-2xl shadow-black/5">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/70">Our Story</p>
            <h2 className="mt-4 text-4xl font-display font-bold text-primary">Rooted in Excellence</h2>
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
            Our Values
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
    </div>
  );
};

export default About;
