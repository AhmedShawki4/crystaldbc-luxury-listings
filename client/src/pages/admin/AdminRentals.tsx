import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { RentalRequest } from "@/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-card p-4 rounded-lg border shadow-sm">
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
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 text-2xl font-bold">{summary.total}</CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 text-2xl font-bold">{summary.pending}</CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 text-2xl font-bold">{summary.approved}</CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Declined</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 text-2xl font-bold">{summary.declined}</CardContent>
        </Card>
      </div>

      {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {!isLoading && !data?.length && (
        <div className="text-center p-12 text-muted-foreground bg-accent/5 rounded-lg border border-dashed">
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
            <Card key={request._id} className="overflow-hidden border-border/60 hover:border-border transition-colors shadow-sm">
              <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <CardTitle className="text-xl font-display text-primary">{request.property?.title ?? "Unknown property"}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {request.property?.location ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      Price: EGP {Math.round(request.priceValue ?? 0).toLocaleString()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
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

                <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><User className="h-4 w-4 text-primary/60" /> {request.user?.name ?? "Unknown"}</span>
                  {request.user?.email && (
                    <a className="inline-flex items-center gap-2 hover:text-primary transition-colors" href={`mailto:${request.user.email}`}>
                      <Mail className="h-4 w-4 text-primary/60" /> {request.user.email}
                    </a>
                  )}
                  {request.user?.phone && (
                    <a className="inline-flex items-center gap-2 hover:text-primary transition-colors" href={`tel:${request.user.phone}`}>
                      <Phone className="h-4 w-4 text-primary/60" /> {request.user.phone}
                    </a>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="space-y-4 p-4 rounded-lg bg-background border border-border/50">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Approval</h4>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Status</label>
                      <Select value={statusValue} onValueChange={(v) => updateDraft(request._id, { status: v as StatusOption })}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Pay period</label>
                      <Select value={payPeriodValue} onValueChange={(v) => updateDraft(request._id, { payPeriod: v as PayPeriod })}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAY_PERIODS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Price (EGP)</label>
                      <Input
                        type="number"
                        className="h-10"
                        value={priceValue}
                        onChange={(e) => updateDraft(request._id, { priceValue: e.target.value })}
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => saveRequest(request)}
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>

                  <div className="space-y-4 p-4 rounded-lg bg-background border border-border/50">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Dates</h4>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Start date</label>
                      <Input type="date" className="h-10" value={startDate} onChange={(e) => updateDraft(request._id, { startDate: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Due date</label>
                      <Input type="date" className="h-10" value={dueDate} onChange={(e) => updateDraft(request._id, { dueDate: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">End date</label>
                      <Input type="date" className="h-10" value={endDate} onChange={(e) => updateDraft(request._id, { endDate: e.target.value })} />
                    </div>

                    <p className="text-xs text-muted-foreground">Start ≤ Due ≤ End</p>
                  </div>

                  <div className="space-y-4 p-4 rounded-lg bg-background border border-border/50">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h4>
                    <Textarea value={notes} onChange={(e) => updateDraft(request._id, { notes: e.target.value })} className="min-h-[140px]" />
                    <Button variant="outline" className="w-full" onClick={() => saveRequest(request)} disabled={mutation.isPending}>
                      {mutation.isPending ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminRentals;
