import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import PageHero from "@/components/PageHero";

interface TermsSection {
  title: string;
  body?: string;
  bullets?: string[];
}

const TermsAndConditions = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const privacySections = t("terms.privacySections", { returnObjects: true }) as TermsSection[];
  const termsSections = t("terms.termsSections", { returnObjects: true }) as TermsSection[];

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow={t("terms.heroEyebrow")}
        title={t("terms.heroTitle")}
        description={t("terms.heroSubtitle")}
        icon={FileText}
        backgroundImage="/crystalpattern.png"
        isPattern={true}
      />

      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-8 sm:p-10 shadow-2xl shadow-black/10">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{t("terms.companyLine")}</p>
              <h2 className="mt-4 text-3xl font-display font-bold text-primary">{t("terms.privacyTitle")}</h2>
              <div className="mt-8 space-y-6">
                {privacySections.map((section) => (
                  <div key={section.title} className="space-y-3">
                    <h3 className="text-xl font-semibold text-primary">{section.title}</h3>
                    {section.body ? (
                      <p className="text-muted-foreground whitespace-pre-line">{section.body}</p>
                    ) : null}
                    {section.bullets?.length ? (
                      <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                        {section.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-8 sm:p-10 shadow-2xl shadow-black/10">
              <h2 className="text-3xl font-display font-bold text-primary">{t("terms.termsTitle")}</h2>
              <div className="mt-8 space-y-6">
                {termsSections.map((section) => (
                  <div key={section.title} className="space-y-3">
                    <h3 className="text-xl font-semibold text-primary">{section.title}</h3>
                    {section.body ? (
                      <p className="text-muted-foreground whitespace-pre-line">{section.body}</p>
                    ) : null}
                    {section.bullets?.length ? (
                      <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                        {section.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-border/60 bg-muted/30 p-6">
                <h3 className="text-xl font-semibold text-primary">{t("terms.governingTitle")}</h3>
                <p className="mt-3 text-muted-foreground whitespace-pre-line">{t("terms.governingBody")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;
