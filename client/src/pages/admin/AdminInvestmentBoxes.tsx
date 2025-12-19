import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      toast({ title: `Investment box ${editingId ? "updated" : "created"}` });
      setFormState(initialFormState);
      setEditingId(null);
    },
    onError: () => toast({ title: "Operation failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/investment-boxes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-investment-boxes"] });
      toast({ title: "Investment box deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
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
        title="Investment Boxes"
        description="Create and manage the investment boxes available to users."
      />

      <AdminGlassCard title={editingId ? "Edit Investment Box" : "Create Investment Box"} description="Configure investment opportunities.">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formState.name}
              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Short description shown to users"
            />
          </div>

          <div>
            <label className="text-sm font-medium">ROI (%)</label>
            <Input
              type="number"
              value={formState.roiPercentage}
              onChange={(e) => setFormState((prev) => ({ ...prev, roiPercentage: Number(e.target.value) }))}
              min={0}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Minimum Investment</label>
            <Input
              type="number"
              value={formState.minInvestmentAmount}
              onChange={(e) => setFormState((prev) => ({ ...prev, minInvestmentAmount: Number(e.target.value) }))}
              min={0}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Active</label>
            <div className="flex items-center space-x-3 mt-2">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(e) => setFormState((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-white/10 bg-white/5"
              />
              <span className="text-sm text-white/60">Show to users</span>
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
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={mutation.isPending} className="bg-luxury-gold hover:bg-luxury-gold/90 text-black">
              {editingId ? "Save Changes" : "Create Box"}
            </Button>
          </div>
        </form>
      </AdminGlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading && <p className="text-white/60">Loading investment boxes...</p>}
        {data?.map((box) => (
          <div key={box._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3 transition hover:bg-white/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-display font-semibold text-white">{box.name}</h3>
                {box.description ? <p className="text-sm text-white/60">{box.description}</p> : null}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border border-white/10" onClick={() => handleEdit(box)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const ok = window.confirm("Delete this investment box?");
                    if (!ok) return;
                    deleteMutation.mutate(box._id);
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              <span className="px-2 py-1 rounded-full bg-white/10 text-white border border-white/10">ROI {box.roiPercentage}%</span>
              <span className="px-2 py-1 rounded-full bg-white/10 text-white border border-white/10">Min {Math.round(box.minInvestmentAmount).toLocaleString()}</span>
              <span className={`px-2 py-1 rounded-full border ${box.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                {box.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInvestmentBoxes;
