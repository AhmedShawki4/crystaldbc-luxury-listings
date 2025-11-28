import { useParams, Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { properties } from "@/data/properties";
import { useState, useEffect } from "react";

const PropertyDetail = () => {
  const { id } = useParams();
  const property = properties.find((p) => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-primary mb-4">
            Property Not Found
          </h1>
          <Button asChild>
            <Link to="/listings">Back to Listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button asChild variant="ghost" className="group">
          <Link to="/listings">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Listings
          </Link>
        </Button>
      </div>

      {/* Image Gallery */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 gap-4">
          <div className="relative h-[500px] overflow-hidden rounded-lg">
            <img
              src={property.images[selectedImage]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-32 overflow-hidden rounded-lg border-2 transition-all ${
                  selectedImage === index
                    ? "border-accent"
                    : "border-transparent hover:border-border"
                }`}
              >
                <img
                  src={image}
                  alt={`${property.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold">
                  {property.status}
                </span>
                <span className="px-4 py-2 bg-muted text-foreground rounded-full text-sm font-semibold">
                  {property.type}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{property.location}</span>
              </div>
              <p className="text-4xl font-display font-bold text-accent">
                {property.price}
              </p>
            </div>

            <div className="flex items-center gap-8 mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-3">
                <Bed className="h-6 w-6 text-accent" />
                <div>
                  <p className="text-2xl font-semibold text-primary">{property.beds}</p>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bath className="h-6 w-6 text-accent" />
                <div>
                  <p className="text-2xl font-semibold text-primary">{property.baths}</p>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Square className="h-6 w-6 text-accent" />
                <div>
                  <p className="text-2xl font-semibold text-primary">{property.sqft}</p>
                  <p className="text-sm text-muted-foreground">Square Feet</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-primary mb-4">
                About This Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-primary mb-4">
                Features & Amenities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="text-2xl font-display font-bold text-primary mb-4">
                Schedule a Viewing
              </h3>
              <p className="text-muted-foreground mb-6">
                Interested in this property? Contact us to schedule a private viewing.
              </p>
              <div className="space-y-4">
                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link to="/contact">Contact Agent</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/contact">Request Info</Link>
                </Button>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Property ID</p>
                <p className="text-foreground font-semibold">CDBC-{property.id.toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertyDetail;
