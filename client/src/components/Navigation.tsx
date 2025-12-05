import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { Menu, X, Home, Building2, Info, PhoneCall, Heart, Sparkles, TrendingUp, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";

type NavLinkItem = {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, loading } = useAuth();

  const navLinks: NavLinkItem[] = [
    { name: "Home", path: "/", icon: Home },
    { name: "Properties", path: "/listings", icon: Building2 },
    { name: "For Rent", path: "/for-rent", icon: KeyRound },
    { name: "Investment", path: "/investment", icon: TrendingUp },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: PhoneCall },
  ];

  if (isAuthenticated) {
    navLinks.push({ name: "Wishlist", path: "/wishlist", icon: Heart });
  }

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
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/10 pt-[env(safe-area-inset-top)]",
        useDarkNav
          ? "bg-gradient-to-r from-luxury-dark via-luxury-dark/95 to-[#111]/90 backdrop-blur-xl shadow-2xl"
          : "bg-transparent"
      )}
    >
      <div className="absolute inset-x-1/2 top-3 hidden h-10 w-[60%] -translate-x-1/2 rounded-full bg-white/10 blur-3xl lg:block" aria-hidden />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:flex items-center justify-between pb-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-luxury-gold" />
            Luxury Experience
          </span>
          <span className="text-white/40">Egypt | Dubai | Riyadh</span>
        </div>
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/crystaldbclogo.jpeg"
              alt="CrystalDBC Logo"
              className="h-12 md:h-14 w-auto drop-shadow-lg transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "group relative inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-all",
                    isActive(link.path)
                      ? "border-white/40 bg-white/15 text-white shadow-lg shadow-black/20"
                      : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="tracking-wide">{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
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
            className="lg:hidden p-2 text-white hover:text-white/80 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-6 border-t border-white/20 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 min-h-[44px]",
                      isActive(link.path)
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/10 bg-transparent text-white/90"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-base font-medium">{link.name}</span>
                  </Link>
                );
              })}
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
              <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground w-full">
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
