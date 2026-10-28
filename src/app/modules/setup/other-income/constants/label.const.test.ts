import { describe, expect, it } from "vitest";
import {
  INCOME_CLASS_OPTIONS,
  STATUTORY_NOTE,
  countsTowardStatutory,
} from "./label.const";

describe("which income classes count toward SSS, PhilHealth and Pag-IBIG", () => {
  it("counts Regular, Commission and Others, as the payroll does", () => {
    expect(
      INCOME_CLASS_OPTIONS.filter((o) => countsTowardStatutory(o.value)).map(
        (o) => o.value,
      ),
    ).toEqual(["Regular", "Commission", "Others"]);
  });

  it("leaves out De Minimis, Reimbursement and Special Bonus", () => {
    expect(countsTowardStatutory("Deminimis")).toBe(false);
    expect(countsTowardStatutory("Reimbursement")).toBe(false);
    expect(countsTowardStatutory("SpecialBonus")).toBe(false);
    expect(countsTowardStatutory(null)).toBe(false);
  });

  it("explains every class in the list, in words that match the rule", () => {
    for (const { value } of INCOME_CLASS_OPTIONS) {
      const note = STATUTORY_NOTE[value];
      expect(note, value).toBeTruthy();
      expect(
        note.startsWith(
          countsTowardStatutory(value) ? "Counted" : "Not counted",
        ),
        value,
      ).toBe(true);
    }
  });
});
