import apiClient from "@/lib/apiClient";
import type { ActivityLog } from "@/types";

export interface ActivityLogResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  pages: number;
}

export interface ActivityLogParams {
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export const fetchActivityLogs = async (params?: ActivityLogParams) => {
  const { data } = await apiClient.get<ActivityLogResponse>("/activity-logs", {
    params,
  });
  return data;
};
