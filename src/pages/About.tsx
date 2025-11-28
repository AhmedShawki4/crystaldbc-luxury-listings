import { Award, Users, Target, Heart } from "lucide-react";
import { useEffect } from "react";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000"
            alt="About CrystalDBC"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-luxury-dark/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 fade-in">
            About CrystalDBC
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto fade-in">
            Excellence in luxury real estate since 1995
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-display font-bold text-primary mb-6">Our Story</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Founded in 1995, CrystalDBC has established itself as a premier luxury real estate
                firm, specializing in exceptional properties that define sophisticated living.
                Our commitment to excellence and personalized service has earned us the trust of
                discerning clients worldwide.
              </p>
              <p>
                With decades of combined experience, our team brings unparalleled expertise in the
                luxury real estate market. We understand that finding the perfect property is about
                more than just square footage and amenities—it's about discovering a place that
                truly feels like home.
              </p>
              <p>
                At CrystalDBC, we pride ourselves on our attention to detail, market knowledge, and
                dedication to delivering results that exceed expectations. Whether you're buying,
                selling, or investing, we're here to guide you every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold text-primary text-center mb-16">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Award className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-3">
                Excellence
              </h3>
              <p className="text-muted-foreground">
                We strive for excellence in every transaction and interaction
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Users className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-3">
                Expertise
              </h3>
              <p className="text-muted-foreground">
                Deep market knowledge and proven track record of success
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Target className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-3">
                Integrity
              </h3>
              <p className="text-muted-foreground">
                Honest, transparent, and ethical in all our business practices
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Heart className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary mb-3">
                Service
              </h3>
              <p className="text-muted-foreground">
                Personalized attention and dedication to client satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-luxury-dark text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-display font-bold text-accent mb-2">28+</p>
              <p className="text-white/80">Years Experience</p>
            </div>
            <div>
              <p className="text-5xl font-display font-bold text-accent mb-2">2,500+</p>
              <p className="text-white/80">Properties Sold</p>
            </div>
            <div>
              <p className="text-5xl font-display font-bold text-accent mb-2">$5B+</p>
              <p className="text-white/80">Total Sales Volume</p>
            </div>
            <div>
              <p className="text-5xl font-display font-bold text-accent mb-2">98%</p>
              <p className="text-white/80">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
