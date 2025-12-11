import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { AnalyticsSummary } from "@/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Building2, Mail, HeartHandshake, Users2, ClipboardList, Gauge, CircleDollarSign, TrendingUp, Sparkles } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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

  const chartData = (data.investmentTimeline?.length
    ? data.investmentTimeline
    : [{ label: "To Date", invested: totalInvested, received: actualProfit, outstanding }]
  ).map((item) => ({
    ...item,
    outstanding: Math.max(item.outstanding ?? item.invested - item.received, 0),
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

          <div className="mt-4 h-60 w-full rounded-2xl border border-white/10 bg-white/5 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.7)" }} stroke="rgba(255,255,255,0.3)" />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.7)" }}
                  stroke="rgba(255,255,255,0.3)"
                  tickFormatter={(v) => (v >= 1_000_000 ? `${Math.round(v / 1_000_000)}m` : `${Math.round(v / 1000)}k`)}
                />
                <Tooltip
                  contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
                  labelStyle={{ color: "#fff", fontWeight: 600 }}
                  formatter={(val: number, key) => [`EGP ${Math.round(val).toLocaleString()}`, key === "invested" ? "Invested" : key === "received" ? "Received" : "Outstanding"]}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                <Bar dataKey="invested" name="Invested" fill="hsl(var(--luxury-gold))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="received" name="Received" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="outstanding"
                  name="Outstanding"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, stroke: "#0b1020", fill: "#7c3aed" }}
                  activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-white/60">Total Invested</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalInvested)}</p>
              <p className="text-xs text-white/50">Capital across all approved deals</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-white/60">Actual Profit</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(actualProfit)}</p>
              <p className="text-xs text-white/50">Sum of received payouts</p>
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
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-white/70">Invested Properties</p>
                <p className="text-2xl font-bold text-white">{investedProperties}</p>
                <p className="text-xs text-white/50">Projects currently funded</p>
                <p className="text-xs text-white/60 mt-2">Portfolio coverage { (coverageRatio * 100).toFixed(1)}%</p>
              </div>
              <div className="flex items-center gap-3">
                <CircleDollarSign className="h-10 w-10 text-luxury-gold" />
                <TrendingUp className="h-10 w-10 text-emerald-300" />
              </div>
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
