import { describe, expect, it } from "vitest";
import { JOB_LEVEL_OPTIONS, formatJobLevel } from "./label.const";

describe("formatJobLevel", () => {
  it("shows legacy enum names readably", () => {
    expect(formatJobLevel("RankandFile")).toBe("Rank and File");
    expect(formatJobLevel("TechnicalSpecialist")).toBe("Technical Specialist");
  });

  it("returns free-text values as-is", () => {
    expect(formatJobLevel("Project Lead")).toBe("Project Lead");
    expect(formatJobLevel("Managerial")).toBe("Managerial");
  });

  it("returns an empty string for missing values", () => {
    expect(formatJobLevel(undefined)).toBe("");
    expect(formatJobLevel(null)).toBe("");
  });

  it("suggests readable values that are stored exactly as shown", () => {
    expect(JOB_LEVEL_OPTIONS.every((o) => o.value === o.label)).toBe(true);
    expect(JOB_LEVEL_OPTIONS.map((o) => o.value)).toContain("Rank and File");
  });
});
