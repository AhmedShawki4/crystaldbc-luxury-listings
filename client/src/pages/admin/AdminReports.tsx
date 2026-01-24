import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { AnalyticsSummary, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, X, BarChart3, Download, Building2, Users2, Mail, ClipboardList, Heart, CircleDollarSign, TrendingUp } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fetchSummary = async () => {
  const { data } = await apiClient.get<AnalyticsSummary>("/analytics/summary");
  return data;
};

const fetchUsers = async () => {
  const { data } = await apiClient.get<{ users: User[] }>("/users");
  return data.users;
};

const AdminReports = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ["analytics", "reports"], queryFn: fetchSummary });
  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: fetchUsers });
  const [countryFilter, setCountryFilter] = useState<string>("all");

  const handleExportPdf = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!data?.recentLeads?.length) return;
    const header = [t("admin.reports.table.name"), t("admin.reports.table.email"), t("admin.reports.table.status"), t("admin.reports.table.source")];
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

  const availableCountries = useMemo(() => {
    const set = new Set(users.map((user) => user.country).filter(Boolean) as string[]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [users]);

  const handleDownloadUsersByCountry = () => {
    const filteredUsers = countryFilter === "all"
      ? users
      : users.filter((user) => (user.country || "").toLowerCase() === countryFilter.toLowerCase());

    if (!filteredUsers.length) return;

    const header = [
      t("admin.users.labels.name"),
      t("admin.users.labels.email"),
      t("admin.users.labels.role"),
      t("admin.users.labels.country"),
      t("admin.users.labels.phone"),
      t("admin.users.labels.createdAt"),
    ];
    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.country ?? "",
      user.phone ?? "",
      new Date(user.createdAt).toLocaleDateString(),
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const suffix = countryFilter === "all" ? "all" : countryFilter.toLowerCase().replace(/\s+/g, "-");
    link.setAttribute("download", `users-${suffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <p className="text-muted-foreground">{t("admin.reports.loading")}</p>;
  }

  if (!data) {
    return <p className="text-muted-foreground">{t("admin.reports.noData")}</p>;
  }

  const { stats, recentLeads } = data;
  const capabilities = [
    { label: t("admin.reports.capabilities.viewReports"), admin: true, employee: true, note: t("admin.reports.capabilities.limited") },
    { label: t("admin.reports.capabilities.viewActivityLogs"), admin: true, employee: false },
  ];

  const STAT_CONFIG: Partial<Record<keyof AnalyticsSummary["stats"], { label: string; icon: typeof Building2; accent: string }>> = {
    properties: { label: t("admin.overview.pieLabels.properties"), icon: Building2, accent: "text-emerald-400 bg-emerald-400/10" },
    leads: { label: t("admin.overview.pieLabels.leads"), icon: Users2, accent: "text-sky-400 bg-sky-400/10" },
    messages: { label: t("admin.overview.pieLabels.messages"), icon: Mail, accent: "text-amber-400 bg-amber-400/10" },
    users: { label: t("admin.overview.pieLabels.users"), icon: Heart, accent: "text-pink-400 bg-pink-400/10" },
    wishlistItems: { label: t("admin.overview.pieLabels.wishlist"), icon: ClipboardList, accent: "text-purple-400 bg-purple-400/10" },
    totalInvested: { label: t("admin.overview.totalInvested"), icon: CircleDollarSign, accent: "text-luxury-gold bg-luxury-gold/10" },
    actualProfit: { label: t("admin.overview.actualProfit"), icon: CircleDollarSign, accent: "text-emerald-300 bg-emerald-400/10" },
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={BarChart3}
        title={t("admin.reports.title")}
        description={t("admin.reports.description")}
        actions={
          <Button variant="outline" className="gap-2" onClick={handleExportPdf}>
            <Download className="h-4 w-4" />
            {t("admin.reports.exportPdf")}
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
        title={t("admin.reports.recentLeads")}
        description={t("admin.reports.recentLeadsSubtitle")}
        rightSlot={
          <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={handleDownloadCsv} disabled={!recentLeads.length}>
            <Download className="h-4 w-4" />
            {t("admin.reports.downloadCsv")}
          </Button>
        }
      >
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="py-2 font-medium">{t("admin.reports.table.name")}</th>
                <th className="font-medium">{t("admin.reports.table.email")}</th>
                <th className="font-medium">{t("admin.reports.table.status")}</th>
                <th className="font-medium">{t("admin.reports.table.source")}</th>
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
                    {t("admin.reports.table.noneLeads")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminGlassCard>

      <AdminGlassCard
        title={t("admin.reports.userExport.title")}
        description={t("admin.reports.userExport.description")}
        rightSlot={
          <Button
            variant="outline"
            className="gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white"
            onClick={handleDownloadUsersByCountry}
            disabled={!users.length || (countryFilter !== "all" && !users.some((user) => (user.country || "").toLowerCase() === countryFilter.toLowerCase()))}
          >
            <Download className="h-4 w-4" />
            {t("admin.reports.userExport.downloadButton")}
          </Button>
        }
      >
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <label className="text-xs uppercase tracking-wider text-white/50">{t("admin.reports.userExport.countryLabel")}</label>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t("admin.reports.userExport.countryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.reports.userExport.allCountries")}</SelectItem>
                {availableCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-white/60">
            {t("admin.reports.userExport.helper", { count: countryFilter === "all" ? users.length : users.filter((user) => (user.country || "").toLowerCase() === countryFilter.toLowerCase()).length })}
          </p>
        </div>
      </AdminGlassCard>

      <AdminGlassCard
        title={t("admin.reports.roleCapabilities")}
      >
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="py-2 font-medium">{t("admin.reports.table.capability")}</th>
                <th className="font-medium">{t("admin.reports.table.admin")}</th>
                <th className="font-medium">{t("admin.reports.table.employee")}</th>
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
