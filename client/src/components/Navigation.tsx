import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, loading } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/listings" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    ...(isAuthenticated ? [{ name: "Wishlist", path: "/wishlist" }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Use dark background with backdrop blur when scrolled, not on homepage, or mobile menu is open
  const useDarkNav = scrolled || !isHomePage || isOpen;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      useDarkNav ? "bg-luxury-dark/95 backdrop-blur-md shadow-lg" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/crystaldbclogo.jpeg" 
              alt="CrystalDBC Logo" 
              className="h-14 w-auto drop-shadow-lg transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors relative py-2 text-white drop-shadow-lg",
                  isActive(link.path)
                    ? "text-white"
                    : "text-white/90 hover:text-white",
                  "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300",
                  isActive(link.path) && "after:scale-x-100",
                  "hover:after:scale-x-100"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <span className="text-white/80 text-sm">Checking session...</span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3 text-white">
                <div className="text-right">
                  <p className="text-sm font-semibold leading-none">{user?.name}</p>
                  <p className="text-xs text-white/70 capitalize">{user?.role}</p>
                </div>
                {(user?.role === "admin" || user?.role === "employee") && (
                  <Button asChild variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10">
                    <Link to="/admin">Dashboard</Link>
                  </Button>
                )}
                <Button variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-white hover:text-white/80">
                  <Link to="/auth/login">Log in</Link>
                </Button>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/auth/register">Create Account</Link>
                </Button>
              </>
            )}
            <Button asChild variant="default" className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm drop-shadow-lg">
              <Link to="/contact">Schedule Viewing</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white hover:text-white/80 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-white/20">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-base font-medium transition-colors py-2",
                    isActive(link.path) ? "text-accent" : "text-white/90 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {loading ? (
                <span className="text-white/80 text-sm">Checking session...</span>
              ) : isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  {(user?.role === "admin" || user?.role === "employee") && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="text-white font-semibold"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="text-left text-white/90 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                  <Link to="/auth/login" onClick={() => setIsOpen(false)} className="text-white font-semibold">
                    Log in
                  </Link>
                  <Link to="/auth/register" onClick={() => setIsOpen(false)} className="text-white">
                    Create Account
                  </Link>
                </div>
              )}
              <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/contact" onClick={() => setIsOpen(false)}>
                  Schedule Viewing
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
