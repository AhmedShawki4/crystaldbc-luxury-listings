import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { TrendingProject } from "@/types";

export const useTrendingProjects = () =>
  useQuery({
    queryKey: ["trending-projects"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ projects: TrendingProject[] }>("/projects");
      return data.projects;
    },
  });

export default useTrendingProjects;
