import { useMemo, useState, useEffect } from "react";
import PropertyCard from "@/components/PropertyCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Home, DollarSign, Bed, SlidersHorizontal, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useProperties, { type PropertyFilters } from "@/hooks/useProperties";
import PageHero from "@/components/PageHero";

const Listings = () => {
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [bedsFilter, setBedsFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo<PropertyFilters>(() => {
    const params: PropertyFilters = {};
    if (searchQuery) params.search = searchQuery;
    if (locationFilter !== "all") params.location = locationFilter;
    if (typeFilter !== "all") params.type = typeFilter;
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
  }, [searchQuery, locationFilter, typeFilter, bedsFilter, priceFilter, sortBy]);

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
        eyebrow="Luxury Listings"
        title="Egypt Properties"
        description="Discover premium residences across New Cairo, North Coast, and the Red Sea — curated for discerning investors."
        icon={Building2}
        stats={[
          { label: "Active Listings", value: isLoading ? "..." : `${properties.length}` },
          { label: "Cities", value: `${cityCount}`, helper: "Across Egypt" },
          { label: "Property Types", value: `${typeCount}`, helper: "Villas, penthouses, more" },
        ]}
        actions={(
          <>
            <Button asChild className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold/80 shadow-lg shadow-luxury-gold/20">
              <a href="#filters">Refine Search</a>
            </Button>
            <Button asChild variant="outline" className="border-accent bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent-foreground">
              <a href="/contact">Talk to an Advisor</a>
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
              placeholder="Search properties by name or location..."
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
              <span className="font-medium">Filters</span>
            </Button>
            <div className="text-sm text-muted-foreground">
              {isLoading ? "Loading properties..." : (
                <>
                  <span className="font-semibold text-foreground">{properties.length}</span> properties found
                </>
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="h-12">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Locations" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.filter(loc => loc !== "all").map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-12">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Types" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.filter(type => type !== "all").map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="h-12">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Any Price" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="0-5m">Under $5M</SelectItem>
                <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                <SelectItem value="10m+">$10M+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bedsFilter} onValueChange={setBedsFilter}>
              <SelectTrigger className="h-12">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Any Bedrooms" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Bedrooms</SelectItem>
                <SelectItem value="1">1+ Bedrooms</SelectItem>
                <SelectItem value="2">2+ Bedrooms</SelectItem>
                <SelectItem value="3">3+ Bedrooms</SelectItem>
                <SelectItem value="4">4+ Bedrooms</SelectItem>
                <SelectItem value="5">5+ Bedrooms</SelectItem>
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
                Sort by:
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="beds">Most Bedrooms</SelectItem>
                  <SelectItem value="sqft">Largest Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Grid */}
          {isLoading ? (
            <p className="text-muted-foreground">Loading listings...</p>
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
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No properties found matching your criteria.</p>
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
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Listings;
