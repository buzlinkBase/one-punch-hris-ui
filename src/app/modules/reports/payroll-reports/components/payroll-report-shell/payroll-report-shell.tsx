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
import type { MenuProps } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  buildFlatCsv,
  downloadExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";

const { Title } = Typography;

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
  exportRows: (data: T[]) => string[][];
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
  extraActions,
  notice,
  filterValidationMessage,
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
    const date = dayjs().format("YYYYMMDD");
    if (format === "csv") {
      triggerDownload(
        buildFlatCsv(exportHeaders, rows),
        `${exportFileName}-${date}.csv`,
      );
    } else {
      downloadExcel(exportHeaders, rows, `${exportFileName}-${date}.xlsx`);
    }
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
          />
        )}
      </Card>
    </div>
  );
}
