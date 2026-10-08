import { describe, expect, it } from "vitest";
import { buildFlatCsv } from "./export.utils";

describe("buildFlatCsv", () => {
  it("quotes strings and writes numbers bare", () => {
    expect(
      buildFlatCsv(
        ["Employee", "Net Pay"],
        [
          ['Juan "JD" Cruz', 1234.5],
          ["Ana", 0],
        ],
      ),
    ).toBe('"Employee","Net Pay"\n"Juan ""JD"" Cruz",1234.5\n"Ana",0');
  });

  it("keeps string-only rows quoted as before", () => {
    expect(buildFlatCsv(["A"], [["1,234.00"]])).toBe('"A"\n"1,234.00"');
  });
});
