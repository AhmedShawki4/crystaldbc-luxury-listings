import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useEffect, useState, useMemo } from "react";
import SEOHead from "@/components/SEOHead";
import FloatingShapes from "@/components/FloatingShapes";
import Antigravity from "@/components/Antigravity";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Award,
  Users,
  Home as HomeIcon,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Globe2,
  Shield,
  Clock,
  Quote,
  CheckCircle2
} from "lucide-react";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import TrendingProjects from "@/components/TrendingProjects";
import RealEstateChatBot from "@/components/RealEstateChatBot";
import InvestmentBox from "@/components/InvestmentBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import useProperties from "@/hooks/useProperties";
import apiClient from "@/lib/apiClient";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { ContactContent, HomePartnersContent, HomeSuccessStoriesContent } from "@/types";
import { getMediaUrl } from "@/lib/media";
import LazyModelViewer from "@/components/LazyModelViewer";
import { lazy, Suspense } from "react";

const Building3D = lazy(() => import("@/components/Building3D"));

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLDivElement>(null);
  const globalVisionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate sections on scroll - trigger earlier for better UX
      const sections = gsap.utils.toArray<HTMLElement>(".reveal-section");
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 95%",
            },
          }
        );
      });

      // Animate cards staggering - trigger earlier
      const cardGrids = gsap.utils.toArray<HTMLElement>(".stagger-grid");
      cardGrids.forEach((grid) => {
        gsap.fromTo(
          grid.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: grid,
              start: "top 95%",
            },
          }
        );
      });

      // FAQ Animation
      const faqItems = gsap.utils.toArray<HTMLElement>(".faq-item");
      gsap.fromTo(
        faqItems,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".faq-container",
            start: "top 80%",
          },
        }
      );

      // Featured properties section – header elements
      gsap.fromTo(
        ".stagger-grid",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          scrollTrigger: {
            trigger: ".stagger-grid",
            start: "top 95%",
          },
        }
      );

      // Testimonial cards – 3D flip in
      const testimonialCards = gsap.utils.toArray<HTMLElement>(".testimonial-card");
      if (testimonialCards.length) {
        gsap.fromTo(
          testimonialCards,
          { opacity: 0, rotateY: -15, scale: 0.9 },
          {
            opacity: 1,
            rotateY: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: testimonialCards[0]?.parentElement,
              start: "top 85%",
            },
          }
        );
      }

      // Success stat counters – scale bounce
      const successCards = gsap.utils.toArray<HTMLElement>(".success-stat-card");
      if (successCards.length) {
        gsap.fromTo(
          successCards,
          { opacity: 0, y: 60, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.2,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: successCards[0]?.parentElement,
              start: "top 85%",
            },
          }
        );
      }

      // Partners grid – cascading reveal from bottom with rotation
      const partnerCards = gsap.utils.toArray<HTMLElement>(".partner-card");
      if (partnerCards.length) {
        gsap.fromTo(
          partnerCards,
          { opacity: 0, y: 40, scale: 0.8, rotateX: 15 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.5,
            stagger: { each: 0.06, from: "random" },
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".partners-grid",
              start: "top 88%",
            },
          }
        );
      }

      // Building 3D text section – slide in
      const building3dText = document.querySelector(".building3d-text");
      if (building3dText) {
        gsap.fromTo(
          building3dText.children,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: building3dText,
              start: "top 80%",
            },
          }
        );
      }

    }, mainRef);
    return () => ctx.revert();
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

  type HomeFaq = { question: string; answer: string };
  type HomeTestimonial = { name: string; role: string; text: string };

  const faqItems = t("home.faqItems", { returnObjects: true });
  const faqs = Array.isArray(faqItems) ? (faqItems as HomeFaq[]) : [];

  const fallbackSuccessStories = useMemo<HomeSuccessStoriesContent>(() => {
    const items = t("home.successStats", { returnObjects: true });
    return {
      eyebrow: t("home.successStories"),
      title: t("home.realResults"),
      stats: Array.isArray(items) ? (items as HomeSuccessStoriesContent["stats"]) : [],
    };
  }, [t]);

  const { data: successStoriesContent } = useCmsSection<HomeSuccessStoriesContent>(
    "homeSuccessStories",
    fallbackSuccessStories,
  );

  const DEFAULT_TRUSTED_BRANDS = useMemo(() => [
    { name: "Forbes", logoUrl: "/logos/forbes.svg", website: "https://www.forbes.com" },
    { name: "Bloomberg", logoUrl: "/logos/bloomberg.svg", website: "https://www.bloomberg.com" },
    { name: "Christie's Real Estate", logoUrl: "/logos/christies.svg", website: "https://www.christiesrealestate.com" },
    { name: "Sotheby's Realty", logoUrl: "/logos/sothebys.svg", website: "https://www.sothebysrealty.com" },
    { name: "Knight Frank", logoUrl: "/logos/knightfrank.svg", website: "https://www.knightfrank.com" },
    { name: "Savills", logoUrl: "/logos/savills.svg", website: "https://www.savills.com" },
    { name: "CBRE", logoUrl: "/logos/cbre.svg", website: "https://www.cbre.com" },
    { name: "JLL", logoUrl: "/logos/jll.svg", website: "https://www.jll.com" },
    { name: "Berkshire Hathaway", logoUrl: "/logos/berkshire.svg", website: "https://www.berkshirehathaway.com" },
    { name: "Cushman & Wakefield", logoUrl: "/logos/cushman.svg", website: "https://www.cushmanwakefield.com" },
    { name: "The Wall Street Journal", logoUrl: "/logos/wsj.svg", website: "https://www.wsj.com" },
    { name: "Financial Times", logoUrl: "/logos/ft.svg", website: "https://www.ft.com" },
  ], []);

  const fallbackPartners = useMemo<HomePartnersContent>(() => ({ partners: [] }), []);
  const { data: partnersContent } = useCmsSection<HomePartnersContent>(
    "homePartners",
    fallbackPartners,
    { localized: false }
  );
  const successStories = successStoriesContent ?? fallbackSuccessStories;
  const successStats = Array.isArray(successStories.stats) ? successStories.stats : fallbackSuccessStories.stats;

  const partners = partnersContent ?? fallbackPartners;
  const cmsPartnerItems = Array.isArray(partners.partners) ? partners.partners : [];
  const allPartnerItems = useMemo(() => {
    const cmsNames = new Set(cmsPartnerItems.map(p => p.name.toLowerCase()));
    const uniqueDefaults = DEFAULT_TRUSTED_BRANDS.filter(b => !cmsNames.has(b.name.toLowerCase()));
    return [...cmsPartnerItems, ...uniqueDefaults];
  }, [cmsPartnerItems, DEFAULT_TRUSTED_BRANDS]);

  const testimonialItems = t("home.testimonialsItems", { returnObjects: true });
  const testimonials = Array.isArray(testimonialItems)
    ? (testimonialItems as HomeTestimonial[])
    : [];

  // State to control Antigravity autoAnimate
  const [antigravityAuto, setAntigravityAuto] = useState(true);

  // Handler for mouse enter/leave on the section
  const handleAntigravityEnter = () => setAntigravityAuto(false);
  const handleAntigravityLeave = () => setAntigravityAuto(true);

  return (
    <div ref={mainRef} className="min-h-screen">
      <SEOHead
        canonical="/"
        title="Luxury Real Estate & Investment in Dubai, Egypt, Saudi Arabia"
        description="CrystalDBC (Crystal DBC) is the premier luxury real estate platform. Explore exclusive villas, penthouses, apartments, and high-yield investment opportunities in Dubai, Cairo, Egypt, Red Sea, Riyadh, Saudi Arabia, Germany, and Russia. كريستال دي بي سي عقارات فاخرة"
        keywords="CrystalDBC home, luxury homes Dubai, luxury villas Egypt, real estate investment, عقارات فاخرة دبي, Luxusimmobilien Dubai, элитная недвижимость"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "CrystalDBC - Luxury Real Estate & Investment",
          "description": "Premier luxury real estate platform offering exclusive properties in Dubai, Egypt, Saudi Arabia, Germany, and Russia",
          "url": "https://crystaldbc.com/",
          "isPartOf": { "@type": "WebSite", "name": "CrystalDBC", "url": "https://crystaldbc.com" }
        }}
      />
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Global Vision (3D Globe) */}
      <section
        className="py-24 bg-luxury-dark text-white relative overflow-hidden reveal-section"
        ref={globalVisionRef}
        onMouseEnter={handleAntigravityEnter}
        onMouseLeave={handleAntigravityLeave}
        onTouchStart={handleAntigravityEnter}
        onTouchEnd={handleAntigravityLeave}
      >
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <Antigravity
            eventSource={globalVisionRef}
            autoAnimate={antigravityAuto}
            rotationSpeed={0.22}
            ringRadius={14}
            magnetRadius={12}
            color="#3B7FF6"
            particleSize={2.6}
            particleVariance={1.4}
            pulseSpeed={3.4}
            depthFactor={1.05}
            fieldStrength={7}
            waveAmplitude={2}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 55% 35%, rgba(28,51,94,0.9) 0%, rgba(13,27,54,0.95) 45%, rgba(6,12,26,0.98) 78%, #04060d 100%), radial-gradient(circle at 20% 80%, rgba(212,175,55,0.15) 0%, transparent 55%)",
              opacity: 0.95,
              zIndex: -1,
            }}
            aria-hidden
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 h-[300px] md:h-[400px] relative">
              <LazyModelViewer
                src="/base_basic_pbr.glb"
                alt="3D City Model"
                autoRotate={true}
                rotationPerSecond="45deg"
                cameraControls={true}
                disableZoom={true}
                interactionPrompt="none"
                cameraOrbit="90deg 75deg 2.5m"
                shadowIntensity="1"
                shadowSoftness="1"
                className="w-full h-full"
                rootMargin="400px"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">{t("home.globalVisionEyebrow")}</span>
              <h2 className="text-4xl md:text-5xl font-display font-medium mb-6">{t("home.globalVisionTitle")}</h2>
              <p className="text-lg text-white/80 font-light leading-relaxed mb-6">
                {t("home.globalVisionDescription")}
              </p>
              <Button asChild className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold-light">
                <Link to="/investment">{t("home.globalVisionCta")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* 4. Featured Properties Section - Premium Showcase */}
      <section className="py-16 md:py-20 relative overflow-hidden reveal-section bg-gradient-to-b from-luxury-dark via-luxury-dark/95 to-luxury-dark">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-luxury-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-luxury-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-[620px] h-[620px] bg-luxury-gold/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Premium Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 mb-6">
                <Sparkles className="h-4 w-4 text-luxury-gold" />
                <span className="text-luxury-gold uppercase tracking-[0.25em] text-xs font-semibold">{t("home.exquisiteEyebrow")}</span>
                <Sparkles className="h-4 w-4 text-luxury-gold" />
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-medium text-white mb-5">
                {t("home.featuredTitle")}
              </h2>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-luxury-gold/60" />
                <div className="w-2 h-2 bg-luxury-gold rotate-45" />
                <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-luxury-gold/60" />
              </div>
              <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
                {t("home.featuredSubtitle")}
              </p>
            </div>

            {/* Featured Properties Grid with Enhanced Styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 stagger-grid">
              {isLoadingFeatured && <p className="text-white/60 text-center col-span-3">{t("common.loadingListings")}</p>}
              {!isLoadingFeatured && featuredProperties.length === 0 && (
                <p className="text-white/60 text-center col-span-3">{t("listings.emptyTitle")}</p>
              )}
              {featuredProperties.map((property, index) => (
                <div
                  key={property._id}
                  className={`group cursor-pointer transform transition-all duration-500 hover:scale-[1.02] ${index === 1 ? 'lg:scale-105 lg:z-10' : ''}`}
                >
                  <div className="relative">
                    {/* Featured Badge for Middle Card */}
                    {index === 1 && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 bg-luxury-gold text-luxury-dark text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                        ★ Top Pick
                      </div>
                    )}
                    <div className={`bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border transition-all duration-500 ${index === 1 ? 'border-luxury-gold/50 shadow-2xl shadow-luxury-gold/10' : 'border-white/10 hover:border-luxury-gold/30'}`}>
                      <PropertyCard
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
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced CTA */}
            <div className="text-center">
              <Button
                asChild
                size="lg"
                className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-dark rounded-none px-10 py-6 text-base md:text-lg font-semibold transition-all duration-300 shadow-xl shadow-luxury-gold/20 hover:shadow-2xl hover:shadow-luxury-gold/30"
              >
                <Link to="/listings" className="flex items-center gap-3">
                  {t("home.viewAll")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Luxury Skyline Experience */}
      <Suspense fallback={<div className="w-full h-[600px] bg-luxury-dark" />}>
        <Building3D />
      </Suspense>

      {/* Trusted Partners – Scroll-Driven Showcase */}
      <section className="py-20 bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden partners-showcase">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-10 h-48 w-48 rounded-full bg-luxury-gold/10 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-luxury-gold/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">
              {t("home.partnersEyebrow")}
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-medium text-primary mb-4">
              {t("home.partnersTitle")}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              {t("home.partnersSubtitle")}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-luxury-gold/60" />
              <div className="w-2 h-2 bg-luxury-gold rotate-45" />
              <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-luxury-gold/60" />
            </div>
          </div>

          {/* Scroll-triggered grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 partners-grid">
            {allPartnerItems.map((partner, index) => {
              const logo = getMediaUrl(partner.logoUrl);
              const card = (
                <div className="partner-card group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm hover:bg-background/80 hover:border-luxury-gold/40 hover:shadow-lg hover:shadow-luxury-gold/5 transition-all duration-500 h-[120px] overflow-hidden">
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-luxury-gold/0 via-luxury-gold/0 to-luxury-gold/0 group-hover:from-luxury-gold/5 group-hover:via-transparent group-hover:to-luxury-gold/5 transition-all duration-700" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    {logo ? (
                      <img
                        src={logo}
                        alt={partner.name}
                        className="max-h-10 w-auto object-contain opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 partner-logo"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm font-display font-semibold text-primary/40 group-hover:text-primary transition-all duration-500 whitespace-nowrap">
                        {partner.name}
                      </span>
                    )}
                    {logo && partner.name ? (
                      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-muted-foreground transition-all duration-500 text-center leading-tight">
                        {partner.name}
                      </span>
                    ) : null}
                  </div>
                </div>
              );

              return partner.website ? (
                <a
                  key={`${partner.name}-${index}`}
                  href={partner.website}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  {card}
                </a>
              ) : (
                <div key={`${partner.name}-${index}`}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Client Success Stories (Replaces How It Works) */}
      <section className="py-24 bg-background reveal-section relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent" />
        <div className="absolute -top-32 left-1/4 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">{successStories.eyebrow}</span>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-primary">{successStories.title}</h2>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-luxury-gold/60" />
              <div className="w-2 h-2 bg-luxury-gold rotate-45" />
              <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-luxury-gold/60" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-grid">
            {successStats.map((stat, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-luxury-gold/5 border border-luxury-gold/10 hover:border-luxury-gold/30 transition-all duration-500 group glow-border success-stat-card">
                <div className="absolute top-4 right-4 w-8 h-8 border border-luxury-gold/10 rotate-45 group-hover:rotate-[135deg] transition-transform duration-700" />
                <div className="text-5xl md:text-6xl font-display font-bold text-luxury-gold mb-4 group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">{stat.label}</h3>
                <div className="luxury-divider mb-3" />
                <p className="text-muted-foreground font-light leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Projects */}
      <div id="trending-projects">
        <TrendingProjects />
      </div>

      {/* 3D Scroll Experience */}
      <FloatingShapes />

      {/* 6. Testimonials Section */}
      <section className="py-24 bg-muted/20 reveal-section relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent" />
        <div className="absolute -top-24 right-10 h-48 w-48 rounded-full bg-luxury-gold/5 blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">{t("home.testimonialsEyebrow")}</span>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-primary">{t("home.testimonialsTitle")}</h2>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-luxury-gold/60" />
              <div className="w-2 h-2 bg-luxury-gold rotate-45" />
              <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-luxury-gold/60" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-grid">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-background p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 border border-border/50 glow-border group testimonial-card" style={{ perspective: '1000px' }}>
                <Quote className="h-8 w-8 text-luxury-gold/30 mb-6 group-hover:text-luxury-gold/50 transition-colors duration-300" />
                <p className="text-muted-foreground italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="luxury-divider mb-6" />
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold font-bold ring-2 ring-luxury-gold/20">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-primary">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section (NEW) */}
      <section className="py-24 bg-background reveal-section relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 faq-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">{t("home.faqEyebrow")}</span>
              <h2 className="text-4xl md:text-5xl font-display font-medium text-primary mb-6">{t("home.faqTitle")}</h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed">
                {t("home.faqDescription")}
              </p>
              <div className="p-8 bg-luxury-gold/5 border border-luxury-gold/20 rounded-2xl glow-border">
                <h4 className="text-xl font-display font-semibold mb-2 text-primary">{t("home.faqCtaTitle")}</h4>
                <p className="text-muted-foreground mb-4">{t("home.faqCtaSubtitle")}</p>
                <Button asChild variant="outline" className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all duration-300">
                  <Link to="/contact">{t("home.faqCtaButton")}</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="faq-item border-b border-border/40 group">
                    <AccordionTrigger className="text-left text-lg font-medium hover:text-luxury-gold transition-colors py-6 group-hover:pl-2 transition-all duration-300">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>



      {/* Real Estate ChatBot (Floating or Section? Section) */}
      <RealEstateChatBot />

    </div>
  );
};

export default Home;
