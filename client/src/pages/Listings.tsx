import { useMemo, useState, useEffect } from "react";
import PropertyCard from "@/components/PropertyCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign, Bed, Building2, Hammer, Bath, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import useProperties, { type PropertyFilters } from "@/hooks/useProperties";
import PageHero from "@/components/PageHero";
import { useTranslation } from "react-i18next";

const Listings = () => {
  const { t } = useTranslation();
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [investableOnly, setInvestableOnly] = useState(false);

  const filters = useMemo<PropertyFilters>(() => {
    const params: PropertyFilters = {};
    if (searchQuery) params.search = searchQuery;
    if (locationFilter !== "all") params.location = locationFilter;
    if (typeFilter !== "all") params.type = typeFilter;
    if (statusFilter !== "all") params.status = statusFilter;
    if (bedsFilter !== "all") params.minBeds = Number(bedsFilter);
    if (bathsFilter !== "all") params.minBaths = Number(bathsFilter);
    if (featuredOnly) params.featured = true;
    if (investableOnly) params.investable = true;

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
  }, [searchQuery, locationFilter, typeFilter, statusFilter, bedsFilter, bathsFilter, priceFilter, featuredOnly, investableOnly, sortBy]);

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
        eyebrow={t("listings.heroEyebrow")}
        title={t("listings.heroTitle")}
        description={t("listings.heroDescription")}
        icon={Building2}
        stats={[
          { label: t("listings.stats.active"), value: isLoading ? "..." : `${properties.length}` },
          { label: t("listings.stats.cities"), value: `${cityCount}`, helper: t("listings.stats.citiesHelper") },
          { label: t("listings.stats.types"), value: `${typeCount}`, helper: t("listings.stats.typesHelper") },
        ]}
      />

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

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Hammer className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t("listings.filterOptions.anyStatus")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("listings.filterOptions.anyStatus")}</SelectItem>
                    <SelectItem value="For Sale">{t("listings.filterOptions.forSale")}</SelectItem>
                    <SelectItem value="For Rent">{t("listings.filterOptions.forRent")}</SelectItem>
                    <SelectItem value="Under Construction">{t("listings.filterOptions.underConstruction")}</SelectItem>
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
                    {t("listings.quickFilters.featured")}
                  </Button>
                  <Button
                    type="button"
                    variant={investableOnly ? "default" : "outline"}
                    size="sm"
                    className="border-white/30 bg-white/5 text-white"
                    onClick={() => setInvestableOnly((prev) => !prev)}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Investable only
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
                    setStatusFilter("all");
                    setFeaturedOnly(false);
                    setInvestableOnly(false);
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
