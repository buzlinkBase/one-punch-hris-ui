import { describe, expect, it } from "vitest";
import { withReferencedEmployees } from "./approver-options";

describe("withReferencedEmployees", () => {
  const options = [{ value: "a", label: "Ana Cruz" }];

  it("adds a referenced approver missing from the list under the server-given name", () => {
    expect(
      withReferencedEmployees(options, { a: "Ana Cruz", b: "Confidential" }),
    ).toEqual([
      { value: "a", label: "Ana Cruz" },
      { value: "b", label: "Confidential" },
    ]);
  });

  it("keeps the list as is when every approver is already in it", () => {
    expect(withReferencedEmployees(options, { a: "Ana Cruz" })).toBe(options);
    expect(withReferencedEmployees(options, undefined)).toBe(options);
  });
});
