import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { Menu, X, Home, Building2, Info, PhoneCall, Heart, Sparkles, TrendingUp, KeyRound, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { US, EG, DE, RU } from 'country-flag-icons/react/3x2';
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
    { code: "en", label: "EN", Flag: US },
    { code: "ar", label: "AR", Flag: EG },
    { code: "de", label: "DE", Flag: DE },
    { code: "ru", label: "RU", Flag: RU },
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
      <div className="pointer-events-none absolute inset-x-1/2 top-3 hidden h-10 w-[60%] -translate-x-1/2 rounded-full bg-white/10 blur-3xl lg:block" aria-hidden />
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
                    "group relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] md:text-sm font-medium transition-all shrink-0 whitespace-nowrap",
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
            <div className="relative group">
              <button
                type="button"
                onClick={() => document.getElementById('lang-desktop')?.classList.toggle('hidden')}
                onBlur={() => setTimeout(() => document.getElementById('lang-desktop')?.classList.add('hidden'), 200)}
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/15 px-3 py-1.5 text-white text-sm transition-all"
              >
                <div className="w-5 h-3.5 flex-shrink-0">
                  {(() => {
                    const FlagComponent = languages.find(l => l.code === activeLang)?.Flag;
                    return FlagComponent ? <FlagComponent /> : null;
                  })()}
                </div>
                <span className="font-medium">{languages.find(l => l.code === activeLang)?.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
              <div id="lang-desktop" className="hidden absolute right-0 mt-2 w-36 rounded-lg border border-white/20 bg-luxury-dark/95 backdrop-blur-xl shadow-xl overflow-hidden z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      document.getElementById('lang-desktop')?.classList.add('hidden');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      activeLang === lang.code
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="w-5 h-3.5 flex-shrink-0">
                      <lang.Flag />
                    </div>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <span className="text-white/80 text-sm">Checking session...</span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3 text-white">
                <div className="text-right">
                  <p className="text-sm font-semibold leading-none">{user?.name}</p>
                  <p className="text-[11px] text-white/70 capitalize">{user?.role}</p>
                </div>
                {(user?.role === "admin" || user?.role === "employee" || user?.role === "property-handler") && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-9 border-white/30 text-white bg-transparent px-3 transition-colors hover:border-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/10"
                  >
                    <Link to="/admin">{t("nav.dashboard")}</Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="h-9 border-white/30 text-white bg-transparent px-3 transition-colors hover:border-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/10"
                  onClick={logout}
                >
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
              <div className="border-t border-white/10 pt-4">
                <span className="text-white/80 text-sm mb-2 block">Language</span>
                <div className="flex flex-col gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-all ${
                        activeLang === lang.code
                          ? 'border-white/30 bg-white/15 text-white'
                          : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-6 h-4 flex-shrink-0">
                        <lang.Flag />
                      </div>
                      <span className="font-medium">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <span className="text-white/80 text-sm">Checking session...</span>
              ) : isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  {(user?.role === "admin" || user?.role === "employee" || user?.role === "property-handler") && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border px-3 py-2.5 min-h-[44px] border-white/30 bg-white/10 text-white font-semibold transition-all hover:border-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/10"
                      )}
                    >
                      <Sparkles className="h-5 w-5" />
                      <span className="text-base">{t("nav.dashboard")}</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-2xl border px-3 py-2.5 min-h-[44px] border-red-400/40 bg-red-500/10 text-red-300 font-semibold transition-all hover:border-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/10"
                  >
                    <X className="h-5 w-5" />
                    <span className="text-base">{t("nav.logout")}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
                  <Link 
                    to="/auth/login" 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center justify-center rounded-lg border border-white/30 bg-white/10 hover:bg-white/15 px-4 py-3 text-white font-semibold transition-all"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link 
                    to="/auth/register" 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center justify-center rounded-lg bg-accent hover:bg-accent/90 px-4 py-3 text-accent-foreground font-semibold shadow-lg transition-all"
                  >
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
