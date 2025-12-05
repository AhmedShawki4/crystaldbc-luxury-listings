import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Building2, User, Mail, Phone, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";
import useAuth from "@/hooks/useAuth";

interface RegisterInterestDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  propertyId?: string;
  propertyTitle?: string;
  source?: string;
}

const initialFormState = {
  fullName: "",
  interestedIn: "",
  phoneNumber: "",
  email: "",
  message: "",
};

const RegisterInterestDialog = ({
  open: externalOpen,
  onOpenChange,
  propertyId,
  propertyTitle,
  source = "register-interest",
}: RegisterInterestDialogProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const location = useLocation();
  const [formData, setFormData] = useState(initialFormState);
  const [countryCode, setCountryCode] = useState("+20");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const promptStorageKey = useMemo(() => `crystaldbc:lastInterestPrompt:${user?.id ?? "guest"}`, [user?.id]);

  // Determine if we're using external or internal control
  const isExternallyControlled = externalOpen !== undefined;
  const isOpen = isExternallyControlled ? externalOpen : internalOpen;
  const setIsOpen = isExternallyControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  useEffect(() => {
    if (isExternallyControlled) return;
    if (typeof window === "undefined") return;

    const lastPrompt = window.localStorage.getItem(promptStorageKey);
    const sixHours = 6 * 60 * 60 * 1000;
    if (lastPrompt && Date.now() - Number(lastPrompt) < sixHours) {
      return;
    }

    const timer = setTimeout(() => {
      setInternalOpen(true);
      window.localStorage.setItem(promptStorageKey, Date.now().toString());
    }, 30000);

    return () => clearTimeout(timer);
  }, [location.pathname, isExternallyControlled, promptStorageKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const normalizedPhone = formData.phoneNumber.trim()
        ? `${countryCode} ${formData.phoneNumber}`.trim()
        : undefined;
      const normalizedMessage = formData.message.trim() || (propertyTitle ? `Interested in ${propertyTitle}` : "");

      await apiClient.post("/leads", {
        fullName: formData.fullName,
        interestedIn: formData.interestedIn,
        phoneNumber: normalizedPhone,
        email: formData.email,
        message: normalizedMessage || undefined,
        source,
        property: propertyId ?? undefined,
      });

      toast({
        title: "Registration received",
        description: "Thank you for your interest. Our team will follow up shortly.",
      });
      setFormData(initialFormState);
      setCountryCode("+20");
      setIsOpen(false);
    } catch (error) {
      console.error("Register interest failed", error);
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] sm:max-h-[90vh] overflow-y-auto bg-luxury-dark text-white border-white/20 p-0 gap-0 [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:top-3 [&>button]:right-3 sm:[&>button]:top-4 sm:[&>button]:right-4 [&>button>svg]:h-5 [&>button>svg]:w-5 [&>button]:z-10">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-luxury-dark via-luxury-dark to-primary/20 px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 mb-2 pr-10 sm:gap-3 sm:mb-2 sm:pr-12">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-xl font-display font-bold text-white mb-0.5 sm:mb-1">
                Register Your Interest
              </DialogTitle>
              <p className="text-xs sm:text-sm text-white/70">
                Be first to access Egypt's best properties
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3 sm:px-6 sm:py-5 sm:space-y-4">
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Join thousands of investors who trust our agency to navigate Egypt real estate. 
            Get tailored recommendations and market insights.
          </p>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <Input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-accent"
              />
            </div>
          </div>

          {/* Interested In */}
          <div>
            <label htmlFor="interestedIn" className="block text-sm font-medium mb-2">
              I am interested in
            </label>
            <Select value={formData.interestedIn} onValueChange={(value) => handleChange("interestedIn", value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select one..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="end-user">End User</SelectItem>
                <SelectItem value="broker">Broker</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="job-seeker">Job Seeker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
              Phone Number *
            </label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-[100px] bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+20">+20 EG</SelectItem>
                  <SelectItem value="+971">+971 AE</SelectItem>
                  <SelectItem value="+1">+1 US</SelectItem>
                  <SelectItem value="+44">+44 UK</SelectItem>
                  <SelectItem value="+966">+966 SA</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="XX XXX XXXX"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="your.email@example.com"
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-accent"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="interest-message" className="block text-sm font-medium mb-2">
              Tell us more
            </label>
            <Textarea
              id="interest-message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Share preferences, budget, or the property you're eyeing"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11 sm:h-12 text-sm sm:text-base"
            disabled={submitting}
          >
            <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {submitting ? "Submitting..." : "Register Interest"}
          </Button>

          <p className="text-[10px] sm:text-xs text-white/60 text-center leading-relaxed">
            By registering, you agree to receive property updates from our agency.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterInterestDialog;
