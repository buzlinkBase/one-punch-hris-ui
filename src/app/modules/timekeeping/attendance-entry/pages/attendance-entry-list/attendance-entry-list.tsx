import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  DatePicker,
  Dropdown,
  Form,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import type { MenuProps, TableColumnsType } from "antd";
import {
  ClearOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import AttendanceEntryTable from "../../components/attendance-entry-table";
import { ATTENDANCE_ENTRY_LABEL } from "../../constants/label.const";
import {
  useAttendanceEntryEmployees,
  useAttendanceEntryRecords,
  useDeleteAttendanceEntryLog,
  useDeleteAttendanceBatch,
} from "../../hooks/use-attendance-entry-queries";
import type { AttendanceEntryFilter } from "../../models/api/request/attendance-entry-filter.model";
import type { AttendanceEntryResponse } from "../../models/api/response/attendance-entry-response.model";

const { Title, Text } = Typography;

interface BatchGroup {
  batchCode: string;
  entries: AttendanceEntryResponse[];
  count: number;
  fromDate: string;
  toDate: string;
}

export default function AttendanceEntryList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("entries");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState<AttendanceEntryFilter>({});
  const [pending, setPending] = useState<AttendanceEntryFilter>({});
  const [isExporting, setIsExporting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const activeFilterCount = [filter.fromDate, filter.employeeId].filter(Boolean).length;

  const { data: records = [], isLoading } = useAttendanceEntryRecords(filter);
  const {
    data: allRecords = [],
    isLoading: isAllRecordsLoading,
    isFetching: isAllRecordsFetching,
  } = useAttendanceEntryRecords();
  const { data: employees = [] } = useAttendanceEntryEmployees();
  const { mutateAsync: removeLog, isPending: isDeleting } = useDeleteAttendanceEntryLog();
  const { mutateAsync: deleteBatch, isPending: isDeletingBatch } = useDeleteAttendanceBatch();

  const isDateRangeInvalid = useMemo(() => {
    if (!pending.fromDate || !pending.toDate) return false;
    return pending.fromDate > pending.toDate;
  }, [pending.fromDate, pending.toDate]);

  const batchGroups = useMemo<BatchGroup[]>(() => {
    const map = new Map<string, AttendanceEntryResponse[]>();
    for (const r of allRecords) {
      if (r.batchCode) {
        if (!map.has(r.batchCode)) map.set(r.batchCode, []);
        map.get(r.batchCode)!.push(r);
      }
    }
    return Array.from(map.entries())
      .map(([batchCode, entries]) => {
        const sorted = [...entries].sort((a, b) =>
          a.timeLog.localeCompare(b.timeLog),
        );
        return {
          batchCode,
          entries: sorted,
          count: entries.length,
          fromDate: sorted[0].timeLog,
          toDate: sorted[sorted.length - 1].timeLog,
        };
      })
      .sort((a, b) => b.batchCode.localeCompare(a.batchCode));
  }, [allRecords]);

  const handleSearch = () => {
    if (isDateRangeInvalid) {
      messageApi.warning("Date To must be greater than or equal to Date From.");
      return;
    }
    setFilter(pending);
  };

  const handleClear = () => {
    setPending({});
    setFilter({});
    setFiltersOpen(false);
  };

  const handleDeleteEntry = async (id: string) => {
    await removeLog(id);
    messageApi.success("Time log deleted.");
  };

  const handleDeleteBatch = async (batchCode: string) => {
    await deleteBatch(batchCode);
    messageApi.success(`Batch ${batchCode} deleted.`);
  };

  const downloadFile = (content: string, mimeType: string, extension: "csv" | "xls") => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-entry-log-${dayjs().format("YYYYMMDD-HHmmss")}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const buildCsv = () => {
    const header = ["Employee ID", "Employee", "Time Log", "Batch Code"];
    const rows = allRecords.map((r) => [
      r.employeeId,
      r.employeeName,
      r.timeLog,
      r.batchCode ?? "",
    ]);
    return [header, ...rows]
      .map((line) =>
        line.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
  };

  const escapeHtml = (v: string) =>
    v
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const buildExcelTable = () => {
    const rows = allRecords
      .map(
        (r) =>
          `<tr><td>${escapeHtml(r.employeeId)}</td><td>${escapeHtml(r.employeeName)}</td><td>${escapeHtml(r.timeLog)}</td><td>${escapeHtml(r.batchCode ?? "")}</td></tr>`,
      )
      .join("");
    return `<html><head><meta charset="utf-8" /></head><body><table><thead><tr><th>Employee ID</th><th>Employee</th><th>Time Log</th><th>Batch Code</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  };

  const handleExport = (format: "csv" | "excel") => {
    if (!allRecords.length) {
      messageApi.info("No records available for export.");
      return;
    }
    setIsExporting(true);
    if (format === "csv") {
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        `data:text/plain;charset=utf-8,${encodeURIComponent(buildCsv())}`,
      );
      element.setAttribute(
        "download",
        `attendance-${new Date().toISOString().split("T")[0]}.csv`,
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      downloadFile(buildExcelTable(), "application/vnd.ms-excel;charset=utf-8;", "xls");
    }
    setIsExporting(false);
  };

  const isExportDisabled =
    isExporting || isAllRecordsLoading || isAllRecordsFetching || !allRecords.length;

  const exportMenuItems: MenuProps["items"] = [
    { key: "csv", label: "Export as CSV", onClick: () => handleExport("csv") },
    { key: "excel", label: "Export as Excel", onClick: () => handleExport("excel") },
  ];

  // Batch tab — nested entry columns
  const batchEntryColumns: TableColumnsType<AttendanceEntryResponse> = [
    {
      title: "Employee",
      dataIndex: "employeeName",
    },
    {
      title: "Work Time",
      dataIndex: "timeLog",
      width: 200,
      render: (v: string) => dayjs(v).format("MMM DD, YYYY hh:mm A"),
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_: unknown, record: AttendanceEntryResponse) => (
        <Popconfirm
          title="Delete this time log?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => handleDeleteEntry(record.id)}
        >
          <Button type="link" danger size="small">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Batch tab — top-level batch columns
  const batchColumns: TableColumnsType<BatchGroup> = [
    {
      title: "Batch Code",
      dataIndex: "batchCode",
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Entries",
      dataIndex: "count",
      width: 80,
      render: (count: number) => (
        <Tag color="default">{count}</Tag>
      ),
    },
    {
      title: "Date Range",
      width: 280,
      render: (_: unknown, row: BatchGroup) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {dayjs(row.fromDate).format("MMM DD, YYYY hh:mm A")}
          {" — "}
          {dayjs(row.toDate).format("MMM DD, YYYY hh:mm A")}
        </Text>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 140,
      render: (_: unknown, row: BatchGroup) => (
        <Popconfirm
          title={`Delete all ${row.count} entries in this batch?`}
          description="This will remove all time logs created under this batch."
          okText="Delete Batch"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          onConfirm={() => handleDeleteBatch(row.batchCode)}
        >
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            loading={isDeletingBatch}
          >
            Delete Batch
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="content-page">
      {contextHolder}

      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {ATTENDANCE_ENTRY_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              View and maintain attendance logs per employee, then export the
              complete time log file when needed.
            </p>
          </div>
          <div className="flex gap-2">
            <Dropdown menu={{ items: exportMenuItems }} trigger={["click"]}>
              <Button
                icon={<DownloadOutlined />}
                loading={isExporting}
                disabled={isExportDisabled}
              >
                Export Log
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                navigate({ to: "/timekeeping/attendance-entry/create" })
              }
            >
              New Entry
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "entries",
            label: "Entries",
            children: (
              <>
                <div className="flex justify-end mb-3">
                  <Badge count={activeFilterCount} size="small">
                    <Button
                      icon={<FilterOutlined />}
                      onClick={() => setFiltersOpen((v) => !v)}
                      type={filtersOpen ? "default" : "text"}
                    >
                      Filters
                    </Button>
                  </Badge>
                </div>

                {filtersOpen && (
                  <Card size="small" className="mb-4">
                    <Form layout="vertical">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
                        <Form.Item
                          label={ATTENDANCE_ENTRY_LABEL.FILTER_DATE_FROM}
                          className="mb-0"
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            value={pending.fromDate ? dayjs(pending.fromDate) : null}
                            onChange={(date) =>
                              setPending((c) => ({
                                ...c,
                                fromDate: date?.format("YYYY-MM-DD"),
                              }))
                            }
                          />
                        </Form.Item>
                        <Form.Item
                          label={ATTENDANCE_ENTRY_LABEL.FILTER_DATE_TO}
                          className="mb-0"
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            value={pending.toDate ? dayjs(pending.toDate) : null}
                            onChange={(date) =>
                              setPending((c) => ({
                                ...c,
                                toDate: date?.format("YYYY-MM-DD"),
                              }))
                            }
                          />
                        </Form.Item>
                        <Form.Item
                          label={ATTENDANCE_ENTRY_LABEL.FILTER_EMPLOYEE}
                          className="mb-0"
                        >
                          <Select
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            placeholder="All Employees"
                            options={employees}
                            value={pending.employeeId}
                            onChange={(value) =>
                              setPending((c) => ({ ...c, employeeId: value }))
                            }
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button icon={<ClearOutlined />} onClick={handleClear}>
                          Clear
                        </Button>
                        <Button
                          icon={<FilterOutlined />}
                          type="primary"
                          onClick={handleSearch}
                        >
                          Search
                        </Button>
                      </div>
                    </Form>
                  </Card>
                )}

                <AttendanceEntryTable
                  data={records}
                  loading={isLoading || isDeleting}
                  onDelete={handleDeleteEntry}
                />
              </>
            ),
          },
          {
            key: "batches",
            label: (
              <Space size={4}>
                Batches
                {batchGroups.length > 0 && (
                  <Tag color="blue" style={{ marginInlineStart: 0 }}>
                    {batchGroups.length}
                  </Tag>
                )}
              </Space>
            ),
            children: (
              <Table<BatchGroup>
                rowKey="batchCode"
                dataSource={batchGroups}
                columns={batchColumns}
                loading={isAllRecordsLoading}
                size="small"
                pagination={{ pageSize: 10, size: "small" }}
                expandable={{
                  expandedRowRender: (batch) => (
                    <div className="pl-8 py-2">
                      <Table<AttendanceEntryResponse>
                        rowKey="id"
                        dataSource={batch.entries}
                        columns={batchEntryColumns}
                        pagination={false}
                        size="small"
                        showHeader={true}
                      />
                    </div>
                  ),
                  rowExpandable: (batch) => batch.entries.length > 0,
                }}
                locale={{ emptyText: "No batch entries found." }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
