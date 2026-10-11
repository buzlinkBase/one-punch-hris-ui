import { describe, expect, it } from "vitest";
import type { FieldErrors } from "react-hook-form";
import { errorCountByTab, summarizeFormErrors } from "./form-error-summary";

const err = (message: string) => ({ type: "custom", message });

describe("summarizeFormErrors", () => {
  it("says which tab and field an invalid email is", () => {
    const items = summarizeFormErrors({
      email: err("Enter a valid email"),
    } as FieldErrors);

    expect(items).toEqual([
      {
        name: "email",
        tab: "personal",
        tabLabel: "Personal Information",
        label: "Email Address",
        message: "Enter a valid email",
      },
    ]);
  });

  it("finds nested fields in their group's tab", () => {
    const [item] = summarizeFormErrors({
      sssRate: { eE: err("Must be a number") },
    } as unknown as FieldErrors);

    expect(item.name).toBe("sssRate.eE");
    expect(item.tabLabel).toBe("Gov't IDs & Rates");
    expect(item.label).toBe("SSS Rate (EE)");
  });

  it("orders problems by tab, then by their place on screen", () => {
    const items = summarizeFormErrors({
      payrollGroupId: err("Payroll group is required"),
      email: err("Enter a valid email"),
      firstName: err("First name is required"),
    } as FieldErrors);

    expect(items.map((i) => i.name)).toEqual([
      "firstName",
      "email",
      "payrollGroupId",
    ]);
    expect(errorCountByTab(items)).toEqual({ personal: 2, employment: 1 });
  });

  it("still lists a field it doesn't know, last", () => {
    const items = summarizeFormErrors({
      email: err("Enter a valid email"),
      someNewField: err("Required"),
    } as unknown as FieldErrors);

    expect(items[1]).toMatchObject({
      name: "someNewField",
      tab: null,
      label: "Some New Field",
    });
  });

  it("returns nothing when the form is valid", () => {
    expect(summarizeFormErrors({})).toEqual([]);
  });
});
