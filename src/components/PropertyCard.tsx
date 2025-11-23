import { Link } from "react-router-dom";
import { Bed, Bath, Maximize, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  type: string;
}

const PropertyCard = ({
  id,
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  image,
  type,
}: PropertyCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/property/${id}`}>
      <Card className="group overflow-hidden hover-lift border-border">
        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            {type}
          </div>
        </div>
        <CardContent className="p-6">
          <div className="mb-2 flex items-center text-muted-foreground text-sm">
            <MapPin size={16} className="mr-1" />
            {location}
          </div>
          <h3 className="font-heading font-semibold text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Bed size={18} className="mr-1" />
                <span>{bedrooms}</span>
              </div>
              <div className="flex items-center">
                <Bath size={18} className="mr-1" />
                <span>{bathrooms}</span>
              </div>
              <div className="flex items-center">
                <Maximize size={18} className="mr-1" />
                <span>{area} m²</span>
              </div>
            </div>
          </div>
          <div className="text-2xl font-heading font-bold text-primary">
            {formatPrice(price)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;
