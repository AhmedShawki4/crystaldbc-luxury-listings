import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
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

  const { t } = useTranslation();

  // Show popup only for guests (not logged in)
  const isGuest = !user;
  const hideOnAuth = location.pathname.startsWith("/auth");
  const hideOnLegal = location.pathname.startsWith("/terms");

  const promptStorageKey = useMemo(() => `crystaldbc:lastInterestPrompt:guest`, []);

  // Determine if we're using external or internal control
  const isExternallyControlled = externalOpen !== undefined;
  const isOpen = isExternallyControlled ? externalOpen : internalOpen;
  const setIsOpen = isExternallyControlled ? (onOpenChange || (() => { })) : setInternalOpen;

  useEffect(() => {
    if (isExternallyControlled) return;
    if (typeof window === "undefined") return;

    const lastPrompt = window.localStorage.getItem(promptStorageKey);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (lastPrompt && Date.now() - Number(lastPrompt) < twentyFourHours) {
      return;
    }

    const timer = setTimeout(() => {
      setInternalOpen(true);
      window.localStorage.setItem(promptStorageKey, Date.now().toString());
    }, 30000);

    return () => clearTimeout(timer);
  }, [location.pathname, isExternallyControlled, promptStorageKey]);

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!isExternallyControlled && nextOpen && typeof window !== "undefined") {
      window.localStorage.setItem(promptStorageKey, Date.now().toString());
    }
  };

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
        title: t("registerInterest.toasts.successTitle"),
        description: t("registerInterest.toasts.successDesc"),
      });
      setFormData(initialFormState);
      setCountryCode("+20");
      setIsOpen(false);
    } catch (error) {
      console.error("Register interest failed", error);
      toast({
        title: t("registerInterest.toasts.errorTitle"),
        description: t("registerInterest.toasts.errorDesc"),
        variant: "destructive"
      });
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

  if (!isGuest || hideOnAuth || hideOnLegal) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="fixed bottom-0 left-0 right-0 top-auto w-full max-w-none rounded-t-2xl rounded-b-none border-t border-white/20 bg-luxury-dark p-0 dialog-scroll overflow-y-auto max-h-[85vh] sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:right-auto sm:w-full sm:max-w-[500px] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:top-3 [&>button]:right-3 sm:[&>button]:top-4 sm:[&>button]:right-4 [&>button>svg]:h-5 [&>button>svg]:w-5 [&>button]:z-10">
        {/* Mobile Handle */}
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full" />

        {/* Header */}
        <div className="px-4 sm:px-6 pt-8 pb-4 sm:pt-6 sm:pb-4 sticky top-0 z-10 border-b border-white/10 bg-luxury-dark/85 backdrop-blur">
          <div className="flex items-center gap-3 pr-8 sm:pr-10">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-display font-bold text-white mb-1">
                {t("registerInterest.title")}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                {t("registerInterest.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3 sm:px-6 sm:py-5 sm:space-y-4">
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {t("registerInterest.description")}
          </p>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              {t("registerInterest.fullName")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <Input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder={t("registerInterest.fullNamePlaceholder")}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-accent"
              />
            </div>
          </div>

          {/* Interested In */}
          <div>
            <label htmlFor="interestedIn" className="block text-sm font-medium mb-2">
              {t("registerInterest.interestedIn")}
            </label>
            <Select value={formData.interestedIn} onValueChange={(value) => handleChange("interestedIn", value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder={t("registerInterest.selectOne")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="end-user">{t("registerInterest.options.endUser")}</SelectItem>
                <SelectItem value="broker">{t("registerInterest.options.broker")}</SelectItem>
                <SelectItem value="investor">{t("registerInterest.options.investor")}</SelectItem>
                <SelectItem value="job-seeker">{t("registerInterest.options.jobSeeker")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
              {t("registerInterest.phoneNumber")}
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
                  placeholder={t("registerInterest.phoneNumberPlaceholder")}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t("registerInterest.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={t("registerInterest.emailPlaceholder")}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-accent"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="interest-message" className="block text-sm font-medium mb-2">
              {t("registerInterest.tellUsMore")}
            </label>
            <Textarea
              id="interest-message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder={t("registerInterest.messagePlaceholder")}
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
            {submitting ? t("registerInterest.submitting") : t("registerInterest.submit")}
          </Button>

          <p className="text-[10px] sm:text-xs text-white/60 text-center leading-relaxed">
            {t("registerInterest.disclaimer")}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterInterestDialog;
