import { describe, expect, it } from "vitest";
import { allowedWhileReadOnly } from "./read-only-permissions";

describe("allowedWhileReadOnly", () => {
  it("keeps viewing and exporting", () => {
    expect(allowedWhileReadOnly("Workforce Setup:View")).toBe(true);
    expect(allowedWhileReadOnly("Payroll:Export")).toBe(true);
  });

  it("keeps the confidential-record clearances, which only reveal", () => {
    expect(allowedWhileReadOnly("Confidential Records:Access")).toBe(true);
    expect(allowedWhileReadOnly("Confidential Records:Operations")).toBe(true);
    expect(allowedWhileReadOnly("Confidential Records:Entries")).toBe(true);
  });

  it("keeps billing, so the company can pay", () => {
    expect(allowedWhileReadOnly("Billing:View")).toBe(true);
    expect(allowedWhileReadOnly("Billing:Manage")).toBe(true);
  });

  it("drops every write action", () => {
    for (const code of [
      "Workforce Setup:Create",
      "Workforce Setup:Edit",
      "Workforce Setup:Delete",
      "Leave:Approve",
      "DTR Master:Manage",
      "Storage:Manage",
      "Users:Invite",
      "Users:AssignRole",
      "clientportal:Client:Manage",
    ]) {
      expect(allowedWhileReadOnly(code)).toBe(false);
    }
  });

  it("treats an unknown action as a write", () => {
    expect(allowedWhileReadOnly("Something:Recalculate")).toBe(false);
  });
});
