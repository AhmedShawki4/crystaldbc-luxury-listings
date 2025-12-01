import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { AnalyticsSummary } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const fetchSummary = async () => {
  const { data } = await apiClient.get<AnalyticsSummary>("/analytics/summary");
  return data;
};

const AdminReports = () => {
  const { data, isLoading } = useQuery({ queryKey: ["analytics", "reports"], queryFn: fetchSummary });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading reports...</p>;
  }

  if (!data) {
    return <p className="text-muted-foreground">No data available.</p>;
  }

  const { stats, recentLeads } = data;
  const capabilities = [
    { label: "View reports", admin: true, employee: true, note: "(limited)" },
    { label: "View activity logs", admin: true, employee: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Reports</h1>
        <p className="text-muted-foreground">Export high-level performance snapshots.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
              <p className="text-3xl font-display font-semibold mt-2">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-semibold">Recent Leads</h2>
              <p className="text-sm text-muted-foreground">Top-of-funnel activity snapshot</p>
            </div>
            <Button variant="outline">Download CSV</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead._id} className="border-b border-border/80 last:border-0">
                    <td className="py-2 font-medium">{lead.fullName}</td>
                    <td>{lead.email}</td>
                    <td className="capitalize">{lead.status}</td>
                    <td>{lead.source}</td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No leads captured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold">Role capabilities</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2">Capability</th>
                  <th>Admin</th>
                  <th>Employee</th>
                </tr>
              </thead>
              <tbody>
                {capabilities.map((row) => (
                  <tr key={row.label} className="border-b border-border/80 last:border-0">
                    <td className="py-2">
                      {row.label} {row.note && <span className="text-muted-foreground text-xs">{row.note}</span>}
                    </td>
                    <td>
                      {row.admin ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-destructive" />}
                    </td>
                    <td>
                      {row.employee ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-destructive" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
