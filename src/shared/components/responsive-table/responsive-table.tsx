import { useState, type Key, type ReactElement, type ReactNode } from "react";
import { Pagination, Spin, Table } from "antd";
import type { TableProps } from "antd";
import type { ColumnType } from "antd/es/table";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";
import { AppEmpty } from "@/shared/components/app-empty/app-empty";

type AnyColumn<T> = ColumnType<T> & { children?: unknown };

function isActionsColumn<T>(col: AnyColumn<T>): boolean {
  return col.key === "actions" || col.fixed === "right";
}

function readValue<T extends object>(record: T, col: AnyColumn<T>): unknown {
  const path = col.dataIndex as
    PropertyKey | readonly PropertyKey[] | undefined;
  if (path === undefined) return undefined;
  const keys: PropertyKey[] = Array.isArray(path)
    ? [...path]
    : [path as PropertyKey];
  return keys.reduce<unknown>(
    (acc, k) =>
      acc == null ? undefined : (acc as Record<PropertyKey, unknown>)[k],
    record,
  );
}

function renderCell<T extends object>(
  record: T,
  index: number,
  col: AnyColumn<T>,
): ReactNode {
  const value = readValue(record, col);
  if (col.render) {
    const out = col.render(value, record, index);
    // antd lets render return { children, props }; cards only need the content.
    if (out && typeof out === "object" && "children" in out) {
      return (out as { children: ReactNode }).children;
    }
    return out as ReactNode;
  }
  return value == null || value === "" ? "-" : (value as ReactNode);
}

function rowKeyOf<T extends object>(
  rowKey: TableProps<T>["rowKey"],
  record: T,
  index: number,
): Key {
  if (typeof rowKey === "function") return rowKey(record);
  if (typeof rowKey === "string") {
    return (record as Record<string, Key>)[rowKey] ?? index;
  }
  return index;
}

/**
 * Drop-in for antd's Table: unchanged on desktop, a card list on phones. Cards are built from
 * the same `columns` -- the first column is the card title, the actions column (key "actions" or
 * fixed right) is the footer, every other column becomes a label/value row.
 */
export function ResponsiveTable<T extends object>(
  props: TableProps<T>,
): ReactElement {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);

  if (!isMobile) return <Table<T> {...props} />;

  const columns = (props.columns ?? []) as AnyColumn<T>[];
  const [titleCol, ...rest] = columns.filter((c) => !isActionsColumn(c));
  const actionsCol = columns.find(isActionsColumn);
  const data = [...(props.dataSource ?? [])];

  const paginationConfig =
    props.pagination === false ? null : (props.pagination ?? {});
  const pageSize = paginationConfig?.pageSize ?? 20;
  const currentPage = Math.min(page, Math.ceil(data.length / pageSize) || 1);
  const visible = paginationConfig
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  const loading = !!props.loading;

  if (!loading && data.length === 0) {
    const emptyText = props.locale?.emptyText;
    return (
      <>
        {typeof emptyText === "function"
          ? emptyText()
          : (emptyText ?? <AppEmpty description="No records found" />)}
      </>
    );
  }

  return (
    <Spin spinning={loading}>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {visible.map((record, i) => (
          <li
            key={rowKeyOf(props.rowKey, record, i)}
            className="rounded-xl border border-(--ant-color-border-secondary) bg-(--ant-color-bg-container) p-3"
          >
            {titleCol && (
              <div className="mb-2 text-sm font-semibold">
                {renderCell(record, i, titleCol)}
              </div>
            )}
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px]">
              {rest.map((col, ci) => (
                <div key={col.key ?? ci} className="contents">
                  <dt className="text-(--ant-color-text-secondary)">
                    {col.title as ReactNode}
                  </dt>
                  <dd className="m-0 min-w-0 wrap-break-word text-right">
                    {renderCell(record, i, col)}
                  </dd>
                </div>
              ))}
            </dl>
            {actionsCol && (
              <div className="mt-3 flex justify-end border-t border-(--ant-color-border-secondary) pt-2">
                {renderCell(record, i, actionsCol)}
              </div>
            )}
          </li>
        ))}
      </ul>
      {paginationConfig && data.length > pageSize && (
        <Pagination
          className="mt-3 text-center"
          simple
          current={currentPage}
          pageSize={pageSize}
          total={data.length}
          showSizeChanger={false}
          onChange={setPage}
        />
      )}
    </Spin>
  );
}
