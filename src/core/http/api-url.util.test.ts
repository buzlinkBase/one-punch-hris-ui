import { describe, expect, it } from "vitest";
import { buildHubUrl } from "./api-url.util";

describe("buildHubUrl", () => {
  // Production: relative prefixes + VITE_API_URL host. Without the host, the browser resolved
  // "auth/hubs/tenant" against the current page -- hris.onepunch.site/portal/auth/hubs/tenant
  // -- and the frontend answered 405, so no hub ever connected.
  it("prefixes a relative service prefix with the API host", () => {
    expect(
      buildHubUrl("auth", "hubs/tenant", "https://api.onepunch.site/"),
    ).toBe("https://api.onepunch.site/auth/hubs/tenant");
    expect(
      buildHubUrl("hrms", "/hubs/notifications", "https://api.onepunch.site"),
    ).toBe("https://api.onepunch.site/hrms/hubs/notifications");
  });

  // Local dev: prefixes are already absolute and VITE_API_URL is empty.
  it("leaves an absolute prefix untouched", () => {
    expect(buildHubUrl("https://localhost:7077", "hubs/tenant", "")).toBe(
      "https://localhost:7077/hubs/tenant",
    );
    expect(
      buildHubUrl(
        "https://localhost:7237/",
        "hubs/notifications",
        "https://x/",
      ),
    ).toBe("https://localhost:7237/hubs/notifications");
  });

  it("falls back to the bare path when there is no API host", () => {
    expect(buildHubUrl("auth", "hubs/tenant", "  ")).toBe("auth/hubs/tenant");
  });
});
