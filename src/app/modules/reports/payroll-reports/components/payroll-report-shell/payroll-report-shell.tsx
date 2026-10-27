import type { ReactNode } from "react";
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
  ExpandableConfig,
  TableRowSelection,
} from "antd/es/table/interface";
import type { MenuProps } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { formatMoney } from "@/shared/utils/money.util";
import {
  buildFlatCsv,
  downloadExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";

const { Title } = Typography;

/** Numeric columns summed into a trailing "Total" row of the export. */
export interface ReportTotals<T> {
  /** Numeric fields of the record to sum. */
  fields: (keyof T)[];
  /** Export header of each field, in the same order as `fields`. */
  exportHeaders: string[];
  /** How the on-screen Grand Total shows a sum; amounts when omitted (e.g. days for leave). */
  format?: (value: number) => string;
}

interface PayrollReportShellProps<T> {
  title: string;
  subtitle: string;
  filters?: ReactNode;
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  onRefresh?: () => void;
  rowKey?: (record: T, index?: number) => string;
  exportFileName: string;
  exportHeaders: string[];
  exportRows: (data: T[]) => (string | number)[][];
  /** Appends a "Total" row summing these fields to the export. */
  totals?: ReportTotals<T>;
  /** Export headers whose Excel cells are whole numbers rather than amounts. */
  exportIntegerHeaders?: string[];
  /** Extra buttons (e.g. "Preview PDF", "Download File") rendered next to Export. */
  extraActions?: ReactNode;
  /** Notice banner shown above the filters — e.g. a compliance caveat for government file exports. */
  notice?: ReactNode;
  /**
   * Set when a required filter (e.g. an employee picker with nothing selected) isn't
   * satisfied yet. Disables Refresh/Export so an incomplete request never reaches the
   * backend, and shows this message in place of the table instead of a blank/errored grid.
   * Pages with their own extraActions buttons that depend on the same filter must disable
   * those themselves — the shell only controls its own built-in actions.
   */
  filterValidationMessage?: string;
  /** Enables checkbox row selection (e.g. a batch action like Uniform Allowance's Release). */
  rowSelection?: TableRowSelection<T>;
  /** Controls nested (`children`) rows, e.g. to expand every group at once. */
  expandable?: ExpandableConfig<T>;
  /** Shown between the filters and the table, e.g. a row of totals. */
  summary?: ReactNode;
  /**
   * Grand Total cells by column `key`, for reports whose rows can't be summed by `totals`
   * (e.g. grouped rows). Adds to, and wins over, the sums taken from `totals`.
   */
  grandTotalCells?: Record<string, ReactNode>;
}

const INTEGER_FORMAT = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 0,
});

/** The columns that hold values, with grouped headers flattened into their children. */
function leafColumns<T>(columns: ColumnsType<T>): ColumnsType<T> {
  return columns.flatMap((column) =>
    "children" in column && column.children
      ? leafColumns(column.children)
      : [column],
  );
}

