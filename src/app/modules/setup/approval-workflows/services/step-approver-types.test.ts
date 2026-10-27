import { describe, expect, it } from "vitest";
import {
  describeDynamicApprover,
  isDynamicApprover,
  resolvesToOnePerson,
  takesApproverLevel,
} from "./step-approver-types";

describe("step approver types", () => {
  it("knows which types are looked up per applicant", () => {
    expect(isDynamicApprover("ApplicantBranchHead")).toBe(true);
    expect(isDynamicApprover("ApplicantManager")).toBe(true);
    expect(isDynamicApprover("Person")).toBe(false);
    expect(isDynamicApprover("ApplicantDepartment")).toBe(false);
  });

  it("only manager level and department head take a level", () => {
    expect(takesApproverLevel("ApplicantManagerLevel")).toBe(true);
    expect(takesApproverLevel("ApplicantDepartmentHead")).toBe(true);
    expect(takesApproverLevel("ApplicantBranchHead")).toBe(false);
  });

  it("a quorum is moot for a type that resolves to one person", () => {
    expect(resolvesToOnePerson("ApplicantClientHead")).toBe(true);
    expect(resolvesToOnePerson("ApplicantManager")).toBe(false);
    expect(resolvesToOnePerson("Department")).toBe(false);
  });

  it("describes the level", () => {
    expect(describeDynamicApprover("ApplicantManagerLevel", 2)).toContain(
      "2 levels up",
    );
    expect(describeDynamicApprover("ApplicantManagerLevel", 1)).toBe(
      "Resolved per applicant — their manager",
    );
    expect(describeDynamicApprover("ApplicantDepartmentHead", 2)).toContain(
      "parent department",
    );
  });
});
