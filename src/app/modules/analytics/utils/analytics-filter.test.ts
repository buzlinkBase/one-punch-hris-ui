import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
  defaultAnalyticsFilter,
  filterFromSearch,
  filterToSearch,
  formatPeriod,
} from "./analytics-filter";

const TODAY = dayjs("2026-09-30");

describe("defaultAnalyticsFilter", () => {
  it("covers the last 12 months through today", () => {
    expect(defaultAnalyticsFilter(TODAY)).toEqual({
      from: "2025-10-01",
      to: "2026-09-30",
    });
  });
});

describe("filter <-> URL search", () => {
  it("round-trips every filter", () => {
    const filter = {
      from: "2026-01-01",
      to: "2026-03-31",
      departmentId: "d1",
      branchId: "b1",
      payrollGroupId: "p1",
      employmentStatus: "Regular",
    };

    expect(filterFromSearch(filterToSearch(filter), TODAY)).toEqual(filter);
  });

  it("leaves empty filters out of the URL", () => {
    expect(
      filterToSearch({ from: "2026-01-01", to: "2026-03-31", branchId: "" }),
    ).toEqual({ from: "2026-01-01", to: "2026-03-31" });
  });

  it("falls back to the default range for a missing or malformed date", () => {
    const fallback = defaultAnalyticsFilter(TODAY);

    expect(filterFromSearch({}, TODAY)).toEqual(fallback);
    expect(
      filterFromSearch({ from: "2026-02-30", to: "2026-03-31" }, TODAY),
    ).toEqual(fallback);
    expect(filterFromSearch({ from: "yesterday", to: 5 }, TODAY)).toEqual(
      fallback,
    );
  });

  it("ignores blank or non-text optional filters", () => {
    expect(
      filterFromSearch(
        {
          from: "2026-01-01",
          to: "2026-01-31",
          departmentId: "  ",
          branchId: 7,
        },
        TODAY,
      ),
    ).toEqual({ from: "2026-01-01", to: "2026-01-31" });
  });
});

describe("formatPeriod", () => {
  it("names the month", () => {
    expect(formatPeriod("2026-03")).toBe("Mar 2026");
  });
});
