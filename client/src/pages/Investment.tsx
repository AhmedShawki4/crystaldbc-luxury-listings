import "@google/model-viewer";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, TrendingUp, Building2, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const Investment = () => {
    const { t } = useTranslation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const heroTitle = t("investment.heroTitle");
    const heroTitleParts = heroTitle.split(" ");
    const highlightWords = heroTitleParts.slice(-2).join(" ") || heroTitle;
    const heroTitlePrefix = heroTitleParts.slice(0, heroTitleParts.length - 2).join(" ");

    const benefits = [
        {
            title: t("investment.benefits.roi.title"),
            description: t("investment.benefits.roi.description"),
            icon: TrendingUp
        },
        {
            title: t("investment.benefits.security.title"),
            description: t("investment.benefits.security.description"),
            icon: Building2
        },
        {
            title: t("investment.benefits.analysis.title"),
            description: t("investment.benefits.analysis.description"),
            icon: BarChart3
        },
        {
            title: t("investment.benefits.diversification.title"),
            description: t("investment.benefits.diversification.description"),
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
                                <span className="text-sm font-semibold uppercase tracking-wider">{t("investment.badge")}</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 fade-in">
                                {heroTitlePrefix ? `${heroTitlePrefix} ` : ""}
                                <span className="text-luxury-gold">{highlightWords}</span>
                            </h1>
                            <p className="text-xl text-white/80 max-w-2xl mx-auto lg:mx-0 mb-10 fade-in">
                                {t("investment.heroSubtitle")}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start fade-in">
                                <Button asChild size="lg" className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-dark font-semibold text-lg px-8">
                                    <Link to="/contact">{t("investment.ctaStart")}</Link>
                                </Button>
                                <Button size="lg" className="bg-white text-luxury-dark hover:bg-white/90 font-semibold text-lg px-8">
                                    {t("investment.ctaBrochure")}
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
                            {t("investment.benefitsTitle")}
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t("investment.benefitsSubtitle")}
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
                                    {t("investment.ctaTitle")}
                                </h2>
                                <p className="text-lg text-white/80 mb-8">
                                    {t("investment.ctaSubtitle")}
                                </p>
                                <ul className="space-y-4 mb-8">
                                    {(t("investment.ctaList", { returnObjects: true }) as string[]).map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-white/90">
                                            <CheckCircle2 className="w-5 h-5 text-luxury-gold" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button size="lg" className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-dark font-semibold w-fit">
                                    <Link to="/contact">
                                        {t("investment.ctaButton")}
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
