import gsap from "gsap";
import "@google/model-viewer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useEffect, useState } from "react";
import FloatingShapes from "@/components/FloatingShapes";
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
import type { ContactContent } from "@/types";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate sections on scroll
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
              start: "top 80%",
            },
          }
        );
      });

      // Animate cards staggering
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
              start: "top 85%",
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

  const faqs = [
    {
      question: "How do I start investing with CrystalDBC?",
      answer: "Starting is simple. Schedule a consultation with our investment advisors. We'll assess your goals and present curated opportunities that match your portfolio strategy.",
    },
    {
      question: "What markets do you currently cover?",
      answer: "We specialize in premium real estate across major global capitals, including Dubai, London, New York, and emerging luxury markets in the MENA region.",
    },
    {
      question: "Are there property management services available?",
      answer: "Yes, we offer comprehensive property management for all our investment properties, ensuring a completely hands-off experience for our investors.",
    },
    {
      question: "Can I view properties remotely?",
      answer: "Absolutely. We provide immersive 3D tours, live video walkthroughs, and detailed digital brochures for international clients.",
    },
  ];

  return (
    <div ref={mainRef} className="min-h-screen">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Global Vision (3D Globe) */}
      <section className="py-24 bg-luxury-dark text-white relative overflow-hidden reveal-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 h-[400px] md:h-[500px] relative">
              {/* @ts-ignore */}
              <model-viewer
                src="/city_globe3d_model.glb"
                alt="3D City Model"
                auto-rotate
                disable-zoom
                disable-pan
                interaction-prompt="none"
                shadow-intensity="1"
                style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">Global Vision</span>
              <h2 className="text-4xl md:text-5xl font-display font-medium mb-6">A World of Opportunity</h2>
              <p className="text-lg text-white/80 font-light leading-relaxed mb-6">
                Our reach spans continents, connecting you with the most exclusive real estate markets in the world. Experience the future of property investment with our immersive global network.
              </p>
              <Button asChild className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold-light">
                <Link to="/investment">Explore Investments</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us / Trust Section (Moved Up) */}
      <section className="py-24 bg-background reveal-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-primary mb-4">
              {t("home.whyTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group p-8 border border-transparent hover:border-luxury-gold/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:bg-luxury-gold group-hover:text-white transition-all duration-300">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">
                {t("home.whyItems.award.title")}
              </h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                {t("home.whyItems.award.description")}
              </p>
            </div>

            <div className="text-center group p-8 border border-transparent hover:border-luxury-gold/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:bg-luxury-gold group-hover:text-white transition-all duration-300">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">
                {t("home.whyItems.team.title")}
              </h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                {t("home.whyItems.team.description")}
              </p>
            </div>

            <div className="text-center group p-8 border border-transparent hover:border-luxury-gold/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:bg-luxury-gold group-hover:text-white transition-all duration-300">
                <HomeIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">
                {t("home.whyItems.listings.title")}
              </h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                {t("home.whyItems.listings.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Properties Section */}
      <section className="py-32 relative overflow-hidden reveal-section">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2000"
            alt="Properties Background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background/50" />
        </div>
        <div className="relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">Exquisite Selection</span>
              <h2 className="text-4xl md:text-5xl font-display font-medium text-primary mb-6">
                {t("home.featuredTitle")}
              </h2>
              <div className="w-24 h-[1px] bg-primary/20 mx-auto mb-6"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                {t("home.featuredSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 stagger-grid">
              {isLoadingFeatured && <p className="text-muted-foreground text-center col-span-3">{t("common.loadingListings")}</p>}
              {!isLoadingFeatured && featuredProperties.length === 0 && (
                <p className="text-muted-foreground text-center col-span-3">{t("listings.emptyTitle")}</p>
              )}
              {featuredProperties.map((property) => (
                <div key={property._id} className="group cursor-pointer">
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
              ))}
            </div>

            <div className="text-center">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary/20 hover:bg-primary text-primary hover:text-white rounded-none px-12 py-6 text-lg transition-all duration-300"
              >
                <Link to="/listings">
                  {t("home.viewAll")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Our Process Section */}
      <section className="py-24 bg-background reveal-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-primary">Your Journey to Ownership</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative stagger-grid">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent -z-10" />
            {[
              { step: "01", title: "Consultation", desc: "We define your investment goals and lifestyle preferences." },
              { step: "02", title: "Curation", desc: "Our experts select bespoke properties matching your criteria." },
              { step: "03", title: "Verification", desc: "Comprehensive legal and financial due diligence." },
              { step: "04", title: "Acquisition", desc: "Seamless purchase process with full legal support." }
            ].map((item, i) => (
              <div key={i} className="relative bg-background pt-8 text-center group">
                <div className="w-16 h-16 mx-auto bg-luxury-gold/10 text-luxury-gold rounded-full flex items-center justify-center font-display font-bold text-xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-luxury-gold/20">
                  {item.step}
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Projects */}
      <TrendingProjects />

      {/* 3D Scroll Experience */}
      <FloatingShapes />

      {/* 6. Testimonials Section */}
      <section className="py-24 bg-muted/20 reveal-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-primary">Trusted by the Best</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-grid">
            {[
              { name: "James Anderson", role: "International Investor", text: "CrystalDBC identified a high-yield opportunity in Cairo that has outperformed my entire European portfolio. Their due diligence is unmatched.", delay: 0 },
              { name: "Aliyah Hassan", role: "Luxury Homeowner", text: "Finding a penthouse that met my specific privacy requirements was impossible until I met the team. Professional, discreet, and efficient.", delay: 0.2 },
              { name: "Robert Fox", role: "Property Developer", text: "A strategic partner in every sense. Their market insights helped us position our latest development for maximum ROI.", delay: 0.4 }
            ].map((testimonial, i) => (
              <div key={i} className="bg-background p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-border/50">
                <Quote className="h-8 w-8 text-luxury-gold/30 mb-6" />
                <p className="text-muted-foreground italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold font-bold">
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
      <section className="py-24 bg-background reveal-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 faq-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">Common Questions</span>
              <h2 className="text-4xl md:text-5xl font-display font-medium text-primary mb-6">Expert Advice & Insights</h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed">
                Navigating the luxury real estate market requires expertise. Here are some of the most common questions our clients ask.
              </p>
              <div className="p-8 bg-luxury-gold/5 border border-luxury-gold/20 rounded-lg">
                <h4 className="text-xl font-display font-semibold mb-2 text-primary">Need more specific details?</h4>
                <p className="text-muted-foreground mb-4">Our advisory team is available 24/7 to discuss your specific investment criteria.</p>
                <Button asChild variant="outline" className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white">
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="faq-item border-b border-border/60">
                    <AccordionTrigger className="text-left text-lg font-medium hover:text-luxury-gold transition-colors py-6">
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

      {/* 8. Contact Section */}
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

      {/* Global & Lifestyle (Preserved below contact or removed? User asked for logical flow. 
         "About / Lifestyle" could go after "Why Choose Us"? 
         Let's add back the Lifestyle/About section but better placed or modified. 
         Wait, user said "Our Story button in homepage". I missed this in my list above. 
         I will place "Lifestyle/About" section BEFORE "Process".
      */}

      {/* 4b. Lifestyle / About Section (Re-inserted) */}
      <section className="py-32 bg-secondary/30 relative reveal-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative z-10">
                <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1600&auto=format&fit=crop" alt="Luxury Interior" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square bg-white p-2 z-20 shadow-xl hidden md:block">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop" alt="Detail" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="space-y-8">
              <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold">The Lifestyle</span>
              <h2 className="text-4xl md:text-5xl font-display font-medium text-primary leading-tight">
                Elevating Real Estate <br /> to an Art Form
              </h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed">
                We believe that a home is more than just a place to live; it is a sanctuary, a statement, and a legacy. Our curated collection of properties represents the pinnacle of luxury living, designed for those who seek the exceptional.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div>
                  <h4 className="text-3xl font-display text-primary mb-2">150+</h4>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Premium Listings</p>
                </div>
                <div>
                  <h4 className="text-3xl font-display text-primary mb-2">$2B+</h4>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Value Sold</p>
                </div>
              </div>
              <Button asChild className="bg-luxury-gold text-luxury-dark rounded-none px-10 py-6 mt-4 hover:bg-luxury-gold-light focus:ring-2 focus:ring-luxury-gold focus:ring-offset-2 transition-all shadow-lg">
                <Link to="/about">Our Story</Link>
              </Button>
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
