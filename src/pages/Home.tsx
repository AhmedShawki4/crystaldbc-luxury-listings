import { useState } from "react";
import { Search, Home, Award, Users, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropertyCard from "@/components/PropertyCard";
import properties from "@/data/properties.json";
import heroBackground from "@/assets/hero-background.jpg";

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const featuredProperties = properties.filter((p) => p.featured).slice(0, 3);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Property Owner",
      content: "CrystalDBC helped us find our dream home. Their professionalism and attention to detail made the entire process seamless and enjoyable.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Investor",
      content: "Outstanding service! The team at CrystalDBC truly understands the luxury real estate market and delivered exceptional results.",
      rating: 5,
    },
    {
      name: "Emma Williams",
      role: "Home Buyer",
      content: "From start to finish, CrystalDBC exceeded our expectations. They found us the perfect property and handled everything with care.",
      rating: 5,
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 animate-fade-in" style={{ textShadow: '2px 4px 12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.3)' }}>
            Find Your Dream Property <br />
            <span className="text-primary" style={{ textShadow: '2px 4px 12px rgba(0, 0, 0, 0.8), 0 0 60px rgba(212, 175, 55, 0.5)' }}>with CrystalDBC</span>
          </h1>
          <p className="text-xl md:text-2xl text-white mb-12 max-w-2xl mx-auto animate-slide-up" style={{ textShadow: '1px 2px 8px rgba(0, 0, 0, 0.8)' }}>
            Discover exceptional homes in the most desirable locations
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto glass-effect rounded-2xl p-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Location"
                className="bg-background border-border"
              />
              <Select>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="estate">Estate</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1m">Under $1M</SelectItem>
                  <SelectItem value="1m-3m">$1M - $3M</SelectItem>
                  <SelectItem value="3m-5m">$3M - $5M</SelectItem>
                  <SelectItem value="5m+">$5M+</SelectItem>
                </SelectContent>
              </Select>
              <Button size="lg" className="w-full">
                <Search className="mr-2" size={20} />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Featured Properties
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our handpicked selection of premium properties
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <a href="/listings">View All Properties</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Why Choose CrystalDBC
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience excellence in real estate services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Home,
                title: "Premium Properties",
                description: "Exclusive access to luxury properties in prime locations",
              },
              {
                icon: Award,
                title: "Expert Team",
                description: "Professional agents with years of experience",
              },
              {
                icon: Users,
                title: "Personalized Service",
                description: "Dedicated support tailored to your needs",
              },
              {
                icon: TrendingUp,
                title: "Best Deals",
                description: "Competitive pricing and smart investment opportunities",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-card hover-lift border border-border"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <feature.icon size={32} />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              What Our Clients Say
            </h2>
            <p className="text-muted-foreground text-lg">
              Real experiences from satisfied homeowners
            </p>
          </div>
          <div className="max-w-3xl mx-auto relative">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-soft">
              <div className="flex items-center justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <span key={i} className="text-primary text-2xl">★</span>
                ))}
              </div>
              <p className="text-lg text-foreground text-center mb-6 italic">
                "{testimonials[currentTestimonial].content}"
              </p>
              <div className="text-center">
                <p className="font-heading font-semibold text-foreground">
                  {testimonials[currentTestimonial].name}
                </p>
                <p className="text-muted-foreground text-sm">
                  {testimonials[currentTestimonial].role}
                </p>
              </div>
            </div>
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Let our experts guide you to the perfect property
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="/listings">Browse Properties</a>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
              <a href="/contact">Contact Us</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
