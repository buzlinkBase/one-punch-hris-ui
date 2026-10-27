/**
 * Gives every row of a read-only list a `key` (antd Table's default rowKey) from its own fields
 * plus its position, for rows with no id of their own. antd 6 deprecated the index argument of a
 * rowKey function, which doesn't reliably receive one.
 */
export function withRowKeys<T extends object>(
  rows: readonly T[] | undefined,
  keyOf: (row: T) => string,
): (T & { key: string })[] {
  return (rows ?? []).map((row, i) => ({ ...row, key: `${keyOf(row)}-${i}` }));
}
