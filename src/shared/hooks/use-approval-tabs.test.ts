import { describe, expect, it } from "vitest";
import { splitApprovalRows } from "./use-approval-tabs";

const rows = [
  { id: "a", approvalStatus: "ForApproval" },
  { id: "b", approvalStatus: "ForApproval" },
  { id: "c", approvalStatus: "Approved" },
  { id: "d", approvalStatus: null },
];

describe("splitApprovalRows", () => {
  it("keeps every pending row pending when there is no per-approver split", () => {
    const { pending, inProgress, processed } = splitApprovalRows(rows);
    expect(pending.map((r) => r.id)).toEqual(["a", "b"]);
    expect(inProgress).toEqual([]);
    expect(processed.map((r) => r.id)).toEqual(["c", "d"]);
  });

  it("puts pending rows that aren't the viewer's turn in progress", () => {
    const { pending, inProgress, processed } = splitApprovalRows(
      rows,
      new Set(["b"]),
    );
    expect(pending.map((r) => r.id)).toEqual(["b"]);
    expect(inProgress.map((r) => r.id)).toEqual(["a"]);
    expect(processed.map((r) => r.id)).toEqual(["c", "d"]);
  });

  it("never treats a decided row as the viewer's turn", () => {
    const { pending, processed } = splitApprovalRows(rows, new Set(["c"]));
    expect(pending).toEqual([]);
    expect(processed.map((r) => r.id)).toContain("c");
  });
});
