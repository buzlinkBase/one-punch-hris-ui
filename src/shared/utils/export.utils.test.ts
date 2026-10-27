import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { applyNumberFormat, buildFlatCsv } from "./export.utils";

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

describe("applyNumberFormat", () => {
  it("formats numeric cells as amounts, count columns as integers, and leaves text alone", () => {
    const headers = ["Name", "Employees", "Net Pay"];
    const ws = XLSX.utils.aoa_to_sheet([headers, ["Acme", 5, 1234.5]]);

    applyNumberFormat(ws, "#,##0.00", headers, ["Employees"]);

    expect(ws["B2"].t).toBe("n");
    expect(ws["B2"].z).toBe("0");
    expect(ws["C2"].t).toBe("n");
    expect(ws["C2"].z).toBe("#,##0.00");
    expect(ws["A2"].z).toBeUndefined();
  });

  it("finds the header of columns past Z", () => {
    const headers = Array.from({ length: 28 }, (_, i) => `H${i}`);
    const row = headers.map((_, i) => (i === 27 ? 9 : ""));
    const ws = XLSX.utils.aoa_to_sheet([headers, row]);

    applyNumberFormat(ws, "#,##0.00", headers, ["H27"]);

    expect(ws["AB2"].z).toBe("0");
  });
});
