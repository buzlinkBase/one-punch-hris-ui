import { useMemo, useState } from "react";
import {
  Button,
  Form,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ArrowRightOutlined,
  ClearOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import {
  useWorkRotations,
  useDeleteWorkRotation,
  useDeleteWorkRotationBatch,
} from "../../hooks/use-work-rotation-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { WORK_ROTATION_LABEL } from "../../constants/label.const";
import RosterList from "@/app/modules/reports/rostering/pages/roster-list";
import { getNotify } from "@/shared/utils/notify";
import type { WorkRotationFilter } from "../../models/api/request/work-rotation-filter.model";
import type { WorkRotationResponse } from "../../models/api/response/work-rotation-response.model";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const { Title, Text } = Typography;

interface BatchGroup {
  batchCode: string;
  entries: WorkRotationResponse[];
  count: number;
  timeShiftName: string;
  fromDate: string;
  toDate: string;
}

function currentSemiMonthlyRange(): {
  fromDate: string;
  toDate: string;
} {
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

const DEFAULT_FILTER = currentSemiMonthlyRange();

export default function WorkRotationList() {
  const navigate = useNavigate();
  const [outerTab, setOuterTab] = useState("work-rotation");
  const [activeTab, setActiveTab] = useState("entries");
  const [pending, setPending] = useState<WorkRotationFilter>(DEFAULT_FILTER);
  const [committed, setCommitted] =
    useState<WorkRotationFilter>(DEFAULT_FILTER);
  const [searchKey, setSearchKey] = useState(0);

  const {
    data: records = [],
    isLoading,
    isFetching,
  } = useWorkRotations(committed, searchKey);
  const { mutateAsync: removeEntry, isPending: isDeletingEntry } =
    useDeleteWorkRotation();
  const { mutateAsync: removeBatch, isPending: isDeletingBatch } =
    useDeleteWorkRotationBatch();
  const { data: employeeData = [] } = useEmployeeFilter();

  const employees = employeeData.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const { widths: entryWidths, handleResize: entryResize } =
    useResizableColumns({
      employeeName: 180,
      batchCode: 160,
      timeShiftName: 200,
      payrollDate: 130,
      actions: 80,
    });

  const { widths: batchWidths, handleResize: batchResize } =
    useResizableColumns({
      batchCode: 160,
      count: 80,
      timeShiftName: 220,
      dateRange: 240,
      actions: 140,
    });

  const batchGroups = useMemo<BatchGroup[]>(() => {
    const map = new Map<string, WorkRotationResponse[]>();
    for (const r of records) {
      if (!r.batchCode) continue;
      if (!map.has(r.batchCode)) map.set(r.batchCode, []);
      map.get(r.batchCode)!.push(r);
    }
    return Array.from(map.entries())
      .map(([batchCode, entries]) => {
        const dates = entries.map((e) => e.payrollDate).sort();
        return {
          batchCode,
          entries,
          count: entries.length,
          timeShiftName: entries[0].shiftName ?? "",
          fromDate: dates[0],
          toDate: dates[dates.length - 1],
        };
      })
      .sort((a, b) => b.batchCode.localeCompare(a.batchCode));
  }, [records]);

  const handleSearch = () => {
    setCommitted({ ...pending });
    setSearchKey((k) => k + 1);
  };

  const handleClear = () => {
    setPending(DEFAULT_FILTER);
    setCommitted(DEFAULT_FILTER);
    setSearchKey((k) => k + 1);
  };

  const handleDeleteEntry = async (id: string) => {
    await removeEntry(id);
    getNotify().success({ message: "Record deleted." });
  };

  const handleDeleteBatch = async (batchCode: string, count: number) => {
    await removeBatch(batchCode);
    getNotify().success({
      message: "Batch Deleted",
      description: `${count} record${count !== 1 ? "s" : ""} removed.`,
    });
  };

  const isTableLoading =
    isLoading || isFetching || isDeletingEntry || isDeletingBatch;

  const entryColumns: TableColumnsType<WorkRotationResponse> = [
    {
      title: WORK_ROTATION_LABEL.EMPLOYEE,
      dataIndex: "fullName",
      key: "fullName",
      width: entryWidths.employeeName,
      onHeaderCell: () =>
        ({
          width: entryWidths.employeeName,
          onResize: (w: number) => entryResize("employeeName", w),
        }) as object,
    },
    {
      title: "Batch",
      dataIndex: "batchCode",
      key: "batchCode",
      width: entryWidths.batchCode,
      onHeaderCell: () =>
        ({
          width: entryWidths.batchCode,
          onResize: (w: number) => entryResize("batchCode", w),
        }) as object,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: WORK_ROTATION_LABEL.TIME_SHIFT,
      dataIndex: "shiftName",
      key: "shiftName",
      width: entryWidths.timeShiftName,
      onHeaderCell: () =>
        ({
          width: entryWidths.timeShiftName,
          onResize: (w: number) => entryResize("timeShiftName", w),
        }) as object,
    },
    {
      title: WORK_ROTATION_LABEL.PAYROLL_DATE,
      dataIndex: "payrollDate",
      key: "payrollDate",
      width: entryWidths.payrollDate,
      onHeaderCell: () =>
        ({
          width: entryWidths.payrollDate,
          onResize: (w: number) => entryResize("payrollDate", w),
        }) as object,
    },
    {
      title: "",
      key: "actions",
      width: entryWidths.actions,
      onHeaderCell: () =>
        ({
          width: entryWidths.actions,
          onResize: (w: number) => entryResize("actions", w),
        }) as object,
      render: (_: unknown, record: WorkRotationResponse) => (
        <Popconfirm
          title="Delete this entry?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          onConfirm={() => handleDeleteEntry(record.id)}
        >
          <Button type="link" danger size="small" loading={isDeletingEntry}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const batchEntryColumns: TableColumnsType<WorkRotationResponse> = [
    {
      title: WORK_ROTATION_LABEL.EMPLOYEE,
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: WORK_ROTATION_LABEL.PAYROLL_DATE,
      dataIndex: "payrollDate",
      key: "payrollDate",
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_: unknown, record: WorkRotationResponse) => (
        <Popconfirm
          title="Delete this entry?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          onConfirm={() => handleDeleteEntry(record.id)}
        >
          <Button type="link" danger size="small" loading={isDeletingEntry}>
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
      title: "Employees",
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
      title: WORK_ROTATION_LABEL.TIME_SHIFT,
      dataIndex: "timeShiftName",
      key: "timeShiftName",
      width: batchWidths.timeShiftName,
      onHeaderCell: () =>
        ({
          width: batchWidths.timeShiftName,
          onResize: (w: number) => batchResize("timeShiftName", w),
        }) as object,
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
          {row.fromDate}
          <ArrowRightOutlined
            style={{ color: "#1DA081", marginInline: 6, fontSize: 11 }}
          />
          <span style={{ color: "#1DA081", fontWeight: 500 }}>
            {row.toDate}
          </span>
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
          title={`Delete batch ${row.batchCode}?`}
          description={`This will remove all ${row.count} record${row.count !== 1 ? "s" : ""} in this batch.`}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          onConfirm={() => handleDeleteBatch(row.batchCode, row.count)}
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
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {WORK_ROTATION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage employee work rotation plans and time shift assignments.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate({ to: "/change-schedule/work-rotation/create" })
            }
          >
            Add Work Rotation Plan
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={outerTab}
        onChange={setOuterTab}
        items={[
          {
            key: "work-rotation",
            label: WORK_ROTATION_LABEL.TAB_WORK_ROTATION,
            children: (
              <>
                <Form layout="vertical" className="mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 items-end">
                    <Form.Item
                      label="Entry Date"
                      className="mb-0 sm:col-span-2"
                    >
                      <MobileRangePicker
                        style={{ width: "100%" }}
                        value={
                          pending.fromDate && pending.toDate
                            ? [dayjs(pending.fromDate), dayjs(pending.toDate)]
                            : null
                        }
                        onChange={(dates) =>
                          setPending((c) => ({
                            ...c,
                            fromDate: dates?.[0]?.format("YYYY-MM-DD"),
                            toDate: dates?.[1]?.format("YYYY-MM-DD"),
                          }))
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      label={WORK_ROTATION_LABEL.FILTER_EMPLOYEE}
                      className="mb-0"
                    >
                      <Select
                        allowClear
                        showSearch
                        filterOption={(input, opt) =>
                          String(opt?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        placeholder="All Employees"
                        options={employees}
                        value={pending.employeeId}
                        onChange={(v) =>
                          setPending((c) => ({ ...c, employeeId: v }))
                        }
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                    <Form.Item label=" " className="mb-0">
                      <Space>
                        <Button
                          type="primary"
                          icon={<SearchOutlined />}
                          loading={isLoading}
                          onClick={handleSearch}
                        >
                          Search
                        </Button>
                        <Button icon={<ClearOutlined />} onClick={handleClear}>
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
                      label: WORK_ROTATION_LABEL.TAB_ENTRIES,
                      children: (
                        <Table<WorkRotationResponse>
                          rowKey="id"
                          dataSource={records}
                          columns={entryColumns}
                          loading={isTableLoading}
                          size="small"
                          pagination={{
                            pageSize: 15,
                            size: "small",
                            showSizeChanger: false,
                          }}
                          scroll={{ x: "max-content" }}
                          sticky
                          components={{ header: { cell: ResizableTitle } }}
                          locale={{
                            emptyText:
                              "No records found for the selected filters.",
                          }}
                        />
                      ),
                    },
                    {
                      key: "batches",
                      label: (
                        <Space size={4}>
                          {WORK_ROTATION_LABEL.TAB_BATCHES}
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
                          loading={isTableLoading}
                          size="small"
                          pagination={{
                            pageSize: 10,
                            size: "small",
                            showSizeChanger: false,
                          }}
                          scroll={{ x: "max-content" }}
                          sticky
                          components={{ header: { cell: ResizableTitle } }}
                          expandable={{
                            expandedRowRender: (batch) => (
                              <div className="pl-8 py-2">
                                <Table<WorkRotationResponse>
                                  rowKey="id"
                                  dataSource={batch.entries}
                                  columns={batchEntryColumns}
                                  pagination={false}
                                  size="small"
                                  scroll={{ x: "max-content" }}
                                />
                              </div>
                            ),
                            rowExpandable: (batch) => batch.entries.length > 0,
                          }}
                          locale={{
                            emptyText:
                              "No batches found for the selected filters.",
                          }}
                        />
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
          {
            key: "roster",
            label: WORK_ROTATION_LABEL.TAB_ROSTER,
            // Reuses the standalone Roster Report page (reports/rostering) in embedded mode
            // — it already resolves the effective schedule (Work Rotation overrides, Fixed
            // Schedule, permanent shift), which is exactly what a Work Rotation Plan editor
            // needs to verify. embedded drops the page-level title/toolbar chrome, which
            // would otherwise bleed past the Tabs pane via its negative-margin styling.
            // A sibling of Work Rotation rather than nested under its Entries/Batches tabs,
            // since it's a different concept (effective schedule, not rotation overrides).
            children: <RosterList embedded />,
          },
        ]}
      />
    </div>
  );
}
