import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Lead } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Users2, Mail, Phone, UserRound, MessageCircle, Trash2 } from "lucide-react";

const fetchLeads = async () => {
  const { data } = await apiClient.get<{ leads: Lead[] }>("/leads");
  return data.leads;
};

const AdminLeads = () => {
  const { data } = useQuery({ queryKey: ["leads"], queryFn: fetchLeads });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const canDelete = user?.role === "admin";

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.put(`/leads/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead updated" });
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead deleted" });
    },
    onError: () => toast({ title: "Deletion failed", variant: "destructive" }),
  });

  const statusStyles: Record<string, string> = {
    new: "bg-sky-500/10 text-sky-400",
    contacted: "bg-amber-500/10 text-amber-400",
    "in-progress": "bg-indigo-500/10 text-indigo-400",
    closed: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Users2}
        title="Lead Management"
        description="Track register-interest submissions and nurture opportunities."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.map((lead) => (
          <Card key={lead._id} className="border-border/70">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-display font-semibold text-primary">{lead.fullName}</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{lead.email}</span>
                    </div>
                    {lead.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{lead.phoneNumber}</span>
                      </div>
                    )}
                    {lead.interestedIn && (
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4" />
                        <span className="capitalize">{lead.interestedIn}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      statusStyles[lead.status] ?? "bg-slate-500/10 text-slate-300"
                    }`}
                  >
                    {lead.status}
                  </span>
                  {canDelete && (
                    <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(lead._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {lead.message && (
                <p className="rounded-2xl bg-muted/50 p-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 font-medium text-primary">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </span>
                  : {lead.message}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select
                  value={lead.status}
                  onValueChange={(value) => updateMutation.mutate({ id: lead._id, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminLeads;
