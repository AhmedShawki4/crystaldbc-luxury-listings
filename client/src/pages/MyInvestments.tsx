import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  CircleDollarSign,
  Wallet,
  Building2,
  ArrowUpRight,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  CalendarCheck
} from "lucide-react";
import PageHero from "@/components/PageHero";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import apiClient from "@/lib/apiClient";
import type { Investment, InvestmentBox } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LazyImage from "@/components/LazyImage";

const fetchMyInvestments = async () => {
  const { data } = await apiClient.get<{ investments: Investment[] }>("/investments/my");
  return data.investments;
};

const fetchInvestmentBoxes = async () => {
  const { data } = await apiClient.get<{ boxes: InvestmentBox[] }>("/investment-boxes");
  return data.boxes;
};

const formatCurrency = (value: number) => `EGP ${Math.round(value).toLocaleString()}`;

const MyInvestments = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ["my-investments"], queryFn: fetchMyInvestments });
  const { data: boxesData, isLoading: boxesLoading } = useQuery({ queryKey: ["investment-boxes"], queryFn: fetchInvestmentBoxes });
  const investments = data ?? [];
  const boxes = boxesData ?? [];

  const [selectedBox, setSelectedBox] = useState<InvestmentBox | null>(null);
  const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [investmentNotes, setInvestmentNotes] = useState("");
  const [submittingInvestment, setSubmittingInvestment] = useState(false);

  const [increaseBox, setIncreaseBox] = useState<InvestmentBox | null>(null);
  const [isIncreaseDialogOpen, setIsIncreaseDialogOpen] = useState(false);
  const [increaseAmount, setIncreaseAmount] = useState<number>(0);
  const [increaseNote, setIncreaseNote] = useState("");
  const [submittingIncrease, setSubmittingIncrease] = useState(false);

  const unknownPropertyLabel = t("myInvestments.unknownProperty");

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

  const portfolioTrend = useMemo(() => {
    if (!investments.length) return [];
    const sorted = [...investments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const labels = Array.from(
      new Set(sorted.map((inv) => inv.investmentBox?.name || inv.property?.title || unknownPropertyLabel))
    );
    let runningTotals: Record<string, number> = {};
    labels.forEach((label) => (runningTotals[label] = 0));

    return sorted.map((inv) => {
      const seriesKey = inv.investmentBox?.name || inv.property?.title || unknownPropertyLabel;
      runningTotals[seriesKey] = (runningTotals[seriesKey] || 0) + inv.investmentAmount;
      const dateLabel = new Date(inv.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return {
        month: dateLabel,
        ...runningTotals,
      };
    });
  }, [investments, unknownPropertyLabel]);

  // Composition Data for Pie Chart
  const compositionData = useMemo(() => {
    const map = new Map<string, number>();
    investments.forEach(inv => {
      const name = inv.investmentBox?.name || inv.property?.title || "Other";
      map.set(name, (map.get(name) || 0) + inv.investmentAmount);
    });
    return Array.from(map.entries()).map(([name, value], index) => ({
      name,
      value,
      color: ["#facc15", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"][index % 5]
    }));
  }, [investments]);

  const investedBoxIds = useMemo(() => {
    return new Set(investments.map((inv) => inv.investmentBox?._id).filter(Boolean) as string[]);
  }, [investments]);

  const investmentByBoxId = useMemo(() => {
    const map = new Map<string, Investment>();
    investments.forEach((inv) => {
      const boxId = inv.investmentBox?._id;
      if (boxId) map.set(boxId, inv);
    });
    return map;
  }, [investments]);

  const openInvestDialog = (box: InvestmentBox) => {
    setSelectedBox(box);
    setInvestmentAmount(box.minInvestmentAmount);
    setInvestmentNotes("");
    setIsInvestDialogOpen(true);
  };

  const openIncreaseDialog = (box: InvestmentBox) => {
    setIncreaseBox(box);
    setIncreaseAmount(5000); // Default step for increase
    setIncreaseNote("");
    setIsIncreaseDialogOpen(true);
  };

  const handleIncreaseSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!increaseBox) return;
    const investment = investmentByBoxId.get(increaseBox._id);
    if (!investment?._id) return;

    setSubmittingIncrease(true);
    try {
      await apiClient.post(`/investments/${investment._id}/increase-request`, {
        additionalAmount: Number(increaseAmount),
        note: increaseNote.trim() || undefined,
      });
      toast({ title: "Increase request sent", description: "An admin will review your request shortly." });
      setIsIncreaseDialogOpen(false);
    } catch (error) {
      toast({ title: "Unable to send request", variant: "destructive" });
    } finally {
      setSubmittingIncrease(false);
    }
  };

  const handleInvestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBox) return;
    setSubmittingInvestment(true);
    try {
      await apiClient.post("/investments", {
        investmentBoxId: selectedBox._id,
        investmentAmount: Number(investmentAmount),
        notes: investmentNotes.trim() || undefined,
      });
      toast({ title: t("myInvestments.boxes.toasts.requestSubmittedTitle") });
      setIsInvestDialogOpen(false);
    } catch (err) {
      toast({ title: t("myInvestments.boxes.toasts.unableToSubmitTitle"), variant: "destructive" });
    } finally {
      setSubmittingInvestment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-luxury-gold/30">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden py-20 pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#020617]/90 z-10" />
          <LazyImage 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full" 
            alt="Background"
            priority={true}
          />
        </div>
        <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6 animate-fade-in-up">
            <Sparkles className="h-4 w-4 text-luxury-gold" />
            <span className="text-sm font-medium text-white/80">{t("myInvestments.heroEyebrow")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            {t("myInvestments.heroTitle")}
          </h1>
          <p className="max-w-xl text-lg text-slate-400 mb-10">
            {t("myInvestments.heroDescription")}
          </p>

          {/* HERO STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t("myInvestments.stats.totalInvested"), value: formatCurrency(totals.totalInvested), icon: Wallet, color: "text-blue-400" },
              { label: t("myInvestments.stats.expectedProfit"), value: formatCurrency(totals.expectedProfit), icon: CircleDollarSign, color: "text-emerald-400" },
              { label: t("myInvestments.stats.avgRoi"), value: `${totals.averageRoi.toFixed(1)}%`, icon: TrendingUp, color: "text-purple-400" },
              { label: "Active Assets", value: investments.length, icon: Building2, color: "text-amber-400" }
            ].map((stat, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 transition-all hover:bg-white/10 hover:-translate-y-1">
                <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity ${stat.color}`}>
                  <stat.icon className="w-12 h-12" />
                </div>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Content with top spacing */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30 pb-20 pt-8">

        {/* MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* PORTFOLIO TREND CHART */}
          <div className="lg:col-span-2 rounded-3xl bg-[#0b1224] border border-white/10 p-6 shadow-2xl relative overflow-hidden group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-luxury-gold/20 to-emerald-500/20 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-semibold text-white">{t("myInvestments.portfolioValueTrend")}</h3>
                  <p className="text-sm text-slate-400">Growth over time</p>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <BarChart3 className="w-5 h-5 text-luxury-gold" />
                </div>
              </div>
              <div className="flex-1 w-full min-h-[300px]">
                {portfolioTrend.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/30 italic">No investment data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#facc15" stopOpacity={0.8} />
                          <stop offset="50%" stopColor="#eab308" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#ca8a04" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#facc15" />
                          <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="rgba(255,255,255,0.15)"
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} dx={-8} />
                      <Tooltip
                        contentStyle={{ background: "rgba(11, 18, 36, 0.95)", borderColor: "rgba(250, 204, 21, 0.3)", borderRadius: "12px", backdropFilter: "blur(8px)" }}
                        labelStyle={{ color: "#facc15", fontWeight: "bold", marginBottom: "8px" }}
                        itemStyle={{ color: "#fff", fontSize: "13px" }}
                      />
                      {Object.keys(portfolioTrend[0] || {}).filter(k => k !== 'month').map((propName, index) => (
                        <Area
                          key={propName}
                          type="monotone"
                          dataKey={propName}
                          stackId="1"
                          stroke="url(#lineGradient)"
                          strokeWidth={2.5}
                          fill="url(#areaGradient)"
                          activeDot={{ r: 5, strokeWidth: 2, stroke: "#facc15", fill: "#0b1224" }}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* PORTFOLIO COMPOSITION */}
          <div className="rounded-3xl bg-[#0b1224] border border-white/10 p-6 shadow-2xl relative overflow-hidden group flex flex-col">
            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-semibold text-white">Asset Allocation</h3>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <PieChartIcon className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div className="flex-1 w-full min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={compositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {compositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#020617", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xs text-white/40 uppercase tracking-widest">Total</p>
                    <p className="text-lg font-bold text-white">{investments.length} Assets</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {compositionData.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="text-white font-medium">{Math.round((item.value / totals.totalInvested) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ADDITIONAL ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* ROI Performance by Asset */}
          <div className="rounded-3xl bg-[#0b1224] border border-white/10 p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-semibold text-white">ROI Performance</h3>
                  <p className="text-sm text-slate-400">Per investment asset</p>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="flex-1 w-full min-h-[250px]">
                {investments.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/30 italic">No data available</div>
                ) : (
                  <>
                    {investments.slice(0, 5).map((inv, idx) => {
                      const assetName = inv.investmentBox?.name || inv.property?.title || "Unknown Asset";
                      const roi = inv.roiPercentage;
                      const isPositive = roi >= 0;

                      return (
                        <div key={idx} className="mb-3 group/item relative rounded-2xl bg-white/5 border border-white/5 p-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-white group-hover/item:text-emerald-400 transition-colors truncate max-w-[200px]">
                                {assetName}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Invested: {formatCurrency(inv.investmentAmount)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {roi.toFixed(1)}%
                                </div>
                                <div className="text-xs text-slate-400">
                                  {formatCurrency(inv.expectedProfit || inv.investmentAmount * (roi / 100))}
                                </div>
                              </div>
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPositive ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                <TrendingUp className={`w-5 h-5 ${isPositive ? 'text-emerald-400' : 'text-red-400 rotate-180'}`} />
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
                              style={{ width: `${Math.min(Math.abs(roi), 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {investments.length > 5 && (
                      <div className="text-center pt-2">
                        <span className="text-xs text-slate-500">Showing top 5 of {investments.length} investments</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Investment Activity */}
          <div className="rounded-3xl bg-[#0b1224] border border-white/10 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-3xl blur opacity-20" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-semibold text-white">Performance Metrics</h3>
                  <p className="text-sm text-slate-400">Key investment indicators</p>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <CalendarCheck className="w-5 h-5 text-indigo-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Avg. ROI</p>
                  <p className="text-2xl font-bold text-emerald-400">{totals.averageRoi.toFixed(1)}%</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-emerald-300">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Above market</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Payout</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(totals.amountReceived)}</p>
                  <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-luxury-gold rounded-full" style={{ width: `${Math.min((totals.amountReceived / totals.expectedProfit) * 100, 100)}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pending</p>
                  <p className="text-2xl font-bold text-amber-400">{formatCurrency(totals.expectedProfit - totals.amountReceived)}</p>
                  <p className="text-xs text-slate-500 mt-1">Expected returns</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Diversification</p>
                  <p className="text-2xl font-bold text-indigo-400">{compositionData.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Investment types</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AVAILABLE OPPORTUNITIES (3D Cards) */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-display font-bold text-white leading-tight">Investment Opportunities</h2>
            <p className="text-slate-400 mt-1">Curated high-yield real estate assets</p>
          </div>
        </div>

        {boxesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-[1000px]">
            {boxes.map((box) => {
              const alreadyInvested = investedBoxIds.has(box._id);
              const invested = alreadyInvested ? investmentByBoxId.get(box._id) : undefined;
              const increasePending = invested?.increaseRequest?.status === "Pending";

              return (
                <div
                  key={box._id}
                  className="group relative h-full rounded-3xl border border-white/10 bg-[#0f1629] p-1 transition-all duration-500 hover:rotate-x-2 hover:translate-y-[-10px] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Card Content Wrapper */}
                  <div className="relative h-full flex flex-col rounded-[20px] bg-[#0f1629] p-6 overflow-hidden">
                    {/* Bg Gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white">
                        <Building2 className="w-8 h-8" />
                      </div>
                      {alreadyInvested && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Invested
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-display font-bold text-white mb-2 line-clamp-1">{box.name}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-6 min-h-[40px]">{box.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-xs text-slate-400 mb-1">Target ROI</p>
                        <p className="text-xl font-bold text-emerald-400">{box.roiPercentage}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-xs text-slate-400 mb-1">Min Entry</p>
                        <p className="text-xl font-bold text-white">{Math.round(box.minInvestmentAmount / 1000)}k <span className="text-xs font-normal text-slate-500">EGP</span></p>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Button
                        className={`w-full py-6 text-lg font-semibold shadow-lg transition-all ${alreadyInvested
                          ? "bg-white/10 text-white hover:bg-white/20 border border-white/5"
                          : "bg-luxury-gold text-luxury-dark hover:bg-luxury-gold/90 hover:scale-[1.02]"
                          }`}
                        onClick={() => (alreadyInvested ? openIncreaseDialog(box) : openInvestDialog(box))}
                        disabled={alreadyInvested && increasePending}
                      >
                        {alreadyInvested
                          ? (increasePending ? "Increase Pending" : "Increase Stake")
                          : "Start Investing"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* DIALOGS */}
      <Dialog open={isInvestDialogOpen} onOpenChange={setIsInvestDialogOpen}>
        <DialogContent className="max-w-lg bg-[#0b1224] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-white">Invest in {selectedBox?.name}</DialogTitle>
            <DialogDescription className="text-slate-400">Add funds to this high-yield portfolio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvestSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300">Investment Amount (EGP)</label>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-4xl font-bold text-white tracking-tight">{formatCurrency(investmentAmount)}</span>
              </div>

              <Slider
                defaultValue={[selectedBox?.minInvestmentAmount || 0]}
                max={20000000}
                min={selectedBox?.minInvestmentAmount || 0}
                step={5000}
                value={[investmentAmount]}
                onValueChange={(vals) => setInvestmentAmount(vals[0])}
                className="py-4"
              />
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Min: {formatCurrency(selectedBox?.minInvestmentAmount || 0)}</span>
                <Input
                  type="number"
                  className="w-32 h-8 text-center bg-white/5 border-white/10 text-white text-xs"
                  min={selectedBox?.minInvestmentAmount ?? 0}
                  max={20000000}
                  step={1000}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  placeholder="Type amount"
                />
                <span>Max: 20M+</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Notes (Optional)</label>
              <Textarea
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 resize-none"
                value={investmentNotes}
                onChange={(e) => setInvestmentNotes(e.target.value)}
                placeholder="Any special requirements..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsInvestDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold/90 font-bold" disabled={submittingInvestment}>
                {submittingInvestment ? "Processing..." : "Confirm Investment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isIncreaseDialogOpen} onOpenChange={setIsIncreaseDialogOpen}>
        <DialogContent className="max-w-lg bg-[#0b1224] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-white">Increase Stake: {increaseBox?.name}</DialogTitle>
            <DialogDescription className="text-slate-400">Compound your returns by adding more capital.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIncreaseSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300">Additional Amount (EGP)</label>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-4xl font-bold text-white tracking-tight">{formatCurrency(increaseAmount)}</span>
              </div>

              <Slider
                defaultValue={[5000]}
                max={10000000}
                min={1000}
                step={1000}
                value={[increaseAmount]}
                onValueChange={(vals) => setIncreaseAmount(vals[0])}
                className="py-4"
              />
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>+1k</span>
                <Input
                  type="number"
                  className="w-32 h-8 text-center bg-white/5 border-white/10 text-white text-xs"
                  min={1000}
                  max={10000000}
                  step={1000}
                  value={increaseAmount}
                  onChange={(e) => setIncreaseAmount(Number(e.target.value))}
                  placeholder="Type amount"
                />
                <span>+10M</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Note</label>
              <Textarea
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 resize-none"
                value={increaseNote}
                onChange={(e) => setIncreaseNote(e.target.value)}
                placeholder="Reason for increase..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsIncreaseDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-luxury-gold text-luxury-dark hover:bg-luxury-gold/90 font-bold" disabled={submittingIncrease}>
                {submittingIncrease ? "Processing..." : "Send Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyInvestments;
