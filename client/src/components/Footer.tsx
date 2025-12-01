import { Link } from "react-router-dom";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { FooterContent } from "@/types";

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
    <footer className="bg-luxury-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <li>
                <a href={`tel:${content.contact.phone}`} className="text-white/70 hover:text-accent transition-colors">
                  {content.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${content.contact.email}`} className="text-white/70 hover:text-accent transition-colors">
                  {content.contact.email}
                </a>
              </li>
              <li className="text-white/70">{content.contact.location}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {content.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/70 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Property Types</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {content.propertyTypes.map((type) => (
                <li key={type}>{type}</li>
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
