import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { ContactContent } from "@/types";
import PageHero from "@/components/PageHero";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { data: contactContent } = useCmsSection<ContactContent>("contact", {
    title: t("contact.heroTitle"),
    subtitle: t("contact.heroDescription"),
    phone: "+1 (888) 555-1234",
    email: "info@crystaldbc.com",
    office: "123 Luxury Avenue, Beverly Hills, CA 90210",
    officeHours: [
      "Monday - Friday: 9:00 AM - 6:00 PM",
      "Saturday: 10:00 AM - 4:00 PM",
      "Sunday: By Appointment Only",
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.post("/messages", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        page: "contact",
      });

      toast({
        title: t("common.messageSent"),
        description: t("common.messageSentDesc"),
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Contact form failed", error);
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
      <PageHero
        eyebrow={t("contact.heroEyebrow")}
        title={contactContent?.title ?? t("contact.heroTitle")}
        description={contactContent?.subtitle ?? t("contact.heroDescription")}
        icon={Phone}
        stats={[
          { label: t("contact.stats.phone"), value: contactContent?.phone ?? "+1 (888) 555-1234" },
          { label: t("contact.stats.email"), value: contactContent?.email ?? "info@crystaldbc.com" },
          { label: t("contact.stats.office"), value: "Cairo & Dubai", helper: t("contact.stats.officeHelper") },
        ]}
        actions={(
          <>
            <Button
              asChild
              className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold/80 shadow-lg shadow-luxury-gold/20"
            >
              <a href={`tel:${contactContent?.phone ?? "+18885551234"}`}>{t("contact.actions.call")}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-accent bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent-foreground"
            >
              <a href={`mailto:${contactContent?.email ?? "info@crystaldbc.com"}`}>{t("contact.actions.email")}</a>
            </Button>
          </>
        )}
      />

      {/* Contact Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="rounded-3xl border border-border/60 bg-card/60 p-10 shadow-2xl shadow-black/5">
              <h2 className="text-3xl font-display font-bold text-primary mb-6">
                {t("contact.infoTitle")}
              </h2>
              <p className="text-muted-foreground mb-8">
                {contactContent?.subtitle ?? t("contact.infoSubtitle")}
              </p>

              <div className="w-20 h-[1px] bg-luxury-gold/50 mb-10" />

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">{t("common.phone")}</h3>
                    <a
                      href={`tel:${contactContent?.phone ?? "+18885551234"}`}
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      {contactContent?.phone ?? "+1 (888) 555-1234"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">{t("common.email")}</h3>
                    <a
                      href={`mailto:${contactContent?.email ?? "info@crystaldbc.com"}`}
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      {contactContent?.email ?? "info@crystaldbc.com"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">{t("common.office")}</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {contactContent?.office ?? "123 Luxury Avenue\nBeverly Hills, CA 90210"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 rounded-3xl border border-border/60 bg-muted/30 p-6">
                <h3 className="text-xl font-display font-semibold text-primary mb-3">
                  {t("contact.officeHoursTitle")}
                </h3>
                <div className="space-y-2 text-muted-foreground">
                  {(contactContent?.officeHours ?? []).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl shadow-black/10">
                <h2 className="text-3xl font-display font-bold text-primary mb-6">
                  {t("contact.formTitle")}
                </h2>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.form.name")}
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("contact.form.placeholders.name")}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.form.email")}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("contact.form.placeholders.email")}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.form.phone")}
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("contact.form.placeholders.phone")}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.form.message")}
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("contact.form.placeholders.message")}
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? t("contact.form.submitting") : t("contact.form.submit")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Global Offices Section (NEW) */}
      <section className="py-20 relative overflow-hidden bg-luxury-dark text-white">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop" alt="World Map" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-transparent to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-luxury-gold uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">Global Presence</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Visit Our Offices</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Strategically located in the world's most dynamic real estate markets to serve our international clientele.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Dubai Office */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                  <span className="text-2xl">🇦🇪</span>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-semibold">Dubai, UAE</h3>
                  <p className="text-luxury-gold text-sm uppercase tracking-wider">Headquarters</p>
                </div>
              </div>
              <div className="space-y-3 text-white/80">
                <p className="flex items-start gap-3"><MapPin className="w-5 h-5 text-luxury-gold mt-1" /> <span>Downtown Dubai, Boulevard Plaza<br />Tower 1, Level 15</span></p>
                <p className="flex items-center gap-3"><Phone className="w-5 h-5 text-luxury-gold" /> +971 4 123 4567</p>
                <p className="flex items-center gap-3"><Mail className="w-5 h-5 text-luxury-gold" /> dubai@crystaldbc.com</p>
              </div>
            </div>

            {/* Cairo Office */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                  <span className="text-2xl">🇪🇬</span>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-semibold">Cairo, Egypt</h3>
                  <p className="text-luxury-gold text-sm uppercase tracking-wider">Regional Hub</p>
                </div>
              </div>
              <div className="space-y-3 text-white/80">
                <p className="flex items-start gap-3"><MapPin className="w-5 h-5 text-luxury-gold mt-1" /> <span>New Cairo, 5th Settlement<br />Trivium Business Complex</span></p>
                <p className="flex items-center gap-3"><Phone className="w-5 h-5 text-luxury-gold" /> +20 2 1234 5678</p>
                <p className="flex items-center gap-3"><Mail className="w-5 h-5 text-luxury-gold" /> cairo@crystaldbc.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (NEW) */}
      <section className="py-20 bg-muted/30 reveal-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-primary">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mt-2">Common questions from our global clientele.</p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: "Do you handle international transactions?", a: "Yes, we specialize in cross-border real estate transactions and can assist with legal frameworks, currency exchange, and compliance in multiple jurisdictions including UAE and Egypt." },
              { q: "What is your commission structure?", a: "Our fees are transparent and competitive, tailored to the specific nature of the property and transaction services required. We provide a detailed breakdown upfront." },
              { q: "Can you manage my property after purchase?", a: "Absolutely. We offer comprehensive property management and concierge services, including tenant screening, maintenance, and rental collection for our investment clients." },
              { q: "Do you offer virtual viewings?", a: "Yes, we provide immersive 3D walkthroughs (like the one on our homepage) and live video tours for international clients who cannot travel immediately." },
              { q: "What is the minimum investment for residency?", a: "Investment thresholds for Golden Visas vary by country. In Dubai it starts from AED 2M, and in Egypt recent laws allow for citizenship through investment. We can guide you through this." },
              { q: "How do you value luxury properties?", a: "We use a combination of comparative market analysis, historical data, and unique attribute adjustments to ensure accurate valuations for high-end assets." },
              { q: "Is financing available for foreign investors?", a: "Yes, we have partnerships with major international banks that offer mortgage products specifically designed for non-resident investors." },
              { q: "What distinguishes CrystalDBC from others?", a: "Our exclusive access to off-market listings, data-driven investment approach, and end-to-end white-glove service set us apart in the luxury sector." }
            ].map((faq, i) => (
              <div key={i} className="bg-background border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-luxury-gold/30">
                <h3 className="font-semibold text-lg mb-3 text-primary">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
