import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/apiClient";
import type { InvestmentBox } from "@/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";

const fetchBoxes = async () => {
  const { data } = await apiClient.get<{ boxes: InvestmentBox[] }>("/investment-boxes/all");
  return data.boxes;
};

const initialFormState = {
  name: "",
  description: "",
  roiPercentage: 0,
  minInvestmentAmount: 0,
  isActive: true,
};

const AdminInvestmentBoxes = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin-investment-boxes"], queryFn: fetchBoxes });

  const [formState, setFormState] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formState,
        name: formState.name.trim(),
        description: formState.description.trim(),
        roiPercentage: Number(formState.roiPercentage) || 0,
        minInvestmentAmount: Number(formState.minInvestmentAmount) || 0,
        isActive: Boolean(formState.isActive),
      };

      if (editingId) {
        return apiClient.put(`/investment-boxes/${editingId}`, payload);
      }
      return apiClient.post("/investment-boxes", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-investment-boxes"] });
      toast({ title: editingId ? t("admin.investmentBoxes.toasts.updated") : t("admin.investmentBoxes.toasts.created") });
      setFormState(initialFormState);
      setEditingId(null);
    },
    onError: () => toast({ title: t("admin.investmentBoxes.toasts.operationFailed"), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/investment-boxes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-investment-boxes"] });
      toast({ title: t("admin.investmentBoxes.toasts.deleted") });
    },
    onError: () => toast({ title: t("admin.investmentBoxes.toasts.deleteFailed"), variant: "destructive" }),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      toast({ title: t("admin.investmentBoxes.validation.nameRequired"), variant: "destructive" });
      return;
    }
    mutation.mutate();
  };

  const handleEdit = (box: InvestmentBox) => {
    setEditingId(box._id);
    setFormState({
      name: box.name,
      description: box.description ?? "",
      roiPercentage: box.roiPercentage,
      minInvestmentAmount: box.minInvestmentAmount,
      isActive: box.isActive,
    });
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={Package}
        title={t("admin.investmentBoxes.headerTitle")}
        description={t("admin.investmentBoxes.headerDescription")}
      />

      <AdminGlassCard title={editingId ? t("admin.investmentBoxes.formTitleEdit") : t("admin.investmentBoxes.formTitleCreate")} description={t("admin.investmentBoxes.formDescription")}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">{t("admin.investmentBoxes.labels.name")}</label>
            <Input
              value={formState.name}
              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">{t("admin.investmentBoxes.labels.description")}</label>
            <Textarea
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={t("admin.investmentBoxes.placeholders.description")}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("admin.investmentBoxes.labels.roiPercent")}</label>
            <Input
              type="number"
              value={formState.roiPercentage}
              onChange={(e) => setFormState((prev) => ({ ...prev, roiPercentage: Number(e.target.value) }))}
              min={0}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("admin.investmentBoxes.labels.minInvestment")}</label>
            <Input
              type="number"
              value={formState.minInvestmentAmount}
              onChange={(e) => setFormState((prev) => ({ ...prev, minInvestmentAmount: Number(e.target.value) }))}
              min={0}
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t("admin.investmentBoxes.labels.active")}</label>
            <div className="flex items-center space-x-3 mt-2">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(e) => setFormState((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-white/10 bg-white/5"
              />
              <span className="text-sm text-white/60">{t("admin.investmentBoxes.labels.showToUsers")}</span>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-3 justify-end">
            {editingId && (
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setFormState(initialFormState);
                  setEditingId(null);
                }}
              >
                {t("admin.investmentBoxes.actions.cancel")}
              </Button>
            )}
            <Button type="submit" disabled={mutation.isPending} className="bg-luxury-gold hover:bg-luxury-gold/90 text-black">
              {editingId ? t("admin.investmentBoxes.actions.saveChanges") : t("admin.investmentBoxes.actions.create")}
            </Button>
          </div>
        </form>
      </AdminGlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading && <p className="text-white/60">{t("admin.investmentBoxes.loading")}</p>}
        {data?.map((box) => (
          <div key={box._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3 transition hover:bg-white/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-display font-semibold text-white">{box.name}</h3>
                {box.description ? <p className="text-sm text-white/60">{box.description}</p> : null}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border border-white/10" onClick={() => handleEdit(box)}>
                  {t("admin.investmentBoxes.actions.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const ok = window.confirm(t("admin.investmentBoxes.confirm.delete"));
                    if (!ok) return;
                    deleteMutation.mutate(box._id);
                  }}
                  disabled={deleteMutation.isPending}
                >
                  {t("admin.investmentBoxes.actions.delete")}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              <span className="px-2 py-1 rounded-full bg-white/10 text-white border border-white/10">{t("admin.investmentBoxes.badges.roi", { value: box.roiPercentage })}</span>
              <span className="px-2 py-1 rounded-full bg-white/10 text-white border border-white/10">{t("admin.investmentBoxes.badges.minInvestment", { value: Math.round(box.minInvestmentAmount).toLocaleString() })}</span>
              <span className={`px-2 py-1 rounded-full border ${box.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                {box.isActive ? t("admin.investmentBoxes.badges.active") : t("admin.investmentBoxes.badges.inactive")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInvestmentBoxes;
