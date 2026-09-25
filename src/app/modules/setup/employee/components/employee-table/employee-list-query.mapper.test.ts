import { describe, expect, it } from "vitest";
import {
  applyTableFiltersAndSort,
  clearedQuery,
  hasActiveFilters,
} from "./employee-list-query.mapper";
import type { EmployeeListQuery } from "../../models/api/request/employee-list-query.model";

const base: EmployeeListQuery = { page: 3, limit: 50 };

describe("applyTableFiltersAndSort", () => {
  it("maps lookup, enum, text and date-range column filters to query params", () => {
    const next = applyTableFiltersAndSort(
      base,
      {
        clientName: ["c1", "c2"],
        payrollGroupName: ["pg1"],
        areaName: ["site1"],
        timeShiftName: ["shift1"],
        employmentStatus: ["Regular"],
        bioId: ["1001"],
        sssNo: [" 34-12 "],
        hireDate: ["2026-01-01", "2026-06-30"],
      },
      {},
    );

    expect(next).toMatchObject({
      clientIds: ["c1", "c2"],
      payrollGroupIds: ["pg1"],
      areaIds: ["site1"],
      timeShiftIds: ["shift1"],
      employmentStatuses: ["Regular"],
      bioId: "1001",
      sssNo: "34-12",
      hireDateFrom: "2026-01-01",
      hireDateTo: "2026-06-30",
    });
  });

  it("maps the antd sorter to sortField/sortOrder", () => {
    const next = applyTableFiltersAndSort(
      base,
      {},
      { columnKey: "clientName", order: "descend" },
    );
    expect(next.sortField).toBe("clientName");
    expect(next.sortOrder).toBe("descend");

    const cleared = applyTableFiltersAndSort(
      next,
      {},
      { columnKey: "clientName" },
    );
    expect(cleared.sortField).toBeUndefined();
    expect(cleared.sortOrder).toBeUndefined();
  });

  it("returns to page 1 when a filter or sort changes, but keeps the page otherwise", () => {
    expect(
      applyTableFiltersAndSort(base, { clientName: ["c1"] }, {}).page,
    ).toBe(1);
    expect(
      applyTableFiltersAndSort(
        base,
        {},
        { columnKey: "bioId", order: "ascend" },
      ).page,
    ).toBe(1);
    expect(applyTableFiltersAndSort(base, {}, {}).page).toBe(3);
  });

  it("drops a filter the user reset", () => {
    const filtered = applyTableFiltersAndSort(base, { clientName: ["c1"] }, {});
    const reset = applyTableFiltersAndSort(filtered, { clientName: null }, {});
    expect(reset.clientIds).toBeUndefined();
  });
});

describe("hasActiveFilters / clearedQuery", () => {
  it("detects keyword and column filters, and clearing keeps only the page size", () => {
    expect(hasActiveFilters(base)).toBe(false);
    const filtered: EmployeeListQuery = {
      ...base,
      keyword: "acme",
      clientIds: ["c1"],
      sortField: "bioId",
      sortOrder: "ascend",
    };
    expect(hasActiveFilters(filtered)).toBe(true);
    expect(clearedQuery(filtered)).toEqual({ page: 1, limit: 50 });
  });
});
