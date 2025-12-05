import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { CMSSection } from "@/types";

export function useCmsSection<TContent = unknown>(key: string, fallback?: TContent) {
  return useQuery({
    queryKey: ["cms", key],
    queryFn: async () => {
      const { data } = await apiClient.get<{ section: CMSSection<TContent> }>(`/cms/${key}`);
      return data.section.content;
    },
    initialData: fallback,
  });
}
