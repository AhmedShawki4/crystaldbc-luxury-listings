import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/apiClient";
import type {
  CMSSection,
  HeroContent,
  ContactContent,
  FooterContent,
  AboutContent,
  SiteSettingsContent,
  HomeSuccessStoriesContent,
  HomePartnersContent,
  CmsLanguage,
  LocalizedContent,
  CmsContent,
} from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getMediaUrl } from "@/lib/media";
import uploadImage from "@/lib/uploadImage";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { PenSquare, Settings, DollarSign, TrendingUp, Plus, Trash2 } from "lucide-react";

const fetchSections = async () => {
  const { data } = await apiClient.get<{ sections: CMSSection[] }>("/cms");
  return data.sections;
};

const CMS_LANGUAGES: { code: CmsLanguage; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "de", label: "Deutsch" },
  { code: "ru", label: "Русский" },
];

const isLocalizedContent = <TContent,>(content: CmsContent<TContent>): content is LocalizedContent<TContent> => {
  return Boolean(content && typeof content === "object" && "translations" in (content as Record<string, unknown>));
};

const normalizeLocalizedContent = <TContent,>(
  content: CmsContent<TContent> | undefined,
  fallback: TContent,
): LocalizedContent<TContent> => {
  if (content && isLocalizedContent(content)) {
    const base = content.translations.en ?? fallback;
    return {
      translations: {
        en: content.translations.en ?? fallback,
        ar: content.translations.ar ?? base,
        de: content.translations.de ?? base,
        ru: content.translations.ru ?? base,
      },
    };
  }

  const base = (content as TContent) ?? fallback;
  return {
    translations: {
      en: base,
      ar: base,
      de: base,
      ru: base,
    },
  };
};

const normalizeHero = (content?: Partial<HeroContent>): HeroContent => ({
  heading: content?.heading ?? "",
  highlight: content?.highlight ?? "",
  subheading: content?.subheading ?? "",
  backgroundImage: content?.backgroundImage ?? "",
  primaryCta: {
    label: content?.primaryCta?.label ?? "Explore Properties",
    href: content?.primaryCta?.href ?? "/listings",
  },
  secondaryCta: {
    label: content?.secondaryCta?.label ?? "Contact Us",
    href: content?.secondaryCta?.href ?? "/contact",
  },
});

const normalizeContact = (content?: Partial<ContactContent>): ContactContent => ({
  title: content?.title ?? "",
  subtitle: content?.subtitle ?? "",
  phone: content?.phone ?? "",
  email: content?.email ?? "",
  office: content?.office ?? "",
  officeHelper: content?.officeHelper ?? "",
  officeHours: content?.officeHours ?? [],
});

const normalizeAbout = (content?: Partial<AboutContent>): AboutContent => ({
  heroImage: content?.heroImage ?? "",
  heroTitle: content?.heroTitle ?? "",
  heroSubtitle: content?.heroSubtitle ?? "",
  storyParagraphs: content?.storyParagraphs ?? [],
  impactItems: content?.impactItems ?? [],
  impactEyebrow: content?.impactEyebrow ?? "",
  impactTitle: content?.impactTitle ?? "",
  impactDescription: content?.impactDescription ?? "",
  values: content?.values ?? [],
  stats: content?.stats ?? [],
});

const normalizeFooter = (content?: Partial<FooterContent>): FooterContent => ({
  description: content?.description ?? "",
  contact: {
    phone: content?.contact?.phone ?? "",
    email: content?.contact?.email ?? "",
    location: content?.contact?.location ?? "",
  },
  quickLinks: content?.quickLinks ?? [],
  propertyTypes: content?.propertyTypes ?? [],
  social: content?.social ?? [],
});

const normalizeSiteSettings = (content?: Partial<SiteSettingsContent>): SiteSettingsContent => ({
  rentButtonEnabled: content?.rentButtonEnabled ?? true,
  investmentPageEnabled: content?.investmentPageEnabled ?? true,
  logoUrl: content?.logoUrl ?? "/crystaldbclogo.png",
});

const normalizeHomeSuccessStories = (content?: Partial<HomeSuccessStoriesContent>): HomeSuccessStoriesContent => ({
  eyebrow: content?.eyebrow ?? "",
  title: content?.title ?? "",
  stats: content?.stats ?? [],
});

const normalizeHomePartners = (content?: Partial<HomePartnersContent>): HomePartnersContent => ({
  eyebrow: content?.eyebrow ?? "",
  title: content?.title ?? "",
  subtitle: content?.subtitle ?? "",
  partners: Array.isArray(content?.partners) ? content?.partners ?? [] : [],
});

const toMultiline = (items?: string[]) => (Array.isArray(items) ? items : []).join("\n");
const fromMultiline = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const formatLinks = (links: { label: string; href: string }[]) =>
  links.map((link) => `${link.label} | ${link.href}`).join("\n");

const parseLinks = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part.trim());
      return { label, href: href || "/" };
    });

const formatSocial = (items: { label: string; href: string }[]) =>
  items.map((item) => `${item.label} | ${item.href}`).join("\n");

const parseSocial = parseLinks;

const formatAboutValues = (values: AboutContent["values"]) =>
  values.map((item) => `${item.iconKey ?? ""} | ${item.title} | ${item.description}`).join("\n");

const parseAboutValues = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [iconKey = "", title = "", description = ""] = line.split("|").map((part) => part.trim());
      return {
        iconKey: iconKey || "award",
        title,
        description,
      };
    })
    .filter((item) => item.title);

