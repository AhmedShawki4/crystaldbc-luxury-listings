import { useParams, Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, ArrowLeft, Check, Phone, Mail, Heart, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { properties } from "@/data/properties";
import type { Property as StaticProperty } from "@/data/properties";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import RegisterInterestDialog from "@/components/RegisterInterestDialog";
import PropertyCard from "@/components/PropertyCard";
import apiClient from "@/lib/apiClient";
import type { Investment, Property as ApiProperty } from "@/types";
import useProperties from "@/hooks/useProperties";
import { getMediaUrl } from "@/lib/media";
import useWishlistActions from "@/hooks/useWishlistActions";
import useAuth from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type DetailedProperty = {
  id: string;
  title: string;
  location: string;
  priceLabel: string;
  priceValue: number;
  beds: number;
  baths: number;
  sqftLabel: string;
  sqftValue: number;
  coverImage: string;
  gallery: string[];
  description: string;
  features: string[];
  type: string;
  status: string;
  isInvestable: boolean;
  minInvestmentAmount: number;
  roiPercentage?: number;
};

const normalizeStaticProperty = (property: StaticProperty): DetailedProperty => ({
  id: property.id.toString(),
  title: property.title,
  location: property.location,
  priceLabel: property.price,
  priceValue: property.priceValue,
  beds: property.beds,
  baths: property.baths,
  sqftLabel: property.sqft,
  sqftValue: property.sqftValue,
  coverImage: property.image,
  gallery: property.images?.length ? property.images : [property.image],
  description: property.description,
  features: property.features,
  type: property.type,
  status: property.status,
  isInvestable: property.isInvestable ?? false,
  minInvestmentAmount: property.minInvestmentAmount ?? 0,
  roiPercentage: property.roiPercentage ?? 0,
});

const normalizeApiProperty = (property: ApiProperty): DetailedProperty => ({
  id: property._id,
  title: property.title,
  location: property.location,
  priceLabel: property.priceLabel,
  priceValue: property.priceValue,
  beds: property.beds,
  baths: property.baths,
  sqftLabel: property.sqftLabel,
  sqftValue: property.sqftValue,
  coverImage: property.coverImage,
  gallery: property.gallery?.length ? property.gallery : [property.coverImage],
  description: property.description,
  features: property.features ?? [],
  type: property.type,
  status: property.status,
  isInvestable: Boolean(property.isInvestable),
  minInvestmentAmount: property.minInvestmentAmount ?? 0,
  roiPercentage: property.roiPercentage ?? 0,
});

const formatProjectCode = (id: string) => {
  const numericValue = Number(id);
  if (!Number.isNaN(numericValue)) {
    return `CDBC-${numericValue.toString().padStart(4, "0")}`;
  }
  const suffix = id.slice(-4).toUpperCase();
  return `CDBC-${suffix}`;
};

const PropertyDetail = () => {
  const { t } = useTranslation();
  const { propertyId } = useParams();
  const [property, setProperty] = useState<DetailedProperty | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investmentNotes, setInvestmentNotes] = useState("");
  const [submittingInvestment, setSubmittingInvestment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: similarProperties = [], isLoading: loadingSimilar } = useProperties({
    exclude: property?.id,
    limit: 3,
  });
  const { addToWishlist, activeId, isAdding } = useWishlistActions();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: myInvestments } = useQuery<{ investments: Investment[] }>({
    queryKey: ["my-investments", propertyId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ investments: Investment[] }>("/investments/my");
      return data;
    },
    enabled: Boolean(isAuthenticated && propertyId && user?.role === "user"),
  });
  const fallbackSimilar = useMemo(
    () =>
      properties
        .filter((p) => (property ? p.id.toString() !== property.id : true))
        .slice(0, 3)
        .map((item) => normalizeStaticProperty(item)),
    [property]
  );
  const similarList = useMemo(() => {
    if (!similarProperties.length) {
      return fallbackSimilar;
    }

    const normalized = similarProperties
      .filter((item) => (property ? item._id !== property.id : true))
      .map((item) => normalizeApiProperty(item));

    return normalized.length ? normalized : fallbackSimilar;
  }, [similarProperties, property, fallbackSimilar]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) {
      setProperty(null);
      setError("propertyDetail.notFoundTitle");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSelectedImage(0);

    const numericId = Number(propertyId);
    if (!Number.isNaN(numericId)) {
      const staticMatch = properties.find((p) => p.id === numericId);
      if (staticMatch) {
        setProperty(normalizeStaticProperty(staticMatch));
        setError(null);
        setIsLoading(false);
        return;
      }
    }

    const fetchProperty = async () => {
      try {
        const { data } = await apiClient.get<{ property: ApiProperty }>(`/properties/${propertyId}`);
        setProperty(normalizeApiProperty(data.property));
        setError(null);
      } catch (err) {
        console.error("Failed to load property", err);
        setProperty(null);
        setError("propertyDetail.notFoundTitle");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const persistedPropertyId = property && /^[a-f\d]{24}$/i.test(property.id) ? property.id : undefined;
  const isWishlistSaving = Boolean(persistedPropertyId && activeId === persistedPropertyId && isAdding);
  const canUseInterest = user?.role === "user";
  const alreadyInvested = useMemo(() => {
    if (!property?.id || !myInvestments?.investments?.length) return false;
    return myInvestments.investments.some((inv) => inv.property?._id === property.id);
  }, [myInvestments?.investments, property?.id]);
  const investmentDisabledReason = (() => {
    if (!property?.isInvestable) return t("propertyDetail.disabledReasons.notInvestable");
    if (!isAuthenticated) return t("propertyDetail.disabledReasons.signIn");
    if (user?.role !== "user") return t("propertyDetail.disabledReasons.onlyUsers");
    if (alreadyInvested) return t("propertyDetail.disabledReasons.alreadyInvested");
    return null;
  })();

  const handleInvestmentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!property) return;

    const amountNumber = Number(investmentAmount);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      toast({ title: t("propertyDetail.toasts.enterValidAmount"), variant: "destructive" });
      return;
    }

    if (property.minInvestmentAmount > 0 && amountNumber < property.minInvestmentAmount) {
      toast({
        title: t("propertyDetail.toasts.amountBelowMinimumTitle"),
        description: t("propertyDetail.toasts.amountBelowMinimumDescription", {
          amount: Math.round(property.minInvestmentAmount).toLocaleString(),
        }),
        variant: "destructive",
      });
      return;
    }

    if (alreadyInvested) {
      toast({
        title: t("propertyDetail.toasts.alreadyInvestedTitle"),
        description: t("propertyDetail.toasts.alreadyInvestedDescription"),
      });
      return;
    }

    setSubmittingInvestment(true);
    try {
      await apiClient.post("/investments", {
        propertyId: property.id,
        investmentAmount: amountNumber,
        notes: investmentNotes.trim() || undefined,
      });

      toast({
        title: t("propertyDetail.toasts.requestSubmittedTitle"),
        description: t("propertyDetail.toasts.requestSubmittedDescription"),
      });
      setIsInvestDialogOpen(false);
      setInvestmentAmount("");
      setInvestmentNotes("");
    } catch (err) {
      console.error("Investment request failed", err);
      toast({
        title: t("propertyDetail.toasts.unableToSubmitTitle"),
        description: t("propertyDetail.toasts.unableToSubmitDescription"),
        variant: "destructive",
      });
    } finally {
      setSubmittingInvestment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-muted-foreground">{t("propertyDetail.loading")}</p>
      </div>
    );
  }

  if (!property) {
    const titleKey = error ?? "propertyDetail.notFoundTitle";
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-primary mb-4">
            {t(titleKey)}
          </h1>
          <Button asChild>
            <Link to="/listings">{t("propertyDetail.backToListings")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-muted/10">
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button asChild variant="ghost" className="group">
          <Link to="/listings">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("propertyDetail.backToListings")}
          </Link>
        </Button>
      </div>

      {/* Image Gallery */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 gap-4">
          <div className="relative h-[500px] overflow-hidden rounded-lg">
            <img
              src={getMediaUrl(property.gallery[selectedImage])}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {property.gallery.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-32 overflow-hidden rounded-lg border-2 transition-all ${selectedImage === index
                    ? "border-accent"
                    : "border-transparent hover:border-border"
                  }`}
              >
                <img
                  src={getMediaUrl(image)}
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
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${property.isInvestable ? "bg-green-500/10 text-green-400 border-green-400/30" : "bg-slate-500/10 text-slate-300 border-slate-400/30"}`}
                >
                  {property.isInvestable ? t("propertyDetail.investableAvailable") : t("propertyDetail.investableNotInvestable")}
                </span>
                {property.isInvestable && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold border border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> {t("propertyDetail.roiBadge", { value: property.roiPercentage ?? 0 })}
                  </span>
                )}
                {property.isInvestable && property.minInvestmentAmount > 0 && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t("propertyDetail.minInvestmentBadge", {
                      amount: Math.round(property.minInvestmentAmount).toLocaleString(),
                    })}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{property.location}</span>
              </div>
              <p className="text-4xl font-display font-bold text-accent">
                {property.priceLabel}
              </p>
            </div>

            <div className="flex items-center gap-8 mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-3">
                <Bed className="h-6 w-6 text-accent" />
                <div>
                  <p className="text-2xl font-semibold text-primary">{property.beds}</p>
                  <p className="text-sm text-muted-foreground">{t("propertyDetail.bedrooms")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bath className="h-6 w-6 text-accent" />
                <div>
                  <p className="text-2xl font-semibold text-primary">{property.baths}</p>
                  <p className="text-sm text-muted-foreground">{t("propertyDetail.bathrooms")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Square className="h-6 w-6 text-accent" />
                <div>
                  <p className="text-2xl font-semibold text-primary">{property.sqftLabel}</p>
                  <p className="text-sm text-muted-foreground">{t("propertyDetail.squareFeet")}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-primary mb-4">
                {t("propertyDetail.aboutTitle")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-primary mb-4">
                {t("propertyDetail.featuresTitle")}
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
              <h3 className="text-2xl font-display font-bold text-primary mb-2">
                {t("propertyDetail.contactTitle", { title: property.title })}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t("propertyDetail.contactSubtitle")}
              </p>

              <div className="space-y-4">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-2 hover:bg-accent/10"
                >
                  <a href="tel:+971123456789" className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t("propertyDetail.callCta", { phone: "+971 12 345 6789" })}
                  </a>
                </Button>

                {canUseInterest && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {t("propertyDetail.interestedCta")}
                  </Button>
                )}

                {property.isInvestable && (
                  <Button
                    onClick={() => setIsInvestDialogOpen(true)}
                    disabled={Boolean(investmentDisabledReason)}
                    className="w-full bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-dark hover:brightness-110 flex items-center justify-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    {t("propertyDetail.investCta")}
                  </Button>
                )}

                {investmentDisabledReason && property.isInvestable && (
                  <p className="text-sm text-muted-foreground text-center">{investmentDisabledReason}</p>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full border border-dashed border-border flex items-center justify-center gap-2"
                  onClick={() => addToWishlist(persistedPropertyId)}
                  disabled={!persistedPropertyId || isWishlistSaving}
                >
                  <Heart className="h-4 w-4" />
                  {persistedPropertyId
                    ? isWishlistSaving
                      ? t("propertyDetail.wishlistSaving")
                      : t("propertyDetail.wishlistSave")
                    : t("propertyDetail.wishlistLinkRequired")}
                </Button>

                {canUseInterest && (
                  <RegisterInterestDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    propertyId={property.id}
                    propertyTitle={property.title}
                  />
                )}

                <Dialog open={isInvestDialogOpen} onOpenChange={setIsInvestDialogOpen}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-display flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-luxury-gold" />
                        {t("propertyDetail.investDialogTitle", { title: property.title })}
                      </DialogTitle>
                      <DialogDescription>
                        {t("propertyDetail.investDialogDescription")}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInvestmentSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t("propertyDetail.investmentAmount")}</label>
                        <Input
                          type="number"
                          min={property.minInvestmentAmount || 0}
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          required
                        />
                        {property.minInvestmentAmount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {t("propertyDetail.minimumAllowed", {
                              amount: Math.round(property.minInvestmentAmount).toLocaleString(),
                            })}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t("propertyDetail.notesOptional")}</label>
                        <Textarea
                          value={investmentNotes}
                          onChange={(e) => setInvestmentNotes(e.target.value)}
                          placeholder={t("propertyDetail.notesPlaceholder")}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsInvestDialogOpen(false)}>
                          {t("propertyDetail.cancel")}
                        </Button>
                        <Button type="submit" disabled={submittingInvestment}>
                          {submittingInvestment ? t("propertyDetail.submitting") : t("propertyDetail.submitRequest")}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Project Statistics Card */}
            <div className="bg-card border border-border rounded-lg p-6 mt-6">
              <h3 className="text-xl font-display font-bold text-primary mb-6">
                {t("propertyDetail.projectStatisticsTitle")}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">{t("propertyDetail.projectId")}</span>
                  <span className="text-foreground font-semibold">{formatProjectCode(property.id)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">{t("propertyDetail.status")}</span>
                  <span className="text-foreground font-semibold">{property.status}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">{t("propertyDetail.progress")}</span>
                  <span className="text-foreground font-semibold">—</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("propertyDetail.serviceCharge")}</span>
                  <span className="text-foreground font-semibold">—</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Properties */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-primary mb-2">
            {t("propertyDetail.similarPropertiesTitle")}
          </h2>
          <p className="text-muted-foreground">
            {t("propertyDetail.similarPropertiesSubtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(loadingSimilar ? fallbackSimilar : similarList).map((prop) => (
            <PropertyCard
              key={prop.id}
              id={prop.id}
              image={prop.coverImage || prop.gallery[0]}
              title={prop.title}
              location={prop.location}
              price={prop.priceLabel}
              beds={prop.beds}
              baths={prop.baths}
              sqft={prop.sqftLabel}
              status={prop.status}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default PropertyDetail;
