import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { ContactMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { Inbox, UserRound, Mail, Phone, MessageCircle, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const fetchMessages = async ({ search, status }: { search: string; status: string }) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  const url = params.toString() ? `/messages?${params.toString()}` : "/messages";
  const { data } = await apiClient.get<{ messages: ContactMessage[] }>(url);
  return data.messages;
};

const AdminMessages = () => {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const { data } = useQuery({ queryKey: ["messages", search, statusFilter], queryFn: () => fetchMessages({ search, status: statusFilter }) });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const canDelete = user?.role === "admin";

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch(`/messages/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast({ title: t("admin.messages.toasts.updated") });
    },
    onError: () => toast({ title: t("admin.messages.toasts.updateFailed"), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast({ title: t("admin.messages.toasts.deleted") });
    },
    onError: () => toast({ title: t("admin.messages.toasts.deleteFailed"), variant: "destructive" }),
  });

  const statusBadge: Record<string, string> = {
    new: "bg-sky-500/10 text-sky-400",
    responded: "bg-emerald-500/10 text-emerald-400",
    archived: "bg-slate-500/10 text-slate-300",
  };

  const formatStatus = (status: string) => t(`admin.statuses.${status}`);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Inbox}
        title={t("admin.messages.title")}
        description={t("admin.messages.description")}
      />

      <AdminGlassCard
        title={t("admin.messages.allTitle")}
        description={t("admin.messages.allDescription")}
      >
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <Input
              placeholder={t("admin.messages.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[420px]"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">{t("admin.common.status")}</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder={t("admin.common.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.common.all")}</SelectItem>
                  <SelectItem value="new">{t("admin.statuses.new")}</SelectItem>
                  <SelectItem value="responded">{t("admin.statuses.responded")}</SelectItem>
                  <SelectItem value="archived">{t("admin.statuses.archived")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                      {formatStatus(message.status)}
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
                      if (!window.confirm(t("admin.messages.confirmDelete"))) return;
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
                    {t("admin.messages.messageLabel")}
                  </span>
                  {message.message}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-white/50">{t("admin.common.status")}</label>
                <div className="w-full sm:w-48">
                  <Select
                    value={message.status}
                    onValueChange={(value) => updateMutation.mutate({ id: message._id, status: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder={t("admin.messages.selectStatus")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{t("admin.statuses.new")}</SelectItem>
                      <SelectItem value="responded">{t("admin.statuses.responded")}</SelectItem>
                      <SelectItem value="archived">{t("admin.statuses.archived")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          {!data?.length && (
            <div className="p-10 text-center text-white/40">
              {t("admin.messages.empty")}
            </div>
          )}
        </div>
      </AdminGlassCard>
    </div>
  );
};

export default AdminMessages;
