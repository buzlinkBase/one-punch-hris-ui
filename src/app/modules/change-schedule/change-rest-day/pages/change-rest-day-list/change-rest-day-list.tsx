import { useMemo, useState } from "react";
import {
  Button,
  DatePicker,
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
  useChangeRestDays,
  useDeleteChangeRestDay,
  useDeleteChangeRestDayBatch,
} from "../../hooks/use-change-rest-day-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { CHANGE_REST_DAY_LABEL } from "../../constants/label.const";
import { getNotify } from "@/shared/utils/notify";
import type { ChangeRestDayFilter } from "../../models/api/request/change-rest-day-filter.model";
import type { ChangeRestDayResponse } from "../../models/api/response/change-rest-day-response.model";

const { Title, Text } = Typography;

interface BatchGroup {
  batchCode: string;
  entries: ChangeRestDayResponse[];
  count: number;
  fromDate: string;
  toDate: string;
}

function currentSemiMonthlyRange(): { fromDate: string; toDate: string } {
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

export default function ChangeRestDayList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("entries");
  const [pending, setPending] = useState<ChangeRestDayFilter>(DEFAULT_FILTER);
  const [committed, setCommitted] =
    useState<ChangeRestDayFilter>(DEFAULT_FILTER);
  const [searchKey, setSearchKey] = useState(0);

  const {
    data: records = [],
    isLoading,
    isFetching,
  } = useChangeRestDays(committed, searchKey);
  const { mutateAsync: removeEmployee, isPending: isDeletingEntry } =
    useDeleteChangeRestDay();
  const { mutateAsync: removeBatch, isPending: isDeletingBatch } =
    useDeleteChangeRestDayBatch();
  const { data: employeeData = [] } = useEmployeeFilter();

  const employees = employeeData.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const { widths: entryWidths, handleResize: entryResize } =
    useResizableColumns({
      fullName: 180,
      batchCode: 140,
      fromDate: 130,
      toDate: 130,
      actions: 80,
    });

  const { widths: batchWidths, handleResize: batchResize } =
    useResizableColumns({
      batchCode: 160,
      count: 80,
      dateRange: 260,
      actions: 140,
    });

  const batchGroups = useMemo<BatchGroup[]>(() => {
    const map = new Map<string, ChangeRestDayResponse[]>();
    for (const r of records) {
      if (!map.has(r.batchCode)) map.set(r.batchCode, []);
      map.get(r.batchCode)!.push(r);
    }
    return Array.from(map.entries())
      .map(([batchCode, entries]) => ({
        batchCode,
        entries,
        count: entries.length,
        fromDate: entries[0].fromDate,
        toDate: entries[0].toDate,
      }))
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

  const handleDeleteEmployee = async (
    employeeId: string,
    batchCode: string,
  ) => {
    await removeEmployee({ employeeId, batchCode });
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

  const entryColumns: TableColumnsType<ChangeRestDayResponse> = [
    {
      title: CHANGE_REST_DAY_LABEL.EMPLOYEE,
      dataIndex: "fullName",
      key: "fullName",
      width: entryWidths.fullName,
      onHeaderCell: () =>
        ({
          width: entryWidths.fullName,
          onResize: (w: number) => entryResize("fullName", w),
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
      title: CHANGE_REST_DAY_LABEL.FROM_DATE,
      dataIndex: "fromDate",
      key: "fromDate",
      width: entryWidths.fromDate,
      onHeaderCell: () =>
        ({
          width: entryWidths.fromDate,
          onResize: (w: number) => entryResize("fromDate", w),
        }) as object,
    },
    {
      title: () => (
        <Space size={4}>
          <ArrowRightOutlined style={{ color: "#1DA081" }} />
          {CHANGE_REST_DAY_LABEL.NEW_DATE}
        </Space>
      ),
      dataIndex: "toDate",
      key: "toDate",
      width: entryWidths.toDate,
      onHeaderCell: () =>
        ({
          width: entryWidths.toDate,
          onResize: (w: number) => entryResize("toDate", w),
        }) as object,
      render: (v: string) => (
        <span style={{ color: "#1DA081", fontWeight: 500 }}>{v}</span>
      ),
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
      render: (_: unknown, record: ChangeRestDayResponse) => (
        <Popconfirm
          title="Remove this employee entry?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          onConfirm={() =>
            handleDeleteEmployee(record.employeeId, record.batchCode)
          }
        >
          <Button type="link" danger size="small" loading={isDeletingEntry}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const batchEntryColumns: TableColumnsType<ChangeRestDayResponse> = [
    {
      title: CHANGE_REST_DAY_LABEL.EMPLOYEE,
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: CHANGE_REST_DAY_LABEL.FROM_DATE,
      dataIndex: "fromDate",
      key: "fromDate",
    },
    {
      title: () => (
        <Space size={4}>
          <ArrowRightOutlined style={{ color: "#1DA081" }} />
          {CHANGE_REST_DAY_LABEL.NEW_DATE}
        </Space>
      ),
      dataIndex: "toDate",
      key: "toDate",
      render: (v: string) => (
        <span style={{ color: "#1DA081", fontWeight: 500 }}>{v}</span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_: unknown, record: ChangeRestDayResponse) => (
        <Popconfirm
          title="Remove this employee from the batch?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          onConfirm={() =>
            handleDeleteEmployee(record.employeeId, record.batchCode)
          }
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
          description={`This will remove all ${row.count} employee record${row.count !== 1 ? "s" : ""} in this batch.`}
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
              {CHANGE_REST_DAY_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage employee rest day schedule changes.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate({ to: "/change-schedule/change-rest-day/create" })
            }
          >
            Add Entry
          </Button>
        </div>
      </div>

      <Form layout="vertical" className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 items-end">
          <Form.Item label="Entry Date" className="mb-0 sm:col-span-2">
            <DatePicker.RangePicker
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
            label={CHANGE_REST_DAY_LABEL.FILTER_EMPLOYEE}
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
              onChange={(v) => setPending((c) => ({ ...c, employeeId: v }))}
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
            label: "Entries",
            children: (
              <Table<ChangeRestDayResponse>
                rowKey={(r) => `${r.batchCode}-${r.employeeId}`}
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
                  emptyText: "No records found for the selected filters.",
                }}
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
                      <Table<ChangeRestDayResponse>
                        rowKey={(r) => r.employeeId}
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
                  emptyText: "No batches found for the selected filters.",
                }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
