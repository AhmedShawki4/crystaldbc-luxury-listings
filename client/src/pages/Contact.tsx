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

              <div className="space-y-6">
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
    </div>
  );
};

export default Contact;
