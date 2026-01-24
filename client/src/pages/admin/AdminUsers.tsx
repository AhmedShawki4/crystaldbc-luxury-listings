import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Role, User } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Shield, UserRound, Mail, Activity, Info, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { fetchActivityLogs } from "@/lib/activityLogs";
import { useTranslation } from "react-i18next";

const fetchUsers = async () => {
  const { data } = await apiClient.get<{ users: User[] }>("/users");
  return data.users;
};

const roles: Role[] = ["admin", "employee", "property-handler", "investor", "user", "guest"];

// Define capabilities for each role based on AdminLayout NAV_ITEMS
const ROLE_CAPABILITIES: Record<Role, string[]> = {
  admin: [
    "overview",
    "properties",
    "rentals",
    "trendingProjects",
    "cms",
    "leads",
    "messages",
    "reports",
    "activityLogs",
    "users",
    "investments",
    "investmentBoxes",
  ],
  employee: [
    "overview",
    "properties",
    "rentals",
    "trendingProjects",
    "cms",
    "leads",
    "messages",
    "reports",
  ],
  "property-handler": [
    "overview",
    "properties",
    "rentals",
  ],
  investor: [],
  user: [],
  guest: [],
};

const ALL_CAPABILITIES = [
  "overview",
  "properties",
  "rentals",
  "trendingProjects",
  "cms",
  "leads",
  "messages",
  "reports",
  "activityLogs",
  "users",
  "investments",
  "investmentBoxes",
] as const;

