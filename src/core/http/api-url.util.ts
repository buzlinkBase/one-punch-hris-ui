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
