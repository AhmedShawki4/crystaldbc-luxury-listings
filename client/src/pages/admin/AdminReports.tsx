import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { AnalyticsSummary } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, BarChart3, Download, Building2, Users2, Mail, ClipboardList, Heart } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const fetchSummary = async () => {
  const { data } = await apiClient.get<AnalyticsSummary>("/analytics/summary");
  return data;
};

const AdminReports = () => {
  const { data, isLoading } = useQuery({ queryKey: ["analytics", "reports"], queryFn: fetchSummary });

  const handleExportPdf = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!data?.recentLeads?.length) return;
    const header = ["Name", "Email", "Status", "Source"];
    const rows = data.recentLeads.map((lead) => [lead.fullName, lead.email, lead.status, lead.source]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "recent-leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  const STAT_CONFIG: Record<keyof AnalyticsSummary["stats"], { label: string; icon: typeof Building2; accent: string }> = {
    properties: { label: "Properties", icon: Building2, accent: "text-emerald-400 bg-emerald-400/10" },
    leads: { label: "Leads", icon: Users2, accent: "text-sky-400 bg-sky-400/10" },
    messages: { label: "Messages", icon: Mail, accent: "text-amber-400 bg-amber-400/10" },
    users: { label: "Users", icon: Heart, accent: "text-pink-400 bg-pink-400/10" },
    wishlistItems: { label: "Wishlist", icon: ClipboardList, accent: "text-purple-400 bg-purple-400/10" },
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={BarChart3}
        title="Reports & Intelligence"
        description="Export high-level performance snapshots and compare roles."
        actions={
          <Button variant="outline" className="gap-2" onClick={handleExportPdf}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, value]) => {
          const typedKey = key as keyof AnalyticsSummary["stats"];
          const config = STAT_CONFIG[typedKey];
          const Icon = config.icon;
          return (
            <Card key={key} className="border-border/70">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-3xl font-display font-semibold mt-2">{value}</p>
                  </div>
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${config.accent}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-semibold">Recent Leads</h2>
              <p className="text-sm text-muted-foreground">Top-of-funnel activity snapshot</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleDownloadCsv} disabled={!recentLeads.length}>
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
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
