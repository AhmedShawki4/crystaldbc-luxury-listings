import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { TrendingProject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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

      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
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
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Linked Property ID</label>
            <Input name="property" value={formState.property} onChange={handleChange} placeholder="Optional" />
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
              <Button variant="outline" onClick={() => {
                setEditingId(null);
                setFormState(initialState);
              }}>
                Cancel
              </Button>
            )}
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {editingId ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.map((project) => (
          <Card key={project._id}>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-semibold">{project.name}</h3>
                  <p className="text-muted-foreground text-sm">{project.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(project)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(project._id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{project.description.slice(0, 140)}...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminProjects;
