/** Service prefixes, sourced from `VITE_PREFIX_*` env vars (see `.env`). */
export const API_PREFIX = {
  auth: import.meta.env.VITE_PREFIX_AUTH,
  hrms: import.meta.env.VITE_PREFIX_HRMS,
  adms: import.meta.env.VITE_PREFIX_ADMS,
  tenants: import.meta.env.VITE_PREFIX_TENANTS,
  notifications: import.meta.env.VITE_PREFIX_NOTIFICATIONS,
} as const;

/** Builds `{prefix}/api/{version}/{resource}` for a module's service calls. */
export function buildApiUrl(prefix: string, resource: string): string {
  return `${prefix}/api/${import.meta.env.VITE_API_VERSION}/${resource}`;
}

/**
 * Absolute URL for a SignalR hub. Hubs don't go through axios, so they never get axios's
 * `baseURL` (VITE_API_URL) prepended. In production the prefixes are relative (`auth`, `hrms`),
 * so a bare `auth/hubs/tenant` resolved against the *current page* — e.g.
 * `hris.onepunch.site/portal/auth/hubs/tenant` — and the frontend host answered 405. In local
 * dev the prefixes are already absolute (`https://localhost:7077`) and VITE_API_URL is empty,
 * so this is a no-op there.
 */
export function buildHubUrl(
  prefix: string,
  hubPath: string,
  apiBaseUrl: string = import.meta.env.VITE_API_URL ?? "",
): string {
  const path = `${prefix.replace(/\/+$/, "")}/${hubPath.replace(/^\/+/, "")}`;
  if (/^https?:\/\//i.test(prefix) || !apiBaseUrl.trim()) return path;
  return `${apiBaseUrl.trim().replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
