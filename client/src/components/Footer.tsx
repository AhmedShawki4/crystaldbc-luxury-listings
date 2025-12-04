import { Link } from "react-router-dom";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { FooterContent } from "@/types";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";

const fallbackFooter: FooterContent = {
  description:
    "Your trusted partner in Egypt real estate. We provide premium properties and exceptional service to help you find your perfect home or investment opportunity.",
  contact: { phone: "(800) 110-220", email: "info@crystaldbc.com", location: "Egypt" },
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/listings" },
    { label: "Info", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  propertyTypes: ["Apartment", "Villa", "Townhouse", "Penthouse"],
  social: [],
};

const Footer = () => {
  const { data } = useCmsSection<FooterContent>("footer", fallbackFooter);
  const content = data ?? fallbackFooter;

  return (
    <footer className="relative overflow-hidden bg-luxury-dark text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-dark via-[#0b1c2c] to-[#111] opacity-90" />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/crystaldbclogo.jpeg" alt="CrystalDBC Logo" className="h-12 w-auto" />
            </Link>
            <h3 className="text-lg font-display font-semibold mb-3">CrystalDBC</h3>
            <p className="text-white/70 text-sm leading-relaxed">{content.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-white/80">
                <Phone className="h-4 w-4 text-accent" />
                <a href={`tel:${content.contact.phone}`} className="hover:text-accent transition-colors">
                  {content.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Mail className="h-4 w-4 text-accent" />
                <a href={`mailto:${content.contact.email}`} className="hover:text-accent transition-colors">
                  {content.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4 text-accent" />
                {content.contact.location}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {content.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="group flex items-center gap-2 text-white/70 hover:text-accent transition-colors">
                    <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Property Types</h3>
            <ul className="flex flex-wrap gap-2 text-sm text-white/80">
              {content.propertyTypes.map((type) => (
                <li key={type} className="rounded-full border border-white/20 px-3 py-1">
                  {type}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {content.social?.length ? (
          <div className="flex flex-wrap gap-4 border-t border-white/10 pt-6 mb-6">
            {content.social.map((item) => (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="text-white/70 hover:text-accent text-sm">
                {item.label}
              </a>
            ))}
          </div>
        ) : null}

        <div className="border-t border-white/10 pt-8 text-center text-white/70 text-sm">
          <p>&copy; {new Date().getFullYear()} CrystalDBC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
