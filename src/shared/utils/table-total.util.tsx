import { isValidElement, type ReactNode } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

const NUMBER = /^-?\d[\d,]*(\.\d+)?(\s*h)?$/;

const AMOUNT_FORMAT = new Intl.NumberFormat("en-PH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function leaves<T>(columns: ColumnsType<T>): ColumnsType<T> {
  return columns.flatMap((column) =>
    "children" in column && column.children
      ? leaves(column.children)
      : [column],
  );
}

/** The text a cell renders, looking through one wrapper element such as <strong>. */
function textOf(node: ReactNode): string | null {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (isValidElement<{ children?: ReactNode }>(node))
    return textOf(node.props.children);
  // A render may return { children, props } to set cell attributes.
  if (node && typeof node === "object" && "children" in node)
    return textOf((node as { children: ReactNode }).children);
  return null;
}

/**
 * A `Table` summary that adds a Grand Total row. A column is totalled when every row it renders
 * is a number ("1,234.50", "8.00 h"), so computed columns need no extra setup; name, date and tag
 * columns are left blank. Pass `skip` for numeric columns that make no sense to add up (rates).
 * The total covers every row, not only the current page.
 */
export function grandTotalSummary<T extends object>(
  columns: ColumnsType<T>,
  rows: readonly T[],
  skip: readonly string[] = [],
) {
  if (rows.length === 0) return undefined;
  const cells = leaves(columns).map((column) => {
    if (column.key != null && skip.includes(String(column.key))) return null;
    if (!column.render) return null;
    let sum = 0;
    let hours = true;
    let numeric = false;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const raw =
        "dataIndex" in column && typeof column.dataIndex === "string"
          ? (row as Record<string, unknown>)[column.dataIndex]
          : undefined;
      const rendered = column.render(raw, row, i) as unknown as ReactNode;
      const text = textOf(rendered)?.trim();
      if (text === "—") continue; // an empty cell counts as zero
      if (text == null || !NUMBER.test(text)) return null;
      numeric = true;
      hours = hours && /h$/.test(text);
      sum += Number(text.replace(/[,h\s]/g, ""));
    }
    if (!numeric) return null;
    return AMOUNT_FORMAT.format(sum) + (hours ? " h" : "");
  });
  if (cells.every((c) => c == null)) return undefined;
  const labelIndex = cells.findIndex((c) => c == null);

  return (
    <Table.Summary fixed>
      <Table.Summary.Row className="font-semibold">
        {cells.map((cell, i) => (
          <Table.Summary.Cell
            key={i}
            index={i}
            align={cell != null ? "right" : undefined}
          >
            {cell ?? (i === labelIndex ? "Grand Total" : null)}
          </Table.Summary.Cell>
        ))}
      </Table.Summary.Row>
    </Table.Summary>
  );
}
