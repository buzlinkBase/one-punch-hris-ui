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
    });
    expect(
      buildPrintSummaryParams("batch-1", { status: "Approved" }).status,
    ).toBe("Approved");
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
