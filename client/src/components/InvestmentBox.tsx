import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, ShieldCheck, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const InvestmentBox = () => {
  const { t } = useTranslation();
  return (
    <Card className="overflow-hidden border-border bg-luxury-dark text-white relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <TrendingUp className="w-64 h-64 text-luxury-gold" />
      </div>
      <CardContent className="p-8 md:p-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">{t("investmentBox.eyebrow")}</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
              {t("investmentBox.title.prefix")} <span className="text-luxury-gold">{t("investmentBox.title.highlight")}</span>
            </h2>
            
            <p className="text-lg text-white/80 leading-relaxed">
              {t("investmentBox.description")}
            </p>

            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-luxury-gold" />
                <span>{t("investmentBox.features.secure")}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-luxury-gold" />
                <span>{t("investmentBox.features.roi")}</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button 
              asChild 
              size="lg" 
              className="bg-luxury-gold hover:bg-luxury-gold-light text-luxury-dark font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link to="/investment">
                {t("investmentBox.cta")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentBox;
