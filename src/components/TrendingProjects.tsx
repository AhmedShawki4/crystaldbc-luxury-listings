import { MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProjectAmenity {
  name: string;
}

interface TrendingProject {
  id: number;
  name: string;
  location: string;
  image: string;
  status: string;
  description: string;
  amenities: ProjectAmenity[];
  completion: string;
  startingPrice: string;
  developer: string;
  propertyId?: number; // Link to actual property if available
}

const trendingProjects: TrendingProject[] = [
  {
    id: 1,
    name: "Binghatti Moonlight",
    location: "Al Jaddaf",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1400",
    status: "Presale",
    description:
      "Binghatti Moonlight is a sculptural architectural statement that rises with quiet precision from the heart of Al Jaddaf. Designed not just to impress but to reflect, its crystalline façade captures and re-emits the soft lunar glow, creating a constant dialogue between light, form, and atmosphere. The tower's silhouette, crowned with an illuminated framework, stands as a beacon of contemporary elegance and refined urban living.",
    amenities: [
      { name: "Common Gym" },
      { name: "Swimming Pool" },
      { name: "Seating Area" },
      { name: "Retail Shops" },
    ],
    completion: "June 2026",
    startingPrice: "1.5M AED",
    developer: "Binghatti",
    propertyId: 1, // Links to Modern Waterfront Villa
  },
  {
    id: 2,
    name: "The Serene at Sobha Central",
    location: "Sobha Hartland",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1400",
    status: "Presale",
    description:
      "The Serene at Sobha Central is a masterfully envisioned residential project that redefines Egypt's skyline with its iconic, futuristic design. Towering high with sleek lines and glass facades, the architecture is a true statement of modern sophistication and grandeur. Strategically nestled in a green landscape and urban framework, the towers appear as crystalline structures reflecting light and life, offering residents a harmonious blend of nature and metropolitan living.",
    amenities: [
      { name: "Swimming Pool" },
      { name: "Jogging Track" },
      { name: "Sport Courts" },
      { name: "Open Activity, Picnic & Event Lawn" },
      { name: "Open Plaza with Water Feature & Sculpture" },
      { name: "Outdoor Sitting Area Pockets" },
      { name: "Children's Play Area" },
      { name: "Calisthenic Gym" },
      { name: "Outdoor cinema & Movie Lawn" },
      { name: "Library" },
      { name: "Family Barbecue Gathering Space" },
      { name: "Steam and Sauna" },
      { name: "Multipurpose Hall" },
      { name: "Yoga Studio & Meditation Room" },
    ],
    completion: "December 2029",
    startingPrice: "1.8M AED",
    developer: "Sobha",
    propertyId: 2, // Links to Contemporary Penthouse
  },
  {
    id: 3,
    name: "Damac Bay 2",
    location: "Egypt Harbour",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1400",
    status: "Presale",
    description:
      "DAMAC Bay 2 is a stunning waterfront development offering luxurious living with breathtaking views of the Arabian Gulf. This architectural marvel features modern design with flowing curves and premium finishes. Located in the prestigious Egypt Harbour, residents enjoy direct access to pristine beaches, yacht clubs, and world-class dining experiences.",
    amenities: [
      { name: "Private Beach Access" },
      { name: "Infinity Pool" },
      { name: "Yacht Club" },
      { name: "Spa & Wellness Center" },
      { name: "Fitness Center" },
      { name: "Kids Play Area" },
      { name: "Concierge Service" },
      { name: "Retail Outlets" },
    ],
    completion: "December 2027",
    startingPrice: "2.2M AED",
    developer: "DAMAC",
    propertyId: 5, // Links to Coastal Contemporary
  },
];

const TrendingProjects = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="py-20 bg-gradient-to-br from-luxury-dark via-luxury-dark/95 to-primary/10 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Dubai's Hottest{" "}
            <span className="text-accent">Property Projects</span>
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Discover the most sought-after developments that are shaping Dubai's future skyline.
            From ultra-luxury penthouses to architectural marvels.
          </p>
        </div>

        <div className="relative px-4 md:px-20 lg:px-24">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {trendingProjects.map((project) => (
                <CarouselItem key={project.id}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Image Section */}
                    <Link 
                      to={project.propertyId ? `/property/${project.propertyId}` : '/listings'}
                      className="relative group cursor-pointer"
                    >
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Badges on Image */}
                        <div className="absolute top-6 left-6">
                          <Badge className="bg-accent/90 text-accent-foreground backdrop-blur-sm border-0 text-sm px-4 py-2">
                            {project.status}
                          </Badge>
                        </div>

                        {/* Price & Developer Badge */}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3">
                            <p className="text-xs text-muted-foreground font-medium">Starting from</p>
                            <p className="text-2xl font-bold text-primary">{project.startingPrice}</p>
                          </div>
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 text-right">
                            <p className="text-xs text-muted-foreground font-medium">Developer</p>
                            <p className="text-lg font-bold text-primary">{project.developer}</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Info Section */}
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-5 w-5 text-accent" />
                          <span className="text-accent font-medium">{project.location}</span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
                          {project.name}
                        </h3>
                        <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                          Project general facts
                        </p>
                        <p className="text-white/80 leading-relaxed line-clamp-4">
                          {project.description}
                        </p>
                      </div>

                      {/* Amenities Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {project.amenities.map((amenity, index) => (
                          <div
                            key={index}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-center text-sm text-white/90 hover:bg-white/10 transition-colors"
                          >
                            {amenity.name}
                          </div>
                        ))}
                      </div>

                      {/* Completion Date */}
                      <div className="flex items-center gap-2 text-accent">
                        <Calendar className="h-5 w-5" />
                        <span className="font-medium">Completion: {project.completion}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4 pt-4">
                        <Button
                          asChild
                          size="lg"
                          className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1 sm:flex-none"
                        >
                          <Link to={project.propertyId ? `/property/${project.propertyId}` : '/listings'}>
                            Explore Project
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="lg"
                          variant="outline"
                          className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:border-white/40 flex-1 sm:flex-none"
                        >
                          <Link to="/contact">
                            Request Info
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom Navigation Buttons */}
            <button
              onClick={() => api?.scrollPrev()}
              className="absolute -left-4 md:-left-12 lg:-left-16 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group z-10"
              aria-label="Previous project"
            >
              <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              className="absolute -right-4 md:-right-12 lg:-right-16 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group z-10"
              aria-label="Next project"
            >
              <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </Carousel>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  current === index
                    ? "w-8 bg-accent"
                    : "w-2 bg-white/30 hover:bg-white/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingProjects;
