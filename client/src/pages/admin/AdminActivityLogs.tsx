import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ClipboardList, ShieldCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchActivityLogs } from "@/lib/activityLogs";

const formatDate = (value: string) => new Date(value).toLocaleString();

const AdminActivityLogs = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs", { search }],
    queryFn: () => fetchActivityLogs({ search: search || undefined }),
  });

  const logs = data?.logs ?? [];

  if (isLoading) {
    return <p className="text-muted-foreground">Loading activity logs...</p>;
  }

  if (!logs.length) {
    return <p className="text-muted-foreground">No activity recorded yet.</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ClipboardList}
        title="Activity Logs"
        description="Audit every sensitive action performed across the dashboard."
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search action, entity, or ID"
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {logs.length} of {data?.total ?? logs.length} entries
        </p>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log._id} className="border-border/70">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/70">
                    <ShieldCheck className="h-5 w-5 text-luxury-gold" />
                  </span>
                  <div>
                    <p className="font-semibold">{log.user?.name ?? "System"}</p>
                    <p className="text-sm text-muted-foreground">{log.user?.email ?? "-"}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(log.createdAt)}</p>
              </div>
              <p className="text-primary font-medium">{log.action}</p>
              <p className="text-sm text-muted-foreground">
                {log.entityType ? `${log.entityType} • ${log.entityId ?? "—"}` : "General"}
              </p>
              {log.metadata && (
                <pre className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminActivityLogs;
