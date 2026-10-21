import {
  downloadMultiSheetExcel,
  type ExcelSheet,
} from "@/shared/utils/export.utils";
import type {
  BillingDocument,
  DocumentBlock,
  DocumentSection,
  TableCell,
} from "../models/api/billing-format.model";

type Row = (string | number)[];

const cell = (c: TableCell): string | number => c.number ?? c.text;

/** One block as spreadsheet rows; numbers stay numbers so the client can sum and check them. */
function blockRows(block: DocumentBlock): Row[] {
  switch (block.kind) {
    case "fields":
      return block.fields.map((f) => [f.label, f.value]);
    case "table": {
      const rows: Row[] = [];
      if (block.columns.some((c) => c.group)) {
        rows.push(block.columns.map((c) => c.group ?? ""));
      }
      rows.push(block.columns.map((c) => c.label));
      for (const r of block.rows) {
        if (r.some((c) => c.text !== "")) rows.push(r.map(cell));
      }
      for (const r of block.footer) rows.push(r.map(cell));
      return rows;
    }
    case "amounts":
      return [
        ...(block.caption ? [[block.caption]] : []),
        ...block.lines.map((l) => [
          l.label,
          l.quantity ?? "",
          l.unit ?? "",
          l.rate ?? "",
          l.amount,
        ]),
      ];
    case "signatures":
      return block.signatures.map((s) => [
        s.label,
        s.name ?? "",
        s.title ?? "",
        s.organization ?? "",
      ]);
    case "note":
      return [[block.text]];
  }
}

function sectionSheet(
  section: DocumentSection,
  name: string,
  header: BillingDocument["header"],
): ExcelSheet {
  const rows: Row[] = [[header.agencyName], []];
  for (const page of section.pages) {
    if (page.heading) rows.push([page.heading]);
    for (const block of page.blocks) {
      rows.push(...blockRows(block), []);
    }
  }
  return {
    name,
    headers: [section.title],
    rows,
    numberFormat: "#,##0.00",
  };
}

/** The billing packet as a workbook: one sheet per section, named after it (made unique within the 31 characters Excel allows). */
export function downloadBillingDocument(
  packet: BillingDocument,
  fileName: string,
): void {
  const used = new Set<string>();
  const sheets = packet.sections.map((section, index) => {
    let name = section.title.replace(/[:\\/?*[\]]/g, "").slice(0, 28);
    if (used.has(name)) name = `${name.slice(0, 25)} ${index + 1}`;
    used.add(name);
    return sectionSheet(section, name, packet.header);
  });
  downloadMultiSheetExcel(sheets, fileName);
}
