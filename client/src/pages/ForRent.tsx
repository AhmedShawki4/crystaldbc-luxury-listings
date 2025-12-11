import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHero from "@/components/PageHero";
import PropertyCard from "@/components/PropertyCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Home, MapPin, Bed, KeyRound, Search, Bath, Sparkles } from "lucide-react";
import useProperties, { type PropertyFilters } from "@/hooks/useProperties";
import { useTranslation } from "react-i18next";

const ForRent = () => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [bedsFilter, setBedsFilter] = useState("all");
  const [bathsFilter, setBathsFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filters = useMemo<PropertyFilters>(() => {
    const params: PropertyFilters = { status: "For Rent" };
    if (searchQuery) params.search = searchQuery;
    if (locationFilter !== "all") params.location = locationFilter;
    if (typeFilter !== "all") params.type = typeFilter;
    if (bedsFilter !== "all") params.minBeds = Number(bedsFilter);
    if (bathsFilter !== "all") params.minBaths = Number(bathsFilter);

    if (featuredOnly) {
      params.featured = true;
    }

    if (priceFilter !== "all") {
      if (priceFilter === "0-100k") {
        params.priceMax = 100_000;
      } else if (priceFilter === "100k-250k") {
        params.priceMin = 100_000;
        params.priceMax = 250_000;
      } else if (priceFilter === "250k+") {
        params.priceMin = 250_000;
      }
    }

    if (sortBy !== "featured") {
      params.sort = sortBy;
    }

    return params;
  }, [searchQuery, locationFilter, typeFilter, bedsFilter, bathsFilter, priceFilter, featuredOnly, sortBy]);

  const { data: properties = [], isLoading } = useProperties(filters);

  const locations = useMemo(
    () => ["all", ...Array.from(new Set(properties.map((p) => p.location)))],
    [properties]
  );

  const types = useMemo(
    () => ["all", ...Array.from(new Set(properties.map((p) => p.type)))],
    [properties]
  );

  const cityCount = Math.max(locations.length - 1, 0);
  const typeCount = Math.max(types.length - 1, 0);

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow={t("rentals.heroEyebrow")}
        title={t("rentals.heroTitle")}
        description={t("rentals.heroDescription")}
        icon={KeyRound}
        stats={[
          { label: t("rentals.stats.listings"), value: isLoading ? "..." : `${properties.length}` },
          { label: t("rentals.stats.cities"), value: `${cityCount}`, helper: t("rentals.stats.citiesHelper") },
          { label: t("rentals.stats.types"), value: `${typeCount}`, helper: t("rentals.stats.typesHelper") },
        ]}
        actions={(
          <Button asChild className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold/85 shadow-lg shadow-luxury-gold/20">
            <a href="/auth/login">Pay Your Rent</a>
          </Button>
        )}
      />

      {/* Search and Filters */}
      <section id="filters" className="relative isolate py-12 bg-gradient-to-b from-luxury-dark/40 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-luxury-dark/40 backdrop-blur-xl shadow-2xl shadow-luxury-gold/15">
            <div className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("rentals.filters")}</p>
                  <h2 className="text-2xl font-display font-semibold text-foreground">{t("rentals.heroTitle")}</h2>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isLoading ? t("rentals.loading") : (
                    <>
                      <span className="font-semibold text-foreground">{properties.length}</span> {t("rentals.resultsLabel")}
                    </>
                  )}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("rentals.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("rentals.filterOptions.allLocations")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("rentals.filterOptions.allLocations")}</SelectItem>
                    {locations.filter((loc) => loc !== "all").map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("rentals.filterOptions.allTypes")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("rentals.filterOptions.allTypes")}</SelectItem>
                    {types.filter((type) => type !== "all").map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("rentals.filterOptions.anyPrice")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("rentals.filterOptions.anyPrice")}</SelectItem>
                    <SelectItem value="0-100k">{t("rentals.filterOptions.under100")}</SelectItem>
                    <SelectItem value="100k-250k">{t("rentals.filterOptions.between100And250")}</SelectItem>
                    <SelectItem value="250k+">{t("rentals.filterOptions.over250")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={bedsFilter} onValueChange={setBedsFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("rentals.filterOptions.anyBeds")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("rentals.filterOptions.anyBeds")}</SelectItem>
                    <SelectItem value="1">{t("rentals.filterOptions.onePlus")}</SelectItem>
                    <SelectItem value="2">{t("rentals.filterOptions.twoPlus")}</SelectItem>
                    <SelectItem value="3">{t("rentals.filterOptions.threePlus")}</SelectItem>
                    <SelectItem value="4">{t("rentals.filterOptions.fourPlus")}</SelectItem>
                    <SelectItem value="5">{t("rentals.filterOptions.fivePlus")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={bathsFilter} onValueChange={setBathsFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("rentals.filterOptions.anyBaths")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("rentals.filterOptions.anyBaths")}</SelectItem>
                    <SelectItem value="1">{t("rentals.filterOptions.onePlusBaths")}</SelectItem>
                    <SelectItem value="2">{t("rentals.filterOptions.twoPlusBaths")}</SelectItem>
                    <SelectItem value="3">{t("rentals.filterOptions.threePlusBaths")}</SelectItem>
                    <SelectItem value="4">{t("rentals.filterOptions.fourPlusBaths")}</SelectItem>
                  </SelectContent>
                </Select>
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
                    {t("rentals.quickFilters.featured")}
                  </Button>
                  <Button
                    type="button"
                    variant={sortBy === "newest" ? "default" : "outline"}
                    size="sm"
                    className="border-white/30 bg-white/5 text-white"
                    onClick={() => setSortBy("newest")}
                  >
                    {t("rentals.quickFilters.newest")}
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

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-muted-foreground">
                {t("rentals.sortLabel")}
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{t("rentals.sortOptions.featured")}</SelectItem>
                  <SelectItem value="price-low">{t("rentals.sortOptions.priceLow")}</SelectItem>
                  <SelectItem value="price-high">{t("rentals.sortOptions.priceHigh")}</SelectItem>
                  <SelectItem value="beds">{t("rentals.sortOptions.beds")}</SelectItem>
                  <SelectItem value="sqft">{t("rentals.sortOptions.sqft")}</SelectItem>
                  <SelectItem value="newest">{t("rentals.sortOptions.newest")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">{t("rentals.loading")}</p>
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
              <p className="text-lg text-muted-foreground">{t("rentals.emptyTitle")}</p>
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

export default ForRent;
