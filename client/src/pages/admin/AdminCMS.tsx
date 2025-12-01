import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { CMSSection, HeroContent, ContactContent, FooterContent, AboutContent } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getMediaUrl } from "@/lib/media";
import uploadImage from "@/lib/uploadImage";

const fetchSections = async () => {
  const { data } = await apiClient.get<{ sections: CMSSection[] }>("/cms");
  return data.sections;
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
  officeHours: content?.officeHours ?? [],
});

const normalizeAbout = (content?: Partial<AboutContent>): AboutContent => ({
  heroImage: content?.heroImage ?? "",
  heroTitle: content?.heroTitle ?? "",
  heroSubtitle: content?.heroSubtitle ?? "",
  storyParagraphs: content?.storyParagraphs ?? [],
  values: content?.values ?? [],
  stats: content?.stats ?? [],
});

const normalizeFooter = (content?: Partial<FooterContent>): FooterContent => ({
  description: "",
  contact: {
    phone: content?.contact?.phone ?? "",
    email: content?.contact?.email ?? "",
    location: content?.contact?.location ?? "",
  },
  quickLinks: content?.quickLinks ?? [],
  propertyTypes: content?.propertyTypes ?? [],
  social: content?.social ?? [],
});

const toMultiline = (items: string[]) => items.join("\n");
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

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ImageUploadField = ({ label, value, onChange, placeholder }: ImageUploadFieldProps) => {
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
      toast({ title: "Image uploaded" });
    } catch (error) {
      console.error("CMS image upload failed", error);
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
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
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};

interface CmsEditorProps<T> {
  section: CMSSection<T>;
  onSave: (key: string, content: T) => Promise<void>;
  saving: boolean;
}

