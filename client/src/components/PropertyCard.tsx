import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getMediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import useWishlistActions from "@/hooks/useWishlistActions";

interface PropertyCardProps {
  id: number | string;
  image: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
}

const PropertyCard = ({
  id,
  image,
  title,
  location,
  price,
  beds,
  baths,
  sqft,
}: PropertyCardProps) => {
  const { addToWishlist, activeId, isAdding } = useWishlistActions();
  const rawId = id?.toString();
  const propertyId = rawId && /^[a-f\d]{24}$/i.test(rawId) ? rawId : undefined;

  const handleWishlist = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    addToWishlist(propertyId);
  };

  const isSaving = propertyId && activeId === propertyId && isAdding;

  return (
    <Link to={`/property/${id}`} className="block group">
      <Card className="overflow-hidden border-border hover-lift bg-card">
        <div className="relative h-64 overflow-hidden">
          <img
            src={getMediaUrl(image)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold">
            {price}
          </div>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute top-4 left-4 rounded-full bg-white/90 text-primary hover:bg-white"
            onClick={handleWishlist}
            disabled={!propertyId || isSaving}
            aria-label="Save to wishlist"
          >
            <Heart className={`h-4 w-4 ${isSaving ? "animate-pulse" : ""}`} />
          </Button>
          {rawId && !propertyId && (
            <span className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              Link property to save
            </span>
          )}
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-display font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4" />
              <span>{beds} Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4" />
              <span>{baths} Baths</span>
            </div>
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              <span>{sqft}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;
