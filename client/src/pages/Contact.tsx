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

const Contact = () => {
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
    title: "Get in Touch",
    subtitle: "Our advisors are ready to help you navigate Egypt's luxury real estate market.",
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
        title: "Message sent",
        description: "Thank you for contacting us. We'll respond shortly.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Contact form failed", error);
      toast({ title: "Failed to send", description: "Please try again.", variant: "destructive" });
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
        eyebrow="Concierge"
        title={contactContent?.title ?? "Get in Touch"}
        description={
          contactContent?.subtitle ??
          "Ready to find your dream property? We're here to guide you every step of the way."
        }
        icon={Phone}
        stats={[
          { label: "Phone", value: contactContent?.phone ?? "+1 (888) 555-1234" },
          { label: "Email", value: contactContent?.email ?? "info@crystaldbc.com" },
          { label: "Office", value: "Cairo & Dubai", helper: "Worldwide network" },
        ]}
        actions={(
          <>
            <Button
              asChild
              className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold/80 shadow-lg shadow-luxury-gold/20"
            >
              <a href={`tel:${contactContent?.phone ?? "+18885551234"}`}>Call our advisors</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-accent bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent-foreground"
            >
              <a href={`mailto:${contactContent?.email ?? "info@crystaldbc.com"}`}>Send an email</a>
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
                Contact Information
              </h2>
              <p className="text-muted-foreground mb-8">
                {contactContent?.subtitle ?? "Reach out to our team of luxury real estate experts. We're available to answer your questions and schedule property viewings."}
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Phone</h3>
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
                    <h3 className="font-semibold text-primary mb-1">Email</h3>
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
                    <h3 className="font-semibold text-primary mb-1">Office</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {contactContent?.office ?? "123 Luxury Avenue\nBeverly Hills, CA 90210"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 rounded-3xl border border-border/60 bg-muted/30 p-6">
                <h3 className="text-xl font-display font-semibold text-primary mb-3">
                  Office Hours
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
                  Send us a Message
                </h2>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your property requirements..."
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Send Message"}
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
