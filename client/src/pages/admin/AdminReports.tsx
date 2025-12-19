import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { AnalyticsSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, X, BarChart3, Download, Building2, Users2, Mail, ClipboardList, Heart, CircleDollarSign, TrendingUp } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminGlassCard from "@/components/admin/AdminGlassCard";

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

  const STAT_CONFIG: Partial<Record<keyof AnalyticsSummary["stats"], { label: string; icon: typeof Building2; accent: string }>> = {
    properties: { label: "Properties", icon: Building2, accent: "text-emerald-400 bg-emerald-400/10" },
    leads: { label: "Leads", icon: Users2, accent: "text-sky-400 bg-sky-400/10" },
    messages: { label: "Messages", icon: Mail, accent: "text-amber-400 bg-amber-400/10" },
    users: { label: "Users", icon: Heart, accent: "text-pink-400 bg-pink-400/10" },
    wishlistItems: { label: "Wishlist", icon: ClipboardList, accent: "text-purple-400 bg-purple-400/10" },
    totalInvested: { label: "Total Invested", icon: CircleDollarSign, accent: "text-luxury-gold bg-luxury-gold/10" },
    actualProfit: { label: "Total Received", icon: CircleDollarSign, accent: "text-emerald-300 bg-emerald-400/10" },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats)
          .map(([key, value]) => {
            const typedKey = key as keyof AnalyticsSummary["stats"];
            const config = STAT_CONFIG[typedKey];
            if (!config) return null;
            const Icon = config.icon;
            return (
              <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-white/60">{config.label}</p>
                    <p className="text-3xl font-display font-semibold mt-2 text-white">{value}</p>
                  </div>
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${config.accent}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      <AdminGlassCard
        title="Recent Leads"
        description="Top-of-funnel activity snapshot"
        rightSlot={
          <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={handleDownloadCsv} disabled={!recentLeads.length}>
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        }
      >
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="py-2 font-medium">Name</th>
                <th className="font-medium">Email</th>
                <th className="font-medium">Status</th>
                <th className="font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {recentLeads.map((lead) => (
                <tr key={lead._id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                  <td className="py-2 font-medium text-white">{lead.fullName}</td>
                  <td>{lead.email}</td>
                  <td className="capitalize">{lead.status}</td>
                  <td>{lead.source}</td>
                </tr>
              ))}
              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-white/40">
                    No leads captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminGlassCard>

      <AdminGlassCard
        title="Role capabilities"
      >
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="py-2 font-medium">Capability</th>
                <th className="font-medium">Admin</th>
                <th className="font-medium">Employee</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {capabilities.map((row) => (
                <tr key={row.label} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                  <td className="py-2">
                    {row.label} {row.note && <span className="text-white/40 text-xs">{row.note}</span>}
                  </td>
                  <td>
                    {row.admin ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-white/20" />}
                  </td>
                  <td>
                    {row.employee ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-white/20" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminGlassCard>
    </div>
  );
};

export default AdminReports;
