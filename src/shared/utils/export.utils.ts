import * as XLSX from "xlsx";

/** Strings are quoted; numbers are written bare (no thousands separator) so spreadsheet apps
 * read them as numbers. */
export function buildFlatCsv(
  headers: string[],
  rows: (string | number)[][],
): string {
  const esc = (v: string | number) =>
    typeof v === "number" ? String(v) : `"${v.replaceAll('"', '""')}"`;
  return [
    headers.map(esc).join(","),
    ...rows.map((row) => row.map(esc).join(",")),
  ].join("\n");
}

export interface ExcelSheet {
  name: string;
  headers: string[];
  /** Numbers are written as numeric cells, so they sum and sort in Excel. */
  rows: (string | number)[][];
  /** Optional Excel display format for every numeric cell (e.g. "#,##0.00"); the value stays a number. */
  numberFormat?: string;
  /** Headers of count columns (e.g. "Employees"): numeric, but shown without decimals. */
  integerHeaders?: string[];
}

export const EXCEL_AMOUNT_FORMAT = "#,##0.00";
const EXCEL_INTEGER_FORMAT = "0";

export function applyNumberFormat(
  ws: XLSX.WorkSheet,
  format: string,
  headers: string[],
  integerHeaders: string[] = [],
): void {
  for (const [address, value] of Object.entries(ws)) {
    if (address.startsWith("!")) continue;
    const cell = value as XLSX.CellObject;
    if (cell.t !== "n") continue;
    const header = headers[XLSX.utils.decode_cell(address).c];
    cell.z = integerHeaders.includes(header) ? EXCEL_INTEGER_FORMAT : format;
  }
}

/** Builds and downloads a real, multi-worksheet .xlsx file — one sheet per entry. */
export function downloadMultiSheetExcel(
  sheets: ExcelSheet[],
  filename: string,
): void {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows]);
    if (sheet.numberFormat)
      applyNumberFormat(
        ws,
        sheet.numberFormat,
        sheet.headers,
        sheet.integerHeaders,
      );
    // Excel worksheet names: max 31 chars, and : \ / ? * [ ] aren't allowed.
    const safeName = sheet.name.replace(/[:\\/?*[\]]/g, "").slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  }
  XLSX.writeFile(wb, filename);
}

/** Single-sheet convenience wrapper over downloadMultiSheetExcel. Numbers in rows become numeric
 * cells (formatted "#,##0.00"); strings stay text. */
export function downloadExcel(
  headers: string[],
  rows: (string | number)[][],
  filename: string,
  sheetName = "Sheet1",
  integerHeaders?: string[],
): void {
  downloadMultiSheetExcel(
    [
      {
        name: sheetName,
        headers,
        rows,
        numberFormat: EXCEL_AMOUNT_FORMAT,
        integerHeaders,
      },
    ],
    filename,
  );
}

export interface GroupedExcelLeafCol<T> {
  key: keyof T;
  label: string;
}
export interface GroupedExcelSubGroup<T> {
  label: string;
  cols: GroupedExcelLeafCol<T>[];
}
export interface GroupedExcelTopGroup<T> {
  label: string;
  subGroups: GroupedExcelSubGroup<T>[];
}

/**
 * Excel export for a 3-row merged/grouped header (top group -> sub group -> leaf column),
 * e.g. DTR's "Hours > Regular > OT". leftCols run the full header height (rowspan 3, no
 * grouping); groupedCols are nested under a top-group + sub-group pair. Mirrors the same
 * shape the old buildDtrExcel/buildDtrSummaryExcel HTML-table builders rendered via
 * rowspan/colspan, but as a real .xlsx worksheet with actual merged cells.
 */
export function downloadGroupedHeaderExcel<T>(
  leftCols: GroupedExcelLeafCol<T>[],
  groupedCols: GroupedExcelTopGroup<T>[],
  records: T[],
  fmtCell: (record: T, key: keyof T) => string,
  filename: string,
  sheetName = "Sheet1",
): void {
  const allLeafCols = groupedCols.flatMap((g) =>
    g.subGroups.flatMap((s) => s.cols),
  );
  const allCols = [...leftCols, ...allLeafCols];
  const totalCols = allCols.length;

  const topRow: string[] = new Array(totalCols).fill("");
  const subRow: string[] = new Array(totalCols).fill("");
  const leafRow: string[] = new Array(totalCols).fill("");
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] =
    [];

  leftCols.forEach((c, i) => {
    topRow[i] = c.label;
    merges.push({ s: { r: 0, c: i }, e: { r: 2, c: i } });
  });

  let col = leftCols.length;
  for (const g of groupedCols) {
    const groupSpan = g.subGroups.reduce((s, sub) => s + sub.cols.length, 0);
    topRow[col] = g.label;
    if (groupSpan > 1) {
      merges.push({
        s: { r: 0, c: col },
        e: { r: 0, c: col + groupSpan - 1 },
      });
    }
    let subCol = col;
    for (const sub of g.subGroups) {
      subRow[subCol] = sub.label;
      if (sub.cols.length > 1) {
        merges.push({
          s: { r: 1, c: subCol },
          e: { r: 1, c: subCol + sub.cols.length - 1 },
        });
      }
      for (const leaf of sub.cols) {
        leafRow[subCol] = leaf.label;
        subCol++;
      }
    }
    col += groupSpan;
  }

  const dataRows = records.map((r) => allCols.map((c) => fmtCell(r, c.key)));
  const ws = XLSX.utils.aoa_to_sheet([topRow, subRow, leafRow, ...dataRows]);
  ws["!merges"] = merges;
  const wb = XLSX.utils.book_new();
  const safeName = sheetName.replace(/[:\\/?*[\]]/g, "").slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeName);
  XLSX.writeFile(wb, filename);
}

/** Downloads plain-text content (CSV) as a file. Excel exports go through downloadExcel /
 * downloadMultiSheetExcel / downloadGroupedHeaderExcel instead, which trigger their own
 * download internally. */
export function triggerDownload(content: string, filename: string): void {
  const a = document.createElement("a");
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
