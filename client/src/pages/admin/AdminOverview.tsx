import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { AnalyticsSummary } from "@/types";

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

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Overview</h1>
        <p className="text-muted-foreground">Key metrics across CrystalDBC.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-background border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
            <p className="text-3xl font-display font-bold mt-3">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-background border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display font-semibold">Recent Leads</h2>
          <span className="text-sm text-muted-foreground">Last {recentLeads.length} submissions</span>
        </div>
        <div className="space-y-3">
          {recentLeads.map((lead) => (
            <div key={lead._id} className="flex flex-col md:flex-row md:items-center md:justify-between border border-border/60 rounded-lg px-4 py-3">
              <div>
                <p className="font-semibold">{lead.fullName}</p>
                <p className="text-sm text-muted-foreground">{lead.email}</p>
              </div>
              <div className="text-sm text-muted-foreground mt-2 md:mt-0">
                <p>Status: {lead.status}</p>
                <p>Source: {lead.source}</p>
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
