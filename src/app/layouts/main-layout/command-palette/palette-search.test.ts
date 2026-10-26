import { describe, expect, it } from "vitest";
import type { NavItem } from "@/shared/constants/navigation.const";
import {
  collectPalettePages,
  searchPaletteEmployees,
  searchPalettePages,
} from "./palette-search";

const ITEMS: NavItem[] = [
  { key: "d", label: "Dashboard", path: "/dashboard" },
  {
    key: "apps",
    label: "Applications",
    type: "group",
    children: [
      { key: "l", label: "Leave", path: "/applications/leave" },
      { key: "o", label: "Overtime", path: "/applications/overtime" },
    ],
  },
  { key: "div", label: "", type: "divider" },
];

describe("collectPalettePages", () => {
  it("flattens pages with their group trail and skips dividers", () => {
    expect(collectPalettePages(ITEMS)).toEqual([
      { path: "/dashboard", label: "Dashboard", breadcrumb: "" },
      {
        path: "/applications/leave",
        label: "Leave",
        breadcrumb: "Applications",
      },
      {
        path: "/applications/overtime",
        label: "Overtime",
        breadcrumb: "Applications",
      },
    ]);
  });
});

describe("searchPalettePages", () => {
  const pages = collectPalettePages(ITEMS);

  it("returns the first pages for an empty query", () => {
    expect(searchPalettePages(pages, "  ", 2)).toHaveLength(2);
  });

  it("matches on label and on the group trail, label hits first", () => {
    expect(searchPalettePages(pages, "leave").map((p) => p.label)).toEqual([
      "Leave",
    ]);
    expect(
      searchPalettePages(pages, "applications").map((p) => p.label),
    ).toEqual(["Leave", "Overtime"]);
  });

  it("requires every word to match", () => {
    expect(searchPalettePages(pages, "leave overtime")).toEqual([]);
  });
});

describe("searchPaletteEmployees", () => {
  const employees = [{ name: "Maria Santos" }, { name: "Juan Dela Cruz" }, {}];

  it("needs two characters", () => {
    expect(searchPaletteEmployees(employees, "m")).toEqual([]);
  });

  it("matches names case-insensitively and tolerates missing names", () => {
    expect(searchPaletteEmployees(employees, "SANT")).toEqual([
      { name: "Maria Santos" },
    ]);
  });
});
