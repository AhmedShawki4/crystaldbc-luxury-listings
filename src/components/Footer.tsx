import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-luxury-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img 
                src="/crystaldbclogo.jpeg" 
                alt="CrystalDBC Logo" 
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-white/70 mb-4">
              Excellence in luxury real estate since 1995
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/70 hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/listings" className="text-white/70 hover:text-accent transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/70 hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-white/70">
              <li>Property Sales</li>
              <li>Property Management</li>
              <li>Investment Consulting</li>
              <li>Market Analysis</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-white/70">
              <li>123 Luxury Avenue</li>
              <li>Beverly Hills, CA 90210</li>
              <li className="pt-2">
                <a href="tel:+18885551234" className="hover:text-accent transition-colors">
                  +1 (888) 555-1234
                </a>
              </li>
              <li>
                <a href="mailto:info@crystaldbc.com" className="hover:text-accent transition-colors">
                  info@crystaldbc.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} CrystalDBC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
