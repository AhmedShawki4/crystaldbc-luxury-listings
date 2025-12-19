import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { ContactMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { Inbox, UserRound, Mail, Phone, MessageCircle, Trash2 } from "lucide-react";

const fetchMessages = async () => {
  const { data } = await apiClient.get<{ messages: ContactMessage[] }>("/messages");
  return data.messages;
};

const AdminMessages = () => {
  const { data } = useQuery({ queryKey: ["messages"], queryFn: fetchMessages });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const canDelete = user?.role === "admin";

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch(`/messages/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast({ title: "Message status updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast({ title: "Message deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const statusBadge: Record<string, string> = {
    new: "bg-sky-500/10 text-sky-400",
    responded: "bg-emerald-500/10 text-emerald-400",
    archived: "bg-slate-500/10 text-slate-300",
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Inbox}
        title="Inbox"
        description="Review and respond to client enquiries captured across the site."
      />

      <AdminGlassCard
        title="All Messages"
        description="Manage your incoming communications."
      >
        <div className="flex flex-col gap-4 mt-4">
          {data?.map((message) => (
            <div
              key={message._id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4 transition hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-lg font-display font-semibold text-white">
                    <UserRound className="h-5 w-5" />
                    {message.name}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide">
                    <span className={`rounded-full px-3 py-1 ${statusBadge[message.status] ?? "bg-white/5 text-white/70"}`}>
                      {message.status}
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-white/50">{message.page}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Mail className="h-4 w-4" />
                    {message.email}
                  </div>
                  {message.phone && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Phone className="h-4 w-4" />
                      {message.phone}
                    </div>
                  )}
                </div>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      if (!window.confirm("Delete this message? This cannot be undone.")) return;
                      deleteMutation.mutate(message._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {message.message && (
                <p className="rounded-xl bg-black/20 p-4 text-sm text-white/70">
                  <span className="mb-2 flex items-center gap-2 text-luxury-gold">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </span>
                  {message.message}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-white/50">Status</label>
                <div className="w-full sm:w-48">
                  <Select
                    value={message.status}
                    onValueChange={(value) => updateMutation.mutate({ id: message._id, status: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          {!data?.length && (
            <div className="p-10 text-center text-white/40">
              No messages yet.
            </div>
          )}
        </div>
      </AdminGlassCard>
    </div>
  );
};

export default AdminMessages;
