import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Home, Calendar, ArrowUpRight, ArrowDownRight, X, MapPin, Bed, Bath, Maximize, Users, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { jsPDF } from "jspdf";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MyInvestments = () => {
  const { t } = useTranslation();
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);

  const handleDownloadReport = (investment: any) => {
    if (!investment) return;

    const appreciationRows = investment.appreciation
      .map((point: any) => `${point.month},${point.value}`)
      .join("\n");

    const report = [
      "Section,Value",
      `Property,${investment.property}`,
      `Location,${investment.location}`,
      `Invested Amount,EGP ${investment.investedAmount}`,
      `Current Value,EGP ${investment.currentValue}`,
      `ROI,${investment.roi}`,
      `Bedrooms,${investment.beds}`,
      `Bathrooms,${investment.baths}`,
      `Square Feet,${investment.sqft}`,
      `Occupancy,${investment.occupancy}`,
      `Monthly Rental,EGP ${investment.monthlyRental}`,
      `Tenant,${investment.tenants}`,
      `Next Payment,${investment.nextPayment}`,
      "",
      "Appreciation Timeline",
      "Month,Value",
      appreciationRows,
    ].join("\n");

    const blob = new Blob([report], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = investment.property.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    link.href = url;
    link.download = `${safeName}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = (investment: any) => {
    if (!investment) return;

    const doc = new jsPDF();
    const safeName = investment.property.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    let y = 14;

    const addLine = (label: string, value: string) => {
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text(label, 14, y);
      doc.setFont(undefined, "normal");
      doc.text(value, 70, y);
      y += 8;
    };

    doc.setFontSize(16);
    doc.text("Investment Report", 14, y);
    y += 10;
    addLine("Property", investment.property);
    addLine("Location", investment.location);
    addLine("Invested Amount", `EGP ${investment.investedAmount}`);
    addLine("Current Value", `EGP ${investment.currentValue}`);
    addLine("ROI", investment.roi);
    addLine("Bedrooms", `${investment.beds}`);
    addLine("Bathrooms", `${investment.baths}`);
    addLine("Square Feet", `${investment.sqft}`);
    addLine("Occupancy", investment.occupancy);
    addLine("Monthly Rental", `EGP ${investment.monthlyRental}`);
    addLine("Tenant", investment.tenants);
    addLine("Next Payment", investment.nextPayment);

    y += 6;
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("Appreciation Timeline", 14, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    investment.appreciation.forEach((point: any) => {
      doc.text(`${point.month}: EGP ${point.value.toLocaleString()}`, 14, y);
      y += 6;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`${safeName}-report.pdf`);
  };

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

  const portfolioTrend = [
    { month: "Jan", value: 15000000 },
    { month: "Mar", value: 15400000 },
    { month: "May", value: 16050000 },
    { month: "Jul", value: 16500000 },
    { month: "Sep", value: 17050000 },
    { month: "Nov", value: 17250000 },
  ];

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
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      beds: 5,
      baths: 4,
      sqft: "4,500",
      monthlyRental: "45,000",
      appreciation: [
        { month: "Jan", value: 5000000 },
        { month: "Mar", value: 5200000 },
        { month: "May", value: 5400000 },
        { month: "Jul", value: 5600000 },
        { month: "Sep", value: 5700000 },
        { month: "Nov", value: 5750000 },
      ],
      tenants: "Executive Family",
      occupancy: "100%",
      nextPayment: "Dec 15, 2024",
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
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      beds: 4,
      baths: 3,
      sqft: "3,800",
      monthlyRental: "72,000",
      appreciation: [
        { month: "Mar", value: 8000000 },
        { month: "May", value: 8300000 },
        { month: "Jul", value: 8600000 },
        { month: "Sep", value: 8900000 },
        { month: "Nov", value: 9200000 },
      ],
      tenants: "Corporate Rental",
      occupancy: "100%",
      nextPayment: "Dec 10, 2024",
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
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      beds: 2,
      baths: 2,
      sqft: "1,800",
      monthlyRental: "18,000",
      appreciation: [
        { month: "Jun", value: 2000000 },
        { month: "Aug", value: 2100000 },
        { month: "Oct", value: 2200000 },
        { month: "Nov", value: 2300000 },
      ],
      tenants: "Vacation Rental",
      occupancy: "85%",
      nextPayment: "Dec 20, 2024",
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

          {/* Portfolio Trend Chart */}
          <Card className="border border-white/10 bg-gradient-to-br from-luxury-dark/80 via-luxury-dark/60 to-[#0c0c12] shadow-2xl shadow-luxury-gold/10 backdrop-blur mb-12">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-display text-white">Portfolio Value Trend</CardTitle>
                <p className="text-sm text-white/60">Modeled appreciation of your holdings (EGP)</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                  <span className="h-2 w-2 rounded-full bg-luxury-gold" />
                  Value Growth
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-luxury-gold/15 text-luxury-gold px-3 py-1 font-semibold">
                  +15.0% YTD
                </span>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioTrend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="portfolioColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--luxury-gold))" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="hsl(var(--luxury-gold))" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(var(--border))" stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="url(#gridFade)" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => `${Math.round(v / 1000000)}m`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--luxury-dark))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      color: "white",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                    }}
                    labelStyle={{ color: "white", fontWeight: 700 }}
                    formatter={(value: number) => [`EGP ${value.toLocaleString()}`, "Portfolio Value"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--luxury-gold))"
                    strokeWidth={3}
                    fill="url(#portfolioColor)"
                    fillOpacity={1}
                    dot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--luxury-dark))", fill: "hsl(var(--luxury-gold))" }}
                    activeDot={{ r: 7, stroke: "white", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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
                        <Button size="sm" variant="outline" onClick={() => setSelectedInvestment(investment)}>
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

      {/* Investment Details Modal */}
      <Dialog open={!!selectedInvestment} onOpenChange={() => setSelectedInvestment(null)}>
        <DialogContent className="dialog-scroll max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedInvestment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">{selectedInvestment.property}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  {selectedInvestment.location}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Property Image */}
                <div className="relative h-64 rounded-xl overflow-hidden">
                  <img
                    src={selectedInvestment.image}
                    alt={selectedInvestment.property}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-luxury-gold text-luxury-dark px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedInvestment.roi} ROI
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Bed className="h-4 w-4" />
                        <span className="text-xs">Bedrooms</span>
                      </div>
                      <p className="text-xl font-bold">{selectedInvestment.beds}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Bath className="h-4 w-4" />
                        <span className="text-xs">Bathrooms</span>
                      </div>
                      <p className="text-xl font-bold">{selectedInvestment.baths}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Maximize className="h-4 w-4" />
                        <span className="text-xs">Square Feet</span>
                      </div>
                      <p className="text-xl font-bold">{selectedInvestment.sqft}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Occupancy</span>
                      </div>
                      <p className="text-xl font-bold">{selectedInvestment.occupancy}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-luxury-gold/30 bg-gradient-to-br from-luxury-gold/5 to-transparent">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Investment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Initial Investment</span>
                        <span className="text-lg font-semibold">EGP {selectedInvestment.investedAmount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Value</span>
                        <span className="text-lg font-semibold">EGP {selectedInvestment.currentValue}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">Total Gain</span>
                        <span className="text-lg font-bold text-luxury-gold flex items-center gap-1">
                          <ArrowUpRight className="h-4 w-4" />
                          EGP {(parseFloat(selectedInvestment.currentValue.replace(/,/g, '')) - parseFloat(selectedInvestment.investedAmount.replace(/,/g, ''))).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">Rental Income</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Rental</span>
                        <span className="text-lg font-semibold">EGP {selectedInvestment.monthlyRental}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Tenant</span>
                        <span className="text-sm font-medium">{selectedInvestment.tenants}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">Next Payment</span>
                        <span className="text-sm font-semibold text-accent">{selectedInvestment.nextPayment}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Value Appreciation Chart */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-luxury-gold" />
                      Value Appreciation Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedInvestment.appreciation.map((point: any, index: number) => {
                        const isLast = index === selectedInvestment.appreciation.length - 1;
                        const percentFromStart = ((point.value - selectedInvestment.appreciation[0].value) / selectedInvestment.appreciation[0].value * 100).toFixed(1);
                        const maxValue = Math.max(...selectedInvestment.appreciation.map((p: any) => p.value));
                        const barWidth = (point.value / maxValue) * 100;
                        
                        return (
                          <div key={point.month} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-medium w-12">{point.month}</span>
                              <span className="font-semibold">EGP {point.value.toLocaleString()}</span>
                              <span className={`text-xs font-medium ${parseFloat(percentFromStart) >= 0 ? 'text-luxury-gold' : 'text-red-500'}`}>
                                {parseFloat(percentFromStart) >= 0 ? '+' : ''}{percentFromStart}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isLast ? 'bg-luxury-gold' : 'bg-accent'}`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    className="w-full h-11 bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-dark"
                    onClick={() => handleDownloadReport(selectedInvestment)}
                  >
                    Download CSV
                  </Button>
                  <Button
                    className="w-full h-11 bg-white/10 text-white border-white/30 hover:bg-white/15"
                    onClick={() => handleDownloadPdf(selectedInvestment)}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 border-white/30 text-white hover:bg-white/10 text-sm px-3 whitespace-normal"
                  >
                    Contact Property Manager
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyInvestments;
