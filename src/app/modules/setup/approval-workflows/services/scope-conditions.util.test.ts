import { describe, expect, it } from "vitest";
import {
  describeConditions,
  fromScopeDtos,
  toScopeDtos,
} from "./scope-conditions.util";

describe("scope conditions mapping", () => {
  it("sends entity dimensions as targetIds and employment status as values", () => {
    expect(
      toScopeDtos([
        { dimension: "Branch", values: ["b1", "b2"] },
        { dimension: "EmploymentStatus", values: ["Regular"] },
      ]),
    ).toEqual([
      { dimension: "Branch", targetIds: ["b1", "b2"], values: [] },
      { dimension: "EmploymentStatus", targetIds: [], values: ["Regular"] },
    ]);
  });

  it("drops a row with nothing selected", () => {
    expect(toScopeDtos([{ dimension: "Branch", values: [] }])).toEqual([]);
  });

  it("round-trips through the API shape", () => {
    const conditions = [
      { dimension: "Department" as const, values: ["d1"] },
      {
        dimension: "EmploymentStatus" as const,
        values: ["Contract", "Regular"],
      },
    ];
    expect(fromScopeDtos(toScopeDtos(conditions))).toEqual(conditions);
  });

  it("treats a missing list as no conditions", () => {
    expect(fromScopeDtos(undefined)).toEqual([]);
  });
});

describe("describeConditions", () => {
  const labelFor = (_: string, value: string) => value.toUpperCase();

  it("lists each dimension with its names", () => {
    expect(
      describeConditions(
        [
          { dimension: "Branch", values: ["a", "b"] },
          { dimension: "Area", values: ["x"] },
        ],
        labelFor,
      ),
    ).toEqual(["Branch: A, B", "Project Site: X"]);
  });

  it("cuts long lists to a few names and a count", () => {
    expect(
      describeConditions(
        [{ dimension: "Employee", values: ["a", "b", "c", "d", "e"] }],
        labelFor,
        2,
      ),
    ).toEqual(["Specific Employees: A, B +3 more"]);
  });

  it("is empty for the company-wide default", () => {
    expect(describeConditions([], labelFor)).toEqual([]);
  });
});
