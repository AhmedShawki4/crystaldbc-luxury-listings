import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeroStat {
  label: string;
  value: string;
  helper?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  icon: LucideIcon;
  backgroundImage?: string;
  actions?: ReactNode;
  stats?: PageHeroStat[];
  className?: string;
}

const PageHero = ({
  eyebrow,
  title,
  description,
  icon: Icon,
  backgroundImage,
  actions,
  stats,
  className,
}: PageHeroProps) => (
  <section
    className={cn(
      "relative isolate overflow-hidden border-b border-white/10 bg-gradient-to-br from-luxury-dark via-luxury-dark/95 to-[#111] pt-28 pb-16 text-white",
      className
    )}
  >
    {backgroundImage ? (
      <div className="absolute inset-0">
        <img src={backgroundImage} alt="Section background" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-luxury-dark/90" />
      </div>
    ) : null}
    <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-luxury-gold/20 blur-[120px]" aria-hidden />
    <div className="absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-accent/20 blur-[120px]" aria-hidden />

    <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr),auto] lg:items-center">
        <div className="space-y-6">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
              {eyebrow}
            </span>
          ) : null}
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <Icon className="h-7 w-7" />
            </span>
            <h1 className="text-4xl font-display font-bold leading-tight md:text-5xl">
              {title}
            </h1>
          </div>
          <p className="text-lg text-white/80 md:text-xl">{description}</p>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {stats && stats.length > 0 ? (
          <div className="grid min-w-[240px] gap-4 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
            {stats.map((stat) => (
              <div key={`${stat.label}-${stat.value}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-3xl font-display font-bold text-white">{stat.value}</p>
                <p className="text-sm uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
                {stat.helper ? <p className="text-xs text-white/60">{stat.helper}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  </section>
);

export default PageHero;
