import { describe, expect, it } from "vitest";
import { buildConfirmCopy } from "./confirm-copy.util";

describe("buildConfirmCopy", () => {
  it("names the record when a name is given", () => {
    expect(
      buildConfirmCopy({
        verb: "Delete",
        subject: "leave type",
        name: "Annual Leave",
      }),
    ).toEqual({ title: 'Delete leave type "Annual Leave"?', okText: "Delete" });
  });

  it("falls back to 'this <subject>' without a name", () => {
    expect(buildConfirmCopy({ verb: "Remove", subject: "bracket" })).toEqual({
      title: "Remove this bracket?",
      okText: "Remove",
    });
  });
});
