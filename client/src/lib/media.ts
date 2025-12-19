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
  // If the path is root-relative and points to backend uploads, prefix with the assets base URL
  // e.g. "/uploads/xyz.jpg" -> "http://api-origin/uploads/xyz.jpg"
  if (input.startsWith("/uploads/")) {
    return `${ASSETS_BASE_URL}${input}`;
  }

  // If the path is root-relative but NOT an uploads path, treat it as a client public asset
  // served by the Vite dev server / production static host (e.g. "/lobby.jpeg").
  if (input.startsWith("/")) {
    return input;
  }

  // Otherwise it's a relative path stored by the backend (no leading slash), prefix assets base.
  const normalized = `/${input}`;
  return `${ASSETS_BASE_URL}${normalized}`;
};
