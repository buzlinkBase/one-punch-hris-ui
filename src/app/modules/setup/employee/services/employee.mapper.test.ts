import { describe, expect, it } from "vitest";
import type { EmployeeResponse } from "../models/api/response/employee-response.model";
import { employeeMapper } from "./employee.mapper";

// The API camel-cases the rate fields as "ee"/"er"/"ec" (Newtonsoft turns a leading run of
// capitals into lower case), not "eE"/"eR"/"eC". Reading the latter made EE/ER/EC come back as 0
// after Save while Add-ons survived -- and the next Save then stored those zeros.
const response = (over: Partial<EmployeeResponse>) =>
  ({
    id: "e1",
    firstName: "Ana",
    lastName: "Reyes",
    employeeNo: "001",
    ...over,
  }) as EmployeeResponse;

describe("employeeMapper.toFormValues statutory rates", () => {
  it("fills the EE / ER / EC / Add-ons boxes from the API's field names", () => {
    const form = employeeMapper.toFormValues(
      response({
        sssRate: {
          computationType: "FixedPerPayroll",
          ee: 500,
          er: 1000,
          ec: 10,
          addOns: 4,
        },
        phicRate: {
          computationType: "FixedPerPayroll",
          ee: 250,
          er: 250,
          addOns: 6,
        },
        hdmfRate: {
          computationType: "FixedPerPayroll",
          ee: 200,
          er: 200,
          addOns: 1,
        },
        taxRate: { computationType: "FixedPerPayroll", ee: 300, addOns: 2 },
      }),
    );

    expect(form.sssRate).toEqual({
      computationType: "FixedPerPayroll",
      eE: 500,
      eR: 1000,
      eC: 10,
      addOns: 4,
    });
    expect(form.phicRate).toMatchObject({ eE: 250, eR: 250, addOns: 6 });
    expect(form.hdmfRate).toMatchObject({ eE: 200, eR: 200, addOns: 1 });
    expect(form.taxRate).toMatchObject({ eE: 300, addOns: 2 });
  });

  it("falls back to zeros when the employee has no rate rows", () => {
    const form = employeeMapper.toFormValues(response({}));

    expect(form.sssRate).toMatchObject({ eE: 0, eR: 0, eC: 0, addOns: 0 });
  });
});

describe("employeeMapper payroll-only (no DTR) settings", () => {
  it("loads the flag, category and window from the API", () => {
    const form = employeeMapper.toFormValues(
      response({
        settings: {
          isNoDTRNotRequired: true,
          noDtrCategory: "OWNER_SHAREHOLDER",
          noDtrEffectiveFrom: "2026-01-01",
          noDtrEffectiveUntil: null,
        } as EmployeeResponse["settings"],
      }),
    );
    expect(form.settings).toMatchObject({
      isNoDTRNotRequired: true,
      noDtrCategory: "OWNER_SHAREHOLDER",
      noDtrEffectiveFrom: "2026-01-01",
      noDtrEffectiveUntil: null,
    });
  });

  it("defaults to a regular (DTR) employee", () => {
    expect(employeeMapper.toDefaultValues().settings).toMatchObject({
      isNoDTRNotRequired: false,
      noDtrCategory: null,
    });
    expect(employeeMapper.toFormValues(response({})).settings).toMatchObject({
      isNoDTRNotRequired: false,
    });
  });
});
