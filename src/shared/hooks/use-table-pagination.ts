import { useCallback, useMemo, useState } from "react";
import type { TablePaginationConfig } from "antd";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/shared/constants/pagination.const";

/**
 * Client-side pagination props for an antd Table, with the app-wide page size, size changer and
 * total label. Spread the result into `pagination`. `reset` returns to page 1 (call it when a
 * filter changes).
 */
export function useTablePagination(pageSize = DEFAULT_PAGE_SIZE) {
  const [current, setCurrent] = useState(1);
  const [size, setSize] = useState(pageSize);

  const reset = useCallback(() => setCurrent(1), []);

  const pagination = useMemo<TablePaginationConfig>(
    () => ({
      current,
      pageSize: size,
      showSizeChanger: true,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      hideOnSinglePage: size === pageSize,
      showTotal: (total) => `${total} records`,
      onChange: (page, nextSize) => {
        setCurrent(nextSize !== size ? 1 : page);
        setSize(nextSize);
      },
    }),
    [current, size, pageSize],
  );

  return { pagination, reset };
}
