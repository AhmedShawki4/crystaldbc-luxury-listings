import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import apiClient from "@/lib/apiClient";
import type { WishlistItem } from "@/types";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getMediaUrl } from "@/lib/media";

const fetchWishlist = async () => {
  const { data } = await apiClient.get<{ items: WishlistItem[] }>("/wishlist");
  return data.items;
};

const Wishlist = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ["wishlist"], queryFn: fetchWishlist });

  const removeMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/wishlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({ title: "Removed from wishlist" });
    },
    onError: () => {
      toast({ title: "Failed to remove", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen pt-20 pb-12">
      <section className="bg-muted/30 py-16 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-display font-bold text-primary">My Wishlist</h1>
          <p className="text-muted-foreground mt-3">Save properties you love and revisit them anytime.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <p className="text-muted-foreground">Loading wishlist...</p>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item) => (
              <Card key={item._id} className="flex flex-col">
                <CardHeader className="p-0">
                  <img
                    src={getMediaUrl(item.property.coverImage)}
                    alt={item.property.title}
                    className="h-56 w-full object-cover rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col gap-3">
                  <div>
                    <h3 className="text-xl font-display font-semibold text-primary">
                      {item.property.title}
                    </h3>
                    <p className="text-muted-foreground">{item.property.location}</p>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{item.note || "No notes added."}</p>
                  <div className="flex items-center justify-between gap-3">
                    <Link to={`/property/${item.property._id}`} className="text-primary font-semibold">
                      View Details
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeMutation.mutate(item._id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-display font-semibold mb-2">No saved properties yet</h3>
            <p className="text-muted-foreground mb-6">
              Browse our listings and add properties to your wishlist for quick access later.
            </p>
            <Button asChild>
              <Link to="/listings">Explore Listings</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
