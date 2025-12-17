import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminGlassCardProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
}

const AdminGlassCard = ({
  eyebrow,
  title,
  description,
  rightSlot,
  children,
  className,
}: AdminGlassCardProps) => {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#050816] via-[#020617] to-[#020617] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)] text-slate-50",
        className,
      )}
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-40 w-40 rounded-full bg-luxury-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

      {(eyebrow || title || description || rightSlot) && (
        <div className="relative z-10 mb-4 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-sm text-slate-400">{eyebrow}</p>
            )}
            {title && (
              <h3 className="text-2xl font-display font-semibold leading-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            )}
          </div>
          {rightSlot && <div className="relative z-10 shrink-0">{rightSlot}</div>}
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AdminGlassCard;
