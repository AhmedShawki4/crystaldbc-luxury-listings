import { API_BASE_URL } from "./apiClient";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const stripApiSuffix = (value: string) => value.replace(/\/api\/?$/, "");

const API_ORIGIN = stripTrailingSlash(stripApiSuffix(API_BASE_URL));
const ASSETS_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_ASSETS_URL ? String(import.meta.env.VITE_ASSETS_URL) : API_ORIGIN
);

export const getMediaUrl = (input?: string) => {
  if (!input) {
    return "";
  }
  if (/^https?:\/\//i.test(input) || input.startsWith("data:")) {
    return input;
  }
  const normalized = input.startsWith("/") ? input : `/${input}`;
  return `${ASSETS_BASE_URL}${normalized}`;
};
