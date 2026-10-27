import { describe, expect, it } from "vitest";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import {
  buildFilterFileSuffix,
  buildPrintSummaryParams,
  filterPayrollResults,
} from "./payroll-summary-filter.util";

const row = (
  fullName: string,
  overrides: Partial<PayrollRunResult>,
): PayrollRunResult =>
  ({
    fullName,
    approvalStatus: "Approved",
    clientId: "client-a",
    payrollGroupId: "group-a",
    ...overrides,
  }) as PayrollRunResult;

const rows = [
  row("Match", {}),
  row("Other client", { clientId: "client-b" }),
  row("Other group", { payrollGroupId: "group-b" }),
  row("Pending", { approvalStatus: "ForApproval" }),
];

const names = (list: PayrollRunResult[]) => list.map((r) => r.fullName);

describe("filterPayrollResults", () => {
  it("keeps every row when nothing is filtered", () => {
    expect(filterPayrollResults(rows, { status: "All" })).toHaveLength(4);
  });

  it("matches status, client and payroll group on the row snapshot", () => {
    expect(
      names(
        filterPayrollResults(rows, {
          status: "Approved",
          clientId: "client-a",
          payrollGroupId: "group-a",
        }),
      ),
    ).toEqual(["Match"]);
  });

  it("filters on status alone", () => {
    expect(
      names(filterPayrollResults(rows, { status: "ForApproval" })),
    ).toEqual(["Pending"]);
  });

  it("keeps only the picked employees, and all of them when none are picked", () => {
    const people = [
      row("Ana", { employeeId: "emp-1" }),
      row("Ben", { employeeId: "emp-2" }),
      row("Cy", { employeeId: "emp-3" }),
    ];
    expect(
      names(
        filterPayrollResults(people, {
          status: "All",
          employeeIds: ["emp-1", "emp-3"],
        }),
      ),
    ).toEqual(["Ana", "Cy"]);
    expect(
      filterPayrollResults(people, { status: "All", employeeIds: [] }),
    ).toHaveLength(3);
  });
});

describe("buildPrintSummaryParams", () => {
  it("sends the batch and the same filter, dropping status when All", () => {
    expect(
      buildPrintSummaryParams("batch-1", {
        status: "All",
        clientId: "client-a",
      }),
    ).toEqual({
      payrollBatchId: "batch-1",
      status: undefined,
      clientId: "client-a",
      payrollGroupId: undefined,
      employeeIds: undefined,
    });
    expect(
      buildPrintSummaryParams("batch-1", { status: "Approved" }).status,
    ).toBe("Approved");
  });

  it("joins the picked employees into one comma-separated value", () => {
    expect(
      buildPrintSummaryParams("batch-1", {
        status: "All",
        employeeIds: ["emp-1", "emp-2"],
      }).employeeIds,
    ).toBe("emp-1,emp-2");
  });
});

describe("buildFilterFileSuffix", () => {
  it("is empty when nothing is filtered", () => {
    expect(buildFilterFileSuffix({ status: "All" })).toBe("");
  });

  it("lists the applied filters, file-name safe", () => {
    expect(
      buildFilterFileSuffix({
        status: "Approved",
        clientCode: "ACME Corp",
        payrollGroupCode: "SEMI",
      }),
    ).toBe("-Approved-ACME_Corp-SEMI");
  });
});
