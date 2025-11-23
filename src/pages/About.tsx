import { Award, Users, Target, TrendingUp } from "lucide-react";

const AboutPage = () => {
  const team = [
    {
      name: "Michael Anderson",
      role: "CEO & Founder",
      image: "/placeholder.svg",
    },
    {
      name: "Sarah Thompson",
      role: "Head of Sales",
      image: "/placeholder.svg",
    },
    {
      name: "David Chen",
      role: "Senior Agent",
      image: "/placeholder.svg",
    },
    {
      name: "Emma Williams",
      role: "Marketing Director",
      image: "/placeholder.svg",
    },
  ];

  const stats = [
    { icon: Users, value: "500+", label: "Happy Clients" },
    { icon: Award, value: "15+", label: "Years Experience" },
    { icon: Target, value: "1000+", label: "Properties Sold" },
    { icon: TrendingUp, value: "$2B+", label: "Total Sales" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            About <span className="text-primary">CrystalDBC</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your trusted partner in luxury real estate, committed to excellence and personalized service
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                At CrystalDBC, we believe that finding your dream property should be an exciting and seamless experience. 
                Our mission is to connect exceptional properties with exceptional people, delivering unparalleled service 
                and expertise at every step of your real estate journey.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                With over 15 years of experience in the luxury real estate market, we've built our reputation on trust, 
                integrity, and a deep understanding of what makes a house a home. Our team of dedicated professionals is 
                committed to exceeding your expectations and making your real estate dreams a reality.
              </p>
            </div>
            <div className="bg-muted h-96 rounded-xl flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Mission Image Placeholder</p>
                <p className="text-sm">Add image of team or office</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                  <stat.icon size={32} />
                </div>
                <div className="text-4xl font-heading font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Excellence",
                description: "We strive for excellence in every interaction, ensuring the highest quality of service and attention to detail.",
              },
              {
                title: "Integrity",
                description: "Honesty and transparency are at the core of our business. We build lasting relationships based on trust.",
              },
              {
                title: "Innovation",
                description: "We embrace new technologies and approaches to provide our clients with cutting-edge solutions.",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-8 text-center hover-lift shadow-soft"
              >
                <h3 className="font-heading font-semibold text-xl mb-3 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experienced professionals dedicated to your success
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="bg-muted h-64 rounded-xl mb-4 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-primary text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