export function PayrollReportShell<T extends object>({
  title,
  subtitle,
  filters,
  columns,
  data,
  loading,
  onRefresh,
  rowKey,
  exportFileName,
  exportHeaders,
  exportRows,
  totals,
  exportIntegerHeaders,
  extraActions,
  notice,
  filterValidationMessage,
  rowSelection,
  expandable,
  summary,
  grandTotalCells,
}: PayrollReportShellProps<T>) {
  const [messageApi, contextHolder] = message.useMessage();

  const handleExport = (format: "csv" | "excel") => {
    if (filterValidationMessage) {
      messageApi.warning(filterValidationMessage);
      return;
    }
    if (!data.length) {
      messageApi.info("No data to export. Adjust the filters first.");
      return;
    }
    const rows = exportRows(data);
    if (totals) {
      const totalRow: (string | number)[] = exportHeaders.map(() => "");
      totalRow[0] = "Total";
      totals.fields.forEach((field, i) => {
        const col = exportHeaders.indexOf(totals.exportHeaders[i]);
        if (col < 0) return;
        totalRow[col] = data.reduce(
          (sum, r) => sum + (Number(r[field]) || 0),
          0,
        );
      });
      rows.push(totalRow);
    }
    const date = dayjs().format("YYYYMMDD");
    if (format === "csv") {
      triggerDownload(
        buildFlatCsv(exportHeaders, rows),
        `${exportFileName}-${date}.csv`,
      );
    } else {
      void downloadExcel(
        exportHeaders,
        rows,
        `${exportFileName}-${date}.xlsx`,
        undefined,
        exportIntegerHeaders,
      );
    }
  };

  // Grand total of the whole filtered result (every page), shown under the table.
  const renderGrandTotal = () => {
    if ((!totals && !grandTotalCells) || !data.length) return null;
    const cells = new Map<string, ReactNode>();
    totals?.fields.forEach((field, i) => {
      const sum = data.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
      const integer = !!exportIntegerHeaders?.includes(totals.exportHeaders[i]);
      cells.set(
        String(field),
        totals.format
          ? totals.format(sum)
          : integer
            ? INTEGER_FORMAT.format(sum)
            : formatMoney(sum),
      );
    });
    const leaves = leafColumns(columns);
    const cellFor = (column: (typeof leaves)[number]): ReactNode => {
      const byKey =
        column.key != null ? grandTotalCells?.[String(column.key)] : null;
      if (byKey != null) return byKey;
      return "dataIndex" in column ? cells.get(String(column.dataIndex)) : null;
    };
    if (!leaves.some((c) => cellFor(c) != null)) return null;
    const leading =
      (rowSelection ? 1 : 0) + (expandable?.expandedRowRender ? 1 : 0);
    const labelIndex = leaves.findIndex((c) => cellFor(c) == null);

    return (
      <Table.Summary fixed>
        <Table.Summary.Row className="font-semibold">
          {Array.from({ length: leading }, (_, i) => (
            <Table.Summary.Cell key={`lead-${i}`} index={i} />
          ))}
          {leaves.map((column, i) => {
            const total = cellFor(column);
            return (
              <Table.Summary.Cell
                key={column.key ?? i}
                index={leading + i}
                align={total != null ? "right" : undefined}
              >
                {total != null
                  ? total
                  : i === labelIndex
                    ? "Grand Total"
                    : null}
              </Table.Summary.Cell>
            );
          })}
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  const exportMenu: MenuProps["items"] = [
    { key: "csv", label: "Export as CSV", onClick: () => handleExport("csv") },
    {
      key: "excel",
      label: "Export as Excel",
      onClick: () => handleExport("excel"),
    },
  ];

  return (
    <div className="content-page">
      {contextHolder}
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {title}
            </Title>
            <p className="page-toolbar-subtitle">{subtitle}</p>
          </div>
          <Space wrap>
            {onRefresh && (
              <Tooltip title={filterValidationMessage}>
                <Button
                  aria-label="Refresh"
                  icon={<ReloadOutlined spin={loading} />}
                  onClick={onRefresh}
                  disabled={!!filterValidationMessage}
                />
              </Tooltip>
            )}
            <Tooltip title={filterValidationMessage}>
              <Dropdown
                menu={{ items: exportMenu }}
                trigger={["click"]}
                disabled={!data.length || !!filterValidationMessage}
              >
                <Button
                  icon={<DownloadOutlined />}
                  disabled={!data.length || !!filterValidationMessage}
                >
                  Export
                </Button>
              </Dropdown>
            </Tooltip>
            {extraActions}
          </Space>
        </div>
      </div>

      {notice}

      {filters && (
        <Card size="small" className="mb-4">
          {filters}
        </Card>
      )}

      {summary}

      <Card>
        {filterValidationMessage ? (
          <Empty description={filterValidationMessage} />
        ) : (
          <Table
            rowKey={rowKey ?? ((_, i) => String(i ?? 0))}
            dataSource={data}
            columns={columns}
            loading={loading}
            size="small"
            scroll={{ x: "max-content" }}
            pagination={{ pageSize: 50, showSizeChanger: false }}
            rowSelection={rowSelection}
            expandable={expandable}
            summary={totals || grandTotalCells ? renderGrandTotal : undefined}
          />
        )}
      </Card>
    </div>
  );
}
