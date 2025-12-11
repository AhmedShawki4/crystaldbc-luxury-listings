import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { AnalyticsSummary } from "@/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Building2, Mail, HeartHandshake, Users2, ClipboardList, Gauge, CircleDollarSign, TrendingUp, Sparkles } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const fetchSummary = async () => {
  const { data } = await apiClient.get<AnalyticsSummary>("/analytics/summary");
  return data;
};

const AdminOverview = () => {
  const { data, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: fetchSummary });
  const formatCurrency = (value: number) => `EGP ${Math.round(value).toLocaleString()}`;

  if (isLoading) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  if (!data) {
    return <p className="text-muted-foreground">Unable to load dashboard.</p>;
  }

  const { stats, recentLeads } = data;
  const actualProfit = stats.actualProfit ?? 0;
  const investedProperties = stats.investedProperties ?? 0;
  const totalInvested = stats.totalInvested ?? 0;
  const roiPercent = totalInvested > 0 ? Math.min(150, (actualProfit / totalInvested) * 100) : 0;
  const outstanding = Math.max(totalInvested - actualProfit, 0);
  const coverageRatio = totalInvested > 0 ? Math.min(actualProfit / totalInvested, 1) : 0;

  const chartData = [0.18, 0.32, 0.46, 0.63, 0.78, 1].map((ratio, idx) => ({
    label: `Q${idx + 1}`,
    invested: Math.round(totalInvested * ratio),
    received: Math.round(actualProfit * ratio),
  }));

  const pieData = [
    { label: "Properties", value: stats.properties, color: "#7c3aed" },
    { label: "Leads", value: stats.leads, color: "#22d3ee" },
    { label: "Messages", value: stats.messages, color: "#fbbf24" },
    { label: "Users", value: stats.users, color: "#a78bfa" },
    { label: "Wishlist", value: stats.wishlistItems, color: "#fb7185" },
  ];
  const pieTotal = pieData.reduce((sum, item) => sum + item.value, 0);
  let pieGradient = "";
  if (pieTotal > 0) {
    let current = 0;
    pieGradient = pieData
      .map((item) => {
        const start = (current / pieTotal) * 100;
        current += item.value;
        const end = (current / pieTotal) * 100;
        return `${item.color} ${start}% ${end}%`;
      })
      .join(", ");
  }

  const STAT_CONFIG: Record<keyof AnalyticsSummary["stats"], { label: string; icon: typeof Building2; accent: string }> = {
    properties: { label: "Properties", icon: Building2, accent: "text-emerald-300 bg-emerald-400/10" },
    leads: { label: "Leads", icon: Users2, accent: "text-sky-300 bg-sky-400/10" },
    messages: { label: "Messages", icon: Mail, accent: "text-amber-300 bg-amber-400/10" },
    users: { label: "Users", icon: HeartHandshake, accent: "text-pink-300 bg-pink-400/10" },
    wishlistItems: { label: "Wishlist Items", icon: ClipboardList, accent: "text-purple-300 bg-purple-400/10" },
  };
  return (
    <div className="space-y-10">
      <AdminPageHeader
        icon={Gauge}
        title="Executive Overview"
        description="Key metrics across CrystalDBC in real time."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl bg-gradient-to-br from-[#0e1527] via-[#10192f] to-[#0b1020] text-white border border-white/10 p-6 shadow-[0_20px_80px_-24px_rgba(0,0,0,0.55)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/60">Performance</p>
              <h3 className="text-2xl font-display font-semibold">Live Investment Snapshot</h3>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Auto-refreshed from analytics
            </div>
          </div>

          <div className="mt-4 h-56 w-full rounded-2xl border border-white/10 bg-white/5 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="overviewInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--luxury-gold))" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="hsl(var(--luxury-gold))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="overviewReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.7)" }} stroke="rgba(255,255,255,0.3)" />
                <Tooltip
                  contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(val: number, key) => [`EGP ${Math.round(val).toLocaleString()}`, key === "invested" ? "Invested" : "Received"]}
                />
                <Area type="monotone" dataKey="invested" stroke="hsl(var(--luxury-gold))" strokeWidth={3} fill="url(#overviewInvested)" />
                <Area type="monotone" dataKey="received" stroke="#22c55e" strokeWidth={3} fill="url(#overviewReceived)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-white/60">Total Invested</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalInvested)}</p>
              <p className="text-xs text-white/50">Capital across all approved deals</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-white/60">Outstanding Payouts</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(outstanding)}</p>
              <p className="text-xs text-white/50">Total invested minus amounts paid</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-luxury-gold to-luxury-gold-light"
                  style={{ width: `${coverageRatio * 100}%` }}
                />
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-white/60">Invested Properties</p>
              <p className="text-2xl font-bold text-white">{investedProperties}</p>
              <p className="text-xs text-white/50">Projects currently funded</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-white/70">Portfolio Coverage</p>
                <p className="text-2xl font-bold text-white">{(coverageRatio * 100).toFixed(1)}%</p>
                <p className="text-xs text-white/50">Paid vs total invested</p>
              </div>
              <CircleDollarSign className="h-10 w-10 text-luxury-gold" />
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-white/70">ROI to Date</p>
                <p className="text-2xl font-bold text-white">{roiPercent.toFixed(1)}%</p>
                <p className="text-xs text-white/50">Actual profit vs invested</p>
              </div>
              <TrendingUp className="h-10 w-10 text-emerald-300" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#0f1625] via-[#0c1220] to-[#0a101b] border border-white/10 p-6 shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">ROI</p>
              <p className="text-3xl font-display font-bold">{roiPercent.toFixed(1)}%</p>
              <p className="text-xs text-white/60 mt-1">Realized vs invested</p>
            </div>
            <div className="relative h-24 w-24">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `conic-gradient(#7c3aed 0% ${roiPercent}%, rgba(255,255,255,0.08) ${roiPercent}% 100%)` }}
              />
              <div className="absolute inset-3 rounded-full bg-[#0b1020] border border-white/10" />
              <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">{roiPercent.toFixed(0)}%</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-white/70">Messages</p>
              <p className="text-xl font-semibold flex items-center gap-2"><Mail className="h-4 w-4 text-amber-400" />{stats.messages}</p>
              <p className="text-xs text-white/60">Engagement</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-white/70">Wishlist</p>
              <p className="text-xl font-semibold flex items-center gap-2"><ClipboardList className="h-4 w-4 text-purple-300" />{stats.wishlistItems}</p>
              <p className="text-xs text-white/60">Saved items</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-white/70">Users</p>
              <p className="text-xl font-semibold flex items-center gap-2"><HeartHandshake className="h-4 w-4 text-rose-300" />{stats.users}</p>
              <p className="text-xs text-white/60">Active</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-white/70">Invested Properties</p>
              <p className="text-xl font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-emerald-300" />{investedProperties}</p>
              <p className="text-xs text-white/60">Currently funded</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Distribution</p>
            <h3 className="text-2xl font-display font-semibold">Engagement Mix</h3>
          </div>
        </div>
        {pieTotal === 0 ? (
          <p className="text-muted-foreground">No data to visualize yet.</p>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div
              className="h-48 w-48 rounded-full shadow-inner border border-border"
              style={{ backgroundImage: `conic-gradient(${pieGradient})` }}
              aria-label="Engagement distribution pie chart"
            />
            <div className="flex flex-col gap-3 w-full">
              {pieData.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                  <p className="text-sm font-semibold">{pieTotal ? Math.round((item.value / pieTotal) * 100) : 0}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-background border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display font-semibold">Recent Leads</h2>
          <span className="text-sm text-muted-foreground">Last {recentLeads.length} submissions</span>
        </div>
        <div className="space-y-3">
          {recentLeads.map((lead) => (
            <div key={lead._id} className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-primary">{lead.fullName}</p>
                <p className="text-sm text-muted-foreground">{lead.email}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-medium uppercase tracking-wide">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-500">{lead.status}</span>
                <span className="rounded-full bg-slate-500/10 px-3 py-1 text-slate-400">{lead.source}</span>
              </div>
            </div>
          ))}
          {recentLeads.length === 0 && <p className="text-muted-foreground">No leads yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
