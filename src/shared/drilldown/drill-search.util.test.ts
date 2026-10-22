import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
  asDateRange,
  asString,
  asStringArray,
  dayRange,
  isIsoDate,
  lastDays,
  periodRange,
  tenureHireRange,
} from "./drill-search.util";

describe("search param readers", () => {
  it("accepts real dates only", () => {
    expect(isIsoDate("2026-03-31")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-3-1")).toBe(false);
    expect(isIsoDate(20260301)).toBe(false);
  });

  it("trims strings and drops blanks", () => {
    expect(asString("  a ")).toBe("a");
    expect(asString("  ")).toBeUndefined();
    expect(asString(5)).toBeUndefined();
  });

  it("reads a list from an array or a lone string", () => {
    expect(asStringArray(["a", " ", "b"])).toEqual(["a", "b"]);
    expect(asStringArray("a")).toEqual(["a"]);
    expect(asStringArray([])).toBeUndefined();
    expect(asStringArray(undefined)).toBeUndefined();
  });

  it("needs both ends of a range", () => {
    expect(asDateRange("2026-01-01", "2026-01-31")).toEqual({
      from: "2026-01-01",
      to: "2026-01-31",
    });
    expect(asDateRange("2026-01-01", undefined)).toBeUndefined();
  });
});

describe("drill ranges", () => {
  it("makes a one-day range", () => {
    expect(dayRange(dayjs("2026-10-22"))).toEqual({
      from: "2026-10-22",
      to: "2026-10-22",
    });
  });

  it("clips a month to the page's range", () => {
    const within = { from: "2026-01-15", to: "2026-03-10" };
    expect(periodRange("2026-01", within)).toEqual({
      from: "2026-01-15",
      to: "2026-01-31",
    });
    expect(periodRange("2026-02", within)).toEqual({
      from: "2026-02-01",
      to: "2026-02-28",
    });
    expect(periodRange("2026-03", within)).toEqual({
      from: "2026-03-01",
      to: "2026-03-10",
    });
    expect(periodRange("March", within)).toBeNull();
  });

  it("keeps only the most recent days of a long range", () => {
    expect(lastDays({ from: "2025-01-01", to: "2026-03-31" }, 31)).toEqual({
      from: "2026-03-01",
      to: "2026-03-31",
    });
    expect(lastDays({ from: "2026-03-20", to: "2026-03-31" }, 31)).toEqual({
      from: "2026-03-20",
      to: "2026-03-31",
    });
  });

  it("turns a tenure band into the hire dates it covers", () => {
    const asOf = dayjs("2026-10-22");
    expect(tenureHireRange("1-3", asOf)).toEqual({
      hireDateFrom: "2023-10-23",
      hireDateTo: "2025-10-22",
    });
    expect(tenureHireRange("0-1", asOf)).toEqual({
      hireDateFrom: "2025-10-23",
      hireDateTo: "2026-10-22",
    });
    expect(tenureHireRange("10-", asOf)).toEqual({ hireDateTo: "2016-10-22" });
    expect(tenureHireRange("Under 1 year", asOf)).toBeNull();
    expect(tenureHireRange("3-1", asOf)).toBeNull();
  });
});
