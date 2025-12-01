import { Link, NavLink, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";

const NAV_ITEMS: Array<{ to: string; label: string; exact?: boolean; roles?: Role[] }> = [
  { to: "/admin", label: "Overview", exact: true, roles: ["admin", "employee"] },
  { to: "/admin/properties", label: "Properties", roles: ["admin", "employee"] },
  { to: "/admin/projects", label: "Trending Projects", roles: ["admin", "employee"] },
  { to: "/admin/cms", label: "CMS", roles: ["admin", "employee"] },
  { to: "/admin/leads", label: "Leads", roles: ["admin", "employee"] },
  { to: "/admin/messages", label: "Messages", roles: ["admin", "employee"] },
  { to: "/admin/reports", label: "Reports", roles: ["admin", "employee"] },
  { to: "/admin/activity", label: "Activity Logs", roles: ["admin"] },
  { to: "/admin/users", label: "Users", roles: ["admin"] },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-luxury-dark text-white hidden md:flex flex-col">
        <div className="px-6 py-8 border-b border-white/10 space-y-3">
          <h2 className="text-2xl font-display font-bold">Admin</h2>
          <p className="text-sm text-white/70 mt-1">{user?.name}</p>
          <p className="text-xs text-white/50 uppercase">{user?.role}</p>
          <Button
            asChild
            className="w-full bg-white text-luxury-dark hover:bg-white/90"
            variant="secondary"
          >
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.filter((item) => !item.roles || (user?.role && item.roles.includes(user.role))).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-white/10" : "text-white/80 hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-6 border-t border-white/10 space-y-3">
          <Button asChild variant="outline" className="w-full">
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
