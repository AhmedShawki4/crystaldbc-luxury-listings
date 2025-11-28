import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyCardProps {
  id: number;
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
  return (
    <Link to={`/property/${id}`} className="block group">
      <Card className="overflow-hidden border-border hover-lift bg-card">
        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold">
            {price}
          </div>
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
