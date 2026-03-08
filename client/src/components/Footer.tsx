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
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent" />
      <div className="absolute top-0 left-1/4 w-48 h-48 bg-luxury-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <img src="/crystaldbclogo.png" alt="CrystalDBC Logo" className="h-40 w-auto transition-transform duration-500 group-hover:scale-105" />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">{content.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-5 text-white/90">Contact Us</h3>
            <div className="w-8 h-0.5 bg-luxury-gold/50 mb-5" />
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 text-white/70 group">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                  <Phone className="h-4 w-4 text-accent" />
                </div>
                <a href={`tel:${content.contact.phone}`} className="hover:text-accent transition-colors duration-300">
                  {content.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/70 group">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                  <Mail className="h-4 w-4 text-accent" />
                </div>
                <a href={`mailto:${content.contact.email}`} className="hover:text-accent transition-colors duration-300">
                  {content.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/70 group">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                {content.contact.location}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-5 text-white/90">Quick Links</h3>
            <div className="w-8 h-0.5 bg-luxury-gold/50 mb-5" />
            <ul className="space-y-3 text-sm">
              {content.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="group flex items-center gap-2 text-white/60 hover:text-accent transition-all duration-300 hover:translate-x-1">
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    <span className="animated-underline">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold mb-5 text-white/90">Property Types</h3>
            <div className="w-8 h-0.5 bg-luxury-gold/50 mb-5" />
            <ul className="flex flex-wrap gap-2 text-sm text-white/70">
              {content.propertyTypes.map((type) => (
                <li key={type} className="rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 hover:border-luxury-gold/30 hover:bg-luxury-gold/5 transition-all duration-300 cursor-default">
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

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-white/50 text-sm">&copy; {new Date().getFullYear()} CrystalDBC (Crystal DBC). All rights reserved.</p>
          {/* SEO-rich semantic footer content for search engine crawlers */}
          <div className="sr-only" aria-hidden="true">
            <h2>CrystalDBC - Luxury Real Estate Worldwide</h2>
            <p>CrystalDBC (Crystal DBC, crystaldbc, crstaldbc, CRYSTALDBC, Crystal-DBC) is a premier luxury real estate company founded in 2002, specializing in exclusive properties, villas, penthouses, and high-yield real estate investments.</p>
            <p>Our markets: Dubai luxury real estate, Cairo luxury villas, Egypt Red Sea properties, Riyadh Saudi Arabia real estate, Germany premium apartments, Russia elite properties.</p>
            <p lang="ar" dir="rtl">كريستال دي بي سي - عقارات فاخرة في دبي ومصر والسعودية وألمانيا وروسيا. فلل فاخرة، شقق بنتهاوس، استثمار عقاري عالي العائد.</p>
            <p lang="de">CrystalDBC - Luxusimmobilien in Dubai, Ägypten, Saudi-Arabien, Deutschland und Russland. Luxusvillen, Penthäuser, Premium-Apartments und renditestarke Immobilieninvestitionen.</p>
            <p lang="ru">CrystalDBC - Элитная недвижимость в Дубае, Египте, Саудовской Аравии, Германии и России. Роскошные виллы, пентхаусы, апартаменты премиум-класса и высокодоходные инвестиции в недвижимость.</p>
            <p lang="fr">CrystalDBC - Immobilier de luxe à Dubaï, Égypte, Arabie Saoudite, Allemagne et Russie. Villas de luxe, penthouses, appartements haut de gamme et investissements immobiliers à haut rendement.</p>
            <p lang="es">CrystalDBC - Bienes raíces de lujo en Dubái, Egipto, Arabia Saudita, Alemania y Rusia. Villas de lujo, penthouses, apartamentos premium e inversiones inmobiliarias de alto rendimiento.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
