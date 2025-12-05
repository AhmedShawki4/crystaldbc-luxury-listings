import { useMemo, useState, useEffect } from "react";
import PropertyCard from "@/components/PropertyCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign, Bed, SlidersHorizontal, Building2, Hammer } from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo<PropertyFilters>(() => {
    const params: PropertyFilters = {};
    if (searchQuery) params.search = searchQuery;
    if (locationFilter !== "all") params.location = locationFilter;
    if (typeFilter !== "all") params.type = typeFilter;
    if (statusFilter !== "all") params.status = statusFilter;
    if (bedsFilter !== "all") params.minBeds = Number(bedsFilter);

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
  }, [searchQuery, locationFilter, typeFilter, statusFilter, bedsFilter, priceFilter, sortBy]);

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
        actions={(
          <>
            <Button asChild className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold/80 shadow-lg shadow-luxury-gold/20">
              <a href="#filters">{t("listings.ctas.refine")}</a>
            </Button>
            <Button asChild variant="outline" className="border-accent bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent-foreground">
              <a href="/contact">{t("listings.ctas.advisor")}</a>
            </Button>
          </>
        )}
      />

      {/* Search and Filters */}
      <section id="filters" className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("listings.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="font-medium">{t("listings.filters")}</span>
            </Button>
            <div className="text-sm text-muted-foreground">
              {isLoading ? t("listings.loading") : (
                <>
                  <span className="font-semibold text-foreground">{properties.length}</span> {t("listings.resultsLabel")}
                </>
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-200">
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
          )}
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
