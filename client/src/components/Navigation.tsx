import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { Menu, X, Home, Building2, Info, PhoneCall, Heart, Sparkles, TrendingUp, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();
  const languages = [
    { code: "en", label: "EN" },
    { code: "ar", label: "AR" },
    { code: "de", label: "DE" },
  ];
  const [activeLang, setActiveLang] = useState(i18n.language || "en");

  const navLinks: NavLinkItem[] = [
    { name: t("nav.home"), path: "/", icon: Home },
    { name: t("nav.properties"), path: "/listings", icon: Building2 },
    { name: t("nav.forRent"), path: "/for-rent", icon: KeyRound },
    { name: t("nav.investment"), path: "/investment", icon: TrendingUp },
    { name: t("nav.about"), path: "/about", icon: Info },
    { name: t("nav.contact"), path: "/contact", icon: PhoneCall },
  ];

  if (isAuthenticated) {
    navLinks.push({ name: t("nav.wishlist"), path: "/wishlist", icon: Heart });
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

  useEffect(() => {
    setActiveLang(i18n.language || "en");
  }, [i18n.language]);

  const handleLanguageChange = async (code: string) => {
    setActiveLang(code);
    await i18n.changeLanguage(code);
  };

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
        <div className="hidden lg:flex items-center justify-between pb-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-white/60">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-luxury-gold" />
            {t("layout.tagline")}
          </span>
          <span className="text-white/40">{t("layout.locations")}</span>
        </div>
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/crystaldbclogo.jpeg"
              alt="CrystalDBC Logo"
              className="h-10 md:h-12 w-auto drop-shadow-lg transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "group relative inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[13px] md:text-sm font-medium transition-all",
                    isActive(link.path)
                      ? "border-white/40 bg-white/15 text-white shadow-lg shadow-black/20"
                      : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="tracking-wide">{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-1.5">
            <select
              value={activeLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="rounded-md border border-white/20 bg-white/10 text-white text-xs px-2 py-1 focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-black">
                  {lang.label}
                </option>
              ))}
            </select>
            {loading ? (
              <span className="text-white/80 text-sm">Checking session...</span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3 text-white">
                <div className="text-right">
                  <p className="text-sm font-semibold leading-none">{user?.name}</p>
                  <p className="text-[11px] text-white/70 capitalize">{user?.role}</p>
                </div>
                {(user?.role === "admin" || user?.role === "employee") && (
                  <Button asChild variant="outline" className="h-9 border-white/30 text-white bg-transparent hover:bg-white/10 px-3">
                    <Link to="/admin">{t("nav.dashboard")}</Link>
                  </Button>
                )}
                <Button variant="outline" className="h-9 border-white/30 text-white bg-transparent hover:bg-white/10 px-3" onClick={logout}>
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" className="h-9 px-3 text-white hover:text-white/80">
                  <Link to="/auth/login">{t("nav.login")}</Link>
                </Button>
                <Button asChild className="h-9 px-3 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/auth/register">{t("nav.createAccount")}</Link>
                </Button>
              </>
            )}
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
                      "flex items-center gap-3 rounded-2xl border px-3 py-2.5 min-h-[44px]",
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
              <div className="flex items-center gap-2 border-t border-white/10 pt-4">
                <span className="text-white/80 text-sm">Language</span>
                <select
                  value={activeLang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 text-white text-sm px-2 py-1"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-black">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
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
                      {t("nav.dashboard")}
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
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                  <Link to="/auth/login" onClick={() => setIsOpen(false)} className="text-white font-semibold">
                    {t("nav.login")}
                  </Link>
                  <Link to="/auth/register" onClick={() => setIsOpen(false)} className="text-white">
                    {t("nav.createAccount")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
