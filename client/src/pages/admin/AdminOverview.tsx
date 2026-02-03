import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Users2,
  Building2,
  ArrowUpRight,
  MessageSquare,
  Search,
  CheckCircle2,
  Wallet,
  DollarSign
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import apiClient from "@/lib/apiClient";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import ThreePieChart from "@/components/admin/ThreePieChart";
import { Badge } from "@/components/ui/badge";
import { AnalyticsSummary } from "@/types";
import { useTranslation } from "react-i18next";

const fetchSummary = async () => {
  const { data } = await apiClient.get<AnalyticsSummary>("/analytics/summary");
  // Ensure we return the correct shape.  The previous code accessed data.stats or data directly.
  // Assuming the API returns the whole AnalyticsSummary object.
  return data;
};

const AdminOverview = () => {
  const { data, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: fetchSummary });
  const { t } = useTranslation();
  const formatCurrency = (value: number) => `EGP ${Math.round(value).toLocaleString()}`;

  if (isLoading) {
    return <div className="p-8 text-white">{t("admin.overview.loading")}</div>;
  }

  if (!data) {
    return <div className="p-8 text-white">{t("admin.overview.unable")}</div>;
  }

  const { stats, recentLeads } = data;
  const actualProfit = stats.actualProfit ?? 0;
  const investedProperties = stats.investedProperties ?? 0;
  const totalInvested = stats.totalInvested ?? 0;
  const roiPercent = totalInvested > 0 ? Math.min(150, (actualProfit / totalInvested) * 100) : 0;

  // Prepare Chart Data
  const chartData = (data.investmentTimeline?.length
    ? data.investmentTimeline
    : [{ label: t("admin.overview.toDate"), invested: totalInvested, received: actualProfit, outstanding: Math.max(totalInvested - actualProfit, 0) }]
  ).map((item) => ({
    ...item,
    outstanding: Math.max(item.outstanding ?? item.invested - item.received, 0),
  }));

  // Prepare Pie Data
  const pieData = [
    { label: t("admin.overview.pieLabels.properties"), value: stats.properties || 10, color: "#7c3aed" },
    { label: t("admin.overview.pieLabels.leads"), value: stats.leads || 5, color: "#22d3ee" },
    { label: t("admin.overview.pieLabels.messages"), value: stats.messages || 3, color: "#fbbf24" },
    { label: t("admin.overview.pieLabels.users"), value: stats.users || 8, color: "#a78bfa" },
    { label: t("admin.overview.pieLabels.wishlist"), value: stats.wishlistItems || 2, color: "#fb7185" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Live Investment Snapshot (Full Width) */}
      <div className="relative rounded-[2.5rem] bg-[#020617] border border-white/10 p-8 shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">{t("admin.overview.performance")}</h2>
            <p className="text-slate-400">{t("admin.overview.liveSnapshot")}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-inner">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-400">{t("admin.overview.liveUpdates")}</span>
          </div>
        </div>

        <div className="h-[350px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="90%" stopColor="#818cf8" stopOpacity={0.3} />
                </linearGradient>
                <filter id="shadow" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(99, 102, 241, 0.3)" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                itemStyle={{ color: "#fff" }}
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
              />
              <Bar dataKey="invested" name={t("admin.overview.series.invested")} fill="url(#barGradient)" barSize={20} radius={[4, 4, 0, 0]} filter="url(#shadow)" />
              <Bar dataKey="received" name={t("admin.overview.series.received")} fill="#34d399" barSize={20} radius={[4, 4, 0, 0]} opacity={0.8} />
              <Line type="monotone" dataKey="outstanding" name={t("admin.overview.series.outstanding")} stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: "#fbbf24" }} activeDot={{ r: 6, strokeWidth: 0, fill: "#fff" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BELOW CHART: Stats & Right Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {/* Stat Boxes Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {/* Total Invested */}
            <div className="rounded-2xl bg-[#0b1224] border border-white/10 p-6 shadow-xl hover:border-white/20 transition-colors">
              <p className="text-sm text-slate-400 font-medium mb-2">{t("admin.overview.totalInvested")}</p>
              <h3 className="text-3xl font-display font-bold text-white mb-1">{formatCurrency(totalInvested)}</h3>
              <p className="text-xs text-slate-500">{t("admin.overview.totalInvestedHelp")}</p>
            </div>

            {/* Actual Profit */}
            <div className="rounded-2xl bg-[#0b1224] border border-white/10 p-6 shadow-xl hover:border-white/20 transition-colors">
              <p className="text-sm text-slate-400 font-medium mb-2">{t("admin.overview.actualProfit")}</p>
              <h3 className="text-3xl font-display font-bold text-white mb-1">{formatCurrency(actualProfit)}</h3>
              <p className="text-xs text-slate-500">{t("admin.overview.actualProfitHelp")}</p>
            </div>

            {/* Outstanding Payouts */}
            <div className="rounded-2xl bg-[#0b1224] border border-white/10 p-6 shadow-xl hover:border-white/20 transition-colors">
              <p className="text-sm text-slate-400 font-medium mb-2">{t("admin.overview.outstanding")}</p>
              <h3 className="text-3xl font-display font-bold text-white mb-1">{formatCurrency(Math.max(totalInvested - actualProfit, 0))}</h3>
              <p className="text-xs text-slate-500">{t("admin.overview.outstandingHelp")}</p>
              <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-luxury-gold rounded-full transition-all" style={{ width: `${Math.min((actualProfit / totalInvested) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Invested Boxes */}
            <div className="rounded-2xl bg-[#0b1224] border border-white/10 p-6 shadow-xl hover:border-white/20 transition-colors">
              <p className="text-sm text-slate-400 font-medium mb-2">{t("admin.overview.investedProperties")}</p>
              <h3 className="text-3xl font-display font-bold text-white mb-1">{investedProperties}</h3>
              <p className="text-xs text-slate-500 mb-2">{t("admin.overview.investedPropertiesHelp")}</p>
              <div className="flex items-center gap-2 mt-auto">
                <div className="p-1.5 bg-luxury-gold/10 rounded-full">
                  <DollarSign className="w-3 h-3 text-luxury-gold" />
                </div>
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-slate-400">{t("admin.overview.portfolioCoverage", { percent: roiPercent.toFixed(1) })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ROI & Engagement Mix (Side by Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 3D PIE CHART */}
          <div className="flex-1 relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#050816] shadow-[0_24px_80px_rgba(0,0,0,0.65)] flex flex-col min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none" />

            <div className="p-8 pb-0 relative z-10">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">{t("admin.overview.distribution")}</p>
              <h3 className="text-2xl font-display font-semibold text-white">{t("admin.overview.engagementMix")}</h3>
            </div>

            <div className="flex-1 relative w-full h-full">
              {/* 3D Chart Component */}
              <div className="absolute inset-0 -top-4">
                <ThreePieChart data={pieData} height="100%" />
              </div>
            </div>
            {/* Legend */}
            <div className="relative z-10 px-6 pb-6 pt-2 flex flex-wrap gap-2 justify-center pointer-events-none">
              {pieData.map(item => (
                <div key={item.label} className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 border border-white/5 pointer-events-auto">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: item.color, backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-white/80">{item.label}</span>
                  <span className="text-xs text-white/40 ml-1">{Math.round(item.value / (pieData.reduce((a, b) => a + b.value, 0) || 1) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* ENRICHED ROI CARD */}
          <div className="rounded-[2.5rem] bg-[#0b1224] border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-slate-400">{t("admin.overview.roi")}</h3>
                  <div className="p-2 bg-white/5 rounded-full border border-white/10">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-5xl font-display font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                    {roiPercent.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm font-medium text-emerald-400 flex items-center mb-6">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  {t("admin.overview.roiDelta")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">{t("admin.overview.netProfit")}</p>
                  <p className="text-lg font-bold text-white tracking-tight">{formatCurrency(actualProfit)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">{t("admin.overview.projected")}</p>
                  <p className="text-lg font-bold text-slate-300 tracking-tight">~18.5%</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>{t("admin.overview.progressToGoal")}</span>
                  <span>{Math.round(Math.min(roiPercent, 100))}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(roiPercent, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RECENT LEADS */}
      <AdminGlassCard
        eyebrow={t("admin.overview.pipelineActivity")}
        title={t("admin.overview.recentLeads")}
        description={t("admin.overview.lastSubmissions", { count: recentLeads.length })}
        className="mt-6"
      >
        <div className="space-y-3">
          {recentLeads.map((lead) => (
            <div
              key={lead._id}
              className="group flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between transition hover:bg-white/[0.05] hover:border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 md:flex hidden items-center justify-center text-indigo-300 font-bold border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                  {lead.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-luxury-gold transition-colors">{lead.fullName}</p>
                  <p className="text-sm text-slate-400">{lead.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-xs font-medium uppercase tracking-wide">
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {lead.status}
                </span>
                <span className="rounded-full bg-slate-500/10 px-3 py-1 text-slate-400 border border-white/5">{lead.source}</span>
              </div>
            </div>
          ))}
          {recentLeads.length === 0 && (
            <div className="py-8 text-center">
              <Users2 className="h-12 w-12 text-white/10 mx-auto mb-3" />
              <p className="text-sm text-slate-400">{t("admin.overview.noLeads")}</p>
            </div>
          )}
        </div>
      </AdminGlassCard>
    </div>
  );
};

export default AdminOverview;
