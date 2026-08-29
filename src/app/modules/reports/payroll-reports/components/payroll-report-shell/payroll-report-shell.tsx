import type { ReactNode } from "react";
import {
  Button,
  Card,
  Dropdown,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  buildFlatCsv,
  buildFlatExcel,
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
}: PayrollReportShellProps<T>) {
  const [messageApi, contextHolder] = message.useMessage();

  const handleExport = (format: "csv" | "excel") => {
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
        "text/plain",
      );
    } else {
      triggerDownload(
        buildFlatExcel(exportHeaders, rows),
        `${exportFileName}-${date}.xls`,
        "application/vnd.ms-excel;charset=utf-8;",
      );
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
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={onRefresh}
              />
            )}
            <Dropdown
              menu={{ items: exportMenu }}
              trigger={["click"]}
              disabled={!data.length}
            >
              <Button icon={<DownloadOutlined />} disabled={!data.length}>
                Export
              </Button>
            </Dropdown>
          </Space>
        </div>
      </div>

      {filters && (
        <Card size="small" className="mb-4">
          {filters}
        </Card>
      )}

      <Card>
        <Table
          rowKey={rowKey ?? ((_, i) => String(i ?? 0))}
          dataSource={data}
          columns={columns}
          loading={loading}
          size="small"
          scroll={{ x: "max-content" }}
          pagination={{ pageSize: 50, showSizeChanger: false }}
        />
      </Card>
    </div>
  );
}
