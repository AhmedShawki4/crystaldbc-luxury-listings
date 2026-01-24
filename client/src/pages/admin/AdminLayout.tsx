import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import type { Role } from "@/types";
import type { LucideIcon } from "lucide-react";
import {
  Gauge,
  Building2,
  Sparkles,
  PenSquare,
  Users2,
  Mail,
  BarChart3,
  ClipboardList,
  ShieldCheck,
  PanelLeft,
  LogOut,
  Home,
  CircleDollarSign,
  HandCoins,
  Package,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useTranslation } from "react-i18next";

const NAV_ITEMS: Array<{ to: string; labelKey: string; exact?: boolean; roles?: Role[]; icon: LucideIcon }> = [
  { to: "/admin", labelKey: "admin.nav.overview", exact: true, roles: ["admin", "employee", "property-handler"], icon: Gauge },
  { to: "/admin/properties", labelKey: "admin.nav.properties", roles: ["admin", "employee", "property-handler"], icon: Building2 },
  { to: "/admin/rentals", labelKey: "admin.nav.rentals", roles: ["admin", "employee", "property-handler"], icon: HandCoins },
  { to: "/admin/projects", labelKey: "admin.nav.trendingProjects", roles: ["admin", "employee"], icon: Sparkles },
  { to: "/admin/cms", labelKey: "admin.nav.cms", roles: ["admin", "employee"], icon: PenSquare },
  { to: "/admin/leads", labelKey: "admin.nav.leads", roles: ["admin", "employee"], icon: Users2 },
  { to: "/admin/messages", labelKey: "admin.nav.messages", roles: ["admin", "employee"], icon: Mail },
  { to: "/admin/reports", labelKey: "admin.nav.reports", roles: ["admin", "employee"], icon: BarChart3 },
  { to: "/admin/activity", labelKey: "admin.nav.activityLogs", roles: ["admin"], icon: ClipboardList },
  { to: "/admin/users", labelKey: "admin.nav.users", roles: ["admin"], icon: ShieldCheck },
  { to: "/admin/investments", labelKey: "admin.nav.investments", roles: ["admin"], icon: CircleDollarSign },
  { to: "/admin/investment-boxes", labelKey: "admin.nav.investmentBoxes", roles: ["admin"], icon: Package },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  // Fetch pending investments count
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["pending-investments-count"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/investments?status=Pending");
        return data.investments?.length || 0;
      } catch (error) {
        return 0;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-gradient-to-b from-[#030b14] via-luxury-dark to-[#0a1a2a] text-white hidden md:flex flex-col shadow-2xl">
        <div className="px-6 py-8 border-b border-white/10 space-y-3">
          <h2 className="text-2xl font-display font-bold">{t("admin.layout.adminTitle")}</h2>
          <p className="text-sm text-white/70 mt-1">{user?.name}</p>
          <p className="text-xs text-white/50 uppercase">{user?.role}</p>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-luxury-gold to-luxury-dark text-white hover:from-luxury-gold/80 hover:to-luxury-dark/80 shadow-lg"
            variant="secondary"
          >
            <Link to="/">{t("admin.layout.backToHome")}</Link>
          </Button>
          <Button
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10"
            onClick={() => {
              const nextLang = i18n.language === "ar" ? "en" : "ar";
              i18n.changeLanguage(nextLang);
              localStorage.setItem("i18nextLng", nextLang);
            }}
          >
            {t("admin.layout.toggleLanguage")}
          </Button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto selection:bg-luxury-gold/30 custom-scrollbar">
          {NAV_ITEMS.filter((item) => !item.roles || (user?.role && item.roles.includes(user.role))).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all border border-transparent ${isActive
                    ? "bg-white/10 text-white border-white/20 shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/5 border-white/5"
                  }`
                }
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">{t(item.labelKey)}</span>
                {/* Show notification badge for Investments */}
                {item.to === "/admin/investments" && pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-4 py-6 border-t-2 border-luxury-gold bg-gradient-to-r from-luxury-dark via-luxury-gold/10 to-luxury-dark/80 space-y-3 rounded-b-xl shadow-lg">

          <Button variant="destructive" className="w-full" onClick={logout}>
            {t("admin.layout.signOut")}
          </Button>
        </div>
      </aside>

      <div className="flex-1 bg-[#020617] min-h-screen">
        <header className="sticky top-0 z-50 px-4 py-4 shadow-md bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between md:hidden">
          <div>
            <p className="text-sm text-muted-foreground">{t("admin.layout.signedInAs")}</p>
            <p className="font-semibold">{user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="mr-2 border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold/10 hover:text-luxury-gold hover:border-luxury-gold/60 transition-colors">
              <Link to="/" title={t("admin.layout.goToHomepage")} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">{t("admin.layout.goToHomepage")}</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20"
              onClick={() => {
                const nextLang = i18n.language === "ar" ? "en" : "ar";
                i18n.changeLanguage(nextLang);
                localStorage.setItem("i18nextLng", nextLang);
              }}
            >
              {t("admin.layout.toggleLanguageShort")}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <PanelLeft className="h-4 w-4" />
                  {t("admin.layout.menuButton")}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-gradient-to-b from-[#030b14] via-luxury-dark to-[#0a1a2a] text-white p-0 flex flex-col h-full">
                <SheetHeader className="px-4 pt-5 pb-3 border-b border-white/10 text-left">
                  <SheetTitle className="text-lg font-display text-white">{t("admin.layout.adminMenu")}</SheetTitle>
                  <p className="text-xs text-white/60">{user?.name} · {user?.role}</p>
                </SheetHeader>
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                  {NAV_ITEMS.filter((item) => !item.roles || (user?.role && item.roles.includes(user.role))).map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all border border-transparent ${isActive
                            ? "bg-white/10 text-white border-white/20 shadow-lg"
                            : "text-white/70 hover:text-white hover:bg-white/5 border-white/5"
                          }`
                        }
                      >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>{t(item.labelKey)}</span>
                      </NavLink>
                    );
                  })}
                </nav>
                <div className="px-3 py-4 border-t border-white/10 space-y-2">

                  <Button variant="outline" className="w-full border-white/30 text-white" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("admin.layout.signOut")}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
