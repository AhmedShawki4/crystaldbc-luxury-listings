import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

const useWishlistActions = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (propertyId: string) => apiClient.post("/wishlist", { property: propertyId }),
    onSuccess: () => {
      toast({ title: "Added to wishlist", description: "Review it anytime from your dashboard." });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: () => {
      toast({ title: "Wishlist update failed", description: "Please try again.", variant: "destructive" });
    },
    onSettled: () => setActiveId(null),
  });

  const addToWishlist = (propertyId?: string) => {
    if (!propertyId) {
      toast({
        title: "Link required",
        description: "This project isn't linked to a live property yet.",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({ title: "Sign in to save", description: "Log in to keep track of your favorite homes." });
      navigate("/auth/login");
      return;
    }

    setActiveId(propertyId);
    mutation.mutate(propertyId);
  };

  return {
    addToWishlist,
    isAdding: mutation.isPending,
    activeId,
  };
};

export default useWishlistActions;