const AdminUsers = () => {
  const { data } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [formState, setFormState] = useState({ name: "", email: "", password: "", role: "user" as Role, country: "" });
  const [logUser, setLogUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [capabilitiesUser, setCapabilitiesUser] = useState<User | null>(null);

  const selectedUserId = logUser?.id ?? null;
  const { data: selectedLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["activity-logs", { userId: selectedUserId }],
    queryFn: () => fetchActivityLogs({ userId: selectedUserId ?? undefined }),
    enabled: Boolean(selectedUserId),
  });

  const createMutation = useMutation({
    mutationFn: () => apiClient.post("/users", formState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: t("admin.users.toasts.created") });
      setFormState({ name: "", email: "", password: "", role: "user", country: "" });
    },
    onError: () => toast({ title: t("admin.users.toasts.createFailed"), variant: "destructive" }),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => apiClient.put(`/users/${id}`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: t("admin.users.toasts.roleUpdated") });
    },
    onError: () => toast({ title: t("admin.users.toasts.roleUpdateFailed"), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: t("admin.users.toasts.removed") });
    },
    onError: () => toast({ title: t("admin.users.toasts.deleteFailed"), variant: "destructive" }),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createMutation.mutate();
  };

  const filteredUsers = (data ?? []).filter((user) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <AdminPageHeader
          icon={Shield}
          title={t("admin.users.title")}
          description={t("admin.users.description")}
        />
        <Button
          variant="outline"
          onClick={() => setShowCapabilities(true)}
          className="border-white/20 hover:bg-white/10 text-white hover:text-white shrink-0"
        >
          <Info className="mr-2 h-4 w-4" />
          {t("admin.users.roleCapabilities.button")}
        </Button>
      </div>

      <AdminGlassCard
        title={t("admin.users.addTitle")}
        description={t("admin.users.addDescription")}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium">{t("admin.users.labels.name")}</label>
            <Input value={formState.name} onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.users.labels.email")}</label>
            <Input
              type="email"
              value={formState.email}
              onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.users.labels.password")}</label>
            <Input
              type="password"
              value={formState.password}
              onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.users.labels.role")}</label>
            <Select value={formState.role} onValueChange={(value: Role) => setFormState((prev) => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="capitalize">
                    {t(`admin.roles.${role}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{t("admin.users.labels.country")}</label>
            <Input
              value={formState.country}
              onChange={(e) => setFormState((prev) => ({ ...prev, country: e.target.value }))}
              placeholder={t("admin.users.placeholders.country")}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={createMutation.isPending}>
              {t("admin.users.actions.add")}
            </Button>
          </div>
        </form>
      </AdminGlassCard>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-display font-semibold">{t("admin.users.manageTitle")}</h2>
        <div className="w-full md:w-72">
          <Input
            placeholder={t("admin.users.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition hover:bg-white/10">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-white">{user.name}</h3>
                <p className="text-sm text-white/60 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={user.role} onValueChange={(value: Role) => updateRole.mutate({ id: user.id, role: value })}>
                <SelectTrigger className="w-[160px] capitalize bg-white/5 border-white/10 text-white">
                  <SelectValue>{t(`admin.roles.${user.role}`)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {t(`admin.roles.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setCapabilitiesUser(user)} className="border-white/20 hover:bg-white/10 text-white hover:text-white">
                <Shield className="mr-2 h-4 w-4" />
                {t("admin.users.actions.capabilities")}
              </Button>
              <Button variant="outline" onClick={() => setLogUser(user)} className="border-white/20 hover:bg-white/10 text-white hover:text-white">
                <Activity className="mr-2 h-4 w-4" />
                {t("admin.users.actions.viewLogs")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!window.confirm(t("admin.users.confirmDelete", { name: user.name || user.email }))) return;
                  deleteMutation.mutate(user.id);
                }}
              >
                {t("admin.users.actions.remove")}
              </Button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 p-6 text-white/50 text-sm text-center">
            {t("admin.users.empty")}
          </div>
        )}
      </div>

      <Dialog open={Boolean(logUser)} onOpenChange={(open) => !open && setLogUser(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("admin.users.logsTitle")} — {logUser?.name ?? ""}
            </DialogTitle>
          </DialogHeader>
          {loadingLogs ? (
            <p className="text-sm text-muted-foreground">{t("admin.users.loadingLogs")}</p>
          ) : selectedLogs && selectedLogs.logs.length > 0 ? (
            <div className="space-y-3">
              {selectedLogs.logs.map((log) => (
                <div key={log._id} className="rounded-2xl border border-border/60 p-3">
                  <p className="text-sm font-semibold text-primary">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()} • {log.entityType ?? "General"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("admin.users.noActivity")}</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Individual User Capabilities Dialog */}
      <Dialog open={Boolean(capabilitiesUser)} onOpenChange={(open) => !open && setCapabilitiesUser(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              <Shield className="h-5 w-5 text-luxury-gold" />
              {capabilitiesUser?.name || capabilitiesUser?.email}
            </DialogTitle>
            <DialogDescription>
              {t("admin.users.userCapabilities.description", { role: capabilitiesUser ? t(`admin.roles.${capabilitiesUser.role}`) : "" })}
            </DialogDescription>
          </DialogHeader>
          
          {capabilitiesUser && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border">
                <span className="text-sm font-medium text-muted-foreground">{t("admin.users.labels.role")}:</span>
                <span className="text-sm font-semibold capitalize">{t(`admin.roles.${capabilitiesUser.role}`)}</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{t("admin.users.userCapabilities.canAccess")}</h4>
                {ROLE_CAPABILITIES[capabilitiesUser.role].length > 0 ? (
                  <div className="grid gap-2">
                    {ALL_CAPABILITIES.map((capability) => {
                      const hasCapability = ROLE_CAPABILITIES[capabilitiesUser.role].includes(capability);
                      return (
                        <div
                          key={capability}
                          className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                            hasCapability
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-muted/20 border-border/50 opacity-50"
                          }`}
                        >
                          {hasCapability ? (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-500/20">
                              <Check className="h-3 w-3 text-green-400" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10">
                              <X className="h-3 w-3 text-red-400/50" />
                            </span>
                          )}
                          <span className={`text-sm ${hasCapability ? "font-medium" : "text-muted-foreground"}`}>
                            {t(`admin.users.roleCapabilities.capabilities.${capability}`)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/20 border border-border/50">
                    {t("admin.users.userCapabilities.noAccess")}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Capabilities Dialog */}
      <Dialog open={showCapabilities} onOpenChange={setShowCapabilities}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              <Shield className="h-5 w-5 text-luxury-gold" />
              {t("admin.users.roleCapabilities.title")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.users.roleCapabilities.description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    {t("admin.users.roleCapabilities.capability")}
                  </th>
                  {(["admin", "employee", "property-handler", "investor", "user", "guest"] as Role[]).map((role) => (
                    <th key={role} className="text-center py-3 px-2 font-semibold text-muted-foreground min-w-[80px]">
                      {t(`admin.roles.${role}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_CAPABILITIES.map((capability) => (
                  <tr key={capability} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      {t(`admin.users.roleCapabilities.capabilities.${capability}`)}
                    </td>
                    {(["admin", "employee", "property-handler", "investor", "user", "guest"] as Role[]).map((role) => {
                      const hasCapability = ROLE_CAPABILITIES[role].includes(capability);
                      return (
                        <td key={role} className="text-center py-3 px-2">
                          {hasCapability ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-500/20">
                              <Check className="h-4 w-4 text-green-400" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500/10">
                              <X className="h-4 w-4 text-red-400/50" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
            <h4 className="font-semibold mb-2 text-sm">{t("admin.users.roleCapabilities.notes.title")}</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• {t("admin.users.roleCapabilities.notes.admin")}</li>
              <li>• {t("admin.users.roleCapabilities.notes.employee")}</li>
              <li>• {t("admin.users.roleCapabilities.notes.propertyHandler")}</li>
              <li>• {t("admin.users.roleCapabilities.notes.others")}</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
