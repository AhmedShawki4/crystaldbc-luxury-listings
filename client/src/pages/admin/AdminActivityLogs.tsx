import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { ActivityLog } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

const fetchLogs = async () => {
  const { data } = await apiClient.get<{ logs: ActivityLog[] }>("/activity-logs");
  return data.logs;
};

const formatDate = (value: string) => new Date(value).toLocaleString();

const AdminActivityLogs = () => {
  const { data, isLoading } = useQuery({ queryKey: ["activity-logs"], queryFn: fetchLogs });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading activity logs...</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">No activity recorded yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Activity Logs</h1>
        <p className="text-muted-foreground">Audit trail of key CMS actions.</p>
      </div>

      <div className="space-y-4">
        {data.map((log) => (
          <Card key={log._id}>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold">{log.user?.name ?? "System"}</p>
                  <p className="text-sm text-muted-foreground">{log.user?.email ?? "-"}</p>
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
