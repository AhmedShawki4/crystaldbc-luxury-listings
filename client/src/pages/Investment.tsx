import "@google/model-viewer";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, TrendingUp, Building2, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { InvestmentBox } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import type { AxiosError } from "axios";
import AuthModal from "@/components/AuthModal";

const fetchMyInvestments = async () => {
    const { data } = await apiClient.get<{ investments: Array<{ investmentBox?: { _id?: string } }> }>("/investments/my");
    return data.investments;
};

const fetchInvestmentBoxes = async () => {
    const { data } = await apiClient.get<{ boxes: InvestmentBox[] }>("/investment-boxes");
    return data.boxes;
};

const Investment = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: boxesData, isLoading: boxesLoading } = useQuery({ queryKey: ["investment-boxes"], queryFn: fetchInvestmentBoxes });
    const boxes = boxesData ?? [];

    const isInvestor = user?.role === "investor";
    const { data: myInvestmentsData } = useQuery({
        queryKey: ["my-investments"],
        queryFn: fetchMyInvestments,
        enabled: isAuthenticated && isInvestor,
    });
    const investedBoxIds = new Set((myInvestmentsData ?? []).map((inv) => inv.investmentBox?._id).filter(Boolean) as string[]);

    const [selectedBox, setSelectedBox] = useState<InvestmentBox | null>(null);
    const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false);
    const [investmentAmount, setInvestmentAmount] = useState("");
    const [investmentNotes, setInvestmentNotes] = useState("");
    const [submittingInvestment, setSubmittingInvestment] = useState(false);

    // Re-authentication state
    const [reAuthOpen, setReAuthOpen] = useState(false);
    const [reAuthMode, setReAuthMode] = useState<"login" | "register">("login");

    const handleMyInvestmentsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Always require re-auth for security when accessing from this page
        setReAuthMode("login");
        setReAuthOpen(true);
    };

    const handleReAuthSuccess = () => {
        setReAuthOpen(false);
        toast({ title: t("auth.meta.welcomeBack"), description: "Identity verified successfully." });
        navigate("/my-investments");
    };

    const toggleReAuthMode = () => {
        setReAuthMode(prev => prev === "login" ? "register" : "login");
    };

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

    const openInvestDialog = (box: InvestmentBox) => {
        if (!isAuthenticated) {
            navigate("/auth/login", { state: { from: location } });
            return;
        }
        if (!isInvestor) {
            toast({ title: "Only investors can invest", description: "Please contact an admin to get investor access.", variant: "destructive" });
            return;
        }
        if (investedBoxIds.has(box._id)) {
            toast({ title: "Already invested", description: "You already have an investment in this box.", variant: "destructive" });
            navigate("/my-investments");
            return;
        }
        setSelectedBox(box);
        setInvestmentAmount("");
        setInvestmentNotes("");
        setIsInvestDialogOpen(true);
    };

    const handleInvestSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedBox) return;

        const amountNumber = Number(investmentAmount);
        if (Number.isNaN(amountNumber) || amountNumber <= 0) {
            toast({ title: t("myInvestments.boxes.toasts.enterValidAmount"), variant: "destructive" });
            return;
        }

        if (selectedBox.minInvestmentAmount > 0 && amountNumber < selectedBox.minInvestmentAmount) {
            toast({
                title: t("myInvestments.boxes.toasts.amountBelowMinimumTitle"),
                description: t("myInvestments.boxes.toasts.amountBelowMinimumDescription", {
                    amount: Math.round(selectedBox.minInvestmentAmount).toLocaleString(),
                }),
                variant: "destructive",
            });
            return;
        }

        setSubmittingInvestment(true);
        try {
            await apiClient.post("/investments", {
                investmentBoxId: selectedBox._id,
                investmentAmount: amountNumber,
                notes: investmentNotes.trim() || undefined,
            });

            toast({
                title: t("myInvestments.boxes.toasts.requestSubmittedTitle"),
                description: t("myInvestments.boxes.toasts.requestSubmittedDescription"),
            });
            setIsInvestDialogOpen(false);
        } catch (err) {
            console.error("Investment request failed", err);
            const axiosError = err as AxiosError<{ message?: string }>;
            const serverMessage = axiosError.response?.data?.message;
            toast({
                title: t("myInvestments.boxes.toasts.unableToSubmitTitle"),
                description: serverMessage ?? t("myInvestments.boxes.toasts.unableToSubmitDescription"),
                variant: "destructive",
            });
        } finally {
            setSubmittingInvestment(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 bg-luxury-dark text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/crystalpattern.png"
                        alt="Investment Background"
                        className="w-full h-full object-cover opacity-30"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-luxury-dark/90 via-luxury-dark/80 to-luxury-dark z-0" />

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
                                <Button
                                    size="lg"
                                    className="bg-white text-luxury-dark hover:bg-white/90 font-semibold text-lg px-8"
                                    onClick={handleMyInvestmentsClick}
                                >
                                    {t("investment.ctaMyInvestments")}
                                </Button>
                                <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-8">
                                    {t("investment.ctaBrochure")}
                                </Button>
                            </div>
                        </div>

                        <div className="h-[450px] md:h-[600px] w-full relative fade-in">
                            {/* @ts-ignore */}
                            <model-viewer
                                src="/base_basic_pbr.glb"
                                poster="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                                alt="A 3D model of a luxury property"
                                shadow-intensity="1"
                                auto-rotate
                                camera-controls
                                camera-orbit="45deg 55deg 2.5m"
                                rotation-per-second="30deg"
                                interaction-prompt="none"
                                disable-zoom
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Investment Boxes Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">
                                {t("myInvestments.boxes.title")}
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl">
                                {t("myInvestments.boxes.subtitle")}
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleMyInvestmentsClick}>
                            {t("investment.ctaMyInvestments")}
                        </Button>
                    </div>

                    {boxesLoading ? (
                        <p className="text-muted-foreground">{t("common.loading")}</p>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {boxes.map((box) => (
                                <Card key={box._id} className="border-border/50 overflow-hidden">
                                    <CardHeader className="bg-muted/30">
                                        <CardTitle className="text-2xl font-display">{box.name}</CardTitle>
                                        {box.description ? (
                                            <p className="text-muted-foreground">{box.description}</p>
                                        ) : null}
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex flex-wrap gap-2 text-sm font-semibold">
                                            <span className="px-4 py-2 rounded-full bg-luxury-gold/15 text-luxury-gold">
                                                {t("myInvestments.boxes.roiBadge", { value: box.roiPercentage })}
                                            </span>
                                            <span className="px-4 py-2 rounded-full bg-muted text-foreground">
                                                {t("myInvestments.boxes.minInvestment", { amount: Math.round(box.minInvestmentAmount).toLocaleString() })}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="rounded-xl border border-border/60 p-4">
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("myInvestments.labels.roiPercent")}</p>
                                                <p className="text-3xl font-display font-bold text-primary">{box.roiPercentage}%</p>
                                            </div>
                                            <div className="rounded-xl border border-border/60 p-4">
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    {t("myInvestments.boxes.minInvestment", { amount: Math.round(box.minInvestmentAmount).toLocaleString() })}
                                                </p>
                                                <p className="text-3xl font-display font-bold text-primary">{Math.round(box.minInvestmentAmount).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={() => openInvestDialog(box)}
                                            disabled={isAuthenticated && isInvestor && investedBoxIds.has(box._id)}
                                        >
                                            {isAuthenticated && isInvestor && investedBoxIds.has(box._id)
                                                ? t("myInvestments.boxes.alreadyInvested")
                                                : t("myInvestments.boxes.investCta")}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
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

            {/* Market Analysis & Strategy (New Content) */}
            <section className="py-24 bg-luxury-dark text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-luxury-gold/5 to-transparent" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                        <div className="space-y-8">
                            <div className="inline-block border-l-4 border-luxury-gold pl-4">
                                <h3 className="text-luxury-gold uppercase tracking-widest text-sm font-semibold mb-2">{t("investment.marketInsightsEyebrow")}</h3>
                                <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">{t("investment.marketInsightsTitle")}</h2>
                            </div>
                            <p className="text-lg text-white/80 leading-relaxed">
                                {t("investment.marketInsightsDescription")}
                            </p>

                            <div className="grid grid-cols-2 gap-8 pt-4">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-4xl font-display font-bold text-luxury-gold mb-2">12.5%</p>
                                    <p className="text-sm text-white/70">{t("investment.marketStats.appreciation")}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-4xl font-display font-bold text-luxury-gold mb-2">94%</p>
                                    <p className="text-sm text-white/70">{t("investment.marketStats.occupancy")}</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 relative h-[500px] reveal-card">
                            <div className="absolute inset-0 bg-gradient-to-tr from-luxury-gold/20 to-transparent rounded-2xl transform rotate-3 z-0"></div>
                            <img
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
                                alt="Market Analysis"
                                className="relative z-10 w-full h-full object-cover rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform duration-700"
                            />
                            {/* Floating Stats Card */}
                            <div className="absolute -bottom-8 -left-8 z-20 bg-white p-6 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 max-w-xs animate-bounce-slow hidden md:block">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">{t("investment.marketStats.outperformance")}</p>
                                        <p className="text-2xl font-bold text-gray-900">+12.4%</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* End 2-col grid */}

                    {/* Strategy Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 hover:border-luxury-gold/50 transition-colors group">
                            <div className="w-14 h-14 rounded-full bg-luxury-gold/20 flex items-center justify-center mb-6 text-luxury-gold group-hover:scale-110 transition-transform">
                                <PieChart className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-4">{t("investment.marketCards.allocation")}</h3>
                            <p className="text-white/70 leading-relaxed">
                                {t("investment.marketCardsDescriptions.allocation")}
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 hover:border-luxury-gold/50 transition-colors group">
                            <div className="w-14 h-14 rounded-full bg-luxury-gold/20 flex items-center justify-center mb-6 text-luxury-gold group-hover:scale-110 transition-transform">
                                <Building2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-4">{t("investment.marketCards.valueAdd")}</h3>
                            <p className="text-white/70 leading-relaxed">
                                {t("investment.marketCardsDescriptions.valueAdd")}
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 hover:border-luxury-gold/50 transition-colors group">
                            <div className="w-14 h-14 rounded-full bg-luxury-gold/20 flex items-center justify-center mb-6 text-luxury-gold group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-4">{t("investment.marketCards.exitStrategy")}</h3>
                            <p className="text-white/70 leading-relaxed">
                                {t("investment.marketCardsDescriptions.exitStrategy")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-luxury-dark/95 z-0">
                    <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-20 mix-blend-overlay" alt="Background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-luxury-dark via-luxury-dark/90 to-transparent" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                                {t("investment.ctaTitle")}
                            </h2>
                            <p className="text-xl text-white/80 mb-8 font-light leading-relaxed">
                                {t("investment.ctaSubtitle")}
                            </p>
                            <div className="flex flex-wrap gap-6 mb-8">
                                {Array.isArray(t("investment.ctaList", { returnObjects: true }))
                                    ? (t("investment.ctaList", { returnObjects: true }) as string[]).map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-white/90 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                            <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))
                                    : null}
                            </div>
                            <Button size="lg" className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-dark font-semibold text-lg px-8 h-12 shadow-lg shadow-luxury-gold/20">
                                <Link to="/contact" className="flex items-center gap-2">
                                    {t("investment.ctaButton")}
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="w-64 h-64 border border-luxury-gold/30 rounded-full flex items-center justify-center animate-spin-slow">
                                <div className="w-56 h-56 border border-white/10 rounded-full border-dashed" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-luxury-gold/10 backdrop-blur-md w-32 h-32 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-12 h-12 text-luxury-gold" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <AuthModal
                isOpen={reAuthOpen}
                onOpenChange={setReAuthOpen}
                initialMode={reAuthMode}
                onSwitchMode={toggleReAuthMode}
                onAuthSuccess={handleReAuthSuccess}
            />

            <Dialog open={isInvestDialogOpen} onOpenChange={setIsInvestDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-display">
                            {t("myInvestments.boxes.dialogTitle", { title: selectedBox?.name ?? "" })}
                        </DialogTitle>
                        <DialogDescription>{t("myInvestments.boxes.dialogDescription")}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInvestSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t("myInvestments.labels.investmentAmount")}</label>
                            <Input
                                type="number"
                                min={selectedBox?.minInvestmentAmount ?? 0}
                                value={investmentAmount}
                                onChange={(e) => setInvestmentAmount(e.target.value)}
                                required
                            />
                            {selectedBox?.minInvestmentAmount ? (
                                <p className="text-xs text-muted-foreground">
                                    {t("myInvestments.boxes.minimumAllowed", {
                                        amount: Math.round(selectedBox.minInvestmentAmount).toLocaleString(),
                                    })}
                                </p>
                            ) : null}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t("propertyDetail.rent.notesOptional")}</label>
                            <Textarea
                                value={investmentNotes}
                                onChange={(e) => setInvestmentNotes(e.target.value)}
                                placeholder={t("propertyDetail.rent.notesPlaceholder")}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsInvestDialogOpen(false)}>
                                {t("propertyDetail.cancel")}
                            </Button>
                            <Button type="submit" disabled={submittingInvestment}>
                                {submittingInvestment ? t("propertyDetail.submitting") : t("myInvestments.boxes.submitRequest")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default Investment;
