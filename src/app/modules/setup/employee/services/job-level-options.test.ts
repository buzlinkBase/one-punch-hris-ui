import { describe, expect, it } from "vitest";
import { buildJobLevelOptions, jobLevelMatches } from "./job-level-options";

const STANDARD = ["Managerial", "Supervisory", "Rank and File"];

describe("buildJobLevelOptions", () => {
  it("lists the standard levels, then the company's own", () => {
    expect(buildJobLevelOptions(STANDARD, ["Project Lead", "Manager"])).toEqual(
      [
        {
          label: "Standard levels",
          options: [
            { value: "Managerial", label: "Managerial" },
            { value: "Supervisory", label: "Supervisory" },
            { value: "Rank and File", label: "Rank and File" },
          ],
        },
        {
          label: "Used in your company",
          options: [
            { value: "Project Lead", label: "Project Lead" },
            { value: "Manager", label: "Manager" },
          ],
        },
      ],
    );
  });

  it("doesn't repeat a standard level, whatever its case or spacing", () => {
    const groups = buildJobLevelOptions(STANDARD, [
      " supervisory ",
      "MANAGERIAL",
      "",
    ]);

    expect(groups.map((g) => g.label)).toEqual(["Standard levels"]);
  });

  it("lists each of the company's own levels once", () => {
    const [, own] = buildJobLevelOptions(STANDARD, ["Lead", "lead", "Lead "]);

    expect(own.options).toEqual([{ value: "Lead", label: "Lead" }]);
  });
});

describe("jobLevelMatches", () => {
  it("matches anywhere, ignoring case", () => {
    expect(jobLevelMatches("sup", "Supervisory")).toBe(true);
    expect(jobLevelMatches("FILE", "Rank and File")).toBe(true);
    expect(jobLevelMatches("exec", "Managerial")).toBe(false);
  });
});
