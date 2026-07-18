import { useMemo, useState } from "react";
import {
  Button,
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
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import {
  ClearOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import AttendanceEntryTable from "../../components/attendance-entry-table";
import { ATTENDANCE_ENTRY_LABEL } from "../../constants/label.const";
import {
  useEmployeeFilter,
  useAttendanceEntryRecords,
  useDeleteAttendanceEntryLog,
  useDeleteAttendanceBatch,
} from "../../hooks/use-attendance-entry-queries";
import type { AttendanceEntryFilter } from "../../models/api/request/attendance-entry-filter.model";
import type { AttendanceEntryResponse } from "../../models/api/response/attendance-entry-response.model";

const { Title, Text } = Typography;

function getSemiMonthlyCutoff(): { fromDate: string; toDate: string } {
  const today = dayjs();
  const day = today.date();
  if (day <= 15) {
    return {
      fromDate: today.startOf("month").format("YYYY-MM-DD"),
      toDate: today.date(15).format("YYYY-MM-DD"),
    };
  }
  return {
    fromDate: today.date(16).format("YYYY-MM-DD"),
    toDate: today.endOf("month").format("YYYY-MM-DD"),
  };
}

const DEFAULT_CUTOFF = getSemiMonthlyCutoff();

interface BatchGroup {
  batchCode: string;
  entries: AttendanceEntryResponse[];
  count: number;
  fromDate: string;
  toDate: string;
}

const EMPTY_FILTER: AttendanceEntryFilter = {};

export default function AttendanceEntryList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("entries");
  const [pending, setPending] = useState<AttendanceEntryFilter>(DEFAULT_CUTOFF);
  const [committedFilter, setCommittedFilter] =
    useState<AttendanceEntryFilter | null>(DEFAULT_CUTOFF);
  const [searchKey, setSearchKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const hasSearched = committedFilter !== null;

  const {
    data: records = [],
    isLoading,
    isFetching,
  } = useAttendanceEntryRecords(committedFilter ?? EMPTY_FILTER, {
    enabled: hasSearched,
    searchKey,
  });
  const { data: employeeData = [] } = useEmployeeFilter();
  const employees = employeeData.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));
  const { mutateAsync: removeLog, isPending: isDeleting } =
    useDeleteAttendanceEntryLog();
  const { mutateAsync: deleteBatch, isPending: isDeletingBatch } =
    useDeleteAttendanceBatch();

  const { widths: entryWidths, handleResize: entryResize } =
    useResizableColumns({
      employeeName: 150,
      timeLog: 200,
      action: 80,
    });

  const { widths: batchWidths, handleResize: batchResize } =
    useResizableColumns({
      batchCode: 150,
      count: 80,
      dateRange: 300,
      actions: 148,
    });

  const isDateRangeInvalid =
    !!pending.fromDate && !!pending.toDate && pending.fromDate > pending.toDate;

  const batchGroups = useMemo<BatchGroup[]>(() => {
    const map = new Map<string, AttendanceEntryResponse[]>();
    for (const r of records) {
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
  }, [records]);

  const handleSearch = () => {
    if (isDateRangeInvalid) {
      messageApi.warning("Date To must be greater than or equal to Date From.");
      return;
    }
    setCommittedFilter({ ...pending });
    setSearchKey((k) => k + 1);
  };

  const handleClear = () => {
    setPending(DEFAULT_CUTOFF);
    setCommittedFilter(DEFAULT_CUTOFF);
    setSearchKey((k) => k + 1);
  };

  const handleDeleteEntry = async (id: string) => {
    await removeLog(id);
    messageApi.success("Time log deleted.");
  };

  const handleDeleteBatch = async (batchCode: string) => {
    await deleteBatch(batchCode);
    messageApi.success(`Batch ${batchCode} deleted.`);
  };

  const buildCsv = () => {
    const header = ["Employee ID", "Employee", "Time Log", "Batch Code"];
    const rows = records.map((r) => [
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
    const rows = records
      .map(
        (r) =>
          `<tr><td>${escapeHtml(r.employeeId)}</td><td>${escapeHtml(r.employeeName)}</td><td>${escapeHtml(r.timeLog)}</td><td>${escapeHtml(r.batchCode ?? "")}</td></tr>`,
      )
      .join("");
    return `<html><head><meta charset="utf-8" /></head><body><table><thead><tr><th>Employee ID</th><th>Employee</th><th>Time Log</th><th>Batch Code</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  };

  const handleExport = (format: "csv" | "excel") => {
    if (!records.length) {
      messageApi.info("No records available for export.");
      return;
    }
    setIsExporting(true);
    if (format === "csv") {
      const a = document.createElement("a");
      a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(buildCsv())}`;
      a.download = `attendance-${dayjs().format("YYYYMMDD")}.csv`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([buildExcelTable()], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${dayjs().format("YYYYMMDD")}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    setIsExporting(false);
  };

  const exportMenuItems: MenuProps["items"] = [
    { key: "csv", label: "Export as CSV", onClick: () => handleExport("csv") },
    {
      key: "excel",
      label: "Export as Excel",
      onClick: () => handleExport("excel"),
    },
  ];

  const batchEntryColumns: TableColumnsType<AttendanceEntryResponse> = [
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      width: entryWidths.employeeName,
      onHeaderCell: () =>
        ({
          width: entryWidths.employeeName,
          onResize: (w: number) => entryResize("employeeName", w),
        }) as object,
    },
    {
      title: "Work Time",
      dataIndex: "timeLog",
      key: "timeLog",
      width: entryWidths.timeLog,
      onHeaderCell: () =>
        ({
          width: entryWidths.timeLog,
          onResize: (w: number) => entryResize("timeLog", w),
        }) as object,
      render: (v: string) => dayjs(v).format("MMM DD, YYYY hh:mm A"),
    },
    {
      title: "",
      key: "action",
      width: entryWidths.action,
      onHeaderCell: () =>
        ({
          width: entryWidths.action,
          onResize: (w: number) => entryResize("action", w),
        }) as object,
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

  const batchColumns: TableColumnsType<BatchGroup> = [
    {
      title: "Batch Code",
      dataIndex: "batchCode",
      key: "batchCode",
      width: batchWidths.batchCode,
      onHeaderCell: () =>
        ({
          width: batchWidths.batchCode,
          onResize: (w: number) => batchResize("batchCode", w),
        }) as object,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Entries",
      dataIndex: "count",
      key: "count",
      width: batchWidths.count,
      onHeaderCell: () =>
        ({
          width: batchWidths.count,
          onResize: (w: number) => batchResize("count", w),
        }) as object,
      render: (count: number) => <Tag color="default">{count}</Tag>,
    },
    {
      title: "Date Range",
      key: "dateRange",
      width: batchWidths.dateRange,
      onHeaderCell: () =>
        ({
          width: batchWidths.dateRange,
          onResize: (w: number) => batchResize("dateRange", w),
        }) as object,
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
      width: batchWidths.actions,
      onHeaderCell: () =>
        ({
          width: batchWidths.actions,
          onResize: (w: number) => batchResize("actions", w),
        }) as object,
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

  const notSearchedYet = (
    <Text type="secondary">
      Apply filters above and click Search to load records.
    </Text>
  );

  const isTableLoading = (isLoading || isFetching || isDeleting) && hasSearched;

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
              Filter by date range and employee, then manage or export
              attendance logs.
            </p>
          </div>
          <div className="flex gap-2">
            <Dropdown
              menu={{ items: exportMenuItems }}
              trigger={["click"]}
              disabled={!records.length}
            >
              <Button
                icon={<DownloadOutlined />}
                loading={isExporting}
                disabled={!records.length || isExporting}
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

      {/* Filter bar — always visible, search required before data loads */}
      <Form layout="vertical" className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 items-end">
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
              status={isDateRangeInvalid ? "error" : undefined}
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
          <Form.Item label=" " className="mb-0">
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                disabled={isDateRangeInvalid}
              >
                Search
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClear}
                disabled={
                  !hasSearched && !pending.fromDate && !pending.employeeId
                }
              >
                Clear
              </Button>
            </Space>
          </Form.Item>
        </div>
      </Form>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "entries",
            label: "Entries",
            children: (
              <AttendanceEntryTable
                data={records}
                loading={isTableLoading}
                onDelete={handleDeleteEntry}
                emptyText={hasSearched ? undefined : notSearchedYet}
              />
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
            children: hasSearched ? (
              <Table<BatchGroup>
                rowKey="batchCode"
                dataSource={batchGroups}
                columns={batchColumns}
                loading={isTableLoading}
                size="small"
                pagination={{ pageSize: 10, size: "small" }}
                scroll={{ x: "max-content" }}
                expandable={{
                  expandedRowRender: (batch) => (
                    <div className="pl-8 py-2">
                      <Table<AttendanceEntryResponse>
                        rowKey="id"
                        dataSource={batch.entries}
                        columns={batchEntryColumns}
                        pagination={false}
                        size="small"
                        scroll={{ x: "max-content" }}
                        components={{ header: { cell: ResizableTitle } }}
                      />
                    </div>
                  ),
                  rowExpandable: (batch) => batch.entries.length > 0,
                }}
                locale={{
                  emptyText: "No batch entries found for this filter.",
                }}
                components={{ header: { cell: ResizableTitle } }}
              />
            ) : (
              <div className="py-8 text-center">
                <Text type="secondary">
                  Apply filters above and click Search to load batches.
                </Text>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
