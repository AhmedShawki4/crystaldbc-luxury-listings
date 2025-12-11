import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { AnalyticsSummary } from "@/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Building2, Mail, HeartHandshake, Users2, ClipboardList, Gauge, CircleDollarSign, TrendingUp, Sparkles } from "lucide-react";

const fetchSummary = async () => {
  const { data } = await apiClient.get<AnalyticsSummary>("/analytics/summary");
  return data;
};

const AdminOverview = () => {
  const { data, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: fetchSummary });

  const sparklinePath = useMemo(() => {
    const pts = [
      { x: 0, y: 58 },
      { x: 20, y: 72 },
      { x: 40, y: 68 },
      { x: 60, y: 82 },
      { x: 80, y: 74 },
      { x: 100, y: 96 },
      { x: 120, y: 86 },
      { x: 140, y: 112 },
      { x: 160, y: 104 },
      { x: 180, y: 126 },
      { x: 200, y: 118 },
      { x: 220, y: 138 },
      { x: 240, y: 130 },
      { x: 260, y: 148 },
    ];
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  }, []);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  if (!data) {
    return <p className="text-muted-foreground">Unable to load dashboard.</p>;
  }

  const { stats, recentLeads } = data;

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-3xl bg-gradient-to-br from-[#0e1527] via-[#10192f] to-[#0b1020] text-white border border-white/10 p-6 shadow-[0_20px_80px_-24px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/60">Performance</p>
              <h3 className="text-2xl font-display font-semibold">Beyond the Numbers</h3>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">ROI 35%</div>
          </div>
          <div className="relative mt-2 h-48 w-full overflow-hidden rounded-2xl bg-white/5">
            <svg viewBox="0 0 280 180" className="w-full h-full">
              <defs>
                <linearGradient id="gradAdmin" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
                </linearGradient>
              </defs>
              <path d={sparklinePath} fill="none" stroke="url(#gradAdmin)" strokeWidth="4" strokeLinecap="round" />
              {sparklinePath.split(" ").filter(Boolean).map((segment, idx) => {
                const parts = segment.slice(1).split(",");
                if (parts.length !== 2) return null;
                const [x, y] = parts;
                return <circle key={idx} cx={Number(x)} cy={Number(y)} r={4} fill="#22d3ee" />;
              })}
            </svg>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-white/60">Profit</p>
              <p className="text-2xl font-bold text-white">$69,432</p>
              <p className="text-xs text-white/50">Net after fees</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-white/60">Cash Flow</p>
              <p className="text-2xl font-bold text-white">$143,432</p>
              <p className="text-xs text-white/50">Investments vs Sales</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-border p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="text-3xl font-display font-bold">35%</p>
              <p className="text-xs text-muted-foreground mt-1">vs last quarter</p>
            </div>
            <div className="relative h-24 w-24">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "conic-gradient(#7c3aed 0% 35%, #e5e7eb 35% 100%)" }}
              />
              <div className="absolute inset-3 rounded-full bg-background border border-border" />
              <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">35%</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-muted-foreground">Messages</p>
              <p className="text-xl font-semibold flex items-center gap-2"><Mail className="h-4 w-4 text-amber-500" />{stats.messages}</p>
              <p className="text-xs text-muted-foreground">Engagement</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-muted-foreground">Wishlist</p>
              <p className="text-xl font-semibold flex items-center gap-2"><ClipboardList className="h-4 w-4 text-purple-500" />{stats.wishlistItems}</p>
              <p className="text-xs text-muted-foreground">Saved items</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-muted-foreground">Users</p>
              <p className="text-xl font-semibold flex items-center gap-2"><HeartHandshake className="h-4 w-4 text-rose-500" />{stats.users}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-muted-foreground">Properties</p>
              <p className="text-xl font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-emerald-500" />{stats.properties}</p>
              <p className="text-xs text-muted-foreground">Live</p>
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
