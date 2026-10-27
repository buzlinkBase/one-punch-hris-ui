import { describe, expect, it } from "vitest";
import { compactChips, formatRangeChip, labelOf } from "./filter-chips.util";

describe("filter-chips.util", () => {
  it("labelOf returns the matching option label", () => {
    const options = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ];
    expect(labelOf(options, "b")).toBe("Beta");
    expect(labelOf(options, "x")).toBeUndefined();
    expect(labelOf(options, undefined)).toBeUndefined();
  });

  it("formatRangeChip needs both ends", () => {
    expect(formatRangeChip("2026-01-01", "2026-01-15")).toBe(
      "Jan 01 – Jan 15, 2026",
    );
    expect(formatRangeChip("2026-01-01", undefined)).toBeUndefined();
  });

  it("compactChips drops empty values", () => {
    expect(compactChips(["a", undefined, null, "b"])).toEqual(["a", "b"]);
  });
});
