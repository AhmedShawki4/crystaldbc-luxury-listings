import { Award, Users, Target, Heart } from "lucide-react";
import { useEffect } from "react";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { AboutContent } from "@/types";
import { getMediaUrl } from "@/lib/media";

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
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={content.heroTitle || "About CrystalDBC"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-luxury-dark/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 fade-in">
            {content.heroTitle || "About CrystalDBC"}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto fade-in">
            {content.heroSubtitle || "Excellence in luxury real estate"}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-display font-bold text-primary mb-6">Our Story</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
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
          <h2 className="text-4xl font-display font-bold text-primary text-center mb-16">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = iconMap[value.iconKey?.toLowerCase() as keyof typeof iconMap] ?? Award;
              return (
                <div className="text-center group" key={`${value.title}-${value.description}`}>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-10 w-10 text-accent" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-primary mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-luxury-dark text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-5xl font-display font-bold text-accent mb-2">{stat.value}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
