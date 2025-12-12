import { useEffect, useMemo } from "react";
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
import type { Investment } from "@/types";
import { Button } from "@/components/ui/button";

const fetchMyInvestments = async () => {
  const { data } = await apiClient.get<{ investments: Investment[] }>("/investments/my");
  return data.investments;
};

const formatCurrency = (value: number) => `EGP ${Math.round(value).toLocaleString()}`;
const formatDate = (value?: string) => {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const MyInvestments = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ["my-investments"], queryFn: fetchMyInvestments });
  const investments = data ?? [];

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
  }, [investments]);

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
    const sorted = [...investments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    let running = 0;
    return sorted.map((inv) => {
      running += inv.investmentAmount;
      const label = new Date(inv.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return { month: label, value: running };
    });
  }, [investments]);

  const overviewStats = [
    { label: "Total Invested", value: formatCurrency(totals.totalInvested), icon: DollarSign },
    { label: "Expected Profit", value: formatCurrency(totals.expectedProfit), icon: CircleDollarSign },
    { label: "Received", value: formatCurrency(totals.amountReceived), icon: Wallet },
    { label: "Avg ROI", value: `${totals.averageRoi.toFixed(1)}%`, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Portfolio Overview"
        title="Your Investments"
        description="Track your real estate investment portfolio performance and returns in real-time."
        icon={TrendingUp}
        stats={[
          { label: "Total Invested", value: formatCurrency(totals.totalInvested) },
          { label: "Expected Profit", value: formatCurrency(totals.expectedProfit) },
          { label: "Avg ROI", value: `${totals.averageRoi.toFixed(1)}%` },
        ]}
        backgroundImage="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000"
      />

      <section className="py-16 bg-gradient-to-br from-[#0d1323] via-[#0b1020] to-[#0f1a2f] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_20px_80px_-24px_rgba(0,0,0,0.45)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/60">{t("investment.stats.storyBadge")}</p>
                    <h3 className="text-2xl font-display font-semibold">{t("investment.stats.storyTitle")}</h3>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">{roiSnapshot.roi}</div>
                </div>
                <div className="relative mt-4 h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-white/5 to-transparent">
                  <svg viewBox="0 0 280 160" className="w-full h-full">
                    <defs>
                      <linearGradient id="gradLine" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#9f7aea" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
                      </linearGradient>
                    </defs>
                    <path d={sparklinePoints} fill="none" stroke="url(#gradLine)" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">{t("investment.stats.growthChip1")}</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">{t("investment.stats.growthChip2")}</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">{t("investment.stats.growthChip3")}</span>
                </div>
              </div>

              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">{t("investment.stats.donutLabel")}</p>
                    <p className="text-3xl font-bold">{roiSnapshot.roi}</p>
                    <p className="text-xs text-white/60 mt-1">{t("investment.stats.donutNote")}</p>
                  </div>
                  <div className="relative h-24 w-24">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ background: `conic-gradient(#9f7aea 0% ${totals.averageRoi}%, #1e293b ${totals.averageRoi}% 100%)` }}
                    />
                    <div className="absolute inset-3 rounded-full bg-[#0f1625] border border-white/10" />
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">{roiSnapshot.roi}</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-sm text-white/60">{t("investment.stats.profitLabel")}</p>
                  <p className="text-2xl font-bold">{roiSnapshot.profit}</p>
                  <p className="text-xs text-white/50">{t("investment.stats.profitNote")}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                    <p className="text-white/70">{t("investment.stats.cashFlowLabel")}</p>
                    <p className="text-lg font-semibold text-white">{roiSnapshot.cashFlow}</p>
                    <p className="text-xs text-white/50">{t("investment.stats.cashFlowNote")}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                    <p className="text-white/70">Total Contributed</p>
                    <p className="text-lg font-semibold text-white">{roiSnapshot.contributions}</p>
                    <p className="text-xs text-white/50">Sum of all funded amounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-display text-white">Portfolio Value Trend</CardTitle>
                <p className="text-sm text-white/60">Cumulative investments over time</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80">
                  <span className="h-2 w-2 rounded-full bg-luxury-gold" />
                  Value Growth
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 text-emerald-200 px-3 py-1 font-semibold">
                  {totals.averageRoi.toFixed(1)}% Avg ROI
                </span>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              {portfolioTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/60">No investments yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioTrend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="portfolioColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f6c453" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#f6c453" stopOpacity={0.08} />
                      </linearGradient>
                      <linearGradient id="portfolioSecondary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.7)" }} />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: "rgba(255,255,255,0.7)" }}
                      tickFormatter={(v) => `${Math.round(v / 1000000)}m`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(12,17,28,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "white",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                      }}
                      labelStyle={{ color: "white", fontWeight: 700 }}
                      formatter={(value: number) => [`EGP ${Math.round(value).toLocaleString()}`, "Portfolio Value"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f6c453"
                      strokeWidth={3}
                      fill="url(#portfolioColor)"
                      fillOpacity={1}
                      dot={{ r: 4, strokeWidth: 2, stroke: "#0b1224", fill: "#f6c453" }}
                      activeDot={{ r: 7, stroke: "white", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Active Investments</h2>
            <Button variant="outline" asChild>
              <Link to="/investment">Explore More Opportunities</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {isLoading && <p className="text-muted-foreground">Loading your investments...</p>}
            {!isLoading && investments.length === 0 && <p className="text-muted-foreground">No investments yet.</p>}
            {investments.map((investment) => {
              const expected = investment.expectedProfit || investment.investmentAmount * (investment.roiPercentage / 100);
              return (
                <Card key={investment._id} className="border-border/50 hover:border-luxury-gold/50 transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{new Date(investment.createdAt).toLocaleDateString()}</p>
                        <h3 className="text-lg font-semibold mb-1">{investment.property.title}</h3>
                        <p className="text-sm text-muted-foreground">{investment.property.location}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">{investment.status}</span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-luxury-gold/15 text-luxury-gold">{investment.paymentStatus}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                      <div className="rounded-lg border border-border/70 p-3">
                        <p className="text-muted-foreground">Investment Amount</p>
                        <p className="text-lg font-semibold">{formatCurrency(investment.investmentAmount)}</p>
                      </div>
                      <div className="rounded-lg border border-border/70 p-3">
                        <p className="text-muted-foreground">ROI %</p>
                        <p className="text-lg font-semibold">{investment.roiPercentage}%</p>
                      </div>
                      <div className="rounded-lg border border-border/70 p-3">
                        <p className="text-muted-foreground">Expected Profit</p>
                        <p className="text-lg font-semibold">{formatCurrency(expected)}</p>
                      </div>
                      <div className="rounded-lg border border-border/70 p-3">
                        <p className="text-muted-foreground">Amount Received</p>
                        <p className="text-lg font-semibold">{formatCurrency(investment.amountReceived)}</p>
                        <div className="mt-3">
                          <Button asChild variant="outline" className="w-full border-luxury-gold/60 text-luxury-gold hover:bg-luxury-gold/10">
                            <Link to="/contact">Request to increase amount</Link>
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/70 p-3">
                        <p className="text-muted-foreground">Payment Status</p>
                        <p className="text-lg font-semibold">{investment.paymentStatus}</p>
                      </div>
                      <div className="rounded-lg border border-border/70 p-3">
                        <p className="text-muted-foreground">Status</p>
                        <p className="text-lg font-semibold">{investment.status}</p>
                      </div>
                      <div className="rounded-lg border border-border/70 p-3">
                        <p className="text-muted-foreground">Monthly Payout Date</p>
                        <p className="text-lg font-semibold">{formatDate(investment.payoutDate)}</p>
                        <p className="text-xs text-muted-foreground">Scheduled deposit date</p>
                      </div>
                      <div className="rounded-lg border border-border/70 p-3">
                        <p className="text-muted-foreground">Notes</p>
                        <p className="text-sm text-foreground leading-relaxed min-h-[40px]">{investment.notes || "No notes provided."}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs font-medium uppercase tracking-wide">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-500">{investment.property.priceLabel}</span>
                      <span className="rounded-full bg-slate-500/10 px-3 py-1 text-slate-400">ID: {investment.property._id}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyInvestments;
