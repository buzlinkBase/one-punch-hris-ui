import { describe, expect, it } from "vitest";
import { getEmptyMessage, type EmptyState } from "./payroll-summary-empty";

const base: EmptyState = {
  hasBatches: true,
  batchSelected: false,
  loadedCount: 0,
  statusLabel: "Approved",
  statusFiltered: true,
};

describe("getEmptyMessage", () => {
  it("asks for a batch when none is selected", () => {
    expect(getEmptyMessage(base).title).toBe(
      "Select a payroll batch to view its records",
    );
  });

  it("points to the date range when it has no batches", () => {
    expect(getEmptyMessage({ ...base, hasBatches: false }).title).toBe(
      "No payroll batches in this date range",
    );
  });

  it("blames the status filter when it hides every loaded record", () => {
    expect(
      getEmptyMessage({ ...base, batchSelected: true, loadedCount: 3 }).title,
    ).toBe("No approved payroll records in this batch");
  });

  it("says the batch is empty when nothing loaded", () => {
    expect(getEmptyMessage({ ...base, batchSelected: true }).title).toBe(
      "This payroll batch has no records",
    );
  });
});
