import { API_PREFIX } from "./api-url.util";

type ServicePrefixes = Readonly<Record<string, string | undefined>>;

/** Key used when a failed request can't be matched to one of the known services. */
export const UNKNOWN_SERVICE = "server";

// How each service reads in the connection banner ("Can't reach the client portal service").
const SERVICE_LABELS: Readonly<Record<string, string>> = {
  auth: "sign-in",
  hrms: "HR",
  adms: "biometric (ADMS)",
  tenants: "company",
  notifications: "notification",
  clientPortal: "client portal",
};

// Services whose outages the connection banner ignores. The client portal isn't in use yet, so
// its being down is expected and the HRIS works fine without it.
const UNMONITORED_SERVICES: ReadonlySet<string> = new Set(["clientPortal"]);

/** Whether an outage of this service should show the connection banner. */
export function isMonitoredService(key: string): boolean {
  return !UNMONITORED_SERVICES.has(key);
}

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

/**
 * Which service a request went to, from its URL: every service call is built as
 * `{prefix}/api/{version}/...` (see buildApiUrl), where the prefix is an absolute address in
 * development and a relative segment (`hrms`, `auth`, ...) behind the gateway in production.
 */
export function serviceKeyOf(
  url: string | undefined,
  prefixes: ServicePrefixes = API_PREFIX,
): string {
  const target = trimSlashes(url ?? "");
  if (!target) return UNKNOWN_SERVICE;
  for (const [key, prefix] of Object.entries(prefixes)) {
    const p = trimSlashes(prefix ?? "");
    if (!p) continue;
    if (target === p || target.startsWith(`${p}/`)) return key;
  }
  return UNKNOWN_SERVICE;
}

export function serviceLabel(key: string): string {
  return SERVICE_LABELS[key] ?? key;
}

/** "Can't reach the client portal service." / "Can't reach the HR and client portal services." */
export function unreachableMessage(keys: readonly string[]): string {
  const named = keys.filter((k) => k !== UNKNOWN_SERVICE).map(serviceLabel);
  if (named.length === 0) return "Can't reach the server.";
  const list =
    named.length === 1
      ? named[0]
      : `${named.slice(0, -1).join(", ")} and ${named[named.length - 1]}`;
  return `Can't reach the ${list} ${named.length === 1 ? "service" : "services"}.`;
}
