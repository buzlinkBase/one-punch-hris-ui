import { describe, expect, it } from "vitest";
import {
  clientAfterSiteChange,
  clientSiteMismatch,
  siteAfterClientChange,
  siteOptionGroups,
  type SiteLite,
} from "./site-client-options.util";

const site = (
  id: string,
  code: string,
  name: string,
  clientId?: string,
  clientName?: string,
): SiteLite => ({ id, code, name, clientId, clientName });

const sites: SiteLite[] = [
  site("agwa", "A1", "Agwa", "wf", "Waterfront"),
  site("hotel", "A2", "Hotel", "wf", "Waterfront"),
  site("mall", "B1", "Mall", "sm", "SM"),
  site("warehouse", "W1", "Warehouse"),
  site("astra", "W2", "Astra"),
];

const names: Record<string, string> = { wf: "Waterfront", sm: "SM" };
const nameOf = (id: string) => names[id] ?? id;

describe("siteOptionGroups", () => {
  it("with a client: only its own sites, never another client's or the untied ones", () => {
    const groups = siteOptionGroups(sites, "wf", nameOf);

    expect(groups.map((g) => g.label)).toEqual(["Waterfront sites"]);
    expect(groups[0].options.map((o) => o.value)).toEqual(["agwa", "hotel"]);
  });

  it("keeps an already-picked site of another client listed, under 'Currently set'", () => {
    const groups = siteOptionGroups(sites, "sm", nameOf, "agwa");

    expect(groups.map((g) => g.label)).toEqual(["SM sites", "Currently set"]);
    expect(groups[1].options.map((o) => o.value)).toEqual(["agwa"]);
  });

  it("keeps an already-picked untied site listed, under 'Currently set'", () => {
    const groups = siteOptionGroups(sites, "sm", nameOf, "warehouse");

    expect(groups.map((g) => g.label)).toEqual(["SM sites", "Currently set"]);
  });

  it("does not list a picked site twice when it already fits", () => {
    const groups = siteOptionGroups(sites, "wf", nameOf, "agwa");

    const listed = groups.flatMap((g) => g.options);

    expect(listed.filter((o) => o.value === "agwa")).toHaveLength(1);
  });

  it("with a client that has no sites of its own: nothing to list", () => {
    expect(siteOptionGroups(sites, "new-client", nameOf)).toEqual([]);
  });

  it("with no client: every site, grouped under its client, untied last", () => {
    const groups = siteOptionGroups(sites, null, nameOf);

    expect(groups.map((g) => g.label)).toEqual([
      "SM",
      "Waterfront",
      "Not tied to a client",
    ]);
    expect(groups.flatMap((g) => g.options)).toHaveLength(sites.length);
  });

  it("labels an option as 'code - name'", () => {
    expect(siteOptionGroups(sites, "sm", nameOf)[0].options[0].label).toBe(
      "B1 - Mall",
    );
  });
});

describe("siteAfterClientChange", () => {
  it("keeps a site that belongs to the new client", () => {
    expect(siteAfterClientChange(sites, "wf", "agwa")).toBe("agwa");
  });

  it("drops a site that isn't tied to any client", () => {
    expect(siteAfterClientChange(sites, "sm", "warehouse")).toBeNull();
  });

  it("drops a site that belongs to a different client", () => {
    expect(siteAfterClientChange(sites, "sm", "agwa")).toBeNull();
  });

  it("keeps the site when the client is cleared", () => {
    expect(siteAfterClientChange(sites, null, "agwa")).toBe("agwa");
  });
});

describe("clientAfterSiteChange", () => {
  it("fills the client in from a site that belongs to one", () => {
    expect(clientAfterSiteChange(sites, "mall", null)).toBe("sm");
  });

  it("leaves the chosen client alone for a site that isn't tied to one", () => {
    expect(clientAfterSiteChange(sites, "warehouse", "wf")).toBe("wf");
  });

  it("leaves the client alone when the site is cleared", () => {
    expect(clientAfterSiteChange(sites, null, "wf")).toBe("wf");
  });
});

describe("clientSiteMismatch", () => {
  it("returns the site when its client differs from the picked one", () => {
    expect(clientSiteMismatch(sites, "sm", "agwa")?.id).toBe("agwa");
  });

  it("is null when they agree, the site is untied, or either is empty", () => {
    expect(clientSiteMismatch(sites, "wf", "agwa")).toBeNull();
    expect(clientSiteMismatch(sites, "wf", "warehouse")).toBeNull();
    expect(clientSiteMismatch(sites, null, "agwa")).toBeNull();
    expect(clientSiteMismatch(sites, "wf", null)).toBeNull();
  });
});
