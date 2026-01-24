import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { CMSSection } from "@/types";

export function useCmsSection<TContent = unknown>(key: string, fallback?: TContent) {
  return useQuery({
    queryKey: ["cms", key],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{ section: CMSSection<TContent> }>(`/cms/${key}`);
        return data.section.content;
      } catch (error) {
        // If section not found, return fallback
        return fallback as TContent;
      }
    },
    placeholderData: fallback,
    staleTime: 1000 * 30, // Cache for 30 seconds
    refetchOnWindowFocus: true, // Refetch when user comes back to the page
  });
}
