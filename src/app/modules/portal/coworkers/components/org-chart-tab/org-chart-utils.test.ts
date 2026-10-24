import { describe, expect, it } from "vitest";
import type {
  OrgNodeKind,
  OrgNodeResponse,
} from "../../../shared/models/api/response/coworker-response.model";
import {
  allParentIds,
  ancestorsOf,
  expandedToDepth,
  filterOrgTree,
  initialsOf,
} from "./org-chart-utils";
import { buildFlow, layoutFlow } from "./org-chart-layout";

const node = (
  id: string,
  kind: OrgNodeKind,
  name: string,
  children: OrgNodeResponse[] = [],
  positionName = "",
): OrgNodeResponse => ({
  id,
  kind,
  name,
  positionName,
  level: 0,
  headCount: 1,
  children,
});

// company -> (ops -> (night -> sam), sales -> (hana -> amy))
const tree = [
  node("co", "company", "Acme", [
    node("ops", "department", "Operations", [
      node("night", "section", "Night Shift", [
        node("sam", "employee", "Sam Lee", [], "Operator"),
      ]),
    ]),
    node("sales", "department", "Sales", [
      node(
        "hana",
        "employee",
        "Hana Cruz",
        [node("amy", "employee", "Amy Tan", [], "Rep")],
        "Head",
      ),
    ]),
  ]),
];

describe("expandedToDepth", () => {
  it("opens the company and its departments by default", () => {
    expect([...expandedToDepth(tree)].sort()).toEqual(["co", "ops", "sales"]);
  });

  it("opens only the roots at depth 2", () => {
    expect([...expandedToDepth(tree, 2)]).toEqual(["co"]);
  });
});

describe("allParentIds", () => {
  it("lists every node that has children", () => {
    expect([...allParentIds(tree)].sort()).toEqual([
      "co",
      "hana",
      "night",
      "ops",
      "sales",
    ]);
  });
});

describe("ancestorsOf", () => {
  it("returns the boxes above a person, nearest last", () => {
    expect(ancestorsOf(tree, "sam")).toEqual(["co", "ops", "night"]);
  });

  it("returns null for someone not in the chart", () => {
    expect(ancestorsOf(tree, "ghost")).toBeNull();
  });
});

describe("filterOrgTree", () => {
  it("returns the tree untouched for a blank search", () => {
    expect(filterOrgTree(tree, "  ").tree).toBe(tree);
  });

  it("keeps a matching person with the boxes above", () => {
    const { tree: pruned, matchedIds } = filterOrgTree(tree, "amy");
    expect([...matchedIds]).toEqual(["amy"]);
    expect([...allParentIds(pruned)].sort()).toEqual(["co", "hana", "sales"]);
  });

  it("matches on position", () => {
    expect([...filterOrgTree(tree, "operator").matchedIds]).toEqual(["sam"]);
  });

  it("keeps everything under a matching department", () => {
    const { tree: pruned } = filterOrgTree(tree, "sales");
    const sales = pruned[0].children[0];
    expect(sales.children[0].children[0].name).toBe("Amy Tan");
  });
});

describe("buildFlow / layoutFlow", () => {
  const options = (expanded: string[]) => ({
    expanded: new Set(expanded),
    matchedIds: new Set<string>(),
    meId: "sam",
    onToggle: () => undefined,
  });

  it("draws only the boxes under expanded parents", () => {
    const { nodes, edges } = buildFlow(tree, options(["co"]));
    expect(nodes.map((n) => n.id)).toEqual(["co", "ops", "sales"]);
    expect(edges.map((e) => e.id)).toEqual(["co->ops", "co->sales"]);
  });

  it("uses unit boxes for units and person boxes for people", () => {
    const { nodes } = buildFlow(tree, options(["co", "ops", "night"]));
    expect(nodes.find((n) => n.id === "ops")?.type).toBe("unit");
    const sam = nodes.find((n) => n.id === "sam");
    expect(sam?.type).toBe("person");
    expect(sam?.data.isMe).toBe(true);
  });

  it("lays children out below their parent", () => {
    const flow = buildFlow(tree, options(["co"]));
    const placed = layoutFlow(flow.nodes, flow.edges);
    const y = (id: string) => placed.find((n) => n.id === id)!.position.y;
    expect(y("ops")).toBeGreaterThan(y("co"));
    expect(y("ops")).toBe(y("sales"));
  });
});

describe("initialsOf", () => {
  it("uses the first and last word", () => {
    expect(initialsOf("Maria Dela Cruz")).toBe("MC");
  });

  it("handles a single name and an empty one", () => {
    expect(initialsOf("Cher")).toBe("C");
    expect(initialsOf("  ")).toBe("?");
  });
});
