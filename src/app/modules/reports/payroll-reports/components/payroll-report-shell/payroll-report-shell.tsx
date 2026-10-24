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
import type { TableRowSelection } from "antd/es/table/interface";
import type { MenuProps } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  buildFlatCsv,
  downloadExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";

const { Title } = Typography;

const fmt = (n: number) =>
  n.toLocaleString("en-PH", { minimumFractionDigits: 2 });
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Which amount columns a report totals — on screen (record fields) and in its export (headers). */
export interface ReportTotals<T> {
  fields: (keyof T & string)[];
  exportHeaders: string[];
}

// "TOTAL" in the first column, the numeric sum under each totalled header, blank elsewhere.
function buildTotalRow<T>(
  rows: (string | number)[][],
  headers: string[],
  totals: ReportTotals<T>,
): (string | number)[] {
  return headers.map((header, i) => {
    if (totals.exportHeaders.includes(header)) {
      return round2(
        rows.reduce((s, row) => {
          const value = row[i];
          return s + (typeof value === "number" ? value : 0);
        }, 0),
      );
    }
    return i === 0 ? "TOTAL" : "";
  });
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
  /** Amounts should be raw numbers, not formatted text, so they stay numeric in Excel/CSV. */
  exportRows: (data: T[]) => (string | number)[][];
  /** Adds a Total row under the table and as the last row of the CSV/Excel export. */
  totals?: ReportTotals<T>;
  /** Export headers of count columns (shown without decimals in Excel, never totalled). */
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
    if (totals) rows.push(buildTotalRow(rows, exportHeaders, totals));
    const date = dayjs().format("YYYYMMDD");
    if (format === "csv") {
      triggerDownload(
        buildFlatCsv(exportHeaders, rows),
        `${exportFileName}-${date}.csv`,
      );
    } else {
      downloadExcel(
        exportHeaders,
        rows,
        `${exportFileName}-${date}.xlsx`,
        undefined,
        exportIntegerHeaders,
      );
    }
  };

  const renderSummary = () => {
    if (!totals || !data.length) return undefined;
    const offset = rowSelection ? 1 : 0;
    return (
      <Table.Summary fixed>
        <Table.Summary.Row>
          {rowSelection && <Table.Summary.Cell index={0} />}
          {columns.map((col, i) => {
            const dataIndex = (col as { dataIndex?: unknown }).dataIndex;
            const field = typeof dataIndex === "string" ? dataIndex : "";
            const isTotal = (totals.fields as string[]).includes(field);
            const sum = isTotal
              ? round2(
                  data.reduce(
                    (s, r) =>
                      s +
                      (Number(
                        (r as unknown as Record<string, unknown>)[field],
                      ) || 0),
                    0,
                  ),
                )
              : 0;
            return (
              <Table.Summary.Cell
                key={col.key ?? i}
                index={i + offset}
                align={isTotal ? "right" : undefined}
              >
                {i === 0 ? (
                  <strong>Total</strong>
                ) : isTotal ? (
                  <strong>{fmt(sum)}</strong>
                ) : null}
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
            summary={renderSummary}
          />
        )}
      </Card>
    </div>
  );
}
