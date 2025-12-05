import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Award, Users, Home as HomeIcon, Mail, Phone, MapPin, Building2, ShieldCheck, Sparkles } from "lucide-react";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import TrendingProjects from "@/components/TrendingProjects";
import RealEstateChatBot from "@/components/RealEstateChatBot";
import InvestmentBox from "@/components/InvestmentBox";
import CurvedLoop from "@/components/CurvedLoop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import useProperties from "@/hooks/useProperties";
import apiClient from "@/lib/apiClient";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { ContactContent } from "@/types";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: featuredProperties = [], isLoading: isLoadingFeatured } = useProperties({ featured: true, limit: 3 });
  const { data: contactContent } = useCmsSection<ContactContent>("contact", {
    title: t("contact.infoTitle"),
    subtitle: t("contact.infoSubtitle"),
    phone: "+1 (888) 555-1234",
    email: "info@crystaldbc.com",
    office: "123 Luxury Avenue, Beverly Hills, CA 90210",
    officeHours: [
      "Monday - Friday: 9:00 AM - 6:00 PM",
      "Saturday: 10:00 AM - 4:00 PM",
      "Sunday: By Appointment Only",
    ],
  });
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/messages", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        page: "home",
      });
      toast({
        title: t("common.messageSent"),
        description: t("common.messageSentDesc"),
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Home contact error", error);
      toast({ title: t("common.messageFailed"), description: t("common.tryAgain"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen">
      <Hero />

      {/* Curved marquees */}
      <section className="py-6 bg-gradient-to-br from-[#0b1220] via-[#0e1626] to-[#0b1220] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background:
            "radial-gradient(circle at 10% 20%, rgba(255,215,128,0.12), transparent 30%)," +
            "radial-gradient(circle at 80% 0%, rgba(98,179,255,0.12), transparent 28%)," +
            "linear-gradient(120deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
        }} />
        <br /><br />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative space-y-3">
            <CurvedLoop
              marqueeText="Luxury. Trust. CrystalDBC."
              speed={1.6}
              curveAmount={-40}
              className="drop-shadow-lg"
              fillGradient={["#f8d675", "#f7b733"]}
            />
            <CurvedLoop
              marqueeText="Invest with confidence • Tailored experiences • Award-winning advisors"
              curveAmount={-40}
              speed={1.9}
              direction="right"
              className="text-white/80"
              fillGradient={["#a6d4ff", "#5fa8ff"]}
            />
        </div>
      </section>

      {/* Trending Projects Section */}
      <TrendingProjects />

      {/* Real Estate ChatBot */}
      <RealEstateChatBot />

      {/* Featured Properties Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              {t("home.featuredTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.featuredSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {isLoadingFeatured && <p className="text-muted-foreground">{t("common.loadingListings")}</p>}
            {!isLoadingFeatured && featuredProperties.length === 0 && (
              <p className="text-muted-foreground">{t("listings.emptyTitle")}</p>
            )}
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property._id}
                id={property._id}
                image={property.coverImage}
                title={property.title}
                location={property.location}
                price={property.priceLabel}
                beds={property.beds}
                baths={property.baths}
                sqft={property.sqftLabel}
                status={property.status}
              />
            ))}
          </div>

          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Link to="/listings">
                {t("home.viewAll")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Investment Opportunity Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <InvestmentBox />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              {t("home.whyTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("home.whySubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Award className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-primary mb-3">
                {t("home.whyItems.award.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("home.whyItems.award.description")}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Users className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-primary mb-3">
                {t("home.whyItems.team.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("home.whyItems.team.description")}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <HomeIcon className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-primary mb-3">
                {t("home.whyItems.listings.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("home.whyItems.listings.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-luxury-dark text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {t("home.contactTitle")}
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {t("home.contactSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
            {/* Contact Information */}
            <div>
              <h3 className="text-3xl font-display font-bold mb-6">{contactContent?.title}</h3>
              <p className="text-white/80 mb-8">{contactContent?.subtitle}</p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t("common.phone")}</h4>
                    <a href={`tel:${contactContent?.phone}`} className="text-white/80 hover:text-accent transition-colors">
                      {contactContent?.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t("common.email")}</h4>
                    <a href={`mailto:${contactContent?.email}`} className="text-white/80 hover:text-accent transition-colors">
                      {contactContent?.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t("common.office")}</h4>
                    <p className="text-white/80">{contactContent?.office}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h4 className="text-xl font-display font-semibold mb-3">
                  {t("contact.officeHoursTitle")}
                </h4>
                <div className="space-y-2 text-white/80">
                  {contactContent?.officeHours.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
                <h3 className="text-3xl font-display font-bold mb-6">
                  {t("home.contactFormTitle")}
                </h3>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      {t("home.form.name")}
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("contact.form.placeholders.name")}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      {t("home.form.email")}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("contact.form.placeholders.email")}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      {t("home.form.phone")}
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("contact.form.placeholders.phone")}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      {t("home.form.message")}
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("home.form.placeholder")}
                      rows={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? t("home.form.submitting") : t("home.form.submit")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
