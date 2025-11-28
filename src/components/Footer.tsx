import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-luxury-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand & Description */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img 
                src="/crystaldbclogo.jpeg" 
                alt="CrystalDBC Logo" 
                className="h-12 w-auto"
              />
            </Link>
            <h3 className="text-lg font-display font-semibold mb-3">CrystalDBC</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Your trusted partner in Egypt real estate. We provide premium properties and exceptional service to help you find your perfect home or investment opportunity.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:800110220" className="text-white/70 hover:text-accent transition-colors">
                  Toll-Free (800) 110-220
                </a>
              </li>
              <li>
                <a href="mailto:info@crystaldbc.com" className="text-white/70 hover:text-accent transition-colors">
                  info@crystaldbc.com
                </a>
              </li>
              <li className="text-white/70">
                Egypt
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
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
                  Info
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-lg font-display font-semibold mb-4">Property Types</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Apartment</li>
              <li>Villa</li>
              <li>Townhouse</li>
              <li>Penthouse</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/70 text-sm">
          <p>&copy; {new Date().getFullYear()} CrystalDBC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
