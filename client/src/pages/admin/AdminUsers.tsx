import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Role, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Shield, UserRound, Mail, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchActivityLogs } from "@/lib/activityLogs";

const fetchUsers = async () => {
  const { data } = await apiClient.get<{ users: User[] }>("/users");
  return data.users;
};

const roles: Role[] = ["admin", "employee", "user", "guest"];

const AdminUsers = () => {
  const { data } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formState, setFormState] = useState({ name: "", email: "", password: "", role: "user" as Role });
  const [logUser, setLogUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      toast({ title: "User created" });
      setFormState({ name: "", email: "", password: "", role: "user" });
    },
    onError: () => toast({ title: "Failed to create user", variant: "destructive" }),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => apiClient.put(`/users/${id}`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Role updated" });
    },
    onError: () => toast({ title: "Failed to update role", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User removed" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
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
      <AdminPageHeader
        icon={Shield}
        title="User Access"
        description="Administrators can provision or revoke access for teammates."
      />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formState.name} onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={formState.password}
                onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={formState.role} onValueChange={(value: Role) => setFormState((prev) => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={createMutation.isPending}>
                Add User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-display font-semibold">Manage Users</h2>
        <div className="w-full md:w-72">
          <Input
            placeholder="Search by name, email, or role"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="border-border/70">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/70">
                  <UserRound className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Select value={user.role} onValueChange={(value: Role) => updateRole.mutate({ id: user.id, role: value })}>
                  <SelectTrigger className="w-[160px] capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role} className="capitalize">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setLogUser(user)}>
                  <Activity className="mr-2 h-4 w-4" />
                  View Logs
                </Button>
                <Button variant="destructive" onClick={() => deleteMutation.mutate(user.id)}>
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredUsers.length === 0 && (
          <Card className="border-dashed border-border/60">
            <CardContent className="p-6 text-muted-foreground text-sm">
              No users match your search.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={Boolean(logUser)} onOpenChange={(open) => !open && setLogUser(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Activity Logs — {logUser?.name ?? ""}
            </DialogTitle>
          </DialogHeader>
          {loadingLogs ? (
            <p className="text-sm text-muted-foreground">Loading logs...</p>
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
            <p className="text-sm text-muted-foreground">No activity recorded for this user yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
