import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import uploadImage from "@/lib/uploadImage";
import { getMediaUrl } from "@/lib/media";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminGlassCard from "@/components/admin/AdminGlassCard";
import { Building2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const fetchProperties = async () => {
  const { data } = await apiClient.get<{ properties: Property[] }>("/properties");
  return data.properties;
};

const initialFormState = {
  title: "",
  location: "",
  currencyCode: "EGP",
  priceLabel: "EGP 0",
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
  companyName: "",
  rentPayPeriod: "month",
  isFeatured: false,
};

const STATUS_OPTIONS = ["For Sale", "For Rent"] as const;
const CURRENCY_OPTIONS = [
  { value: "EGP", label: "EGP (Egypt)" },
  { value: "SAR", label: "SAR (Saudi Arabia)" },
  { value: "EUR", label: "EUR (Germany)" },
  { value: "AED", label: "AED (UAE)" },
  { value: "RUB", label: "RUB (Russia)" },
] as const;
const RENT_PAY_PERIOD_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const;

const formatPriceLabel = (currencyCode: string, priceValue: number) => {
  const rounded = Number.isFinite(priceValue) ? Math.round(priceValue) : 0;
  return `${currencyCode} ${rounded.toLocaleString()}`;
};

const AdminProperties = () => {
  const { data, isLoading } = useQuery({ queryKey: ["properties"], queryFn: fetchProperties });
  const { user } = useAuth();
  const canDelete = user?.role === "admin";
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
    const currencyCode = property.currencyCode ?? "EGP";
    setFormState({
      title: property.title,
      location: property.location,
      currencyCode,
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
      companyName: property.companyName ?? "",
      rentPayPeriod: property.rentPayPeriod ?? "month",
      isFeatured: property.isFeatured,
    });
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const type = event.target instanceof HTMLInputElement ? event.target.type : "text";
    const checked = event.target instanceof HTMLInputElement ? event.target.checked : false;
    setFormState((prev) => {
      const nextValue = type === "number" ? Number(value) : type === "checkbox" ? checked : value;
      const nextState: typeof prev = {
        ...prev,
        [name]: nextValue,
      };

      if (name === "priceValue") {
        nextState.priceLabel = formatPriceLabel(String(prev.currencyCode || "EGP"), Number(nextValue));
      }

      return nextState;
    });
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
      <AdminPageHeader
        icon={Building2}
        title="Manage Properties"
        description="Create, update, or archive listings across the portfolio."
      />

      <AdminGlassCard
        eyebrow="Listing details"
        title={editingId ? "Edit property" : "Create property"}
        description="Update core information, pricing, media, and highlights."
      >
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
            <label className="text-sm font-medium">Currency</label>
            <Select
              value={formState.currencyCode}
              onValueChange={(value) =>
                setFormState((prev) => ({
                  ...prev,
                  currencyCode: value,
                  priceLabel: formatPriceLabel(value, prev.priceValue),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Price Value</label>
            <Input type="number" name="priceValue" value={formState.priceValue} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium">Price Label</label>
            <Input name="priceLabel" value={formState.priceLabel} readOnly required />
            <p className="text-xs text-muted-foreground mt-1">Auto-generated from currency and price value.</p>
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
            <label className="text-sm font-medium">Company Name (Optional)</label>
            <Input name="companyName" value={formState.companyName} onChange={handleChange} placeholder="e.g., Crystal DBC" />
            <p className="text-xs text-muted-foreground mt-1">Name of the company listing this property</p>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={formState.status}
              onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formState.status === "For Rent" && (
            <div>
              <label className="text-sm font-medium">Rent paid by</label>
              <Select
                value={formState.rentPayPeriod}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, rentPayPeriod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {RENT_PAY_PERIOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
      </AdminGlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading && <p className="text-white/50">Loading properties...</p>}
        {data?.map((property) => (
          <div key={property._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3 transition hover:bg-white/10">
            {property.coverImage ? (
              <img
                src={getMediaUrl(property.coverImage)}
                alt={property.title}
                className="h-48 w-full object-cover rounded-xl border border-white/10"
              />
            ) : null}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-semibold text-white">{property.title}</h3>
                <p className="text-white/60 text-sm">{property.location}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleEdit(property)} className="bg-white/10 text-white hover:bg-white/20 border border-white/10">
                  Edit
                </Button>
                {canDelete ? (
                  <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(property._id)}>
                    Delete
                  </Button>
                ) : null}
              </div>
            </div>
            <p className="text-luxury-gold font-semibold text-sm">{property.priceLabel}</p>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <span className="px-2 py-1 rounded-full bg-white/10 text-white/80">{property.status}</span>
              {property.isFeatured ? (
                <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400">Featured</span>
              ) : null}
              {property.status === "For Rent" ? (
                <span className="px-2 py-1 rounded-full bg-luxury-gold/10 text-luxury-gold">
                  Paid by {property.rentPayPeriod ?? "month"}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-white/60">{property.description.slice(0, 120)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProperties;
