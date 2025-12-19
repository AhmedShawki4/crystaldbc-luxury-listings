import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Investment } from "@/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { BadgeDollarSign, CheckCircle, CircleDollarSign, Loader2, Mail, Phone, ShieldAlert, ShieldCheck, Trash2, User, Calendar, MapPin } from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"] as const;
const PAYMENT_OPTIONS = ["Not Paid", "Partially Paid", "Paid"] as const;

const fetchInvestments = async (filters: { search?: string; status?: string; paymentStatus?: string }) => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.paymentStatus && filters.paymentStatus !== "all") params.set("paymentStatus", filters.paymentStatus);
  const query = params.toString();
  const { data } = await apiClient.get<{ investments: Investment[] }>(query ? `/investments?${query}` : "/investments");
  return data.investments;
};

const AdminInvestments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["investments", search, statusFilter, paymentFilter],
    queryFn: () => fetchInvestments({ search, status: statusFilter, paymentStatus: paymentFilter }),
  });
  const [receivedInputs, setReceivedInputs] = useState<Record<string, string>>({});
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({});
  const [roiInputs, setRoiInputs] = useState<Record<string, string>>({});
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});
  const [payoutInputs, setPayoutInputs] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Investment> }) => apiClient.put(`/investments/${id}`, payload),
    onSuccess: () => {
      toast({ title: "Investment updated" });
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/investments/${id}`),
    onSuccess: () => {
      toast({ title: "Investment deleted" });
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const increaseReviewMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approve" | "reject" }) =>
      apiClient.post(`/investments/${id}/increase-request/review`, { decision }),
    onSuccess: () => {
      toast({ title: "Increase request updated" });
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: () => toast({ title: "Failed to update increase request", variant: "destructive" }),
  });

  const summary = useMemo(() => {
    if (!data?.length) return { total: 0, pending: 0, approved: 0, rejected: 0, paid: 0 };
    return data.reduce(
      (acc, inv) => {
        acc.total += 1;
        if (inv.status === "Pending") acc.pending += 1;
        if (inv.status === "Approved") acc.approved += 1;
        if (inv.status === "Rejected") acc.rejected += 1;
        if (inv.paymentStatus === "Paid") acc.paid += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, paid: 0 }
    );
  }, [data]);

  const handleStatusChange = (investment: Investment, status: Investment["status"]) => {
    mutation.mutate({ id: investment._id, payload: { status } });
  };

  const handlePaymentStatusChange = (investment: Investment, paymentStatus: Investment["paymentStatus"]) => {
    mutation.mutate({ id: investment._id, payload: { paymentStatus } });
  };

  const handleRoiSave = (investment: Investment) => {
    const raw = roiInputs[investment._id];
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    mutation.mutate({ id: investment._id, payload: { roiPercentage: parsed } });
  };

  const handleInvestmentAmountSave = (investment: Investment) => {
    const raw = amountInputs[investment._id];
    const parsed = Number(raw);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    mutation.mutate({ id: investment._id, payload: { investmentAmount: parsed } });
  };

  const handlePayoutDateSave = (investment: Investment) => {
    const value = payoutInputs[investment._id];
    if (!value) return;
    mutation.mutate({ id: investment._id, payload: { payoutDate: value } });
  };

  const handleNotesSave = (investment: Investment) => {
    mutation.mutate({ id: investment._id, payload: { notes: notesInputs[investment._id] || "" } });
  };

  const handleReceivedSave = (investment: Investment) => {
    const raw = receivedInputs[investment._id];
    const parsed = Number(raw);
    if (Number.isNaN(parsed) || parsed < 0) return;
    mutation.mutate({ id: investment._id, payload: { amountReceived: parsed } });
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={CircleDollarSign}
        title="Investments"
        description="Manage user investment requests, approvals, and funding."
      />

      <AdminGlassCard
        eyebrow="Filters"
        title="Refine investments"
        description="Search and segment by status and payment state."
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
      >
        <div className="md:col-span-2 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search</p>
          <Input
            placeholder="Search by investment box, property, user, or notes"
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
              {STATUS_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment</p>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              {PAYMENT_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </AdminGlassCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Total Requests</p>
          <p className="text-2xl font-bold text-white">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Pending</p>
          <p className="text-2xl font-bold text-white flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-amber-500" />{summary.pending}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Approved</p>
          <p className="text-2xl font-bold text-white flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-500" />{summary.approved}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Fully Paid</p>
          <p className="text-2xl font-bold text-white flex items-center gap-2"><BadgeDollarSign className="h-5 w-5 text-luxury-gold" />{summary.paid}</p>
        </div>
      </div>

      {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}
      {!isLoading && !data?.length && <div className="text-center p-12 text-white/40 bg-white/5 rounded-2xl border border-dashed border-white/10">No investment requests found matching your filters.</div>}

      <div className="space-y-6">
        {data?.map((investment) => (
          (() => {
            const isIncreasePending = investment.increaseRequest?.status === "Pending";
            const requestLabel = isIncreasePending ? "Request to increase" : "New investment";
            const requestedAdditional = Number(investment.increaseRequest?.additionalAmount) || 0;
            return (
              <div key={investment._id} className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden transition hover:bg-white/5">
                <div className="bg-white/5 p-6 border-b border-white/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50">
                        <Calendar className="h-3 w-3" />
                        {new Date(investment.createdAt).toLocaleDateString()}
                      </div>
                      <h3 className="text-xl font-display text-white">
                        {investment.investmentBox?.name ?? investment.property?.title ?? "Unknown Investment"}
                      </h3>
                      {investment.property?.location ? (
                        <p className="text-sm text-white/60 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {investment.property.location}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={
                          isIncreasePending
                            ? "px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/10"
                        }
                      >
                        {requestLabel}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                        Inv: EGP {investment.investmentAmount.toLocaleString()}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Exp: EGP {Math.round(investment.expectedProfit || investment.investmentAmount * (investment.roiPercentage / 100)).toLocaleString()}
                      </span>
                      {isIncreasePending && requestedAdditional > 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          + EGP {Math.round(requestedAdditional).toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
                    <span className="inline-flex items-center gap-2"><User className="h-4 w-4 text-white/40" /> {investment.user?.name ?? "Unknown"}</span>
                    {investment.user?.email && (
                      <a className="inline-flex items-center gap-2 hover:text-white transition-colors" href={`mailto:${investment.user.email}`}>
                        <Mail className="h-4 w-4 text-white/40" /> {investment.user.email}
                      </a>
                    )}
                    {investment.user?.phone && (
                      <a className="inline-flex items-center gap-2 hover:text-white transition-colors" href={`tel:${investment.user.phone}`}>
                        <Phone className="h-4 w-4 text-white/40" /> {investment.user.phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {isIncreasePending ? (
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-amber-400">Increase request</div>
                          <div className="text-sm text-white/70">
                            Requested additional: <span className="font-medium text-white">EGP {Math.round(requestedAdditional).toLocaleString()}</span>
                          </div>
                          {investment.increaseRequest?.note ? (
                            <div className="text-sm text-white/60">Note: {investment.increaseRequest.note}</div>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                            onClick={() => {
                              if (!window.confirm("Approve this increase request?")) return;
                              increaseReviewMutation.mutate({ id: investment._id, decision: "approve" });
                            }}
                            disabled={increaseReviewMutation.isPending}
                          >
                            Approve Increase
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (!window.confirm("Reject this increase request?")) return;
                              increaseReviewMutation.mutate({ id: investment._id, decision: "reject" });
                            }}
                            disabled={increaseReviewMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {/* Investment Details Group */}
                    <div className="space-y-4 p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-2">Financials</h4>

                      <div className="space-y-1">
                        <label className="text-xs text-white/60">Investment Amount</label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            className="h-9 bg-white/5 border-white/10 text-white"
                            value={amountInputs[investment._id] ?? investment.investmentAmount.toString()}
                            onChange={(e) => setAmountInputs((prev) => ({ ...prev, [investment._id]: e.target.value }))}
                          />
                          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={() => handleInvestmentAmountSave(investment)} disabled={mutation.isPending}>Save</Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-white/60">ROI %</label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            className="h-9 bg-white/5 border-white/10 text-white"
                            value={roiInputs[investment._id] ?? investment.roiPercentage.toString()}
                            onChange={(e) => setRoiInputs((prev) => ({ ...prev, [investment._id]: e.target.value }))}
                          />
                          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={() => handleRoiSave(investment)} disabled={mutation.isPending}>Save</Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-white/60">Amount Received</label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            className="h-9 bg-white/5 border-white/10 text-white"
                            value={receivedInputs[investment._id] ?? investment.amountReceived.toString()}
                            onChange={(e) => setReceivedInputs((prev) => ({ ...prev, [investment._id]: e.target.value }))}
                          />
                          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={() => handleReceivedSave(investment)} disabled={mutation.isPending}>Save</Button>
                        </div>
                      </div>
                    </div>

                    {/* Status Group */}
                    <div className="space-y-4 p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-2">Status & Schedule</h4>

                      <div className="space-y-1">
                        <label className="text-xs text-white/60">Approval Status</label>
                        <Select value={investment.status} onValueChange={(val) => handleStatusChange(investment, val as Investment["status"])}>
                          <SelectTrigger className="h-9 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-white/60">Payment Status</label>
                        <Select value={investment.paymentStatus} onValueChange={(val) => handlePaymentStatusChange(investment, val as Investment["paymentStatus"])}>
                          <SelectTrigger className="h-9 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PAYMENT_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-white/60">Payout Date</label>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            className="h-9 bg-white/5 border-white/10 text-white"
                            value={payoutInputs[investment._id] ?? (investment.payoutDate ? investment.payoutDate.slice(0, 10) : "")}
                            onChange={(e) => setPayoutInputs((prev) => ({ ...prev, [investment._id]: e.target.value }))}
                          />
                          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={() => handlePayoutDateSave(investment)} disabled={mutation.isPending}>Save</Button>
                        </div>
                      </div>
                    </div>

                    {/* Notes Group */}
                    <div className="space-y-4 p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-2">Notes & Actions</h4>
                      <div className="flex-1 space-y-1">
                        <Textarea
                          value={notesInputs[investment._id] ?? investment.notes ?? ""}
                          onChange={(e) => setNotesInputs((prev) => ({ ...prev, [investment._id]: e.target.value }))}
                          placeholder="Add internal notes..."
                          className="min-h-[120px] resize-none bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => {
                            if (!window.confirm("Delete this investment? This cannot be undone.")) return;
                            deleteMutation.mutate(investment._id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:text-white hover:bg-white/10"
                          onClick={() => handleNotesSave(investment)}
                          disabled={mutation.isPending}
                        >
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ))}
      </div>

      {(mutation.isPending || deleteMutation.isPending || increaseReviewMutation.isPending) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving changes...
        </div>
      )}
    </div>
  );
};

export default AdminInvestments;
