import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";

const BOOT_KEY = "crystaldbc_booted";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const InitialLoader = () => {
  const { t } = useTranslation();
  const [booting, setBooting] = useState(() => {
    if (typeof sessionStorage === "undefined") return true;
    return !sessionStorage.getItem(BOOT_KEY);
  });
  const [error, setError] = useState<string | null>(null);

  const subtitle = useMemo(() => {
    if (error) return error;
    return t("common.loadingListings");
  }, [error, t]);

  useEffect(() => {
    if (!booting) return;
    let cancelled = false;

    const hydrate = async () => {
      setError(null);
      try {
        const start = performance.now();
        await Promise.all([
          apiClient.get("/health"),
          apiClient.get("/properties?limit=1"),
        ]);
        const elapsed = performance.now() - start;
        const minDuration = 700;
        if (elapsed < minDuration) {
          await sleep(minDuration - elapsed);
        }
        if (!cancelled) {
          sessionStorage.setItem(BOOT_KEY, "true");
          setBooting(false);
        }
      } catch (_err) {
        if (!cancelled) {
          setError(t("common.messageFailed"));
        }
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [booting, t]);

  if (!booting && !error) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0b1424] via-[#0a0f1a] to-[#0e1625] text-white">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(255,215,128,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(110,207,255,0.08),transparent_32%)]" aria-hidden />
      <div className="relative z-10 mx-6 max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/60">{t("common.loading")}</p>
            <p className="text-xl font-semibold text-white">{subtitle}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-white/70">
          {t("layout.tagline")} · {t("layout.locations")}
        </p>
        {error && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <span>{error}</span>
            <Button size="sm" variant="outline" className="border-white/40" onClick={() => setBooting(true)}>
              {t("common.tryAgain")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InitialLoader;
