import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Lead } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Leads</h1>
        <p className="text-muted-foreground">Track register interest submissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.map((lead) => (
          <Card key={lead._id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{lead.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                  {lead.phoneNumber && (
                    <p className="text-sm text-muted-foreground">{lead.phoneNumber}</p>
                  )}
                </div>
                {canDelete && (
                  <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(lead._id)}>
                    Delete
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Interest: {lead.interestedIn || "N/A"} — Source: {lead.source}
              </p>
              <p className="text-sm">{lead.message}</p>
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
