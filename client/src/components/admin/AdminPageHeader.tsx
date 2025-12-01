import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  actions?: ReactNode;
}

const AdminPageHeader = ({ title, description, icon: Icon, className, actions }: AdminPageHeaderProps) => (
  <div
    className={cn(
      "flex flex-col gap-6 rounded-3xl border border-border/70 bg-gradient-to-r from-background via-muted/60 to-background/80 p-6 shadow-xl md:flex-row md:items-center md:justify-between",
      className
    )}
  >
    <div className="flex items-start gap-4">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-luxury-gold/15 text-luxury-gold">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground/70">Dashboard</p>
        <h1 className="text-3xl font-display font-bold text-primary">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
  </div>
);

export default AdminPageHeader;
