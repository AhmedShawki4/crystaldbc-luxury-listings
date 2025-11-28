import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Building2, User, Mail, Phone, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface RegisterInterestDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const RegisterInterestDialog = ({ open: externalOpen, onOpenChange }: RegisterInterestDialogProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    interestedIn: "",
    phoneNumber: "",
    email: "",
  });
  const { toast } = useToast();

  // Determine if we're using external or internal control
  const isExternallyControlled = externalOpen !== undefined;
  const isOpen = isExternallyControlled ? externalOpen : internalOpen;
  const setIsOpen = isExternallyControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  useEffect(() => {
    // Only show dialog automatically if not externally controlled
    if (isExternallyControlled) return;
    
    // Show dialog after 3 seconds on every page navigation
    const timer = setTimeout(() => {
      setInternalOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.pathname, isExternallyControlled]); // Trigger when route changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store the registration data (you can later send this to a backend)
    const registrationData = {
      ...formData,
      timestamp: new Date().toISOString(),
    };
    
    // For now, just log it (later you can send to API)
    console.log("Registration Data:", registrationData);
    
    // Store registration data
    const existingData = localStorage.getItem("userRegistrations");
    const registrations = existingData ? JSON.parse(existingData) : [];
    registrations.push(registrationData);
    localStorage.setItem("userRegistrations", JSON.stringify(registrations));
    
    toast({
      title: "Registration Successful!",
      description: "Thank you for your interest. We'll be in touch soon.",
    });
    
    setIsOpen(false);
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
              <Select defaultValue="+20">
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

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11 sm:h-12 text-sm sm:text-base"
          >
            <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Register Interest
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
