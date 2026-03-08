import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  lang?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
}

const BASE_URL = "https://crystaldbc.com";

const defaultKeywords = [
  // English brand variations
  "CrystalDBC", "Crystal DBC", "crystaldbc", "crystal dbc", "crstaldbc",
  "crystalDBC", "CRYSTALDBC", "Crystal-DBC", "crystaldbc.com",
  // English real estate
  "luxury real estate", "premium properties", "luxury villas", "penthouses",
  "luxury apartments", "off-plan properties", "real estate investment",
  "high yield investment", "property management", "luxury rentals",
  // Location-specific
  "Dubai real estate", "Dubai luxury properties", "Cairo villas",
  "Egypt real estate", "Red Sea properties", "Saudi Arabia real estate",
  "Riyadh properties", "Germany real estate", "Russia real estate",
  // Arabic keywords
  "عقارات فاخرة", "كريستال دي بي سي", "عقارات دبي", "فلل فاخرة",
  "شقق فاخرة مصر", "استثمار عقاري", "عقارات القاهرة", "عقارات البحر الأحمر",
  "عقارات السعودية", "عقارات الرياض", "كريستال دبي سي",
  // German keywords
  "Luxusimmobilien", "Immobilien Dubai", "Immobilien Investition",
  "Luxuswohnungen", "Premium Immobilien",
  // Russian keywords
  "элитная недвижимость", "недвижимость Дубай", "инвестиции в недвижимость",
  "люкс недвижимость", "Кристал ДБС",
  // French keywords
  "immobilier de luxe", "villa de luxe Dubai", "investissement immobilier",
  // Spanish keywords
  "bienes raíces de lujo", "propiedades de lujo Dubai", "inversión inmobiliaria",
].join(", ");

export default function SEOHead({
  title,
  description = "CrystalDBC is a premier luxury real estate company offering exclusive villas, penthouses, apartments, and high-yield investment opportunities in Dubai, Cairo, Egypt, Saudi Arabia, Germany, and Russia. Trusted by global investors since 2002.",
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = `${BASE_URL}/entrance.jpeg`,
  ogType = "website",
  lang = "en",
  noindex = false,
  structuredData,
}: SEOHeadProps) {
  const fullTitle = title
    ? `${title} | CrystalDBC - Luxury Real Estate`
    : "CrystalDBC - Luxury Real Estate & Investment | Dubai, Egypt, Saudi Arabia, Germany";
  const fullKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={fullKeywords} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="CrystalDBC" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@crystaldbc" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