const formatAboutStats = (stats: AboutContent["stats"]) =>
  stats.map((stat) => `${stat.label} | ${stat.value}`).join("\n");

const parseAboutStats = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label = "", statValue = ""] = line.split("|").map((part) => part.trim());
      return { label, value: statValue };
    })
    .filter((item) => item.label && item.value);

    const formatSuccessStats = (stats: HomeSuccessStoriesContent["stats"]) =>
      stats.map((stat) => `${stat.value} | ${stat.label} | ${stat.desc}`).join("\n");

    const parseSuccessStats = (value: string) =>
      value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [statValue = "", label = "", desc = ""] = line.split("|").map((part) => part.trim());
          return { value: statValue, label, desc };
        })
        .filter((item) => item.value && item.label);

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ImageUploadField = ({ label, value, onChange, placeholder }: ImageUploadFieldProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast({ title: t("admin.cms.toasts.imageUploaded") });
    } catch (error) {
      console.error("CMS image upload failed", error);
      toast({ title: t("admin.cms.toasts.uploadFailed"), description: t("admin.cms.toasts.uploadFailedDesc"), variant: "destructive" });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? t("admin.cms.actions.uploading") : t("admin.cms.actions.upload")}
        </Button>
      </div>
    </div>
  );
};

interface CmsEditorProps<T> {
  section: CMSSection<T>;
  onSave: (key: string, content: CmsContent<T>) => Promise<void>;
  saving: boolean;
  language: CmsLanguage;
}

