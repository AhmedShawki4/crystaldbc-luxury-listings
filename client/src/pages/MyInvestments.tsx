import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  CircleDollarSign,
  Wallet,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import apiClient from "@/lib/apiClient";
import type { Investment, InvestmentBox } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const fetchMyInvestments = async () => {
  const { data } = await apiClient.get<{ investments: Investment[] }>("/investments/my");
  return data.investments;
};

const fetchInvestmentBoxes = async () => {
  const { data } = await apiClient.get<{ boxes: InvestmentBox[] }>("/investment-boxes");
  return data.boxes;
};

const formatCurrency = (value: number) => `EGP ${Math.round(value).toLocaleString()}`;
const formatDate = (value: string | undefined, notScheduledLabel: string) => {
  if (!value) return notScheduledLabel;
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const MyInvestments = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ["my-investments"], queryFn: fetchMyInvestments });
  const { data: boxesData, isLoading: boxesLoading } = useQuery({ queryKey: ["investment-boxes"], queryFn: fetchInvestmentBoxes });
  const investments = data ?? [];
  const boxes = boxesData ?? [];

  const [selectedBox, setSelectedBox] = useState<InvestmentBox | null>(null);
  const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investmentNotes, setInvestmentNotes] = useState("");
  const [submittingInvestment, setSubmittingInvestment] = useState(false);

  const unknownPropertyLabel = t("myInvestments.unknownProperty");
  const notScheduledLabel = t("myInvestments.notScheduled");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const totals = useMemo(() => {
    const aggregate = investments.reduce(
      (acc, inv) => {
        const expected = inv.expectedProfit || inv.investmentAmount * (inv.roiPercentage / 100);
        acc.totalInvested += inv.investmentAmount;
        acc.expectedProfit += expected;
        acc.amountReceived += inv.amountReceived;
        acc.avgRoi += inv.roiPercentage;
        return acc;
      },
      { totalInvested: 0, expectedProfit: 0, amountReceived: 0, avgRoi: 0 }
    );

    const averageRoi = investments.length ? aggregate.avgRoi / investments.length : 0;
    return { ...aggregate, averageRoi };
  }, [investments, unknownPropertyLabel]);

  const roiSnapshot = {
    roi: `${totals.averageRoi.toFixed(1)}%`,
    profit: formatCurrency(totals.expectedProfit),
    cashFlow: formatCurrency(totals.amountReceived),
    contributions: formatCurrency(totals.totalInvested),
  };

  const sparklinePoints = useMemo(() => {
    if (!investments.length) return ["M0,80", "L260,80"].join(" ");
    const sorted = [...investments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const maxValue = Math.max(...sorted.map((inv) => inv.investmentAmount)) || 1;
    return sorted
      .map((inv, idx) => {
        const x = idx * (260 / Math.max(sorted.length - 1, 1));
        const y = 120 - (inv.investmentAmount / maxValue) * 80;
        return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [investments]);

  const portfolioTrend = useMemo(() => {
    if (!investments.length) return [];

    // 1. Sort investments by date
    const sorted = [...investments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // 2. Identify all unique investment labels (box name preferred, fallback to legacy property)
    const labels = Array.from(
      new Set(sorted.map((inv) => inv.investmentBox?.name || inv.property?.title || unknownPropertyLabel))
    );

    // 3. Build cumulative data points
    // We want a point for each investment event, carrying forward previous totals

    let runningTotals: Record<string, number> = {};
    labels.forEach((label) => (runningTotals[label] = 0));

    return sorted.map((inv) => {
      const seriesKey = inv.investmentBox?.name || inv.property?.title || unknownPropertyLabel;
      runningTotals[seriesKey] = (runningTotals[seriesKey] || 0) + inv.investmentAmount;

      const dateLabel = new Date(inv.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });

      // Return snapshot of all properties at this point in time
      return {
        month: dateLabel,
        ...runningTotals,
      };
    });
  }, [investments, unknownPropertyLabel]);

  const investedBoxIds = useMemo(() => {
    return new Set(investments.map((inv) => inv.investmentBox?._id).filter(Boolean) as string[]);
  }, [investments]);

  const openInvestDialog = (box: InvestmentBox) => {
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
      toast({
        title: t("myInvestments.boxes.toasts.unableToSubmitTitle"),
        description: t("myInvestments.boxes.toasts.unableToSubmitDescription"),
        variant: "destructive",
      });
    } finally {
      setSubmittingInvestment(false);
    }
  };

  const overviewStats = [
    { label: t("myInvestments.stats.totalInvested"), value: formatCurrency(totals.totalInvested), icon: DollarSign },
    { label: t("myInvestments.stats.expectedProfit"), value: formatCurrency(totals.expectedProfit), icon: CircleDollarSign },
    { label: t("myInvestments.stats.received"), value: formatCurrency(totals.amountReceived), icon: Wallet },
    { label: t("myInvestments.stats.avgRoi"), value: `${totals.averageRoi.toFixed(1)}%`, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow={t("myInvestments.heroEyebrow")}
        title={t("myInvestments.heroTitle")}
        description={t("myInvestments.heroDescription")}
        icon={TrendingUp}
        stats={[
          { label: t("myInvestments.stats.totalInvested"), value: formatCurrency(totals.totalInvested) },
          { label: t("myInvestments.stats.expectedProfit"), value: formatCurrency(totals.expectedProfit) },
          { label: t("myInvestments.stats.avgRoi"), value: `${totals.averageRoi.toFixed(1)}%` },
        ]}
        backgroundImage="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000"
      />

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {overviewStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border border-white/10 bg-gradient-to-br from-[#0b1224] via-[#0a0f1d] to-[#0f1627] shadow-[0_25px_80px_-30px_rgba(0,0,0,0.65)] backdrop-blur mb-12">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-6">
              <div className="space-y-1">
                <CardTitle className="text-xl font-display text-white">{t("myInvestments.portfolioValueTrend")}</CardTitle>
                <p className="text-sm text-white/60">{t("myInvestments.assetBreakdownOverTime")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                  <span className="h-2 w-2 rounded-full bg-luxury-gold" />
                  {t("myInvestments.valueGrowth")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 text-emerald-200 px-3 py-1 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  {totals.averageRoi.toFixed(1)}% {t("myInvestments.stats.avgRoi")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="h-96 pt-6">
              {portfolioTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/60">{t("myInvestments.empty")}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioTrend} margin={{ left: 0, right: 0, top: 20, bottom: 0 }}>
                    <defs>
                      {/* Generically defined gradients if needed, though we use solid colors mostly for stacked */}
                      <linearGradient id="gradientGeneric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f6c453" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#f6c453" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="rgba(255,255,255,0.2)"
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.2)"
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                      tickFormatter={(v) => `${Math.round(v / 1000000)}m`}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                      contentStyle={{
                        background: "rgba(12,17,28,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "white",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                        padding: "12px 16px"
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 }}
                      formatter={(value: number, name: string) => [
                        <span className="font-bold text-lg">EGP {Math.round(value).toLocaleString()}</span>,
                        name
                      ]}
                    />
                    {/* Render Areas dynamically based on available properties */}
                    {Object.keys(portfolioTrend[0] || {}).filter(k => k !== 'month' && k !== 'total').map((propName, index) => {
                      const colors = ["#f6c453", "#38bdf8", "#34d399", "#f472b6", "#a78bfa"];
                      const color = colors[index % colors.length];
                      return (
                        <Area
                          key={propName}
                          type="monotone"
                          dataKey={propName}
                          stackId="1"
                          stroke={color}
                          fill={color}
                          fillOpacity={0.6}
                          strokeWidth={2}
                          activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-display font-bold">{t("myInvestments.boxes.title")}</h2>
                <p className="text-muted-foreground">{t("myInvestments.boxes.subtitle")}</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/investment">{t("myInvestments.exploreMore")}</Link>
              </Button>
            </div>

            {boxesLoading ? (
              <p className="text-muted-foreground">{t("common.loading")}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boxes.map((box) => {
                  const alreadyInvested = investedBoxIds.has(box._id);
                  return (
                    <Card key={box._id} className="border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg font-display">{box.name}</CardTitle>
                        {box.description && <p className="text-sm text-muted-foreground">{box.description}</p>}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="px-3 py-1 rounded-full bg-luxury-gold/15 text-luxury-gold">
                            {t("myInvestments.boxes.roiBadge", { value: box.roiPercentage })}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-muted text-foreground">
                            {t("myInvestments.boxes.minInvestment", { amount: Math.round(box.minInvestmentAmount).toLocaleString() })}
                          </span>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => openInvestDialog(box)}
                          disabled={alreadyInvested}
                        >
                          {alreadyInvested ? t("myInvestments.boxes.alreadyInvested") : t("myInvestments.boxes.investCta")}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

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
        </div>
      </section>
    </div>
  );
};

export default MyInvestments;
