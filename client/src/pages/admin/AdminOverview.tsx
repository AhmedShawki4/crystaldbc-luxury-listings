import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { AnalyticsSummary } from "@/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Building2, Mail, HeartHandshake, Users2, ClipboardList, Gauge } from "lucide-react";

const fetchSummary = async () => {
  const { data } = await apiClient.get<AnalyticsSummary>("/analytics/summary");
  return data;
};

const AdminOverview = () => {
  const { data, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: fetchSummary });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  if (!data) {
    return <p className="text-muted-foreground">Unable to load dashboard.</p>;
  }

  const { stats, recentLeads } = data;

  const pieData = [
    { label: "Properties", value: stats.properties, color: "#34d399" },
    { label: "Leads", value: stats.leads, color: "#60a5fa" },
    { label: "Messages", value: stats.messages, color: "#fbbf24" },
    { label: "Users", value: stats.users, color: "#f472b6" },
    { label: "Wishlist", value: stats.wishlistItems, color: "#c084fc" },
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
    properties: { label: "Properties", icon: Building2, accent: "text-emerald-400 bg-emerald-400/10" },
    leads: { label: "Leads", icon: Users2, accent: "text-sky-400 bg-sky-400/10" },
    messages: { label: "Messages", icon: Mail, accent: "text-amber-400 bg-amber-400/10" },
    users: { label: "Users", icon: HeartHandshake, accent: "text-pink-400 bg-pink-400/10" },
    wishlistItems: { label: "Wishlist Items", icon: ClipboardList, accent: "text-purple-400 bg-purple-400/10" },
  };
  return (
    <div className="space-y-10">
      <AdminPageHeader
        icon={Gauge}
        title="Executive Overview"
        description="Key metrics across CrystalDBC in real time."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(stats).map(([key, value]) => {
          const typedKey = key as keyof AnalyticsSummary["stats"];
          const config = STAT_CONFIG[typedKey];
          const Icon = config.icon;
          return (
            <div key={key} className="rounded-2xl border border-border/70 bg-background/80 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                  <p className="text-3xl font-display font-bold mt-3">{value}</p>
                </div>
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${config.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/70 bg-background/80 p-6 shadow-lg">
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
