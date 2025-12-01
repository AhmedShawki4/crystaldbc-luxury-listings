import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import uploadImage from "@/lib/uploadImage";
import { getMediaUrl } from "@/lib/media";

const fetchProperties = async () => {
  const { data } = await apiClient.get<{ properties: Property[] }>("/properties");
  return data.properties;
};

const initialFormState = {
  title: "",
  location: "",
  priceLabel: "",
  priceValue: 0,
  beds: 0,
  baths: 0,
  sqftLabel: "",
  sqftValue: 0,
  coverImage: "",
  gallery: "",
  description: "",
  features: "",
  type: "",
  status: "For Sale",
  isFeatured: false,
};

const AdminProperties = () => {
  const { data, isLoading } = useQuery({ queryKey: ["properties"], queryFn: fetchProperties });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const galleryItems = useMemo(
    () =>
      formState.gallery
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [formState.gallery]
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formState,
        gallery: formState.gallery.split(",").map((item) => item.trim()).filter(Boolean),
        features: formState.features.split(",").map((item) => item.trim()).filter(Boolean),
      };
      if (editingId) {
        return apiClient.put(`/properties/${editingId}`, payload);
      }
      return apiClient.post("/properties", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({ title: `Property ${editingId ? "updated" : "created"}` });
      setFormState(initialFormState);
      setEditingId(null);
    },
    onError: () => {
      toast({ title: "Operation failed", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({ title: "Property removed" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const handleEdit = (property: Property) => {
    setEditingId(property._id);
    setFormState({
      title: property.title,
      location: property.location,
      priceLabel: property.priceLabel,
      priceValue: property.priceValue,
      beds: property.beds,
      baths: property.baths,
      sqftLabel: property.sqftLabel,
      sqftValue: property.sqftValue,
      coverImage: property.coverImage,
      gallery: property.gallery.join(", "),
      description: property.description,
      features: property.features.join(", "),
      type: property.type,
      status: property.status,
      isFeatured: property.isFeatured,
    });
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploadingCover(true);
    try {
      const url = await uploadImage(file);
      setFormState((prev) => ({ ...prev, coverImage: url }));
      toast({ title: "Cover image uploaded" });
    } catch (error) {
      console.error("Cover upload failed", error);
      toast({ title: "Cover upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (!files.length) {
      return;
    }
    setUploadingGallery(true);
    try {
      const urls = await Promise.all(files.map((file) => uploadImage(file)));
      setFormState((prev) => {
        const existing = prev.gallery
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const combined = [...existing, ...urls];
        return { ...prev, gallery: combined.join(", ") };
      });
      toast({ title: `${urls.length} gallery image${urls.length > 1 ? "s" : ""} uploaded` });
    } catch (error) {
      console.error("Gallery upload failed", error);
      toast({ title: "Gallery upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploadingGallery(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Manage Properties</h1>
        <p className="text-muted-foreground">Create, update, or remove listings.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input name="title" value={formState.title} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input name="location" value={formState.location} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Price Label</label>
              <Input name="priceLabel" value={formState.priceLabel} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Price Value</label>
              <Input type="number" name="priceValue" value={formState.priceValue} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Beds</label>
              <Input type="number" name="beds" value={formState.beds} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Baths</label>
              <Input type="number" name="baths" value={formState.baths} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Sqft Label</label>
              <Input name="sqftLabel" value={formState.sqftLabel} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Sqft Value</label>
              <Input type="number" name="sqftValue" value={formState.sqftValue} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-medium">Cover Image</label>
              <Input
                name="coverImage"
                value={formState.coverImage}
                onChange={handleChange}
                placeholder="Paste an image URL or upload a file"
                required
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                  className="text-sm"
                />
                {uploadingCover && <p className="text-xs text-muted-foreground">Uploading...</p>}
              </div>
              {formState.coverImage && (
                <img
                  src={getMediaUrl(formState.coverImage)}
                  alt="Cover preview"
                  className="h-40 w-full object-cover rounded-md border border-border"
                />
              )}
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-medium">Gallery</label>
              <Textarea
                name="gallery"
                value={formState.gallery}
                onChange={handleChange}
                placeholder="Paste URLs or use the uploader below"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  disabled={uploadingGallery}
                  className="text-sm"
                />
                {uploadingGallery && <p className="text-xs text-muted-foreground">Uploading...</p>}
              </div>
              {galleryItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {galleryItems.map((item) => (
                    <img
                      key={item}
                      src={getMediaUrl(item)}
                      alt="Gallery preview"
                      className="h-24 w-full object-cover rounded border border-border"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" value={formState.description} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Features (comma separated)</label>
              <Textarea name="features" value={formState.features} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Input name="type" value={formState.type} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Input name="status" value={formState.status} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Featured</label>
              <div className="flex items-center space-x-3 mt-2">
                <input type="checkbox" name="isFeatured" checked={formState.isFeatured} onChange={handleChange} />
                <span className="text-sm text-muted-foreground">Show on homepage</span>
              </div>
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              {editingId && (
                <Button type="button" variant="outline" onClick={() => {
                  setFormState(initialFormState);
                  setEditingId(null);
                }}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={mutation.isPending}>
                {editingId ? "Save Changes" : "Create Property"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading && <p className="text-muted-foreground">Loading properties...</p>}
        {data?.map((property) => (
          <Card key={property._id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-semibold">{property.title}</h3>
                  <p className="text-muted-foreground text-sm">{property.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleEdit(property)}>
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => deleteMutation.mutate(property._id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">{property.priceLabel}</p>
              <p className="text-sm">{property.description.slice(0, 120)}...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminProperties;
