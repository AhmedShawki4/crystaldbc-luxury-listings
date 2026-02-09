import { useMemo, useState, useEffect } from "react";
import PropertyCard from "@/components/PropertyCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign, Bed, Building2, Tag, Bath, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import useProperties, { type PropertyFilters } from "@/hooks/useProperties";
import PageHero from "@/components/PageHero";
import { useTranslation } from "react-i18next";
import LazyImage from "@/components/LazyImage";
import { useCmsSection } from "@/hooks/useCmsSection";
import type { SiteSettingsContent } from "@/types";

const Listings = () => {
  const { t, i18n } = useTranslation();
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [bedsFilter, setBedsFilter] = useState("all");
  const [bathsFilter, setBathsFilter] = useState("all");
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [constructionStatusFilter, setConstructionStatusFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const { data: siteSettings } = useCmsSection<SiteSettingsContent>("siteSettings", {
    rentButtonEnabled: true,
    investmentPageEnabled: true,
    logoUrl: "/crystaldbclogo.png",
  });
  const rentButtonEnabled = siteSettings?.rentButtonEnabled ?? true;
  const effectiveListingType = rentButtonEnabled ? listingType : "sale";

  useEffect(() => {
    if (!rentButtonEnabled && listingType === "rent") {
      setListingType("sale");
      setConstructionStatusFilter("all");
    }
  }, [rentButtonEnabled, listingType]);

  const filters = useMemo<PropertyFilters>(() => {
    const params: PropertyFilters = {};
    if (searchQuery) params.search = searchQuery;
    if (locationFilter !== "all") params.location = locationFilter;
    if (typeFilter !== "all") params.type = typeFilter;

    params.status = effectiveListingType === "rent" ? "For Rent" : "For Sale";
    if (effectiveListingType === "sale" && constructionStatusFilter !== "all") {
      params.constructionStatus = constructionStatusFilter;
    }

    if (bedsFilter !== "all") params.minBeds = Number(bedsFilter);
    if (bathsFilter !== "all") params.minBaths = Number(bathsFilter);
    if (featuredOnly) params.featured = true;

    if (priceFilter !== "all") {
      if (priceFilter === "0-5m") {
        params.priceMax = 5_000_000;
      } else if (priceFilter === "5m-10m") {
        params.priceMin = 5_000_000;
        params.priceMax = 10_000_000;
      } else if (priceFilter === "10m+") {
        params.priceMin = 10_000_000;
      }
    }

    if (sortBy !== "featured") {
      params.sort = sortBy;
    }

    return params;
  }, [searchQuery, locationFilter, typeFilter, effectiveListingType, constructionStatusFilter, bedsFilter, bathsFilter, priceFilter, featuredOnly, sortBy]);

  const { data: properties = [], isLoading } = useProperties(filters);

  const locations = useMemo(() => {
    const normalized = properties
      .map((property) => property.location)
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    return ["all", ...Array.from(new Set(normalized))];
  }, [properties]);

  const types = useMemo(() => {
    const normalized = properties
      .map((property) => property.type)
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    return ["all", ...Array.from(new Set(normalized))];
  }, [properties]);

  const marketList = useMemo(() => {
    const locationsText = t("layout.locations");
    return locationsText
      .split("|")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }, [i18n.language, t]);

  const marketSummary = marketList.length > 0 ? `Across ${marketList.join(", ")}` : "Across our markets";

  const cityCount = Math.max(locations.length - 1, 0);
  const typeCount = Math.max(types.length - 1, 0);

  return (
    <div className="min-h-screen">
      {/* Unified Background */}
      <div className="fixed inset-0 z-[-1]">
        <LazyImage
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
          alt="Background"
          className="w-full h-full opacity-[0.03]"
          priority={true}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      </div>
      {/* Custom Hero Section */}
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-gradient-to-br from-luxury-dark via-luxury-dark/95 to-[#111] pt-28 pb-16 text-white">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10 h-full w-full">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url(/crystalpattern2.png)",
              backgroundRepeat: "repeat"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-luxury-dark/80 to-transparent" />
        </div>

        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-luxury-gold/20 blur-[120px]" aria-hidden="true"></div>
        <div className="absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-accent/20 blur-[120px]" aria-hidden="true"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr),auto] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
                Luxury Listings
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                  <Building2 className="h-7 w-7" />
                </span>
                <h1 className="text-4xl font-display font-bold leading-tight md:text-5xl">
                  {t("listings.heroTitle")}
                </h1>
              </div>
              <p className="text-lg text-white/80 md:text-xl max-w-2xl">
                {t("listings.heroDescription")}
              </p>
            </div>

            <div className="grid min-w-[240px] gap-4 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                <p className="text-3xl font-display font-bold text-white">{isLoading ? "..." : properties.length}</p>
                <p className="text-sm uppercase tracking-[0.2em] text-white/60">Active Listings</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                <p className="text-3xl font-display font-bold text-white">{cityCount}</p>
                <p className="text-sm uppercase tracking-[0.2em] text-white/60">Cities</p>
                <p className="text-xs text-white/60 mt-1">{marketSummary}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                <p className="text-3xl font-display font-bold text-white">{typeCount}</p>
                <p className="text-sm uppercase tracking-[0.2em] text-white/60">Property Types</p>
                <p className="text-xs text-white/60 mt-1">Villas, penthouses, more</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section id="filters" className="relative isolate py-12 bg-gradient-to-b from-luxury-dark/40 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-luxury-dark/40 backdrop-blur-xl shadow-2xl shadow-luxury-gold/15">
            <div className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("listings.filters")}</p>
                  <h2 className="text-2xl font-display font-semibold text-foreground">{t("listings.heroTitle")}</h2>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isLoading ? t("listings.loading") : (
                    <>
                      <span className="font-semibold text-foreground">{properties.length}</span> {t("listings.resultsLabel")}
                    </>
                  )}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("listings.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base shadow-inner"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={effectiveListingType === "rent" ? "outline" : "default"}
                  size="lg"
                  className="h-14 px-8 text-base"
                  onClick={() => {
                    setListingType("sale");
                  }}
                >
                  {t("listings.filterOptions.forSale")}
                </Button>
                {rentButtonEnabled && (
                  <Button
                    type="button"
                    variant={effectiveListingType === "rent" ? "default" : "outline"}
                    size="lg"
                    className="h-14 px-8 text-base"
                    onClick={() => {
                      setListingType("rent");
                      setConstructionStatusFilter("all");
                    }}
                  >
                    {t("listings.filterOptions.forRent")}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("listings.filterOptions.allLocations")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("listings.filterOptions.allLocations")}</SelectItem>
                    {locations.filter(loc => loc !== "all").map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("listings.filterOptions.allTypes")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("listings.filterOptions.allTypes")}</SelectItem>
                    {types.filter(type => type !== "all").map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("listings.filterOptions.anyPrice")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("listings.filterOptions.anyPrice")}</SelectItem>
                    <SelectItem value="0-5m">{t("listings.filterOptions.under5m")}</SelectItem>
                    <SelectItem value="5m-10m">{t("listings.filterOptions.between5And10")}</SelectItem>
                    <SelectItem value="10m+">{t("listings.filterOptions.over10")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={bedsFilter} onValueChange={setBedsFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("listings.filterOptions.anyBeds")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("listings.filterOptions.anyBeds")}</SelectItem>
                    <SelectItem value="1">{t("listings.filterOptions.onePlus")}</SelectItem>
                    <SelectItem value="2">{t("listings.filterOptions.twoPlus")}</SelectItem>
                    <SelectItem value="3">{t("listings.filterOptions.threePlus")}</SelectItem>
                    <SelectItem value="4">{t("listings.filterOptions.fourPlus")}</SelectItem>
                    <SelectItem value="5">{t("listings.filterOptions.fivePlus")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={bathsFilter} onValueChange={setBathsFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("listings.filterOptions.anyBaths")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("listings.filterOptions.anyBaths")}</SelectItem>
                    <SelectItem value="1">{t("listings.filterOptions.onePlusBaths")}</SelectItem>
                    <SelectItem value="2">{t("listings.filterOptions.twoPlusBaths")}</SelectItem>
                    <SelectItem value="3">{t("listings.filterOptions.threePlusBaths")}</SelectItem>
                    <SelectItem value="4">{t("listings.filterOptions.fourPlusBaths")}</SelectItem>
                  </SelectContent>
                </Select>

                {listingType === "sale" ? (
                  <Select value={constructionStatusFilter} onValueChange={setConstructionStatusFilter}>
                    <SelectTrigger className="h-12">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder={t("listings.filterOptions.anyStatus")} />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("listings.filterOptions.anyStatus")}</SelectItem>
                      <SelectItem value="Finished Construction">{t("listings.filterOptions.finishedConstruction")}</SelectItem>
                      <SelectItem value="Under Construction">{t("listings.filterOptions.underConstruction")}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-between border-t border-white/10 pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={featuredOnly ? "default" : "outline"}
                    size="sm"
                    className="border-white/30 bg-white/5 text-white"
                    onClick={() => setFeaturedOnly((prev) => !prev)}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    {t("listings.quickFilters.featured")}
                  </Button>
                  <Button
                    type="button"
                    variant={sortBy === "newest" ? "default" : "outline"}
                    size="sm"
                    className="border-white/30 bg-white/5 text-white"
                    onClick={() => setSortBy("newest")}
                  >
                    {t("listings.quickFilters.newest")}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white"
                  onClick={() => {
                    setSearchQuery("");
                    setLocationFilter("all");
                    setTypeFilter("all");
                    setPriceFilter("all");
                    setBedsFilter("all");
                    setBathsFilter("all");
                    setListingType("sale");
                    setConstructionStatusFilter("all");
                    setFeaturedOnly(false);
                    setSortBy("featured");
                  }}
                >
                  {t("common.clearFilters")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sort Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-muted-foreground">
                {t("listings.sortLabel")}
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{t("listings.sortOptions.featured")}</SelectItem>
                  <SelectItem value="price-low">{t("listings.sortOptions.priceLow")}</SelectItem>
                  <SelectItem value="price-high">{t("listings.sortOptions.priceHigh")}</SelectItem>
                  <SelectItem value="beds">{t("listings.sortOptions.beds")}</SelectItem>
                  <SelectItem value="sqft">{t("listings.sortOptions.sqft")}</SelectItem>
                  <SelectItem value="newest">{t("listings.sortOptions.newest")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Grid */}
          {isLoading ? (
            <p className="text-muted-foreground">{t("common.loadingListings")}</p>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  id={property._id}
                  image={property.coverImage}
                  title={property.title}
                  location={property.location}
                  price={property.priceLabel}
                  beds={property.beds}
                  baths={property.baths}
                  sqft={property.sqftLabel}
                  status={property.status}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">{t("listings.emptyTitle")}</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setLocationFilter("all");
                  setTypeFilter("all");
                  setPriceFilter("all");
                  setBedsFilter("all");
                }}
                className="mt-4"
                variant="outline"
              >
                {t("common.clearFilters")}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Listings;
