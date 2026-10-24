import { describe, expect, it } from "vitest";
import type { OrgNodeResponse } from "../../../shared/models/api/response/coworker-response.model";
import {
  allParentIds,
  ancestorsOf,
  countDescendants,
  expandedToDepth,
  filterOrgTree,
  initialsOf,
} from "./org-chart-utils";

const node = (
  id: string,
  fullName: string,
  positionName = "",
  reports: OrgNodeResponse[] = [],
): OrgNodeResponse => ({ id, fullName, positionName, reports });

// ceo -> (cto -> (dev1, dev2), cfo)
const tree = [
  node("ceo", "Ana Boss", "CEO", [
    node("cto", "Ben Tech", "CTO", [
      node("dev1", "Cara Coder", "Developer"),
      node("dev2", "Dan Coder", "Developer"),
    ]),
    node("cfo", "Eve Money", "CFO"),
  ]),
];

describe("countDescendants", () => {
  it("counts everyone below, not only direct reports", () => {
    expect(countDescendants(tree[0])).toBe(4);
    expect(countDescendants(tree[0].reports[0])).toBe(2);
    expect(countDescendants(tree[0].reports[1])).toBe(0);
  });
});

describe("expandedToDepth", () => {
  it("opens the top two levels by default", () => {
    expect([...expandedToDepth(tree)]).toEqual(["ceo"]);
    expect([...expandedToDepth(tree, 3)].sort()).toEqual(["ceo", "cto"]);
  });
});

describe("allParentIds", () => {
  it("lists every node that has reports", () => {
    expect([...allParentIds(tree)].sort()).toEqual(["ceo", "cto"]);
  });
});

describe("ancestorsOf", () => {
  it("returns the managers above a person, top first", () => {
    expect(ancestorsOf(tree, "dev2")).toEqual(["ceo", "cto"]);
    expect(ancestorsOf(tree, "ceo")).toEqual([]);
  });

  it("returns null for someone not in the chart", () => {
    expect(ancestorsOf(tree, "ghost")).toBeNull();
  });
});

describe("filterOrgTree", () => {
  it("returns the whole tree for an empty search", () => {
    const result = filterOrgTree(tree, "  ");
    expect(result.tree).toBe(tree);
    expect(result.matchedIds.size).toBe(0);
  });

  it("keeps a match together with the managers above it", () => {
    const { tree: pruned, matchedIds } = filterOrgTree(tree, "dan");

    expect([...matchedIds]).toEqual(["dev2"]);
    expect(pruned).toHaveLength(1);
    expect(pruned[0].reports.map((r) => r.id)).toEqual(["cto"]);
    expect(pruned[0].reports[0].reports.map((r) => r.id)).toEqual(["dev2"]);
  });

  it("matches on position too, case-insensitively", () => {
    const { matchedIds } = filterOrgTree(tree, "DEVELOPER");
    expect([...matchedIds].sort()).toEqual(["dev1", "dev2"]);
  });

  it("returns nothing when no one matches", () => {
    expect(filterOrgTree(tree, "zzz").tree).toEqual([]);
  });
});

describe("initialsOf", () => {
  it("uses the first and last word", () => {
    expect(initialsOf("Maria Santos Dela Cruz")).toBe("MC");
    expect(initialsOf("cher")).toBe("C");
    expect(initialsOf("  ")).toBe("?");
  });
});
