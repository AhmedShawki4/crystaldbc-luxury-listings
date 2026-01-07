import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Lead } from "@/types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { Users2, Mail, Phone, UserRound, MessageCircle, Trash2 } from "lucide-react";

const fetchLeads = async ({ search, status }: { search: string; status: string }) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  const url = params.toString() ? `/leads?${params.toString()}` : "/leads";
  const { data } = await apiClient.get<{ leads: Lead[] }>(url);
  return data.leads;
};

const AdminLeads = () => {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const { data } = useQuery({ queryKey: ["leads", search, statusFilter], queryFn: () => fetchLeads({ search, status: statusFilter }) });
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

      <AdminGlassCard
        eyebrow="Pipeline"
        title="All leads"
        description="Review, triage, and update lead statuses."
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="md:col-span-2 flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-2">
          <Input
            placeholder="Search by name, email, phone, message"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-[420px]"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {data?.map((lead) => (
          <div key={lead._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4 transition hover:bg-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-white">{lead.fullName}</h3>
                <div className="mt-2 space-y-1 text-sm text-white/60">
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
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[lead.status] ?? "bg-white/10 text-white/50"
                    }`}
                >
                  {lead.status}
                </span>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      if (!window.confirm("Delete this lead? This cannot be undone.")) return;
                      deleteMutation.mutate(lead._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {lead.message && (
              <p className="rounded-xl bg-black/20 p-3 text-sm text-white/70">
                <span className="inline-flex items-center gap-2 font-medium text-luxury-gold">
                  <MessageCircle className="h-4 w-4" />
                  Message
                </span>
                : {lead.message}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/50">Status</label>
              <Select
                value={lead.status}
                onValueChange={(value) => updateMutation.mutate({ id: lead._id, status: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
          </div>
        ))}
      </AdminGlassCard>
    </div>
  );
};

export default AdminLeads;
