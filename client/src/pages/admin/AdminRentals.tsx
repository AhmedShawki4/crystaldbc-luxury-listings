import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { RentalRequest } from "@/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Loader2, Mail, MapPin, Phone, User } from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Approved", "Declined"] as const;
const PAY_PERIODS = ["day", "month", "year"] as const;

type StatusOption = (typeof STATUS_OPTIONS)[number];
type PayPeriod = (typeof PAY_PERIODS)[number];

const fetchRentalRequests = async (filters: { search?: string; status?: string }) => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);

  const query = params.toString();
  const { data } = await apiClient.get<{ requests: RentalRequest[] }>(query ? `/rentals/requests?${query}` : "/rentals/requests");
  return data.requests;
};

const toDateInputValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AdminRentals = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["rental-requests", search, statusFilter],
    queryFn: () => fetchRentalRequests({ search, status: statusFilter }),
  });

  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        status?: StatusOption;
        payPeriod?: PayPeriod;
        priceValue?: string;
        startDate?: string;
        dueDate?: string;
        endDate?: string;
        notes?: string;
      }
    >
  >({});

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<RentalRequest> }) => apiClient.put(`/rentals/requests/${id}`, payload),
    onSuccess: () => {
      toast({ title: "Rental request updated" });
      queryClient.invalidateQueries({ queryKey: ["rental-requests"] });
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/rentals/requests/${id}`),
    onSuccess: () => {
      toast({ title: "Rental request deleted" });
      queryClient.invalidateQueries({ queryKey: ["rental-requests"] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const summary = useMemo(() => {
    const requests = data ?? [];
    return requests.reduce(
      (acc, req) => {
        acc.total += 1;
        if (req.status === "Pending") acc.pending += 1;
        if (req.status === "Approved") acc.approved += 1;
        if (req.status === "Declined") acc.declined += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, declined: 0 }
    );
  }, [data]);

  const updateDraft = (id: string, patch: Partial<(typeof drafts)[string]>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        ...patch,
      },
    }));
  };

  const saveRequest = (request: RentalRequest) => {
    const draft = drafts[request._id] ?? {};

    const payload: Record<string, unknown> = {};
    if (draft.status) payload.status = draft.status;
    if (draft.payPeriod) payload.payPeriod = draft.payPeriod;

    if (draft.priceValue !== undefined) {
      const parsed = Number(draft.priceValue);
      if (Number.isNaN(parsed) || parsed < 0) {
        toast({ title: "Price must be a valid number", variant: "destructive" });
        return;
      }
      payload.priceValue = parsed;
    }

    if (draft.startDate !== undefined) payload.startDate = draft.startDate ? new Date(draft.startDate).toISOString() : "";
    if (draft.dueDate !== undefined) payload.dueDate = draft.dueDate ? new Date(draft.dueDate).toISOString() : "";
    if (draft.endDate !== undefined) payload.endDate = draft.endDate ? new Date(draft.endDate).toISOString() : "";
    if (draft.notes !== undefined) payload.notes = draft.notes;

    mutation.mutate({ id: request._id, payload: payload as Partial<RentalRequest> });
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={Calendar}
        title="Rent Requests"
        description="Approve, decline, or schedule rent payments for For Rent properties."
      />

      <AdminGlassCard
        eyebrow="Filters"
        title="Refine rent requests"
        description="Search and segment by status to focus follow-ups."
        className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      >
        <div className="md:col-span-2 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search</p>
          <Input
            placeholder="Search by property, user, or notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 bg-background"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AdminGlassCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Total</p>
          <p className="text-2xl font-bold text-white">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Pending</p>
          <p className="text-2xl font-bold text-white">{summary.pending}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Approved</p>
          <p className="text-2xl font-bold text-white">{summary.approved}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Declined</p>
          <p className="text-2xl font-bold text-white">{summary.declined}</p>
        </div>
      </div>

      {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}
      {!isLoading && !data?.length && (
        <div className="text-center p-12 text-white/40 bg-white/5 rounded-2xl border border-dashed border-white/10">
          No rent requests found matching your filters.
        </div>
      )}

      <div className="space-y-6">
        {data?.map((request) => {
          const draft = drafts[request._id] ?? {};
          const statusValue = draft.status ?? request.status;
          const payPeriodValue = draft.payPeriod ?? request.payPeriod;
          const priceValue = draft.priceValue ?? String(request.priceValue ?? 0);
          const startDate = draft.startDate ?? toDateInputValue(request.startDate);
          const dueDate = draft.dueDate ?? toDateInputValue(request.dueDate);
          const endDate = draft.endDate ?? toDateInputValue(request.endDate);
          const notes = draft.notes ?? request.notes ?? "";

          return (
            <div key={request._id} className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden transition hover:bg-white/5">
              <div className="bg-white/5 p-6 border-b border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50">
                      <Calendar className="h-3 w-3" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <h3 className="text-xl font-display text-white">{request.property?.title ?? "Unknown property"}</h3>
                    <p className="text-sm text-white/60 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {request.property?.location ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10">
                      Price: EGP {Math.round(request.priceValue ?? 0).toLocaleString()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Pay: {request.payPeriod}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        const ok = window.confirm("Delete this rental request?");
                        if (!ok) return;
                        deleteMutation.mutate(request._id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
                  <span className="inline-flex items-center gap-2"><User className="h-4 w-4 text-white/40" /> {request.user?.name ?? "Unknown"}</span>
                  {request.user?.email && (
                    <a className="inline-flex items-center gap-2 hover:text-white transition-colors" href={`mailto:${request.user.email}`}>
                      <Mail className="h-4 w-4 text-white/40" /> {request.user.email}
                    </a>
                  )}
                  {request.user?.phone && (
                    <a className="inline-flex items-center gap-2 hover:text-white transition-colors" href={`tel:${request.user.phone}`}>
                      <Phone className="h-4 w-4 text-white/40" /> {request.user.phone}
                    </a>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="space-y-4 p-4 rounded-xl bg-black/20 border border-white/5">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-2">Approval</h4>

                    <div className="space-y-1">
                      <label className="text-xs text-white/60">Status</label>
                      <Select value={statusValue} onValueChange={(v) => updateDraft(request._id, { status: v as StatusOption })}>
                        <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-white/60">Pay period</label>
                      <Select value={payPeriodValue} onValueChange={(v) => updateDraft(request._id, { payPeriod: v as PayPeriod })}>
                        <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAY_PERIODS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-white/60">Price (EGP)</label>
                      <Input
                        type="number"
                        className="h-10 bg-white/5 border-white/10 text-white"
                        value={priceValue}
                        onChange={(e) => updateDraft(request._id, { priceValue: e.target.value })}
                      />
                    </div>

                    <Button
                      className="w-full bg-white/10 hover:bg-white/20 text-white"
                      onClick={() => saveRequest(request)}
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>

                  <div className="space-y-4 p-4 rounded-xl bg-black/20 border border-white/5">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-2">Dates</h4>

                    <div className="space-y-1">
                      <label className="text-xs text-white/60">Start date</label>
                      <Input type="date" className="h-10 bg-white/5 border-white/10 text-white" value={startDate} onChange={(e) => updateDraft(request._id, { startDate: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/60">Due date</label>
                      <Input type="date" className="h-10 bg-white/5 border-white/10 text-white" value={dueDate} onChange={(e) => updateDraft(request._id, { dueDate: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/60">End date</label>
                      <Input type="date" className="h-10 bg-white/5 border-white/10 text-white" value={endDate} onChange={(e) => updateDraft(request._id, { endDate: e.target.value })} />
                    </div>

                    <p className="text-xs text-white/40">Start ≤ Due ≤ End</p>
                  </div>

                  <div className="space-y-4 p-4 rounded-xl bg-black/20 border border-white/5">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-2">Notes</h4>
                    <Textarea value={notes} onChange={(e) => updateDraft(request._id, { notes: e.target.value })} className="min-h-[140px] bg-white/5 border-white/10 text-white" />
                    <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={() => saveRequest(request)} disabled={mutation.isPending}>
                      {mutation.isPending ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminRentals;
