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
} from "lucide-react";

const NAV_ITEMS: Array<{ to: string; label: string; exact?: boolean; roles?: Role[]; icon: LucideIcon }> = [
  { to: "/admin", label: "Overview", exact: true, roles: ["admin", "employee"], icon: Gauge },
  { to: "/admin/properties", label: "Properties", roles: ["admin", "employee"], icon: Building2 },
  { to: "/admin/projects", label: "Trending Projects", roles: ["admin", "employee"], icon: Sparkles },
  { to: "/admin/cms", label: "CMS", roles: ["admin", "employee"], icon: PenSquare },
  { to: "/admin/leads", label: "Leads", roles: ["admin", "employee"], icon: Users2 },
  { to: "/admin/messages", label: "Messages", roles: ["admin", "employee"], icon: Mail },
  { to: "/admin/reports", label: "Reports", roles: ["admin", "employee"], icon: BarChart3 },
  { to: "/admin/activity", label: "Activity Logs", roles: ["admin"], icon: ClipboardList },
  { to: "/admin/users", label: "Users", roles: ["admin"], icon: ShieldCheck },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-gradient-to-b from-[#030b14] via-luxury-dark to-[#0a1a2a] text-white hidden md:flex flex-col shadow-2xl">
        <div className="px-6 py-8 border-b border-white/10 space-y-3">
          <h2 className="text-2xl font-display font-bold">Admin</h2>
          <p className="text-sm text-white/70 mt-1">{user?.name}</p>
          <p className="text-xs text-white/50 uppercase">{user?.role}</p>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-luxury-gold to-luxury-dark text-white hover:from-luxury-gold/80 hover:to-luxury-dark/80 shadow-lg"
            variant="secondary"
          >
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.filter((item) => !item.roles || (user?.role && item.roles.includes(user.role))).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all border border-transparent ${
                    isActive
                      ? "bg-white/10 text-white border-white/20 shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/5 border-white/5"
                  }`
                }
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="px-4 py-6 border-t-2 border-luxury-gold bg-gradient-to-r from-luxury-dark via-luxury-gold/10 to-luxury-dark/80 space-y-3 rounded-b-xl shadow-lg">
          <Button asChild className="w-full bg-luxury-gold text-luxury-dark font-bold shadow-md hover:bg-luxury-gold/90 border border-luxury-dark">
            <Link to="/">Go to Homepage</Link>
          </Button>
          <Button variant="destructive" className="w-full" onClick={logout}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 bg-muted/20 min-h-screen">
        <header className="px-4 py-4 shadow-sm bg-background border-b border-border flex items-center justify-between md:hidden">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-semibold">{user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">Home</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
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
