import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Property } from "@/types";

export interface PropertyFilters {
  search?: string;
  type?: string;
  location?: string;
  status?: string;
  minBeds?: number;
  priceMin?: number;
  priceMax?: number;
  featured?: boolean;
  limit?: number;
  sort?: string;
  exclude?: string;
}

const buildParams = (filters: PropertyFilters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (typeof value === "boolean") {
      if (value) {
        params.set(key, "true");
      }
      return;
    }

    params.set(key, String(value));
  });

  return params;
};

export const useProperties = (filters: PropertyFilters = {}) =>
  useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      const params = buildParams(filters);
      const query = params.toString();
      const url = query ? `/properties?${query}` : "/properties";
      const { data } = await apiClient.get<{ properties: Property[] }>(url);
      return data.properties;
    },
  });

export default useProperties;
