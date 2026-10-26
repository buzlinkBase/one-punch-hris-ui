import { describe, expect, it } from "vitest";
import { statusTone } from "./status-tone.util";

describe("statusTone", () => {
  it("ignores case, spaces and separators", () => {
    expect(statusTone("ForApproval")).toBe("warning");
    expect(statusTone("For Approval")).toBe("warning");
    expect(statusTone("ACTIVE")).toBe("success");
    expect(statusTone("for_approval")).toBe("warning");
  });

  it("maps negative statuses to error", () => {
    expect(statusTone("Declined")).toBe("error");
    expect(statusTone("FAILED")).toBe("error");
  });

  it("falls back to default for unknown, cancelled, withdrawn and empty", () => {
    expect(statusTone("Cancelled")).toBe("default");
    expect(statusTone("Withdrawn")).toBe("default");
    expect(statusTone("whatever")).toBe("default");
    expect(statusTone(undefined)).toBe("default");
  });
});
