import "@google/model-viewer";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, TrendingUp, Building2, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Investment = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const benefits = [
        {
            title: "High ROI Potential",
            description: "Targeted returns of 8-12% annually through strategic property acquisition and management.",
            icon: TrendingUp
        },
        {
            title: "Asset-Backed Security",
            description: "Your investment is secured by tangible, high-value luxury real estate assets.",
            icon: Building2
        },
        {
            title: "Market Analysis",
            description: "Data-driven insights and comprehensive market research guide every investment decision.",
            icon: BarChart3
        },
        {
            title: "Diversification",
            description: "Spread risk across a portfolio of premium properties in prime locations.",
            icon: PieChart
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 bg-luxury-dark text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-luxury-dark/80 to-luxury-dark pointer-events-none" />

                <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 mb-8 fade-in">
                                <span className="text-sm font-semibold uppercase tracking-wider">CrystalDBC Investment</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 fade-in">
                                Invest in <span className="text-luxury-gold">Luxury Real Estate</span>
                            </h1>
                            <p className="text-xl text-white/80 max-w-2xl mx-auto lg:mx-0 mb-10 fade-in">
                                Join an exclusive circle of investors and build wealth through our curated portfolio of premium properties.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start fade-in">
                                <Button asChild size="lg" className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-dark font-semibold text-lg px-8">
                                    <Link to="/contact">Start Investing</Link>
                                </Button>
                                <Button size="lg" className="bg-white text-luxury-dark hover:bg-white/90 font-semibold text-lg px-8">
                                    Download Brochure
                                </Button>
                            </div>
                        </div>

                        <div className="h-[450px] md:h-[600px] w-full relative fade-in">
                            {/* @ts-ignore */}
                            <model-viewer
                                src="/base_basic_pbr.glb"
                                ios-src=""
                                poster="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                                alt="A 3D model of a luxury property"
                                shadow-intensity="1"
                                camera-controls
                                disable-zoom
                                auto-rotate
                                ar
                                style={{ width: '100%', height: '100%' }}
                            >
                                {/* @ts-ignore */}
                            </model-viewer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
                            Why Invest with CrystalDBC?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            We combine market expertise with exclusive access to deliver superior investment outcomes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <Card key={index} className="border-border/50 hover:border-luxury-gold/50 transition-colors duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-luxury-gold/10 flex items-center justify-center mb-4">
                                        <benefit.icon className="w-6 h-6 text-luxury-gold" />
                                    </div>
                                    <CardTitle className="text-xl font-display">{benefit.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        {benefit.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-luxury-dark rounded-2xl overflow-hidden shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-12 md:p-16 flex flex-col justify-center">
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                                    Ready to Grow Your Portfolio?
                                </h2>
                                <p className="text-lg text-white/80 mb-8">
                                    Schedule a consultation with our investment advisors to discuss your goals and explore current opportunities.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        "Personalized Investment Strategy",
                                        "Access to Off-Market Deals",
                                        "Full-Service Asset Management",
                                        "Quarterly Performance Reports"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-white/90">
                                            <CheckCircle2 className="w-5 h-5 text-luxury-gold" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button size="lg" className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-dark font-semibold w-fit">
                                    <Link to="/contact">
                                        Contact Investment Team
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="relative h-64 lg:h-auto">
                                <img
                                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80"
                                    alt="Luxury Interior"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Investment;
