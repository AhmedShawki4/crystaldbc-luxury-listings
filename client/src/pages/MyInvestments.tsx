import { useEffect } from "react";
import { TrendingUp, DollarSign, Home, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";

const MyInvestments = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock data - replace with real API data
  const investmentStats = {
    totalInvested: "15,000,000",
    currentValue: "17,250,000",
    roi: "+15.0%",
    properties: 3,
  };

  const investments = [
    {
      id: 1,
      property: "Villa in New Cairo",
      location: "New Cairo",
      investedAmount: "5,000,000",
      currentValue: "5,750,000",
      roi: "+15.0%",
      date: "Jan 2024",
      status: "active",
    },
    {
      id: 2,
      property: "Penthouse in North Coast",
      location: "North Coast",
      investedAmount: "8,000,000",
      currentValue: "9,200,000",
      roi: "+15.0%",
      date: "Mar 2024",
      status: "active",
    },
    {
      id: 3,
      property: "Apartment in Red Sea",
      location: "Red Sea",
      investedAmount: "2,000,000",
      currentValue: "2,300,000",
      roi: "+15.0%",
      date: "Jun 2024",
      status: "active",
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Portfolio Overview"
        title="Your Investments"
        description="Track your real estate investment portfolio performance and returns in real-time."
        icon={TrendingUp}
        stats={[
          { label: "Total Invested", value: `EGP ${investmentStats.totalInvested}` },
          { label: "Current Value", value: `EGP ${investmentStats.currentValue}` },
          { label: "Total ROI", value: investmentStats.roi },
        ]}
      />

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">EGP {investmentStats.totalInvested}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all properties</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-luxury-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">EGP {investmentStats.currentValue}</div>
                <p className="text-xs text-luxury-gold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {investmentStats.roi} increase
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{investmentStats.properties}</div>
                <p className="text-xs text-muted-foreground mt-1">Active investments</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average ROI</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{investmentStats.roi}</div>
                <p className="text-xs text-muted-foreground mt-1">Year to date</p>
              </CardContent>
            </Card>
          </div>

          {/* Investment List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Active Investments</h2>
              <Button variant="outline" asChild>
                <a href="/investment">Explore More Opportunities</a>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {investments.map((investment) => (
                <Card key={investment.id} className="border-border/50 hover:border-luxury-gold/50 transition-all">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                      <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-1">{investment.property}</h3>
                        <p className="text-sm text-muted-foreground">{investment.location}</p>
                        <p className="text-xs text-muted-foreground mt-1">Invested: {investment.date}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Invested Amount</p>
                        <p className="text-lg font-semibold">EGP {investment.investedAmount}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                        <p className="text-lg font-semibold">EGP {investment.currentValue}</p>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">ROI</p>
                          <p className="text-lg font-semibold text-luxury-gold flex items-center gap-1">
                            <ArrowUpRight className="h-4 w-4" />
                            {investment.roi}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyInvestments;
