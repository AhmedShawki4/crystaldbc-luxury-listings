import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Bed, Bath, Maximize, MapPin, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import properties from "@/data/properties.json";

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const property = properties.find((p) => p.id === id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  if (!property) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <Button asChild>
            <Link to="/listings">Back to Listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you shortly.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/listings">
            <ArrowLeft className="mr-2" size={20} />
            Back to Listings
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden mb-4">
                <img
                  src={property.images?.[currentImageIndex] || property.image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold">
                  {property.status}
                </div>
              </div>
              {property.images && property.images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-24 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-soft mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin size={18} className="mr-1" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-primary">
                    {formatPrice(property.price)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Bed size={24} className="text-primary" />
                  </div>
                  <div className="font-semibold text-foreground">{property.bedrooms}</div>
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Bath size={24} className="text-primary" />
                  </div>
                  <div className="font-semibold text-foreground">{property.bathrooms}</div>
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Maximize size={24} className="text-primary" />
                  </div>
                  <div className="font-semibold text-foreground">{property.area} m²</div>
                  <div className="text-sm text-muted-foreground">Area</div>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="font-heading font-semibold text-xl mb-3 text-foreground">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              {property.features && (
                <div className="mt-6">
                  <h2 className="font-heading font-semibold text-xl mb-3 text-foreground">Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-muted-foreground">
                        <Check size={18} className="text-primary mr-2" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map Placeholder */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
              <h2 className="font-heading font-semibold text-xl mb-4 text-foreground">Location</h2>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin size={48} className="mx-auto mb-2" />
                  <p>Map integration would go here</p>
                  <p className="text-sm">{property.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Form */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
                <h2 className="font-heading font-semibold text-xl mb-4 text-foreground">
                  Interested in this property?
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                  <Textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Schedule Visit */}
              <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-soft">
                <h3 className="font-heading font-semibold text-xl mb-2">Schedule a Visit</h3>
                <p className="mb-4 opacity-90">See this property in person</p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link to="/contact">Book a Tour</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
