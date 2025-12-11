import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Investment } from "@/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BadgeDollarSign, CheckCircle, CircleDollarSign, Loader2, Mail, Phone, ShieldAlert, ShieldCheck, Trash2, User, Calendar } from "lucide-react";

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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
        <div className="sm:col-span-2 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Search</p>
          <Input
            placeholder="Search by property, user, or notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Status</p>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {STATUS_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Payment</p>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="h-11"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {PAYMENT_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Requests</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{summary.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-500" />{summary.pending}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Approved</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" />{summary.approved}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fully Paid</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold flex items-center gap-2"><BadgeDollarSign className="h-4 w-4 text-luxury-gold" />{summary.paid}</CardContent>
        </Card>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading investments...</p>}
      {!isLoading && !data?.length && <p className="text-muted-foreground">No investment requests yet.</p>}

      <div className="space-y-4">
        {data?.map((investment) => (
          <Card key={investment._id} className="border-border/70">
            <CardHeader className="pb-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{new Date(investment.createdAt).toLocaleDateString()}</p>
                  <CardTitle className="text-xl font-display">{investment.property.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{investment.property.location}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">EGP {investment.investmentAmount.toLocaleString()}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-200">Expected Profit: EGP {Math.round(investment.expectedProfit || investment.investmentAmount * (investment.roiPercentage / 100)).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><User className="h-4 w-4" />{investment.user?.name ?? "Unknown"}</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" />{investment.user?.role}</span>
                {investment.user?.email && (
                  <a className="inline-flex items-center gap-2 text-primary" href={`mailto:${investment.user.email}`}>
                    <Mail className="h-4 w-4" />{investment.user.email}
                  </a>
                )}
                {investment.user?.phone && (
                  <a className="inline-flex items-center gap-2 text-primary" href={`tel:${investment.user.phone}`}>
                    <Phone className="h-4 w-4" />{investment.user.phone}
                  </a>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 text-sm">
                <div className="rounded-lg border border-border/70 p-3">
                  <p className="text-muted-foreground">Investment Amount</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      value={amountInputs[investment._id] ?? investment.investmentAmount.toString()}
                      onChange={(e) => setAmountInputs((prev) => ({ ...prev, [investment._id]: e.target.value }))}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleInvestmentAmountSave(investment)} disabled={mutation.isPending}>
                      Save
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border border-border/70 p-3">
                  <p className="text-muted-foreground">Status</p>
                  <Select value={investment.status} onValueChange={(val) => handleStatusChange(investment, val as Investment["status"])}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border border-border/70 p-3">
                  <p className="text-muted-foreground">Payment Status</p>
                  <Select value={investment.paymentStatus} onValueChange={(val) => handlePaymentStatusChange(investment, val as Investment["paymentStatus"])}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border border-border/70 p-3">
                  <p className="text-muted-foreground">ROI %</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      value={roiInputs[investment._id] ?? investment.roiPercentage.toString()}
                      onChange={(e) => setRoiInputs((prev) => ({ ...prev, [investment._id]: e.target.value }))}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleRoiSave(investment)} disabled={mutation.isPending}>
                      Save
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border border-border/70 p-3">
                  <p className="text-muted-foreground">Payout Date</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="date"
                      value={payoutInputs[investment._id] ?? (investment.payoutDate ? investment.payoutDate.slice(0, 10) : "")}
                      onChange={(e) => setPayoutInputs((prev) => ({ ...prev, [investment._id]: e.target.value }))}
                    />
                    <Button variant="outline" size="sm" onClick={() => handlePayoutDateSave(investment)} disabled={mutation.isPending}>
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" /> Monthly payout due date</p>
                </div>
                <div className="rounded-lg border border-border/70 p-3">
                  <p className="text-muted-foreground">Amount Received</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      value={receivedInputs[investment._id] ?? investment.amountReceived.toString()}
                      onChange={(e) => setReceivedInputs((prev) => ({ ...prev, [investment._id]: e.target.value }))}
                    />
                    <Button size="sm" onClick={() => handleReceivedSave(investment)} disabled={mutation.isPending}>
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-border/70 p-3">
                  <p className="text-muted-foreground">Expected Profit</p>
                  <p className="text-lg font-semibold">EGP {Math.round(investment.expectedProfit || investment.investmentAmount * (investment.roiPercentage / 100)).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Auto-calculated when approved & paid</p>
                </div>
                <div className="rounded-lg border border-border/70 p-3">
                  <p className="text-muted-foreground">Notes</p>
                  <Textarea
                    value={notesInputs[investment._id] ?? investment.notes ?? ""}
                    onChange={(e) => setNotesInputs((prev) => ({ ...prev, [investment._id]: e.target.value }))}
                    className="mt-2"
                  />
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" onClick={() => handleNotesSave(investment)} disabled={mutation.isPending}>
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
                <div className="rounded-lg border border-dashed border-border/60 p-3">
                  <p>Payment Status</p>
                  <p className="text-base font-semibold text-foreground">{investment.paymentStatus}</p>
                </div>
                <div className="rounded-lg border border-dashed border-border/60 p-3">
                  <p>Status</p>
                  <p className="text-base font-semibold text-foreground">{investment.status}</p>
                </div>
                <div className="rounded-lg border border-dashed border-border/60 p-3">
                  <p>Property Price Label</p>
                  <p className="text-base font-semibold text-foreground">{investment.property.priceLabel}</p>
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="inline-flex items-center gap-2"
                    onClick={() => deleteMutation.mutate(investment._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(mutation.isPending || deleteMutation.isPending) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving changes...
        </div>
      )}
    </div>
  );
};

export default AdminInvestments;
