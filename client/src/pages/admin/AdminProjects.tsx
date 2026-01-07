import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { TrendingProject, Property } from "@/types";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { useToast } from "@/hooks/use-toast";
import uploadImage from "@/lib/uploadImage";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Sparkles } from "lucide-react";

const fetchProjects = async () => {
  const { data } = await apiClient.get<{ projects: TrendingProject[] }>("/projects");
  return data.projects;
};

const initialState = {
  name: "",
  location: "",
  image: "",
  status: "Presale",
  description: "",
  amenities: "",
  completion: "",
  startingPrice: "",
  developer: "",
  property: "",
};

const AdminProjects = () => {
  const { data } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const { data: properties = [] } = useProperties();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formState,
        amenities: formState.amenities.split(",").map((name) => ({ name: name.trim() })).filter((item) => item.name),
        property: formState.property || undefined,
      };
      if (editingId) {
        return apiClient.put(`/projects/${editingId}`, payload);
      }
      return apiClient.post("/projects", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: `Project ${editingId ? "updated" : "created"}` });
      setEditingId(null);
      setFormState(initialState);
    },
    onError: () => toast({ title: "Action failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project removed" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const handleEdit = (project: TrendingProject) => {
    setEditingId(project._id);
    setFormState({
      name: project.name,
      location: project.location,
      image: project.image,
      status: project.status,
      description: project.description,
      amenities: project.amenities.map((a) => a.name).join(", "),
      completion: project.completion,
      startingPrice: project.startingPrice,
      developer: project.developer,
      property: project.property?._id ?? "",
    });
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setFormState((prev) => ({ ...prev, image: url }));
      toast({ title: "Image uploaded" });
    } catch (error) {
      console.error("Trending project image upload failed", error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={Sparkles}
        title="Trending Projects"
        description="Curate the homepage spotlight carousel with premium developments."
      />

      <AdminGlassCard title={editingId ? "Edit Project" : "Add Project"} description="Create or modify a trending project.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input name="name" value={formState.name} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input name="location" value={formState.location} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Input name="status" value={formState.status} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Completion</label>
            <Input name="completion" value={formState.completion} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Starting Price</label>
            <Input name="startingPrice" value={formState.startingPrice} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Developer</label>
            <Input name="developer" value={formState.developer} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Hero Image URL</label>
            <div className="flex gap-2">
              <Input
                name="image"
                value={formState.image}
                onChange={handleChange}
                className="flex-1"
                placeholder="Paste an image URL or use upload"
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Linked Property</label>
            <select
              name="property"
              value={formState.property}
              onChange={handleChange}
              className="w-full h-12 rounded-md border border-white/10 bg-background text-white px-3"
            >
              <option value="">None</option>
              {properties.map((p: Property) => (
                <option key={p._id} value={p._id}>
                  {p.title} — {p.location}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea name="description" value={formState.description} onChange={handleChange} rows={3} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Amenities (comma separated)</label>
            <Textarea name="amenities" value={formState.amenities} onChange={handleChange} rows={2} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            {editingId && (
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={() => {
                setEditingId(null);
                setFormState(initialState);
              }}>
                Cancel
              </Button>
            )}
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="bg-luxury-gold hover:bg-luxury-gold/90 text-black">
              {editingId ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </div>
      </AdminGlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.map((project) => (
          <div key={project._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-2 transition hover:bg-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-semibold text-white">{project.name}</h3>
                <p className="text-white/60 text-sm">{project.location}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border border-white/10" onClick={() => handleEdit(project)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
                    deleteMutation.mutate(project._id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            <p className="text-sm text-white/60">{project.description.slice(0, 140)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProjects;