const HeroSectionEditor = ({ section, onSave, saving }: CmsEditorProps<HeroContent>) => {
  const [draft, setDraft] = useState<HeroContent>(normalizeHero(section.content as HeroContent));

  useEffect(() => {
    setDraft(normalizeHero(section.content as HeroContent));
  }, [section.content]);

  const handleChange = (field: keyof HeroContent, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleCtaChange = (cta: "primaryCta" | "secondaryCta", field: "label" | "href", value: string) => {
    setDraft((prev) => ({
      ...prev,
      [cta]: {
        ...prev[cta],
        [field]: value,
      },
    }));
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-semibold">Homepage Hero</h3>
            <p className="text-sm text-muted-foreground">Update the main hero content and see a live preview.</p>
          </div>
          <Button onClick={() => onSave(section.key, draft)} disabled={saving}>
            {saving ? "Saving..." : "Save Hero"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Heading</label>
              <Input value={draft.heading} onChange={(e) => handleChange("heading", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Highlight</label>
              <Input value={draft.highlight} onChange={(e) => handleChange("highlight", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Subheading</label>
              <Textarea value={draft.subheading} onChange={(e) => handleChange("subheading", e.target.value)} rows={3} />
            </div>
            <ImageUploadField
              label="Background Image URL"
              value={draft.backgroundImage}
              onChange={(value) => handleChange("backgroundImage", value)}
              placeholder="Paste an image URL or upload one"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Primary CTA Label</label>
                <Input value={draft.primaryCta.label} onChange={(e) => handleCtaChange("primaryCta", "label", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Primary CTA Link</label>
                <Input value={draft.primaryCta.href} onChange={(e) => handleCtaChange("primaryCta", "href", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Secondary CTA Label</label>
                <Input value={draft.secondaryCta.label} onChange={(e) => handleCtaChange("secondaryCta", "label", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Secondary CTA Link</label>
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
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Preview</p>
              <h4 className="text-3xl font-display font-bold">{draft.heading} <span className="text-accent block">{draft.highlight}</span></h4>
              <p className="text-white/80">{draft.subheading}</p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm">{draft.primaryCta.label}</span>
                <span className="border border-white/30 px-4 py-2 rounded-full text-sm">{draft.secondaryCta.label}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ContactSectionEditor = ({ section, onSave, saving }: CmsEditorProps<ContactContent>) => {
  const [draft, setDraft] = useState<ContactContent>(normalizeContact(section.content as ContactContent));
  const [officeHoursText, setOfficeHoursText] = useState(toMultiline(draft.officeHours));

  useEffect(() => {
    const normalized = normalizeContact(section.content as ContactContent);
    setDraft(normalized);
    setOfficeHoursText(toMultiline(normalized.officeHours));
  }, [section.content]);

  const updateField = (field: keyof ContactContent, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleOfficeHoursChange = (value: string) => {
    setOfficeHoursText(value);
    setDraft((prev) => ({ ...prev, officeHours: fromMultiline(value) }));
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-semibold">Contact Section</h3>
            <p className="text-sm text-muted-foreground">Edit the contact block and preview what clients see.</p>
          </div>
          <Button onClick={() => onSave(section.key, draft)} disabled={saving}>
            {saving ? "Saving..." : "Save Contact"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={draft.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Subtitle</label>
              <Textarea value={draft.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input value={draft.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={draft.email} onChange={(e) => updateField("email", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Office Address</label>
              <Textarea value={draft.office} onChange={(e) => updateField("office", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Office Hours (one per line)</label>
              <Textarea value={officeHoursText} onChange={(e) => handleOfficeHoursChange(e.target.value)} rows={4} />
            </div>
          </div>

          <div className="border border-border rounded-xl p-6 bg-muted/40 space-y-4">
            <h4 className="text-2xl font-display font-semibold">{draft.title || "Contact us"}</h4>
            <p className="text-muted-foreground">{draft.subtitle}</p>
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold">Phone:</span> {draft.phone}</p>
              <p><span className="font-semibold">Email:</span> {draft.email}</p>
              <p><span className="font-semibold">Office:</span> {draft.office}</p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-semibold mb-2">Office Hours</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {draft.officeHours.map((line, index) => (
                  <li key={`${line}-${index}`}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FooterSectionEditor = ({ section, onSave, saving }: CmsEditorProps<FooterContent>) => {
  const [draft, setDraft] = useState<FooterContent>(normalizeFooter(section.content as FooterContent));
  const [quickLinksText, setQuickLinksText] = useState(formatLinks(draft.quickLinks));
  const [propertyTypesText, setPropertyTypesText] = useState(toMultiline(draft.propertyTypes));
  const [socialText, setSocialText] = useState(formatSocial(draft.social));

  useEffect(() => {
    const normalized = normalizeFooter(section.content as FooterContent);
    setDraft(normalized);
    setQuickLinksText(formatLinks(normalized.quickLinks));
    setPropertyTypesText(toMultiline(normalized.propertyTypes));
    setSocialText(formatSocial(normalized.social));
  }, [section.content]);

  const updateContact = (field: keyof FooterContent["contact"], value: string) => {
    setDraft((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-semibold">Footer Content</h3>
            <p className="text-sm text-muted-foreground">Curate the footer copy, quick links, and social handles.</p>
          </div>
          <Button onClick={() => onSave(section.key, draft)} disabled={saving}>
            {saving ? "Saving..." : "Save Footer"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input value={draft.contact.phone} onChange={(e) => updateContact("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={draft.contact.email} onChange={(e) => updateContact("email", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input value={draft.contact.location} onChange={(e) => updateContact("location", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Quick Links (Label | /path)</label>
              <Textarea
                value={quickLinksText}
                onChange={(e) => {
                  setQuickLinksText(e.target.value);
                  setDraft((prev) => ({ ...prev, quickLinks: parseLinks(e.target.value) }));
                }}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Property Types</label>
              <Textarea
                value={propertyTypesText}
                onChange={(e) => {
                  setPropertyTypesText(e.target.value);
                  setDraft((prev) => ({ ...prev, propertyTypes: fromMultiline(e.target.value) }));
                }}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Social Links (Label | URL)</label>
              <Textarea
                value={socialText}
                onChange={(e) => {
                  setSocialText(e.target.value);
                  setDraft((prev) => ({ ...prev, social: parseSocial(e.target.value) }));
                }}
                rows={3}
              />
            </div>
          </div>

          <div className="border border-border rounded-xl p-6 bg-muted/40 space-y-4">
            <h4 className="text-lg font-display font-semibold">Footer Preview</h4>
            <p className="text-sm text-muted-foreground">{draft.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Contact</p>
                <p className="text-sm">{draft.contact.phone}</p>
                <p className="text-sm">{draft.contact.email}</p>
                <p className="text-sm">{draft.contact.location}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Quick Links</p>
                <ul className="text-sm space-y-1">
                  {draft.quickLinks.slice(0, 4).map((link) => (
                    <li key={link.href}>{link.label}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Property Types</p>
              <p className="text-sm">{draft.propertyTypes.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Social</p>
              <p className="text-sm">{draft.social.map((item) => item.label).join(" • ")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AboutSectionEditor = ({ section, onSave, saving }: CmsEditorProps<AboutContent>) => {
  const [draft, setDraft] = useState<AboutContent>(normalizeAbout(section.content as AboutContent));
  const [storyText, setStoryText] = useState(toMultiline(draft.storyParagraphs));
  const [valuesText, setValuesText] = useState(formatAboutValues(draft.values));
  const [statsText, setStatsText] = useState(formatAboutStats(draft.stats));

  useEffect(() => {
    const normalized = normalizeAbout(section.content as AboutContent);
    setDraft(normalized);
    setStoryText(toMultiline(normalized.storyParagraphs));
    setValuesText(formatAboutValues(normalized.values));
    setStatsText(formatAboutStats(normalized.stats));
  }, [section.content]);

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-semibold">About Page</h3>
            <p className="text-sm text-muted-foreground">Edit the story, values, and hero preview for the About page.</p>
          </div>
          <Button onClick={() => onSave(section.key, draft)} disabled={saving}>
            {saving ? "Saving..." : "Save About"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Hero Title</label>
              <Input
                value={draft.heroTitle}
                onChange={(e) => setDraft((prev) => ({ ...prev, heroTitle: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hero Subtitle</label>
              <Input
                value={draft.heroSubtitle}
                onChange={(e) => setDraft((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
              />
            </div>
            <ImageUploadField
              label="Hero Image URL"
              value={draft.heroImage}
              onChange={(value) => setDraft((prev) => ({ ...prev, heroImage: value }))}
              placeholder="Paste an image URL or upload one"
            />
            <div>
              <label className="text-sm font-medium">Story Paragraphs (one per line)</label>
              <Textarea
                value={storyText}
                onChange={(e) => {
                  setStoryText(e.target.value);
                  setDraft((prev) => ({ ...prev, storyParagraphs: fromMultiline(e.target.value) }));
                }}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Values (icon | title | description)</label>
              <Textarea
                value={valuesText}
                onChange={(e) => {
                  setValuesText(e.target.value);
                  setDraft((prev) => ({ ...prev, values: parseAboutValues(e.target.value) }));
                }}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Stats (label | value)</label>
              <Textarea
                value={statsText}
                onChange={(e) => {
                  setStatsText(e.target.value);
                  setDraft((prev) => ({ ...prev, stats: parseAboutStats(e.target.value) }));
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
      </CardContent>
    </Card>
  );
};

interface JsonSectionEditorProps {
  section: CMSSection;
  onSave: (key: string, content: unknown) => Promise<void>;
  saving: boolean;
  onInvalidJson: () => void;
}

const JsonSectionEditor = ({ section, onSave, saving, onInvalidJson }: JsonSectionEditorProps) => {
  const [value, setValue] = useState(JSON.stringify(section.content, null, 2));

  useEffect(() => {
    setValue(JSON.stringify(section.content, null, 2));
  }, [section.content]);

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(value);
      await onSave(section.key, parsed);
    } catch (error) {
      console.error("Invalid CMS JSON", error);
      onInvalidJson();
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-semibold">{section.key}</h3>
            <p className="text-sm text-muted-foreground">Advanced section (JSON).</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
        <Textarea
          className="font-mono text-xs min-h-[240px]"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="text-xs text-muted-foreground">
          <p>Preview</p>
          <pre className="bg-muted/40 rounded-lg p-3 overflow-auto max-h-[200px]">{value}</pre>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminCMS = () => {
  const { data, isLoading, refetch } = useQuery({ queryKey: ["cms", "all"], queryFn: fetchSections });
  const { toast } = useToast();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const handleSave = async <T,>(key: string, content: T) => {
    try {
      setSavingKey(key);
      await apiClient.put(`/cms/${key}`, { content });
      toast({ title: `${key} saved` });
      await refetch();
    } catch (error) {
      console.error("Failed to save CMS", error);
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  if (isLoading || !data) {
    return <p className="text-muted-foreground">Loading CMS...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Content Management</h1>
        <p className="text-muted-foreground">Edit homepage content blocks with friendly forms and instant previews.</p>
      </div>

      <div className="space-y-6">
        {data.map((section) => {
          if (section.key === "hero") {
            return (
              <HeroSectionEditor
                key={section._id}
                section={section as CMSSection<HeroContent>}
                onSave={handleSave}
                saving={savingKey === section.key}
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
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdminCMS;