const HeroSectionEditor = ({ section, onSave, saving, language }: CmsEditorProps<HeroContent>) => {
  const { t } = useTranslation();
  const [localizedDraft, setLocalizedDraft] = useState<LocalizedContent<HeroContent>>(
    normalizeLocalizedContent(section.content as CmsContent<HeroContent>, normalizeHero()),
  );
  const [draft, setDraft] = useState<HeroContent>(localizedDraft.translations[language]);

  useEffect(() => {
    const normalized = normalizeLocalizedContent(section.content as CmsContent<HeroContent>, normalizeHero());
    setLocalizedDraft(normalized);
    setDraft(normalized.translations[language]);
  }, [section.content, language]);

  const updateDraft = (next: HeroContent) => {
    setDraft(next);
    setLocalizedDraft((prev) => ({
      translations: {
        ...prev.translations,
        [language]: next,
      },
    }));
  };

  const handleChange = (field: keyof HeroContent, value: string) => {
    updateDraft({ ...draft, [field]: value });
  };

  const handleCtaChange = (cta: "primaryCta" | "secondaryCta", field: "label" | "href", value: string) => {
    updateDraft({
      ...draft,
      [cta]: {
        ...draft[cta],
        [field]: value,
      },
    });
  };

  return (
    <AdminGlassCard
      title={t("admin.cms.hero.title")}
      description={t("admin.cms.hero.description")}
      rightSlot={
        <Button onClick={() => onSave(section.key, localizedDraft)} disabled={saving}>
          {saving ? t("admin.cms.actions.saving") : t("admin.cms.actions.save") + " Hero"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("admin.cms.hero.labels.heading")}</label>
            <Input value={draft.heading} onChange={(e) => handleChange("heading", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.hero.labels.highlight")}</label>
            <Input value={draft.highlight} onChange={(e) => handleChange("highlight", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.hero.labels.subheading")}</label>
            <Textarea value={draft.subheading} onChange={(e) => handleChange("subheading", e.target.value)} rows={3} />
          </div>
          <ImageUploadField
            label={t("admin.cms.hero.labels.backgroundImage")}
            value={draft.backgroundImage}
            onChange={(value) => handleChange("backgroundImage", value)}
            placeholder={t("admin.cms.hero.placeholders.backgroundImage")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("admin.cms.hero.labels.primaryCtaLabel")}</label>
              <Input value={draft.primaryCta.label} onChange={(e) => handleCtaChange("primaryCta", "label", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.cms.hero.labels.primaryCtaLink")}</label>
              <Input value={draft.primaryCta.href} onChange={(e) => handleCtaChange("primaryCta", "href", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.cms.hero.labels.secondaryCtaLabel")}</label>
              <Input value={draft.secondaryCta.label} onChange={(e) => handleCtaChange("secondaryCta", "label", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("admin.cms.hero.labels.secondaryCtaLink")}</label>
              <Input value={draft.secondaryCta.href} onChange={(e) => handleCtaChange("secondaryCta", "href", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-border min-h-[320px]">
          {draft.backgroundImage ? (
            <img src={getMediaUrl(draft.backgroundImage)} alt="Hero preview" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-accent/70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30" />
          <div className="relative h-full p-6 flex flex-col justify-end text-white space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">{t("admin.cms.hero.preview")}</p>
            <h4 className="text-3xl font-display font-bold">{draft.heading} <span className="text-accent block">{draft.highlight}</span></h4>
            <p className="text-white/80">{draft.subheading}</p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm">{draft.primaryCta.label}</span>
              <span className="border border-white/30 px-4 py-2 rounded-full text-sm">{draft.secondaryCta.label}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminGlassCard>
  );
};

const ContactSectionEditor = ({ section, onSave, saving, language }: CmsEditorProps<ContactContent>) => {
  const { t } = useTranslation();
  const [localizedDraft, setLocalizedDraft] = useState<LocalizedContent<ContactContent>>(
    normalizeLocalizedContent(section.content as CmsContent<ContactContent>, normalizeContact()),
  );
  const [draft, setDraft] = useState<ContactContent>(localizedDraft.translations[language]);
  const [officeHoursText, setOfficeHoursText] = useState(toMultiline(draft.officeHours));

  useEffect(() => {
    const normalized = normalizeLocalizedContent(section.content as CmsContent<ContactContent>, normalizeContact());
    setLocalizedDraft(normalized);
    setDraft(normalized.translations[language]);
    setOfficeHoursText(toMultiline(normalized.translations[language].officeHours));
  }, [section.content, language]);

  const updateDraft = (next: ContactContent) => {
    setDraft(next);
    setLocalizedDraft((prev) => ({
      translations: {
        ...prev.translations,
        [language]: next,
      },
    }));
  };

  const updateField = (field: keyof ContactContent, value: string) => {
    updateDraft({ ...draft, [field]: value });
  };

  const handleOfficeHoursChange = (value: string) => {
    setOfficeHoursText(value);
    updateDraft({ ...draft, officeHours: fromMultiline(value) });
  };

  return (
    <AdminGlassCard
      title={t("admin.cms.contact.title")}
      description={t("admin.cms.contact.description")}
      rightSlot={
        <Button onClick={() => onSave(section.key, localizedDraft)} disabled={saving}>
          {saving ? t("admin.cms.actions.saving") : t("admin.cms.actions.save") + " Contact"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("admin.cms.contact.labels.title")}</label>
            <Input value={draft.title} onChange={(e) => updateField("title", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.contact.labels.subtitle")}</label>
            <Textarea value={draft.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.contact.labels.phone")}</label>
            <Textarea value={draft.phone} onChange={(e) => updateField("phone", e.target.value)} rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.contact.labels.email")}</label>
            <Textarea value={draft.email} onChange={(e) => updateField("email", e.target.value)} rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.contact.labels.office")}</label>
            <Textarea value={draft.office} onChange={(e) => updateField("office", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.contact.labels.officeHelper")}</label>
            <Input value={draft.officeHelper ?? ""} onChange={(e) => updateField("officeHelper", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.contact.labels.officeHours")}</label>
            <Textarea value={officeHoursText} onChange={(e) => handleOfficeHoursChange(e.target.value)} rows={4} />
          </div>
        </div>

        <div className="border border-border rounded-xl p-6 bg-muted/40 space-y-4">
          <h4 className="text-2xl font-display font-semibold">{draft.title || t("admin.cms.contact.defaultTitle")}</h4>
          <p className="text-muted-foreground">{draft.subtitle}</p>
          <div className="space-y-3 text-sm">
            <p className="whitespace-pre-line"><span className="font-semibold">{t("admin.cms.contact.labels.phone")}:</span> {draft.phone}</p>
            <p className="whitespace-pre-line"><span className="font-semibold">{t("admin.cms.contact.labels.email")}:</span> {draft.email}</p>
            <p className="whitespace-pre-line"><span className="font-semibold">{t("admin.cms.contact.labels.office")}:</span> {draft.office}</p>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-semibold mb-2">{t("admin.cms.contact.labels.officeHours")}</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {draft.officeHours.map((line, index) => (
                <li key={`${line}-${index}`}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminGlassCard>
  );
};

const HomeSuccessStoriesEditor = ({ section, onSave, saving, language }: CmsEditorProps<HomeSuccessStoriesContent>) => {
  const { t, i18n } = useTranslation();

  const getDefaults = (lang: CmsLanguage): HomeSuccessStoriesContent => {
    const fixedT = i18n.getFixedT(lang);
    const stats = fixedT("home.successStats", { returnObjects: true });
    return normalizeHomeSuccessStories({
      eyebrow: fixedT("home.successStories"),
      title: fixedT("home.realResults"),
      stats: Array.isArray(stats) ? (stats as HomeSuccessStoriesContent["stats"]) : [],
    });
  };

  const [localizedDraft, setLocalizedDraft] = useState<LocalizedContent<HomeSuccessStoriesContent>>(
    normalizeLocalizedContent(section.content as CmsContent<HomeSuccessStoriesContent>, getDefaults("en")),
  );
  const [draft, setDraft] = useState<HomeSuccessStoriesContent>(localizedDraft.translations[language]);
  const [statsText, setStatsText] = useState(formatSuccessStats(draft.stats));

  useEffect(() => {
    const normalized = normalizeLocalizedContent(section.content as CmsContent<HomeSuccessStoriesContent>, getDefaults("en"));
    const filled: LocalizedContent<HomeSuccessStoriesContent> = {
      translations: {
        en: normalizeHomeSuccessStories(normalized.translations.en ?? getDefaults("en")),
        ar: normalizeHomeSuccessStories(normalized.translations.ar ?? getDefaults("ar")),
        de: normalizeHomeSuccessStories(normalized.translations.de ?? getDefaults("de")),
        ru: normalizeHomeSuccessStories(normalized.translations.ru ?? getDefaults("ru")),
      },
    };
    setLocalizedDraft(filled);
    setDraft(filled.translations[language]);
    setStatsText(formatSuccessStats(filled.translations[language].stats));
  }, [i18n, language, section.content]);

  const updateDraft = (next: HomeSuccessStoriesContent) => {
    setDraft(next);
    setLocalizedDraft((prev) => ({
      translations: {
        ...prev.translations,
        [language]: next,
      },
    }));
  };

  return (
    <AdminGlassCard
      title={t("admin.cms.homeSuccessStories.title")}
      description={t("admin.cms.homeSuccessStories.description")}
      rightSlot={
        <Button onClick={() => onSave(section.key, localizedDraft)} disabled={saving}>
          {saving ? t("admin.cms.actions.saving") : t("admin.cms.actions.save") + " Home"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("admin.cms.homeSuccessStories.labels.eyebrow")}</label>
            <Input
              value={draft.eyebrow}
              onChange={(e) => updateDraft({ ...draft, eyebrow: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.homeSuccessStories.labels.title")}</label>
            <Input
              value={draft.title}
              onChange={(e) => updateDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.homeSuccessStories.labels.stats")}</label>
            <Textarea
              value={statsText}
              onChange={(e) => {
                setStatsText(e.target.value);
                updateDraft({ ...draft, stats: parseSuccessStats(e.target.value) });
              }}
              rows={5}
            />
          </div>
        </div>

        <div className="border border-border rounded-xl p-6 bg-muted/40 space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{draft.eyebrow || t("admin.cms.homeSuccessStories.preview.eyebrow")}</p>
          <h4 className="text-2xl font-display font-semibold">{draft.title || t("admin.cms.homeSuccessStories.preview.title")}</h4>
          <div className="space-y-3 text-sm text-muted-foreground">
            {draft.stats.map((stat, index) => (
              <div key={`${stat.value}-${stat.label}-${index}`}>
                <p className="text-lg font-semibold text-primary">{stat.value}</p>
                <p className="font-medium">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminGlassCard>
  );
};

const HomePartnersEditor = ({ section, onSave, saving }: CmsEditorProps<HomePartnersContent>) => {
  const { t, i18n } = useTranslation();

  const getDefaults = (lang: CmsLanguage): HomePartnersContent => {
    const fixedT = i18n.getFixedT(lang);
    return normalizeHomePartners({
      eyebrow: fixedT("home.partnersEyebrow"),
      title: fixedT("home.partnersTitle"),
      subtitle: fixedT("home.partnersSubtitle"),
      partners: [],
    });
  };

  const [draft, setDraft] = useState<HomePartnersContent>(() => {
    const normalized = normalizeLocalizedContent(section.content as CmsContent<HomePartnersContent>, getDefaults("en"));
    return normalizeHomePartners(normalized.translations.en ?? getDefaults("en"));
  });

  useEffect(() => {
    const normalized = normalizeLocalizedContent(section.content as CmsContent<HomePartnersContent>, getDefaults("en"));
    setDraft(normalizeHomePartners(normalized.translations.en ?? getDefaults("en")));
  }, [i18n, section.content]);

  const updateDraft = (next: HomePartnersContent) => {
    setDraft(next);
  };

  const updatePartner = (index: number, next: HomePartnersContent["partners"][number]) => {
    const partners = [...draft.partners];
    partners[index] = next;
    updateDraft({ ...draft, partners });
  };

  const addPartner = () => {
    updateDraft({
      ...draft,
      partners: [...draft.partners, { name: "", logoUrl: "", website: "" }],
    });
  };

  const removePartner = (index: number) => {
    updateDraft({
      ...draft,
      partners: draft.partners.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  return (
    <AdminGlassCard
      title={t("admin.cms.homePartners.title")}
      description={t("admin.cms.homePartners.description")}
      rightSlot={
        <Button onClick={() => onSave(section.key, draft)} disabled={saving}>
          {saving ? t("admin.cms.actions.saving") : t("admin.cms.actions.save") + " Partners"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{t("admin.cms.homePartners.labels.partners")}</p>
            <Button type="button" variant="outline" size="sm" onClick={addPartner}>
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.cms.homePartners.actions.add")}
            </Button>
          </div>

          {draft.partners.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("admin.cms.homePartners.empty")}</p>
          ) : (
            <div className="space-y-4">
              {draft.partners.map((partner, index) => (
                <div key={`partner-${index}`} className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{t("admin.cms.homePartners.labels.partnerName")} #{index + 1}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePartner(index)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("admin.cms.homePartners.actions.remove")}
                    </Button>
                  </div>
                  <ImageUploadField
                    label={t("admin.cms.homePartners.labels.partnerLogo")}
                    value={partner.logoUrl}
                    onChange={(value) => updatePartner(index, { ...partner, logoUrl: value })}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">{t("admin.cms.homePartners.labels.partnerName")}</label>
                      <Input
                        value={partner.name}
                        onChange={(e) => updatePartner(index, { ...partner, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t("admin.cms.homePartners.labels.partnerWebsite")}</label>
                      <Input
                        value={partner.website ?? ""}
                        onChange={(e) => updatePartner(index, { ...partner, website: e.target.value })}
                        placeholder="https://"
                      />
                    </div>
                  </div>
                  {partner.logoUrl ? (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-background/70 p-3">
                      <img
                        src={getMediaUrl(partner.logoUrl)}
                        alt={partner.name || "Partner logo"}
                        className="h-10 w-auto object-contain"
                      />
                      <span className="text-xs text-muted-foreground">{partner.name || t("admin.cms.homePartners.labels.partnerName")}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-border rounded-xl p-6 bg-muted/40 space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {t("admin.cms.homePartners.preview.eyebrow")}
          </p>
          <h4 className="text-2xl font-display font-semibold">
            {t("admin.cms.homePartners.preview.title")}
          </h4>
          <p className="text-sm text-muted-foreground">{t("home.partnersSubtitle")}</p>
          <div className="grid grid-cols-2 gap-3">
            {draft.partners.slice(0, 4).map((partner, index) => (
              <div key={`partner-preview-${index}`} className="rounded-lg border border-border bg-background/70 p-3 flex flex-col items-center justify-center gap-2">
                {partner.logoUrl ? (
                  <img
                    src={getMediaUrl(partner.logoUrl)}
                    alt={partner.name || "Partner logo"}
                    className="h-8 w-auto object-contain"
                  />
                ) : null}
                {partner.name ? (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center">
                    {partner.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Partner</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminGlassCard>
  );
};

const FooterSectionEditor = ({ section, onSave, saving, language }: CmsEditorProps<FooterContent>) => {
  const { t } = useTranslation();
  const [localizedDraft, setLocalizedDraft] = useState<LocalizedContent<FooterContent>>(
    normalizeLocalizedContent(section.content as CmsContent<FooterContent>, normalizeFooter()),
  );
  const [draft, setDraft] = useState<FooterContent>(localizedDraft.translations[language]);
  const [quickLinksText, setQuickLinksText] = useState(formatLinks(draft.quickLinks));
  const [propertyTypesText, setPropertyTypesText] = useState(toMultiline(draft.propertyTypes));
  const [socialText, setSocialText] = useState(formatSocial(draft.social));

  useEffect(() => {
    const normalized = normalizeLocalizedContent(section.content as CmsContent<FooterContent>, normalizeFooter());
    setLocalizedDraft(normalized);
    setDraft(normalized.translations[language]);
    setQuickLinksText(formatLinks(normalized.translations[language].quickLinks));
    setPropertyTypesText(toMultiline(normalized.translations[language].propertyTypes));
    setSocialText(formatSocial(normalized.translations[language].social));
  }, [section.content, language]);

  const updateDraft = (next: FooterContent) => {
    setDraft(next);
    setLocalizedDraft((prev) => ({
      translations: {
        ...prev.translations,
        [language]: next,
      },
    }));
  };

  const updateContact = (field: keyof FooterContent["contact"], value: string) => {
    updateDraft({
      ...draft,
      contact: {
        ...draft.contact,
        [field]: value,
      },
    });
  };

  return (
    <AdminGlassCard
      title={t("admin.cms.footer.title")}
      description={t("admin.cms.footer.description")}
      rightSlot={
        <Button onClick={() => onSave(section.key, localizedDraft)} disabled={saving}>
          {saving ? t("admin.cms.actions.saving") : t("admin.cms.actions.save") + " Footer"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("admin.cms.footer.labels.description")}</label>
            <Textarea
              value={draft.description}
              onChange={(e) => updateDraft({ ...draft, description: e.target.value })}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.footer.labels.phone")}</label>
            <Input value={draft.contact.phone} onChange={(e) => updateContact("phone", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.footer.labels.email")}</label>
            <Input value={draft.contact.email} onChange={(e) => updateContact("email", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.footer.labels.location")}</label>
            <Input value={draft.contact.location} onChange={(e) => updateContact("location", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.footer.labels.quickLinks")}</label>
            <Textarea
              value={quickLinksText}
              onChange={(e) => {
                setQuickLinksText(e.target.value);
                updateDraft({ ...draft, quickLinks: parseLinks(e.target.value) });
              }}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.footer.labels.propertyTypes")}</label>
            <Textarea
              value={propertyTypesText}
              onChange={(e) => {
                setPropertyTypesText(e.target.value);
                updateDraft({ ...draft, propertyTypes: fromMultiline(e.target.value) });
              }}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.footer.labels.socialLinks")}</label>
            <Textarea
              value={socialText}
              onChange={(e) => {
                setSocialText(e.target.value);
                updateDraft({ ...draft, social: parseSocial(e.target.value) });
              }}
              rows={3}
            />
          </div>
        </div>

        <div className="border border-border rounded-xl p-6 bg-muted/40 space-y-4">
          <h4 className="text-lg font-display font-semibold">{t("admin.cms.footer.preview.title")}</h4>
          <p className="text-sm text-muted-foreground">{draft.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t("admin.cms.footer.preview.contact")}</p>
              <p className="text-sm">{draft.contact.phone}</p>
              <p className="text-sm">{draft.contact.email}</p>
              <p className="text-sm">{draft.contact.location}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">{t("admin.cms.footer.preview.quickLinks")}</p>
              <ul className="text-sm space-y-1">
                {draft.quickLinks.slice(0, 4).map((link) => (
                  <li key={link.href}>{link.label}</li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">{t("admin.cms.footer.labels.propertyTypes")}</p>
            <p className="text-sm">{draft.propertyTypes.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">{t("admin.cms.footer.preview.social")}</p>
            <p className="text-sm">{draft.social.map((item) => item.label).join(" • ")}</p>
          </div>
        </div>
      </div>
    </AdminGlassCard>
  );
};

const AboutSectionEditor = ({ section, onSave, saving, language }: CmsEditorProps<AboutContent>) => {
  const { t, i18n } = useTranslation();
  const hasMigratedRef = useRef(false);

  const getImpactDefaults = (lang: CmsLanguage) =>
    (i18n.getFixedT(lang)("about.impact.items", { returnObjects: true }) as string[]) ?? [];

  const withImpactDefaults = (value: AboutContent | undefined, lang: CmsLanguage) => {
    const normalized = normalizeAbout(value);
    if (!Array.isArray(value?.impactItems) || value?.impactItems.length === 0) {
      normalized.impactItems = getImpactDefaults(lang);
    }
    return normalized;
  };
  const [localizedDraft, setLocalizedDraft] = useState<LocalizedContent<AboutContent>>(
    normalizeLocalizedContent(section.content as CmsContent<AboutContent>, normalizeAbout()),
  );
  const [draft, setDraft] = useState<AboutContent>(localizedDraft.translations[language]);
  const [storyText, setStoryText] = useState(toMultiline(draft.storyParagraphs));
  const [impactItemsText, setImpactItemsText] = useState(toMultiline(draft.impactItems));
  const [valuesText, setValuesText] = useState(formatAboutValues(draft.values));
  const [statsText, setStatsText] = useState(formatAboutStats(draft.stats));

  useEffect(() => {
    const normalized = normalizeLocalizedContent(section.content as CmsContent<AboutContent>, normalizeAbout());
    const filled = {
      translations: {
        en: withImpactDefaults(normalized.translations.en, "en"),
        ar: withImpactDefaults(normalized.translations.ar, "ar"),
        de: withImpactDefaults(normalized.translations.de, "de"),
        ru: withImpactDefaults(normalized.translations.ru, "ru"),
      },
    };

    setLocalizedDraft(filled);
    const next = filled.translations[language];
    setDraft(next);
    setStoryText(toMultiline(next.storyParagraphs));
    setImpactItemsText(toMultiline(next.impactItems));
    setValuesText(formatAboutValues(next.values));
    setStatsText(formatAboutStats(next.stats));

    const needsMigration = Object.values(normalized.translations).some(
      (value) => !Array.isArray((value as AboutContent | undefined)?.impactItems),
    );

    if (needsMigration && !hasMigratedRef.current) {
      hasMigratedRef.current = true;
      onSave(section.key, filled).catch(() => undefined);
    }
  }, [i18n, language, onSave, section.content]);

  const updateDraft = (next: AboutContent) => {
    setDraft(next);
    setLocalizedDraft((prev) => ({
      translations: {
        ...prev.translations,
        [language]: next,
      },
    }));
  };

  return (
    <AdminGlassCard
      title={t("admin.cms.about.title")}
      description={t("admin.cms.about.description")}
      rightSlot={
        <Button onClick={() => onSave(section.key, localizedDraft)} disabled={saving}>
          {saving ? t("admin.cms.actions.saving") : t("admin.cms.actions.save") + " About"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("admin.cms.about.labels.heroTitle")}</label>
            <Input
              value={draft.heroTitle}
              onChange={(e) => updateDraft({ ...draft, heroTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.about.labels.heroSubtitle")}</label>
            <Input
              value={draft.heroSubtitle}
              onChange={(e) => updateDraft({ ...draft, heroSubtitle: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.about.labels.impactEyebrow")}</label>
            <Input
              value={draft.impactEyebrow ?? ""}
              onChange={(e) => updateDraft({ ...draft, impactEyebrow: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.about.labels.impactTitle")}</label>
            <Input
              value={draft.impactTitle ?? ""}
              onChange={(e) => updateDraft({ ...draft, impactTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.about.labels.impactDescription")}</label>
            <Textarea
              value={draft.impactDescription ?? ""}
              onChange={(e) => updateDraft({ ...draft, impactDescription: e.target.value })}
              rows={3}
            />
          </div>
          <ImageUploadField
            label={t("admin.cms.about.labels.heroImage")}
            value={draft.heroImage}
            onChange={(value) => updateDraft({ ...draft, heroImage: value })}
            placeholder={t("admin.cms.hero.placeholders.backgroundImage")}
          />
          <div>
            <label className="text-sm font-medium">{t("admin.cms.about.labels.storyParagraphs")}</label>
            <Textarea
              value={storyText}
              onChange={(e) => {
                setStoryText(e.target.value);
                updateDraft({ ...draft, storyParagraphs: fromMultiline(e.target.value) });
              }}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.about.labels.impactItems")}</label>
            <Textarea
              value={impactItemsText}
              onChange={(e) => {
                setImpactItemsText(e.target.value);
                updateDraft({ ...draft, impactItems: fromMultiline(e.target.value) });
              }}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.about.labels.values")}</label>
            <Textarea
              value={valuesText}
              onChange={(e) => {
                setValuesText(e.target.value);
                updateDraft({ ...draft, values: parseAboutValues(e.target.value) });
              }}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.cms.about.labels.stats")}</label>
            <Textarea
              value={statsText}
              onChange={(e) => {
                setStatsText(e.target.value);
                updateDraft({ ...draft, stats: parseAboutStats(e.target.value) });
              }}
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-border h-64">
            {draft.heroImage ? (
              <img src={getMediaUrl(draft.heroImage)} alt="About hero preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/70 to-accent/60" />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative h-full w-full p-6 text-white flex flex-col justify-end space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Preview</p>
              <h4 className="text-3xl font-display font-bold">{draft.heroTitle}</h4>
              <p className="text-white/80">{draft.heroSubtitle}</p>
            </div>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-lg font-semibold">Story Highlights</h4>
            <div className="space-y-2 text-sm text-muted-foreground max-h-32 overflow-y-auto">
              {draft.storyParagraphs.map((paragraph, index) => (
                <p key={`${paragraph}-${index}`}>{paragraph}</p>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{draft.impactEyebrow}</p>
              <h5 className="text-base font-semibold">{draft.impactTitle}</h5>
              <p className="text-sm text-muted-foreground">{draft.impactDescription}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {draft.impactItems
                  .filter((item) => item && item.trim().length > 0)
                  .map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-2">Values</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {draft.values.map((value) => (
                  <div key={`${value.title}-${value.description}`} className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs uppercase text-muted-foreground">{value.iconKey}</p>
                    <p className="text-sm font-semibold">{value.title}</p>
                    <p className="text-xs text-muted-foreground">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-2">Stats</h5>
              <div className="flex flex-wrap gap-4">
                {draft.stats.map((stat) => (
                  <div key={stat.label} className="min-w-[90px]">
                    <p className="text-2xl font-display font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGlassCard>
  );
};

const SiteSettingsEditor = ({ section, onSave, saving }: CmsEditorProps<SiteSettingsContent>) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<SiteSettingsContent>(normalizeSiteSettings(section.content as SiteSettingsContent));

  useEffect(() => {
    setDraft(normalizeSiteSettings(section.content as SiteSettingsContent));
  }, [section.content]);

  return (
    <AdminGlassCard
      title={t("admin.cms.siteSettings.title")}
      description={t("admin.cms.siteSettings.description")}
      rightSlot={
        <Button onClick={() => onSave(section.key, draft)} disabled={saving}>
          {saving ? t("admin.cms.actions.saving") : t("admin.cms.actions.save")}
        </Button>
      }
    >
      <div className="mt-4 space-y-6">
        <ImageUploadField
          label={t("admin.cms.siteSettings.logo.label")}
          value={draft.logoUrl}
          onChange={(value) => setDraft((prev) => ({ ...prev, logoUrl: value }))}
          placeholder={t("admin.cms.siteSettings.logo.placeholder")}
        />

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-luxury-gold" />
            </div>
            <div>
              <p className="font-medium">{t("admin.cms.siteSettings.rentButton.label")}</p>
              <p className="text-sm text-muted-foreground">{t("admin.cms.siteSettings.rentButton.description")}</p>
            </div>
          </div>
          <Switch
            checked={draft.rentButtonEnabled}
            onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, rentButtonEnabled: checked }))}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-luxury-gold" />
            </div>
            <div>
              <p className="font-medium">{t("admin.cms.siteSettings.investmentPage.label")}</p>
              <p className="text-sm text-muted-foreground">{t("admin.cms.siteSettings.investmentPage.description")}</p>
            </div>
          </div>
          <Switch
            checked={draft.investmentPageEnabled}
            onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, investmentPageEnabled: checked }))}
          />
        </div>

        <div className="p-4 rounded-xl border border-border bg-muted/20">
          <p className="text-sm font-medium mb-2">{t("admin.cms.siteSettings.preview")}</p>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              draft.rentButtonEnabled
                ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-dark"
                : "bg-muted text-muted-foreground line-through opacity-50"
            }`}>
              <DollarSign className="h-4 w-4" />
              {t("admin.cms.siteSettings.rentButton.previewText")}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              draft.rentButtonEnabled
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {draft.rentButtonEnabled
                ? t("admin.cms.siteSettings.status.visible")
                : t("admin.cms.siteSettings.status.hidden")}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              draft.investmentPageEnabled
                ? "bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-dark"
                : "bg-muted text-muted-foreground line-through opacity-50"
            }`}>
              <TrendingUp className="h-4 w-4" />
              {t("admin.cms.siteSettings.investmentPage.previewText")}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              draft.investmentPageEnabled
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {draft.investmentPageEnabled
                ? t("admin.cms.siteSettings.status.visible")
                : t("admin.cms.siteSettings.status.hidden")}
            </span>
          </div>
        </div>
      </div>
    </AdminGlassCard>
  );
};

interface JsonSectionEditorProps {
  section: CMSSection;
  onSave: (key: string, content: CmsContent<unknown>) => Promise<void>;
  saving: boolean;
  onInvalidJson: () => void;
  language: CmsLanguage;
}

const JsonSectionEditor = ({ section, onSave, saving, onInvalidJson, language }: JsonSectionEditorProps) => {
  const { t } = useTranslation();
  const [localizedDraft, setLocalizedDraft] = useState<LocalizedContent<unknown>>(
    normalizeLocalizedContent(section.content as CmsContent<unknown>, {}),
  );
  const [value, setValue] = useState(JSON.stringify(localizedDraft.translations[language] ?? {}, null, 2));

  useEffect(() => {
    const normalized = normalizeLocalizedContent(section.content as CmsContent<unknown>, {});
    setLocalizedDraft(normalized);
    setValue(JSON.stringify(normalized.translations[language] ?? {}, null, 2));
  }, [section.content, language]);

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(value);
      const updated: LocalizedContent<unknown> = {
        translations: {
          ...localizedDraft.translations,
          [language]: parsed,
        },
      };
      setLocalizedDraft(updated);
      await onSave(section.key, updated);
    } catch (error) {
      console.error("Invalid CMS JSON", error);
      onInvalidJson();
    }
  };

  return (
    <AdminGlassCard
      title={section.key}
      description="Advanced section (JSON)."
      rightSlot={
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t("admin.cms.actions.saving") : t("admin.cms.actions.save")}
        </Button>
      }
    >
      <div className="space-y-4 mt-4">
        <Textarea
          className="font-mono text-xs min-h-[240px]"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="text-xs text-muted-foreground">
          <p>Preview</p>
          <pre className="bg-muted/40 rounded-lg p-3 overflow-auto max-h-[200px]">{value}</pre>
        </div>
      </div>
    </AdminGlassCard>
  );
};

const AdminCMS = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["cms", "all"], queryFn: fetchSections });
  const { toast } = useToast();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<CmsLanguage>(() => {
    const match = CMS_LANGUAGES.find((lang) => lang.code === (i18n.language as CmsLanguage));
    return match?.code ?? "en";
  });

  const handleSave = async <T,>(key: string, content: T) => {
    try {
      setSavingKey(key);
      await apiClient.put(`/cms/${key}`, { content });
      toast({ title: t("admin.cms.toasts.saved", { section: key }) });
      // Invalidate both the "all sections" query and the specific section query
      await queryClient.invalidateQueries({ queryKey: ["cms", key] });
      await refetch();
    } catch (error) {
      console.error("Failed to save CMS", error);
      toast({ title: t("admin.cms.toasts.saveFailed"), description: t("admin.cms.toasts.saveFailedDesc"), variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  if (isLoading || !data) {
    return <p className="text-muted-foreground">{t("admin.cms.loading")}</p>;
  }

  const buildHomeSuccessDefaults = (lang: CmsLanguage): HomeSuccessStoriesContent => {
    const fixedT = i18n.getFixedT(lang);
    const stats = fixedT("home.successStats", { returnObjects: true });
    return normalizeHomeSuccessStories({
      eyebrow: fixedT("home.successStories"),
      title: fixedT("home.realResults"),
      stats: Array.isArray(stats) ? (stats as HomeSuccessStoriesContent["stats"]) : [],
    });
  };

  const homeSuccessDefaults: LocalizedContent<HomeSuccessStoriesContent> = {
    translations: {
      en: buildHomeSuccessDefaults("en"),
      ar: buildHomeSuccessDefaults("ar"),
      de: buildHomeSuccessDefaults("de"),
      ru: buildHomeSuccessDefaults("ru"),
    },
  };

  const buildHomePartnersDefaults = (lang: CmsLanguage): HomePartnersContent => {
    const fixedT = i18n.getFixedT(lang);
    return normalizeHomePartners({
      eyebrow: fixedT("home.partnersEyebrow"),
      title: fixedT("home.partnersTitle"),
      subtitle: fixedT("home.partnersSubtitle"),
      partners: [],
    });
  };

  const homePartnersDefaults: LocalizedContent<HomePartnersContent> = {
    translations: {
      en: buildHomePartnersDefaults("en"),
      ar: buildHomePartnersDefaults("ar"),
      de: buildHomePartnersDefaults("de"),
      ru: buildHomePartnersDefaults("ru"),
    },
  };

  // Ensure siteSettings section exists (if not in DB, show with defaults)
  const sectionsWithSettings = data.some((s) => s.key === "siteSettings")
    ? data
    : [...data, { _id: "siteSettings-default", key: "siteSettings", content: normalizeSiteSettings() }];

  const sectionsWithHomeSuccess = sectionsWithSettings.some((s) => s.key === "homeSuccessStories")
    ? sectionsWithSettings
    : [...sectionsWithSettings, { _id: "homeSuccessStories-default", key: "homeSuccessStories", content: homeSuccessDefaults }];

  const sections = sectionsWithHomeSuccess.some((s) => s.key === "homePartners")
    ? sectionsWithHomeSuccess
    : [...sectionsWithHomeSuccess, { _id: "homePartners-default", key: "homePartners", content: homePartnersDefaults }];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={PenSquare}
        title={t("admin.cms.headerTitle")}
        description={t("admin.cms.headerDescription")}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
        <div>
          <p className="text-sm font-medium">{t("admin.cms.language.label")}</p>
          <p className="text-xs text-muted-foreground">{t("admin.cms.language.description")}</p>
        </div>
        <div className="min-w-[200px]">
          <Select value={activeLanguage} onValueChange={(value) => setActiveLanguage(value as CmsLanguage)}>
            <SelectTrigger>
              <SelectValue placeholder={t("admin.cms.language.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {CMS_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          if (section.key === "hero") {
            return (
              <HeroSectionEditor
                key={section._id}
                section={section as CMSSection<HeroContent>}
                onSave={handleSave}
                saving={savingKey === section.key}
                language={activeLanguage}
              />
            );
          }

          if (section.key === "about") {
            return (
              <AboutSectionEditor
                key={section._id}
                section={section as CMSSection<AboutContent>}
                onSave={handleSave}
                saving={savingKey === section.key}
                language={activeLanguage}
              />
            );
          }

          if (section.key === "contact") {
            return (
              <ContactSectionEditor
                key={section._id}
                section={section as CMSSection<ContactContent>}
                onSave={handleSave}
                saving={savingKey === section.key}
                language={activeLanguage}
              />
            );
          }

          if (section.key === "homeSuccessStories") {
            return (
              <HomeSuccessStoriesEditor
                key={section._id}
                section={section as CMSSection<HomeSuccessStoriesContent>}
                onSave={handleSave}
                saving={savingKey === section.key}
                language={activeLanguage}
              />
            );
          }

          if (section.key === "homePartners") {
            return (
              <HomePartnersEditor
                key={section._id}
                section={section as CMSSection<HomePartnersContent>}
                onSave={handleSave}
                saving={savingKey === section.key}
                language={activeLanguage}
              />
            );
          }

          if (section.key === "footer") {
            return (
              <FooterSectionEditor
                key={section._id}
                section={section as CMSSection<FooterContent>}
                onSave={handleSave}
                saving={savingKey === section.key}
                language={activeLanguage}
              />
            );
          }

          if (section.key === "siteSettings") {
            return (
              <SiteSettingsEditor
                key={section._id}
                section={section as CMSSection<SiteSettingsContent>}
                onSave={handleSave}
                saving={savingKey === section.key}
                language={activeLanguage}
              />
            );
          }

          return (
            <JsonSectionEditor
              key={section._id}
              section={section}
              onSave={handleSave}
              saving={savingKey === section.key}
              onInvalidJson={() => toast({ title: "Invalid JSON", variant: "destructive" })}
              language={activeLanguage}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdminCMS;
