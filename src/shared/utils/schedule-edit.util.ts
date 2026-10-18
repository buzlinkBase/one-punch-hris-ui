// Pure helpers for hand-editing a generated payment schedule (Other Income schedule, loan
// amortization). Rows are addressed by their numeric position field ("index" / "period"),
// which is rewritten after every change so it always reads 1..n in date order.

type DatedRow = { date: string };

type NumberKey<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

export function updateRowAt<T extends DatedRow>(
  rows: T[],
  keyField: NumberKey<T>,
  key: number,
  patch: Partial<T>,
): T[] {
  return rows.map((r) => (r[keyField] === key ? { ...r, ...patch } : r));
}

export function removeRowAt<T extends DatedRow>(
  rows: T[],
  keyField: NumberKey<T>,
  key: number,
): T[] {
  return rows.filter((r) => r[keyField] !== key);
}

export function sortAndRenumber<T extends DatedRow>(
  rows: T[],
  keyField: NumberKey<T>,
): T[] {
  return [...rows]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r, i) => ({ ...r, [keyField]: i + 1 }));
}
