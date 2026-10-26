import { describe, expect, it } from "vitest";
import {
  EMPLOYEE_SECTION_GROUPS,
  EMPLOYEE_SECTION_LABELS,
  buildSectionNav,
} from "./section-groups";

const keysOf = (groups: ReturnType<typeof buildSectionNav>) =>
  groups.flatMap((g) => g.items.map((i) => i.key));

describe("buildSectionNav", () => {
  it("covers every section exactly once, each with a label", () => {
    const all = EMPLOYEE_SECTION_GROUPS.flatMap((g) => [...g.sections]);
    expect(new Set(all).size).toBe(all.length);
    for (const key of all) expect(EMPLOYEE_SECTION_LABELS[key]).toBeTruthy();
  });

  it("locks record sections until the employee is saved", () => {
    const groups = buildSectionNav({ isEdit: false });
    const locked = groups.flatMap((g) => g.items).filter((i) => i.locked);
    expect(locked.map((i) => i.key)).toEqual([
      "dependents",
      "education",
      "skills",
      "employment-history",
      "doc-records",
      "assets",
    ]);
    expect(
      buildSectionNav({ isEdit: true })
        .flatMap((g) => g.items)
        .some((i) => i.locked),
    ).toBe(false);
  });

  it("drops hidden sections and the groups left empty", () => {
    const groups = buildSectionNav({
      isEdit: true,
      hiddenKeys: ["compensation", "govids", "settings"],
    });
    expect(groups.map((g) => g.title)).not.toContain("Pay");
    expect(keysOf(groups)).not.toContain("compensation");
  });

  it("carries each section's error count", () => {
    const groups = buildSectionNav({
      isEdit: true,
      errorCounts: { personal: 2 },
    });
    const personal = groups[0].items[0];
    expect(personal.errorCount).toBe(2);
    expect(groups[1].items[0].errorCount).toBe(0);
  });
});
